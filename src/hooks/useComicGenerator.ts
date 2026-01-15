import { useState } from "react";
import { toast } from "sonner";

interface Panel {
  panelNumber: number;
  visualDescription: string;
  dialogue: string;
  soundEffect?: string | null;
  imageUrl: string;
}

interface ComicResult {
  title: string;
  panels: Panel[];
}

export const useComicGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [comic, setComic] = useState<ComicResult | null>(null);

  const generateComic = async (story: string, characterDescription: string) => {
    setIsLoading(true);
    setLoadingStep(0);
    setComic(null);

    // Simulate step progression for better UX
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, 5));
    }, 3000);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-comic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ story, characterDescription }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
          return;
        }
        if (response.status === 402) {
          toast.error("AI credits exhausted. Please add more credits to continue.");
          return;
        }
        
        throw new Error(errorData.error || "Failed to generate comic");
      }

      const result = await response.json();
      setComic(result);
      toast.success("Your comic is ready! 🎉");
    } catch (error) {
      console.error("Error generating comic:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate comic. Please try again.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const reset = () => {
    setComic(null);
  };

  return {
    isLoading,
    loadingStep,
    comic,
    generateComic,
    reset,
  };
};
