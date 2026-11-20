import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FoxLogo } from '@/components/centro-fox-2027/Parts';
import { castCf27Vote, useCf27Votes } from '@/hooks/useCf27Votes';
import { myTeamId, registerTeam, saveExercise, useCf27Teams } from '@/hooks/useCf27Teams';
import { isClean, normalizeWord } from '@/data/centroFox2027';
import { CASE_TYPES, DECISIONS, FIRE, FUNNEL, HABITS, PRACTICES, PROMPTS, attackerOf, habitKey, targetOf, words40, type Ex1, type Ex2, type Ex3, type Ex4 } from '@/data/taller2027';

const Box = ({ n, title, children }: { n?: string; title: string; children: ReactNode }) => <section className="rounded-2xl border border-border bg-card p-5 space-y-3">{n && <p className="text-xs uppercase tracking-widest text-coral font-semibold">{n}</p>}<h2 className="font-display font-bold text-lg">{title}</h2>{children}</section>;
const F = ({ label, children }: { label: string; children: ReactNode }) => <label className="block space-y-1"><span className="text-sm font-medium">{label}</span>{children}</label>;
const Pick = ({ options, value, onPick }: { options: string[]; value?: string; onPick: (o: string) => void }) => <div className="flex flex-wrap gap-2">{options.map(o => <Button key={o} type="button" size="sm" variant={value === o ? 'default' : 'outline'} onClick={() => onPick(o)}>{o}</Button>)}</div>;

