import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, CreditCard, Zap, HelpCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (productType: "credits" | "subscription") => {
    if (!isAuthenticated) return;
    
    setLoadingPlan(productType);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product_type: productType },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Credit Pack",
      price: "$5",
      period: "one-time",
      description: "Perfect for trying out or occasional use",
      icon: CreditCard,
      color: "comic-blue",
      productType: "credits" as const,
      features: [
        "5 comic generations",
        "Full 2-page comics (cover + 9 panels)",
        "High-quality AI images",
        "Download as PNG or PDF",
        "Credits never expire",
      ],
      cta: "Buy Credits",
      popular: false,
    },
    {
      name: "Unlimited",
      price: "$10",
      period: "/month",
      description: "Best value for comic enthusiasts",
      icon: Sparkles,
      color: "comic-yellow",
      productType: "subscription" as const,
      features: [
        "Unlimited comic generations",
        "Full 2-page comics (cover + 9 panels)",
        "High-quality AI images",
        "Download as PNG or PDF",
        "Priority generation",
        "Cancel anytime",
      ],
      cta: "Subscribe Now",
      popular: true,
    },
  ];

  const faqs = [
    {
      question: "What counts as a generation?",
      answer: "Each time you create a complete comic (cover image + 9 panel images), that counts as 1 generation.",
    },
    {
      question: "Do credits expire?",
      answer: "No! Your credit pack credits never expire. Use them whenever you want.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes! You can cancel your unlimited subscription at any time. You'll keep access until the end of your billing period.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and various local payment methods through Stripe.",
    },
  ];

  return (
    <div className="min-h-screen bg-comic-cream flex flex-col">
      <Navbar />

      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-comic-yellow/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-comic-red/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-comic-blue/15 rounded-full blur-2xl" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl md:text-5xl font-black text-comic-text mb-4"
            style={{ textShadow: "3px 3px 0 hsl(var(--comic-yellow))" }}
          >
            💰 Simple Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Choose the plan that works best for you. Start creating amazing comics today!
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card border-4 border-comic-text rounded-2xl shadow-comic-lg p-8 ${
                plan.popular ? "ring-4 ring-comic-yellow" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-comic-yellow text-comic-text px-4 py-1 rounded-full text-sm font-black border-2 border-comic-text">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `hsl(var(--${plan.color}) / 0.2)` }}
                >
                  <plan.icon 
                    className="w-8 h-8" 
                    style={{ color: `hsl(var(--${plan.color}))` }}
                  />
                </div>
                <h2 className="text-2xl font-black text-comic-text">{plan.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-5xl font-black text-comic-text">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-comic-green flex-shrink-0 mt-0.5" />
                    <span className="text-comic-text">{feature}</span>
                  </li>
                ))}
              </ul>

              {isAuthenticated ? (
                <Button
                  onClick={() => handleCheckout(plan.productType)}
                  disabled={loadingPlan !== null}
                  className={`w-full font-bold text-lg py-6 border-4 border-comic-text shadow-comic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${
                    plan.popular
                      ? "bg-comic-yellow text-comic-text hover:bg-comic-yellow/90"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {loadingPlan === plan.productType ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              ) : (
                <Link to="/auth?mode=signup">
                  <Button
                    className={`w-full font-bold text-lg py-6 border-4 border-comic-text shadow-comic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${
                      plan.popular
                        ? "bg-comic-yellow text-comic-text hover:bg-comic-yellow/90"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    Sign Up to {plan.cta}
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border-4 border-comic-text rounded-2xl shadow-comic p-8 max-w-4xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-comic-yellow" />
            <h3 className="text-xl font-black text-comic-text">What You Get</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="font-bold text-comic-text">AI-Powered Art</h4>
              <p className="text-sm text-muted-foreground">
                Professional quality comic images generated by AI
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">📖</div>
              <h4 className="font-bold text-comic-text">Full Comics</h4>
              <p className="text-sm text-muted-foreground">
                Cover page + 9 panel comic strip in every generation
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⬇️</div>
              <h4 className="font-bold text-comic-text">Easy Export</h4>
              <p className="text-sm text-muted-foreground">
                Download your comics as PNG or PDF to share anywhere
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-black text-comic-text">FAQs</h3>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-card border-2 border-comic-text rounded-xl p-5"
              >
                <h4 className="font-bold text-comic-text mb-2">{faq.question}</h4>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
