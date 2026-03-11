import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal, DEAL_STAGES } from "@/hooks/useDealsData";
import { TeamMember, CLIENTS } from "@/hooks/useOperationsData";
import { Save } from "lucide-react";

interface DealModalProps {
  deal: Deal | null;
  teamMembers: TeamMember[];
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Deal>) => void;
  onCreate?: (deal: Omit<Deal, "id" | "created_at" | "updated_at">) => void;
  isNew?: boolean;
}

const DealModal = ({ deal, teamMembers, open, onClose, onSave, onCreate, isNew }: DealModalProps) => {
  const [form, setForm] = useState({
    name: "",
    client_name: "",
    contact_name: null as string | null,
    description: null as string | null,
    estimated_value: null as number | null,
    stage: "prospecto",
    estimated_start_date: null as string | null,
    closed_date: null as string | null,
    responsible_id: null as string | null,
    responsible_name: null as string | null,
    notes: null as string | null,
    source: null as string | null,
  });

  useEffect(() => {
    if (deal) {
      setForm({
        name: deal.name,
        client_name: deal.client_name,
        contact_name: deal.contact_name,
        description: deal.description,
        estimated_value: deal.estimated_value,
        stage: deal.stage,
        estimated_start_date: deal.estimated_start_date,
        closed_date: deal.closed_date,
        responsible_id: deal.responsible_id,
        responsible_name: deal.responsible_name,
        notes: deal.notes,
        source: deal.source,
      });
    } else {
      setForm({
        name: "", client_name: "", contact_name: null, description: null,
        estimated_value: null, stage: "prospecto", estimated_start_date: null,
        closed_date: null, responsible_id: null, responsible_name: null,
        notes: null, source: null,
      });
    }
  }, [deal, open]);

  const handleResponsibleChange = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    setForm(prev => ({ ...prev, responsible_id: memberId || null, responsible_name: member?.full_name || null }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.client_name.trim()) return;
    if (isNew && onCreate) {
      onCreate(form as any);
    } else if (deal) {
      onSave(deal.id, form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            {isNew ? "Nueva oportunidad" : "Editar oportunidad"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-foreground">Nombre del proyecto / oportunidad</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Auditoría digital León"
              className="bg-secondary border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground">Cliente</Label>
              <Select value={form.client_name || "custom"} onValueChange={(v) => setForm(prev => ({ ...prev, client_name: v === "custom" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value="custom">Otro (escribir)</SelectItem>
                </SelectContent>
              </Select>
              {(form.client_name === "" || !CLIENTS.includes(form.client_name)) && form.client_name !== null && (
                <Input
                  value={form.client_name}
                  onChange={(e) => setForm(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Nombre del cliente..."
                  className="bg-secondary border-border mt-1"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Contacto</Label>
              <Input
                value={form.contact_name || ""}
                onChange={(e) => setForm(prev => ({ ...prev, contact_name: e.target.value || null }))}
                placeholder="Nombre del contacto"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground">Valor estimado (MXN)</Label>
              <Input
                type="number"
                value={form.estimated_value || ""}
                onChange={(e) => setForm(prev => ({ ...prev, estimated_value: e.target.value ? Number(e.target.value) : null }))}
                placeholder="50000"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Etapa</Label>
              <Select value={form.stage} onValueChange={(v) => setForm(prev => ({ ...prev, stage: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground">Responsable</Label>
              <Select value={form.responsible_id || "none"} onValueChange={(v) => handleResponsibleChange(v === "none" ? "" : v)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Asignar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {teamMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Inicio estimado</Label>
              <Input
                type="date"
                value={form.estimated_start_date || ""}
                onChange={(e) => setForm(prev => ({ ...prev, estimated_start_date: e.target.value || null }))}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Fuente / Origen</Label>
            <Input
              value={form.source || ""}
              onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value || null }))}
              placeholder="Ej: Referido, Minuta semanal, Contacto directo"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Notas</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value || null }))}
              placeholder="Contexto adicional..."
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-gradient-coral text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              {isNew ? "Crear" : "Guardar"}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-border">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DealModal;
