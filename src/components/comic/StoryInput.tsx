import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Upload, X, Heart, Cake, Users, Pencil } from "lucide-react";

interface StoryInputProps {
  onSubmit: (story: string, characterDescription: string, theme: string, recipient: string, characterImages: string[]) => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "A penguin interviews for a corporate job but keeps sliding on the office floor",
  "A cat tries to steal pizza from a sleeping dog",
  "A superhero's cape gets stuck in a revolving door",
  "An alien tries to blend in at a coffee shop but orders very wrong",
];

const THEME_OPTIONS = [
  { id: "love-story", label: "Love Story", icon: Heart, color: "text-pink-500" },
  { id: "birthday", label: "Birthday", icon: Cake, color: "text-comic-yellow" },
  { id: "friends-family", label: "Friends/Family", icon: Users, color: "text-comic-blue" },
  { id: "freestyle", label: "Freestyle", icon: Pencil, color: "text-comic-green" },
];

export const StoryInput = ({ onSubmit, isLoading }: StoryInputProps) => {
  const [story, setStory] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [recipient, setRecipient] = useState("");
  const [characterImages, setCharacterImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (story.trim() && theme) {
      onSubmit(story, characterDescription, theme, recipient, characterImages);
    }
  };

  const useExample = () => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setStory(randomPrompt);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 4 - characterImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacterImages((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setCharacterImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question 1: Theme */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-comic-text flex items-center gap-2">
            <span className="bg-comic-red text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
            What's this comic about?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  disabled={isLoading}
                  className={`p-4 rounded-xl border-4 transition-all flex items-center gap-3 ${
                    isSelected
                      ? "border-comic-text bg-comic-yellow/20 shadow-comic"
                      : "border-comic-text/30 bg-white hover:border-comic-text/60"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${option.color}`} />
                  <span className="font-bold text-comic-text">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: Recipient */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-comic-text flex items-center gap-2">
            <span className="bg-comic-blue text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
            Who is this comic for?
          </label>
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g. John, Sarah, Dad"
            className="border-4 border-comic-text/50 rounded-xl bg-white text-lg p-4 h-auto focus:border-comic-text transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Question 3: Character Description */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-comic-text flex items-center gap-2">
            <span className="bg-comic-green text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
            Character Description
            <span className="text-sm font-normal text-comic-text/60">(Optional)</span>
          </label>
          
          <div className="space-y-4 p-4 bg-white rounded-xl border-4 border-comic-text/30">
            {/* Option 1: Upload pictures */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-comic-text/80">Option 1: Upload pictures (up to 4)</p>
              <div className="flex flex-wrap gap-3">
                {characterImages.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-comic-text">
                    <img src={img} alt={`Character ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-comic-red text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {characterImages.length < 4 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-comic-text/40 flex flex-col items-center justify-center cursor-pointer hover:border-comic-text/70 transition-all bg-comic-cream/50">
                    <Upload className="w-5 h-5 text-comic-text/60" />
                    <span className="text-xs text-comic-text/60 mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-comic-text/20" />
              <span className="text-sm text-comic-text/50 font-medium">OR</span>
              <div className="flex-1 h-px bg-comic-text/20" />
            </div>

            {/* Option 2: Text description */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-comic-text/80">Option 2: Describe your character</p>
              <Input
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                placeholder="A grumpy orange cat with a tiny top hat..."
                className="border-2 border-comic-text/30 rounded-lg bg-comic-cream/30"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Question 4: Story */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-comic-text flex items-center gap-2">
            <span className="bg-comic-yellow text-comic-text w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
            <Sparkles className="w-5 h-5 text-comic-yellow" />
            What is the story?
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

        <motion.div
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          <Button
            type="submit"
            disabled={!story.trim() || !theme || isLoading}
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
