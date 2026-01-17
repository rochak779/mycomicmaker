import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("Session ID is required");
    logStep("Session ID received", { session_id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { status: session.payment_status, mode: session.mode });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, message: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify this session belongs to the user
    if (session.client_reference_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    const productType = session.metadata?.product_type;
    logStep("Processing payment", { productType });

    if (productType === "credits") {
      // Add 5 credits
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      const newCredits = (profile?.credits ?? 0) + 5;
      
      await supabaseClient
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", user.id);

      // Log transaction
      await supabaseClient
        .from("credit_transactions")
        .insert({
          user_id: user.id,
          amount: 5,
          type: "purchase",
          description: "Purchased 5 credit pack",
          stripe_payment_id: session.payment_intent as string,
        });

      logStep("Credits added", { newCredits });
    } else if (productType === "subscription") {
      // Update subscription status
      await supabaseClient
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", user.id);

      logStep("Subscription activated");
    }

    // Update stripe_customer_id if needed
    if (session.customer) {
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: session.customer as string })
        .eq("id", user.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      product_type: productType,
      message: productType === "credits" ? "5 credits added!" : "Subscription activated!" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
