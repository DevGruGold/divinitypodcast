import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Sparkles } from "lucide-react";
import { Episode } from "@/types/godcast";
import { getCharactersByIds } from "@/data/characters";
import { CharacterAvatar } from "./CharacterAvatar";
import { cn } from "@/lib/utils";

interface EpisodeCardProps {
  episode: Episode;
  onPlay: (episodeId: string) => void;
  isPlaying?: boolean;
  portraits?: Record<string, string>;
}

export function EpisodeCard({ episode, onPlay, isPlaying = false, portraits = {} }: EpisodeCardProps) {
  const participants = getCharactersByIds(episode.participants);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
        "bg-card shadow-card border-border",
        "hover:shadow-elevated hover:border-primary/20",
        isPlaying && "border-primary shadow-elevated ring-2 ring-primary/20"
      )}
    >
      {episode.isFeatured && (
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground font-medium"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {episode.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
              {episode.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Participants */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            {participants.slice(0, 4).map((char) => (
              <CharacterAvatar
                key={char.id}
                character={char}
                size="sm"
                portraitUrl={portraits[char.id]}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {participants.map((p) => p.name).join(", ")}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{episode.duration}</span>
          </div>

          <Button
            size="sm"
            onClick={() => onPlay(episode.id)}
            className={cn(
              "gap-2 transition-all font-medium",
              isPlaying
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "gradient-primary text-white hover:opacity-90"
            )}
          >
            <Play className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
            {isPlaying ? "Playing" : "Play"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
