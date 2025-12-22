import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Episode, ConversationTurn } from "@/types/godcast";
import { getCharactersByIds } from "@/data/characters";
import { useToast } from "@/hooks/use-toast";

export function useConversation() {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateConversation = useCallback(async (episode: Episode) => {
    setIsGenerating(true);
    setConversation([]);

    try {
      const participants = getCharactersByIds(episode.participants);

      const { data, error } = await supabase.functions.invoke("generate-debate", {
        body: {
          topic: episode.topic,
          participants: participants.map((p) => ({
            id: p.id,
            name: p.name,
            era: p.era,
            speakingStyle: p.speakingStyle,
            famousQuote: p.famousQuote,
          })),
          turnsPerParticipant: 2,
        },
      });

      if (error) throw error;

      if (data?.conversation) {
        setConversation(data.conversation);
      } else {
        throw new Error("No conversation generated");
      }
    } catch (error) {
      console.error("Error generating conversation:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate the conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  return {
    conversation,
    isGenerating,
    generateConversation,
    clearConversation,
  };
}
