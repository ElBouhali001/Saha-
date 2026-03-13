import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OpenEvidenceResult {
  title: string;
  summary: string;
  url: string;
  source: string;
  publicationDate?: string;
  evidenceLevel?: string;
  specialty?: string;
}

export const OpenEvidenceSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<OpenEvidenceResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Requête manquante",
        description: "Veuillez entrer une requête de recherche",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('openevidence-search', {
        body: { query: searchQuery }
      });

      if (error) throw error;

      if (data?.results && data.results.length > 0) {
        setResults(data.results);
        toast({
          title: "Recherche réussie",
          description: `${data.totalResults} résultats trouvés`,
        });
      } else {
        toast({
          title: "Aucun résultat",
          description: "Essayez avec des termes différents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OpenEvidence search error:", error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher dans OpenEvidence",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          OpenEvidence - Recherche Médicale Basée sur l'Évidence
        </CardTitle>
        <CardDescription>
          Recherchez des preuves scientifiques et des recommandations cliniques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Traitement de l'hypertension chez les diabétiques"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            disabled={isLoading}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Rechercher
          </Button>
        </div>

        {results.length > 0 && (
          <ScrollArea className="h-[500px] rounded-md border p-4">
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                      {result.evidenceLevel && (
                        <Badge variant="secondary">{result.evidenceLevel}</Badge>
                      )}
                    </div>
                    {result.specialty && (
                      <Badge variant="outline" className="w-fit">
                        {result.specialty}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Source: {result.source}
                        {result.publicationDate && ` • ${result.publicationDate}`}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Lire
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            OpenEvidence fournit des synthèses d'études cliniques et des recommandations
            basées sur les dernières recherches médicales.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://www.openevidence.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Visiter OpenEvidence
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
