import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, User, MapPin, Briefcase, AtSign, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mexicanStates } from "@/data/liderazgosData";

export interface ParticipantInfo {
  fullName: string;
  state: string;
  roleTitle: string;
  socialHandle: string;
}

interface WelcomeStepProps {
  onNext: (info: ParticipantInfo) => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [form, setForm] = useState<ParticipantInfo>({
    fullName: "",
    state: "",
    roleTitle: "",
    socialHandle: "",
  });

  const isValid = form.fullName.trim() && form.state && form.roleTitle.trim() && form.socialHandle.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext(form);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-4 shadow-glow"
        >
          <Zap className="w-7 h-7 text-primary-foreground" />
        </motion.div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Activa tu liderazgo digital en 10 minutos
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Diagnostica tu presencia, construye tu mensaje y publica tu primer contenido político con propósito.
        </p>
      </div>

      <TooltipProvider delayDuration={300}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-coral" /> Nombre completo
            </Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Tu nombre completo"
              className="bg-card border-border"
              maxLength={100}
            />
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-coral" /> Estado
            </Label>
            <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Selecciona tu estado" />
              </SelectTrigger>
              <SelectContent>
                {mexicanStates.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-coral" /> Cargo o rol
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">Tu cargo actual o el rol que desempeñas en tu comunidad o institución</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              value={form.roleTitle}
              onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
              placeholder="Ej: Regidora, activista, líder comunitaria"
              className="bg-card border-border"
              maxLength={100}
            />
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <AtSign className="w-4 h-4 text-coral" /> Usuario principal de red social
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">Tu usuario de Instagram, Facebook o X (Twitter). Puede ser personal o institucional.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              value={form.socialHandle}
              onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
              placeholder="@tuusuario"
              className="bg-card border-border"
              maxLength={50}
            />
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 mt-6"
            >
              Comenzar diagnóstico
            </Button>
          </motion.div>
        </form>
      </TooltipProvider>
    </motion.div>
  );
}
