import { Character } from "@/types/godcast";
import { cn } from "@/lib/utils";

interface CharacterPortraitProps {
  character: Character;
  portraitUrl?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showQuote?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-24 h-32",
  md: "w-40 h-52",
  lg: "w-56 h-72",
};

export function CharacterPortrait({
  character,
  portraitUrl,
  size = "md",
  showName = true,
  showQuote = false,
  className,
}: CharacterPortraitProps) {
  const imageUrl = portraitUrl || character.avatarUrl;

  return (
    <div className={cn("group relative", className)}>
      {/* Renaissance-style frame */}
      <div 
        className={cn(
          sizeClasses[size],
          "relative rounded-sm overflow-hidden",
          "ring-4 ring-amber-900/40 shadow-xl",
          "bg-gradient-to-b from-amber-900/20 to-amber-950/40"
        )}
      >
        {/* Portrait image or fallback */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: character.color }}
          >
            <span className="text-4xl font-bold text-white/80">
              {character.avatarInitials}
            </span>
          </div>
        )}

        {/* Vignette overlay for vintage effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] pointer-events-none" />

        {/* Name overlay */}
        {showName && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white font-serif text-sm font-medium truncate">
              {character.name}
            </h3>
            <p className="text-white/60 text-xs truncate">{character.era}</p>
          </div>
        )}

        {/* Quote on hover */}
        {showQuote && (
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-center justify-center">
            <p className="text-white/90 text-sm italic text-center leading-relaxed">
              "{character.famousQuote}"
            </p>
          </div>
        )}
      </div>

      {/* Frame corners - decorative */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-700/60" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-700/60" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-700/60" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-700/60" />
    </div>
  );
}
