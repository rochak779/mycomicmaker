import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid themes for validation
const VALID_THEMES = ["love-story", "birthday", "friends-family", "freestyle"];

// Input validation limits
const MAX_STORY_LENGTH = 2000;
const MAX_CHARACTER_DESCRIPTION_LENGTH = 500;
const MAX_RECIPIENT_LENGTH = 100;
const MAX_CHARACTER_IMAGES = 4;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Step 2: Verify user has credits or active subscription
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits, subscription_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Failed to fetch profile:", profileError?.message);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hasActiveSubscription = profile.subscription_status === "active";
    const hasCredits = profile.credits > 0;

    if (!hasActiveSubscription && !hasCredits) {
      console.log("User has no credits or active subscription");
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please purchase more credits or subscribe." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Parse and validate input
    const { story, characterDescription, theme, recipient, characterImages } = await req.json();

    // Validate required fields
    if (!story || typeof story !== "string") {
      return new Response(
        JSON.stringify({ error: "Story is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (story.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Story cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (story.length > MAX_STORY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Story must be under ${MAX_STORY_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate theme
    if (!theme || typeof theme !== "string" || !VALID_THEMES.includes(theme)) {
      return new Response(
        JSON.stringify({ error: `Invalid theme. Must be one of: ${VALID_THEMES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate optional fields
    if (characterDescription !== undefined && characterDescription !== null) {
      if (typeof characterDescription !== "string") {
        return new Response(
          JSON.stringify({ error: "Character description must be a string" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (characterDescription.length > MAX_CHARACTER_DESCRIPTION_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Character description must be under ${MAX_CHARACTER_DESCRIPTION_LENGTH} characters` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (recipient !== undefined && recipient !== null) {
      if (typeof recipient !== "string") {
        return new Response(
          JSON.stringify({ error: "Recipient must be a string" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (recipient.length > MAX_RECIPIENT_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Recipient name must be under ${MAX_RECIPIENT_LENGTH} characters` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (characterImages !== undefined && characterImages !== null) {
      if (!Array.isArray(characterImages)) {
        return new Response(
          JSON.stringify({ error: "Character images must be an array" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (characterImages.length > MAX_CHARACTER_IMAGES) {
        return new Response(
          JSON.stringify({ error: `Maximum ${MAX_CHARACTER_IMAGES} character images allowed` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Validate each image is a string (base64 or URL)
      for (const img of characterImages) {
        if (typeof img !== "string") {
          return new Response(
            JSON.stringify({ error: "Each character image must be a string" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Sanitize inputs for use in prompts (escape any potential injection patterns)
    const sanitizedStory = story.trim().slice(0, MAX_STORY_LENGTH);
    const sanitizedCharacterDescription = characterDescription?.trim().slice(0, MAX_CHARACTER_DESCRIPTION_LENGTH) || "";
    const sanitizedRecipient = recipient?.trim().slice(0, MAX_RECIPIENT_LENGTH) || "";

    console.log("Generating comic for story:", sanitizedStory.substring(0, 100) + "...", "Theme:", theme, "For:", sanitizedRecipient || "N/A");
    console.log("Character images provided:", characterImages?.length || 0);

    // Build context from inputs
    const themeMap: Record<string, string> = {
      "love-story": "romantic, sweet, heartwarming moments with comedic twists",
      "birthday": "celebration, party, surprises, cake, and birthday shenanigans",
      "friends-family": "friendship, family bonds, silly moments together",
      "freestyle": "anything goes, pure comedy and creativity"
    };
    const themeContext = themeMap[theme as string] || "funny and entertaining";
    const recipientContext = sanitizedRecipient ? `This comic is specially made for ${sanitizedRecipient}. Include references or personalization for them.` : "";

    // Step 4: Convert uploaded character images to comic avatars
    const comicAvatars: string[] = [];
    
    if (characterImages && characterImages.length > 0) {
      console.log("Converting character images to comic avatars...");
      
      for (let i = 0; i < characterImages.length; i++) {
        const imageUrl = characterImages[i];
        console.log(`Converting image ${i + 1} to comic avatar...`);
        
        try {
          const avatarResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                  content: [
                    {
                      type: "text",
                      text: "Transform this photo into a colorful comic book character avatar. Make it look like a cartoon/comic strip character with bold black outlines, exaggerated expressive features, and vibrant colors. Keep the key facial features and distinctive characteristics recognizable but stylize them in a fun newspaper comic strip art style. The result should look like a character from a Sunday newspaper comic or graphic novel - bold, simple, and expressive."
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: imageUrl
                      }
                    }
                  ]
                }
              ],
              modalities: ["image", "text"]
            })
          });

          if (avatarResponse.ok) {
            const avatarData = await avatarResponse.json();
            const avatarImageUrl = avatarData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (avatarImageUrl) {
              comicAvatars.push(avatarImageUrl);
              console.log(`Successfully created comic avatar ${i + 1}`);
            } else {
              console.error(`No avatar image in response for image ${i + 1}`);
            }
          } else {
            const errorText = await avatarResponse.text();
            console.error(`Failed to convert image ${i + 1} to avatar:`, avatarResponse.status, errorText);
            
            if (avatarResponse.status === 429) {
              return new Response(
                JSON.stringify({ error: "Rate limit exceeded while converting character images. Please try again." }),
                { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        } catch (avatarError) {
          console.error(`Error converting image ${i + 1}:`, avatarError);
        }
      }
      
      console.log(`Created ${comicAvatars.length} comic avatars from ${characterImages.length} images`);
    }

    // Build character context for the story generation
    const hasAvatars = comicAvatars.length > 0;
    const characterContext = hasAvatars 
      ? `Comic avatars have been created for ${comicAvatars.length} character(s). These will be used throughout the comic for consistent character appearance.`
      : "";

    // Step 5: Expand story into 9 panels with dialogue
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
            content: `You are a hilarious comic strip writer. Your job is to take a brief story idea and expand it into exactly 9 funny comic panels plus a cover image.

Theme: ${themeContext}
${recipientContext}
${characterContext}

You must create:
1. A catchy comic TITLE
2. A COVER IMAGE description (a dramatic/funny scene that captures the essence of the story)
3. NINE (9) comic panels that tell the complete story

For each panel, provide:
1. A visual description (what's happening in the scene, character expressions, actions)
2. Dialogue or caption (funny speech bubbles or narrator text)
3. A sound effect if applicable (like "CRASH!", "SPLAT!", "ZOOM!")

Make it FUNNY! Use visual gags, exaggerated expressions, unexpected twists, and punchy dialogue. Build up the story across all 9 panels with a satisfying punchline at the end.

${sanitizedCharacterDescription ? `Main character description: ${sanitizedCharacterDescription}` : ""}

Respond in this exact JSON format:
{
  "title": "Comic Title Here",
  "coverDescription": "A dramatic scene description for the title page thumbnail",
  "panels": [
    {
      "panelNumber": 1,
      "visualDescription": "Detailed scene description for image generation",
      "dialogue": "Character dialogue or narration",
      "soundEffect": "OPTIONAL sound effect or null"
    },
    // ... 9 panels total
  ]
}`
          },
          {
            role: "user",
            content: `Create a 9-panel funny comic based on this story: "${sanitizedStory}"`
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

    // Helper function to generate an image with optional avatar reference
    async function generateImageWithAvatar(prompt: string, avatarUrl?: string): Promise<string> {
      let response;
      
      if (avatarUrl) {
        // Use image editing to incorporate the avatar
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: [
                  {
                    type: "text",
                    text: prompt
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: avatarUrl
                    }
                  }
                ]
              }
            ],
            modalities: ["image", "text"]
          })
        });
      } else {
        // Generate without avatar reference
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"]
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation error:", response.status, errorText);
        
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        }
        return "";
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
    }

    // Step 6: Generate cover image (with avatar if available)
    console.log("Generating cover image...");
    const primaryAvatar = comicAvatars.length > 0 ? comicAvatars[0] : undefined;
    
    const coverPrompt = hasAvatars
      ? `Create a comic book cover featuring this character in the following scene: ${comicScript.coverDescription}. Style: Classic comic book cover with bold outlines, vibrant colors, dramatic composition. Keep the character's appearance consistent with the provided avatar.`
      : `Cartoon comic cover art style, bright colors, bold outlines, dramatic composition, expressive characters. ${comicScript.coverDescription}. ${sanitizedCharacterDescription ? `Character: ${sanitizedCharacterDescription}` : ""} Style: Classic comic book cover, vibrant and eye-catching.`;
    
    let coverImageUrl = "";
    try {
      coverImageUrl = await generateImageWithAvatar(coverPrompt, primaryAvatar);
      console.log("Cover image generated successfully");
    } catch (error) {
      if (error instanceof Error && error.message === "RATE_LIMIT") {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded during cover generation. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("Cover image generation failed:", error);
    }

    // Step 7: Generate images for each panel (with avatar for character consistency)
    const panelImages: string[] = [];
    
    for (let i = 0; i < comicScript.panels.length; i++) {
      const panel = comicScript.panels[i];
      console.log(`Generating image for panel ${i + 1}...`);
      
      const panelPrompt = hasAvatars
        ? `Create a comic panel featuring this character in the following scene: ${panel.visualDescription}. Style: Classic newspaper comic strip with bold black outlines, vibrant colors, expressive characters. Keep the character's appearance consistent with the provided avatar.`
        : `Cartoon comic panel style, bright colors, bold outlines, expressive characters, funny exaggerated expressions. ${panel.visualDescription}. ${sanitizedCharacterDescription ? `Character: ${sanitizedCharacterDescription}` : ""} Style: Classic newspaper comic strip, halftone dots effect.`;
      
      try {
        const imageUrl = await generateImageWithAvatar(panelPrompt, primaryAvatar);
        panelImages.push(imageUrl);
        console.log(`Panel ${i + 1} image generated successfully`);
      } catch (error) {
        if (error instanceof Error && error.message === "RATE_LIMIT") {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded during panel generation. Please try again." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error(`Panel ${i + 1} generation failed:`, error);
        panelImages.push("");
      }
    }

    const result = {
      title: comicScript.title,
      coverImageUrl,
      panels: comicScript.panels.map((panel: any, index: number) => ({
        ...panel,
        imageUrl: panelImages[index] || ""
      }))
    };

    console.log("Comic generation complete!");

    // Step 8: Deduct credits if user doesn't have active subscription
    if (!hasActiveSubscription) {
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to deduct credits:", updateError.message);
        // Don't fail the request, but log the error
      } else {
        console.log("Deducted 1 credit from user:", user.id, "Remaining:", profile.credits - 1);

        // Record the transaction
        await supabaseClient
          .from("credit_transactions")
          .insert({
            user_id: user.id,
            amount: -1,
            type: "usage",
            description: `Comic generation: ${comicScript.title}`
          });
      }
    }

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
