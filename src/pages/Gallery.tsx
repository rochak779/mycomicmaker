import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComicPanel } from "@/components/comic/ComicPanel";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Panel {
  panelNumber: number;
  imageUrl: string;
  dialogue: string;
  soundEffect?: string | null;
}

interface SampleComic {
  id: string;
  title: string;
  theme: string;
  cover_image_url: string;
  panels: Panel[];
  story_prompt: string | null;
  character_description: string | null;
}

const themeLabels: Record<string, { label: string; emoji: string }> = {
  birthday: { label: "Birthday", emoji: "🎂" },
  love: { label: "Love Story", emoji: "💕" },
  freestyle: { label: "Freestyle", emoji: "✨" },
  friends: { label: "Friends", emoji: "👯" },
  family: { label: "Family", emoji: "👨‍👩‍👧‍👦" },
};

const Gallery = () => {
  const [selectedComic, setSelectedComic] = useState<SampleComic | null>(null);
  const [currentPage, setCurrentPage] = useState<"cover" | "panels">("cover");

  const { data: comics, isLoading, error } = useQuery({
    queryKey: ["sample-comics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sample_comics")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      return data.map((comic) => ({
        ...comic,
        panels: comic.panels as unknown as Panel[],
      })) as SampleComic[];
    },
  });

  const openComic = (comic: SampleComic) => {
    setSelectedComic(comic);
    setCurrentPage("cover");
  };

  const closeComic = () => {
    setSelectedComic(null);
    setCurrentPage("cover");
  };

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
            Get inspired by sample comics created with our AI. Click any comic to view it!
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
              <p className="text-destructive font-medium">Failed to load comics. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && comics?.length === 0 && (
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
              <p className="text-muted-foreground">
                We're curating an amazing collection of sample comics. Check back soon for inspiration!
              </p>
            </div>
          </motion.div>
        )}

        {/* Comic Grid */}
        {!isLoading && !error && comics && comics.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {comics.map((comic, index) => (
              <motion.div
                key={comic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openComic(comic)}
                className="cursor-pointer group"
              >
                <div className="bg-card border-4 border-comic-text rounded-2xl overflow-hidden shadow-comic hover:shadow-comic-lg transition-shadow">
                  {/* Cover Image */}
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={comic.cover_image_url}
                      alt={comic.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Theme Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-comic-yellow border-2 border-comic-text rounded-full text-sm font-bold text-comic-text">
                      {themeLabels[comic.theme]?.emoji || "📖"} {themeLabels[comic.theme]?.label || comic.theme}
                    </div>
                  </div>
                  {/* Title */}
                  <div className="p-4 bg-gradient-to-t from-card to-card/80">
                    <h3 className="text-lg font-black text-comic-text text-center line-clamp-2">
                      {comic.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />

      {/* Comic Viewer Modal */}
      <AnimatePresence>
        {selectedComic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={closeComic}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-comic-cream rounded-2xl border-4 border-comic-text shadow-comic-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b-4 border-comic-text bg-comic-yellow/20">
                <h2 className="text-xl font-black text-comic-text">{selectedComic.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeComic}
                  className="rounded-full border-2 border-comic-text hover:bg-comic-red hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-6">
                <AnimatePresence mode="wait">
                  {currentPage === "cover" ? (
                    <motion.div
                      key="cover"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col items-center"
                    >
                      <div className="max-w-md w-full">
                        <div className="aspect-[3/4] rounded-xl border-4 border-comic-text overflow-hidden shadow-comic-lg">
                          <img
                            src={selectedComic.cover_image_url}
                            alt={selectedComic.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3
                          className="text-3xl font-black text-comic-text text-center mt-6"
                          style={{ textShadow: "2px 2px 0 hsl(var(--comic-yellow))" }}
                        >
                          {selectedComic.title}
                        </h3>
                        {selectedComic.story_prompt && (
                          <p className="text-center text-muted-foreground mt-2">
                            {selectedComic.story_prompt}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="panels"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="grid grid-cols-3 gap-3">
                        {selectedComic.panels.map((panel, index) => (
                          <ComicPanel
                            key={panel.panelNumber}
                            panelNumber={panel.panelNumber}
                            imageUrl={panel.imageUrl}
                            dialogue={panel.dialogue}
                            soundEffect={panel.soundEffect}
                            delay={index * 0.05}
                            compact
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer - Navigation */}
              <div className="flex items-center justify-between p-4 border-t-4 border-comic-text bg-comic-blue/10">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage("cover")}
                  disabled={currentPage === "cover"}
                  className="border-2 border-comic-text font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Cover
                </Button>
                <div className="flex gap-2">
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-comic-text ${
                      currentPage === "cover" ? "bg-comic-yellow" : "bg-transparent"
                    }`}
                  />
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-comic-text ${
                      currentPage === "panels" ? "bg-comic-yellow" : "bg-transparent"
                    }`}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage("panels")}
                  disabled={currentPage === "panels"}
                  className="border-2 border-comic-text font-bold"
                >
                  Panels
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
