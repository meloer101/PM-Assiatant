import datetime
import json
import logging
import re
from collections.abc import AsyncGenerator

from google.adk.agents import BaseAgent, LlmAgent, LoopAgent, SequentialAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from google.adk.tools import FunctionTool
from google.adk.tools.agent_tool import AgentTool
from google.genai import types as genai_types

from .config import config, model
from .tools.rag_tool import search_knowledge_base
from .tools.tavily_search import tavily_search


# ---------------------------------------------------------------------------
# Callbacks
# ---------------------------------------------------------------------------

def collect_tavily_sources_callback(callback_context: CallbackContext) -> None:
    """Collect web sources from Tavily search function responses.

    Scans session events for tavily_search function responses and builds a
    sources dict compatible with the citation system.
    """
    session = callback_context._invocation_context.session
    url_to_short_id = callback_context.state.get("url_to_short_id", {})
    sources = callback_context.state.get("sources", {})
    id_counter = len(url_to_short_id) + 1

    for event in session.events:
        if not (event.content and event.content.parts):
            continue
        for part in event.content.parts:
            if not (hasattr(part, "function_response") and part.function_response):
                continue
            fn_resp = part.function_response
            if not (hasattr(fn_resp, "name") and fn_resp.name == "tavily_search"):
                continue
            resp_data = fn_resp.response if hasattr(fn_resp, "response") else {}
            if isinstance(resp_data, str):
                try:
                    resp_data = json.loads(resp_data)
                except (json.JSONDecodeError, TypeError):
                    continue
            results = []
            if isinstance(resp_data, dict):
                results = resp_data.get("results", [])
            for item in results:
                url = item.get("url", "")
                if not url or url in url_to_short_id:
                    continue
                title = item.get("title", url)
                short_id = f"src-{id_counter}"
                url_to_short_id[url] = short_id
                domain = url.split("/")[2] if len(url.split("/")) > 2 else url
                sources[short_id] = {
                    "short_id": short_id,
                    "title": title,
                    "url": url,
                    "domain": domain,
                    "supported_claims": [],
                }
                id_counter += 1

    callback_context.state["url_to_short_id"] = url_to_short_id
    callback_context.state["sources"] = sources


def citation_replacement_callback(
    callback_context: CallbackContext,
) -> genai_types.Content:
    """Replace <cite source="src-N"/> tags with Markdown links."""
    final_report = callback_context.state.get("final_cited_report", "")
    sources = callback_context.state.get("sources", {})

    def tag_replacer(match: re.Match) -> str:
        short_id = match.group(1)
        if not (source_info := sources.get(short_id)):
            logging.warning(
                f"Invalid citation tag removed: {match.group(0)}"
            )
            return ""
        display_text = source_info.get(
            "title", source_info.get("domain", short_id)
        )
        return f" [{display_text}]({source_info['url']})"

    processed_report = re.sub(
        r'<cite\s+source\s*=\s*["\']?\s*(src-\d+)\s*["\']?\s*/>',
        tag_replacer,
        final_report,
    )
    processed_report = re.sub(r"\s+([.,;:])", r"\1", processed_report)
    callback_context.state["final_report_with_citations"] = processed_report
    return genai_types.Content(parts=[genai_types.Part(text=processed_report)])


def parse_evaluation_callback(callback_context: CallbackContext) -> None:
    """Parse JSON output from research_evaluator into a dict in state.

    DeepSeek does not support output_schema, so the evaluator outputs raw JSON
    text. This callback parses it and overwrites the state entry as a dict.
    """
    raw = callback_context.state.get("research_evaluation", "")
    if isinstance(raw, dict):
        return
    if isinstance(raw, str):
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned = "\n".join(lines)
        try:
            parsed = json.loads(cleaned)
            callback_context.state["research_evaluation"] = parsed
        except (json.JSONDecodeError, TypeError):
            logging.warning("Failed to parse evaluation JSON, treating as fail")
            callback_context.state["research_evaluation"] = {
                "grade": "fail",
                "comment": raw,
                "follow_up_queries": [],
            }


