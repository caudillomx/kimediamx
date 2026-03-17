import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface MinuteUploaderProps {
  onUploaded: () => void;
}

const MinuteUploader = ({ onUploaded }: MinuteUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    console.log("MinuteUploader: handleFile called with", file.name, file.type, file.size);
    if (!file.name.match(/\.(docx|doc|txt|pdf)$/i)) {
      toast.error("Formato no soportado. Usa .docx, .doc, .txt o .pdf");
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      // Upload to storage
      const filePath = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("minutes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create minute record
      const { data: minute, error: dbError } = await supabase
        .from("minutes")
        .insert({
          title: file.name.replace(/\.(docx|doc|txt|pdf)$/i, ""),
          file_name: filePath,
          meeting_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploading(false);
      setParsing(true);

      // Call parse edge function
      const { data: parsed, error: parseError } = await supabase.functions.invoke("parse-minutes", {
        body: { minuteId: minute.id, filePath },
      });

      if (parseError) {
        console.error("Parse error:", parseError);
        toast.error("Minuta subida pero no se pudo parsear automáticamente. Agrega las tareas manualmente.");
      } else {
        toast.success(`Se extrajeron ${parsed?.count || 0} actividades de la minuta`);
      }

      setParsing(false);
      onUploaded();
    } catch (err: any) {
      console.error("MinuteUploader error:", err?.message, err?.statusCode, JSON.stringify(err));
      toast.error(`Error al subir la minuta: ${err?.message || "desconocido"}`);
      setUploading(false);
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-coral" />
        Subir minuta
      </h3>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => { console.log("MinuteUploader: zone clicked, triggering file input"); fileRef.current?.click(); }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-coral bg-coral/5"
            : "border-border/50 hover:border-coral/50 hover:bg-secondary/30"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".docx,.doc,.txt,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-coral animate-spin" />
              <p className="text-sm text-muted-foreground">Subiendo {fileName}...</p>
            </motion.div>
          ) : parsing ? (
            <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              <Sparkles className="w-8 h-8 text-electric animate-pulse" />
              <p className="text-sm text-electric">IA extrayendo actividades...</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arrastra un archivo .docx o haz clic
              </p>
              <p className="text-[10px] text-muted-foreground/50">La IA extraerá responsables, fechas y tareas automáticamente</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MinuteUploader;
