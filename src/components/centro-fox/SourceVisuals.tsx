import { useState } from 'react';
import { CalendarDays, Check, MessageCircle, Search, Volume2, Play, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FoxSlide } from '@/data/centroFoxSession';

const networks = [
  { name: 'Facebook', format: 'Informes, álbumes e historias de impacto', tone: 'Cercano, con historias y evidencia visual.', limit: 'No publicar identidades ni detalles sensibles sin autorización.' },
  { name: 'Instagram', format: 'Reels, carruseles, infografías y lives', tone: 'Visual, breve y con una secuencia clara.', limit: 'Mantener el contexto aunque la pieza sea breve.' },
  { name: 'X', format: 'Posturas, datos y declaraciones', tone: 'Breve, informativo y oportuno.', limit: 'Enlazar la fuente y distinguir datos de opiniones.' },
  { name: 'TikTok', format: 'Video corto, relato y formatos de tendencia', tone: 'Dinámico, claro y visual.', limit: 'La tendencia no sustituye la evidencia ni el consentimiento.' },
  { name: 'YouTube', format: 'Explicaciones, entrevistas, cápsulas y lives', tone: 'Informativo, con espacio para contexto.', limit: 'Revisar permisos, fuentes y accesibilidad.' },
  { name: 'WhatsApp', format: 'Información, coordinación y mensajes directos', tone: 'Claro, cercano y fácil de consultar.', limit: 'Consentimiento y finalidad definida para los contactos.' },
];
function ChannelExplorer() {
  const [index,setIndex]=useState(0); const n=networks[index];
  return <div className="fox-network"><nav>{networks.map((x,i)=><Button key={x.name} aria-pressed={i===index} variant={i===index?'default':'secondary'} onClick={()=>setIndex(i)}>{x.name}</Button>)}</nav><div className="fox-network-detail"><div className="fox-network-symbol">{n.name.slice(0,2)}<span>{n.name}</span></div><div><small>FORMATOS DEL MATERIAL</small><h3>{n.format}</h3><p>{n.tone}</p><aside>{n.limit}</aside></div></div><p className="fox-visual-note">Una red no define por sí sola edad, género o intereses: la composición de cada comunidad debe comprobarse.</p></div>;
}
function MediaExample() {
  const [mode,setMode]=useState(0);
  return <div className="fox-media-example"><nav>{['Facebook · historia','Instagram · carrusel','X · información','TikTok · video'].map((n,i)=><Button key={n} variant={i===mode?'default':'secondary'} onClick={()=>setMode(i)}>{n}</Button>)}</nav><div className="fox-media-body"><div className="fox-device"><div className="fox-device-top"><span>Modelo de atención</span><span>•••</span></div>{mode===0?<><div className="fox-device-art"><MessageCircle size={90}/><h3>Escuchar.<br/>Orientar.<br/>Acompañar.</h3></div><p>Una historia puede explicar el acompañamiento sin identificar a la persona atendida.</p></>:mode===1?<><div className="fox-device-art"><small>01 / 03</small><h3>¿Cómo funciona<br/>la atención?</h3><ol><li>Solicitar orientación</li><li>Conocer el proceso</li><li>Recibir acompañamiento</li></ol></div><p>Pasos ilustrativos. Sustituir por el procedimiento real verificado.</p></>:mode===2?<><div className="fox-device-art fox-device-text"><h3>Información verificable</h3><p>Qué ofrece el modelo, cómo funciona y dónde consultar sus alcances.</p></div><p>Agregar enlace oficial y fecha. No inventar cobertura ni resultados.</p></>:<><div className="fox-device-art"><Play size={70}/><h3>Una explicación<br/>en 30 segundos</h3><small>VOZ EN OFF + SUBTÍTULOS</small></div><p>Un relato ilustrativo, sin imágenes ni datos que identifiquen a víctimas.</p></>}</div><div className="fox-media-comment"><small>MISMO EJEMPLO DEL PPTX</small><h3>{['Historia humana','Proceso en pasos','Hechos y fuente','Relato audiovisual'][mode]}</h3><p>{['El material propone una historia de atención. Antes de usar un caso real, revisar consentimiento y riesgos de identificación.','El carrusel permite recorrer el proceso. Cada paso debe corresponder al servicio real, no a una promesa.','Una publicación institucional debe distinguir lo comprobado de lo que aún se investiga.','El material propone video breve con voz en off. Puede explicarse el proceso sin exponer a una víctima.'][mode]}</p><div className="fox-media-rule">Cambia el formato.<br/><b>No cambian los hechos.</b></div></div></div></div>;
}
function Pyramid() {
  const [active,setActive]=useState(0); const labels=['Día a día','Coyuntura','Contenidos programados']; const descriptions=['Información cotidiana y respuesta a preguntas. Requiere escuchar y actualizar.','Un hecho nuevo cambia el contexto. Verificarlo antes de ajustar lo que se publica.','Contenido preparado con propósito, fuente y responsable. Es la base que evita improvisar todo.'];
  return <div className="fox-pyramid-layout"><div className="fox-pyramid">{labels.map((x,i)=><Button key={x} className={`fox-pyramid-tier tier-${i}`} aria-label={x} aria-pressed={active===i} onClick={()=>setActive(i)}><b>{i+1}</b></Button>)}</div><div className="fox-pyramid-labels">{labels.map((x,i)=><Button key={x} variant={i===active?'default':'ghost'} onClick={()=>setActive(i)}><ArrowRight/>{x}</Button>)}<p>{descriptions[active]}</p><small>La pirámide expresa niveles, no porcentajes ni cuotas de publicación.</small></div></div>;
}
function Ladder() {
  const [active,setActive]=useState(1);const stages=[['Exposición','Personas alcanzadas por la convocatoria.'],['Interés','Personas que consultan los detalles.'],['Registro o compromiso','Personas que completan la acción previa.'],['Participación efectiva','Personas que realizan la actividad.'],['Seguimiento','Resultados, respuesta y continuidad.']];
  return <><div className="fox-ladder">{stages.map(([title,text],i)=><Button key={title} variant={active===i?'default':'secondary'} className={`fox-ladder-stage stage-${i}`} onClick={()=>setActive(i)}><small>NIVEL {i+1}</small><h3>{title}</h3><p>{text}</p></Button>)}</div><div className="fox-ladder-summary">{active===4?'El proceso no termina con la asistencia: hay resultados y continuidad.':'Cada nivel tiene una medida distinta. No sumar clics, registros y asistentes como si fueran lo mismo.'}</div></>;
}
export default function SourceVisuals({slide}:{slide:FoxSlide}) {
  if(slide.kind==='channels')return <ChannelExplorer/>;
  if(slide.kind==='media-example')return <MediaExample/>;
  if(slide.kind==='pyramid')return <Pyramid/>;
  if(slide.kind==='ladder')return <Ladder/>;
  if(slide.kind==='narrative'){const icons=[MessageCircle,Search,Zap,CalendarDays];return <div className="fox-narrative">{slide.items?.map((x,i)=>{const Icon=icons[i]??MessageCircle;return <div key={x.title}><Icon/><h3>{x.title}</h3><p>{x.text}</p></div>;})}</div>;}
  if(slide.kind==='reminders')return <div className="fox-reminders">{slide.items?.map((x,i)=><div key={x.title}><span>{i+1}</span><h3>{x.title}</h3><p>{x.text}</p></div>)}</div>;
  if(slide.kind==='practices')return <div className="fox-practices"><div><h3><Check/> Sí</h3>{['Explicar el propósito con transparencia.','Ofrecer alternativas sin acceso digital.','Obtener consentimiento para usar datos.','Reportar resultados, dificultades y pendientes.'].map(x=><p key={x}>{x}</p>)}</div><div><h3>× No</h3>{['Comprar interacciones o simular respaldo.','Presentar registros como asistentes.','Usar datos personales sin autorización.','Presionar o prometer resultados no garantizados.'].map(x=><p key={x}>{x}</p>)}</div></div>;
  return null;
}