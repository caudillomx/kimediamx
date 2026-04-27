import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Copy, Download, RefreshCw, Loader2 } from "lucide-react";
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

  const tool = HERRAMIENTAS_IA.find((h) => h.id === herramienta);

  const generate = async () => {
    setStreaming(true);
    setPrompt("");
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
        toast.error(err.error || "No se pudo generar el prompt.");
        setStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
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
              setPrompt(acc);
            }
          } catch {}
        }
      }
      await onSavePrompt(acc);
      toast.success("Prompt generado y guardado.");
    } catch (e) {
      console.error(e);
      toast.error("Error generando el prompt.");
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

          {!prompt && !streaming && (
            <div className="rounded-xl border border-dashed border-border bg-background/40 p-10 text-center text-sm text-muted-foreground">
              Pulsa <strong className="text-foreground">Generar prompt</strong> para componer en vivo el prompt
              de sistema de tu dependencia. El modelo lo construye con tu brief.
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