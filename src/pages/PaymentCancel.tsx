import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-comic-cream flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border-4 border-comic-text rounded-2xl shadow-comic-lg p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-comic-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-comic-red" />
          </div>
          
          <h1 className="text-3xl font-black text-comic-text mb-2">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-6">
            No worries! Your payment was cancelled and you haven't been charged.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/pricing")}
              className="w-full bg-primary text-primary-foreground font-bold py-6 border-4 border-comic-text shadow-comic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              View Pricing Plans
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full border-2 border-comic-text"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancel;
