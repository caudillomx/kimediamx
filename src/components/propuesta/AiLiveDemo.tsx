import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Wand2, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface CampaignPack {
  headline: string;
  post: string;
  video_hook: string;
  speech_line: string;
  hashtags: string[];
}

const SUGGESTIONS = [
  "Empoderamiento económico de mujeres en Yucatán",
  "Seguridad para jóvenes en Motul",
  "Apoyo a pequeños comercios locales",
];

export const AiLiveDemo = () => {
  const [topic, setTopic] = useState("");
  const [pack, setPack] = useState<CampaignPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async (input: string) => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setPack(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("propuesta-ai-demo", {
        body: { topic: input.trim() },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setPack(data as CampaignPack);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo falló. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-coral opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-electric/15 blur-3xl" />

      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
            Demo en vivo · pruébalo ahora
          </span>
        </div>
        <h3 className="mb-2 font-display text-2xl font-bold leading-tight md:text-3xl">
          Esto es lo que vivirán los <span className="text-gradient-sunset">150 asistentes</span>
        </h3>
        <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Escribe un tema o causa de campaña y la IA generará en segundos un paquete completo: titular, post,
          hook de video, frase de vocería y hashtags. Igual que en el taller.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate(topic);
          }}
          className="mb-3 flex flex-col gap-2 sm:flex-row"
        >
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: Apoyo a mujeres emprendedoras en Yucatán"
            className="h-12 flex-1 rounded-xl border-border bg-background/80 text-base"
          />
          <Button
            type="submit"
            disabled={loading || !topic.trim()}
            className="h-12 rounded-xl bg-gradient-coral px-6 font-semibold shadow-glow hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Generando…
              </>
            ) : (
              <>
                <Wand2 className="mr-1 h-4 w-4" />
                Generar
              </>
            )}
          </Button>
        </form>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Prueba con:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setTopic(s);
                generate(s);
              }}
              disabled={loading}
              className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-foreground/80 transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl border border-border bg-secondary/40"
                />
              ))}
            </motion.div>
          )}

          {pack && !loading && (
            <motion.div
              key="pack"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <ResultBlock
                label="Titular"
                value={pack.headline}
                onCopy={() => copy("headline", pack.headline)}
                copied={copied === "headline"}
                accent="primary"
              />
              <ResultBlock
                label="Post para redes"
                value={pack.post}
                onCopy={() => copy("post", pack.post)}
                copied={copied === "post"}
                multiline
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultBlock
                  label="Hook de video (Reel/TikTok)"
                  value={pack.video_hook}
                  onCopy={() => copy("hook", pack.video_hook)}
                  copied={copied === "hook"}
                  accent="electric"
                />
                <ResultBlock
                  label="Frase de vocería"
                  value={pack.speech_line}
                  onCopy={() => copy("speech", pack.speech_line)}
                  copied={copied === "speech"}
                  accent="electric"
                />
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                  Hashtags
                </div>
                <div className="flex flex-wrap gap-2">
                  {pack.hashtags.map((h) => (
                    <Badge key={h} variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      #{h.replace(/^#/, "")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-xs text-muted-foreground">
                  Generado por IA en vivo · estilo y tono se ajustan en el taller a cada candidatura.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generate(topic)}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Regenerar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

const ResultBlock = ({
  label,
  value,
  onCopy,
  copied,
  multiline,
  accent,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  multiline?: boolean;
  accent?: "primary" | "electric";
}) => {
  const accentClass =
    accent === "primary"
      ? "border-primary/30 bg-primary/5"
      : accent === "electric"
        ? "border-electric/30 bg-electric/5"
        : "border-border bg-secondary/40";
  return (
    <div className={`group relative rounded-xl border p-4 ${accentClass}`}>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">{label}</div>
        <button
          type="button"
          onClick={onCopy}
          className="text-muted-foreground opacity-60 transition-opacity hover:text-primary group-hover:opacity-100"
          aria-label="Copiar"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className={`text-sm leading-relaxed text-foreground ${multiline ? "whitespace-pre-line" : ""}`}>
        {value}
      </p>
    </div>
  );
};