import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for trying out Giza Global",
    quota: "20 uploads/month",
    features: [
      { text: "20 document uploads/month", included: true },
      { text: "Basic AI parsing", included: true },
      { text: "JSON export", included: true },
      { text: "Community support", included: true },
      { text: "7-day result retention", included: true },
      { text: "API access", included: false },
      { text: "Custom field mapping", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "For teams processing documents daily",
    quota: "500 uploads/month",
    features: [
      { text: "500 document uploads/month", included: true },
      { text: "Advanced AI models", included: true },
      { text: "CSV, JSON, XML export", included: true },
      { text: "Priority support", included: true },
      { text: "90-day result retention", included: true },
      { text: "API access", included: true },
      { text: "Custom field mapping", included: true },
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 199,
    yearlyPrice: 159,
    description: "For high-volume processing needs",
    quota: "Unlimited uploads",
    features: [
      { text: "Unlimited uploads", included: true },
      { text: "Custom AI model training", included: true },
      { text: "All export formats", included: true },
      { text: "Dedicated support & SLA", included: true },
      { text: "Unlimited retention", included: true },
      { text: "Full API access", included: true },
      { text: "SSO & RBAC", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="py-24 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider"
          >
            Pricing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Start free, scale as you grow. No hidden fees.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 rounded-full bg-muted p-1"
          >
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                !yearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                yearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly <span className="text-success text-xs ml-1">Save 20%</span>
            </button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={cn(
                  "relative rounded-2xl border p-8 flex flex-col transition-all duration-300",
                  plan.popular
                    ? "border-primary shadow-glow bg-card scale-[1.02]"
                    : "bg-card hover:border-border hover:shadow-md"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold tracking-tight">${price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  {yearly && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Billed ${price * 12}/year</p>
                  )}
                  <p className="text-xs text-primary font-medium mt-3">{plan.quota}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/60"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={cn("w-full", plan.popular && "gradient-primary text-primary-foreground shadow-md")}
                  asChild
                >
                  <Link to="/auth?tab=signup">
                    {plan.cta}
                    {plan.popular && <ArrowRight className="ml-1 h-4 w-4" />}
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
