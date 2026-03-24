import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, User, Mail, AtSign, Wifi, BarChart3, Briefcase, Globe, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pymeIndustryOptions, companySizeOptions, yearsOptions, pymeChannelOptions } from "@/data/pymeKitData";
import { followerRanges } from "@/data/brandKitData";

export interface PymeParticipantInfo {
  fullName: string;
  email: string;
  companyName: string;
  industry: string;
  companySize: string;
  yearsInBusiness: string;
  socialHandle: string;
  mainChannel: string;
  approxFollowers: string;
  hasWebsite: boolean;
}

interface Props {
  onNext: (info: PymeParticipantInfo) => void;
}

const CHANNEL_EMOJI: Record<string, string> = {
  facebook: "📘", instagram: "📸", "google-business": "📍", tiktok: "🎵", "whatsapp-business": "💬", linkedin: "💼",
};

export function PymeWelcomeStep({ onNext }: Props) {
  const [form, setForm] = useState<PymeParticipantInfo>({
    fullName: "", email: "", companyName: "", industry: "", companySize: "",
    yearsInBusiness: "", socialHandle: "", mainChannel: "", approxFollowers: "", hasWebsite: false,
  });
  const [section, setSection] = useState(0);

  const isCompanyValid = form.fullName.trim() && form.email.trim() && form.companyName.trim() && form.industry && form.companySize && form.yearsInBusiness;
  const isDigitalValid = form.socialHandle.trim() && form.mainChannel && form.approxFollowers;
  const isValid = isCompanyValid && isDigitalValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext(form);
  };

  const set = (key: keyof PymeParticipantInfo, value: string | boolean) =>
    setForm(p => ({ ...p, [key]: value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
          className="w-16 h-16 rounded-3xl bg-gradient-coral flex items-center justify-center mx-auto mb-5 shadow-glow"
        >
          <Building2 className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3"
        >
          Kit Digital <span className="text-gradient">PyME</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto"
        >
          Diagnostica la presencia digital de tu empresa, define tu identidad de marca y genera contenido estratégico.
        </motion.p>
      </div>

      <div className="flex gap-1 p-1 bg-secondary rounded-2xl mb-8">
        {["Datos de la empresa", "Presencia digital"].map((label, i) => (
          <button key={i} onClick={() => setSection(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              section === i ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {section === 0 ? (
          <motion.div key="company" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <User className="w-3.5 h-3.5" /> Nombre del responsable
              </Label>
              <Input value={form.fullName} onChange={e => set("fullName", e.target.value)}
                placeholder="Tu nombre completo" className="bg-secondary border-border rounded-xl h-12 text-foreground" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="contacto@tuempresa.com" className="bg-secondary border-border rounded-xl h-12 text-foreground" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Building2 className="w-3.5 h-3.5" /> Nombre de la empresa
              </Label>
              <Input value={form.companyName} onChange={e => set("companyName", e.target.value)}
                placeholder="Ej: Panadería La Estrella" className="bg-secondary border-border rounded-xl h-12 text-foreground" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Giro o industria</Label>
              <Select value={form.industry} onValueChange={v => set("industry", v)}>
                <SelectTrigger className="bg-secondary border-border rounded-xl h-12"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>{pymeIndustryOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tamaño</Label>
                <Select value={form.companySize} onValueChange={v => set("companySize", v)}>
                  <SelectTrigger className="bg-secondary border-border rounded-xl h-12"><SelectValue placeholder="Empleados" /></SelectTrigger>
                  <SelectContent>{companySizeOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Años</Label>
                <Select value={form.yearsInBusiness} onValueChange={v => set("yearsInBusiness", v)}>
                  <SelectTrigger className="bg-secondary border-border rounded-xl h-12"><SelectValue placeholder="Antigüedad" /></SelectTrigger>
                  <SelectContent>{yearsOptions.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button type="button" onClick={() => setSection(1)} disabled={!isCompanyValid}
              className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all">
              Siguiente: presencia digital <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        ) : (
          <motion.div key="digital" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <AtSign className="w-3.5 h-3.5" /> Perfil en redes
              </Label>
              <Input value={form.socialHandle} onChange={e => set("socialHandle", e.target.value)}
                placeholder="@tuempresa" className="bg-secondary border-border rounded-xl h-12 text-foreground" maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Wifi className="w-3.5 h-3.5" /> Canal principal
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {pymeChannelOptions.map(ch => (
                  <motion.button key={ch.value} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => set("mainChannel", ch.value)}
                    className={`rounded-xl px-3 py-3 text-xs font-medium transition-all border flex items-center justify-center gap-1.5 ${
                      form.mainChannel === ch.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                    }`}>
                    <span>{CHANNEL_EMOJI[ch.value] || "📱"}</span> {ch.label}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <Briefcase className="w-3.5 h-3.5" /> Seguidores
              </Label>
              <Select value={form.approxFollowers} onValueChange={v => set("approxFollowers", v)}>
                <SelectTrigger className="bg-secondary border-border rounded-xl h-12"><SelectValue placeholder="Rango" /></SelectTrigger>
                <SelectContent>{followerRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> ¿Tienen sitio web?
              </Label>
              <div className="flex gap-2">
                {[{ val: true, label: "Sí" }, { val: false, label: "No" }].map(opt => (
                  <motion.button key={String(opt.val)} type="button" whileTap={{ scale: 0.95 }}
                    onClick={() => set("hasWebsite", opt.val)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border ${
                      form.hasWebsite === opt.val
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                    }`}>
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={!isValid}
              className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all">
              Comenzar diagnóstico empresarial <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
