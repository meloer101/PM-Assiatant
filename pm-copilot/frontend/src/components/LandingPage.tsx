import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Search,
  FileText,
  Zap,
  Shield,
  Clock,
  Layers,
  Mail,
  Github,
} from "lucide-react";
import { Reveal } from "./Reveal";

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-[#FAF9F6] text-[#1A1A1A] font-sans selection:bg-[#D9653B]/30 relative scroll-smooth">
      {/* Liquid Glass Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D9653B]/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#F4A261]/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#E9C46A]/10 rounded-full mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/70 backdrop-blur-xl border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-bold text-xl tracking-tight">
            <Sparkles className="w-5 h-5 text-[#D9653B]" />
            <span>Steven</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#666666]">
            <a
              href="#features"
              className="hover:text-[#1A1A1A] transition-colors"
            >
              功能
            </a>
            <a
              href="#why-us"
              className="hover:text-[#1A1A1A] transition-colors"
            >
              产品
            </a>
            <a
              href="#contact"
              className="hover:text-[#1A1A1A] transition-colors"
            >
              联系
            </a>
          </div>
          <Link
            to="/app"
            className="px-5 py-2 bg-[#D9653B] text-white text-sm font-medium rounded-full hover:bg-[#c2552e] transition-all shadow-md shadow-[#D9653B]/20 hover:shadow-lg hover:shadow-[#D9653B]/30 hover:-translate-y-0.5"
          >
            开始使用
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="snap-start relative min-h-screen flex flex-col items-center justify-center pt-24 pb-24 px-4 bg-[#FAF9F6]">
        {" "}
        {/* 增加了顶部和底部内边距，确保内容不被切断 */}
        <div className="max-w-4xl mx-auto text-center z-10 ">
          <Reveal delay={0}>
            {/* 标题字体稍微缩小，使其在视觉上更精致 (4xl -> 3xl on mobile, 7xl -> 6xl on desktop) */}
            <h1 className="text-3xl md:text-6xl font-serif font-mormal tracking-tight text-[#1A1A1A] leading-[1.3] mb-8 ">
              AI 驱动的
              <br />
              <span className="text-[#D9653B]">研究与 PRD 助手</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            {/* 段落增加下边距 (mb-12 -> mb-16) */}
            <p className="text-lg md:text-xl text-[#666666] mb-16 max-w-2xl mx-auto font-light">
              输入研究主题，审阅并敲定研究计划后，由 AI
              自主完成检索、批判与成稿，产出带可点击引用的研究报告；满意后可继续生成
              PRD，并支持知识库文档检索。
            </p>
          </Reveal>

          {/* Search Bar Mockup */}
          <Reveal delay={300}>
            {/* 调整搜索框的大小，使其更紧凑 (p-6 -> p-5, text-lg -> text-base, text-sm -> text-xs) */}
            <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E0D8] overflow-hidden mb-16 transform transition-all hover:scale-[1.02] duration-500">
              <div className="p-5 text-left border-b border-[#E5E0D8]/50">
                <div className="flex items-center gap-2 text-base text-[#1A1A1A]">
                  某产品竞品与市场机会研究
                  <span className="w-0.5 h-6 bg-[#D9653B] animate-pulse"></span>
                </div>
              </div>
              <div className="bg-[#FAF9F6]/50 p-4 flex items-center justify-between">
                <span className="text-xs text-[#999999]">
                  输入研究主题，审阅计划后开始研究
                </span>
                <div className="w-8 h-8 rounded-full bg-[#D9653B] flex items-center justify-center text-white cursor-pointer hover:bg-[#c2552e] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Reveal>

          {/* 开始使用：一打开主页就浮现上来 */}
          <Link
            to="/app"
            className="animate-float-up-on-load inline-flex items-center gap-2 px-7 py-3.5 bg-[#D9653B] text-white text-base font-light rounded-full hover:bg-[#c2552e] transition-all shadow-lg shadow-[#D9653B]/20 hover:shadow-xl hover:shadow-[#D9653B]/30 hover:-translate-y-1"
          >
            开始使用 <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="snap-start relative h-screen flex flex-col items-center justify-center px-4 bg-white/40 backdrop-blur-lg border-y border-[#E5E0D8]/50"
      >
        <div className="max-w-6xl mx-auto w-full z-10">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-[#1A1A1A] mb-4">
                三大核心能力
              </h2>
              <p className="text-[#666666]">
                从研究计划审阅到自主研究、报告与 PRD
                生成，人机协同、结果可溯源。
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Reveal delay={100}>
              <div className="group bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E5E0D8] hover:shadow-[0_8px_30px_rgb(217,101,59,0.08)] hover:border-[#D9653B]/30 transition-all duration-500 h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-[#D9653B]/10 flex items-center justify-center text-[#D9653B] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-xs font-medium text-[#999999] uppercase tracking-wider mb-2">
                  Plan & Review
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  研究计划与审阅
                </h3>
                <p className="text-[#666666] leading-relaxed mb-8 flex-grow">
                  AI
                  根据你的研究主题生成多目标研究计划，你可审阅、增删改目标，满意后再批准执行，一切由你把关。
                </p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E0D8]/50">
                  <div>
                    <div className="text-xs text-[#999999] mb-1">环节</div>
                    <div className="font-medium text-[#1A1A1A]">人机协同</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#999999] mb-1">触发</div>
                    <div className="font-medium text-[#1A1A1A]">批准后执行</div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 2 */}
            <Reveal delay={200}>
              <div className="group bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E5E0D8] hover:shadow-[0_8px_30px_rgb(217,101,59,0.08)] hover:border-[#D9653B]/30 transition-all duration-500 h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-[#D9653B]/10 flex items-center justify-center text-[#D9653B] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-xs font-medium text-[#999999] uppercase tracking-wider mb-2">
                  Autonomous Research
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  自主深度研究
                </h3>
                <p className="text-[#666666] leading-relaxed mb-8 flex-grow">
                  批准计划后，AI
                  按节检索、批判评估、查漏补缺，循环直到信息充分，再汇总为结构化研究报告，关键结论带可点击引用。
                </p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E0D8]/50">
                  <div>
                    <div className="text-xs text-[#999999] mb-1">检索</div>
                    <div className="font-medium text-[#1A1A1A]">联网搜索</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#999999] mb-1">质量</div>
                    <div className="font-medium text-[#1A1A1A]">批判循环</div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 3 */}
            <Reveal delay={300}>
              <div className="group bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E5E0D8] hover:shadow-[0_8px_30px_rgb(217,101,59,0.08)] hover:border-[#D9653B]/30 transition-all duration-500 h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-[#D9653B]/10 flex items-center justify-center text-[#D9653B] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-xs font-medium text-[#999999] uppercase tracking-wider mb-2">
                  Report & PRD
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  报告与 PRD 生成
                </h3>
                <p className="text-[#666666] leading-relaxed mb-8 flex-grow">
                  研究报告审阅满意后，可一键「继续生成
                  PRD」；支持导入知识库文档，研究阶段自动检索并写入
                  PRD，让产出可延展、可溯源。
                </p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E0D8]/50">
                  <div>
                    <div className="text-xs text-[#999999] mb-1">产出</div>
                    <div className="font-medium text-[#1A1A1A]">报告 + PRD</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#999999] mb-1">知识库</div>
                    <div className="font-medium text-[#1A1A1A]">PDF / 文档</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
        id="why-us"
        className="snap-start relative h-screen flex flex-col justify-center px-4"
      >
        <div className="max-w-6xl mx-auto w-full z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal direction="right">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1A1A] leading-tight mb-6">
                  为什么选择
                  <br />
                  <span className="text-[#D9653B]">Steven</span>
                </h2>
                <p className="text-lg text-[#666666] leading-relaxed">
                  从主题到计划、从研究到报告再到
                  PRD，在一个对话里完成；计划由你审阅，研究由 AI
                  自主执行，结果带引用、可接知识库。
                </p>
              </div>
            </Reveal>

            <div className="space-y-4">
              <Reveal delay={100} direction="left">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#E5E0D8] flex items-start gap-4 hover:bg-white transition-colors">
                  <div className="mt-1 w-10 h-10 rounded-full bg-[#D9653B]/10 flex items-center justify-center text-[#D9653B] shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      计划可审阅
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      研究计划先由你确认或修改，批准后才执行，避免方向偏差，人机协同更可控。
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200} direction="left">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#E5E0D8] flex items-start gap-4 hover:bg-white transition-colors">
                  <div className="mt-1 w-10 h-10 rounded-full bg-[#D9653B]/10 flex items-center justify-center text-[#D9653B] shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      引用可溯源
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      报告中的关键结论带可点击引用链接，直达来源网页，信息透明、便于核对。
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={300} direction="left">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#E5E0D8] flex items-start gap-4 hover:bg-white transition-colors">
                  <div className="mt-1 w-10 h-10 rounded-full bg-[#D9653B]/10 flex items-center justify-center text-[#D9653B] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      研究可延展
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      研究报告满意后可继续生成 PRD，知识库中的
                      PDF/文档会在研究阶段被自动检索并写入 PRD。
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={400} direction="left">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#E5E0D8] flex items-start gap-4 hover:bg-white transition-colors">
                  <div className="mt-1 w-10 h-10 rounded-full bg-[#D9653B]/10 flex items-center justify-center text-[#D9653B] shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      检索 + 批判循环
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      AI
                      对每节研究进行批判评估，发现缺口则自动补充检索，直到满足质量要求再成稿。
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="snap-start relative h-screen flex flex-col bg-white/40 backdrop-blur-lg border-t border-[#E5E0D8]/50"
      >
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl mx-auto w-full text-center z-10">
            <Reveal>
              <h2 className="text-4xl font-serif font-bold text-[#1A1A1A] mb-4">
                联系我们
              </h2>
              <p className="text-[#666666] mb-12">
                反馈、合作或接入需求，欢迎联系。
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E5E0D8] text-left space-y-6">
                <a
                  href="mailto:contact@research-terminal.ai"
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FAF9F6] transition-colors group"
                >
                  <div className="flex items-center gap-3 text-[#D9653B] font-medium">
                    <Mail className="w-5 h-5" />
                    2497289114@qq.com
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D9653B] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </a>

                <a
                  href="mailto:jacobyu80@gmail.com"
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FAF9F6] transition-colors group"
                >
                  <div className="flex items-center gap-3 text-[#D9653B] font-medium">
                    <Mail className="w-5 h-5" />
                    jacobyu80@gmail.com
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D9653B] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </a>

                <a
                  href="https://github.com/meloer101"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FAF9F6] transition-colors group"
                >
                  <div className="flex items-center gap-3 text-[#666666] font-medium group-hover:text-[#1A1A1A] transition-colors">
                    <Github className="w-5 h-5" />
                    GitHub
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1A1A1A] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[#E5E0D8] py-8 text-center text-sm text-[#999999] bg-[#FAF9F6]">
          <p>© 2025 Steven · PM Research Copilot</p>
        </footer>
      </section>
    </div>
  );
}
