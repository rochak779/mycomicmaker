import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { story, characterDescription, theme, recipient, characterImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating comic for story:", story, "Theme:", theme, "For:", recipient);

    // Build context from inputs
    const themeMap: Record<string, string> = {
      "love-story": "romantic, sweet, heartwarming moments with comedic twists",
      "birthday": "celebration, party, surprises, cake, and birthday shenanigans",
      "friends-family": "friendship, family bonds, silly moments together",
      "freestyle": "anything goes, pure comedy and creativity"
    };
    const themeContext = themeMap[theme as string] || "funny and entertaining";

    const recipientContext = recipient ? `This comic is specially made for ${recipient}. Include references or personalization for them.` : "";
    const characterImageContext = characterImages && characterImages.length > 0 
      ? `Reference images have been provided for the characters. Use these as visual inspiration for consistent character appearance.`
      : "";

    // Step 1: Expand story into 4 panels with dialogue
    const storyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a hilarious comic strip writer. Your job is to take a brief story idea and expand it into exactly 4 funny comic panels.

Theme: ${themeContext}
${recipientContext}
${characterImageContext}

For each panel, provide:
1. A visual description (what's happening in the scene, character expressions, actions)
2. Dialogue or caption (funny speech bubbles or narrator text)
3. A sound effect if applicable (like "CRASH!", "SPLAT!", "ZOOM!")

Make it FUNNY! Use visual gags, exaggerated expressions, unexpected twists, and punchy dialogue.

${characterDescription ? `Main character description: ${characterDescription}` : ""}

Respond in this exact JSON format:
{
  "title": "Comic Title Here",
  "panels": [
    {
      "panelNumber": 1,
      "visualDescription": "Detailed scene description for image generation",
      "dialogue": "Character dialogue or narration",
      "soundEffect": "OPTIONAL sound effect or null"
    },
    // ... 4 panels total
  ]
}`
          },
          {
            role: "user",
            content: `Create a 4-panel funny comic based on this story: "${story}"`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!storyResponse.ok) {
      const errorText = await storyResponse.text();
      console.error("Story generation error:", storyResponse.status, errorText);
      
      if (storyResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (storyResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Story generation failed: ${errorText}`);
    }

    const storyData = await storyResponse.json();
    const comicScript = JSON.parse(storyData.choices[0].message.content);
    
    console.log("Generated comic script:", comicScript.title);

    // Step 2: Generate images for each panel
    const panelImages: string[] = [];
    
    for (let i = 0; i < comicScript.panels.length; i++) {
      const panel = comicScript.panels[i];
      console.log(`Generating image for panel ${i + 1}...`);
      
      const imagePrompt = `Cartoon comic panel style, bright colors, bold outlines, expressive characters, funny exaggerated expressions. ${panel.visualDescription}. ${characterDescription ? `Character: ${characterDescription}` : ""} Style: Classic newspaper comic strip, halftone dots effect, vibrant and whimsical.`;
      
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: imagePrompt
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error(`Image generation error for panel ${i + 1}:`, imageResponse.status, errorText);
        
        if (imageResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded during image generation. Please try again." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`Image generation failed for panel ${i + 1}`);
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        panelImages.push(imageUrl);
        console.log(`Panel ${i + 1} image generated successfully`);
      } else {
        console.error(`No image URL in response for panel ${i + 1}`);
        // Use a placeholder for failed images
        panelImages.push("");
      }
    }

    const result = {
      title: comicScript.title,
      panels: comicScript.panels.map((panel: any, index: number) => ({
        ...panel,
        imageUrl: panelImages[index] || ""
      }))
    };

    console.log("Comic generation complete!");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Comic generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
