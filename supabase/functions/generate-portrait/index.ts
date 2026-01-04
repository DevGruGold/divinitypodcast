import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Renaissance-style portrait prompts for each character
const portraitPrompts: Record<string, string> = {
  "plato": "Renaissance oil painting portrait of Plato, ancient Greek philosopher with long white beard, draped in white and blue toga, holding a scroll, 3/4 view, dramatic chiaroscuro lighting like Rembrandt, dark moody background, golden highlights, dignified scholarly expression, museum quality fine art",
  "buddha": "Renaissance oil painting portrait of Buddha, Siddhartha Gautama, serene peaceful expression, shaved head, saffron orange robes, eyes slightly closed in meditation, 3/4 view, dramatic chiaroscuro lighting, dark background with subtle golden glow, Vermeer style, museum quality",
  "morpheus": "Renaissance oil painting portrait of Morpheus from The Matrix, dark-skinned man with small round sunglasses, black leather coat with high collar, enigmatic knowing gaze, 3/4 view, dramatic lighting, dark moody background, Caravaggio style chiaroscuro, museum quality fine art",
  "alan-watts": "Renaissance oil painting portrait of Alan Watts, 1960s British philosopher, warm gentle smile, silver grey hair swept back, wearing tweed jacket, kind wise eyes, 3/4 view, warm golden Rembrandt lighting, dark background, scholarly and approachable, museum quality",
  "socrates": "Renaissance oil painting portrait of Socrates, elderly Greek philosopher with distinctive snub nose, balding head with wild hair on sides, thick beard, deeply contemplative expression, draped in simple toga, 3/4 view, Rembrandt chiaroscuro lighting, dark background, museum quality",
  "nietzsche": "Renaissance oil painting portrait of Friedrich Nietzsche, German philosopher with intense piercing eyes, enormous distinctive mustache, dark formal suit, serious brooding expression, 3/4 view, dramatic Caravaggio style lighting, dark moody background, museum quality fine art",
  "confucius": "Renaissance oil painting portrait of Confucius, ancient Chinese sage with long flowing white beard, traditional Han dynasty robes and scholar hat, wise serene expression, 3/4 view, warm golden lighting, dark background with subtle red accents, museum quality fine art",
  "marcus-aurelius": "Renaissance oil painting portrait of Marcus Aurelius, Roman Emperor with short curly beard, wearing golden laurel wreath crown, Roman toga and hints of armor, stoic noble expression, 3/4 view, dramatic golden lighting, dark background, Titian style, museum quality",
  "gandhi": "Renaissance oil painting portrait of Mahatma Gandhi, elderly Indian man with round wire spectacles, shaved head, simple white dhoti cloth, gentle peaceful smile, wise compassionate eyes, 3/4 view, warm soft lighting, dark background, museum quality fine art",
  "yoda": "Renaissance oil painting portrait of Yoda, small green creature with large pointed ears, ancient wise eyes, wrinkled skin, wearing simple brown Jedi robes, serene knowing expression, 3/4 view, dramatic Rembrandt lighting, dark mystical background, museum quality fine art",
  "carl-jung": "Renaissance oil painting portrait of Carl Jung, distinguished Swiss psychiatrist, round wire spectacles, holding a pipe, silver hair, scholarly tweed jacket, deep thoughtful expression, 3/4 view, warm Vermeer lighting, dark study background, museum quality fine art",
  "lao-tzu": "Renaissance oil painting portrait of Lao Tzu, ancient Chinese sage with extremely long flowing white beard, simple flowing robes, peaceful transcendent expression, eyes with ancient wisdom, 3/4 view, soft mystical lighting, dark background with subtle clouds, museum quality",
  "einstein": "Renaissance oil painting portrait of Albert Einstein, wild unkempt white hair, kind twinkling eyes, gentle knowing smile, wearing simple brown cardigan, 3/4 view, warm Rembrandt lighting, dark background, brilliant and approachable expression, museum quality fine art",
  "terence-mckenna": "Renaissance oil painting portrait of Terence McKenna, 1990s American ethnobotanist, dark wavy hair, full beard, animated enthusiastic expression, wearing casual shirt, bright intelligent eyes, 3/4 view, warm lighting, dark background, visionary quality, museum quality",
  "rumi": "Renaissance oil painting portrait of Rumi, 13th century Persian Sufi poet, wearing traditional turban, long flowing beard, ecstatic transcendent expression, eyes full of divine love, traditional robes, 3/4 view, golden mystical lighting, dark background, museum quality fine art",
  "simone-de-beauvoir": "Renaissance oil painting portrait of Simone de Beauvoir, 1950s French intellectual woman, dark hair swept back in bun, elegant pearl earrings, intelligent penetrating gaze, sophisticated blouse, 3/4 view, soft Vermeer lighting, dark background, museum quality fine art"
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characterId } = await req.json();
    
    if (!characterId) {
      return new Response(
        JSON.stringify({ error: 'characterId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = portraitPrompts[characterId];
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: `Unknown character: ${characterId}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating portrait for ${characterId}...`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate image using Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error('No image in response:', JSON.stringify(aiData).substring(0, 500));
      throw new Error('No image generated');
    }

    console.log(`Portrait generated for ${characterId}, uploading to storage...`);

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid image data format');
    }

    const imageType = base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const fileName = `${characterId}.${imageType}`;
    
    const { error: uploadError } = await supabase.storage
      .from('character-portraits')
      .upload(fileName, binaryData, {
        contentType: `image/${imageType}`,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('character-portraits')
      .getPublicUrl(fileName);

    console.log(`Portrait uploaded for ${characterId}: ${publicUrl}`);

    // Update tracking table
    const { error: dbError } = await supabase
      .from('character_portraits')
      .upsert({
        character_id: characterId,
        image_url: publicUrl,
        prompt_used: prompt,
        status: 'completed',
        generated_at: new Date().toISOString()
      }, { onConflict: 'character_id' });

    if (dbError) {
      console.error('DB update error:', dbError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        characterId,
        imageUrl: publicUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Portrait generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