def make_truncate_state_callback(key: str, max_chars: int = 60000):
    """Return a before_agent_callback that truncates a state value."""
    def _truncate(callback_context: CallbackContext) -> None:
        val = callback_context.state.get(key, "")
        if isinstance(val, str) and len(val) > max_chars:
            callback_context.state[key] = (
                val[:max_chars]
                + "\n\n...[content truncated due to length]..."
            )
            logging.info(
                f"Truncated state['{key}'] from {len(val)} to {max_chars} chars"
            )
    return _truncate


# ---------------------------------------------------------------------------
# Custom Agent: Loop control
# ---------------------------------------------------------------------------

class EscalationChecker(BaseAgent):
    """Stops the refinement loop when research evaluation passes."""

    def __init__(self, name: str):
        super().__init__(name=name)

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        evaluation_result = ctx.session.state.get("research_evaluation")
        if isinstance(evaluation_result, str):
            try:
                evaluation_result = json.loads(evaluation_result)
            except (json.JSONDecodeError, TypeError):
                evaluation_result = None

        if evaluation_result and evaluation_result.get("grade") == "pass":
            logging.info(f"[{self.name}] Research passed. Stopping loop.")
            yield Event(author=self.name, actions=EventActions(escalate=True))
        else:
            logging.info(f"[{self.name}] Research needs improvement. Continuing.")
            yield Event(author=self.name)


# ---------------------------------------------------------------------------
# Agent definitions
# ---------------------------------------------------------------------------

TODAY = datetime.datetime.now().strftime("%Y-%m-%d")

# --- Plan Generator (used as AgentTool by root_agent) ---

plan_generator = LlmAgent(
    model=model,
    name="plan_generator",
    description="Generates or refines a research plan for the given topic.",
    instruction=f"""
    You are a research strategist for product managers. Create a high-level
    RESEARCH PLAN — not a summary, not an answer.

    If there is already a plan in session state, improve it based on user feedback.

    EXISTING PLAN (if any):
    {{{{ research_plan? }}}}

    RULES:
    - Output a bulleted list of 5 action-oriented research goals.
    - Each goal starts with a verb: "Analyze", "Identify", "Investigate", etc.
    - Prefix each goal with [RESEARCH] or [DELIVERABLE]:
      - [RESEARCH]: information gathering tasks (need web search)
      - [DELIVERABLE]: synthesis/output tasks (tables, summaries, reports)
    - After the 5 [RESEARCH] goals, add [DELIVERABLE][IMPLIED] goals for any
      natural output artifacts (comparison tables, summary reports, etc.)
    - When refining, mark changes with [MODIFIED] or [NEW].

    Do NOT perform any research yourself. Do NOT use any tools.
    Current date: {TODAY}
    """,
)


# --- Phase 1: Research Pipeline agents ---

section_planner = LlmAgent(
    model=model,
    name="section_planner",
    include_contents="none",
    description="Designs the report outline from the research plan.",
    instruction="""
    You are an expert report architect. Design a logical structure for the
    research report based on the following plan:

    RESEARCH PLAN:
    {research_plan}

    Ignore all tags ([MODIFIED], [NEW], [RESEARCH], [DELIVERABLE]) in the plan.

    Create a markdown outline with 4-6 distinct sections covering the topic
    comprehensively. Include subsections where helpful.

    The report should have a PM/business perspective: include sections for
    market landscape, competitive analysis, key insights, and actionable
    recommendations where relevant.

    Do NOT include a "References" section — citations are handled in-line.
    """,
    output_key="report_sections",
)


web_researcher = LlmAgent(
    model=model,
    name="web_researcher",
    include_contents="none",
    description="Performs web research using Tavily search.",
    instruction="""
    You are a diligent research agent. Execute the following research plan
    with absolute fidelity.

    RESEARCH PLAN:
    {research_plan}

    Phase 1 — Information Gathering ([RESEARCH] tasks):
    - For each [RESEARCH] goal, formulate 2-3 targeted search queries.
    - Use the tavily_search tool to execute each query.
    - Synthesize results into a concise summary per goal (keep each under
      500 words).

    Phase 2 — Synthesis ([DELIVERABLE] tasks):
    - Only start after ALL [RESEARCH] goals are done.
    - Use gathered summaries to produce each deliverable artifact.
    - Do NOT perform new searches in this phase.

    Final output: all research summaries + all deliverable artifacts,
    clearly organized. Be concise — focus on key findings, not raw data.
    """,
    tools=[FunctionTool(tavily_search)],
    output_key="section_research_findings",
    after_agent_callback=collect_tavily_sources_callback,
)


