import { Deck, type Ctx, type Poll, type Slide } from '@/components/centro-fox-2027/Deck';
import { INE, COM, CASES, MATRIX, activity, fmt, millions, multiplier } from '@/data/centroFox2027';
import { Bars, Card, Cloud, FoxLogo, KiLogo, Kicker, Means, Photo, QR, Title } from '@/components/centro-fox-2027/Parts';
import plaza from '@/assets/centro-fox/cf27-plaza.jpg';
import phone from '@/assets/centro-fox/cf27-phone.jpg';
import calle from '@/assets/centro-fox/cf27-conversacion.jpg';
import reunion from '@/assets/centro-fox/cf27-reunion.jpg';
import { Contrast, LiveBars, LiveCloud, VoteSide } from '@/components/centro-fox-2027/Live';
import type { ReactNode } from 'react';


const FK = 'Top 500 publicaciones por interacción · 1 oct–19 nov 2026 · Facebook e Instagram';
const EC = 'Lectura manual de 100 comentarios al azar por publicación (±10 puntos)';
const short = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '');

const actorLabel = (a: string) => a.startsWith('Figuras del PAN') ? 'Figuras del PAN y Xóchitl Gálvez' : a.replace(/\s*\(.*?\)/, '');
const conversation = [...INE.quien_se_llevo_la_conversacion].sort((a, b) => b.porcentaje - a.porcentaje).map(a => ({ label: actorLabel(a.actor), value: a.porcentaje }));
const pan = conversation.find(c => c.label.startsWith('Figuras del PAN'))!;
const salinas = conversation.find(c => c.label.startsWith('Ricardo Salinas'))!;
const ine = conversation.find(c => c.label.startsWith('INE'))!;
const meta = INE.meta_ine;
const fb2 = COM.publicaciones.find(p => p.id === 'fb2')!;
const amb = COM.comentario_ambiguo;
const fbIg = INE.facebook_vs_instagram;


const poll = (id: string, label?: string): Poll => ({ id, options: activity(id).options, label: label ?? activity(id).q });
const ct = (id: string) => ({ id, options: activity(id).options, correct: activity(id).correct });
const Local = ({ children }: { children: ReactNode }) => <Card><small className="cf-label">En tu municipio, en 2027</small><p className="cf-body mt-3">{children}</p></Card>;
const LESSON = ['Un protagonista con nombre y una acción concreta le gana a una pregunta abstracta.', 'El momento importa: el mismo argumento, el día del hecho, rindió 4 veces más.'];

function Prediction({ round, c }: { round: number; c: Ctx }) {
  const r = INE.juego_cual_funciono[round];
  const id = `v${String(9 + round).padStart(2, '0')}`;
  const post = (k: 'A' | 'B') => { const p = r[k]; const win = c.revealed && p.interacciones >= r[k === 'A' ? 'B' : 'A'].interacciones; return (
    <Card className={`cf-post ${win ? 'win' : ''} ${c.revealed ? '!min-h-0' : ''}`}>
      <div className="cf-post-head"><span className="cf-tag">{k}</span><div><b>{p.perfil}</b><small>{p.red} · {short(p.fecha)}</small></div></div>
      <p className="cf-post-text whitespace-pre-line" style={c.revealed ? { fontSize: 23 } : undefined}>{p.texto}</p>
      {c.revealed && <div className="cf-post-num"><span className="cf-num-inline">(<strong>{fmt(p.interacciones)}</strong> interacciones)</span></div>}
    </Card>); };
  return <div className="grid grid-cols-[1fr_1fr_460px] gap-8 items-start">
    {post('A')}{post('B')}
    {c.revealed
      ? <Contrast {...ct(id)} cols="1fr" real={<div className="cf-big">{multiplier(r.A.interacciones, r.B.interacciones).toLocaleString('es-MX')} veces</div>}
          tpl={p => `El ${p}% de la sala eligió la que realmente funcionó mejor.`} />
      : <VoteSide id={id} manual={c.manual} label="Vota A o B" size={200} />}
    {c.revealed && <div className="col-span-3 -mt-2"><Means>{LESSON[round]}{round === 1 && ' Este es un perfil de su partido. No era mal contenido: llegó tarde. En campaña, la oportunidad vale más que la producción.'}</Means></div>}
  </div>;
}

function Classify({ c }: { c: Ctx }) {
  const list = CASES.filter(x => !x.optional || c.flag('v21-extra'));
  const k = list[c.step % list.length];
  const num = (x: typeof CASES[number]) => CASES.indexOf(x) === 1 ? 4 : CASES.indexOf(x) === 0 ? 1 : CASES.indexOf(x);
  return <div>
    <div className="flex gap-3 mb-6">{list.map((x, i) => <button key={x.id} className={`cf-chip ${i === c.step % list.length ? 'on' : ''}`} onClick={() => c.setStep(i)}>Caso {num(x)}</button>)}</div>
    {c.revealed
      ? <div className="grid grid-cols-[1fr_1fr] gap-10"><div><Card><h3 className="cf-h3">{k.title}</h3><p className="cf-body mt-3">{k.text}</p></Card>
          <table className="cf-table compact mt-6"><tbody>{MATRIX.map(m => <tr key={m.accion} className={m.accion === k.answer ? 'hl' : ''}><td>{m.tipo}</td><td><b>{m.accion}</b></td><td>{m.como}</td></tr>)}</tbody></table></div>
        <Contrast id={k.id} options={activity(k.id).options} correct={k.answer} kind="recomendada" cols="1fr" real={<p className="cf-body"><b className="cf-accent">{k.label}.</b> {k.why}</p>} /></div>
      : <div className="grid grid-cols-[1fr_560px] gap-10"><Card><h3 className="cf-h3">{k.title}</h3><p className="cf-body-lg mt-4">{k.text}</p></Card><VoteSide id={k.id} manual={c.manual} label="¿Qué harías tú?" /></div>}
  </div>;
}

