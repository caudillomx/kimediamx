import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActionItem, TeamMember, CATEGORIES, STATUSES, PRIORITIES, CLIENTS } from "@/hooks/useOperationsData";
import { CalendarIcon, Save, Trash2 } from "lucide-react";

interface ActionItemModalProps {
  item: ActionItem | null;
  teamMembers: TeamMember[];
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ActionItem>) => void;
  onCreate?: (item: Omit<ActionItem, "id" | "created_at" | "updated_at">) => void;
  isNew?: boolean;
}

const ActionItemModal = ({ item, teamMembers, open, onClose, onSave, onCreate, isNew }: ActionItemModalProps) => {
  const [form, setForm] = useState({
    description: "",
    responsible_id: "" as string | null,
    responsible_name: "" as string | null,
    category: "tarea",
    status: "pendiente",
    priority: "media",
    due_date: "" as string | null,
    notes: "" as string | null,
    client: "" as string | null,
  });

  useEffect(() => {
    if (item) {
      setForm({
        description: item.description,
        responsible_id: item.responsible_id,
        responsible_name: item.responsible_name,
        category: item.category,
        status: item.status,
        priority: item.priority,
        due_date: item.due_date,
        notes: item.notes,
        client: item.client,
      });
    } else {
      setForm({
        description: "",
        responsible_id: null,
        responsible_name: null,
        category: "tarea",
        status: "pendiente",
        priority: "media",
        due_date: null,
        notes: null,
        client: null,
      });
    }
  }, [item, open]);

  const handleResponsibleChange = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    setForm(prev => ({
      ...prev,
      responsible_id: memberId || null,
      responsible_name: member?.full_name || null,
    }));
  };

  const handleSave = () => {
    if (!form.description.trim()) return;
    if (isNew && onCreate) {
      onCreate({
        ...form,
        minute_id: null,
        completed_at: null,
      } as any);
    } else if (item) {
      onSave(item.id, form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            {isNew ? "Nueva actividad" : "Editar actividad"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-foreground">Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="¿Qué hay que hacer?"
              className="bg-secondary border-border min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground">Responsable</Label>
              <Select value={form.responsible_id || ""} onValueChange={handleResponsibleChange}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Asignar..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Categoría</Label>
              <Select value={form.category} onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Prioridad</Label>
              <Select value={form.priority} onValueChange={(v) => setForm(prev => ({ ...prev, priority: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Estatus</Label>
              <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Fecha de entrega</Label>
            <Input
              type="date"
              value={form.due_date || ""}
              onChange={(e) => setForm(prev => ({ ...prev, due_date: e.target.value || null }))}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Notas</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value || null }))}
              placeholder="Notas adicionales..."
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

export default ActionItemModal;
