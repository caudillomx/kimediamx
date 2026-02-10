import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/CopyCoach/Header";
import ModeSelector from "@/components/CopyCoach/ModeSelector";
import CopyInput from "@/components/CopyCoach/CopyInput";
import ResultPanel from "@/components/CopyCoach/ResultPanel";
import GuidelinesPanel from "@/components/CopyCoach/GuidelinesPanel";
import { toast } from "sonner";

type Mode = "review" | "generate";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/copy-coach`;

const Tools = () => {
  const [mode, setMode] = useState<Mode>("review");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (text: string, copyType: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, mode, copyType }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error("Demasiadas solicitudes. Espera un momento.");
        } else if (resp.status === 402) {
          toast.error("Créditos agotados. Recarga tu saldo.");
        } else {
          toast.error("Error al procesar. Intenta de nuevo.");
        }
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              setResult(accumulated);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              setResult(accumulated);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión. Intenta de nuevo.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {mode === "review" ? "Revisar Copy" : "Generar Copy"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "review"
                  ? "Analiza tu texto contra los guidelines de marca de KiMedia"
                  : "Crea copy alineado con el tono y estilo de KiMedia"}
              </p>
            </div>

            <ModeSelector mode={mode} onModeChange={setMode} />

            <CopyInput mode={mode} onSubmit={handleSubmit} isLoading={isLoading} />

            <AnimatePresence mode="wait">
              <ResultPanel result={result} isLoading={isLoading} mode={mode} />
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <GuidelinesPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
