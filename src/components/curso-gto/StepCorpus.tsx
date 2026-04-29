import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2, Circle, FolderOpen, Upload, X, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CORPUS_DOCUMENTOS } from "./data";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CorpusData {
  corpus_documentos: string[];
  corpus_notas: string;
}

interface Props {
  initial: CorpusData;
  onSave: (d: CorpusData) => Promise<void>;
  onBack: () => void;
  sesionId: string;
  participanteId: string;
}

const PRIORIDAD_STYLE: Record<string, string> = {
  esencial: "border-coral/40 bg-coral/10 text-coral",
  recomendado: "border-electric/40 bg-electric/10 text-electric",
  opcional: "border-border bg-muted/40 text-muted-foreground",
};

interface UploadRow {
  id: string;
  doc_tipo: string;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const MIN_SIZE = 100; // 100 bytes — evita archivos vacíos o corruptos

// Tipos permitidos: documentos de texto, ofimática y datos. Se valida por
// extensión y por MIME (cuando el navegador lo provee) para evitar bypass.
const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "txt", "md", "rtf", "odt",
  "xls", "xlsx", "csv", "ppt", "pptx",
] as const;

const ALLOWED_MIME_PREFIXES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument",
  "application/vnd.oasis.opendocument",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/rtf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/rtf",
];

const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const validateFile = (file: File): string | null => {
  if (!file.name || file.name.length > 200) {
    return "El nombre del archivo no es válido (máx. 200 caracteres).";
  }
  if (file.size === 0) {
    return "El archivo está vacío.";
  }
  if (file.size < MIN_SIZE) {
    return "El archivo es demasiado pequeño o está dañado.";
  }
  if (file.size > MAX_SIZE) {
    return `El archivo pesa ${formatBytes(file.size)}. El máximo permitido es 20 MB.`;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return `Formato no permitido (.${ext || "?"}). Usa PDF, Word, Excel, PowerPoint, TXT, MD, CSV o RTF.`;
  }
  if (file.type && !ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
    return "El tipo de archivo no coincide con un documento permitido.";
  }
  return null;
};

export const StepCorpus = ({ initial, onSave, onBack, sesionId, participanteId }: Props) => {
  const [docs, setDocs] = useState<string[]>(initial.corpus_documentos || []);
  const [notas, setNotas] = useState(initial.corpus_notas || "");
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("gto_list_corpus_uploads", {
        _participante_id: participanteId,
      });
      setUploads((data || []) as UploadRow[]);
    })();
  }, [participanteId]);

  const toggle = (id: string) =>
    setDocs((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  const handleUpload = async (docId: string, file: File) => {
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setUploadingFor(docId);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${participanteId}/${docId}/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("gto-corpus")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: row, error: insErr } = await supabase
        .from("gto_corpus_uploads")
        .insert({
          sesion_id: sesionId,
          participante_id: participanteId,
          doc_tipo: docId,
          file_name: file.name,
          storage_path: path,
          file_size: file.size,
          mime_type: file.type || null,
        })
        .select()
        .single();
      if (insErr) throw insErr;
      setUploads((prev) => [row as UploadRow, ...prev]);
      if (!docs.includes(docId)) setDocs((d) => [...d, docId]);
      toast.success("Archivo subido.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "No se pudo subir el archivo.");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDelete = async (row: UploadRow) => {
    const { error } = await supabase.rpc("gto_delete_corpus_upload", {
      _upload_id: row.id,
      _participante_id: participanteId,
    });
    if (error) {
      toast.error("No se pudo eliminar el archivo.");
      return;
    }
    await supabase.storage.from("gto-corpus").remove([row.storage_path]);
    setUploads((prev) => prev.filter((u) => u.id !== row.id));
    toast.success("Archivo eliminado.");
  };

  const handleDownload = async (row: UploadRow) => {
    const { data, error } = await supabase.storage
      .from("gto-corpus")
      .createSignedUrl(row.storage_path, 60);
    if (error || !data) {
      toast.error("No se pudo abrir el archivo.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

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
        Marca qué documentos ya tienes y, si quieres, súbelos aquí mismo. Cada archivo queda asociado a tu
        participación para que puedas armar el ejercicio completo y descargarlos después en tu herramienta de IA.
        Máx. 20 MB por archivo.
      </p>

      <div className="space-y-3">
        {CORPUS_DOCUMENTOS.map((doc) => {
          const checked = docs.includes(doc.id);
          const filesForDoc = uploads.filter((u) => u.doc_tipo === doc.id);
          const isUploading = uploadingFor === doc.id;
          return (
            <Card
              key={doc.id}
              className={cn(
                "border-border bg-card/70 p-4 transition-all md:p-5",
                checked && "border-primary/60 bg-primary/5 shadow-glow"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggle(doc.id)}
                  className="mt-0.5 shrink-0"
                  aria-label={checked ? "Desmarcar" : "Marcar"}
                >
                  {checked ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/60" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-display text-sm font-bold md:text-base">{doc.nombre}</span>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", PRIORIDAD_STYLE[doc.prioridad])}>
                      {doc.prioridad}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">{doc.razon}</p>

                  {filesForDoc.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {filesForDoc.map((f) => (
                        <li
                          key={f.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5"
                        >
                          <button
                            type="button"
                            onClick={() => handleDownload(f)}
                            className="flex min-w-0 items-center gap-2 text-left text-xs hover:text-primary"
                          >
                            <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{f.file_name}</span>
                            {f.file_size != null && (
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {(f.file_size / 1024).toFixed(0)} KB
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(f)}
                            className="text-muted-foreground hover:text-coral"
                            aria-label="Eliminar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3">
                    <input
                      ref={(el) => (fileInputs.current[doc.id] = el)}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt,.xls,.xlsx,.csv,.ppt,.pptx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(doc.id, f);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isUploading}
                      onClick={() => fileInputs.current[doc.id]?.click()}
                      className="rounded-lg text-xs"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Subiendo…
                        </>
                      ) : (
                        <>
                          <Upload className="mr-1 h-3 w-3" /> Subir archivo
                        </>
                      )}
                    </Button>
                  </div>
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