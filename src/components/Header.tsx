import { Button } from "@/components/ui/button";
import { Sparkles, Video, BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl gradient-divine flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 rounded-xl gradient-divine opacity-50 blur-md -z-10" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-gradient">
              GodCast
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Divine Conversations
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            Episodes
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Video className="h-4 w-4 mr-2" />
            Video Studio
          </Button>
        </nav>

        {/* CTA */}
        <Button size="sm" className="gradient-divine hover:opacity-90 text-primary-foreground">
          <Sparkles className="h-4 w-4 mr-2" />
          Create Episode
        </Button>
      </div>
    </header>
  );
}
