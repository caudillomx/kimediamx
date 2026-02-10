import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContentPost {
  day: string;
  format: string;
  content: string;
  hashtags: string[];
}

interface ContentGridProps {
  profileId: string;
  profileToken: string;
  initialGrid: ContentPost[] | null;
  onGridGenerated: (grid: ContentPost[]) => void;
}

const dayColors: Record<string, string> = {
  Lunes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Martes: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Miércoles: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Jueves: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Viernes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Sábado: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Domingo: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function ContentGrid({ profileId, profileToken, initialGrid, onGridGenerated }: ContentGridProps) {
  const [grid, setGrid] = useState<ContentPost[] | null>(initialGrid);
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-grid", {
        body: { profileId, profileToken },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }

      const newGrid = data.grid as ContentPost[];
      setGrid(newGrid);
      onGridGenerated(newGrid);
      toast({ title: "¡Parrilla generada con éxito!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error al generar la parrilla", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyPost = async (post: ContentPost, index: number) => {
    const text = `${post.content}\n\n${post.hashtags.join(" ")}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-coral"><Calendar className="w-5 h-5" /></span>
          <h3 className="font-display text-sm font-bold text-foreground">Parrilla de contenido semanal</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerate}
          disabled={generating}
          className="text-xs border-coral/30 text-coral hover:bg-coral/10"
        >
          {generating ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : grid ? (
            <RefreshCw className="w-3 h-3 mr-1" />
          ) : (
            <Sparkles className="w-3 h-3 mr-1" />
          )}
          {generating ? "Generando..." : grid ? "Regenerar" : "Generar con IA"}
        </Button>
      </div>

      {!grid && !generating && (
        <div className="text-center py-8">
          <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Genera tu parrilla de 7 posts personalizados con IA
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Basada en tu perfil, propuesta de valor y tono de marca
          </p>
        </div>
      )}

      {generating && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-coral animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Creando tu parrilla personalizada...</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Esto puede tomar unos segundos</p>
        </div>
      )}

      {grid && !generating && (
        <div className="space-y-3">
          {grid.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-background rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${dayColors[post.day] || "bg-muted text-muted-foreground border-border"}`}>
                    {post.day}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">{post.format}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => copyPost(post, i)}
                >
                  {copiedIndex === i ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-[10px] text-coral/70">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
