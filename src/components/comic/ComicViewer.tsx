import { useRef } from "react";
import { motion } from "framer-motion";
import { ComicPanel } from "./ComicPanel";
import { ExportButtons } from "./ExportButtons";

interface Panel {
  panelNumber: number;
  visualDescription: string;
  dialogue: string;
  soundEffect?: string | null;
  imageUrl: string;
}

interface ComicViewerProps {
  title: string;
  panels: Panel[];
  onReset: () => void;
}

export const ComicViewer = ({ title, panels, onReset }: ComicViewerProps) => {
  const comicRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Comic title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h2
          className="text-4xl md:text-5xl font-black text-comic-text uppercase tracking-tight"
          style={{
            textShadow: "3px 3px 0 hsl(var(--comic-yellow)), 6px 6px 0 hsl(var(--comic-red))",
          }}
        >
          {title}
        </h2>
      </motion.div>

      {/* Comic panels grid */}
      <div
        ref={comicRef}
        id="comic-strip"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-comic-cream rounded-2xl border-4 border-comic-text shadow-comic-lg"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--comic-text) / 0.1) 1px, transparent 1px)`,
          backgroundSize: "10px 10px",
        }}
      >
        {panels.map((panel, index) => (
          <ComicPanel
            key={panel.panelNumber}
            panelNumber={panel.panelNumber}
            imageUrl={panel.imageUrl}
            dialogue={panel.dialogue}
            soundEffect={panel.soundEffect}
            delay={index * 0.2}
          />
        ))}
      </div>

      {/* Export buttons */}
      <ExportButtons comicRef={comicRef} title={title} onReset={onReset} />
    </motion.div>
  );
};
