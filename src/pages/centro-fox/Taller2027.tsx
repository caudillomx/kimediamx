import { Deck, type Slide } from '@/components/centro-fox-2027/Deck';
import { Card, FoxLogo, Kicker, QR, Title } from '@/components/centro-fox-2027/Parts';
import { LiveBars, LiveCloud } from '@/components/centro-fox-2027/Live';
import { FunnelGuide, FunnelMini, MultiBars, TALLER_PATH, TeamBoard, TeamList, Timer } from '@/components/centro-fox-2027/Taller';
import { MATRIX } from '@/data/centroFox2027';
import { FIRE, HABITS, PRACTICES, PROMPTS, PROTOCOL, attackerOf, habitKey, type Team } from '@/data/taller2027';
import { useCf27Teams } from '@/hooks/useCf27Teams';

const Q = (p: { size?: number; label?: string }) => <QR path={TALLER_PATH} {...p} />;
const Steps = ({ items }: { items: string[] }) => <ol className="cf-body space-y-4 list-decimal pl-10">{items.map(i => <li key={i}>{i}</li>)}</ol>;
const Variant = ({ children }: { children: string }) => <Card className="mt-6"><p className="cf-body"><b className="cf-accent">Si no eres candidato (red local):</b> {children}</p></Card>;

function Teams({ render, empty }: { render: (t: Team, all: Team[]) => React.ReactNode | null; empty?: string }) {
  const { teams } = useCf27Teams();
  return <TeamBoard teams={teams} render={t => render(t, teams)} empty={empty} />;
}
function Registered() { const { teams } = useCf27Teams(); return <TeamList teams={teams} />; }

const Quad = () => <div className="cf-quad">
  <Card><h4>2 · Circulación: qué se dice</h4><p>Tema · tono · quién habla · <b>el hueco</b> · una cuenta a seguir</p></Card>
  <Card><h4>1 · Emisión: qué digo, a quién y dónde</h4><p>3 segmentos (necesidad, red, formato) · vainilla · 10 palabras clave · "Soy quien ___ para ___"</p></Card>
  <Card><h4>3 · Reinterpretación: qué harán con mi mensaje</h4><p>Ataque probable · tipo de caso · ¿responder, monitorear o corregir? · respuesta de 40 palabras</p></Card>
  <Card><h4>4 · Respuesta: de la interacción a la acción</h4><p>Acción · embudo con 5 metas · 2 barreras y cómo quitarlas · qué voy a medir</p></Card>
</div>;

