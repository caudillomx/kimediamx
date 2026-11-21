import { Deck, type Ctx, type Slide } from '@/components/centro-fox-2027/Deck';
import { Card, FoxLogo, Kicker, QR, Title } from '@/components/centro-fox-2027/Parts';
import { LiveBars, LiveCloud, useTally } from '@/components/centro-fox-2027/Live';
import { FunnelGuide, FunnelMini, MultiBars, TALLER_PATH, TeamBoard, TeamList, Timer, useHabitYes } from '@/components/centro-fox-2027/Taller';
import { MATRIX } from '@/data/centroFox2027';
import { ATTACKS, BRIDGES, CRITERIA, FIRE, HABITS, LEGAL, PRACTICES, PROMPTS, PROTOCOL, ROUTES, attackerOf, closingLine, habitKey, type Team } from '@/data/taller2027';
import { useCf27Teams } from '@/hooks/useCf27Teams';
import { Facebook, Globe, Instagram, Mail, Phone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Q = (p: { size?: number; label?: string }) => <QR path={TALLER_PATH} {...p} />;
const Steps = ({ items }: { items: string[] }) => <ol className="cf-body space-y-3 list-decimal pl-10">{items.map(i => <li key={i}>{i}</li>)}</ol>;
const GOAL = 'rumbo al 6 de junio de 2027';
const WORKSHOP_ORDER = ['Circulación', 'Emisión', 'Reinterpretación', 'Respuesta'] as const;
/** Puente con el viernes: la lección del caso INE que aplica a cada ejercicio. */
const Bridge = ({ n }: { n: number }) => <p className="cf-body-lg mb-6"><b className="cf-accent">Del viernes · </b>{BRIDGES[n]}</p>;
/** Las dos rutas de cada ejercicio, también en el teléfono. */
const RoutesBox = ({ cand, red }: { cand: string; red: string }) => <div className="grid gap-4 mt-6">
  <Card><small className="cf-label">{ROUTES[0]}</small><p className="cf-body mt-2">{cand}</p></Card>
  <Card><small className="cf-label">{ROUTES[1]}</small><p className="cf-body mt-2">{red}</p></Card></div>;
const Legal = () => <p className="cf-caption cf-muted mt-6"><b>Nota:</b> {LEGAL}</p>;

function Teams({ render, empty }: { render: (t: Team, all: Team[]) => React.ReactNode | null; empty?: string }) {
  const { teams } = useCf27Teams();
  return <TeamBoard teams={teams} render={t => render(t, teams)} empty={empty} />;
}
function Registered() { const { teams } = useCf27Teams(); return <TeamList teams={teams} />; }

const Quad = () => <div className="cf-quad">
  <Card><h4>1 · Circulación: qué se dice</h4><p>Tema · tono · quién habla · <b>el hueco</b> · una cuenta a seguir</p></Card>
  <Card><h4>2 · Emisión: qué digo, a quién y dónde</h4><p>3 segmentos con 3 capas o más · voces locales · vainilla · 10 palabras clave · posicionamiento · cuándo publicar</p></Card>
  <Card><h4>3 · Reinterpretación: qué harán con mi mensaje</h4><p>Ataque probable · tipo de caso · ¿responder, monitorear o corregir? · respuesta de 40 palabras</p></Card>
  <Card><h4>4 · Respuesta: de la interacción a la acción</h4><p>Acción con fecha antes del 6 de junio de 2027 · embudo con 5 metas · 2 barreras · qué voy a medir</p></Card>
</div>;

const habitKeys = HABITS.map((_, i) => habitKey(i));
const yesNo = ['sí', 'no'];

function Closing({ c }: { c: Ctx }) {
  const { yes } = useHabitYes(habitKeys);
  const { tally } = useTally('s16', PRACTICES, c.revealed);
  const line = closingLine(yes, tally);
  if (!c.revealed) return <div className="grid grid-cols-[1fr_300px] gap-12"><div><Kicker>Cierre</Kicker><Title>¿Qué práctica vas a incorporar esta semana?</Title><div className="mt-10"><LiveBars id="s16" options={PRACTICES} manualMode={c.manual} /></div></div><Q size={240} label="Vota" /></div>;
  return <div className="grid grid-cols-[1fr_260px] gap-12 items-start"><div><Kicker>Cierre</Kicker><Title>De dónde partimos y a qué se comprometen</Title>
    <div className="grid grid-cols-2 gap-8"><div><small className="cf-label">Lo que votó la sala</small><div className="mt-4"><LiveBars id="s16" options={PRACTICES} manualMode={false} frozen correct={line?.top} /></div></div>
      <div><small className="cf-label">Lectura</small><p className="cf-sub mt-4">{line ? <>Al empezar, la práctica menos común era <b className="cf-accent">{line.least.toLowerCase()}</b>; ahora la sala se compromete con <b className="cf-accent">{line.top.toLowerCase()}</b>.</> : 'Todavía no hay votos suficientes del autodiagnóstico o del cierre.'}</p></div></div>
    <p className="cf-body-lg mt-6"><b>Escriban sus 3 compromisos para los próximos 30 días al pie de su hoja.</b> Gracias · Programa de Capacitación Profesional Centro Fox · Jesús Caudillo</p></div><Q size={220} label="Descarga tu hoja" /></div>;
}

const SLIDES: Slide[] = [
  { id: 'S01', title: 'Bienvenida y registro de equipos', notes: 'Un teléfono por equipo es el capitán y registra al equipo. Los demás también pueden entrar para votar. Equipos de 4 a 6, por estado; si se puede, mezclen edades.', render: () => (
    <div className="grid grid-cols-[1fr_420px] gap-14 h-full">
      <div><Kicker>Taller · Mi plan digital 2027</Kicker><Title>Ayer vimos el ciclo de un mensaje nacional. Hoy lo hacen con el suyo.</Title>
        <p className="cf-body-lg">Ayer vimos el pecado capital: creer que todos nos quieren escuchar. Hoy trabajamos al revés: primero escuchamos.</p>
        <p className="cf-body mt-6 mb-8">El capitán registra al equipo: nombre, estado y el municipio o distrito donde se vota en 2027 que van a trabajar.</p><Registered /></div>
      <Q size={340} label="Registra a tu equipo" /></div>) },
  { id: 'S02', title: 'Autodiagnóstico de hábitos', polls: HABITS.map((h, i) => ({ id: habitKey(i), options: yesNo, label: h })), notes: 'Marquen todas las que hagan de verdad. Pulsa R: lo que tenga menos votos queda como la tarea de hoy.', render: c => (
    <div className="grid grid-cols-[1fr_320px] gap-12"><div><Kicker>Antes de empezar</Kicker><Title>{c.revealed ? 'Lectura: lo menos común es la tarea de hoy' : '¿Cuáles de estas ya hacen? Marquen todas las que apliquen.'}</Title>
      <div className="mt-10"><MultiBars keys={habitKeys} labels={HABITS} revealed={c.revealed} /></div></div>{!c.revealed && <Q size={240} label="Marca tus hábitos" />}</div>) },
  { id: 'S03', title: 'La hoja del día', notes: 'El modelo del mensaje empieza con emisión, pero el taller empieza escuchando la conversación que ya existe. Aquí los números indican el orden de los ejercicios: 1 Circulación, 2 Emisión, 3 Reinterpretación, 4 Respuesta. Cada persona tiene la hoja impresa; el capitán captura en el teléfono.', render: () => (
    <div><Kicker>La hoja del día · {GOAL}</Kicker><Title>Cuatro cuadrantes. Hoy empezamos por escuchar.</Title><div className="mt-10"><Quad /></div></div>) },

  { id: 'S04', title: 'Ejercicio 1 · Instrucciones', moment: 'Circulación', notes: 'Que sea un tema real y de esta semana. El campo que importa es el hueco. En el teléfono, cada equipo elige su ruta.', render: () => (
    <div className="grid grid-cols-[1fr_1fr] gap-12"><div><Kicker>Ejercicio 1 · Escucha exprés · {GOAL}</Kicker><Bridge n={0} /><Title>¿Qué se dice esta semana de su municipio o distrito?</Title>
      <Steps items={['Elijan un tema real del lugar donde se vota en 2027: inseguridad, agua, baches, un conflicto local o una obra.', 'Búsquenlo en Facebook (páginas y grupos locales), X (Twitter) y TikTok. Si da tiempo, Google Noticias.', 'Llenen en el teléfono los cinco campos: tema, tono, quién habla, el hueco y una cuenta a seguir.']} /></div>
      <RoutesBox cand="¿Qué hueco nadie está ocupando y podrías ocupar tú?" red="¿Qué preguntan los vecinos que nadie responde?" /></div>) },
  { id: 'S05', title: 'Ejercicio 1 · Trabajo', moment: 'Circulación', notes: 'Pasa por las mesas. Si alguien solo busca el nombre del político, redirígelo al problema.', render: () => (
    <div className="grid grid-cols-[560px_1fr] gap-14 items-center"><Timer minutes={15} label="Escucha exprés" />
      <div><Kicker>Cómo buscar</Kicker><ul className="cf-body-lg space-y-6"><li>Municipio + problema, no solo el nombre del político.</li><li>Lean los comentarios, no solo las publicaciones.</li><li>Cuidado con el ruido: que sea su lugar y esta semana.</li></ul></div></div>) },
  { id: 'S06', title: 'Ejercicio 1 · Puesta en común', moment: 'Circulación', notes: 'Destaca dos tarjetas. Busca el hueco más interesante y di por qué.', render: () => (
    <div><Kicker>Puesta en común</Kicker><Title>Tema, tono y el hueco de cada equipo</Title><div className="mt-8"><Teams render={t => t.ex1.tema ? <dl><dt>Tema</dt><dd>{t.ex1.tema}</dd><dt>Tono</dt><dd>{t.ex1.tono}</dd><dt>Hueco</dt><dd><b>{t.ex1.hueco}</b></dd></dl> : null} /></div></div>) },

  { id: 'S07', title: 'Ejercicio 2 · Instrucciones', moment: 'Emisión', notes: 'La vainilla no es un eslogan: es la idea que hace reconocible su tema. Si alguien responde “porque soy yo” a la pregunta de por qué se detendrían, úsalo como ejemplo del pecado capital.', render: () => (
    <div className="grid grid-cols-[1.25fr_1fr] gap-12"><div><Kicker>Ejercicio 2 · Segmentación y pieza con IA · {GOAL}</Kicker><Bridge n={1} />
      <Steps items={['Tres segmentos con al menos tres capas cada uno: territorio, quiénes son, dónde se informan, qué les preocupa y a quién le creen.', 'Voces locales que no son políticos y mueven la conversación en su municipio.', 'Su vainilla y diez palabras clave.', 'Posicionamiento en una frase.', 'Una pieza para un segmento, hecha con IA y revisada por el equipo.', '¿Cuándo la publicarían para llegar a tiempo? ¿Por qué alguien que entró a ver otra cosa se detendría a verla?']} /><Legal /></div>
      <RoutesBox cand="“Soy quien ___ para ___”, y una pieza para tu perfil." red="“Somos el comité que ___ para ___”, y una pieza para el grupo de WhatsApp de la colonia." /></div>) },
  { id: 'S08', title: 'Ejercicio 2 · Prompts de IA', moment: 'Emisión', notes: 'Deja esta lámina visible los 20 minutos. Los prompts también están en el teléfono con botón de copiar. Recuerda la casilla: ningún segmento con datos sensibles ni bases sin consentimiento.', render: () => (
    <div className="grid grid-cols-[1fr_440px] gap-10"><div className="space-y-5"><Kicker>Prompts para copiar</Kicker>{PROMPTS.map((p, i) => <Card key={i} className="cf-prompt"><b className="cf-accent">{i + 1}.</b> {p}</Card>)}
      <p className="cf-h3 mt-4">La IA propone, el equipo decide. Nada sale sin revisión humana.</p></div>
      <div className="flex flex-col gap-6"><Timer minutes={20} label="Ejercicio 2" /><Q size={180} label="Los prompts están en tu teléfono" /></div></div>) },
  { id: 'S09', title: 'Ejercicio 2 · Nube y lectura', moment: 'Emisión', notes: 'Cada persona manda la vainilla de su equipo. Luego pulsa R para ver los posicionamientos; dos equipos los leen y los corriges en vivo: ¿es concreto?, ¿se entiende en 5 segundos?, ¿lo puede decir alguien más?', render: c => c.revealed
    ? <div><Kicker>Posicionamientos</Kicker><Title>¿Concreto? ¿Se entiende en 5 segundos? ¿Lo puede decir alguien más?</Title><div className="mt-8"><Teams render={t => t.ex2.soy ? <><p className="cf-body">{t.ex2.ruta === ROUTES[1] ? 'Somos el comité que' : 'Soy quien'} <b>{t.ex2.soy}</b> para <b>{t.ex2.para}</b></p>{t.ex2.detener && <p className="cf-caption cf-muted mt-2">¿Por qué se detendrían? {t.ex2.detener}</p>}</> : null} /></div></div>
    : <div><Kicker>La vainilla de cada equipo</Kicker><Title>Manden la idea que los hace reconocibles</Title><div className="mt-6"><LiveCloud id="s09" path={TALLER_PATH} /></div></div> },
  { id: 'S10', title: 'Pausa', notes: 'Cinco minutos. Al volver, cada equipo recibe la pieza de otro.', render: () => (
    <div className="flex flex-col items-center justify-center h-full gap-10"><Title lg>Pausa</Title><Timer minutes={5} /><FoxLogo size={80} /></div>) },

  { id: 'S11', title: 'Ejercicio 3 · Instrucciones', moment: 'Reinterpretación', notes: 'El tablero asigna los pares: cada equipo ataca la pieza del siguiente en el orden de registro. Recalca la regla: distorsionar el marco, no fabricar pruebas.', render: () => (
    <div className="grid grid-cols-[1.2fr_1fr] gap-12"><div><Kicker>Ejercicio 3 · Lectura hostil y protocolo · {GOAL}</Kicker><Bridge n={2} /><Title>Su pieza pasa al equipo de al lado</Title>
      <ol className="cf-body space-y-3 list-decimal pl-10"><li>El equipo vecino hace la lectura hostil. Ataques sugeridos:<ul className="list-disc pl-8 mt-2 space-y-1">{ATTACKS.map(a => <li key={a}>{a}</li>)}</ul></li><li>El equipo original responde: ¿qué tipo de caso es?, ¿respondemos, monitoreamos o corregimos?, y si respondemos, máximo 40 palabras con evidencia.</li></ol></div>
      <div><Card><p className="cf-body"><b className="cf-accent">Regla:</b> se vale distorsionar el marco, no fabricar pruebas falsas. Es un simulacro para prepararse, no para practicar desinformación.</p></Card>
        <RoutesBox cand="El ataque va contra el aspirante, en su perfil y en medios locales." red="El ataque llega al grupo de WhatsApp de la colonia: ¿qué hace la red antes de reenviar?" /></div></div>) },
  { id: 'S11B', title: 'Verificar antes de amplificar', moment: 'Reinterpretación', notes: 'Apoyo del ejercicio 3. “Lo que más daño les puede hacer en 2027 no es lo que inventen de ustedes; es lo que ustedes compartan sin verificar.”', render: () => (
    <><Kicker>Ejercicio 3 · Apoyo</Kicker><Title>Verificar antes de amplificar</Title><div className="cf-flow five">{[['Detener', 'No compartas en caliente.'], ['Precisar', '¿Qué se afirma exactamente?'], ['Rastrear', '¿Quién lo dijo primero?'], ['Contrastar', '¿Lo confirma otra fuente?'], ['Documentar', 'Guarda capturas y enlaces.']].map(([t, d], i) => <Card key={t}><span className="cf-num">{i + 1}</span><h3 className="cf-h3">{t}</h3><p className="cf-body mt-3">{d}</p></Card>)}</div>
      <p className="cf-body-lg mt-14 max-w-[1400px]">En campaña, la desinformación llega por dos lados: contra ti y desde los tuyos. El protocolo sirve para las dos.</p></>) },
  { id: 'S12', title: 'Ejercicio 3 · Trabajo', moment: 'Reinterpretación', notes: 'Diez minutos para escribir el ataque y diez para responder. Reinicia el cronómetro a la mitad.', render: () => (
    <div className="grid grid-cols-[480px_1fr] gap-12"><div className="flex flex-col gap-6"><Timer minutes={10} label="Ataque y luego respuesta" />
      <Card><p className="cf-body">{PROTOCOL.map((p, i) => <span key={p} className="block"><b className="cf-accent">{i + 1}</b> {p}</span>)}</p></Card></div>
      <div><Kicker>Matriz de respuesta</Kicker><table className="cf-table mt-4"><tbody>{MATRIX.map(m => <tr key={m.accion}><td>{m.tipo}</td><td><b>{m.accion}</b></td><td>{m.como}</td></tr>)}</tbody></table></div></div>) },
  { id: 'S13', title: 'Ejercicio 3 · Votación', moment: 'Reinterpretación', polls: c => [{ id: c.step % 2 === 0 ? 's13a' : 's13b', options: FIRE, label: `Par ${(c.step % 2) + 1}` }],
    admin: (c, set) => <div className="space-y-2"><p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Evaluación con el protocolo · par {(c.step % 2) + 1}</p>{CRITERIA.map((q, i) => { const k = `s13:${c.step}:c${i}`; const v = c.flag(k); return <div key={q} className="flex items-center gap-2"><span className="flex-1">{q}</span>{[true, false].map(b => <button key={String(b)} className={`rounded-md border border-border px-3 py-1 ${v === b ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => set(k, v === b ? undefined : b)}>{b ? 'Sí' : 'No'}</button>)}</div>; })}</div>,
    notes: 'Elige dos pares con los botones. Que voten; marca en /admin los tres criterios y pulsa R. La mejor respuesta muchas veces es más corta de lo que creen, o no existe.', render: c => <FirePairs c={c} /> },

  { id: 'S14', title: 'Ejercicio 4 · Acción con embudo', moment: 'Respuesta', notes: 'Metas realistas. La acción lleva fecha anterior al 6 de junio de 2027; el último escalón es el seguimiento hasta la jornada electoral.', render: () => (
    <div className="grid grid-cols-[1fr_560px_380px] gap-10"><div><Kicker>Ejercicio 4 · De la interacción a la acción · {GOAL}</Kicker><Bridge n={3} /><Title>Una acción con fecha</Title>
      <Steps items={['Una acción en su municipio o distrito, con fecha anterior al 6 de junio de 2027.', 'Embudo con metas realistas, hasta la jornada electoral.', 'Dos barreras, cómo quitarlas y qué medirán.']} />      <p className="cf-body mt-4"><b className="cf-accent">{ROUTES[0]}:</b> recorrido, consulta o reunión. <b className="cf-accent">{ROUTES[1]}:</b> reunión vecinal, jornada o brigada.</p><Legal /></div>
      <FunnelGuide /><Timer minutes={15} label="Ejercicio 4" /></div>) },
  { id: 'S15', title: 'Ejercicio 4 · Tablero', moment: 'Respuesta', notes: 'Comenta el embudo más realista y el más optimista.', render: () => (
    <div><Kicker>Embudos</Kicker><Title>¿Cuál es el más realista? ¿Y el más optimista?</Title><div className="mt-8"><Teams render={t => t.ex4.accion ? <><p className="mb-3"><b>{t.ex4.accion}</b>{t.ex4.fecha && <span className="cf-muted"> · {t.ex4.fecha}</span>}</p><FunnelMini metas={t.ex4.metas} /></> : null} /></div></div>) },
  { id: 'S16', title: 'Cierre', polls: [{ id: 's16', options: PRACTICES, label: 'Práctica que vas a incorporar' }], notes: 'Que voten y pulsa R: la pantalla contrasta con el autodiagnóstico del inicio. En el teléfono está el botón para descargar la hoja del equipo.', render: c => <Closing c={c} /> },
  { id: 'S17', title: 'Gracias por participar', notes: 'Cierra con esta idea: escuchar primero, verificar siempre y comunicar con claridad. Agradece al grupo y a Centro Fox. La siguiente lámina tiene tus datos de contacto.', render: () => (
    <div className="flex flex-col justify-center h-full max-w-[1500px]">
      <Kicker>Mi plan digital 2027 · Cierre</Kicker>
      <h2 className="font-display text-[88px] leading-[1.1] font-bold">Escuchar primero.<br />Verificar siempre.<br /><span className="cf-accent">Comunicar con claridad.</span></h2>
      <p className="cf-body-lg mt-8">Gracias por compartir sus ideas y trabajar juntos.</p>
      <p className="cf-caption cf-muted mt-8">Programa de Capacitación Profesional Centro Fox · Jesús Caudillo</p>
    </div>) },
  { id: 'S18', title: 'Contacto · Jesús Caudillo', notes: 'Deja esta lámina visible para que puedan tomar una foto o escanear el QR de jesuscaudillo.com. Instagram, Facebook y X (Twitter): @caudillomx. Teléfono: 55 2177 0265. Web de KiMedia: kimedia.mx. Correo: hola@kimedia.mx.', render: () => (
    <div className="grid grid-cols-[1fr_340px] gap-20 items-center h-full">
      <div><Kicker>Sigamos en contacto</Kicker><h2 className="font-display text-[84px] leading-[1.1] font-bold mb-4">Jesús Caudillo</h2>
        <p className="cf-accent font-display text-[64px] font-bold mb-10">@caudillomx</p>
        <div className="flex gap-10 items-center cf-body mb-10">
          <a href="https://www.instagram.com/caudillomx/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><Instagram size={36} />Instagram</a>
          <a href="https://www.facebook.com/caudillomx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><Facebook size={36} />Facebook</a>
          <a href="https://x.com/caudillomx" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
        </div>
        <div className="space-y-6 cf-body-lg">
          <a href="tel:+525521770265" className="flex items-center gap-5"><Phone size={38} />55 2177 0265</a>
          <a href="https://jesuscaudillo.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5"><Globe size={38} />jesuscaudillo.com</a>
          <a href="https://www.kimedia.mx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5"><Globe size={38} />kimedia.mx</a>
          <a href="mailto:hola@kimedia.mx" className="flex items-center gap-5"><Mail size={38} />hola@kimedia.mx</a>
        </div>
      </div>
      <div className="cf-qr"><div className="cf-qr-box"><QRCodeSVG value="https://jesuscaudillo.com" size={280} bgColor="transparent" fgColor="currentColor" /></div><strong>jesuscaudillo.com</strong></div>
    </div>) },
];

function FirePairs({ c }: { c: Ctx }) {
  const { step, setStep, manual, revealed } = c;
  const { teams } = useCf27Teams();
  const ready = teams.filter(t => t.ex3.respuesta || t.ex3.decision);
  const key = step % 2 === 0 ? 's13a' : 's13b';
  const t = ready.length ? ready[step % ready.length] : undefined; const atk = t ? attackerOf(teams, t.id) : undefined;
  return <div className="grid grid-cols-[1fr_560px] gap-10"><div>
    <div className="flex gap-3 mb-6">{[0, 1].map(i => <button key={i} className={`cf-chip ${step % 2 === i ? 'on' : ''}`} onClick={() => setStep(Math.floor(step / 2) * 2 + i)}>Par {i + 1}</button>)}
      {ready.length > 2 && <button className="cf-chip" onClick={() => setStep(step + 2)}>Otros equipos</button>}</div>
    {t ? <><Card><p className="cf-notes-meta">Ataque de {atk?.nombre}</p><p className="cf-body-lg mt-2">{atk?.ex3.ataque || '—'}</p></Card>
      <Card className="mt-6"><p className="cf-notes-meta">Respuesta de {t.nombre} · {t.ex3.tipo} · {t.ex3.decision}</p><p className="cf-body-lg mt-2">{t.ex3.respuesta || (t.ex3.decision === 'Monitorear' ? 'No responden: monitorean.' : '—')}</p></Card></>
      : <p className="cf-body">Aún no hay respuestas capturadas.</p>}</div>
    <div className="flex flex-col gap-6"><Title>¿La respuesta apaga el fuego o lo aviva?</Title>
      {revealed ? <><small className="cf-label">Lo que votó la sala</small><LiveBars id={key} options={FIRE} manualMode={false} frozen />
        <small className="cf-label mt-2">Evaluación con el protocolo</small><div className="space-y-3">{CRITERIA.map((q, i) => { const v = c.flag(`s13:${step}:c${i}`); return <div key={q} className="cf-row"><b>{v === undefined ? '·' : v ? 'Sí' : 'No'}</b><span className="cf-body-lg">{q}</span></div>; })}</div></>
        : <LiveBars id={key} options={FIRE} manualMode={manual} />}</div></div>;
}

export default function Taller2027({ admin = false }: { admin?: boolean }) { return <Deck slides={SLIDES} label="Taller Centro Fox" admin={admin} momentOrder={WORKSHOP_ORDER} />; }
