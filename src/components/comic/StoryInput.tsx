import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";

interface StoryInputProps {
  onSubmit: (story: string, characterDescription: string) => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "A penguin interviews for a corporate job but keeps sliding on the office floor",
  "A cat tries to steal pizza from a sleeping dog",
  "A superhero's cape gets stuck in a revolving door",
  "An alien tries to blend in at a coffee shop but orders very wrong",
];

export const StoryInput = ({ onSubmit, isLoading }: StoryInputProps) => {
  const [story, setStory] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (story.trim()) {
      onSubmit(story, characterDescription);
    }
  };

  const useExample = () => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setStory(randomPrompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-lg font-bold text-comic-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-comic-yellow" />
            Your Story Idea
          </label>
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="A penguin interviews for a corporate job but keeps sliding on the office floor..."
            className="min-h-[120px] text-lg border-4 border-comic-text rounded-xl bg-white shadow-comic focus:ring-4 focus:ring-comic-yellow transition-all"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={useExample}
            className="text-comic-blue hover:text-comic-blue/80"
            disabled={isLoading}
          >
            <Wand2 className="w-4 h-4 mr-1" /> Try a random example
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-comic-text">
            Character Description (Optional)
          </label>
          <Input
            value={characterDescription}
            onChange={(e) => setCharacterDescription(e.target.value)}
            placeholder="A grumpy orange cat with a tiny top hat..."
            className="border-2 border-comic-text/50 rounded-lg bg-white"
            disabled={isLoading}
          />
        </div>

        <motion.div
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          <Button
            type="submit"
            disabled={!story.trim() || isLoading}
            className="w-full h-16 text-xl font-black bg-comic-red hover:bg-comic-red/90 text-white border-4 border-comic-text rounded-xl shadow-comic transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ✨
                </motion.span>
                Creating Magic...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🎨</span> Create My Comic!
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
