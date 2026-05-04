import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Cpu, BarChart3, Shield, Zap, ArrowRight, CheckCircle2, FileText, Play } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const features = [
  {
    icon: Upload,
    title: "Upload Any Document",
    description: "PDF, DOCX, images, scans — our AI handles them all with high accuracy.",
  },
  {
    icon: Cpu,
    title: "AI-Powered Parsing",
    description: "Advanced ML models extract structured data from unstructured documents.",
  },
  {
    icon: BarChart3,
    title: "Instant Results",
    description: "Get parsed results in seconds with confidence scores and field mapping.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant. Your data is encrypted at rest and in transit.",
  },
];

const steps = [
  { step: "01", title: "Upload", description: "Drag and drop your documents or connect via our API." },
  { step: "02", title: "Process", description: "Our AI parses and extracts key data points automatically." },
  { step: "03", title: "Review", description: "View structured results, validate, and export your data." },
];

const trustedBy = ["Acme Corp", "TechStart", "DataFlow", "CloudBase", "NovaPay"];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(221_83%_53%_/_0.15),_transparent_50%)]" />
        <div className="container py-24 md:py-36 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-sm text-primary-foreground/70 mb-8 backdrop-blur-sm">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Now processing 10M+ documents monthly
              </div>
            </motion.div>
            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight"
            >
              Turn Documents into
              <span className="block text-gradient mt-2">Structured Data</span>
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Upload any document. Our AI extracts, classifies, and structures your data
              in seconds — no templates, no rules, just intelligence.
            </motion.p>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:brightness-110 text-base h-12 px-8" asChild>
                <Link to="/auth?tab=signup">
                  Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10 text-base h-12 px-8 backdrop-blur-sm" asChild>
                <Link to="/pricing">
                  <Play className="mr-1 h-4 w-4" /> View Demo
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 md:mt-24 max-w-5xl mx-auto"
          >
            <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-md p-2 shadow-2xl">
              <div className="rounded-xl bg-foreground/90 p-1">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-primary-foreground/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-primary-foreground/10 rounded-md px-16 py-1 text-xs text-primary-foreground/40 font-mono">
                      app.gizaglobal.com/dashboard
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 p-4">
                  {[
                    { label: "Total Jobs", value: "1,284", color: "text-primary-foreground" },
                    { label: "Completed", value: "1,180", color: "text-success" },
                    { label: "In Progress", value: "89", color: "text-info" },
                    { label: "Accuracy", value: "99.2%", color: "text-primary" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-primary-foreground/5 rounded-lg p-3 text-center">
                      <div className={`text-lg md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-primary-foreground/40 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">Trusted by innovative teams</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {trustedBy.map((name) => (
              <span key={name} className="text-lg font-bold text-muted-foreground/40 tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Features</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to process documents</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From upload to structured output, Giza Global handles the entire pipeline.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative rounded-2xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="gradient-primary rounded-xl w-11 h-11 flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md transition-shadow">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">How it works</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Three simple steps</h2>
            <p className="text-muted-foreground text-lg">From document to data in under a minute.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="text-6xl font-black text-gradient mb-4 leading-none">{s.step}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="gradient-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(250_83%_60%_/_0.4),_transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                Ready to automate your document workflow?
              </h2>
              <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
                Start with Free 5 files/day. No credit card required.
              </p>
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-base h-12 px-8 shadow-lg" asChild>
                <Link to="/auth?tab=signup">
                  Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
