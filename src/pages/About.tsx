import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Target, Globe, Mail, ArrowRight, Users, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  { icon: Brain, title: "AI-First Approach", description: "We build everything around cutting-edge machine learning models that continuously improve with each document processed." },
  { icon: Target, title: "Accuracy Obsessed", description: "Our models achieve 99.2% extraction accuracy across 50+ document types, with built-in confidence scoring." },
  { icon: Globe, title: "Global Scale", description: "Processing documents in 40+ languages with infrastructure spanning 12 regions worldwide." },
];

const stats = [
  { value: "10M+", label: "Documents processed" },
  { value: "99.2%", label: "Extraction accuracy" },
  { value: "40+", label: "Languages supported" },
  { value: "2,000+", label: "Companies trust us" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="container max-w-4xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider"
          >
            About Giza Global
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 leading-[1.1]"
          >
            Making document processing{" "}
            <span className="text-gradient">effortless</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Giza Global was born from a simple frustration: processing documents manually is slow,
            error-prone, and expensive. We built an AI-powered platform that transforms any
            document into structured, actionable data in seconds.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 bg-muted/30 border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-4xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="gradient-primary rounded-xl p-2.5 shadow-sm shrink-0">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To eliminate manual document processing entirely. We believe every organization,
                from startups to enterprises, deserves access to intelligent document automation.
                Our platform processes invoices, contracts, receipts, forms, and any document type
                with near-human accuracy at machine speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-muted/30 border-y">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-bold">What drives us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border p-6 sm:p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="gradient-primary rounded-xl w-12 h-12 flex items-center justify-center mb-5 shadow-sm">
                  <v.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-4xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="gradient-primary rounded-xl p-2.5 shadow-sm shrink-0">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Our Technology</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Giza Global uses a combination of transformer-based NLP models, computer vision for OCR,
                and custom classification networks. Our pipeline processes documents through multiple
                stages: ingestion, OCR, layout analysis, entity extraction, and validation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Built on a cloud-native architecture, our platform auto-scales to handle thousands
                of concurrent document processing jobs with sub-second latency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 sm:py-24 bg-muted/30 border-t">
        <div className="container max-w-2xl text-center">
          <div className="gradient-primary rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Mail className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Get in touch</h2>
          <p className="text-muted-foreground mb-8">
            Questions about Giza Global? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="default" size="lg" asChild>
              <Link to="/auth?tab=signup">Start Free <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" size="lg">
              <Mail className="mr-2 h-4 w-4" /> support@gizaglobal.com
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
