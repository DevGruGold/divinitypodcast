import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, Volume2, Loader2 } from "lucide-react";
import { Episode } from "@/types/godcast";
import { getCharactersByIds } from "@/data/characters";
import { CharacterAvatar } from "./CharacterAvatar";
import { ConversationTurn } from "@/types/godcast";
import { cn } from "@/lib/utils";

interface NowPlayingProps {
  episode: Episode | null;
  conversation: ConversationTurn[];
  currentTurnIndex: number;
  isPlaying: boolean;
  isGenerating: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (index: number) => void;
}

export function NowPlaying({
  episode,
  conversation,
  currentTurnIndex,
  isPlaying,
  isGenerating,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
}: NowPlayingProps) {
  if (!episode) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <p className="font-display text-lg">Select an episode to begin</p>
            <p className="text-sm mt-1">Choose from the library below</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const participants = getCharactersByIds(episode.participants);
  const currentTurn = conversation[currentTurnIndex];
  const currentSpeaker = currentTurn
    ? participants.find((p) => p.id === currentTurn.characterId)
    : null;

  const progress = conversation.length > 0
    ? ((currentTurnIndex + 1) / conversation.length) * 100
    : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardContent className="p-6">
        {/* Episode Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex -space-x-3">
            {participants.slice(0, 3).map((char, index) => (
              <CharacterAvatar
                key={char.id}
                character={char}
                size="lg"
                isActive={currentSpeaker?.id === char.id}
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl font-bold text-foreground line-clamp-1">
              {episode.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {participants.map((p) => p.name).join(" • ")}
            </p>
          </div>
        </div>

        {/* Current Speech */}
        <div className="mb-6 min-h-[120px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-[120px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm">Generating conversation...</p>
            </div>
          ) : currentTurn && currentSpeaker ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CharacterAvatar character={currentSpeaker} size="sm" isActive />
                <span className="font-display font-semibold text-primary">
                  {currentSpeaker.name}
                </span>
              </div>
              <p className="text-foreground leading-relaxed pl-10">
                "{currentTurn.content}"
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-muted-foreground">
              <p>Press play to start the conversation</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress]}
            max={100}
            step={1}
            className="cursor-pointer"
            onValueChange={(value) => {
              if (conversation.length > 0) {
                const index = Math.floor((value[0] / 100) * conversation.length);
                onSeek(Math.min(index, conversation.length - 1));
              }
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>
              {currentTurnIndex + 1} / {conversation.length || "—"}
            </span>
            <span>{episode.duration}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={currentTurnIndex === 0 || isGenerating}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full",
              isPlaying
                ? "bg-accent hover:bg-accent/90"
                : "gradient-divine hover:opacity-90"
            )}
            onClick={onPlayPause}
            disabled={isGenerating || conversation.length === 0}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={currentTurnIndex >= conversation.length - 1 || isGenerating}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
