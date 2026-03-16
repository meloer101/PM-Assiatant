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
  Linkedin,
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
            <span>Research Terminal</span>
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
        <div className="max-w-4xl mx-auto text-center z-10">
          <Reveal delay={0}>
            {/* 标题字体稍微缩小，使其在视觉上更精致 (4xl -> 3xl on mobile, 7xl -> 6xl on desktop) */}
            <h1 className="text-3xl md:text-6xl font-serif font-bold tracking-tight text-[#1A1A1A] leading-[1.1] mb-8">
              AI 驱动的
              <br />
              <span className="text-[#D9653B]">投资研究助手</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            {/* 段落增加下边距 (mb-12 -> mb-16) */}
            <p className="text-lg md:text-xl text-[#666666] mb-16 max-w-2xl mx-auto">
              统一聊天界面，完成股票分析、行业深度研究与 PDF
              文档问答。让每一次投资决策都有据可依。
            </p>
          </Reveal>

          {/* Search Bar Mockup */}
          <Reveal delay={300}>
            {/* 调整搜索框的大小，使其更紧凑 (p-6 -> p-5, text-lg -> text-base, text-sm -> text-xs) */}
            <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E0D8] overflow-hidden mb-16 transform transition-all hover:scale-[1.02] duration-500">
              <div className="p-5 text-left border-b border-[#E5E0D8]/50">
                <div className="flex items-center gap-2 text-base text-[#1A1A1A]">
                  半导体行业2024年投资
                  <span className="w-0.5 h-6 bg-[#D9653B] animate-pulse"></span>
                </div>
              </div>
              <div className="bg-[#FAF9F6]/50 p-4 flex items-center justify-between">
                <span className="text-xs text-[#999999]">
                  试试输入你的研究问题
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
            className="animate-float-up-on-load inline-flex items-center gap-2 px-7 py-3.5 bg-[#D9653B] text-white text-base font-medium rounded-full hover:bg-[#c2552e] transition-all shadow-lg shadow-[#D9653B]/20 hover:shadow-xl hover:shadow-[#D9653B]/30 hover:-translate-y-1"
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
                统一交互界面，三种专业工具，覆盖投资研究全流程。
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
                  Stock Analysis
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  股票分析
                </h3>
                <p className="text-[#666666] leading-relaxed mb-8 flex-grow">
                  实时财务数据解读、技术面分析、估值模型，一句话生成专业研报级别的分析结论。
                </p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E0D8]/50">
                  <div>
                    <div className="text-xs text-[#999999] mb-1">覆盖</div>
                    <div className="font-medium text-[#1A1A1A]">
                      A股/港股/美股
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#999999] mb-1">数据源</div>
                    <div className="font-medium text-[#1A1A1A]">
                      Wind / 东财
                    </div>
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
                  Deep Research
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  深度研究
                </h3>
                <p className="text-[#666666] leading-relaxed mb-8 flex-grow">
                  跨行业、跨主题的深度分析能力，自动检索信息并生成结构化研究报告。
                </p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E0D8]/50">
                  <div>
                    <div className="text-xs text-[#999999] mb-1">覆盖行业</div>
                    <div className="font-medium text-[#1A1A1A]">200+</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#999999] mb-1">研究深度</div>
                    <div className="font-medium text-[#1A1A1A]">多维度</div>
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
                  PDF Q&A
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  PDF 文档问答
                </h3>
                <p className="text-[#666666] leading-relaxed mb-8 flex-grow">
                  上传年报、招股书、研报等 PDF，AI 精准定位并回答你的问题。
                </p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E0D8]/50">
                  <div>
                    <div className="text-xs text-[#999999] mb-1">支持格式</div>
                    <div className="font-medium text-[#1A1A1A]">PDF / Word</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#999999] mb-1">上下文</div>
                    <div className="font-medium text-[#1A1A1A]">
                      100K tokens
                    </div>
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
                  <span className="text-[#D9653B]">Research Terminal</span>
                </h2>
                <p className="text-lg text-[#666666] leading-relaxed">
                  我们重新定义了投资研究的工作流。将分散的工具整合进一个智能终端，让专业能力触手可及。
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
                      极速响应
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      基于大模型优化推理链路，平均响应时间 &lt; 2
                      秒，让研究效率成倍提升。
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
                      数据安全
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      企业级加密传输与存储，上传文档不留存，确保研究数据的绝对隐私。
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
                      实时数据
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      对接专业金融数据源，提供实时行情、财务数据和公告信息。
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
                      多模态输入
                    </h4>
                    <p className="text-[#666666] text-sm leading-relaxed">
                      支持文本、PDF、图片等多种输入格式，灵活适配不同研究场景。
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
                有任何问题或合作意向？随时联系。
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
                    contact@research-terminal.ai
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D9653B] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </a>

                <a
                  href="#"
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FAF9F6] transition-colors group"
                >
                  <div className="flex items-center gap-3 text-[#666666] font-medium group-hover:text-[#1A1A1A] transition-colors">
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1A1A1A] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </a>

                <a
                  href="#"
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
          <p>© 2024 Research Terminal. All rights reserved.</p>
        </footer>
      </section>
    </div>
  );
}