research_evaluator = LlmAgent(
    model=model,
    name="research_evaluator",
    include_contents="none",
    description="Evaluates research quality and identifies gaps.",
    instruction=f"""
    You are a quality assurance analyst. Below is the research to evaluate:

    RESEARCH FINDINGS:
    {{{{section_research_findings}}}}

    RULES:
    1. Assume the research topic is correct — do not question it.
    2. Evaluate: comprehensiveness, depth, logical flow, source credibility,
       clarity, and actionability for a product manager.
    3. If significant gaps exist, grade "fail" and provide follow-up queries.
    4. If the research is thorough, grade "pass".

    Current date: {TODAY}

    You MUST respond with a single JSON object in this exact format:
    {{{{
      "grade": "pass" or "fail",
      "comment": "detailed explanation",
      "follow_up_queries": [
        {{{{"search_query": "specific query 1"}}}},
        {{{{"search_query": "specific query 2"}}}}
      ]
    }}}}

    Output ONLY the JSON object, no markdown fences, no extra text.
    """,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_key="research_evaluation",
    before_agent_callback=make_truncate_state_callback("section_research_findings"),
    after_agent_callback=parse_evaluation_callback,
)


enhanced_researcher = LlmAgent(
    model=model,
    name="enhanced_researcher",
    include_contents="none",
    description="Executes follow-up searches to fill research gaps.",
    instruction="""
    You are a specialist researcher executing a refinement pass.
    The previous research was graded as 'fail'.

    EVALUATION FEEDBACK:
    {research_evaluation}

    EXISTING RESEARCH (may be truncated):
    {section_research_findings}

    1. Review the evaluation feedback and follow-up queries above.
    2. Execute each follow-up query using the tavily_search tool.
    3. Synthesize new findings and COMBINE them with the existing research.
    4. Output the complete, improved research findings.
    """,
    tools=[FunctionTool(tavily_search)],
    output_key="section_research_findings",
    before_agent_callback=make_truncate_state_callback("section_research_findings"),
    after_agent_callback=collect_tavily_sources_callback,
)


research_composer = LlmAgent(
    model=model,
    name="research_composer",
    include_contents="none",
    description="Writes the final cited research report.",
    instruction="""
    Transform the research into a polished, professional report with PM insights.

    INPUT DATA:
    - Research Plan: {research_plan}
    - Research Findings: {section_research_findings}
    - Citation Sources: {sources}
    - Report Structure: {report_sections}

    CITATION SYSTEM:
    Insert <cite source="src-ID_NUMBER" /> directly after each claim.
    Only use source IDs that exist in the Citation Sources data.

    PM PERSPECTIVE — include where relevant:
    - Market insights and competitive landscape
    - Actionable recommendations
    - Risks and assumptions
    - Key metrics or success indicators

    Generate a comprehensive report following the Report Structure outline.
    Do NOT include a References section — all citations must be in-line.
    """,
    output_key="final_cited_report",
    before_agent_callback=make_truncate_state_callback("section_research_findings"),
    after_agent_callback=citation_replacement_callback,
)


# --- Phase 1: Research Pipeline ---

research_pipeline = SequentialAgent(
    name="research_pipeline",
    description="Executes the approved research plan: outline, search, evaluate, refine, compose report.",
    sub_agents=[
        section_planner,
        web_researcher,
        LoopAgent(
            name="iterative_refinement_loop",
            max_iterations=config.max_search_iterations,
            sub_agents=[
                research_evaluator,
                EscalationChecker(name="escalation_checker"),
                enhanced_researcher,
            ],
        ),
        research_composer,
    ],
)


# --- Phase 2: PRD Pipeline agents ---

