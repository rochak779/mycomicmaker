import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Sparkles } from "lucide-react";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-comic-cream flex flex-col">
      <Navbar />

      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-comic-blue/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-comic-yellow/20 rounded-full blur-3xl" />
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
            style={{ textShadow: "3px 3px 0 hsl(var(--comic-blue))" }}
          >
            📚 Comic Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get inspired by sample comics created with our AI. Click any comic to view or remix it!
          </p>
        </motion.div>

        {/* Coming Soon State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="bg-card border-4 border-comic-text rounded-2xl shadow-comic-lg p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-comic-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-comic-yellow" />
            </div>
            <h2 className="text-2xl font-black text-comic-text mb-3">
              Gallery Coming Soon!
            </h2>
            <p className="text-muted-foreground mb-6">
              We're curating an amazing collection of sample comics. Check back soon for inspiration!
            </p>
            <div className="flex items-center justify-center gap-2 text-primary font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Stay tuned</span>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
