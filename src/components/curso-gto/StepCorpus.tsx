import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2, Circle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CORPUS_DOCUMENTOS } from "./data";
import { cn } from "@/lib/utils";

export interface CorpusData {
  corpus_documentos: string[];
  corpus_notas: string;
}

interface Props {
  initial: CorpusData;
  onSave: (d: CorpusData) => Promise<void>;
  onBack: () => void;
}

const PRIORIDAD_STYLE: Record<string, string> = {
  esencial: "border-coral/40 bg-coral/10 text-coral",
  recomendado: "border-electric/40 bg-electric/10 text-electric",
  opcional: "border-border bg-muted/40 text-muted-foreground",
};

export const StepCorpus = ({ initial, onSave, onBack }: Props) => {
  const [docs, setDocs] = useState<string[]>(initial.corpus_documentos || []);
  const [notas, setNotas] = useState(initial.corpus_notas || "");
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setDocs((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  const esenciales = CORPUS_DOCUMENTOS.filter((d) => d.prioridad === "esencial");
  const esencialesListos = esenciales.every((e) => docs.includes(e.id));

  const handleSubmit = async () => {
    setSaving(true);
    await onSave({ corpus_documentos: docs, corpus_notas: notas });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 py-10 md:px-6"
    >
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1">
        <FolderOpen className="h-3 w-3 text-cyan" />
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-cyan">
          Paso 2 · Corpus de la dependencia
        </span>
      </div>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight md:text-4xl">
        Sin corpus, la IA <span className="text-gradient-sunset">inventa</span>
      </h2>
      <p className="mb-8 text-sm text-muted-foreground md:text-base">
        Marca qué documentos ya tienes a la mano. Estos son los archivos que vas a subir a tu herramienta
        de IA junto con el prompt de sistema. No hace falta cargarlos aquí: basta con que sepas dónde están.
      </p>

      <div className="space-y-3">
        {CORPUS_DOCUMENTOS.map((doc) => {
          const checked = docs.includes(doc.id);
          return (
            <Card
              key={doc.id}
              onClick={() => toggle(doc.id)}
              className={cn(
                "cursor-pointer border-border bg-card/70 p-4 transition-all hover:border-primary/60 md:p-5",
                checked && "border-primary/60 bg-primary/5 shadow-glow"
              )}
            >
              <div className="flex items-start gap-3">
                {checked ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/60" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-display text-sm font-bold md:text-base">{doc.nombre}</span>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", PRIORIDAD_STYLE[doc.prioridad])}>
                      {doc.prioridad}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">{doc.razon}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 border-border bg-card/70 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notas para tu equipo (opcional)
        </label>
        <Textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          placeholder="Ej. Los discursos están en SharePoint /Comunicación/Discursos. Falta consolidar el plan 2026."
          className="bg-background/50"
        />
      </Card>

      {!esencialesListos && (
        <div className="mt-5 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          Te recomendamos cubrir los <strong>3 documentos esenciales</strong> antes de generar el prompt. Aun así puedes continuar y volver después.
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-xl bg-gradient-coral font-semibold shadow-glow"
        >
          {saving ? "Guardando…" : "Generar mi prompt"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};