import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, Loader2, Volume2 } from "lucide-react";
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
  isLoadingAudio?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (index: number) => void;
  portraits?: Record<string, string>;
}

export function NowPlaying({
  episode,
  conversation,
  currentTurnIndex,
  isPlaying,
  isGenerating,
  isLoadingAudio = false,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  portraits = {},
}: NowPlayingProps) {
  if (!episode) {
    return (
      <Card className="bg-card shadow-card border-border">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Select an episode to begin</p>
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
    <Card className="bg-card shadow-elevated border-border overflow-hidden">
      <CardContent className="p-8">
        {/* Episode Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="flex -space-x-4">
            {participants.slice(0, 3).map((char) => (
              <CharacterAvatar
                key={char.id}
                character={char}
                size="xl"
                isActive={currentSpeaker?.id === char.id}
                portraitUrl={portraits[char.id]}
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold text-foreground line-clamp-1 mb-2">
              {episode.title}
            </h2>
            <p className="text-muted-foreground">
              {participants.map((p) => p.name).join(" • ")}
            </p>
          </div>
        </div>

        {/* Current Speech */}
        <div className="mb-8 min-h-[140px] bg-muted/30 rounded-xl p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm">Generating conversation...</p>
            </div>
          ) : isLoadingAudio ? (
            <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm">Loading audio...</p>
            </div>
          ) : currentTurn && currentSpeaker ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CharacterAvatar 
                  character={currentSpeaker} 
                  size="md" 
                  isActive 
                  showSpeakingIndicator={isPlaying}
                  portraitUrl={portraits[currentSpeaker.id]}
                />
                <span className="font-semibold text-lg text-foreground">
                  {currentSpeaker.name}
                </span>
              </div>
              <p className="text-foreground/90 leading-relaxed text-lg pl-14">
                "{currentTurn.content}"
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px] text-muted-foreground">
              <p>Press play to start the conversation</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
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
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>
              Turn {currentTurnIndex + 1} of {conversation.length || "—"}
            </span>
            <span>{episode.duration}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            onClick={onPrevious}
            disabled={currentTurnIndex === 0 || isGenerating}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            className={cn(
              "h-16 w-16 rounded-full shadow-lg",
              isPlaying
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "gradient-primary hover:opacity-90"
            )}
            onClick={onPlayPause}
            disabled={isGenerating || conversation.length === 0}
          >
            {isLoadingAudio ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
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
