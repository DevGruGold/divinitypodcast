import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Character } from "@/types/godcast";
import { cn } from "@/lib/utils";

interface CharacterAvatarProps {
  character: Character;
  size?: "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
  isActive?: boolean;
  showSpeakingIndicator?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function CharacterAvatar({
  character,
  size = "md",
  showRing = false,
  isActive = false,
  showSpeakingIndicator = false,
}: CharacterAvatarProps) {
  return (
    <div className="relative">
      <Avatar
        className={cn(
          sizeClasses[size],
          "transition-all duration-300 border-2 border-background",
          showRing && "ring-2 ring-primary/30",
          isActive && "ring-2 ring-primary scale-105",
          showSpeakingIndicator && isActive && "speaking-glow"
        )}
        style={{
          background: character.color,
        }}
      >
        {character.avatarUrl && (
          <AvatarImage src={character.avatarUrl} alt={character.name} className="object-cover" />
        )}
        <AvatarFallback
          className="font-bold text-white"
          style={{ backgroundColor: character.color }}
        >
          {character.avatarInitials}
        </AvatarFallback>
      </Avatar>
      
      {/* Speaking indicator dot */}
      {showSpeakingIndicator && isActive && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background live-pulse" />
      )}
    </div>
  );
}
