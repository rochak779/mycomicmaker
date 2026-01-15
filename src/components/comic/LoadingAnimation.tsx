import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface LoadingAnimationProps {
  currentStep: number;
}

const STEPS = [
  { text: "Writing your story...", emoji: "✍️" },
  { text: "Drawing panel 1...", emoji: "🎨" },
  { text: "Drawing panel 2...", emoji: "🖌️" },
  { text: "Drawing panel 3...", emoji: "🖼️" },
  { text: "Drawing panel 4...", emoji: "🎭" },
  { text: "Adding punchlines...", emoji: "💥" },
];

const COMIC_WORDS = ["POW!", "ZAP!", "BOOM!", "WHAM!", "SPLASH!", "KABOOM!"];

export const LoadingAnimation = ({ currentStep }: LoadingAnimationProps) => {
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto text-center space-y-8"
    >
      {/* Floating comic words */}
      <div className="relative h-24">
        {COMIC_WORDS.map((word, index) => (
          <motion.span
            key={word}
            className="absolute font-black text-2xl"
            style={{
              left: `${15 + (index * 15)}%`,
              color: index % 2 === 0 ? "hsl(var(--comic-red))" : "hsl(var(--comic-blue))",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 0],
              y: [20, -20, -40],
              rotate: [0, -10, 10],
            }}
            transition={{
              duration: 2,
              delay: index * 0.3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Current step */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center gap-3 text-xl font-bold text-comic-text"
      >
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-3xl"
        >
          {step.emoji}
        </motion.span>
        {step.text}
      </motion.div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-4 border-2 border-comic-text" />
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </div>

      {/* Bouncing dots */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-comic-yellow border-2 border-comic-text"
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
