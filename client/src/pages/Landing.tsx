import { Link } from "wouter";
import { ArrowRight, BarChart2, Globe, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold font-display tracking-tight">RankAI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/api/login" className="px-5 py-2 rounded-full bg-white text-background font-semibold hover:bg-white/90 transition-colors text-sm">
              Log In / Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next-Gen SEO Intelligence
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight leading-tight mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Digital Presence</span> with AI
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Automated SEO, AEO, and GEO audits powered by advanced LLMs. Get actionable insights to rank higher on Google, Bing, and AI search engines.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <a href="/api/login" className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center gap-2">
            Start Free Audit <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          {[
            {
              icon: Search,
              title: "SEO Analysis",
              desc: "Deep dive into technical SEO, content gaps, and backlink opportunities.",
            },
            {
              icon: Globe,
              title: "GEO & AEO Ready",
              desc: "Optimize for Generative Engine Optimization and AI Answer Engines.",
            },
            {
              icon: BarChart2,
              title: "Competitor Intel",
              desc: "Compare your performance directly against top ranking competitors.",
            },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl text-left hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