export default function TallerParticipa2027() {
  const { mine, reload } = useCf27Votes();
  const { teams, reload: reloadTeams } = useCf27Teams();
  const [teamId, setTeamId] = useState(myTeamId());
  const team = teams.find(t => t.id === teamId);
  const [reg, setReg] = useState({ nombre: '', estado: '', municipio: '', integrantes: 5 });
  const [e1, setE1] = useState<Ex1>({}); const [e2, setE2] = useState<Ex2>({}); const [e3, setE3] = useState<Ex3>({}); const [e4, setE4] = useState<Ex4>({});
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [word, setWord] = useState(''); const [sheetTeam, setSheetTeam] = useState('');
  useEffect(() => { document.title = 'Taller · Mi plan digital 2027 · Centro Fox'; }, []);
  useEffect(() => { if (team && loadedFor !== team.id) { setE1(team.ex1); setE2(team.ex2); setE3(team.ex3); setE4(team.ex4); setReg({ nombre: team.nombre, estado: team.estado, municipio: team.municipio, integrantes: team.integrantes }); setLoadedFor(team.id); } }, [team, loadedFor]);

  async function vote(id: string, o: string) { const ok = await castCf27Vote(id, o).catch(() => false); if (ok) { reload(); toast.success('Listo'); } else toast.error('No se guardó. Inténtalo otra vez.'); }
  async function doRegister() {
    if (!reg.nombre.trim() || !reg.estado.trim() || !reg.municipio.trim()) return toast.error('Llena nombre, estado y municipio');
    const id = await registerTeam(reg); if (!id) return toast.error('No se pudo registrar. Inténtalo otra vez.');
    setTeamId(id); reloadTeams(); toast.success('Equipo registrado');
  }
  async function save(ex: 1 | 2 | 3 | 4, data: object) { const ok = await saveExercise(ex, data); if (ok) { reloadTeams(); toast.success('Guardado'); } else toast.error('No se guardó. Revisa la conexión.'); }
  const segs = [0, 1, 2].map(i => e2.segmentos?.[i] ?? {});
  const setSeg = (i: number, k: string, v: string) => setE2(x => ({ ...x, segmentos: [0, 1, 2].map(j => j === i ? { ...segs[j], [k]: v } : segs[j]) }));
  const target = team ? targetOf(teams, team.id) : undefined; const attacker = team ? attackerOf(teams, team.id) : undefined;
  const metas = FUNNEL.map((_, i) => e4.metas?.[i] ?? null); const bars = [0, 1].map(i => e4.barreras?.[i] ?? {});

  return <div className="cf-theme theme-light min-h-screen bg-background text-foreground">
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center justify-between"><FoxLogo size={48} /><span className="text-sm font-semibold">Jesús Caudillo</span></header>
      <div><h1 className="font-display text-3xl font-bold">Mi plan digital 2027</h1><p className="text-muted-foreground mt-1">Taller del sábado. Vota cuando lo pida la pantalla. El capitán del equipo captura los ejercicios.</p></div>

      <Box n="Votación" title="¿Cuáles de estos hábitos ya tienes? Marca todos los que apliquen.">
        <div className="grid gap-2">{HABITS.map((h, i) => { const on = mine(habitKey(i)) === 'sí'; return <Button key={h} variant={on ? 'default' : 'outline'} className="h-auto min-h-12 justify-between py-3 text-left whitespace-normal" onClick={() => vote(habitKey(i), on ? 'no' : 'sí')}>{h}{on && <Check />}</Button>; })}</div>
      </Box>

      <Box n="Equipo" title={team ? `Capitán de ${team.nombre}` : 'Registro del equipo (solo el capitán)'}>
        <F label="Nombre del equipo"><Input maxLength={60} value={reg.nombre} onChange={e => setReg({ ...reg, nombre: e.target.value })} /></F>
        <div className="grid grid-cols-2 gap-2"><F label="Estado"><Input maxLength={60} value={reg.estado} onChange={e => setReg({ ...reg, estado: e.target.value })} /></F><F label="Integrantes"><Input type="number" min={1} max={12} value={reg.integrantes} onChange={e => setReg({ ...reg, integrantes: Number(e.target.value) || 1 })} /></F></div>
        <F label="Municipio o distrito a trabajar"><Input maxLength={80} value={reg.municipio} onChange={e => setReg({ ...reg, municipio: e.target.value })} /></F>
        <Button onClick={doRegister}>{team ? 'Actualizar datos' : 'Registrar equipo'}</Button>
      </Box>

      {team && <>
        <Box n="Ejercicio 1 · Circulación" title="Escucha exprés">
          <F label="¿De qué se habla más?"><Textarea maxLength={400} value={e1.tema ?? ''} onChange={e => setE1({ ...e1, tema: e.target.value })} /></F>
          <F label="¿Con qué tono?"><Pick options={['Enojo', 'Burla', 'Preocupación', 'Apoyo']} value={e1.tono} onPick={o => setE1({ ...e1, tono: o })} /></F>
          <F label="¿Quién habla?"><Input maxLength={200} placeholder="Medio, vecino, político, página anónima" value={e1.quien ?? ''} onChange={e => setE1({ ...e1, quien: e.target.value })} /></F>
          <F label="¿Qué hueco nadie está ocupando?"><Textarea maxLength={400} value={e1.hueco ?? ''} onChange={e => setE1({ ...e1, hueco: e.target.value })} /></F>
          <F label="Una cuenta local a seguir desde hoy"><Input maxLength={120} value={e1.cuenta ?? ''} onChange={e => setE1({ ...e1, cuenta: e.target.value })} /></F>
          <Button onClick={() => save(1, e1)}>Guardar ejercicio 1</Button>
        </Box>

        <Box n="Ejercicio 2 · Emisión" title="Microsegmentación y pieza con IA">
          <div className="space-y-2">{PROMPTS.map((p, i) => <div key={i} className="rounded-xl bg-muted p-3 text-sm flex gap-2"><span className="flex-1">{p}</span><Button size="icon" variant="ghost" aria-label="Copiar prompt" onClick={() => { navigator.clipboard?.writeText(p); toast.success('Copiado'); }}><Copy /></Button></div>)}</div>
          <p className="text-sm font-semibold">La IA propone, el equipo decide.</p>
          {segs.map((s, i) => <div key={i} className="rounded-xl border border-border p-3 space-y-2"><p className="text-sm font-semibold">Segmento {i + 1}</p>
            <Input maxLength={120} placeholder="Nombre del segmento" value={s.nombre ?? ''} onChange={e => setSeg(i, 'nombre', e.target.value)} />
            <Input maxLength={160} placeholder="Qué necesita" value={s.necesidad ?? ''} onChange={e => setSeg(i, 'necesidad', e.target.value)} />
            <div className="grid grid-cols-2 gap-2"><Input maxLength={40} placeholder="Red" value={s.red ?? ''} onChange={e => setSeg(i, 'red', e.target.value)} /><Input maxLength={60} placeholder="Formato" value={s.formato ?? ''} onChange={e => setSeg(i, 'formato', e.target.value)} /></div></div>)}
          <F label="Su vainilla"><Input maxLength={60} value={e2.vainilla ?? ''} onChange={e => setE2({ ...e2, vainilla: e.target.value })} /></F>
          <F label="Diez palabras clave (separadas por coma)"><Textarea maxLength={300} value={e2.palabras ?? ''} onChange={e => setE2({ ...e2, palabras: e.target.value })} /></F>
          <div className="grid grid-cols-2 gap-2"><F label="Soy quien…"><Input maxLength={120} value={e2.soy ?? ''} onChange={e => setE2({ ...e2, soy: e.target.value })} /></F><F label="…para…"><Input maxLength={120} value={e2.para ?? ''} onChange={e => setE2({ ...e2, para: e.target.value })} /></F></div>
          <F label="La pieza (revisada por el equipo)"><Textarea rows={5} maxLength={1200} value={e2.pieza ?? ''} onChange={e => setE2({ ...e2, pieza: e.target.value })} /></F>
          <Button onClick={() => save(2, e2)}>Guardar ejercicio 2</Button>
        </Box>

        <Box n="Votación" title="La vainilla de tu equipo, en una o dos palabras">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const w = normalizeWord(word); if (!isClean(w)) { toast.error('Escribe una palabra válida'); return; } vote('s09', w); setWord(''); }}><Input value={word} maxLength={30} onChange={e => setWord(e.target.value)} placeholder={mine('s09') ?? 'Vainilla'} /><Button>Enviar</Button></form>
        </Box>

        <Box n="Ejercicio 3 · Reinterpretación" title="Lectura hostil y protocolo">
          <div className="rounded-xl bg-muted p-3 text-sm"><p className="font-semibold">Pieza de {target?.nombre ?? '—'} (a la que le hacen la lectura hostil):</p><p className="mt-1 whitespace-pre-wrap">{target?.ex2.pieza || 'Todavía no la capturan.'}</p></div>
          <F label="Su ataque: cómo la sacaría de contexto el adversario"><Textarea maxLength={600} value={e3.ataque ?? ''} onChange={e => setE3({ ...e3, ataque: e.target.value })} /></F>
          <p className="text-xs text-muted-foreground">Distorsionar el marco, no fabricar pruebas falsas.</p>
          <div className="rounded-xl bg-muted p-3 text-sm"><p className="font-semibold">Ataque que recibieron de {attacker?.nombre ?? '—'}:</p><p className="mt-1 whitespace-pre-wrap">{attacker?.ex3.ataque || 'Todavía no lo escriben.'}</p></div>
          <F label="¿Qué tipo de caso es?"><Pick options={CASE_TYPES} value={e3.tipo} onPick={o => setE3({ ...e3, tipo: o })} /></F>
          <F label="¿Qué hacemos?"><Pick options={DECISIONS} value={e3.decision} onPick={o => setE3({ ...e3, decision: o })} /></F>
          <F label={`Respuesta (máximo 40 palabras · llevas ${words40(e3.respuesta)})`}><Textarea maxLength={400} value={e3.respuesta ?? ''} onChange={e => setE3({ ...e3, respuesta: e.target.value })} /></F>
          <Button onClick={() => words40(e3.respuesta) > 40 ? toast.error('La respuesta pasa de 40 palabras') : save(3, e3)}>Guardar ejercicio 3</Button>
        </Box>
      </>}

      <Box n="Votación" title="¿La respuesta apaga el fuego o lo aviva?">
        {(['s13a', 's13b'] as const).map((k, i) => <div key={k}><p className="text-sm font-semibold mb-1">Par {i + 1}</p><Pick options={FIRE} value={mine(k)} onPick={o => vote(k, o)} /></div>)}
      </Box>

      {team && <Box n="Ejercicio 4 · Respuesta" title="De la interacción a la acción">
        <F label="La acción (reunión, recorrido, consulta o jornada)"><Textarea maxLength={300} value={e4.accion ?? ''} onChange={e => setE4({ ...e4, accion: e.target.value })} /></F>
        {FUNNEL.map((f, i) => <F key={f} label={f}><Input type="number" min={0} value={metas[i] ?? ''} onChange={e => setE4({ ...e4, metas: metas.map((m, j) => j === i ? (e.target.value === '' ? null : Math.max(0, Number(e.target.value))) : m) })} /></F>)}
        {bars.map((b, i) => <div key={i} className="grid grid-cols-2 gap-2"><Input maxLength={140} placeholder={`Barrera ${i + 1}`} value={b.barrera ?? ''} onChange={e => setE4({ ...e4, barreras: bars.map((x, j) => j === i ? { ...x, barrera: e.target.value } : x) })} /><Input maxLength={140} placeholder="Cómo la quitamos" value={b.solucion ?? ''} onChange={e => setE4({ ...e4, barreras: bars.map((x, j) => j === i ? { ...x, solucion: e.target.value } : x) })} /></div>)}
        <F label="¿Qué medirán para saber si funcionó?"><Input maxLength={200} value={e4.indicador ?? ''} onChange={e => setE4({ ...e4, indicador: e.target.value })} /></F>
        <Button onClick={() => save(4, e4)}>Guardar ejercicio 4</Button>
      </Box>}

      <Box n="Cierre" title="¿Qué práctica vas a incorporar esta semana?"><div className="grid gap-2">{PRACTICES.map(o => <Button key={o} variant={mine('s16') === o ? 'default' : 'outline'} className="h-auto min-h-12 justify-between py-3 text-left whitespace-normal" onClick={() => vote('s16', o)}>{o}{mine('s16') === o && <Check />}</Button>)}</div></Box>

      <Box n="Para llevar" title="Descargar mi hoja">
        {!team && <select className="w-full rounded-md border border-input bg-background p-2" value={sheetTeam} onChange={e => setSheetTeam(e.target.value)}><option value="">Elige tu equipo</option>{teams.map(t => <option key={t.id} value={t.id}>{t.nombre} · {t.municipio}</option>)}</select>}
        <Button asChild disabled={!(team?.id || sheetTeam)}><Link to={`/centro-fox/2027/hoja/${team?.id || sheetTeam}`}><Download />Descargar la hoja del equipo</Link></Button>
      </Box>
      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">Programa de Capacitación Profesional Centro Fox. Las votaciones son anónimas. Lo que captura cada equipo se muestra en la pantalla de la sala; no escriban datos personales.</footer>
    </div>
  </div>;
}
