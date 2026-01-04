import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PortraitData {
  character_id: string;
  image_url: string | null;
}

export function useCharacterPortraits() {
  const [portraits, setPortraits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortraits = async () => {
      const { data, error } = await supabase
        .from('character_portraits')
        .select('character_id, image_url')
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching portraits:', error);
      } else if (data) {
        const portraitMap: Record<string, string> = {};
        data.forEach((p: PortraitData) => {
          if (p.image_url) {
            portraitMap[p.character_id] = p.image_url;
          }
        });
        setPortraits(portraitMap);
      }
      setLoading(false);
    };

    fetchPortraits();
  }, []);

  const getPortraitUrl = (characterId: string): string | undefined => {
    return portraits[characterId];
  };

  return { portraits, loading, getPortraitUrl };
}
