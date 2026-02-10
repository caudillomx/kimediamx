import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, User, Mail, AtSign, Wifi, BarChart3, HelpCircle, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

export function PymeWelcomeStep({ onNext }: Props) {
  const [form, setForm] = useState<PymeParticipantInfo>({
    fullName: "",
    email: "",
    companyName: "",
    industry: "",
    companySize: "",
    yearsInBusiness: "",
    socialHandle: "",
    mainChannel: "",
    approxFollowers: "",
    hasWebsite: false,
  });

  const isValid =
    form.fullName.trim() && form.email.trim() && form.companyName.trim() &&
    form.industry && form.companySize && form.yearsInBusiness &&
    form.socialHandle.trim() && form.mainChannel && form.approxFollowers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext(form);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
  };

  const set = (key: keyof PymeParticipantInfo, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-4 shadow-glow">
          <Building2 className="w-7 h-7 text-primary-foreground" />
        </motion.div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Kit Digital para PyMEs</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Diagnostica la presencia digital de tu empresa, define tu identidad de marca y genera contenido estratégico.
        </p>
      </div>

      <TooltipProvider delayDuration={300}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-coral" /> Nombre del responsable</Label>
            <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Tu nombre completo" className="bg-card border-border" maxLength={100} />
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-coral" /> Correo electrónico</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contacto@tuempresa.com" className="bg-card border-border" maxLength={100} />
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-coral" /> Nombre de la empresa
              <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent><p className="max-w-[200px] text-xs">El nombre comercial de tu negocio o empresa</p></TooltipContent>
              </Tooltip>
            </Label>
            <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Ej: Panadería La Estrella" className="bg-card border-border" maxLength={100} />
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-coral" /> Giro o industria</Label>
            <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
              <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Selecciona tu industria" /></SelectTrigger>
              <SelectContent>{pymeIndustryOptions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
              <Label className="text-sm">Tamaño del equipo</Label>
              <Select value={form.companySize} onValueChange={(v) => set("companySize", v)}>
                <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Empleados" /></SelectTrigger>
                <SelectContent>{companySizeOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </motion.div>

            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
              <Label className="text-sm">Años de operación</Label>
              <Select value={form.yearsInBusiness} onValueChange={(v) => set("yearsInBusiness", v)}>
                <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Años" /></SelectTrigger>
                <SelectContent>{yearsOptions.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
              </Select>
            </motion.div>
          </div>

          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><AtSign className="w-4 h-4 text-coral" /> Perfil de la empresa en redes</Label>
            <Input value={form.socialHandle} onChange={(e) => set("socialHandle", e.target.value)} placeholder="@tuempresa" className="bg-card border-border" maxLength={50} />
          </motion.div>

          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><Wifi className="w-4 h-4 text-coral" /> Canal principal</Label>
            <div className="grid grid-cols-3 gap-2">
              {pymeChannelOptions.map((ch) => (
                <button key={ch.value} type="button" onClick={() => set("mainChannel", ch.value)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all border ${form.mainChannel === ch.value ? "border-coral bg-coral/10 text-coral" : "border-border bg-card text-muted-foreground hover:border-coral/30"}`}>
                  {ch.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm"><BarChart3 className="w-4 h-4 text-coral" /> Seguidores aproximados</Label>
            <Select value={form.approxFollowers} onValueChange={(v) => set("approxFollowers", v)}>
              <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Rango de seguidores" /></SelectTrigger>
              <SelectContent>{followerRanges.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </motion.div>

          <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="text-sm">¿Tu empresa tiene sitio web?</Label>
            <div className="flex gap-3">
              {[{ val: true, label: "Sí" }, { val: false, label: "No" }].map((opt) => (
                <button key={String(opt.val)} type="button" onClick={() => set("hasWebsite", opt.val)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border ${form.hasWebsite === opt.val ? "border-coral bg-coral/10 text-coral" : "border-border bg-card text-muted-foreground hover:border-coral/30"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible">
            <Button type="submit" disabled={!isValid} className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 mt-4">
              Comenzar diagnóstico empresarial
            </Button>
          </motion.div>
        </form>
      </TooltipProvider>
    </motion.div>
  );
}
