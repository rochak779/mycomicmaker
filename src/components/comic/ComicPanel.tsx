import { motion } from "framer-motion";

interface ComicPanelProps {
  panelNumber: number;
  imageUrl: string;
  dialogue: string;
  soundEffect?: string | null;
  delay?: number;
  compact?: boolean;
}

export const ComicPanel = ({
  panelNumber,
  imageUrl,
  dialogue,
  soundEffect,
  delay = 0,
  compact = false,
}: ComicPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative bg-white border-2 ${compact ? 'border-2' : 'border-4'} border-comic-text rounded-lg overflow-hidden shadow-comic`}
    >
      {/* Panel number badge */}
      <div className={`absolute top-1 left-1 z-10 ${compact ? 'w-5 h-5 text-xs' : 'w-8 h-8 text-sm'} bg-comic-yellow border-2 border-comic-text rounded-full flex items-center justify-center font-black text-comic-text`}>
        {panelNumber}
      </div>

      {/* Sound effect */}
      {soundEffect && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 500 }}
          className={`absolute top-1 right-1 z-10 px-1.5 py-0.5 bg-comic-red text-white font-black ${compact ? 'text-xs' : 'text-sm'} rounded border border-comic-text transform rotate-[-5deg]`}
          style={{ textShadow: "1px 1px 0 black" }}
        >
          {soundEffect}
        </motion.div>
      )}

      {/* Image */}
      <div className={`${compact ? 'aspect-square' : 'aspect-square'} bg-comic-blue/10 flex items-center justify-center overflow-hidden`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Comic panel ${panelNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={compact ? "text-3xl" : "text-6xl"}>🎨</div>
        )}
      </div>

      {/* Dialogue bubble */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3 }}
        className={`${compact ? 'p-1.5' : 'p-3'} bg-white border-t-2 border-comic-text`}
      >
        <div className={`relative bg-white border border-comic-text rounded-lg ${compact ? 'p-1.5 text-xs' : 'p-2 text-sm'} font-medium text-comic-text`}>
          {/* Speech bubble tail */}
          <div className={`absolute -top-1.5 left-2 w-2 h-2 bg-white border-l border-t border-comic-text transform rotate-45`} />
          <p className="relative z-10 line-clamp-2">{dialogue}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
