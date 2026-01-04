-- Create storage bucket for character portraits
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-portraits', 'character-portraits', true);

-- Allow public read access to portraits
CREATE POLICY "Character portraits are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-portraits');

-- Create table to track portrait generation
CREATE TABLE public.character_portraits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id TEXT NOT NULL UNIQUE,
  image_url TEXT,
  prompt_used TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.character_portraits ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Character portraits are viewable by everyone"
ON public.character_portraits FOR SELECT
USING (true);

-- Allow service role to insert/update (edge functions)
CREATE POLICY "Service role can manage portraits"
ON public.character_portraits FOR ALL
USING (true)
WITH CHECK (true);