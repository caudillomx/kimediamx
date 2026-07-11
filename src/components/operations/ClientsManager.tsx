import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Power, Merge, X, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CLIENT_TYPE_META } from "@/hooks/useClientsData";

const TYPE_OPTIONS = ["activo", "probono", "prospecto", "inactivo"] as const;

interface Client {
  id: string;
  name: string;
  is_active: boolean;
  aliases: string[];
  notes: string | null;
  client_type?: string;
  is_probono?: boolean;
}

export default function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Client | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [mergeFrom, setMergeFrom] = useState<Client | null>(null);
  const [mergeTo, setMergeTo] = useState<string>("");
  const [search, setSearch] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clients").select("*").order("name");
    if (error) toast.error(error.message);
    else setClients((data || []) as Client[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();

    const channel = supabase
      .channel("clients_manager_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
        fetchClients();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchClients]);

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return toast.error("El nombre es requerido");
    const payload = {
      name: editing.name.trim(),
      is_active: editing.is_active,
      aliases: editing.aliases.filter(a => a.trim()),
      notes: editing.notes,
      client_type: editing.client_type || "activo",
      is_probono: !!editing.is_probono,
    };
    if (isNew) {
      const { error } = await supabase.from("clients").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Cliente creado");
    } else {
      // If renaming, propagate to action_items.client (text field)
      const original = clients.find(c => c.id === editing.id);
      const renamed = original && original.name !== payload.name;
      const { error } = await supabase.from("clients").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      if (renamed && original) {
        await supabase.from("action_items").update({ client: payload.name }).eq("client", original.name);
        await supabase.from("client_contacts").update({ client_name: payload.name }).eq("client_name", original.name);
        await supabase.from("content_profiles").update({ client_name: payload.name }).eq("client_name", original.name);
        await supabase.from("deals").update({ client_name: payload.name }).eq("client_name", original.name);
        await supabase.from("interactions").update({ client_name: payload.name }).eq("client_name", original.name);
        toast.success("Cliente renombrado y propagado");
      } else {
        toast.success("Cliente actualizado");
      }
    }
    setEditing(null); setIsNew(false);
    fetchClients();
  };

  const handleToggleActive = async (c: Client) => {
    const { error } = await supabase.from("clients").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) toast.error(error.message);
    else { toast.success(c.is_active ? "Desactivado" : "Activado"); fetchClients(); }
  };

  const handleDelete = async (c: Client) => {
    if (!confirm(`¿Eliminar "${c.name}" del catálogo? No borra tareas/deals históricos.`)) return;
    const { error } = await supabase.from("clients").delete().eq("id", c.id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); fetchClients(); }
  };

  const handleMerge = async () => {
    if (!mergeFrom || !mergeTo || mergeFrom.name === mergeTo) return;
    if (!confirm(`Fusionar todas las tareas, deals e interacciones de "${mergeFrom.name}" hacia "${mergeTo}"?`)) return;
    await supabase.from("action_items").update({ client: mergeTo }).eq("client", mergeFrom.name);
    await supabase.from("client_contacts").update({ client_name: mergeTo }).eq("client_name", mergeFrom.name);
    await supabase.from("content_profiles").update({ client_name: mergeTo }).eq("client_name", mergeFrom.name);
    await supabase.from("deals").update({ client_name: mergeTo }).eq("client_name", mergeFrom.name);
    await supabase.from("interactions").update({ client_name: mergeTo }).eq("client_name", mergeFrom.name);
    await supabase.from("clients").delete().eq("id", mergeFrom.id);
    toast.success("Fusionados");
    setMergeFrom(null); setMergeTo("");
    fetchClients();
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Catálogo de clientes</h2>
          <p className="text-xs text-muted-foreground">Activos aparecen en filtros y selectores. Inactivos se conservan para historial.</p>
        </div>
        <Button onClick={() => { setIsNew(true); setEditing({ id: "", name: "", is_active: true, aliases: [], notes: "", client_type: "activo", is_probono: false }); }} className="bg-gradient-coral text-primary-foreground">
          <Plus className="w-4 h-4 mr-1.5" /> Nuevo
        </Button>
      </div>

      <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(c => (
            <Card key={c.id} className={`p-4 ${!c.is_active ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                    {c.client_type && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${CLIENT_TYPE_META[c.client_type]?.badgeClass || "bg-muted text-muted-foreground border-border"}`}>
                        {CLIENT_TYPE_META[c.client_type]?.label || c.client_type}
                      </span>
                    )}
                    {c.is_probono && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-blue-500/15 text-blue-600 border-blue-500/30">PRO BONO</span>
                    )}
                    {!c.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">inactivo</span>}
                  </div>
                  {c.aliases.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Apodos: {c.aliases.join(", ")}</p>
                  )}
                  {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setIsNew(false); }} title="Editar">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleToggleActive(c)} title={c.is_active ? "Desactivar" : "Activar"}>
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setMergeFrom(c); setMergeTo(""); }} title="Fusionar">
                    <Merge className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(c)} title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/New modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setEditing(null); setIsNew(false); }}>
          <Card className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{isNew ? "Nuevo cliente" : "Editar cliente"}</h3>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Nombre</label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                {!isNew && <p className="text-[10px] text-muted-foreground mt-1">Renombrar propaga el cambio a todas las tareas, deals e interacciones.</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Apodos (separados por coma)</label>
                <Input
                  value={editing.aliases.join(", ")}
                  onChange={e => setEditing({ ...editing, aliases: e.target.value.split(",").map(s => s.trim()) })}
                  placeholder="Tinver, Diluvio..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Notas</label>
                <Input value={editing.notes || ""} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tipo</label>
                <select
                  className="w-full p-2 rounded border border-border bg-background text-foreground text-sm"
                  value={editing.client_type || "activo"}
                  onChange={e => setEditing({ ...editing, client_type: e.target.value })}
                >
                  {TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{CLIENT_TYPE_META[t]?.label || t}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.is_probono} onChange={e => setEditing({ ...editing, is_probono: e.target.checked })} />
                Pro bono
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                Activo
              </label>
              <Button onClick={handleSave} className="w-full bg-gradient-coral text-primary-foreground">
                <Save className="w-4 h-4 mr-1.5" /> Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Merge modal */}
      {mergeFrom && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMergeFrom(null)}>
          <Card className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-3">Fusionar "{mergeFrom.name}" hacia...</h3>
            <select className="w-full p-2 rounded border border-border bg-background text-foreground" value={mergeTo} onChange={e => setMergeTo(e.target.value)}>
              <option value="">Selecciona destino</option>
              {clients.filter(c => c.id !== mergeFrom.id).map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground mt-2">Mueve todas las tareas, deals, interacciones y contactos al cliente destino, y elimina el origen.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" onClick={() => setMergeFrom(null)} className="flex-1">Cancelar</Button>
              <Button onClick={handleMerge} disabled={!mergeTo} className="flex-1 bg-gradient-coral text-primary-foreground">Fusionar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
