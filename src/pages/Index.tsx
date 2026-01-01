import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { EpisodeCard } from "@/components/EpisodeCard";
import { NowPlaying } from "@/components/NowPlaying";
import { episodes, getEpisodeById, getFeaturedEpisodes } from "@/data/episodes";
import { useConversation } from "@/hooks/useConversation";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { Sparkles, Radio } from "lucide-react";

const Index = () => {
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const { conversation, isGenerating, generateConversation, clearConversation } = useConversation();
  const { 
    isPlaying, 
    isLoading: isLoadingAudio,
    currentTurnIndex, 
    togglePlayPause, 
    next, 
    previous,
    onSeek,
    reset,
    play
  } = useAudioPlayback(conversation);

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
      const timer = setTimeout(() => {
        // Only play if we're not already playing
        // This handles the case where the user might have manually paused
        // or if the audio is still loading
        play();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [conversation.length, play]);

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-16 text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Radio className="h-4 w-4" />
            AI-Powered Philosophical Debates
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-gradient">GodCast</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Listen to history's greatest minds debate philosophy, consciousness, and the nature of reality — brought to life with AI voices.
          </p>
        </section>

        {/* Now Playing */}
        <section className="mb-16">
          <NowPlaying
            episode={currentEpisode}
            conversation={conversation}
            currentTurnIndex={currentTurnIndex}
            isPlaying={isPlaying}
            isGenerating={isGenerating}
            isLoadingAudio={isLoadingAudio}
            onPlayPause={togglePlayPause}
            onNext={next}
            onPrevious={previous}
            onSeek={seek}
          />
        </section>

        {/* Featured Episodes */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">
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
          <h2 className="text-2xl font-bold text-foreground mb-8">
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
      <footer className="border-t border-border mt-20">
        <div className="container py-12 text-center">
          <p className="text-lg font-medium text-foreground mb-2">GodCast</p>
          <p className="text-sm text-muted-foreground">
            Where the greatest minds meet across time and space
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
