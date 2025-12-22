import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Character } from "@/types/godcast";
import { cn } from "@/lib/utils";

interface CharacterAvatarProps {
  character: Character;
  size?: "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
  isActive?: boolean;
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
}: CharacterAvatarProps) {
  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        "transition-all duration-300",
        showRing && "ring-2 ring-primary/50",
        isActive && "ring-2 ring-accent glow-accent scale-110"
      )}
      style={{
        background: character.color,
      }}
    >
      {character.avatarUrl && (
        <AvatarImage src={character.avatarUrl} alt={character.name} />
      )}
      <AvatarFallback
        className="font-display font-bold text-primary-foreground"
        style={{ backgroundColor: character.color }}
      >
        {character.avatarInitials}
      </AvatarFallback>
    </Avatar>
  );
}
