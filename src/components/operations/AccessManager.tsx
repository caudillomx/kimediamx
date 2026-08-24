import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  UserPlus, RefreshCw, KeyRound, Mail, Building2, ShieldCheck, Pencil, Eye,
} from "lucide-react";

type AccessUser = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
  roles: string[];
  is_portal_user: boolean;
};

type RoleValue = "admin" | "editor" | "viewer" | "none";

const ROLE_META: Record<Exclude<RoleValue, "none">, { label: string; hint: string; icon: any; cls: string }> = {
  admin: {
    label: "Admin",
    hint: "Acceso total: operación, pipeline comercial y gestión de accesos.",
    icon: ShieldCheck,
    cls: "bg-gradient-coral text-primary-foreground",
  },
  editor: {
    label: "Editor",
    hint: "Ve y edita la operación (tareas, clientes, parrillas, activos, minutas). Sin pipeline ni accesos.",
    icon: Pencil,
    cls: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  },
  viewer: {
    label: "Viewer",
    hint: "Solo lectura de la operación. No puede crear ni editar nada.",
    icon: Eye,
    cls: "bg-muted text-muted-foreground",
  },
};

const roleOf = (u: AccessUser): RoleValue =>
  u.roles.includes("admin") ? "admin"
  : u.roles.includes("editor") ? "editor"
  : u.roles.includes("viewer") ? "viewer"
  : "none";

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";


