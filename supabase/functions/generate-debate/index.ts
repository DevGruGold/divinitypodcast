import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Participant {
  id: string;
  name: string;
  era: string;
  speakingStyle: string;
  famousQuote: string;
}

interface RequestBody {
  topic: string;
  participants: Participant[];
  turnsPerParticipant?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, participants, turnsPerParticipant = 2 } = await req.json() as RequestBody;

    if (!topic || !participants || participants.length < 2) {
      throw new Error("Topic and at least 2 participants are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build participant descriptions
    const participantDescriptions = participants
      .map((p) => `- ${p.name} (${p.era}): ${p.speakingStyle}. Famous for: "${p.famousQuote}"`)
      .join("\n");

    const totalTurns = participants.length * turnsPerParticipant;

    const systemPrompt = `You are a master dialogue writer creating a philosophical debate podcast called "GodCast" where historical and fictional characters discuss profound topics.

The participants are:
${participantDescriptions}

RULES:
1. Each character MUST speak in their authentic voice and style
2. Characters should respond to and build upon what others say
3. Include moments of agreement, disagreement, and insight
4. Keep each turn to 2-3 sentences (30-50 words)
5. The conversation should feel natural, not like a series of monologues
6. Characters should reference their own philosophies and quote themselves when appropriate
7. Create intellectual tension and resolution

Generate exactly ${totalTurns} turns of dialogue, rotating through all participants.

RESPOND WITH ONLY A JSON ARRAY in this exact format:
[
  {"characterId": "character-id", "content": "What they say..."},
  {"characterId": "character-id", "content": "What they say..."}
]`;

    const userPrompt = `Create a ${totalTurns}-turn philosophical debate on this topic:

"${topic}"

Start the conversation naturally, with one character introducing the topic or posing a thought-provoking question. Then let the others respond, building a rich dialogue.`;

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please check your billing." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON response
    let conversation;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      conversation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse conversation from AI response");
    }

    // Validate and format the conversation
    const formattedConversation = conversation.map((turn: { characterId: string; content: string }, index: number) => ({
      characterId: turn.characterId,
      content: turn.content,
      timestamp: index * 5000, // 5 seconds per turn
    }));

    console.log("Generated conversation with", formattedConversation.length, "turns");

    return new Response(
      JSON.stringify({ conversation: formattedConversation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-debate function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
