import { Deck, type Ctx, type Slide } from '@/components/centro-fox-2027/Deck';
import { INE, COM, CASES, MATRIX, activity, fmt, millions, multiplier, type Moment } from '@/data/centroFox2027';
import { Bars, Card, Cloud, FoxLogo, KiLogo, Kicker, Means, Photo, QR, Title } from '@/components/centro-fox-2027/Parts';
import plaza from '@/assets/centro-fox/cf27-plaza.jpg';
import phone from '@/assets/centro-fox/cf27-phone.jpg';
import calle from '@/assets/centro-fox/cf27-conversacion.jpg';
import reunion from '@/assets/centro-fox/cf27-reunion.jpg';
import { LiveBars, LiveCloud } from '@/components/centro-fox-2027/Live';


const FK = 'Top 500 publicaciones por interacción · 1 oct–19 nov 2026 · Facebook e Instagram';
const EC = 'Lectura manual de 100 comentarios al azar por publicación (±10 puntos)';
const firstSentence = (t: string) => { const l = t.split('\n')[0].replace(/^[^\p{L}\d¡¿“"]+/u, ''); const m = l.match(/^.+?[.!?](?=\s|$)/u); return m ? m[0] : l; };
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

function Prediction({ round, c }: { round: number; c: Ctx }) {
  const r = INE.juego_cual_funciono[round];
  const id = activity(`v${String(9 + round).padStart(2, '0')}`).id;
  const post = (k: 'A' | 'B') => { const p = r[k]; const win = c.revealed && p.interacciones >= r[k === 'A' ? 'B' : 'A'].interacciones; return (
    <Card className={`cf-post ${win ? 'win' : ''}`}>
      <div className="cf-post-head"><span className="cf-tag">{k}</span><div><b>{p.perfil}</b><small>{p.red} · {short(p.fecha)}</small></div></div>
      <p className="cf-post-text whitespace-pre-line">{p.texto}</p>
      <div className="cf-post-num">{c.revealed ? <span className="cf-num-inline">(<strong>{fmt(p.interacciones)}</strong> interacciones)</span> : <span className="cf-hidden">(? interacciones)</span>}</div>
    </Card>); };
  return <div className="grid grid-cols-[1fr_1fr_440px] gap-8 items-start">
    {post('A')}{post('B')}
    <div className="flex flex-col gap-6">
      {c.revealed
        ? <Card className="cf-lesson"><div className="cf-big">{multiplier(r.A.interacciones, r.B.interacciones).toLocaleString('es-MX')} veces</div><p>{r.leccion}</p></Card>
        : <QR size={200} label="Vota A o B" />}
      <LiveBars id={id} manualMode={c.manual} />
    </div>
  </div>;
}

function Classify({ c }: { c: Ctx }) {
  const k = CASES[c.step % CASES.length];
  return <div className="grid grid-cols-[1fr_620px] gap-10">
    <div>
      <div className="flex gap-3 mb-6">{CASES.map((x, i) => <button key={x.id} className={`cf-chip ${i === c.step % CASES.length ? 'on' : ''}`} onClick={() => c.setStep(i)}>Caso {i + 1}{i === 2 ? ' (si hay tiempo)' : ''}</button>)}</div>
      <Card><h3 className="cf-h3">{k.title}</h3><p className={`${c.revealed ? "cf-body" : "cf-body-lg"} mt-4`}>{k.text}</p>
        {c.revealed && <p className="cf-body mt-6"><b className="cf-accent">{k.answer}.</b> {k.why}</p>}</Card>
      {c.revealed && <table className="cf-table compact mt-6"><tbody>{MATRIX.map(m => <tr key={m.accion} className={m.accion === k.answer ? 'hl' : ''}><td>{m.tipo}</td><td><b>{m.accion}</b></td><td>{m.como}</td></tr>)}</tbody></table>}
    </div>
    <div className="flex flex-col gap-6">{!c.revealed && <QR size={190} label="¿Qué harías tú?" />}<LiveBars id={k.id} manualMode={c.manual} correct={c.revealed ? k.answer : undefined} /></div>
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
  { id: 'V02', title: '¿Dónde te enteras primero?', notes: 'Comenta el resultado en una frase: “Fíjense dónde está la conversación: ahí se gana o se pierde”.', render: c => (
    <div className="grid grid-cols-[1fr_560px] gap-14 h-full"><div><Kicker>Para empezar · vota desde tu teléfono</Kicker><Title>¿Dónde te enteras primero de una noticia?</Title><div className="mt-6"><LiveBars id="v02" manualMode={c.manual} /></div></div>
      <div className="cf-photo-qr"><Photo src={phone} /><QR size={190} label="Vota aquí" /></div></div>) },
  { id: 'V03', title: '¿Sabes qué se dijo de tu municipio?', notes: '“Casi todos publicamos, pocos escuchamos. Hoy vamos a ver por qué ese orden está al revés.”', render: c => (
    <div className="grid grid-cols-[1fr_560px] gap-14 h-full"><div><Kicker>Para empezar · vota desde tu teléfono</Kicker><Title>¿Sabes qué se dijo esta semana en redes sobre tu municipio?</Title><div className="mt-6"><LiveBars id="v03" manualMode={c.manual} /></div></div>
      <div className="cf-photo-qr"><Photo src={calle} /><QR size={190} label="Vota aquí" /></div></div>) },
  { id: 'V04', title: 'Objetivo de la capacitación', notes: '“Hoy no vienen a escuchar teoría. Vamos a desarmar un caso real y mañana lo aplican a su municipio.”', render: () => (
    <div className="grid grid-cols-[1fr_640px] gap-14 h-full items-center"><div><Kicker>Objetivo</Kicker><Title>Que salgan sabiendo leer cómo se mueve una conversación en redes y cómo cuidar su mensaje en cada momento.</Title>
      <div className="grid grid-cols-2 gap-6 mt-10"><Card><span className="cf-num">Hoy</span><p className="cf-body mt-3">Desarmamos un caso nacional: quién habló, qué circuló, cómo se reinterpretó y qué se hizo después.</p></Card>
        <Card><span className="cf-num">Mañana</span><p className="cf-body mt-3">Taller: cada equipo arma su propio plan para su municipio o distrito, en una hoja.</p></Card></div></div>
      <Photo src={reunion} className="h-[760px]" /></div>) },
  { id: 'V05', title: 'Hoy: un solo ciclo', notes: '“Casi siempre pensamos solo en el momento 1: publicar. Hoy vamos a ver los cuatro, y sobre todo el 2, que es el que menos se cuida: escuchar cómo circula lo que publicamos.”', render: () => (
    <><Kicker>Hoy</Kicker><Title>Un mensaje, cuatro momentos</Title><div className="cf-flow">{[['Emisión', 'Qué digo, a quién y dónde.'], ['Circulación', 'Qué viaja y qué se muere.'], ['Reinterpretación', 'Qué hacen otros con mi mensaje.'], ['Respuesta', 'Cuándo respondo y cómo lo vuelvo acción.']].map(([t, d], i) => <Card key={t}><span className="cf-num">{i + 1}</span><h3 className="cf-h3">{t}</h3><p className="cf-body mt-3">{d}</p></Card>)}</div>
      <p className="cf-quote mt-14">Lo que publicas deja de ser tuyo en cuanto sale. La estrategia está en cuidar los cuatro momentos.</p></>) },
  { id: 'V06', title: 'El caso: la crisis del INE', source: 'Top 500 publicaciones por interacción. Búsqueda: INE, Instituto Nacional Electoral, Guadalupe Taddei, Lorenzo Córdova.', notes: '“No venimos a ver quién tiene la razón en el escándalo. Venimos a ver cómo se mueve una conversación nacional, y las dos narrativas las vamos a ver con la misma lupa.” Aquí di los límites: es un top 500 por interacción, solo Facebook e Instagram, y un “me gusta” no es apoyo.', render: () => (
    <><Kicker>El caso</Kicker><Title>La crisis del INE en redes</Title><div className="grid grid-cols-4 gap-8">{[[fmt(meta.publicaciones), 'publicaciones con más interacción'], [millions(meta.interacciones_totales), 'de interacciones'], [fmt(meta.perfiles_distintos), 'perfiles distintos'], ['1 oct – 19 nov', 'Facebook e Instagram']].map(([n, t]) => <Card key={t}><div className="cf-big">{n}</div><p className="cf-body mt-3">{t}</p></Card>)}</div>
      <p className="cf-body-lg mt-14 max-w-[1300px]">No es un juicio sobre el fondo. Es una forma de ver qué circuló, quién lo movió y qué hizo la gente con eso.</p></>) },
  { id: 'V07', title: '¿Quién se llevó la conversación?', moment: 'Emisión', source: 'Porcentaje de interacciones del top 500. Clasificación de actores: KiMedia.', notes: 'Pregunta al aire: “¿Quién creen que dominó?”. Deja que digan nombres señalando las tarjetas. Pulsa R. Luego: “Un solo empresario tuvo casi el doble que las figuras del PAN y Xóchitl Gálvez juntas, en una crisis que podía jugar a favor de la oposición”.', render: c => (
    <><Kicker>01 · Emisión</Kicker><Title>{c.revealed ? 'Esto fue lo que pasó' : '¿Quién creen que dominó la conversación?'}</Title>{c.revealed
      ? <div className="grid grid-cols-[1fr_520px] gap-14 items-start"><div className="cf-tiles">{conversation.map((a, i) => <div key={a.label} className={`cf-tile ${i === 0 ? 'top' : ''} ${[pan.label, ine.label].includes(a.label) ? 'hl' : ''}`} style={{ flexGrow: Math.max(a.value, 2) }}><b>{a.value}%</b><span>{a.label}</span></div>)}</div><Means>Los políticos de todos los partidos juntos no llegaron al 9%. La conversación la llevaron otros.</Means></div>
      : <div className="cf-guess">{[...conversation].sort((x, y) => x.label.localeCompare(y.label)).map(a => <Card key={a.label}><span>{a.label}</span><b>?</b></Card>)}</div>}</>) },
  { id: 'V08', title: 'Si no emites tú', moment: 'Emisión', source: FK, notes: '“La institución en crisis no habló. Y cuando tú no hablas, otro decide qué significa tu historia. Eso mismo les puede pasar en su municipio.”', render: () => (
    <><Kicker>01 · Emisión</Kicker><Title>Si no emites tú, otros cuentan la historia</Title><div className="grid grid-cols-3 gap-8">
      <Card><div className="cf-big">{ine.value}%</div><p className="cf-body mt-4">pesó la cuenta del INE en la conversación sobre su propia crisis.</p></Card>
      <Card><div className="cf-big">1 publicación</div><p className="cf-body mt-4">del INE entró al top 500. Era sobre un futbolista tramitando su credencial.</p></Card>
      <Card><div className="cf-big">{pan.value}% vs {salinas.value}%</div><p className="cf-body mt-4">Figuras del PAN y Xóchitl Gálvez juntas, contra un solo empresario.</p></Card></div></>) },
  ...[0, 1].map((r): Slide => ({ id: `V${String(9 + r).padStart(2, '0')}`, title: `¿Cuál funcionó mejor? Ronda ${r + 1}`, moment: 'Emisión', optional: r === 2, source: FK,
    notes: ['“Mismo perfil, mismo tema, casi la misma semana. Lo único que cambia es cómo está escrito.” Pulsa R para revelar.', '“Es un perfil de su partido y no es mal contenido: llegó tarde. En campaña, llegar a tiempo vale más que la producción.” El mismo argumento, el día del hecho y con datos frescos, rindió unas 4 veces más.', 'Opcional. Si quieres una ronda extra: Salinas, 18,488 contra 192,150. El conflicto personal multiplica la interacción, pero no necesariamente construye reputación.'][r],
    render: c => <><Kicker>01 · Emisión · Ronda {r + 1}</Kicker><Title>¿Cuál funcionó mejor?</Title><Prediction round={r} c={c} /></> })),
  { id: 'V12', title: 'Cada red pide algo distinto', moment: 'Emisión', source: 'Gráfica: mediana de la tasa de interacción por publicación, top 500 del caso. Solo Facebook e Instagram.', notes: '“Microsegmentar es elegir red, formato y momento con evidencia.” Recorre una fila por red. Remata con la gráfica: en este caso Instagram rindió el doble por publicación; no es regla, es la razón para medir cada caso.', render: () => (
    <><Kicker>01 · Emisión</Kicker><Title>Cada red pide algo distinto</Title><div className="grid grid-cols-[1fr_600px] gap-12">
      <table className="cf-table compact"><thead><tr><th>Red</th><th>Para qué sirve</th><th>Qué rinde</th><th>Error común</th></tr></thead><tbody>{[
        ['Facebook', 'Comunidad local: grupos de colonia, páginas del municipio, gente de 35 años en adelante.', 'Video corto con contexto, foto con dato concreto, transmisión en vivo.', 'Publicar lo mismo que en todas las redes, sin mencionar el lugar.'],
        ['Instagram', 'Imagen personal y cercanía; público más joven.', 'Reel de menos de un minuto o carrusel con una sola idea.', 'Fotos de evento sin historia ni rostro.'],
        ['TikTok', 'Llegar a quien todavía no te sigue.', 'Video vertical, a cámara, con gancho en los primeros 3 segundos.', 'Copiar tendencias que no tienen que ver con el tema.'],
        ['X (Twitter)', 'Prensa, líderes de opinión y reacción rápida.', 'Postura clara en una frase, a tiempo, con dato o enlace.', 'Entrar a pleitos que solo amplifican al otro.'],
        ['WhatsApp', 'Confianza: aquí se decide qué se cree.', 'Mensaje corto, imagen o audio fácil de reenviar.', 'Mandar cadenas sin verificar.'],
      ].map(([r, a, b, e]) => <tr key={r}><td><b>{r}</b></td><td>{a}</td><td>{b}</td><td className="cf-muted">{e}</td></tr>)}</tbody></table>
      <div><small className="cf-label">En este caso</small><div className="mt-4"><Bars rows={fbIg.map(f => ({ label: f.red, value: f.mediana_tasa_interaccion_pct }))} unit="%" highlight={['Instagram']} /></div><div className="mt-8"><Means>Instagram rindió el doble por publicación. No es regla: es la razón para medir cada caso.</Means></div></div></div></>) },
  { id: 'V13', title: 'Así viajó la crisis', moment: 'Circulación', source: `Interacciones diarias. ${FK}`, notes: '“Comparen con la ronda 2 de Anaya: el que publicó el 27 de octubre iba sobre la ola; el del 18 de noviembre llegó cuando ya había pasado.”', render: () => (
    <><Kicker>02 · Circulación</Kicker><Title>Así viajó la crisis</Title><LineChart /><div className="mt-4"><Means>Casi nada hasta el 19 de octubre; después, dos olas. La ventana para hablar dura días, no semanas.</Means></div></>) },
  { id: 'V14', title: 'Lo que viaja', moment: 'Circulación', optional: true, source: FK, notes: 'Opcional. No leas las cinco: señala el patrón.', render: () => (
    <><Kicker>02 · Circulación</Kicker><Title>Lo que viaja</Title><div className="grid grid-cols-[1fr_520px] gap-12"><div className="space-y-4">{INE.top10_publicaciones.slice(0, 5).map(p => <div key={p.perfil + p.fecha + p.interacciones} className="cf-row"><b>{fmt(p.interacciones)}</b><span><strong>{p.perfil}</strong> · {p.red} · {short(p.fecha)}<br /><em>“{firstSentence(p.texto_resumen)}”</em></span></div>)}</div>
      <Means>El patrón: nombres propios, verbos de acción (exhibe, señala, renuncia), conflicto y un detalle concreto.</Means></div></>) },
  { id: 'V15', title: 'Escuchar bien: el ruido', moment: 'Circulación', source: FK, notes: '“Si buscan ‘INE’ sin cuidado, se les cuela el futbolista. En su municipio, si buscan el apellido del alcalde, les va a salir su primo el panadero.”', render: () => (
    <><Kicker>02 · Circulación</Kicker><Title>Escuchar bien: el ruido</Title><div className="grid grid-cols-[560px_1fr] gap-14 items-start">
      <Card><div className="cf-giant">{INE.ruido_busqueda.porcentaje_interacciones}%</div><p className="cf-body mt-4">Casi {fmt(Math.round(INE.ruido_busqueda.interacciones / 1000) * 1000)} interacciones del análisis eran del futbolista Gilberto Mora tramitando su credencial del INE.</p></Card>
      <div className="space-y-6">{['Define bien la búsqueda: usa palabras que solo signifiquen lo que buscas.', 'Antes de creerle a la gráfica, revisa a mano una muestra.', 'Separa lo que circula de lo que la gente opina.'].map((t, i) => <div key={t} className="cf-row"><b>{i + 1}</b><span className="cf-body-lg">{t}</span></div>)}</div></div></>) },
  { id: 'V16', title: 'Mismos hechos, dos historias', moment: 'Reinterpretación', source: 'Clasificación de narrativas: KiMedia, a partir del top 500.', notes: '“Esto es la reinterpretación. Desinformar no siempre es mentir: muchas veces es el mismo hecho con otro marco. Y ahora van a ver que cada bando vive en su propio cuarto.” Cuida tu voz: atribuye siempre (“la narrativa A sostiene…”).', render: () => (
    <><Kicker>03 · Reinterpretación</Kicker><Title>Mismos hechos, dos historias</Title><div className="grid grid-cols-2 gap-10">{[['Narrativa A', '“Taddei es de Morena y Morena controla el INE.”', 'Loret y Latinus, Salinas, páginas opositoras y figuras del PAN.'], ['Narrativa B', '“La Presidenta destapó la cloaca heredada del PRIAN.”', 'La Presidenta, senadores y diputados de Morena, y páginas afines.']].map(([k, q, w]) => <Card key={k}><span className="cf-num">{k}</span><p className="cf-sub mt-4">{q}</p><p className="cf-body mt-8 cf-muted">Quién la empujó: {w}</p></Card>)}</div>
      <p className="cf-quote text-center mt-14">Nadie discute los hechos. Lo que se disputa es qué significan.</p></>) },
  { id: 'V17', title: 'Cuatro publicaciones, cuatro comunidades', moment: 'Reinterpretación', source: `${EC}. Postura respecto al mensaje de quien publica.`, notes: '“Ni Latinus ni la senadora están convenciendo a nadie nuevo: les hablan a los que ya están convencidos. Y el mensaje de más alto perfil fue el más expuesto.” Límites: en Latinus, 0% en contra quiere decir que no salió ninguno en la muestra; en Salinas solo se pudo leer el 6% de sus comentarios.', render: () => {
    const order = ['ig2', 'ig1', 'fb1', 'fb2'];
    const name: Record<string, string> = { ig2: 'Latinus · Instagram', ig1: 'Ricardo Salinas · Instagram', fb1: 'Verónica Camino, senadora · Facebook', fb2: 'Claudia Sheinbaum · Facebook' };
    return <><Kicker>03 · Reinterpretación</Kicker><Title>Cuatro publicaciones, cuatro comunidades</Title>
      <div className="cf-legend"><span className="a">A favor de quien publica</span><span className="b">En contra</span><span className="c">Neutral o ruido</span></div>
      <div className="space-y-6 mt-6">{order.map(id => { const p = COM.publicaciones.find(x => x.id === id)!; const s = p.postura_pct; return <div key={id} className="cf-stack-row"><span>{name[id]}</span><div className="cf-stack"><i className="a" style={{ width: `${s.alineado_con_emisor}%` }}>{s.alineado_con_emisor}</i><i className="b" style={{ width: `${s.en_contra}%` }}>{s.en_contra || ''}</i><i className="c" style={{ width: `${s.neutral_o_ruido}%` }}>{s.neutral_o_ruido}</i></div></div>; })}</div>
      <div className="mt-10"><Means>Tres son cámaras de eco: su comunidad repite el mensaje. La excepción es la Presidenta: su propia audiencia no salió a defenderla.</Means></div></>;
  } },
  { id: 'V18', title: 'Lo que dijo vs. lo que leyeron', moment: 'Reinterpretación', source: 'Comentarios de la publicación de Claudia Sheinbaum en Facebook, sin duplicados ni palabras vacías.', notes: '“Ella quiso decir ‘investiguemos el pasado’. Su audiencia leyó ‘otra vez le echa la culpa al pasado’. Tu mensaje lo termina de escribir quien lo lee.”', render: () => (
    <><Kicker>03 · Reinterpretación · Claudia Sheinbaum en Facebook</Kicker><Title>Lo que dijo la Presidenta vs. lo que leyó su audiencia</Title><div className="grid grid-cols-[720px_1fr] gap-12">
      <div className="space-y-5"><Card><small className="cf-label">Lo que dijo Claudia Sheinbaum</small><p className="cf-body mt-3">“Dos grupos empresariales acapararon los materiales electorales por más de 20 años; hay que investigar los periodos anteriores.”</p></Card>
        <Card><small className="cf-label">Lo que más se repitió en contra (15%)</small><p className="cf-caption mt-3">“El pasado ya fue, hágase responsable de lo que pasa hoy.” Segundo comentario con más “me gusta”: 3,468.</p></Card>
        <p className="cf-caption cf-muted"><b className="cf-accent">{fb2.respuestas_entre_usuarios_pct}%</b> de los comentarios son pleitos entre usuarios. En las otras tres publicaciones va de 3% a 11%.</p></div>
      <div><small className="cf-label">Lo que leyeron · palabras de sus comentarios</small><Cloud words={fb2.nube_palabras} max={24} scale={50} /></div></div></>) },
  { id: 'V19', title: '¿Elogio o burla?', moment: 'Reinterpretación', source: 'Comentario con más “me gusta” de la publicación de la Presidenta. Sin nombres de usuarios.', notes: 'Es el momento con más energía de la sesión. Deja que voten y comenten; luego R para revelar.', render: c => (
    <><Kicker>03 · Reinterpretación</Kicker><Title>¿Elogio o burla?</Title><div className="grid grid-cols-[1fr_640px] gap-12">
      <div><Card><p className="cf-body-lg italic">{amb.texto_resumen}</p><p className="cf-body mt-5 cf-muted">{fmt(amb.likes)} “me gusta”</p></Card>
        {c.revealed && <><div className="flex flex-wrap gap-4 mt-8">{amb.reacciones_en_respuestas.map(r => <span key={r} className="cf-bubble">{r}</span>)}</div><p className="cf-body-lg mt-8"><b>Ni los propios usuarios supieron.</b> Por eso la opinión en redes se lee a mano: una máquina que cuenta palabras lo habría contado como apoyo.</p></>}</div>
      <div className="flex flex-col gap-6">{!c.revealed && <QR size={190} label="Vota aquí" />}<LiveBars id="v19" manualMode={c.manual} /></div></div></>) },
  { id: 'V20', title: 'Verificar antes de amplificar', moment: 'Reinterpretación', optional: true, notes: '“Lo que más daño les puede hacer en 2027 no es lo que inventen de ustedes; es lo que ustedes compartan sin verificar.”', render: () => (
    <><Kicker>03 · Reinterpretación</Kicker><Title>Verificar antes de amplificar</Title><div className="cf-flow five">{[['Detener', 'No compartas en caliente.'], ['Precisar', '¿Qué se afirma exactamente?'], ['Rastrear', '¿Quién lo dijo primero?'], ['Contrastar', '¿Lo confirma otra fuente?'], ['Documentar', 'Guarda capturas y enlaces.']].map(([t, d], i) => <Card key={t}><span className="cf-num">{i + 1}</span><h3 className="cf-h3">{t}</h3><p className="cf-body mt-3">{d}</p></Card>)}</div>
      <p className="cf-body-lg mt-14 max-w-[1400px]">En campaña, la desinformación llega por dos lados: contra ti y desde los tuyos. El protocolo sirve para las dos.</p></>) },
  { id: 'V21', title: '¿Responder, monitorear o corregir?', moment: 'Respuesta', notes: 'Dos minutos por caso. Cambia de caso con los botones; R revela. “No toda crítica merece respuesta. Responder a todo también amplifica.”', render: c => (
    <><Kicker>04 · Respuesta · casos ficticios</Kicker><Title>¿Responder, monitorear o corregir?</Title><Classify c={c} /></>) },
  { id: 'V22', title: 'Interacción no es movilización', moment: 'Respuesta', source: 'Ejemplo ilustrativo; cifras ficticias.', notes: 'Pregunta al aire sobre la marcha del 6 de diciembre. “Dejémoslo como apuesta. Lo importante es que, cuando organicen algo, midan cada escalón.”', render: () => (
    <><Kicker>04 · Respuesta</Kicker><Title>Interacción no es movilización</Title><div className="grid grid-cols-[1fr_640px] gap-14 items-center">
      <div className="cf-funnel">{[['200', 'dieron “me gusta”'], ['60', 'dijeron “ahí estaré”'], ['15', 'llegaron']].map(([n, t], i) => <div key={n} style={{ width: `${100 - i * 22}%` }}><b>{n}</b><span>{t}</span></div>)}<small>Ejemplo ficticio</small></div>
      <div className="space-y-8"><p className="cf-body-lg">Ya circula la convocatoria a una marcha nacional el 6 de diciembre, con cientos de miles de interacciones. <b>¿Cuántas personas creen que llegarán?</b></p><Means>Mide cada nivel por separado: alcance, interés, registro, asistencia y seguimiento.</Means></div></div></>) },
  { id: 'V23', title: 'Tres ideas y tarea', notes: 'Pide que mañana se sienten agrupados por estado.', render: () => (
    <><Kicker>Para llevar</Kicker><Title>Tres ideas</Title><div className="grid grid-cols-3 gap-8">{['Escucha antes de segmentar.', 'Verifica antes de amplificar.', 'Mide participación, no likes.'].map((t, i) => <Card key={t}><span className="cf-num">0{i + 1}</span><p className="cf-sub mt-4">{t}</p></Card>)}</div>
      <div className="cf-band mt-14"><b>Tarea para mañana, 9:00</b><span>Traigan el teléfono cargado y un municipio o distrito elegido. Vamos a trabajar el suyo.</span></div></>) },
  { id: 'V24', title: 'Cierre', bare: true, notes: 'Agradece. La nube se arma con lo que escriben.', render: () => (
    <div className="cf-cover">
      <div className="flex items-center gap-10"><FoxLogo size={100} /><KiLogo size={56} /></div>
      <div className="grid grid-cols-[1fr_760px] gap-14 items-center">
        <div><h1 className="cf-hero">Gracias</h1><p className="cf-sub mt-6">{activity('v24').q}</p><p className="cf-body mt-10"><b>Jesús Caudillo</b> · hola@kimedia.mx</p></div>
        <LiveCloud id="v24" />
      </div>
    </div>) },
];

export default function Comprender2027() { return <Deck slides={SLIDES} label="Centro Fox" />; }