knowledge_researcher = LlmAgent(
    model=model,
    name="knowledge_researcher",
    include_contents="none",
    description="Retrieves relevant company knowledge from the RAG knowledge base.",
    instruction="""
    You are a knowledge retrieval specialist. Your job is to search the company's
    internal knowledge base for information relevant to the research that was
    just completed.

    Read the research report from 'final_report_with_citations' state key.
    Extract the key topics, product areas, and business domains mentioned.

    For each key topic, use the search_knowledge_base tool to find relevant
    internal documents. Formulate 3-5 different search queries to maximize
    coverage.

    Compile all retrieved knowledge into a structured summary, noting the
    source file for each piece of information.

    If the knowledge base is empty or returns no results, simply state:
    "No relevant internal knowledge found. PRD will be based on external
    research only."
    """,
    tools=[FunctionTool(search_knowledge_base)],
    output_key="company_knowledge",
)


prd_composer = LlmAgent(
    model=model,
    name="prd_composer",
    include_contents="none",
    description="Generates a structured PRD from research and company knowledge.",
    instruction="""
    You are a senior product manager writing a Product Requirements Document.

    INPUT DATA:
    - Research Report: {final_report_with_citations}
    - Company Knowledge: {company_knowledge}
    - Research Plan: {research_plan}

    Generate a structured PRD with these sections:

    # Product Requirements Document

    ## 1. Background & Objectives
    Why this product/feature matters, based on the research findings.

    ## 2. Target Users & User Stories
    Who benefits and what they need. Use format:
    "As a [user type], I want [goal] so that [benefit]."

    ## 3. Functional Requirements
    Detailed feature list with priority (P0/P1/P2).

    ## 4. Non-Functional Requirements
    Performance, security, scalability, compatibility constraints.

    ## 5. Success Metrics
    How to measure if this product succeeds (KPIs, targets).

    ## 6. Risks & Assumptions
    What could go wrong and what we're assuming to be true.

    ## 7. Open Questions
    Items needing further investigation or stakeholder decisions.

    Incorporate insights from company knowledge where available.
    Be specific and actionable — avoid vague statements.
    """,
    output_key="prd_document",
)


# --- Phase 2: PRD Pipeline ---

prd_pipeline = SequentialAgent(
    name="prd_pipeline",
    description="Generates a PRD by combining research results with company knowledge.",
    sub_agents=[
        knowledge_researcher,
        prd_composer,
    ],
)


# --- Root Agent: Pure Dispatcher ---

root_agent = LlmAgent(
    name="root_agent",
    model=model,
    description="The main dispatcher that orchestrates the research-to-PRD workflow with human checkpoints.",
    instruction=f"""
    You are a task dispatcher. Your ONLY job is to understand what the user wants
    and route tasks to the right pipeline. You NEVER generate content yourself.

    TODAY: {TODAY}

    WORKFLOW (follow strictly in order):

    STAGE 1 — Research Plan:
    - When the user provides a topic, immediately use the plan_generator tool
      to create a research plan.
    - Present the plan to the user and ask: "请审阅研究计划，满意请说'开始研究'，或告诉我需要修改的地方。"
    - If the user requests changes, use plan_generator again with their feedback.
    - Only proceed to Stage 2 when the user explicitly approves
      (e.g., "OK", "开始", "可以", "looks good").

    STAGE 2 — Research Execution:
    - After approval, delegate to the research_pipeline agent.
    - When it completes, tell the user: "研究报告已完成。请审阅，满意后说'继续生成PRD'，或告诉我需要补充研究的内容。"
    - If the user wants more research, delegate to research_pipeline again.
    - Only proceed to Stage 3 when the user explicitly confirms.

    STAGE 3 — PRD Generation:
    - After the user confirms, delegate to the prd_pipeline agent.
    - When it completes, tell the user: "PRD已生成，请审阅。"
    - If the user wants changes, delegate to prd_pipeline again.

    CRITICAL RULES:
    - You are a dispatcher ONLY — do NOT write reports, analysis, or PRDs.
    - After each stage completes, STOP and wait for user input.
    - If the user says "停止" or "取消", end the conversation politely.
    - If the user says "返回" or "重新", go back to the relevant stage.
    - Keep your messages brief and focused on status + next action.
    """,
    sub_agents=[research_pipeline, prd_pipeline],
    tools=[AgentTool(plan_generator)],
    output_key="research_plan",
)
