import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { EpisodeCard } from "@/components/EpisodeCard";
import { NowPlaying } from "@/components/NowPlaying";
import { episodes, getEpisodeById, getFeaturedEpisodes } from "@/data/episodes";
import { useConversation } from "@/hooks/useConversation";
import { usePlayback } from "@/hooks/usePlayback";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const { conversation, isGenerating, generateConversation, clearConversation } = useConversation();
  const { isPlaying, currentTurnIndex, togglePlayPause, next, previous, seek, reset } = usePlayback(conversation);

  const currentEpisode = currentEpisodeId ? getEpisodeById(currentEpisodeId) : null;
  const featuredEpisodes = getFeaturedEpisodes();

  const handlePlayEpisode = async (episodeId: string) => {
    if (episodeId === currentEpisodeId) {
      togglePlayPause();
      return;
    }

    const episode = getEpisodeById(episodeId);
    if (!episode) return;

    reset();
    clearConversation();
    setCurrentEpisodeId(episodeId);
    await generateConversation(episode);
  };

  // Auto-play when conversation is ready
  useEffect(() => {
    if (conversation.length > 0 && !isPlaying && currentTurnIndex === 0) {
      // Small delay to let UI update
      const timer = setTimeout(() => {
        togglePlayPause();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [conversation.length]);

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 gradient-divine opacity-30 blur-3xl rounded-full" />
            <h1 className="relative font-display text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Divine Conversations</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch history's greatest minds debate philosophy, consciousness, and the nature of reality.
          </p>
        </section>

        {/* Now Playing */}
        <section className="mb-12">
          <NowPlaying
            episode={currentEpisode}
            conversation={conversation}
            currentTurnIndex={currentTurnIndex}
            isPlaying={isPlaying}
            isGenerating={isGenerating}
            onPlayPause={togglePlayPause}
            onNext={next}
            onPrevious={previous}
            onSeek={seek}
          />
        </section>

        {/* Featured Episodes */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Featured Episodes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEpisodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                onPlay={handlePlayEpisode}
                isPlaying={currentEpisodeId === episode.id && isPlaying}
              />
            ))}
          </div>
        </section>

        {/* All Episodes */}
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            All Episodes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes
              .filter((ep) => !ep.isFeatured)
              .map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  onPlay={handlePlayEpisode}
                  isPlaying={currentEpisodeId === episode.id && isPlaying}
                />
              ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>GodCast — Where the greatest minds meet across time and space</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
