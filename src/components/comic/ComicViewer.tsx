import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ComicPanel } from "./ComicPanel";
import { ExportButtons } from "./ExportButtons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Panel {
  panelNumber: number;
  visualDescription: string;
  dialogue: string;
  soundEffect?: string | null;
  imageUrl: string;
}

interface ComicViewerProps {
  title: string;
  coverImageUrl: string;
  panels: Panel[];
  onReset: () => void;
}

export const ComicViewer = ({ title, coverImageUrl, panels, onReset }: ComicViewerProps) => {
  const comicRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Page navigation */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(0)}
          disabled={currentPage === 0}
          className="border-2 border-comic-text"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Title Page
        </Button>
        <span className="font-bold text-comic-text">
          Page {currentPage + 1} of 2
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="border-2 border-comic-text"
        >
          Comic Strip
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Comic pages container */}
      <div
        ref={comicRef}
        id="comic-strip"
        className="relative"
      >
        {/* Page 1: Title Page */}
        {currentPage === 0 && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 bg-comic-cream rounded-2xl border-4 border-comic-text shadow-comic-lg flex flex-col items-center justify-center min-h-[600px]"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--comic-text) / 0.05) 1px, transparent 1px)`,
              backgroundSize: "15px 15px",
            }}
          >
            {/* Cover Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-md aspect-[3/4] rounded-xl border-4 border-comic-text overflow-hidden shadow-comic-lg mb-8 bg-white"
            >
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="Comic cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-comic-blue/10">
                  <span className="text-8xl">📖</span>
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-black text-comic-text uppercase tracking-tight text-center max-w-lg"
              style={{
                textShadow: "4px 4px 0 hsl(var(--comic-yellow)), 8px 8px 0 hsl(var(--comic-red))",
              }}
            >
              {title}
            </motion.h1>

            {/* Click hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-comic-text/60 font-medium"
            >
              Click "Comic Strip" to read the story →
            </motion.p>
          </motion.div>
        )}

        {/* Page 2: 9-Panel Comic Strip */}
        {currentPage === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 md:p-6 bg-comic-cream rounded-2xl border-4 border-comic-text shadow-comic-lg"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--comic-text) / 0.1) 1px, transparent 1px)`,
              backgroundSize: "10px 10px",
            }}
          >
            {/* Comic title header */}
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-black text-comic-text uppercase tracking-tight text-center mb-4"
              style={{
                textShadow: "2px 2px 0 hsl(var(--comic-yellow))",
              }}
            >
              {title}
            </motion.h2>

            {/* 9-panel grid (3x3) */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {panels.map((panel, index) => (
                <ComicPanel
                  key={panel.panelNumber}
                  panelNumber={panel.panelNumber}
                  imageUrl={panel.imageUrl}
                  dialogue={panel.dialogue}
                  soundEffect={panel.soundEffect}
                  delay={index * 0.1}
                  compact
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Export buttons */}
      <ExportButtons 
        comicRef={comicRef} 
        title={title} 
        coverImageUrl={coverImageUrl}
        panels={panels}
        onReset={onReset} 
      />
    </motion.div>
  );
};
