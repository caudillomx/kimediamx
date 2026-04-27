import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Copy, Download, RefreshCw, Loader2, AlertTriangle, CheckCircle2, Radio, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { HERRAMIENTAS_IA } from "./data";
import { toast } from "sonner";

interface BriefForPrompt {
  dependencia_nombre: string;
  titular_nombre?: string;
  titular_cargo?: string;
  brief_mision: string;
  brief_audiencias: Array<{ nombre: string; expectativa: string }>;
  brief_tono: string;
  brief_terminos_prohibidos: string[];
  brief_terminos_preferidos: string[];
  brief_mensajes_clave: string[];
  brief_tipo_texto: string;
}

interface Props {
  brief: BriefForPrompt;
  herramienta: string;
  initialPrompt: string;
  onSavePrompt: (prompt: string) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

export const StepPromptGenerator = ({ brief, herramienta, initialPrompt, onSavePrompt, onNext, onBack }: Props) => {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "connecting" | "streaming" | "done" | "error">(
    initialPrompt ? "done" : "idle"
  );
  const [tokens, setTokens] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "connecting" && phase !== "streaming") return;
    const id = setInterval(() => {
      if (startRef.current) setElapsed((Date.now() - startRef.current) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  const tool = HERRAMIENTAS_IA.find((h) => h.id === herramienta);

  const generate = async () => {
    setStreaming(true);
    setError(null);
    setPrompt("");
    setTokens(0);
    setElapsed(0);
    setPhase("connecting");
    startRef.current = Date.now();
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/gto-generate-prompt`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error || `No se pudo generar el prompt (HTTP ${res.status}).`;
        setError(msg);
        setPhase("error");
        toast.error(msg);
        setStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let tokenCount = 0;
      setPhase("streaming");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              tokenCount += 1;
              setTokens(tokenCount);
              setPrompt(acc);
            }
          } catch {}
        }
      }
      if (!acc) {
        const msg = "El modelo no devolvió contenido. Intenta de nuevo.";
        setError(msg);
        setPhase("error");
        toast.error(msg);
        return;
      }
      await onSavePrompt(acc);
      setPhase("done");
      toast.success("Prompt generado y guardado.");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Error generando el prompt.";
      setError(msg);
      setPhase("error");
      toast.error("Error generando el prompt. Pulsa Reintentar.");
    } finally {
      setStreaming(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(prompt);
    toast.success("Prompt copiado al portapapeles.");
  };

  const downloadTxt = () => {
    const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${brief.dependencia_nombre.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveEdited = async () => {
    await onSavePrompt(prompt);
    toast.success("Cambios guardados.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl px-4 py-10 md:px-6"
    >
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-magenta/40 bg-magenta/10 px-3 py-1">
        <Sparkles className="h-3 w-3 text-magenta" />
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-magenta">
          Paso 3 · Tu prompt de sistema
        </span>
      </div>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight md:text-4xl">
        El <span className="text-gradient-sunset">cerebro</span> de tu IA institucional
      </h2>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        Genera el prompt en vivo con base en tu brief. Cuando esté listo, lo copias o lo descargas y lo
        pegas en {tool ? `${tool.icon} ${tool.nombre}` : "tu herramienta"}.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="border-border bg-card/70 p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
              Prompt de sistema
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={generate} disabled={streaming} className="rounded-lg">
                {streaming ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                {prompt ? "Regenerar" : "Generar prompt"}
              </Button>
              <Button size="sm" variant="outline" onClick={copyToClipboard} disabled={!prompt} className="rounded-lg">
                <Copy className="mr-1 h-3 w-3" /> Copiar
              </Button>
              <Button size="sm" variant="outline" onClick={downloadTxt} disabled={!prompt} className="rounded-lg">
                <Download className="mr-1 h-3 w-3" /> .txt
              </Button>
            </div>
          </div>

          {phase !== "idle" && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-[11px]">
              {phase === "connecting" && (
                <>
                  <Radio className="h-3.5 w-3.5 animate-pulse text-electric" />
                  <span className="font-semibold text-electric">Conectando…</span>
                </>
              )}
              {phase === "streaming" && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-magenta opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-magenta" />
                  </span>
                  <span className="font-semibold text-magenta">Generando en vivo</span>
                </>
              )}
              {phase === "done" && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold text-emerald-500">Completado</span>
                </>
              )}
              {phase === "error" && (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  <span className="font-semibold text-destructive">Error</span>
                </>
              )}
              <span className="ml-auto flex items-center gap-3 font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {tokens} tk
                </span>
                <span>{elapsed.toFixed(1)}s</span>
                {phase === "streaming" && elapsed > 0 && (
                  <span className="hidden sm:inline">{(tokens / Math.max(elapsed, 0.1)).toFixed(1)} tk/s</span>
                )}
              </span>
            </div>
          )}

          {!prompt && !streaming && (
            <div className="rounded-xl border border-dashed border-border bg-background/40 p-10 text-center text-sm text-muted-foreground">
              Pulsa <strong className="text-foreground">Generar prompt</strong> para componer en vivo el prompt
              de sistema de tu dependencia. El modelo lo construye con tu brief.
            </div>
          )}

          {error && !streaming && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">El streaming falló</div>
                  <div className="text-xs opacity-80">{error}</div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={generate}
                className="shrink-0 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <RefreshCw className="mr-1 h-3 w-3" /> Reintentar
              </Button>
            </div>
          )}

          {(prompt || streaming) && (
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={saveEdited}
              rows={22}
              className="resize-none bg-background/60 font-mono text-xs leading-relaxed md:text-[13px]"
              placeholder="Tu prompt aparecerá aquí…"
            />
          )}
          {prompt && !streaming && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Puedes editar libremente. Los cambios se guardan al salir del recuadro.
            </p>
          )}
        </Card>

        <Card className="h-fit border-border bg-card/70 p-5">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
            Cómo pegarlo en {tool ? tool.nombre : "tu herramienta"}
          </div>
          {tool ? (
            <ol className="space-y-2.5">
              {tool.instrucciones.map((paso, i) => (
                <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-electric/15 text-[10px] font-bold text-electric">
                    {i + 1}
                  </span>
                  <span>{paso}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-muted-foreground">
              Selecciona una herramienta en el brief para ver las instrucciones específicas.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
        </Button>
        <Button
          onClick={onNext}
          disabled={!prompt}
          className="rounded-xl bg-gradient-coral font-semibold shadow-glow"
        >
          Continuar a compromisos <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};