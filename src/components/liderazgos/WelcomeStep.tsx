import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, User, MapPin, Briefcase, AtSign, HelpCircle, Users, Wifi, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mexicanStates, followerRanges, channelOptions } from "@/data/liderazgosData";

export interface ParticipantInfo {
  fullName: string;
  state: string;
  roleTitle: string;
  socialHandle: string;
  approxFollowers: string;
  mainChannel: string;
  hasCommTeam: boolean;
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
    approxFollowers: "",
    mainChannel: "",
    hasCommTeam: false,
  });

  const isValid = form.fullName.trim() && form.state && form.roleTitle.trim() && form.socialHandle.trim() && form.approxFollowers && form.mainChannel;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext(form);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.4 },
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
                  <p className="max-w-[200px] text-xs">Tu usuario de Instagram, Facebook o X. Puede ser personal o institucional.</p>
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

          {/* New enriched fields */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-coral" /> Canal principal
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">La red social donde eres más activa o donde está tu audiencia principal</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {channelOptions.map((ch) => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => setForm({ ...form, mainChannel: ch.value })}
                  className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all border ${
                    form.mainChannel === ch.value
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-border bg-card text-muted-foreground hover:border-coral/30"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-coral" /> Seguidores aproximados
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">El total aproximado de seguidores en tu red social principal. No necesita ser exacto.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={form.approxFollowers} onValueChange={(v) => setForm({ ...form, approxFollowers: v })}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Rango de seguidores" />
              </SelectTrigger>
              <SelectContent>
                {followerRanges.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-coral" /> ¿Tienes equipo de comunicación?
            </Label>
            <div className="flex gap-3">
              {[
                { val: true, label: "Sí" },
                { val: false, label: "No, lo hago sola" },
              ].map((opt) => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => setForm({ ...form, hasCommTeam: opt.val })}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border ${
                    form.hasCommTeam === opt.val
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-border bg-card text-muted-foreground hover:border-coral/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 mt-4"
            >
              Comenzar diagnóstico
            </Button>
          </motion.div>
        </form>
      </TooltipProvider>
    </motion.div>
  );
}