export default function AccessManager() {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteRole, setInviteRole] = useState<Exclude<RoleValue, "none">>("editor");


  const [pwUser, setPwUser] = useState<AccessUser | null>(null);
  const [newPw, setNewPw] = useState("");

  const call = useCallback(async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("manage-team-access", { body: payload });
    if (error) throw new Error(error.message);
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call({ action: "list" });
      setUsers(data.users ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "No se pudo cargar accesos");
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => { load(); }, [load]);

  const setRole = async (u: AccessUser, role: RoleValue) => {
    setBusy(u.id);
    try {
      const data = await call({ action: "set_role", user_id: u.id, role });
      setUsers(data.users ?? []);
      toast.success(role === "none" ? "Rol retirado" : `Rol actualizado a ${ROLE_META[role].label}`);
    } catch (e: any) {
      toast.error(e.message ?? "Error al actualizar el rol");
    } finally {
      setBusy(null);
    }
  };

  const invite = async () => {
    setBusy("invite");
    try {
      const data = await call({
        action: "invite",
        email,
        full_name: fullName,
        password,
        role: inviteRole,
      });
      setUsers(data.users ?? []);
      toast.success(`Cuenta creada con rol ${ROLE_META[inviteRole].label}`);
      setInviteOpen(false);
      setEmail(""); setFullName(""); setPassword("");
    } catch (e: any) {
      toast.error(e.message ?? "Error al crear la cuenta");
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async () => {
    if (!pwUser) return;
    setBusy("pw");
    try {
      await call({ action: "set_password", user_id: pwUser.id, password: newPw });
      toast.success("Contraseña actualizada");
      setPwUser(null); setNewPw("");
    } catch (e: any) {
      toast.error(e.message ?? "Error al cambiar la contraseña");
    } finally {
      setBusy(null);
    }
  };

  const hasOpsRole = (u: AccessUser) => roleOf(u) !== "none";
  const admins = users.filter(u => roleOf(u) === "admin");
  const editors = users.filter(u => roleOf(u) === "editor");
  const viewers = users.filter(u => roleOf(u) === "viewer");
  const team = users.filter(u => !hasOpsRole(u) && !u.is_portal_user);
  const portal = users.filter(u => u.is_portal_user && !hasOpsRole(u));

  const Row = ({ u }: { u: AccessUser }) => {
    const current = roleOf(u);
    const meta = current === "none" ? null : ROLE_META[current];
    const Icon = meta?.icon;
    return (
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-card border border-border">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{u.full_name || u.email}</span>
            {meta && (
              <Badge className={`${meta.cls} text-[10px]`}>
                {Icon && <Icon className="w-3 h-3 mr-1" />}{meta.label}
              </Badge>
            )}
            {u.is_portal_user && (
              <Badge variant="secondary" className="text-[10px]"><Building2 className="w-3 h-3 mr-1" />Portal cliente</Badge>
            )}
            {!u.confirmed && <Badge variant="outline" className="text-[10px]">Sin confirmar</Badge>}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" /> {u.email}
          </p>
        </div>
        <div className="text-xs text-muted-foreground w-[150px]">
          Último acceso: {fmt(u.last_sign_in_at)}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={() => { setPwUser(u); setNewPw(""); }}>
            <KeyRound className="w-3.5 h-3.5 mr-1" /> Contraseña
          </Button>
          <Select value={current} onValueChange={(v) => setRole(u, v as RoleValue)} disabled={busy === u.id}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              {busy === u.id
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <SelectValue placeholder="Sin rol" />}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="none">Sin rol</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const Group = ({ title, hint, list }: { title: string; hint: string; list: AccessUser[] }) => (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title} <span className="text-muted-foreground font-normal">({list.length})</span></h3>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {list.length === 0
        ? <p className="text-xs text-muted-foreground italic py-2">Nadie por aquí.</p>
        : list.map(u => <Row key={u.id} u={u} />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Accesos a Operación</h2>
          <p className="text-sm text-muted-foreground">
            Cada cuenta necesita un rol para ver datos. Sin rol, el panel se ve vacío.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setInviteOpen(true)} className="bg-gradient-coral text-primary-foreground font-semibold">
            <UserPlus className="w-4 h-4 mr-1.5" /> Nueva cuenta
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(["admin", "editor", "viewer"] as const).map((r) => {
          const M = ROLE_META[r];
          const Icon = M.icon;
          return (
            <div key={r} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${M.cls} text-[10px]`}><Icon className="w-3 h-3 mr-1" />{M.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{M.hint}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-6 h-6 text-coral animate-spin" /></div>
      ) : (
        <div className="space-y-8">
          <Group title="Administradores" hint="Acceso completo, incluido pipeline comercial y esta pantalla." list={admins} />
          <Group title="Editores" hint="Operan el día a día: tareas, clientes, parrillas, activos y minutas." list={editors} />
          <Group title="Solo lectura" hint="Consultan la operación sin poder modificar nada." list={viewers} />
          <Group title="Cuentas sin rol" hint="Pueden iniciar sesión pero verán el panel vacío hasta asignarles un rol." list={team} />
          <Group title="Usuarios de portales de cliente" hint="Acceso solo a su portal. No les des rol interno salvo que sean del equipo." list={portal} />
        </div>
      )}


      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva cuenta de Operación</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ana Sofía Roces" />
            </div>
            <div>
              <Label>Correo</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nombre@kimedia.mx" />
            </div>
            <div>
              <Label>Rol</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Exclude<RoleValue, "none">)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — acceso total</SelectItem>
                  <SelectItem value="editor">Editor — opera sin pipeline ni accesos</SelectItem>
                  <SelectItem value="viewer">Viewer — solo lectura</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{ROLE_META[inviteRole].hint}</p>
            </div>
            <div>
              <Label>Contraseña temporal</Label>
              <Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mín. 8 caracteres" />
              <p className="text-xs text-muted-foreground mt-1">Compártela por un canal seguro; podrá cambiarla luego.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button onClick={invite} disabled={busy === "invite"} className="bg-gradient-coral text-primary-foreground">
              {busy === "invite" ? "Creando..." : `Crear como ${ROLE_META[inviteRole].label}`}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pwUser} onOpenChange={o => { if (!o) { setPwUser(null); setNewPw(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cambiar contraseña · {pwUser?.email}</DialogTitle></DialogHeader>
          <div>
            <Label>Nueva contraseña</Label>
            <Input type="text" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mín. 8 caracteres" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setPwUser(null); setNewPw(""); }}>Cancelar</Button>
            <Button onClick={savePassword} disabled={busy === "pw"} className="bg-gradient-coral text-primary-foreground">
              {busy === "pw" ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
