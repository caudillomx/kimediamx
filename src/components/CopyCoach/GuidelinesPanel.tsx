import { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Loader2, RefreshCw } from "lucide-react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/copy-coach`;

interface Guideline {
  title: string;
  description: string;
  category: string;
  example: string;
}

interface Client {
  name: string;
  industry: string;
  tone: string;
}

interface ClientDetails {
  [key: string]: string;
}

interface GuidelinesPanelProps {
  selectedClient: string;
  onClientChange: (client: string) => void;
}

const categoryColors: Record<string, string> = {
  Estructura: "text-blue-400",
  Tono: "text-green-400",
  Prohibido: "text-red-400",
  CTA: "text-orange-400",
  Datos: "text-purple-400",
};

const GuidelinesPanel = ({ selectedClient, onClientChange }: GuidelinesPanelProps) => {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [notionConnected, setNotionConnected] = useState(false);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);

  const fetchData = async (client?: string) => {
    setLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "fetch-guidelines", clientName: client || selectedClient || undefined }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setGuidelines(data.guidelines || []);
        setClients(data.clients || []);
        setNotionConnected(data.guidelines?.length > 0);
        setClientDetails(data.clientDetails || null);
      }
    } catch (e) {
      console.error("Failed to fetch guidelines:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fallbackGuidelines = [
    { title: "Tono de voz", description: "Profesional pero cercano. Evitar lenguaje corporativo frío.", category: "Tono", example: "" },
    { title: "Palabras clave", description: "Reputación digital, estrategia, resultados medibles, audiencia.", category: "Datos", example: "" },
    { title: "Estructura", description: "Hook → Problema → Solución → CTA. Frases cortas y directas.", category: "Estructura", example: "" },
    { title: "Prohibido", description: "Superlativos vacíos, promesas sin respaldo, jerga técnica excesiva.", category: "Prohibido", example: "" },
  ];

  const displayGuidelines = guidelines.length > 0 ? guidelines : fallbackGuidelines;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Brand Guidelines</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <a
            href="https://www.notion.so/Copy-Coach-Guidelines-30360b3f789780be8160ff90ced5d25b"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Notion
          </a>
        </div>
      </div>

      {/* Client selector */}
      {clients.length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Cliente</label>
          <select
            value={selectedClient}
            onChange={(e) => {
              onClientChange(e.target.value);
              fetchData(e.target.value);
            }}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="">General (KiMedia)</option>
            {clients.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} — {c.industry}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${notionConnected ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
        <div className={`w-2 h-2 rounded-full ${notionConnected ? "bg-green-500" : "bg-muted-foreground"}`} />
        {notionConnected ? "Sincronizado con Notion" : "Guidelines locales"}
      </div>

      {/* Client-specific details */}
      {clientDetails && selectedClient && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Perfil: {selectedClient}
          </span>
          {Object.entries(clientDetails).map(([label, value]) => (
            <div key={label} className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-[10px] font-bold uppercase text-primary mb-0.5">{label}</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Reglas generales
          </span>
          {displayGuidelines.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase ${categoryColors[item.category] || "text-muted-foreground"}`}>
                  {item.category}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              {item.example && (
                <p className="text-xs text-foreground/60 mt-1 italic">"{item.example}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuidelinesPanel;