const SLIDES: Slide[] = [
  { id: 'S01', title: 'Bienvenida y registro de equipos', notes: 'Un teléfono por equipo es el capitán y registra al equipo. Los demás también pueden entrar para votar. Equipos de 4 a 6, por estado; si se puede, mezclen edades.', render: () => (
    <div className="grid grid-cols-[1fr_420px] gap-14 h-full">
      <div><Kicker>Taller · Mi plan digital 2027</Kicker><Title>Ayer vimos el ciclo de un mensaje nacional. Hoy lo hacen con el suyo.</Title>
        <p className="cf-body mt-6 mb-8">El capitán registra al equipo: nombre, estado, municipio o distrito y cuántos son.</p><Registered /></div>
      <Q size={340} label="Registra a tu equipo" /></div>) },
  { id: 'S02', title: 'Autodiagnóstico de hábitos', notes: 'Marquen todas las que hagan de verdad. Lo que tenga menos votos es su tarea de hoy.', render: () => (
    <div className="grid grid-cols-[1fr_320px] gap-12"><div><Kicker>Antes de empezar</Kicker><Title>¿Cuáles de estas ya hacen? Marquen todas las que apliquen.</Title>
      <div className="mt-10"><MultiBars keys={HABITS.map((_, i) => habitKey(i))} labels={HABITS} /></div></div><Q size={240} label="Marca tus hábitos" /></div>) },
  { id: 'S03', title: 'La hoja del día', notes: 'Empezamos por escuchar, no por publicar. Ese es el cambio. Cada persona tiene la hoja impresa; el capitán captura en el teléfono.', render: () => (
    <div><Kicker>La hoja del día</Kicker><Title>Cuatro cuadrantes. Hoy empezamos por escuchar.</Title><div className="mt-10"><Quad /></div></div>) },

  { id: 'S04', title: 'Ejercicio 1 · Instrucciones', moment: 'Circulación', notes: 'Que sea un tema real y de esta semana. El campo que importa es el hueco.', render: () => (
    <div className="grid grid-cols-[1fr_1fr] gap-12"><div><Kicker>Ejercicio 1 · Escucha exprés</Kicker><Title>¿Qué se dice de su municipio esta semana?</Title>
      <Steps items={['Elijan un tema real: inseguridad, agua, baches, un conflicto local o una obra.', 'Búsquenlo en Facebook (páginas y grupos locales), X (Twitter) y TikTok. Si da tiempo, Google Noticias.', 'Llenen en el teléfono los cinco campos.']} /></div>
      <div><Card><ul className="cf-body space-y-3"><li>¿De qué se habla más?</li><li>¿Con qué tono? Enojo, burla, preocupación, apoyo</li><li>¿Quién habla? Medio, vecino, político, página anónima</li><li><b className="cf-accent">¿Qué hueco nadie está ocupando?</b></li><li>Una cuenta local que deberían seguir desde hoy</li></ul></Card>
        <Variant>¿qué preguntan los vecinos que nadie responde?</Variant></div></div>) },
  { id: 'S05', title: 'Ejercicio 1 · Trabajo', moment: 'Circulación', notes: 'Pasa por las mesas. Si alguien solo busca el nombre del político, redirígelo al problema.', render: () => (
    <div className="grid grid-cols-[560px_1fr] gap-14 items-center"><Timer minutes={15} label="Escucha exprés" />
      <div><Kicker>Cómo buscar</Kicker><ul className="cf-body-lg space-y-6"><li>Municipio + problema, no solo el nombre del político.</li><li>Lean los comentarios, no solo las publicaciones.</li><li>Cuidado con el ruido: que sea su lugar y esta semana.</li></ul></div></div>) },
  { id: 'S06', title: 'Ejercicio 1 · Puesta en común', moment: 'Circulación', notes: 'Destaca dos tarjetas. Busca el hueco más interesante y di por qué: "ahí hay una candidatura".', render: () => (
    <div><Kicker>Puesta en común</Kicker><Title>Tema, tono y el hueco de cada equipo</Title><div className="mt-8"><Teams render={t => t.ex1.tema ? <dl><dt>Tema</dt><dd>{t.ex1.tema}</dd><dt>Tono</dt><dd>{t.ex1.tono}</dd><dt>Hueco</dt><dd><b>{t.ex1.hueco}</b></dd></dl> : null} /></div></div>) },

  { id: 'S07', title: 'Ejercicio 2 · Instrucciones', moment: 'Emisión', notes: 'La vainilla no es un eslogan: es la idea que hace reconocible su tema. Usen la tabla de redes de ayer.', render: () => (
    <div className="grid grid-cols-[1.2fr_1fr] gap-12"><div><Kicker>Ejercicio 2 · Microsegmentación y pieza con IA</Kicker><Title>Con el hueco que encontraron:</Title>
      <Steps items={['Tres segmentos de su municipio y qué necesita cada uno.', 'Para cada segmento: red y formato.', 'Su vainilla: la idea que hace reconocible su tema.', 'Diez palabras clave que repetirán en todo.', 'Posicionamiento: "Soy quien ___ para ___."', 'Una pieza para un segmento, hecha con IA y revisada por el equipo.']} /></div>
      <div><Card><p className="cf-body">Ejemplo de segmento: <b>mamás que trabajan y usan transporte público</b>.</p></Card><Variant>"Somos el comité que ___ para ___", y una pieza para el grupo de WhatsApp de la colonia.</Variant></div></div>) },
  { id: 'S08', title: 'Ejercicio 2 · Prompts de IA', moment: 'Emisión', notes: 'Deja esta lámina visible los 20 minutos. Los prompts también están en el teléfono con botón de copiar.', render: () => (
    <div className="grid grid-cols-[1fr_440px] gap-10"><div className="space-y-5"><Kicker>Prompts para copiar</Kicker>{PROMPTS.map((p, i) => <Card key={i} className="cf-prompt"><b className="cf-accent">{i + 1}.</b> {p}</Card>)}
      <p className="cf-h3 mt-4">La IA propone, el equipo decide. Nada sale sin revisión humana.</p></div>
      <div className="flex flex-col gap-6"><Timer minutes={20} label="Ejercicio 2" /><Q size={180} label="Los prompts están en tu teléfono" /></div></div>) },
  { id: 'S09', title: 'Ejercicio 2 · Nube y lectura', moment: 'Emisión', notes: 'Cada persona manda la vainilla de su equipo. Luego pulsa R para ver los posicionamientos; dos equipos los leen y los corriges en vivo: ¿es concreto?, ¿se entiende en 5 segundos?, ¿lo puede decir alguien más?', render: c => c.revealed
    ? <div><Kicker>Posicionamientos</Kicker><Title>¿Concreto? ¿Se entiende en 5 segundos? ¿Lo puede decir alguien más?</Title><div className="mt-8"><Teams render={t => t.ex2.soy ? <p className="cf-body">Soy quien <b>{t.ex2.soy}</b> para <b>{t.ex2.para}</b></p> : null} /></div></div>
    : <div><Kicker>La vainilla de cada equipo</Kicker><Title>Manden la idea que los hace reconocibles</Title><div className="mt-6"><LiveCloud id="s09" path={TALLER_PATH} /></div></div> },
  { id: 'S10', title: 'Pausa', notes: 'Cinco minutos. Al volver, cada equipo recibe la pieza de otro.', render: () => (
    <div className="flex flex-col items-center justify-center h-full gap-10"><Title lg>Pausa</Title><Timer minutes={5} /><FoxLogo size={80} /></div>) },

  { id: 'S11', title: 'Ejercicio 3 · Instrucciones', moment: 'Reinterpretación', notes: 'El tablero asigna los pares: cada equipo ataca la pieza del siguiente en el orden de registro. Recalca la regla: distorsionar el marco, no fabricar pruebas.', render: () => (
    <div className="grid grid-cols-[1.2fr_1fr] gap-12"><div><Kicker>Ejercicio 3 · Lectura hostil y protocolo</Kicker><Title>Su pieza pasa al equipo de al lado</Title>
      <Steps items={['El equipo vecino hace la lectura hostil: ¿cómo la sacaría de contexto el adversario?, ¿qué comentario burlón tendría más "me gusta"?, ¿qué dato podría cuestionar?', 'El equipo original responde: ¿qué tipo de caso es?, ¿respondemos, monitoreamos o corregimos?, y si respondemos, máximo 40 palabras con evidencia.']} /></div>
      <div><Card><p className="cf-body"><b className="cf-accent">Regla:</b> se vale distorsionar el marco, no fabricar pruebas falsas. Es un simulacro para prepararse, no para practicar desinformación.</p></Card><Variant>el ataque llega al grupo de WhatsApp de la colonia.</Variant></div></div>) },
  { id: 'S12', title: 'Ejercicio 3 · Trabajo', moment: 'Reinterpretación', notes: 'Diez minutos para escribir el ataque y diez para responder. Reinicia el cronómetro a la mitad.', render: () => (
    <div className="grid grid-cols-[480px_1fr] gap-12"><div className="flex flex-col gap-6"><Timer minutes={10} label="Ataque y luego respuesta" />
      <Card><p className="cf-body">{PROTOCOL.map((p, i) => <span key={p} className="block"><b className="cf-accent">{i + 1}</b> {p}</span>)}</p></Card></div>
      <div><Kicker>Matriz de respuesta</Kicker><table className="cf-table mt-4"><tbody>{MATRIX.map(m => <tr key={m.accion}><td>{m.tipo}</td><td><b>{m.accion}</b></td><td>{m.como}</td></tr>)}</tbody></table></div></div>) },
  { id: 'S13', title: 'Ejercicio 3 · Votación', moment: 'Reinterpretación', notes: 'Elige dos pares con los botones. La mejor respuesta muchas veces es más corta de lo que creen, o no existe.', render: c => <FirePairs step={c.step} setStep={c.setStep} manual={c.manual} /> },

  { id: 'S14', title: 'Ejercicio 4 · Acción con embudo', moment: 'Respuesta', notes: 'Metas realistas. Si nadie sabe cuántos verán la convocatoria, que lo estimen con lo que vieron en el ejercicio 1.', render: () => (
    <div className="grid grid-cols-[1fr_600px_400px] gap-10"><div><Kicker>Ejercicio 4 · De la interacción a la acción</Kicker><Title>Una acción concreta</Title>
      <Steps items={['Reunión vecinal, recorrido, consulta o jornada, ligada a su tema.', 'El embudo con metas realistas.', 'Dos barreras probables y cómo quitarlas.', 'En una línea: qué medirán para saber si funcionó.']} /></div>
      <FunnelGuide /><Timer minutes={15} label="Ejercicio 4" /></div>) },
  { id: 'S15', title: 'Ejercicio 4 · Tablero', moment: 'Respuesta', notes: 'Comenta el embudo más realista y el más optimista.', render: () => (
    <div><Kicker>Embudos</Kicker><Title>¿Cuál es el más realista? ¿Y el más optimista?</Title><div className="mt-8"><Teams render={t => t.ex4.accion ? <><p className="mb-3"><b>{t.ex4.accion}</b></p><FunnelMini metas={t.ex4.metas} /></> : null} /></div></div>) },
  { id: 'S16', title: 'Cierre', notes: 'Es la misma pregunta de la vez pasada, para comparar. Pulsa R para pasar a los compromisos. En el teléfono está el botón para descargar la hoja del equipo.', render: c => c.revealed
    ? <div className="grid grid-cols-[1fr_380px] gap-14 h-full items-center"><div><Kicker>Antes de irse</Kicker><Title>Sus 3 compromisos para los próximos 30 días</Title><p className="cf-body-lg mt-8">Escríbanlos al pie de su hoja impresa. En el teléfono pueden descargar la hoja de su equipo.</p><p className="cf-body mt-12">Gracias · Programa de Capacitación Profesional Centro Fox · Jesús Caudillo</p></div><Q size={300} label="Descarga tu hoja" /></div>
    : <div className="grid grid-cols-[1fr_300px] gap-12"><div><Kicker>Cierre</Kicker><Title>¿Qué práctica vas a incorporar esta semana?</Title><div className="mt-10"><LiveBars id="s16" options={PRACTICES} manualMode={c.manual} /></div></div><Q size={240} label="Vota" /></div> },
];

