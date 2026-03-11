import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Interaction, INTERACTION_TYPES } from "@/hooks/useInteractionsData";
import { CLIENTS } from "@/hooks/useOperationsData";
import { Save, Phone, Mail, Users, MessageCircle, Handshake } from "lucide-react";

const iconMap: Record<string, any> = { Phone, Mail, Users, MessageCircle, Handshake };

interface InteractionModalProps {
  interaction: Interaction | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Interaction>) => void;
  onCreate?: (interaction: Omit<Interaction, "id" | "created_at" | "updated_at">) => void;
  isNew?: boolean;
  contactSuggestions?: string[];
}

const InteractionModal = ({ interaction, open, onClose, onSave, onCreate, isNew, contactSuggestions = [] }: InteractionModalProps) => {
  const [form, setForm] = useState({
    contact_name: "",
    client_name: "",
    interaction_type: "llamada",
    subject: "",
    notes: null as string | null,
    outcome: null as string | null,
    follow_up_date: null as string | null,
    follow_up_done: false,
    logged_by: null as string | null,
  });

  useEffect(() => {
    if (interaction) {
      setForm({
        contact_name: interaction.contact_name,
        client_name: interaction.client_name,
        interaction_type: interaction.interaction_type,
        subject: interaction.subject,
        notes: interaction.notes,
        outcome: interaction.outcome,
        follow_up_date: interaction.follow_up_date,
        follow_up_done: interaction.follow_up_done,
        logged_by: interaction.logged_by,
      });
    } else {
      setForm({
        contact_name: "",
        client_name: "",
        interaction_type: "llamada",
        subject: "",
        notes: null,
        outcome: null,
        follow_up_date: null,
        follow_up_done: false,
        logged_by: null,
      });
    }
  }, [interaction, open]);

  const handleSave = () => {
    if (!form.contact_name || !form.client_name || !form.subject) return;
    if (isNew && onCreate) {
      onCreate(form);
    } else if (interaction) {
      onSave(interaction.id, form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display">
            {isNew ? "Registrar interacción" : "Editar interacción"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Type selector */}
          <div className="flex gap-2 flex-wrap">
            {INTERACTION_TYPES.map(t => {
              const Icon = iconMap[t.icon] || Phone;
              return (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, interaction_type: t.value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    form.interaction_type === t.value
                      ? `bg-${t.color}/20 border-${t.color} text-foreground`
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Contacto</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => setForm(f => ({ ...f, contact_name: e.target.value }))}
                placeholder="Nombre del contacto"
                className="bg-secondary border-border mt-1"
                list="contact-suggestions"
              />
              {contactSuggestions.length > 0 && (
                <datalist id="contact-suggestions">
                  {contactSuggestions.map(c => <option key={c} value={c} />)}
                </datalist>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Cliente</Label>
              <Select value={form.client_name || "none"} onValueChange={(v) => setForm(f => ({ ...f, client_name: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border mt-1">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seleccionar...</SelectItem>
                  {CLIENTS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Asunto</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="¿De qué se habló?"
              className="bg-secondary border-border mt-1"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Notas / Detalle</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value || null }))}
              placeholder="Detalles de la conversación..."
              className="bg-secondary border-border mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Resultado / Acuerdo</Label>
            <Input
              value={form.outcome || ""}
              onChange={(e) => setForm(f => ({ ...f, outcome: e.target.value || null }))}
              placeholder="¿Qué se acordó?"
              className="bg-secondary border-border mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Siguiente acción</Label>
              <Input
                type="date"
                value={form.follow_up_date || ""}
                onChange={(e) => setForm(f => ({ ...f, follow_up_date: e.target.value || null }))}
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.follow_up_done}
                  onChange={(e) => setForm(f => ({ ...f, follow_up_done: e.target.checked }))}
                  className="rounded"
                />
                Follow-up completado
              </label>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-gradient-coral text-primary-foreground font-semibold">
            <Save className="w-4 h-4 mr-1.5" />
            {isNew ? "Registrar" : "Guardar cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InteractionModal;
