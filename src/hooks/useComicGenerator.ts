import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Panel {
  panelNumber: number;
  visualDescription: string;
  dialogue: string;
  soundEffect?: string | null;
  imageUrl: string;
}

interface ComicResult {
  title: string;
  coverImageUrl: string;
  panels: Panel[];
}

export const useComicGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [comic, setComic] = useState<ComicResult | null>(null);

  const generateComic = async (
    story: string,
    characterDescription: string,
    theme: string,
    recipient: string,
    characterImages: string[]
  ) => {
    setIsLoading(true);
    setLoadingStep(0);
    setComic(null);

    // Get user session token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Authentication required. Please sign in to generate comics.");
      setIsLoading(false);
      return;
    }

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
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ story, characterDescription, theme, recipient, characterImages }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          toast.error("Session expired. Please sign in again.");
          return;
        }
        if (response.status === 402) {
          toast.error("Insufficient credits. Please purchase more credits or subscribe.");
          return;
        }
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
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