function LineChart() {
  const pts = INE.curva_diaria; const W = 1720, H = 470, max = Math.max(...pts.map(p => p.interacciones));
  const x = (i: number) => 40 + (i / (pts.length - 1)) * (W - 80); const y = (v: number) => H - 40 - (v / max) * (H - 90);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.interacciones)}`).join(' ');
  const notes: [string, string][] = [['2026-10-22', 'Reportaje del chofer'], ['2026-10-25', 'Anuncia su renuncia'], ['2026-10-26', 'Pico: 1.56 millones'], ['2026-11-03', 'Video de Loret'], ['2026-11-09', 'Segunda ola']];
  return <svg viewBox={`0 0 ${W} ${H + 30}`} className="cf-line">
    <path d={`${path} L${x(pts.length - 1)},${H - 40} L${x(0)},${H - 40} Z`} className="area" />
    <path d={path} className="stroke" />
    {notes.map(([d, t], k) => { const i = pts.findIndex(p => p.fecha === d); if (i < 0) return null; const ty = 30 + (k % 3) * 34; return <g key={d}><line x1={x(i)} x2={x(i)} y1={ty + 8} y2={H - 40} className="ann" /><text x={x(i) + 8} y={ty} className="ann-t">{short(d)} · {t}</text></g>; })}
    {pts.filter((_, i) => i % 7 === 0).map(p => { const i = pts.indexOf(p); return <text key={p.fecha} x={x(i)} y={H + 10} className="axis" textAnchor="middle">{short(p.fecha)}</text>; })}
  </svg>;
}


const SLIDES: Slide[] = [
  { id: 'V01', title: 'Portada', bare: true, notes: 'Saquen el teléfono, que hoy se vota. Escaneen el código.', render: () => (
    <div className="cf-cover-split">
      <div className="cf-cover-text">
        <div><FoxLogo size={120} /></div>
        <div><Kicker>Estrategia digital rumbo a 2027</Kicker><h1 className="cf-hero">Comprender, verificar, movilizar</h1>
          <p className="cf-sub mt-6">Cómo se mueve un mensaje en redes, y qué hacer en cada momento.</p></div>
        <div className="flex items-end justify-between gap-10"><p className="cf-body">Programa de Capacitación Profesional Centro Fox<br /><b>Jesús Caudillo</b></p><QR size={170} label="Participa aquí" /></div>
      </div>
      <Photo src={plaza} className="cf-cover-photo" />
    </div>) },
  { id: 'A1', title: '¿Para qué está un político en redes?', polls: [poll('a01')], notes: 'Min 0–9 (apertura A1–A3 y votaciones 2–3). “Sé honestos: nadie ve su respuesta.” Deja que voten y pulsa R.', render: c => (
    <><Kicker>Para empezar</Kicker><Title>¿Para qué está un político en redes?</Title>{c.revealed
      ? <Contrast id="a01" kind="lectura" real={<p className="cf-sub">Casi todos usan las redes como megáfono: para hablar. Veamos si la gente está ahí para escucharnos.</p>} />
      : <div className="grid grid-cols-[1fr_420px] gap-12"><div><p className="cf-sub">Sé honesto: ¿para qué usas hoy tus redes?</p><div className="mt-8"><LiveBars id="a01" manualMode={c.manual} /></div></div><QR size={260} label="Vota aquí" /></div>}</>) },
  { id: 'A2', title: 'Nadie te está esperando', source: 'Fuente: Reuters Institute, Digital News Report 2026 (país: México; datos globales para el punto 6). Encuesta en línea, ~2,000 personas por país.', notes: '“Estos son los datos de quien los va a ver en el teléfono.” Detente en el 31% y en el 39%.', render: () => (
    <><Kicker>Lo que dicen los datos · México 2026</Kicker><Title>Nadie te está esperando</Title><div className="grid grid-cols-3 gap-5">{[
      ['66%', 'se informa cada semana en redes sociales. La televisión cayó a 34%, casi la mitad que en 2017.'],
      ['31%', 'confía en las noticias, el nivel más bajo desde 2017 (−5 puntos en un año).'],
      ['45%', 'evita las noticias a veces o seguido.'],
      ['39%', 'consumió noticias de creadores o influencers la última semana; México está en el top 3 de 48 países.'],
      ['35%', 'se informa por WhatsApp (+7 puntos en un año). Facebook 57%, YouTube 34%, TikTok 27%, Instagram 18%, X (Twitter) 13%.'],
      ['De pasada', 'en Facebook, Instagram y TikTok la mayoría ve noticias solo cuando entró a otra cosa.'],
    ].map(([n, t]) => <div key={n} className="cf-card" style={{ padding: '18px 28px' }}><div className="cf-big" style={{ fontSize: 60 }}>{n}</div><p className="cf-body mt-2">{t}</p></div>)}</div>
      <div className="mt-5"><Means>La gente está en redes, pero no para escucharte: llegó por otra cosa, confía poco y prefiere a personas que a instituciones.</Means></div></>) },
  { id: 'A3', title: 'El pecado capital del político en redes', notes: 'Lee la frase grande y deja un silencio. Luego recorre las dos columnas con el mismo peso.', render: () => (
    <><Kicker>Para empezar</Kicker><p className="cf-quote">“Creer que es tan interesante que todos lo quieren escuchar.”</p>
      <div className="grid grid-cols-2 gap-8 mt-10">
        <Card><span className="cf-num">Megáfono</span><p className="cf-label mt-2">Lo que hacen casi todos</p><p className="cf-body-lg mt-5">Hablar de mí, mi agenda, mis eventos, mis fotos con gente.</p></Card>
        <Card><span className="cf-num">Plaza pública</span><p className="cf-label mt-2">Para lo que sirven las redes</p><ol className="cf-body mt-5 space-y-2 list-decimal pl-8">{['Escuchar: saber qué le importa a la gente antes de hablar.', 'Ser útil: que tu contenido le resuelva o le explique algo a alguien.', 'Ser encontrado: que cuando te busquen, exista una historia clara tuya.', 'Sumar voces: que otros hablen por ti; la gente confía más en personas que en logos.', 'Movilizar: convertir la atención en acción, y la acción en voto.'].map(t => <li key={t}>{t}</li>)}</ol></Card></div>
      <p className="cf-body-lg mt-8">En 2027, la pregunta no es “¿qué quiero decir?”, sino “¿por qué alguien que entró a ver otra cosa se detendría a escucharme?”</p></>) },
  { id: 'V02', title: '¿Dónde te enteras primero?', polls: [poll('v02')], notes: 'Vota, pulsa R y contrasta con los datos de hace un momento: “Fíjense dónde está la conversación: ahí se gana o se pierde”.', render: c => c.revealed
    ? <><Kicker>Para empezar</Kicker><Title>¿Dónde te enteras primero de una noticia?</Title><Contrast id="v02" kind="lectura" realTitle="Lo que dice la encuesta nacional"
        real={<><Bars rows={[{ label: 'Redes sociales', value: 66 }, { label: 'Televisión', value: 34 }]} max={100} unit="%" highlight={['Redes sociales']} /><p className="cf-caption cf-muted mt-4">No es exactamente la misma pregunta: mide uso semanal, no “dónde te enteras primero”.</p></>}
        lesson="La conversación ya no está en la tele: está en el teléfono que tienen en la mano." /></>
    : <div className="grid grid-cols-[1fr_560px] gap-14 h-full"><div><Kicker>Para empezar · vota desde tu teléfono</Kicker><Title>¿Dónde te enteras primero de una noticia?</Title><div className="mt-6"><LiveBars id="v02" manualMode={c.manual} /></div></div>
      <div className="cf-photo-qr"><Photo src={phone} /><QR size={190} label="Vota aquí" /></div></div> },
  { id: 'V03', title: '¿Sabes qué se dijo de tu municipio?', polls: [poll('v03')], notes: '“Casi todos publicamos, pocos escuchamos. Hoy vamos a ver por qué ese orden está al revés.”', render: c => c.revealed
    ? <><Kicker>Para empezar</Kicker><Title>¿Sabes qué se dijo esta semana en redes sobre tu municipio?</Title><Contrast id="v03" kind="lectura"
        real={<><p className="cf-sub">Si la mayoría respondió “más o menos” o “no”, ya saben cuál es la tarea de mañana.</p><p className="cf-body-lg mt-6"><b className="cf-accent">Ni el INE escuchó:</b> su cuenta pesó {ine.value}% en la conversación sobre su propia crisis.</p></>} /></>
    : <div className="grid grid-cols-[1fr_560px] gap-14 h-full"><div><Kicker>Para empezar · vota desde tu teléfono</Kicker><Title>¿Sabes qué se dijo esta semana en redes sobre tu municipio?</Title><div className="mt-6"><LiveBars id="v03" manualMode={c.manual} /></div></div>
      <div className="cf-photo-qr"><Photo src={calle} /><QR size={190} label="Vota aquí" /></div></div> },
  { id: 'V04', title: 'Objetivo de la capacitación', notes: '“Hoy no vienen a escuchar teoría. Vamos a desarmar un caso real y mañana lo aplican a su municipio.”', render: () => (
    <div className="grid grid-cols-[1fr_640px] gap-14 h-full items-center"><div><Kicker>Objetivo</Kicker><Title>Que salgan sabiendo leer cómo se mueve una conversación en redes y cómo cuidar su mensaje rumbo al 6 de junio de 2027.</Title>
      <div className="grid grid-cols-2 gap-6 mt-10"><Card><span className="cf-num">Hoy</span><p className="cf-body mt-3">Desarmamos un caso nacional: quién habló, qué circuló, cómo se reinterpretó y qué se hizo después.</p></Card>
        <Card><span className="cf-num">Mañana</span><p className="cf-body mt-3">Taller: cada equipo arma su propio plan para su municipio o distrito, en una hoja.</p></Card></div></div>
      <Photo src={reunion} className="h-[760px]" /></div>) },
  { id: 'V05', title: 'Hoy: un solo ciclo', notes: 'Min 9–15 (objetivo, ciclo, caso y 2027). “Casi siempre pensamos solo en el momento 1: publicar. Hoy vamos a ver los cuatro, y sobre todo el 2, que es el que menos se cuida: escuchar cómo circula lo que publicamos.”', render: () => (
    <><Kicker>Hoy</Kicker><Title>Un mensaje, cuatro momentos</Title><div className="cf-flow">{[['Emisión', 'Qué digo, a quién y dónde.'], ['Circulación', 'Qué viaja y qué se muere.'], ['Reinterpretación', 'Qué hacen otros con mi mensaje.'], ['Respuesta', 'Cuándo respondo y cómo lo vuelvo acción.']].map(([t, d], i) => <Card key={t}><span className="cf-num">{i + 1}</span><h3 className="cf-h3">{t}</h3><p className="cf-body mt-3">{d}</p></Card>)}</div>
      <p className="cf-quote mt-14">Lo que publicas deja de ser tuyo en cuanto sale. La estrategia está en cuidar los cuatro momentos.</p></>) },
  { id: 'V06', title: 'El caso: la crisis del INE', source: 'Top 500 publicaciones por interacción. Búsqueda: INE, Instituto Nacional Electoral, Guadalupe Taddei, Lorenzo Córdova.', notes: '“No venimos a ver quién tiene la razón en el escándalo. Venimos a ver cómo se mueve una conversación nacional, y las dos narrativas las vamos a ver con la misma lupa.” Aquí di los límites: es un top 500 por interacción, solo Facebook e Instagram, y un “me gusta” no es apoyo.', render: () => (
    <><Kicker>El caso</Kicker><Title>La crisis del INE en redes</Title><div className="grid grid-cols-4 gap-8">{[[fmt(meta.publicaciones), 'publicaciones con más interacción'], [millions(meta.interacciones_totales), 'de interacciones'], [fmt(meta.perfiles_distintos), 'perfiles distintos'], ['1 oct – 19 nov', 'Facebook e Instagram']].map(([n, t]) => <Card key={t}><div className="cf-big">{n}</div><p className="cf-body mt-3">{t}</p></Card>)}</div>
      <p className="cf-body-lg mt-14 max-w-[1300px]">No es un juicio sobre el fondo. Es una forma de ver qué circuló, quién lo movió y qué hizo la gente con eso.</p></>) },
  { id: 'V06B', title: '¿Por qué este caso?', source: 'Fuentes: Expansión Política (10 sep 2026; 30 sep 2026); N+ (proceso electoral 2026-2027).', notes: '“No elegimos este caso por el escándalo: lo elegimos porque es el árbitro de su elección.”', render: () => (
    <><Kicker>El caso · rumbo a 2027</Kicker><Title>¿Por qué este caso? Porque 2027 ya empezó</Title><div className="grid grid-cols-2 gap-6">{[
      '6 de junio de 2027: 500 diputaciones federales, 17 gubernaturas y más de 19,000 cargos locales.',
      'En Guanajuato, CDMX y Puebla no hay gubernatura en 2027: se juegan ayuntamientos o alcaldías, congresos locales y diputaciones federales. Es decir, su municipio y su distrito.',
      'El árbitro de esa elección acaba de vivir su peor crisis en redes. Y por primera vez el INE revisará la “integridad” de quienes aspiran a una candidatura.',
      'Las dos narrativas que van a ver hoy regresarán en campaña. Un perfil de su partido ya lo escribió: “¿Llegar a 2027 con un INE mocho?”',
    ].map((t, i) => <Card key={t}><span className="cf-num">{i + 1}</span><p className="cf-body mt-3">{t}</p></Card>)}</div>
      <p className="cf-quote mt-10">Esta fue la primera batalla de narrativa de 2027. La siguiente va a ser en su municipio.</p></>) },
  { id: 'V07', title: '¿Quién movió la conversación?', moment: 'Emisión', polls: [poll('v07')], source: 'Porcentaje de interacciones del top 500. Clasificación de actores: KiMedia.', notes: 'Min 15–32 (emisión: 7–10, E1–E3 y cada red). Que voten antes de ver nada. Pulsa R. Luego: “Un solo empresario tuvo casi el doble que las figuras del PAN y Xóchitl Gálvez juntas, en una crisis que podía jugar a favor de la oposición”.', render: c => (
    <><Kicker>01 · Emisión</Kicker><Title>¿Quién movió la conversación?</Title>{c.revealed
      ? <Contrast {...ct('v07')} cols="560px 1fr" real={<div className="cf-tiles" style={{ height: 420 }}>{conversation.map((a, i) => <div key={a.label} className={`cf-tile ${i === 0 ? 'top' : ''} ${[pan.label, ine.label].includes(a.label) ? 'hl' : ''}`} style={{ flexGrow: Math.max(a.value, 2) }}><b>{a.value}%</b><span>{a.label}</span></div>)}</div>} />
      : <div className="grid grid-cols-[1fr_420px] gap-12"><div><p className="cf-sub">¿Quién creen que se llevó más interacciones?</p><div className="mt-8"><LiveBars id="v07" manualMode={c.manual} /></div></div><QR size={260} label="Vota aquí" /></div>}</>) },
  { id: 'V08', title: 'Si no emites tú', moment: 'Emisión', source: FK, notes: '“La institución en crisis no habló. Y cuando tú no hablas, otro decide qué significa tu historia.”', render: () => (
    <><Kicker>01 · Emisión</Kicker><Title>Si no emites tú, otros cuentan la historia</Title><div className="grid grid-cols-3 gap-8">
      <Card><div className="cf-big">{ine.value}%</div><p className="cf-body mt-4">pesó la cuenta del INE en la conversación sobre su propia crisis.</p></Card>
      <Card><div className="cf-big">1 publicación</div><p className="cf-body mt-4">del INE entró al top 500. Era sobre un futbolista tramitando su credencial.</p></Card>
      <Card><div className="cf-big">{pan.value}% vs {salinas.value}%</div><p className="cf-body mt-4">Figuras del PAN y Xóchitl Gálvez juntas, contra un solo empresario.</p></Card></div>
      <div className="mt-8"><Local>Era una crisis del gobierno y la conversación no la capitalizó la oposición partidista: la capitalizaron otros. En su municipio, la conversación la llevan la página de la colonia, el medio local y el vecino que graba. ¿Ya los tienen identificados? Y si no van a ser candidatos: ustedes pueden ser parte de ese 86%.</Local></div></>) },
  ...[0, 1].map((r): Slide => ({ id: `V${String(9 + r).padStart(2, '0')}`, title: `¿Cuál funcionó mejor? Ronda ${r + 1}`, moment: 'Emisión', source: FK, polls: [poll(`v${String(9 + r).padStart(2, '0')}`)],
    notes: ['“Mismo perfil, mismo tema, casi la misma semana. Lo único que cambia es cómo está escrito.” Que voten; pulsa R para revelar.', '“Es un perfil de su partido.” Que voten antes de revelar. El mismo argumento, el día del hecho y con datos frescos, rindió unas 4 veces más.'][r],
    render: c => <><Kicker>01 · Emisión · Ronda {r + 1}</Kicker><Title>¿Cuál funcionó mejor?</Title><Prediction round={r} c={c} /></> })),
  { id: 'E1', title: 'Hombres y mujeres no es una segmentación', moment: 'Emisión', polls: [poll('e01')], notes: 'Lee las dos tarjetas en voz alta. Que voten y pulsa R.', render: c => (
    <><Kicker>01 · Emisión · A quién le hablo</Kicker><Title>Hombres y mujeres no es una segmentación</Title>
      <div className="grid grid-cols-[1fr_1fr] gap-12 items-start">
        <div className="space-y-5">
          <Card><small className="cf-label">Así segmentábamos</small><p className="cf-body mt-3">Mujeres de 35 a 44 años, nivel socioeconómico C, en el municipio.</p></Card>
          <Card className="win"><small className="cf-label">Así se puede segmentar hoy</small><p className="cf-body mt-3">Mamá que trabaja, usa transporte público, vive en una colonia con problemas de alumbrado, se queja en el grupo de Facebook de su colonia, ve videos cortos de noche y confía más en su vecina que en un político.</p></Card>
          <p className="cf-body-lg"><b className="cf-accent">Segmentar no es adivinar quién es alguien: es entender qué necesita, dónde está y a quién le cree.</b></p>
        </div>
        {c.revealed ? <Contrast id="e01" kind="lectura" cols="1fr" real={<p className="cf-body-lg">Cada capa que agregas hace tu mensaje más preciso y más barato.</p>} />
          : <div><div className="flex items-start justify-between gap-6"><p className="cf-body-lg"><b>Hoy, ¿cómo segmentas tu comunicación?</b></p><QR size={130} label="Vota aquí" /></div><div className="mt-2"><LiveBars id="e01" manualMode={c.manual} /></div></div>}
      </div></>) },
  { id: 'E2', title: 'Las cinco capas de un perfil', moment: 'Emisión', notes: 'Aquí conecta con el caso INE: “Las cuatro comunidades de los comentarios eran segmentos: cada emisor le habló a un grupo distinto, y ese grupo le contestó.”', render: () => (
    <><Kicker>01 · Emisión · A quién le hablo</Kicker><Title>Las cinco capas de un perfil</Title><div className="space-y-4">{[
      ['Territorio', 'Quién vive en cada colonia (edad, escolaridad, hogares, servicios), con datos públicos del censo del INEGI por zona.'],
      ['Plataforma', 'Qué red usa cada grupo para informarse (los datos que vimos al empezar).'],
      ['Intereses y comportamiento', 'Lo que permiten las herramientas de anuncios: ubicación precisa, edad, intereses, públicos parecidos a tus seguidores.'],
      ['Conversación', 'Qué le preocupa a ese grupo y con qué palabras lo dice; sale de la escucha en redes.'],
      ['Respuesta', 'Qué contenido funcionó con ese grupo; se mide y se ajusta.'],
    ].map(([t, d], i) => <div key={t} className="cf-row" style={{ marginLeft: i * 56 }}><b>{i + 1}</b><span className="cf-body-lg"><strong>{t}:</strong> {d}</span></div>)}</div>
      <div className="mt-8"><Means>Las herramientas hoy permiten llegar a una colonia, a una edad y a un interés al mismo tiempo. La diferencia ya no la hace la herramienta: la hace quien sabe qué preguntarle.</Means></div></>) },
  { id: 'E3', title: 'Precisión con límites', moment: 'Emisión', notes: '“Esto no es solo ética: es lo que los protege de un problema legal y de perder confianza.”', render: () => (
    <><Kicker>01 · Emisión · A quién le hablo</Kicker><Title>Precisión con límites</Title><div className="grid grid-cols-3 gap-8">{[
      'No perfilar lo sensible: creencias, salud o preferencias políticas de personas concretas.',
      'No usar bases de datos sin consentimiento: un contacto para un trámite no es un contacto para campaña.',
      'Pauta política con transparencia: las plataformas exigen autorización y aviso de quién paga. Revisen con su jurídico las reglas electorales antes de pautar.',
    ].map((t, i) => <Card key={t}><span className="cf-num">{i + 1}</span><p className="cf-body-lg mt-4">{t}</p></Card>)}</div>
      <p className="cf-quote mt-12">Ser preciso no es ser invasivo. La línea es la confianza: si la persona se entera de cómo llegaste a ella, ¿se sentiría respetada?</p></>) },
  { id: 'V12', title: 'Cada red pide algo distinto', moment: 'Emisión', optional: true, polls: [poll('v12')], source: 'Gráfica: mediana de la tasa de interacción por publicación, top 500 del caso. Solo Facebook e Instagram.', notes: 'Opcional. “Microsegmentar es elegir red, formato y momento con evidencia.” Recorre una fila por red; que voten antes de ver la gráfica.', render: c => (
    <><Kicker>01 · Emisión</Kicker><Title>Cada red pide algo distinto</Title><div className="grid grid-cols-[1fr_620px] gap-12">
      <table className="cf-table compact"><thead><tr><th>Red</th><th>Para qué sirve</th><th>Qué rinde</th><th>Error común</th></tr></thead><tbody>{[
        ['Facebook', 'Comunidad local: grupos de colonia, páginas del municipio, gente de 35 años en adelante.', 'Video corto con contexto, foto con dato concreto, transmisión en vivo.', 'Publicar lo mismo que en todas las redes, sin mencionar el lugar.'],
        ['Instagram', 'Imagen personal y cercanía; público más joven.', 'Reel de menos de un minuto o carrusel con una sola idea.', 'Fotos de evento sin historia ni rostro.'],
        ['TikTok', 'Llegar a quien todavía no te sigue.', 'Video vertical, a cámara, con gancho en los primeros 3 segundos.', 'Copiar tendencias que no tienen que ver con el tema.'],
        ['X (Twitter)', 'Prensa, líderes de opinión y reacción rápida.', 'Postura clara en una frase, a tiempo, con dato o enlace.', 'Entrar a pleitos que solo amplifican al otro.'],
        ['WhatsApp', 'Confianza: aquí se decide qué se cree.', 'Mensaje corto, imagen o audio fácil de reenviar.', 'Mandar cadenas sin verificar.'],
      ].map(([r, a, b, e]) => <tr key={r}><td><b>{r}</b></td><td>{a}</td><td>{b}</td><td className="cf-muted">{e}</td></tr>)}</tbody></table>
      {c.revealed
        ? <Contrast {...ct('v12')} cols="1fr" real={<Bars rows={fbIg.map(f => ({ label: f.red, value: f.mediana_tasa_interaccion_pct }))} unit="%" highlight={['Instagram']} />} after={<p className="cf-body"><b className="cf-accent">Qué significa:</b> no es regla; es la razón para medir cada caso.</p>} />
        : <div><p className="cf-body-lg mb-4"><b>¿En qué red rindió más cada publicación de este caso?</b></p><VoteSide id="v12" manual={c.manual} size={170} /></div>}</div></>) },
  { id: 'V13', title: 'Así viajó la crisis', moment: 'Circulación', source: `Interacciones diarias. ${FK}`, notes: 'Min 32–37 (circulación, 12 y 14). “Comparen con la ronda 2 de Anaya: el que publicó el 27 de octubre iba sobre la ola; el del 18 de noviembre llegó cuando ya había pasado.” Patrón de lo que viaja: nombres propios, verbos de acción (exhibe, señala, renuncia), conflicto y un detalle concreto.', render: () => (
    <><Kicker>02 · Circulación</Kicker><Title>Así viajó la crisis</Title><LineChart /><div className="grid grid-cols-2 gap-8 mt-4"><Means>Casi nada hasta el 19 de octubre; después, dos olas. La ventana para hablar dura días, no semanas.</Means><Local>La ventana duró días. Una crisis local en campaña dura de 48 a 72 horas. ¿Tienen quién escuche y responda el mismo día?</Local></div></>) },
  { id: 'V15', title: 'Escuchar bien: el ruido', moment: 'Circulación', source: FK, notes: '“Si buscan ‘INE’ sin cuidado, se les cuela el futbolista.”', render: () => (
    <><Kicker>02 · Circulación</Kicker><Title>Escuchar bien: el ruido</Title><div className="grid grid-cols-[560px_1fr] gap-14 items-center">
      <Card><div className="cf-giant">{INE.ruido_busqueda.porcentaje_interacciones}%</div><p className="cf-body mt-4">de las interacciones del análisis eran del futbolista Gilberto Mora tramitando su credencial del INE.</p></Card>
      <div className="space-y-10"><p className="cf-sub"><b className="cf-accent">Regla:</b> define bien la búsqueda.</p><p className="cf-body-lg">En su municipio: si buscan solo el apellido del alcalde, les va a salir su primo el panadero.</p></div></div></>) },
  { id: 'V16', title: 'Mismos hechos, dos historias', moment: 'Reinterpretación', source: 'Clasificación de narrativas: KiMedia, a partir del top 500.', notes: 'Min 37–47: arranca reinterpretación. “Esto es la reinterpretación. Desinformar no siempre es mentir: muchas veces es el mismo hecho con otro marco. Y ahora van a ver que cada bando vive en su propio cuarto.” Cuida tu voz: atribuye siempre (“la narrativa A sostiene…”).', render: () => (
    <><Kicker>03 · Reinterpretación</Kicker><Title>Mismos hechos, dos historias</Title><div className="grid grid-cols-2 gap-10">{[['Narrativa A', '“Taddei es de Morena y Morena controla el INE.”', 'Loret y Latinus, Salinas, páginas opositoras y figuras del PAN.'], ['Narrativa B', '“La Presidenta destapó la cloaca heredada del PRIAN.”', 'La Presidenta, senadores y diputados de Morena, y páginas afines.']].map(([k, q, w]) => <Card key={k}><span className="cf-num">{k}</span><p className="cf-sub mt-4">{q}</p><p className="cf-body mt-8 cf-muted">Quién la empujó: {w}</p></Card>)}</div>
      <p className="cf-quote text-center mt-14">Nadie discute los hechos. Lo que se disputa es qué significan.</p></>) },
  { id: 'V17', title: 'Cuatro publicaciones, cuatro comunidades', moment: 'Reinterpretación', polls: [poll('v17')], source: `${EC}. Postura respecto al mensaje de quien publica.`, notes: 'Que voten antes de ver las barras. “Ni Latinus ni la senadora están convenciendo a nadie nuevo.” Límites: en Latinus, 0% en contra quiere decir que no salió ninguno en la muestra; en Salinas solo se pudo leer el 6% de sus comentarios.', render: c => {
    const order = ['ig2', 'ig1', 'fb1', 'fb2'];
    const name: Record<string, string> = { ig2: 'Latinus · Instagram', ig1: 'Ricardo Salinas · Instagram', fb1: 'Verónica Camino, senadora · Facebook', fb2: 'Claudia Sheinbaum · Facebook' };
    const rows = <><div className="cf-legend"><span className="a">A favor de quien publica</span><span className="b">En contra</span><span className="c">Neutral o ruido</span></div>
      <div className="space-y-2 mt-3">{order.map(id => { const p = COM.publicaciones.find(x => x.id === id)!; const s = p.postura_pct; return <div key={id} className="cf-stack-row"><span>{name[id]}</span><div className="cf-stack"><i className="a" style={{ width: `${s.alineado_con_emisor}%` }}>{s.alineado_con_emisor}</i><i className="b" style={{ width: `${s.en_contra}%` }}>{s.en_contra || ''}</i><i className="c" style={{ width: `${s.neutral_o_ruido}%` }}>{s.neutral_o_ruido}</i></div></div>; })}</div></>;
    return <><Kicker>03 · Reinterpretación</Kicker><Title>Cuatro publicaciones, cuatro comunidades</Title>{c.revealed
      ? <Contrast {...ct('v17')} cols="440px 1fr" real={rows}
          after={<div className="grid grid-cols-2 gap-6"><Means>Tres son cámaras de eco: su comunidad repite el mensaje. La excepción es la Presidenta: su propia audiencia no salió a defenderla.</Means><Local>Tres de cuatro publicaciones solo convencieron a los ya convencidos. Una elección intermedia no se gana en su cámara de eco: se gana con quien no los sigue.</Local></div>} />
      : <div className="grid grid-cols-[1fr_420px] gap-12"><div><p className="cf-sub">¿Cuál de estas cuatro publicaciones tuvo más comentarios en contra de quien publicó?</p><div className="mt-8"><LiveBars id="v17" manualMode={c.manual} /></div></div><QR size={260} label="Vota aquí" /></div>}</>;
  } },
  { id: 'V18', title: 'Lo que dijo vs. lo que leyeron', moment: 'Reinterpretación', source: 'Comentarios de la publicación de Claudia Sheinbaum en Facebook, sin duplicados ni palabras vacías.', notes: 'Min 37–47 (reinterpretación, 15–18). “Ella quiso decir ‘investiguemos el pasado’. Su audiencia leyó ‘otra vez le echa la culpa al pasado’. Tu mensaje lo termina de escribir quien lo lee.”', render: () => (
    <><Kicker>03 · Reinterpretación · Claudia Sheinbaum en Facebook</Kicker><Title>Lo que dijo la Presidenta vs. lo que leyó su audiencia</Title><div className="grid grid-cols-[720px_1fr] gap-12">
      <div className="space-y-5"><Card><small className="cf-label">Lo que dijo Claudia Sheinbaum</small><p className="cf-body mt-3">“Dos grupos empresariales acapararon los materiales electorales por más de 20 años; hay que investigar los periodos anteriores.”</p></Card>
        <Card><small className="cf-label">Lo que más se repitió en contra (15%)</small><p className="cf-caption mt-3">“El pasado ya fue, hágase responsable de lo que pasa hoy.” Segundo comentario con más “me gusta”: 3,468.</p></Card>
        <p className="cf-caption cf-muted"><b className="cf-accent">{fb2.respuestas_entre_usuarios_pct}%</b> de los comentarios son pleitos entre usuarios. En las otras tres publicaciones va de 3% a 11%.</p></div>
      <div><small className="cf-label">Lo que leyeron · palabras de sus comentarios</small><Cloud words={fb2.nube_palabras} max={20} scale={44} />
      <p className="cf-body-lg mt-8"><b>Esto no le pasa solo a la Presidenta: le pasa a cualquiera que gobierna y explica con el pasado. Si su partido gobierna su municipio o su estado, ustedes son la Presidenta de este ejemplo.</b></p></div></div></>) },
  { id: 'V19', title: '¿Elogio o burla?', moment: 'Reinterpretación', optional: true, polls: [poll('v19')], source: 'Comentario con más “me gusta” de la publicación de la Presidenta. Sin nombres de usuarios.', notes: 'Opcional. Es el momento con más energía de la sesión. Deja que voten y comenten; luego R para revelar.', render: c => (
    <><Kicker>03 · Reinterpretación</Kicker><Title>¿Elogio o burla?</Title><div className="grid grid-cols-[1fr_1.1fr] gap-12 items-start">
      <Card><p className="cf-body-lg italic">{amb.texto_resumen}</p><p className="cf-body mt-5 cf-muted">{fmt(amb.likes)} “me gusta”</p></Card>
      {c.revealed
        ? <Contrast {...ct('v19')} cols="1fr" real={<><p className="cf-body-lg"><b>Ni los propios usuarios supieron.</b></p><div className="flex flex-wrap gap-3 mt-4">{amb.reacciones_en_respuestas.map(r => <span key={r} className="cf-bubble">{r}</span>)}</div></>}
            tpl={p => `La respuesta más honesta era “No se puede saber”: la eligió el ${p}% de la sala.`} lesson="Por eso la opinión en redes se lee a mano: una máquina que cuenta palabras lo habría contado como apoyo." />
        : <VoteSide id="v19" manual={c.manual} />}</div></>) },
  { id: 'V21', title: '¿Responder, monitorear o corregir?', moment: 'Respuesta', toggles: [{ key: 'v21-extra', label: 'Mostrar casos 2 y 3 (opcionales)' }],
    polls: c => CASES.filter(x => !x.optional || c.flag('v21-extra')).map(x => poll(x.id)),
    notes: 'Min 47–55 (respuesta, 20 y 21). Un caso a la vez: votan, R revela, y cambias de caso con los botones. Los casos 2 y 3 se activan en /admin. “No toda crítica merece respuesta. Responder a todo también amplifica.”', render: c => (
    <><Kicker>04 · Respuesta · casos ficticios</Kicker><Title>¿Responder, monitorear o corregir?</Title><Classify c={c} /></>) },
  { id: 'V22', title: 'Interacción no es movilización', moment: 'Respuesta', polls: [poll('v22')], source: 'Ejemplo ilustrativo, cifras ficticias.', notes: '“Dejémoslo como apuesta.” Que voten y pulsa R. “Cuando organicen algo, midan cada escalón.”', render: c => (
    <><Kicker>04 · Respuesta</Kicker><Title>Interacción no es movilización</Title>{c.revealed
      ? <Contrast {...ct('v22')} cols="1fr 1fr" realTitle="En el ejemplo" real={<div className="cf-funnel">{[['200', 'dieron “me gusta”'], ['60', 'dijeron “ahí estaré”'], ['15', 'llegaron']].map(([n, t], i) => <div key={n} style={{ width: `${100 - i * 22}%` }}><b style={i === 2 ? { color: 'hsl(var(--primary-foreground))' } : undefined}>{n}</b><span>{t}</span></div>)}<small>Ejemplo ilustrativo, cifras ficticias</small></div>}
          after={<Local>El 6 de junio de 2027 no cuentan los “me gusta”: cuenta quién llega a la casilla. Midan cada escalón.</Local>} />
      : <div className="grid grid-cols-[1fr_420px] gap-12"><div><p className="cf-sub">En una reunión vecinal convocada en redes, de cada 200 “me gusta”, ¿cuántos creen que llegan?</p><div className="mt-8"><LiveBars id="v22" manualMode={c.manual} /></div></div><QR size={260} label="Vota aquí" /></div>}</>) },
  { id: 'V23', title: 'Tres ideas y tarea', notes: 'Min 55–60 (tres ideas y cierre). Pide que mañana se sienten agrupados por estado.', render: () => (
    <><Kicker>Para llevar</Kicker><Title>Tres ideas</Title><div className="grid grid-cols-3 gap-8">{['Escucha antes de segmentar.', 'Verifica antes de amplificar.', 'Mide participación, no likes.'].map((t, i) => <Card key={t}><span className="cf-num">0{i + 1}</span><p className="cf-sub mt-4">{t}</p></Card>)}</div>
      <div className="cf-band mt-14"><b>Tarea</b><span>Mañana, 9:00: teléfono cargado y un municipio o distrito donde se vote en 2027. Vamos a trabajar el suyo.</span></div></>) },
  { id: 'V24', title: 'Cierre', bare: true, notes: 'Agradece. La nube se arma con lo que escriben.', render: () => (
    <div className="cf-cover">
      <div className="flex items-center gap-10"><FoxLogo size={100} /><KiLogo size={56} /></div>
      <div className="grid grid-cols-[1fr_760px] gap-14 items-center">
        <div><h1 className="cf-hero">Gracias</h1><p className="cf-sub mt-6">{activity('v24').q}</p><p className="cf-body mt-10"><b>Jesús Caudillo</b> · hola@kimedia.mx</p></div>
        <LiveCloud id="v24" />
      </div>
    </div>) },
];

export default function Comprender2027({ admin = false }: { admin?: boolean }) { return <Deck slides={SLIDES} label="Centro Fox" admin={admin} late={{ minute: 30, slideId: 'V13' }} />; }
