export interface Character {
  id: string;
  name: string;
  era: string;
  description: string;
  famousQuote: string;
  speakingStyle: string;
  avatarUrl?: string;
  avatarInitials: string;
  color: string;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  topic: string;
  participants: string[]; // Character IDs
  duration: string;
  thumbnailUrl?: string;
  createdAt: string;
  isFeatured?: boolean;
}

export interface ConversationTurn {
  characterId: string;
  content: string;
  timestamp: number;
}

export interface GeneratedEpisode {
  episodeId: string;
  topic: string;
  participants: Character[];
  conversation: ConversationTurn[];
  audioUrl?: string;
  videoUrl?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentEpisodeId: string | null;
  currentTurnIndex: number;
  progress: number;
}
