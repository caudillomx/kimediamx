import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ACTIVITIES, CASES, INE, isClean, normalizeWord } from '@/data/centroFox2027';
import { castCf27Vote, useCf27Votes } from '@/hooks/useCf27Votes';
import { FoxLogo } from '@/components/centro-fox-2027/Parts';

export default function Participa2027() {
  const { mine, reload } = useCf27Votes();
  const [busy, setBusy] = useState<string | null>(null);
  const [word, setWord] = useState('');
  useEffect(() => { document.title = 'Participa · Centro Fox · Comprender, verificar, movilizar'; }, []);
  async function vote(id: string, option: string) {
    setBusy(id);
    const ok = await castCf27Vote(id, option).catch(() => false);
    setBusy(null);
    if (ok) { await reload(); toast.success('Listo, quedó tu respuesta'); } else toast.error('No se guardó. Inténtalo otra vez.');
  }
  const context = (id: string) => {
    const r = INE.juego_cual_funciono[Number(id.slice(1)) - 9];
    if (r) return <p className="text-sm text-muted-foreground mb-3">{r.A.perfil} · ¿la publicación A o la B tuvo más interacción? Míralas en la pantalla.</p>;
    const c = CASES.find(x => x.id === id);
    return c ? <p className="text-sm mb-3">{c.text}</p> : null;
  };
  return <div className="cf-theme theme-light min-h-screen bg-background text-foreground">
    <div className="max-w-xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between"><FoxLogo size={48} /><span className="text-sm font-semibold">Jesús Caudillo</span></header>
      <h1 className="font-display text-3xl font-bold mt-6">Comprender, verificar, movilizar</h1>
      <p className="text-muted-foreground mt-1">Responde cuando la pantalla te lo pida. Puedes cambiar tu respuesta.</p>
      <main className="space-y-5 mt-6">{ACTIVITIES.map((a, i) => <section key={a.id} className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-coral font-semibold mb-2">Actividad {i + 1}</p>
        <h2 className="font-display font-bold text-lg mb-3">{a.q}</h2>{context(a.id)}
        {a.kind === 'word'
          ? <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const w = normalizeWord(word); if (!isClean(w)) { toast.error('Escribe una palabra válida'); return; } vote(a.id, w); setWord(''); }}>
              <Input value={word} onChange={e => setWord(e.target.value)} maxLength={30} placeholder={mine(a.id) ?? 'Una palabra'} /><Button disabled={busy === a.id}>Enviar</Button></form>
          : <div className="grid gap-2">{a.options.map(o => <Button key={o} disabled={busy === a.id} variant={mine(a.id) === o ? 'default' : 'outline'} aria-pressed={mine(a.id) === o} className="h-auto min-h-12 justify-between py-3 text-left whitespace-normal" onClick={() => vote(a.id, o)}>{a.kind === 'prediction' ? `Publicación ${o}` : o}{mine(a.id) === o && <Check />}</Button>)}</div>}
      </section>)}</main>
      <footer className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">Programa de Capacitación Profesional Centro Fox. Tus respuestas son anónimas: solo se guarda un identificador de este navegador. No es una encuesta representativa.</footer>
    </div>
  </div>;
}
