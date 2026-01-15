import { motion } from "framer-motion";

interface ComicPanelProps {
  panelNumber: number;
  imageUrl: string;
  dialogue: string;
  soundEffect?: string | null;
  delay?: number;
}

export const ComicPanel = ({
  panelNumber,
  imageUrl,
  dialogue,
  soundEffect,
  delay = 0,
}: ComicPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-white border-4 border-comic-text rounded-lg overflow-hidden shadow-comic"
    >
      {/* Panel number badge */}
      <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-comic-yellow border-2 border-comic-text rounded-full flex items-center justify-center font-black text-comic-text">
        {panelNumber}
      </div>

      {/* Sound effect */}
      {soundEffect && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 500 }}
          className="absolute top-2 right-2 z-10 px-3 py-1 bg-comic-red text-white font-black text-lg rounded-lg border-2 border-comic-text transform rotate-[-5deg]"
          style={{ textShadow: "2px 2px 0 black" }}
        >
          {soundEffect}
        </motion.div>
      )}

      {/* Image */}
      <div className="aspect-square bg-comic-blue/10 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Comic panel ${panelNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🎨</div>
        )}
      </div>

      {/* Dialogue bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.4 }}
        className="p-3 bg-white border-t-4 border-comic-text"
      >
        <div className="relative bg-white border-2 border-comic-text rounded-xl p-3 text-sm font-medium text-comic-text">
          {/* Speech bubble tail */}
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l-2 border-t-2 border-comic-text transform rotate-45" />
          <p className="relative z-10">{dialogue}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
