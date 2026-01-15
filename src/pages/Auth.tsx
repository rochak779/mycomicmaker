import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-comic-cream flex flex-col">
      <Navbar />
      
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-comic-yellow/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-comic-blue/20 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthForm />
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
