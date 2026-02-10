import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { responsibilityLevels, generateInstitutionalCard } from "@/data/liderazgosData";

interface InstitutionalIdentityStepProps {
  participantState: string;
  onNext: (data: {
    institutionalRole: string;
    responsibilityLevel: string;
    organization: string;
    orgCauses: string[];
    strategicAudience: string;
    institutionalCard: string;
  }) => void;
}

export function InstitutionalIdentityStep({ participantState, onNext }: InstitutionalIdentityStepProps) {
  const [instRole, setInstRole] = useState("");
  const [level, setLevel] = useState("");
  const [organization, setOrganization] = useState("");
  const [orgCauses, setOrgCauses] = useState<string[]>([""]);
  const [audience, setAudience] = useState("");

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
  const canSubmit = instRole.trim() && level && organization.trim() && validCauses.length > 0 && audience.trim();

  const handleSubmit = () => {
    const card = generateInstitutionalCard(organization, validCauses, audience, participantState);
    onNext({
      institutionalRole: instRole,
      responsibilityLevel: level,
      organization,
      orgCauses: validCauses,
      strategicAudience: audience,
      institutionalCard: card,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-7 h-7 text-coral" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Identidad institucional
        </h2>
        <p className="text-muted-foreground text-sm">Define tu perfil institucional de comunicación</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">Cargo institucional exacto</Label>
          <Input
            value={instRole}
            onChange={(e) => setInstRole(e.target.value)}
            placeholder="Ej: Regidora de Desarrollo Social"
            className="bg-card border-border mt-1"
            maxLength={100}
          />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Nivel de responsabilidad</Label>
          <RadioGroup value={level} onValueChange={setLevel} className="flex gap-2 mt-1">
            {responsibilityLevels.map((l) => (
              <div key={l.value} className="flex items-center space-x-2 bg-card rounded-xl px-4 py-3 border border-border flex-1">
                <RadioGroupItem value={l.value} id={`level-${l.value}`} />
                <Label htmlFor={`level-${l.value}`} className="text-sm cursor-pointer">{l.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Organización o partido</Label>
          <Input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Ej: Gobierno Municipal de..."
            className="bg-card border-border mt-1"
            maxLength={100}
          />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Causas prioritarias de la organización (máx. 3)</Label>
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
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Público estratégico principal</Label>
          <Input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Ej: Mujeres emprendedoras rurales"
            className="bg-card border-border mt-1"
            maxLength={100}
          />
        </div>
      </div>

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
