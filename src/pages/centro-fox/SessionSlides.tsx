import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, ChevronLeft, ChevronRight, Grid2X2, Maximize2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FoxBrand from '@/components/centro-fox/FoxBrand';
import { FOX_CASES, FOX_POLLS, FOX_SLIDES, type FoxSlide } from '@/data/centroFoxSession';
import { useFoxVotes } from '@/hooks/useFoxVotes';
import frame from '@/assets/centro-fox/frame.png.asset.json';
import community from '@/assets/slides/slide-community.jpg';
import social from '@/assets/slides/slide-social.jpg';
import risk from '@/assets/cfl/riesgo.jpg';
import work from '@/assets/cfl/herramienta.jpg';
import plaza from '@/assets/cfl/plaza.jpg';
import algorithm from '@/assets/cfl/algoritmo.jpg';
const images = { community, social, risk, work, plaza, algorithm };

function Workshop({ slide }: { slide: FoxSlide }) {
  const [open, setOpen] = useState(false);
  return <div className="fox-workshop"><p>{slide.prompt}</p><Button variant="secondary" className="h-auto py-4 px-6 text-2xl" onClick={() => setOpen(v => !v)}>{open ? 'Ocultar pistas' : 'Poner en común'}</Button>{open && <div className="fox-answer">{slide.debrief}</div>}</div>;
}

