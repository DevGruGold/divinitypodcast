import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationTurn } from "@/types/godcast";
import { getVoiceIdForCharacter } from "@/data/characters";

interface AudioPlaybackState {
  isLoading: boolean;
  isPlaying: boolean;
  currentTurnIndex: number;
  audioQueue: Map<number, string>; // index -> audio URL
  error: string | null;
}

export function useAudioPlayback(conversation: ConversationTurn[]) {
  const [state, setState] = useState<AudioPlaybackState>({
    isLoading: false,
    isPlaying: false,
    currentTurnIndex: 0,
    audioQueue: new Map(),
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadingRef = useRef<Set<number>>(new Set());

  // Generate TTS for a specific turn
  const generateTTS = useCallback(async (turn: ConversationTurn, index: number): Promise<string | null> => {
    if (state.audioQueue.has(index) || preloadingRef.current.has(index)) {
      return state.audioQueue.get(index) || null;
    }

    preloadingRef.current.add(index);

    try {
      const voiceId = getVoiceIdForCharacter(turn.characterId);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: turn.content,
            voiceId,
            characterId: turn.characterId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      setState(prev => ({
        ...prev,
        audioQueue: new Map(prev.audioQueue).set(index, audioUrl),
      }));

      return audioUrl;
    } catch (error) {
      console.error(`Error generating TTS for turn ${index}:`, error);
      return null;
    } finally {
      preloadingRef.current.delete(index);
    }
  }, [state.audioQueue]);

  // Preload next audio
  const preloadNext = useCallback(async (currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < conversation.length && !state.audioQueue.has(nextIndex)) {
      await generateTTS(conversation[nextIndex], nextIndex);
    }
  }, [conversation, generateTTS, state.audioQueue]);

  // Play a specific turn
  const playTurn = useCallback(async (index: number) => {
    if (index >= conversation.length || index < 0) return;

    setState(prev => ({ ...prev, isLoading: true, currentTurnIndex: index }));

    let audioUrl = state.audioQueue.get(index);
    
    if (!audioUrl) {
      audioUrl = await generateTTS(conversation[index], index);
    }

    if (!audioUrl) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to generate audio" 
      }));
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      const nextIndex = index + 1;
      if (nextIndex < conversation.length && state.isPlaying) {
        playTurn(nextIndex);
      } else {
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Audio playback error" 
      }));
    };

    audio.onplay = () => {
      setState(prev => ({ ...prev, isLoading: false, isPlaying: true }));
      // Preload next audio
      preloadNext(index);
    };

    try {
      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to play audio" 
      }));
    }
  }, [conversation, generateTTS, preloadNext, state.audioQueue, state.isPlaying]);

  // Control functions
  const play = useCallback(() => {
    if (conversation.length === 0) return;
    setState(prev => ({ ...prev, isPlaying: true }));
    playTurn(state.currentTurnIndex);
  }, [conversation.length, playTurn, state.currentTurnIndex]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, pause, play]);

  const next = useCallback(() => {
    const nextIndex = state.currentTurnIndex + 1;
    if (nextIndex < conversation.length) {
      playTurn(nextIndex);
    }
  }, [state.currentTurnIndex, conversation.length, playTurn]);

  const previous = useCallback(() => {
    const prevIndex = state.currentTurnIndex - 1;
    if (prevIndex >= 0) {
      playTurn(prevIndex);
    }
  }, [state.currentTurnIndex, playTurn]);

  const seek = useCallback((index: number) => {
    if (index >= 0 && index < conversation.length) {
      playTurn(index);
    }
  }, [conversation.length, playTurn]);

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    preloadingRef.current.clear();
    setState({
      isLoading: false,
      isPlaying: false,
      currentTurnIndex: 0,
      audioQueue: new Map(),
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Reset when conversation changes
  useEffect(() => {
    reset();
  }, [conversation.length === 0]);

  return {
    isLoading: state.isLoading,
    isPlaying: state.isPlaying,
    currentTurnIndex: state.currentTurnIndex,
    error: state.error,
    play,
    pause,
    togglePlayPause,
    next,
    previous,
    seek,
    reset,
  };
}
