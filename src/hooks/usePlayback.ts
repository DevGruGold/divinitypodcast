import { useState, useCallback, useEffect, useRef } from "react";
import { ConversationTurn } from "@/types/godcast";

export function usePlayback(conversation: ConversationTurn[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance through turns when playing
  useEffect(() => {
    if (isPlaying && conversation.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTurnIndex((prev) => {
          if (prev >= conversation.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 5000); // 5 seconds per turn
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, conversation.length]);

  const play = useCallback(() => {
    if (conversation.length > 0) {
      setIsPlaying(true);
    }
  }, [conversation.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (currentTurnIndex < conversation.length - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    }
  }, [currentTurnIndex, conversation.length]);

  const previous = useCallback(() => {
    if (currentTurnIndex > 0) {
      setCurrentTurnIndex((prev) => prev - 1);
    }
  }, [currentTurnIndex]);

  const seek = useCallback((index: number) => {
    if (index >= 0 && index < conversation.length) {
      setCurrentTurnIndex(index);
    }
  }, [conversation.length]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTurnIndex(0);
  }, []);

  return {
    isPlaying,
    currentTurnIndex,
    play,
    pause,
    togglePlayPause,
    next,
    previous,
    seek,
    reset,
  };
}
