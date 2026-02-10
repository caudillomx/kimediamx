import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Plus, X, HelpCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { responsibilityLevels, generateInstitutionalCard, budgetOptions } from "@/data/liderazgosData";

interface InstitutionalIdentityStepProps {
  participantState: string;
  onNext: (data: {
    institutionalRole: string;
    responsibilityLevel: string;
    organization: string;
    orgCauses: string[];
    strategicAudience: string;
    institutionalCard: string;
    commBudget: string;
  }) => void;
}

export function InstitutionalIdentityStep({ participantState, onNext }: InstitutionalIdentityStepProps) {
  const [instRole, setInstRole] = useState("");
  const [level, setLevel] = useState("");
  const [organization, setOrganization] = useState("");
  const [orgCauses, setOrgCauses] = useState<string[]>([""]);
  const [audience, setAudience] = useState("");
  const [budget, setBudget] = useState("");

  const addCause = () => {
    if (orgCauses.length < 3) setOrgCauses([...orgCauses, ""]);
  };

  const removeCause = (i: number) => {
    setOrgCauses(orgCauses.filter((_, idx) => idx !== i));
  };

  const updateCause = (i: number, val: string) => {
    const updated = [...orgCauses];
    updated[i] = val;
    setOrgCauses(updated);
  };

  const validCauses = orgCauses.filter((c) => c.trim());
  const canSubmit = instRole.trim() && level && organization.trim() && validCauses.length > 0 && audience.trim() && budget;

  const handleSubmit = () => {
    const card = generateInstitutionalCard(organization, validCauses, audience, participantState);
    onNext({
      institutionalRole: instRole,
      responsibilityLevel: level,
      organization,
      orgCauses: validCauses,
      strategicAudience: audience,
      institutionalCard: card,
      commBudget: budget,
    });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
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
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4"
        >
          <Building2 className="w-7 h-7 text-coral" />
        </motion.div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Identidad institucional
        </h2>
        <p className="text-muted-foreground text-sm">Define tu perfil institucional de comunicación</p>
      </div>

      <TooltipProvider delayDuration={300}>
        <div className="space-y-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              Cargo institucional exacto
              <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 cursor-help" /></TooltipTrigger>
                <TooltipContent><p className="max-w-[200px] text-xs">El nombre oficial de tu puesto tal como aparece en documentos institucionales</p></TooltipContent>
              </Tooltip>
            </Label>
            <Input
              value={instRole}
              onChange={(e) => setInstRole(e.target.value)}
              placeholder="Ej: Regidora de Desarrollo Social"
              className="bg-card border-border mt-1"
              maxLength={100}
            />
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Label className="text-sm text-muted-foreground">Nivel de responsabilidad</Label>
            <RadioGroup value={level} onValueChange={setLevel} className="flex gap-2 mt-1">
              {responsibilityLevels.map((l) => (
                <div key={l.value} className="flex items-center space-x-2 bg-card rounded-xl px-4 py-3 border border-border hover:border-coral/30 transition-colors flex-1">
                  <RadioGroupItem value={l.value} id={`level-${l.value}`} />
                  <Label htmlFor={`level-${l.value}`} className="text-sm cursor-pointer">{l.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Label className="text-sm text-muted-foreground">Organización o partido</Label>
            <Input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Ej: Gobierno Municipal de..."
              className="bg-card border-border mt-1"
              maxLength={100}
            />
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              Causas prioritarias de la organización (máx. 3)
              <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 cursor-help" /></TooltipTrigger>
                <TooltipContent><p className="max-w-[200px] text-xs">Los temas principales que tu organización impulsa. Puedes agregar hasta 3 causas.</p></TooltipContent>
              </Tooltip>
            </Label>
            <div className="space-y-2 mt-1">
              {orgCauses.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={c}
                    onChange={(e) => updateCause(i, e.target.value)}
                    placeholder={`Causa ${i + 1}`}
                    className="bg-card border-border flex-1"
                    maxLength={80}
                  />
                  {orgCauses.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeCause(i)} className="shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {orgCauses.length < 3 && (
                <Button variant="ghost" size="sm" onClick={addCause} className="text-coral text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Agregar causa
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              Público estratégico principal
              <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 cursor-help" /></TooltipTrigger>
                <TooltipContent><p className="max-w-[200px] text-xs">El grupo de personas al que tu organización dirige sus acciones y comunicación</p></TooltipContent>
              </Tooltip>
            </Label>
            <Input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ej: Mujeres emprendedoras rurales"
              className="bg-card border-border mt-1"
              maxLength={100}
            />
          </motion.div>

          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-coral" />
              Presupuesto para comunicación
              <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 cursor-help" /></TooltipTrigger>
                <TooltipContent><p className="max-w-[200px] text-xs">Nos ayuda a calibrar las recomendaciones a tus recursos reales</p></TooltipContent>
              </Tooltip>
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {budgetOptions.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBudget(b.value)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all border ${
                    budget === b.value
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-border bg-card text-muted-foreground hover:border-coral/30"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </TooltipProvider>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full mt-6 bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
      >
        Continuar a vocería <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
