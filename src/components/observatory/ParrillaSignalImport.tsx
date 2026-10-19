import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useContentCycles, type ContentProfile } from '@/hooks/useContentEngine';
import { signalBrief } from '@/lib/observatory';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';

export function ParrillaSignalImport({ profiles }: { profiles: ContentProfile[] }) {
  const [params, setParams] = useSearchParams();
  const id = params.get('signal');
  const [profileId, setProfileId] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [saving, setSaving] = useState(false);
  const { cycles } = useContentCycles(profileId || null);
  const navigate = useNavigate();
  const { data: signal, isLoading, isError } = useQuery({ queryKey:['observatory-signal',id], enabled: Boolean(id), queryFn: async () => {
    if(!id) return null;
    const { data, error } = await supabase.from('observatory_signals').select('*').eq('id',id).maybeSingle();
    if(error) throw error; return data;
  }});
  async function save() {
    if(!signal || !cycleId || !profileId) return;
    setSaving(true);
    const { error } = await supabase.from('content_inputs').insert({ cycle_id:cycleId, input_type:'articulo', title:signal.title, content:signalBrief(signal), url:signal.source_url, tags:['observatorio',signal.vertical_slug], sort_order:0 });
    setSaving(false);
    if(error) { toast.error('No se pudo guardar el brief en este ciclo. Revisa tu acceso.'); return; }
    toast.success('Brief guardado como insumo del ciclo');
    navigate(`/parrilla/${profileId}`);
  }
  if(!id) return null;
  return <section className="border-y border-primary/30 py-6 space-y-4">
    <div className="flex items-center justify-between"><h2 className="font-display text-xl">Brief del Observatorio</h2><Button size="icon" variant="ghost" aria-label="Descartar brief" onClick={() => { const next = new URLSearchParams(params); next.delete('signal'); setParams(next); }}><X /></Button></div>
    {isLoading ? <p>Cargando brief…</p> : isError || !signal ? <p className="text-destructive">No se pudo recuperar la señal.</p> : <><h3 className="font-display">{signal.title}</h3><p className="text-sm text-muted-foreground">{signal.content_angle}</p><div className="flex flex-wrap gap-3"><select aria-label="Cliente para el brief" className="border border-input bg-background rounded-md h-10 px-3 text-sm" value={profileId} onChange={e => {setProfileId(e.target.value);setCycleId('');}}><option value="">Seleccionar cliente</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.client_name}</option>)}</select><select aria-label="Ciclo para el brief" disabled={!profileId} className="border border-input bg-background rounded-md h-10 px-3 text-sm" value={cycleId} onChange={e => setCycleId(e.target.value)}><option value="">Seleccionar ciclo</option>{cycles.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select><Button disabled={!cycleId || saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar brief en el ciclo'}<ArrowRight /></Button></div>{profileId && !cycles.length && <Button asChild variant="link"><a href={`/parrilla/${profileId}`}>Crear un ciclo para este cliente</a></Button>}</>}
  </section>;
}