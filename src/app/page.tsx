import Link from "next/link";
import {
  Brain,
  Target,
  Users,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Enrichment",
    description:
      "Leverage Claude AI to automatically research and enrich company profiles with deep intelligence.",
  },
  {
    icon: Target,
    title: "Intent Scoring",
    description:
      "Score visitor intent in real-time to prioritize high-value accounts ready to convert.",
  },
  {
    icon: Users,
    title: "Visitor Intelligence",
    description:
      "Track anonymous visitors and link them to company accounts with behavioral analysis.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Visualize engagement patterns, intent distribution, and enrichment progress at a glance.",
  },
  {
    icon: Zap,
    title: "Batch Enrichment",
    description:
      "Enrich hundreds of companies at once with automated batch processing and progress tracking.",
  },
  {
    icon: Shield,
    title: "Sales-Ready Insights",
    description:
      "Get actionable recommendations, persona mapping, and tailored outreach suggestions.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            <span className="text-lg font-bold text-white">
              AI Account Intel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-slate-300 hover:text-white transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="gradient-bg absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-8">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">
                Powered by Claude AI
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight glow-text">
              AI Account Intelligence
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 mt-2">
                & Enrichment
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Convert anonymous website visitors into sales-ready intelligence.
              Automatically enrich company profiles, score buyer intent, and
              surface actionable insights with AI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 text-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition-all text-lg"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything you need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                close deals faster
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              From visitor tracking to AI enrichment, get the full picture of
              every account in your pipeline.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-teal-500/30 transition-all">
                  <feature.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold text-white">AI Account Intel</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built with Next.js, Claude AI, and Prisma
          </p>
        </div>
      </footer>
    </div>
  );
}