function FirePairs({ step, setStep, manual }: { step: number; setStep: (n: number) => void; manual: boolean }) {
  const { teams } = useCf27Teams();
  const ready = teams.filter(t => t.ex3.respuesta || t.ex3.decision);
  const key = step % 2 === 0 ? 's13a' : 's13b';
  const t = ready.length ? ready[step % ready.length] : undefined; const atk = t ? attackerOf(teams, t.id) : undefined;
  return <div className="grid grid-cols-[1fr_520px] gap-10"><div>
    <div className="flex gap-3 mb-6">{[0, 1].map(i => <button key={i} className={`cf-chip ${step % 2 === i ? 'on' : ''}`} onClick={() => setStep(Math.floor(step / 2) * 2 + i)}>Par {i + 1}</button>)}
      {ready.length > 2 && <button className="cf-chip" onClick={() => setStep(step + 2)}>Otros equipos</button>}</div>
    {t ? <><Card><p className="cf-notes-meta">Ataque de {atk?.nombre}</p><p className="cf-body-lg mt-2">{atk?.ex3.ataque || '—'}</p></Card>
      <Card className="mt-6"><p className="cf-notes-meta">Respuesta de {t.nombre} · {t.ex3.tipo} · {t.ex3.decision}</p><p className="cf-body-lg mt-2">{t.ex3.respuesta || (t.ex3.decision === 'Monitorear' ? 'No responden: monitorean.' : '—')}</p></Card></>
      : <p className="cf-body">Aún no hay respuestas capturadas.</p>}</div>
    <div className="flex flex-col gap-6"><Title>¿La respuesta apaga el fuego o lo aviva?</Title><LiveBars id={key} options={FIRE} manualMode={manual} /></div></div>;
}

export default function Taller2027() { return <Deck slides={SLIDES} label="Taller Centro Fox" />; }
