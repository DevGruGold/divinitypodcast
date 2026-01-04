import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { characters } from "@/data/characters";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, Image, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PortraitStatus {
  character_id: string;
  image_url: string | null;
  status: string;
  generated_at: string | null;
}

const Admin = () => {
  const [portraits, setPortraits] = useState<Record<string, PortraitStatus>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortraits();
  }, []);

  const fetchPortraits = async () => {
    const { data, error } = await supabase
      .from('character_portraits')
      .select('*');
    
    if (error) {
      console.error('Error fetching portraits:', error);
      toast.error('Failed to load portrait status');
    } else {
      const portraitMap: Record<string, PortraitStatus> = {};
      data?.forEach((p: PortraitStatus) => {
        portraitMap[p.character_id] = p;
      });
      setPortraits(portraitMap);
    }
    setLoading(false);
  };

  const generatePortrait = async (characterId: string) => {
    setGenerating(characterId);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-portrait', {
        body: { characterId }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Portrait generated for ${characterId}!`);
      await fetchPortraits();
    } catch (err) {
      console.error('Generation error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to generate portrait');
    } finally {
      setGenerating(null);
    }
  };

  const generateAllPortraits = async () => {
    const ungenerated = characters.filter(c => !portraits[c.id]?.image_url);
    
    for (const character of ungenerated) {
      await generatePortrait(character.id);
      // Small delay between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const completedCount = Object.values(portraits).filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portrait Generation Admin</h1>
            <p className="text-muted-foreground mt-1">
              Generate Renaissance-style AI portraits for all characters
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg py-2 px-4">
              {completedCount} / {characters.length} Complete
            </Badge>
            <Button 
              onClick={generateAllPortraits}
              disabled={generating !== null || completedCount === characters.length}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate All Missing
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => {
              const portrait = portraits[character.id];
              const isGenerating = generating === character.id;
              const hasPortrait = portrait?.status === 'completed' && portrait.image_url;

              return (
                <Card key={character.id} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-muted relative">
                    {hasPortrait ? (
                      <img 
                        src={portrait.image_url!} 
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: character.color }}
                      >
                        <span className="text-6xl font-bold text-white/80">
                          {character.avatarInitials}
                        </span>
                      </div>
                    )}
                    
                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="h-10 w-10 animate-spin text-white mx-auto mb-2" />
                          <p className="text-white text-sm">Generating...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>{character.name}</span>
                      {hasPortrait ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">{character.era}</p>
                    <Button 
                      onClick={() => generatePortrait(character.id)}
                      disabled={isGenerating || generating !== null}
                      variant={hasPortrait ? "outline" : "default"}
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Image className="h-4 w-4" />
                      {hasPortrait ? 'Regenerate' : 'Generate Portrait'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
