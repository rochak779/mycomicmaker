import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile, isAuthenticated } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string; product_type?: string } | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId || !isAuthenticated) {
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-session", {
          body: { session_id: sessionId },
        });

        if (error) throw error;
        
        setResult(data);
        await refreshProfile();
      } catch (err) {
        console.error("Error verifying payment:", err);
        setResult({ success: false, message: "Failed to verify payment" });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, isAuthenticated, refreshProfile]);

  return (
    <div className="min-h-screen bg-comic-cream flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border-4 border-comic-text rounded-2xl shadow-comic-lg p-8 max-w-md w-full text-center"
        >
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-black text-comic-text mb-2">Verifying Payment...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your purchase.</p>
            </>
          ) : result?.success ? (
            <>
              <div className="w-20 h-20 bg-comic-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-comic-green" />
              </div>
              <h1 className="text-3xl font-black text-comic-text mb-2">Payment Successful! 🎉</h1>
              <p className="text-muted-foreground mb-6">{result.message}</p>
              
              {result.product_type === "subscription" && (
                <div className="bg-comic-yellow/20 border-2 border-comic-yellow rounded-xl p-4 mb-6">
                  <Sparkles className="w-6 h-6 text-comic-yellow mx-auto mb-2" />
                  <p className="font-bold text-comic-text">You now have unlimited access!</p>
                  <p className="text-sm text-muted-foreground">Create as many comics as you want.</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-primary text-primary-foreground font-bold py-6 border-4 border-comic-text shadow-comic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Start Creating Comics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/my-comics")}
                  className="w-full border-2 border-comic-text"
                >
                  View My Comics
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-comic-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">😕</span>
              </div>
              <h1 className="text-2xl font-black text-comic-text mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                {result?.message || "We couldn't verify your payment. Please contact support if you were charged."}
              </p>
              <Button
                onClick={() => navigate("/pricing")}
                className="w-full bg-primary text-primary-foreground font-bold border-4 border-comic-text"
              >
                Try Again
              </Button>
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
