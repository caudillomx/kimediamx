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
import {
  ShieldCheck, ShieldOff, UserPlus, RefreshCw, KeyRound, Mail, Building2,
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

  const toggleAdmin = async (u: AccessUser) => {
    const isAdmin = u.roles.includes("admin");
    setBusy(u.id);
    try {
      const data = await call({ action: isAdmin ? "revoke_admin" : "grant_admin", user_id: u.id });
      setUsers(data.users ?? []);
      toast.success(isAdmin ? "Acceso de admin retirado" : "Acceso de admin otorgado");
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
        make_admin: true,
      });
      setUsers(data.users ?? []);
      toast.success("Cuenta creada con acceso de admin");
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

  const admins = users.filter(u => u.roles.includes("admin"));
  const team = users.filter(u => !u.roles.includes("admin") && !u.is_portal_user);
  const portal = users.filter(u => u.is_portal_user && !u.roles.includes("admin"));

  const Row = ({ u }: { u: AccessUser }) => {
    const isAdmin = u.roles.includes("admin");
    return (
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-card border border-border">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{u.full_name || u.email}</span>
            {isAdmin && <Badge className="bg-gradient-coral text-primary-foreground text-[10px]">Admin</Badge>}
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
          <Button
            variant={isAdmin ? "outline" : "default"}
            size="sm"
            disabled={busy === u.id}
            onClick={() => toggleAdmin(u)}
            className={isAdmin ? "" : "bg-gradient-coral text-primary-foreground"}
          >
            {busy === u.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : isAdmin ? <><ShieldOff className="w-3.5 h-3.5 mr-1" /> Quitar admin</>
              : <><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Dar admin</>}
          </Button>
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
            Solo las cuentas con rol admin pueden ver y editar tareas, clientes, pipeline y minutas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setInviteOpen(true)} className="bg-gradient-coral text-primary-foreground font-semibold">
            <UserPlus className="w-4 h-4 mr-1.5" /> Nueva cuenta
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-6 h-6 text-coral animate-spin" /></div>
      ) : (
        <div className="space-y-8">
          <Group title="Administradores" hint="Acceso completo al panel de Operación." list={admins} />
          <Group title="Cuentas sin rol" hint="Pueden iniciar sesión pero verán el panel vacío hasta darles admin." list={team} />
          <Group title="Usuarios de portales de cliente" hint="Acceso solo a su portal. No les des admin salvo que sean del equipo." list={portal} />
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
              <Label>Contraseña temporal</Label>
              <Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mín. 8 caracteres" />
              <p className="text-xs text-muted-foreground mt-1">Compártela por un canal seguro; podrá cambiarla luego.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button onClick={invite} disabled={busy === "invite"} className="bg-gradient-coral text-primary-foreground">
              {busy === "invite" ? "Creando..." : "Crear con acceso admin"}
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
