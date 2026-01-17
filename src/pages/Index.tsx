import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StoryInput } from "@/components/comic/StoryInput";
import { LoadingAnimation } from "@/components/comic/LoadingAnimation";
import { ComicViewer } from "@/components/comic/ComicViewer";
import { useComicGenerator } from "@/hooks/useComicGenerator";

const Index = () => {
  const { isLoading, loadingStep, comic, generateComic, reset } = useComicGenerator();

  return (
    <div className="min-h-screen bg-comic-cream flex flex-col">
      <Navbar />

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-comic-yellow/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-comic-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-comic-red/10 rounded-full blur-2xl" />
      </div>

      <main className="flex-1 relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
          <motion.div
            animate={{ rotate: [0, -2, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <h1
              className="text-5xl md:text-7xl font-black text-comic-text mb-4"
              style={{
                textShadow: "4px 4px 0 hsl(var(--comic-yellow)), 8px 8px 0 hsl(var(--comic-red))",
              }}
            >
              🎨 My Comic Maker
            </h1>
          </motion.div>
          <p className="text-xl text-comic-text/70 font-medium max-w-xl mx-auto">
            Turn your wildest ideas into hilarious 9-panel comic strips! Just describe your story and watch the magic
            happen.
          </p>
        </motion.header>

        {/* Main content */}
        <section className="relative">
          {!comic && !isLoading && <StoryInput onSubmit={generateComic} isLoading={isLoading} />}

          {isLoading && <LoadingAnimation currentStep={loadingStep} />}

          {comic && !isLoading && (
            <ComicViewer
              title={comic.title}
              coverImageUrl={comic.coverImageUrl}
              panels={comic.panels}
              onReset={reset}
            />
          )}
        </section>

        {/* How It Works - only show when not generating or viewing */}
        {!comic && !isLoading && <HowItWorks />}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