const participantUrl = () => `${window.location.origin}/centro-fox/participa`;
function Qr() { return <div className="fox-qr"><QRCodeSVG value={participantUrl()} size={280} bgColor="transparent" fgColor="currentColor" /><strong>Participación en la sesión</strong><small>{participantUrl().replace(/^https?:\/\//, '')}</small></div>; }
function LiveResults({ poll }: { poll: keyof typeof FOX_POLLS }) {
  const { counts, error } = useFoxVotes(); const c = counts(poll); const total = Object.values(c).reduce((a,b) => a+b,0);
  return <div className="fox-cover"><div>{FOX_POLLS[poll].options.map(o => <div className="fox-poll-row" key={o}><span>{o}</span><div className="fox-bar"><div style={{ width:`${total ? (c[o] ?? 0)/total*100 : 0}%` }} /></div><b>{c[o] ?? 0}</b></div>)}<p className="fox-lead">{error ? 'No se pudieron actualizar los resultados.' : `${total} respuestas registradas`}</p></div><Qr /></div>;
}
function DiagnosisResults() { const { counts } = useFoxVotes(); const c=counts('diag'); return <div className="fox-cover"><div className="fox-items">{['Por fortalecer','En desarrollo','Práctica consistente'].map(l => <div className="fox-item" key={l}><h3>{l}</h3><p className="fox-title">{c[l] ?? 0}</p></div>)}</div><Qr /></div>; }
function Case({ id }: { id: string }) {
  const item=FOX_CASES.find(c=>c.id===id); const [reveal,setReveal]=useState(false);
  if (!item) return null;
  return <div className="fox-cover"><div className="fox-cases grid gap-4">{item.options.map((o,i)=><Button variant="outline" key={o} onClick={()=>setReveal(true)}>{String.fromCharCode(65+i)} · {o}</Button>)}<Button variant="secondary" onClick={()=>setReveal(v=>!v)}>{reveal?'Ocultar análisis':'Mostrar análisis'}</Button>{reveal&&<div className="fox-answer"><b>{item.options[item.answer]}</b><p>{item.why}</p></div>}</div><Qr /></div>;
}
function Content({ slide }: { slide: FoxSlide }) {
  if(slide.kind==='cover') return <div className="fox-cover"><div><h1 className="fox-cover-title">{slide.title}</h1><p className="fox-lead mt-8">{slide.lead}</p><p className="fox-lead">Programa de Alto Nivel en Liderazgo Electoral<br/>Jesús Caudillo · Expositor</p><img className="fox-cover-image" src={community} alt="Ilustración de personas en conversación" /></div><Qr /></div>;
  if(slide.kind==='chapter') return <div className="fox-chapter"><img src={images[slide.image ?? 'community']} alt="Ilustración conceptual del bloque"/><div><span className="fox-chapter-number">{slide.axis==='micro'?'01':slide.axis==='verification'?'02':'03'}</span><h2 className="fox-title">{slide.title}</h2><p className="fox-lead">{slide.lead}</p></div></div>;
  const body = slide.poll?<LiveResults poll={slide.poll}/>:slide.kind==='diagnosis'?<DiagnosisResults/>:slide.caseId?<Case key={slide.caseId} id={slide.caseId}/>:slide.kind==='workshop'?<Workshop key={slide.title} slide={slide}/>:<div className={slide.kind==='flow'?'fox-flow':slide.kind==='funnel'?'fox-funnel':`fox-items ${slide.items?.length===4?'four':''} ${slide.kind==='agenda'?'fox-agenda':''} ${slide.kind==='example'?'fox-example':''}`}>{slide.items?.map((item,i)=><Fragment key={item.title}><div className="fox-item"><span className="fox-item-number">{String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3><p>{item.text}</p></div>{slide.kind==='flow'&&i<(slide.items?.length??0)-1&&<ArrowRight size={32} className="fox-flow-arrow"/>}</Fragment>)}</div>;
  return <><h2 className="fox-title">{slide.title}</h2>{slide.lead&&<p className="fox-lead">{slide.lead}</p>}{slide.image?<div className={`fox-illustrated ${slide.kind==='flow'?'fox-image-band':''}`}><div>{body}</div><img src={images[slide.image]} alt="Ilustración conceptual, no evidencia de un caso real"/></div>:body}</>;
}
function Slide({index}: {index:number}) { const slide=FOX_SLIDES[index]; return <><img className="fox-frame" src={`https://www.kimedia.mx${frame.url}`} alt=""/><FoxBrand/><div className="fox-kicker">{slide.section}</div><Content slide={slide}/><footer className="fox-footer"><span>{slide.source??'Centro Fox · Paulina Amozurrutia · Estrategia digital y redes sociales'}</span><span>{index+1} / {FOX_SLIDES.length}</span></footer></>; }
export default function SessionSlides() {
  const [params,setParams]=useSearchParams(); const raw=Number(params.get('slide')??1); const index=Number.isFinite(raw)?Math.min(FOX_SLIDES.length-1,Math.max(0,Math.floor(raw)-1)):0;
  const [grid,setGrid]=useState(false); const [scale,setScale]=useState(1); const [fullscreen,setFullscreen]=useState(false); const box=useRef<HTMLDivElement>(null); const touch=useRef<number|null>(null);
  const go=useCallback((n:number)=>{setParams({slide:String(Math.min(FOX_SLIDES.length,Math.max(1,n+1)))},{replace:true});setGrid(false);},[setParams]);
  const present=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{});};
  useLayoutEffect(()=>{const el=box.current;if(!el)return; const ro=new ResizeObserver(()=>setScale(Math.min(el.clientWidth/1920,el.clientHeight/1080)));ro.observe(el);return()=>ro.disconnect();},[]);
  useEffect(()=>{document.title=`${index+1}/${FOX_SLIDES.length} — ${FOX_SLIDES[index].title} · Centro Fox`;},[index]);
  useEffect(()=>{const change=()=>setFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',change);return()=>document.removeEventListener('fullscreenchange',change);},[]);
  useEffect(()=>{const h=(e:KeyboardEvent)=>{if((e.target as HTMLElement).closest('button,input,textarea'))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(index+1);}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(index-1);}if(e.key==='g')setGrid(v=>!v);if(e.key==='F5'){e.preventDefault();present();}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);},[index,go]);
  const font=<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"/>;
  if(params.has('print'))return <div className="fox-theme fox-print">{font}{FOX_SLIDES.map((_,i)=><div className="fox-slide" key={i}><Slide index={i}/></div>)}</div>;
  return <div className="fox-theme fixed inset-0">{font}<div ref={box} className="absolute inset-0 overflow-hidden" onTouchStart={e=>{touch.current=e.touches[0]?.clientX??null;}} onTouchEnd={e=>{if(touch.current===null)return;const x=e.changedTouches[0]?.clientX??touch.current;const dx=x-touch.current;if(Math.abs(dx)>50)go(index+(dx<0?1:-1));touch.current=null;}}>{grid?<div className="h-full overflow-auto p-16 grid grid-cols-2 md:grid-cols-3 gap-4">{FOX_SLIDES.map((s,i)=><Button key={i} variant="outline" className="h-auto min-h-28 whitespace-normal justify-start text-left p-5" onClick={()=>go(i)}><span className="text-primary font-bold">{i+1}</span>{s.title}</Button>)}</div>:<div className="fox-slide" style={{transform:`scale(${scale})`}}><Slide index={index}/></div>}</div><nav className="fixed top-3 right-3 flex gap-1 bg-background border border-border rounded-md p-1">{[{label:'Anterior',icon:ChevronLeft,action:()=>go(index-1),disabled:index===0},{label:'Siguiente',icon:ChevronRight,action:()=>go(index+1),disabled:index===FOX_SLIDES.length-1},{label:'Vista general',icon:Grid2X2,action:()=>setGrid(v=>!v)},{label:fullscreen?'Salir de pantalla completa':'Pantalla completa',icon:Maximize2,action:present},{label:'Versión para imprimir',icon:Printer,action:()=>window.open('/centro-fox/estrategia-digital?print','_blank')}].map(c=><Button key={c.label} variant="ghost" size="icon" title={c.label} aria-label={c.label} onClick={c.action} disabled={c.disabled}><c.icon/></Button>)}</nav></div>;
}