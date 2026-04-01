import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, User, Briefcase, AtSign, Wifi, BarChart3, Mail, Globe, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { channelOptions, followerRanges, industryOptions } from "@/data/brandKitData";

export interface BrandParticipantInfo {
  fullName: string;
  email: string;
  profession: string;
  industry: string;
  socialHandle: string;
  mainChannel: string;
  approxFollowers: string;
  hasWebsite: boolean;
  competitors: string;
}

interface BrandWelcomeStepProps {
  onNext: (info: BrandParticipantInfo) => void;
}

const CHANNEL_EMOJI: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", linkedin: "💼", x: "𝕏", youtube: "▶️",
};

export function BrandWelcomeStep({ onNext }: BrandWelcomeStepProps) {
  const [form, setForm] = useState<BrandParticipantInfo>({
    fullName: "", email: "", profession: "", industry: "",
    socialHandle: "", mainChannel: "", approxFollowers: "", hasWebsite: false,
    competitors: "",
  });
  const [section, setSection] = useState(0); // 0: personal, 1: digital

  const isPersonalValid = form.fullName.trim() && form.email.trim() && form.profession.trim() && form.industry;
  const isDigitalValid = form.socialHandle.trim() && form.mainChannel && form.approxFollowers;
  const isValid = isPersonalValid && isDigitalValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext(form);
  };

  const set = (key: keyof BrandParticipantInfo, value: string | boolean) =>
    setForm(p => ({ ...p, [key]: value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Hero header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
          className="w-16 h-16 rounded-3xl bg-gradient-coral flex items-center justify-center mx-auto mb-5 shadow-glow"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3"
        >
          Tu Kit de <span className="text-gradient">Marca Personal</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto"
        >
          Completa tu brief estratégico: datos, diagnóstico e identidad de marca.
        </motion.p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-2xl mb-8">
        {["Datos personales", "Presencia digital"].map((label, i) => (
          <button
            key={i}
            onClick={() => setSection(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              section === i
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {section === 0 ? (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <User className="w-3.5 h-3.5" /> Nombre completo
              </Label>
              <Input
                value={form.fullName}
                onChange={e => set("fullName", e.target.value)}
                placeholder="Tu nombre completo"
                className="bg-secondary border-border rounded-xl h-12 text-foreground placeholder:text-muted-foreground/60"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="tu@correo.com"
                className="bg-secondary border-border rounded-xl h-12 text-foreground placeholder:text-muted-foreground/60"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Briefcase className="w-3.5 h-3.5" /> Profesión o actividad
              </Label>
              <Input
                value={form.profession}
                onChange={e => set("profession", e.target.value)}
                placeholder="Coach de negocios, Fotógrafa, Consultor..."
                className="bg-secondary border-border rounded-xl h-12 text-foreground placeholder:text-muted-foreground/60"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Industria</Label>
              <Select value={form.industry} onValueChange={v => set("industry", v)}>
                <SelectTrigger className="bg-secondary border-border rounded-xl h-12">
                  <SelectValue placeholder="Selecciona tu industria" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={() => setSection(1)}
              disabled={!isPersonalValid}
              className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all"
            >
              Siguiente: presencia digital <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="digital"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <AtSign className="w-3.5 h-3.5" /> Usuario principal
              </Label>
              <Input
                value={form.socialHandle}
                onChange={e => set("socialHandle", e.target.value)}
                placeholder="@tuusuario"
                className="bg-secondary border-border rounded-xl h-12 text-foreground placeholder:text-muted-foreground/60"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Wifi className="w-3.5 h-3.5" /> Canal principal
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {channelOptions.map(ch => (
                  <motion.button
                    key={ch.value}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => set("mainChannel", ch.value)}
                    className={`rounded-xl px-3 py-3 text-xs font-medium transition-all border flex items-center justify-center gap-1.5 ${
                      form.mainChannel === ch.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span>{CHANNEL_EMOJI[ch.value] || "📱"}</span> {ch.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <BarChart3 className="w-3.5 h-3.5" /> Seguidores
              </Label>
              <Select value={form.approxFollowers} onValueChange={v => set("approxFollowers", v)}>
                <SelectTrigger className="bg-secondary border-border rounded-xl h-12">
                  <SelectValue placeholder="Rango aproximado" />
                </SelectTrigger>
                <SelectContent>
                  {followerRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> ¿Tienes sitio web?
              </Label>
              <div className="flex gap-2">
                {[{ val: true, label: "Sí" }, { val: false, label: "No" }].map(opt => (
                  <motion.button
                    key={String(opt.val)}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => set("hasWebsite", opt.val)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border ${
                      form.hasWebsite === opt.val
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all"
            >
              Comenzar diagnóstico <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
