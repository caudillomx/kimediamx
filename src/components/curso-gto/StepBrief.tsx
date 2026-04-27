import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Plus, X, Target, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HERRAMIENTAS_IA } from "./data";

export interface BriefData {
  titular_nombre: string;
  titular_cargo: string;
  herramienta_ia: string;
  brief_mision: string;
  brief_audiencias: Array<{ nombre: string; expectativa: string }>;
  brief_tono: string;
  brief_terminos_prohibidos: string[];
  brief_terminos_preferidos: string[];
  brief_mensajes_clave: string[];
  brief_tipo_texto: string;
}

interface Props {
  initial: BriefData;
  onSave: (data: BriefData) => Promise<void>;
  onBack: () => void;
}

const TIPOS_TEXTO = ["Discursos", "Boletines de prensa", "Publicaciones en redes sociales", "Respuestas a medios", "Comunicados internos", "Mezcla de varios"];
const TONOS = ["Formal e institucional", "Cercano y ciudadano", "Técnico-especializado", "Mezcla: formal con cercanía", "Mezcla: técnico con divulgación"];

export const StepBrief = ({ initial, onSave, onBack }: Props) => {
  const [data, setData] = useState<BriefData>(initial);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof BriefData>(k: K, v: BriefData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const addList = (key: "brief_terminos_prohibidos" | "brief_terminos_preferidos" | "brief_mensajes_clave", val: string) => {
    if (!val.trim()) return;
    setData((d) => ({ ...d, [key]: [...d[key], val.trim()] }));
  };
  const removeFromList = (key: "brief_terminos_prohibidos" | "brief_terminos_preferidos" | "brief_mensajes_clave", idx: number) => {
    setData((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== idx) }));
  };

  const addAudiencia = () =>
    setData((d) => ({ ...d, brief_audiencias: [...d.brief_audiencias, { nombre: "", expectativa: "" }] }));
  const updateAud = (i: number, field: "nombre" | "expectativa", v: string) =>
    setData((d) => ({
      ...d,
      brief_audiencias: d.brief_audiencias.map((a, idx) => (idx === i ? { ...a, [field]: v } : a)),
    }));
  const removeAud = (i: number) =>
    setData((d) => ({ ...d, brief_audiencias: d.brief_audiencias.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  const canContinue = data.brief_mision.trim().length > 10 && data.brief_audiencias.some((a) => a.nombre);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 py-10 md:px-6"
    >
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-3 py-1">
        <Target className="h-3 w-3 text-electric" />
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
          Paso 1 · Brief institucional · 6 preguntas
        </span>
      </div>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight md:text-4xl">
        Construyamos el <span className="text-gradient-sunset">perfil de tu dependencia</span>
      </h2>
      <p className="mb-8 text-sm text-muted-foreground md:text-base">
        Cada respuesta entra directo al prompt de sistema. Sé específico, no genérico.
      </p>

      <div className="space-y-5">
        {/* Titular y herramienta */}
        <Card className="border-border bg-card/70 p-5 md:p-6">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
            Datos del titular y herramienta
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs">Nombre del titular</Label>
              <Input
                value={data.titular_nombre}
                onChange={(e) => update("titular_nombre", e.target.value)}
                placeholder="Ej. Lic. Juan Pérez"
                className="mt-1.5 bg-background/50"
              />
            </div>
            <div>
              <Label className="text-xs">Cargo exacto</Label>
              <Input
                value={data.titular_cargo}
                onChange={(e) => update("titular_cargo", e.target.value)}
                placeholder="Ej. Secretario de Salud"
                className="mt-1.5 bg-background/50"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Herramienta de IA que usa tu equipo</Label>
              <Select value={data.herramienta_ia} onValueChange={(v) => update("herramienta_ia", v)}>
                <SelectTrigger className="mt-1.5 bg-background/50">
                  <SelectValue placeholder="Selecciona la herramienta" />
                </SelectTrigger>
                <SelectContent>
                  {HERRAMIENTAS_IA.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.icon} {h.nombre}
                    </SelectItem>
                  ))}
                  <SelectItem value="otra">Otra / Aún no decidimos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Pregunta 1: Misión */}
        <BriefQuestion
          n="1"
          q="¿Cuál es la misión principal de la dependencia en una sola oración?"
          tip="Esta será la primera línea del prompt. Evita frases hechas como 'transformar la realidad' o 'dejar huella'."
        >
          <Textarea
            value={data.brief_mision}
            onChange={(e) => update("brief_mision", e.target.value)}
            rows={2}
            placeholder="Ej. Garantizar el acceso universal a servicios de salud en el Estado de Guanajuato."
            className="bg-background/50"
          />
        </BriefQuestion>

        {/* Pregunta 2: Audiencias */}
        <BriefQuestion
          n="2"
          q="¿Quiénes son sus 3 audiencias más importantes y qué esperan de la dependencia?"
          tip="Cada audiencia define un registro distinto. Ciudadanía no habla igual que medios."
        >
          <div className="space-y-2.5">
            {data.brief_audiencias.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={a.nombre}
                  onChange={(e) => updateAud(i, "nombre", e.target.value)}
                  placeholder="Audiencia"
                  className="bg-background/50"
                />
                <Input
                  value={a.expectativa}
                  onChange={(e) => updateAud(i, "expectativa", e.target.value)}
                  placeholder="Qué espera de ustedes"
                  className="flex-1 bg-background/50"
                />
                <Button variant="ghost" size="icon" onClick={() => removeAud(i)} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAudiencia} className="w-full">
              <Plus className="mr-1 h-3 w-3" />
              Agregar audiencia
            </Button>
          </div>
        </BriefQuestion>

        {/* Pregunta 3: Tono */}
        <BriefQuestion n="3" q="¿Qué tono quieren proyectar?" tip="Si dudas, elige una mezcla.">
          <Select value={data.brief_tono} onValueChange={(v) => update("brief_tono", v)}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Selecciona un tono" />
            </SelectTrigger>
            <SelectContent>
              {TONOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BriefQuestion>

        {/* Pregunta 4: Términos prohibidos */}
        <BriefQuestion
          n="4"
          q="¿Qué palabras o frases NUNCA deben aparecer en sus textos?"
          tip="El diagnóstico del paso anterior ya sumó muletillas comunes de IA. Agrega términos coloquiales internos o políticamente sensibles."
        >
          <ChipInput
            values={data.brief_terminos_prohibidos}
            onAdd={(v) => addList("brief_terminos_prohibidos", v)}
            onRemove={(i) => removeFromList("brief_terminos_prohibidos", i)}
            placeholder="Escribe un término y presiona Enter"
            badgeClass="border-destructive/40 bg-destructive/10 text-destructive"
          />
        </BriefQuestion>

        {/* Términos preferidos (opcional) */}
        <BriefQuestion
          n="4b"
          q="¿Qué palabras o frases SÍ quieren que aparezcan? (opcional)"
          tip="Términos oficiales, nombres de programas estrella, ejes del plan de gobierno."
          opcional
        >
          <ChipInput
            values={data.brief_terminos_preferidos}
            onAdd={(v) => addList("brief_terminos_preferidos", v)}
            onRemove={(i) => removeFromList("brief_terminos_preferidos", i)}
            placeholder="Ej. 'GTO Avanza', 'mujeres con futuro'"
            badgeClass="border-electric/40 bg-electric/10 text-electric"
          />
        </BriefQuestion>

        {/* Pregunta 5: Mensajes clave */}
        <BriefQuestion
          n="5"
          q="¿Cuáles son los 3 o 4 mensajes que esta dependencia repite siempre?"
          tip="Frases o ideas que deben aparecer una y otra vez en su comunicación."
        >
          <ChipInput
            values={data.brief_mensajes_clave}
            onAdd={(v) => addList("brief_mensajes_clave", v)}
            onRemove={(i) => removeFromList("brief_mensajes_clave", i)}
            placeholder="Escribe un mensaje y presiona Enter"
            badgeClass="border-primary/40 bg-primary/10 text-primary"
          />
        </BriefQuestion>

        {/* Pregunta 6: Tipo de texto */}
        <BriefQuestion
          n="6"
          q="¿Qué tipo de texto producen con más frecuencia?"
          tip="Esto define el caso de uso principal del prompt."
        >
          <Select value={data.brief_tipo_texto} onValueChange={(v) => update("brief_tipo_texto", v)}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Selecciona el tipo principal" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_TEXTO.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BriefQuestion>
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Atrás
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canContinue || saving}
          className="rounded-xl bg-gradient-coral font-semibold shadow-glow"
        >
          {saving ? "Guardando…" : "Continuar al corpus"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const BriefQuestion = ({
  n,
  q,
  tip,
  children,
  opcional,
}: {
  n: string;
  q: string;
  tip?: string;
  children: React.ReactNode;
  opcional?: boolean;
}) => (
  <Card className="border-border bg-card/70 p-5 md:p-6">
    <div className="mb-3 flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-coral text-xs font-bold text-primary-foreground">
        {n}
      </div>
      <div className="flex-1">
        <h3 className="font-display text-base font-bold leading-snug md:text-lg">
          {q}
          {opcional && <span className="ml-2 text-xs font-normal text-muted-foreground">(opcional)</span>}
        </h3>
        {tip && <p className="mt-0.5 text-xs text-muted-foreground">{tip}</p>}
      </div>
    </div>
    {children}
  </Card>
);

const ChipInput = ({
  values,
  onAdd,
  onRemove,
  placeholder,
  badgeClass,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder: string;
  badgeClass?: string;
}) => {
  const [v, setV] = useState("");
  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(v);
              setV("");
            }
          }}
          placeholder={placeholder}
          className="bg-background/50"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onAdd(v);
            setV("");
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {values.map((val, i) => (
            <Badge key={`${val}-${i}`} variant="outline" className={`gap-1 ${badgeClass || ""}`}>
              {val}
              <button onClick={() => onRemove(i)} className="ml-1 opacity-60 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};