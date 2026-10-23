import { useState } from 'react';
import { CalendarDays, Check, MessageCircle, Search, Volume2, Play, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FoxSlide } from '@/data/centroFoxSession';

const networks = [
  { name: 'Facebook', audience: 'Familias, mujeres, adultos mayores, ciudadanía en general', format: 'Informes, álbumes, historias de impacto', tone: 'Tono cercano, historias reales y contenido visual.' },
  { name: 'Instagram', audience: 'Jóvenes, mujeres, sociedad civil', format: 'Reels, carruseles, infografías, lives', tone: 'Visual, breve y aspiracional.' },
  { name: 'X', audience: 'Medios, actores políticos, empresarios', format: 'Posturas, datos rápidos, declaraciones', tone: 'Breve, informativo y oportuno.' },
  { name: 'TikTok', audience: 'Jóvenes', format: 'Videos cortos, storytelling, tendencias', tone: 'Dinámico, creativo y visual. El humor, la claridad y lo real funcionan.' },
  { name: 'YouTube', audience: 'Público general', format: 'Videos explicativos, entrevistas, cápsulas, lives', tone: 'Visual, informativo, historias, documental.' },
  { name: 'WhatsApp', audience: 'Ciudadanía en general', format: 'Difusión de información, coordinación, mensajes directos', tone: 'Informativo, dinámico y cercano.' },
];
function ChannelExplorer() {
  const [index,setIndex]=useState(0);
  return <div className="fox-table-wrap"><table className="fox-table"><thead><tr><th>Plataforma</th><th>¿Qué tipo de público encuentras?</th><th>¿Qué contenido funciona mejor?</th><th>¿Qué estilo debes usar?</th></tr></thead><tbody>{networks.map((n,i)=><tr key={n.name} className={i===index?'active':''} onClick={()=>setIndex(i)}><th scope="row">{n.name}</th><td>{n.audience}</td><td>{n.format}</td><td>{n.tone}</td></tr>)}</tbody></table><p className="fox-visual-note">Perfiles generales de cada red. Antes de decidir, compruébalos con las estadísticas de tu propia cuenta.</p></div>;
}
function MediaExample() {
  const [mode,setMode]=useState(0);
  return <div className="fox-media-example"><nav>{['Facebook · historia','Instagram · carrusel','X · postura','TikTok · video'].map((n,i)=><Button key={n} variant={i===mode?'default':'secondary'} onClick={()=>setMode(i)}>{n}</Button>)}</nav><div className="fox-media-body"><div className="fox-device"><div className="fox-device-top"><span>Modelo de atención</span><span>•••</span></div>{mode===0?<><div className="fox-device-art"><MessageCircle size={90}/><h3>Escuchar.<br/>Orientar.<br/>Acompañar.</h3></div><p>Una historia puede explicar el acompañamiento sin identificar a la persona atendida.</p></>:mode===1?<><div className="fox-device-art"><small>01 / 03</small><h3>¿Cómo funciona<br/>la atención?</h3><ol><li>Solicitar orientación</li><li>Conocer el proceso</li><li>Recibir acompañamiento</li></ol></div><p>Pasos ilustrativos. Sustituir por el procedimiento real verificado.</p></>:mode===2?<><div className="fox-device-art fox-device-text"><h3>Información verificable</h3><p>Qué ofrece el modelo, cómo funciona y dónde consultar sus alcances.</p></div><p>Agregar enlace oficial y fecha. No inventar cobertura ni resultados.</p></>:<><div className="fox-device-art"><Play size={70}/><h3>Una explicación<br/>en 30 segundos</h3><small>VOZ EN OFF + SUBTÍTULOS</small></div><p>Un relato ilustrativo, sin imágenes ni datos que identifiquen a víctimas.</p></>}</div><div className="fox-media-comment"><small>LA PIEZA</small><h3>{['Historia humana','Proceso en pasos','Postura con datos','Relato audiovisual'][mode]}</h3><dl className="fox-media-meta"><dt>Tono</dt><dd>{['Cercano, humano, esperanzador','Visual, directo, informativo','Formal, firme, oportuno','Dinámico, claro, empático'][mode]}</dd><dt>Público meta</dt><dd>{['Familias y ciudadanía general','Mujeres, jóvenes, comunidad activa','Medios, actores políticos','Jóvenes, ciudadanía general'][mode]}</dd></dl><p>{['El material propone una historia de atención. Antes de usar un caso real, revisar consentimiento y riesgos de identificación.','El carrusel permite recorrer el proceso. Cada paso debe corresponder al servicio real, no a una promesa.','Una publicación institucional debe distinguir lo comprobado de lo que aún se investiga.','El material propone video breve con voz en off. Puede explicarse el proceso sin exponer a una víctima.'][mode]}</p><div className="fox-media-rule">Cambia el formato.<br/><b>No cambian los hechos.</b></div></div></div></div>;
}
function Pyramid() {
  const [active,setActive]=useState(0); const labels=['Día a día','Coyuntura','Contenidos programados']; const descriptions=['Información cotidiana y respuesta a preguntas. Requiere escuchar y actualizar.','Un hecho nuevo cambia el contexto. Verificarlo antes de ajustar lo que se publica.','Contenido preparado con propósito, fuente y responsable. Es la base que evita improvisar todo.'];
  return <div className="fox-pyramid-layout"><div className="fox-pyramid">{labels.map((x,i)=><Button key={x} className={`fox-pyramid-tier tier-${i}`} aria-label={x} aria-pressed={active===i} onClick={()=>setActive(i)}><b>{i+1}</b></Button>)}</div><div className="fox-pyramid-labels">{labels.map((x,i)=><Button key={x} variant={i===active?'default':'ghost'} onClick={()=>setActive(i)}><ArrowRight/>{x}</Button>)}<p>{descriptions[active]}</p><small>La pirámide expresa niveles, no porcentajes ni cuotas de publicación.</small></div></div>;
}
function Ladder() {
  const [active,setActive]=useState(1);const stages=[['Exposición','Personas alcanzadas por la convocatoria.'],['Interés','Personas que consultan los detalles.'],['Registro o compromiso','Personas que completan la acción previa.'],['Participación efectiva','Personas que realizan la actividad.'],['Seguimiento','Resultados, respuesta y continuidad.']];
  return <><div className="fox-ladder">{stages.map(([title,text],i)=><Button key={title} variant={active===i?'default':'secondary'} className={`fox-ladder-stage stage-${i}`} onClick={()=>setActive(i)}><small>NIVEL {i+1}</small><h3>{title}</h3><p>{text}</p></Button>)}</div><div className="fox-ladder-summary">{active===4?'El proceso no termina con la asistencia: hay resultados y continuidad.':'Cada nivel tiene una medida distinta. No sumar clics, registros y asistentes como si fueran lo mismo.'}</div></>;
}
const scenarios = [
  { name: 'Limpieza en un parque', steps: [['200','dieron «me gusta»'],['60','dijeron «ahí estaré»'],['15','llegaron']], causes: [['No quedaba claro el punto de reunión','Revisar la invitación: ¿decía la entrada exacta del parque y a quién buscar?'],['Era a las 7 a. m. en domingo','Comparar con otras jornadas en otro horario.'],['No sabían qué llevar','¿Se dijo si había guantes y bolsas o si cada quien llevaba los suyos?'],['Nadie mandó recordatorio','¿Hubo mensaje un día antes a quienes dijeron «ahí estaré»?']] },
  { name: 'Foro vecinal de seguridad', steps: [['5,000','vieron el video'],['80','pidieron la ubicación'],['20','llegaron']], causes: [['Cambió el lugar y no se avisó','¿Se avisó el cambio por el mismo canal en que se pidió la ubicación?'],['Chocaba con la salida del trabajo','Revisar la hora contra la rutina de la colonia.'],['No había dónde dejar a los niños','Preguntar de forma voluntaria y breve a quienes no fueron.'],['No se entendía para qué ir','¿El mensaje decía qué se iba a lograr en el foro?']] },
  { name: 'Donación de sangre', steps: [['300','compartieron la publicación'],['50','se inscribieron'],['12','donaron']], causes: [['No conocían los requisitos','¿Se explicaron ayuno, edad y documentos antes de inscribirse?'],['Solo era entre semana','Comparar con una jornada en sábado.'],['El lugar quedaba lejos','Revisar transporte y distancia desde las colonias de quienes se inscribieron.'],['No hubo confirmación','¿Se envió recordatorio un día antes con hora y requisitos?']] },
];
function Hypotheses({slide}:{slide:FoxSlide}) {
  const [sc,setSc]=useState(0); const [open,setOpen]=useState<number[]>([]); const x=scenarios[sc];
  return <><nav className="fox-scenarios">{scenarios.map((s,i)=><Button key={s.name} variant={i===sc?'default':'secondary'} onClick={()=>{setSc(i);setOpen([]);}}>{i+1} · {s.name}</Button>)}</nav>
  <div className="fox-steps">{x.steps.map(([n,t],i)=><div key={t}><b>{n}</b><span>{t}</span>{i<2&&<ArrowRight/>}</div>)}</div>
  <div className="fox-hypotheses">{x.causes.map(([c,how],i)=>{const on=open.includes(i);return <Button key={c} aria-expanded={on} onClick={()=>setOpen(o=>on?o.filter(v=>v!==i):[...o,i])}><small>CAUSA {String.fromCharCode(65+i)}</small><h3>{c}</h3>{on?<p>{how}</p>:<span>¿Cómo lo comprobamos?</span>}</Button>;})}</div>
  {open.length===4&&<div className="fox-ladder-summary">{slide.debrief}</div>}</>;
}
export default function SourceVisuals({slide}:{slide:FoxSlide}) {
  if(slide.kind==='channels')return <ChannelExplorer/>;
  if(slide.kind==='media-example')return <MediaExample/>;
  if(slide.kind==='pyramid')return <Pyramid/>;
  if(slide.kind==='hypotheses')return <Hypotheses slide={slide}/>;
  if(slide.kind==='matrix')return <div className="fox-matrix"><aside><small>MATRIZ DE RESPUESTA</small><p>Primero clasifica qué tienes enfrente. Después decide si respondes, monitoreas o corriges.</p></aside><ol>{slide.items?.map((x,i)=><li key={x.title}><span>{i+1}</span><div><h3>{x.title}</h3><p>{x.text}</p></div></li>)}</ol></div>;
  if(slide.kind==='ladder')return <Ladder/>;
  if(slide.kind==='narrative'){const icons=[MessageCircle,Search,Zap,CalendarDays];return <div className="fox-narrative">{slide.items?.map((x,i)=>{const Icon=icons[i]??MessageCircle;return <div key={x.title}><Icon/><h3>{x.title}</h3><p>{x.text}</p></div>;})}</div>;}
  if(slide.kind==='reminders')return <div className="fox-reminders">{slide.items?.map((x,i)=><div key={x.title}><span>{i+1}</span><h3>{x.title}</h3><p>{x.text}</p></div>)}</div>;
  if(slide.kind==='practices')return <div className="fox-practices"><div><h3><Check/> Sí</h3>{['Explicar el propósito con transparencia.','Ofrecer alternativas sin acceso digital.','Obtener consentimiento para usar datos.','Reportar resultados, dificultades y pendientes.'].map(x=><p key={x}>{x}</p>)}</div><div><h3>× No</h3>{['Comprar interacciones o simular respaldo.','Presentar registros como asistentes.','Usar datos personales sin autorización.','Presionar o prometer resultados no garantizados.'].map(x=><p key={x}>{x}</p>)}</div></div>;
  return null;
}