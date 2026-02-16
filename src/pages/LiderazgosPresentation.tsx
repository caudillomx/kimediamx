import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, Download,
  HandHelping, Wrench, Megaphone, Search, Smartphone, Clock,
  EyeOff, MapPin, UserX, UserCheck, History, MessageCircle,
  Camera, Landmark, Users, Network, ShieldCheck, Play,
  UserCircle, Route, Handshake,
} from "lucide-react";
import { presentationSlides, type SlideData } from "@/data/presentationSlides";
import kimediaLogo from "@/assets/kimedia-logo.png";

// Slide illustrations
import slideCommunity from "@/assets/slides/slide-community.jpg";
import slideSmartphone from "@/assets/slides/slide-smartphone.jpg";
import slideSocial from "@/assets/slides/slide-social.jpg";
import slideVisual from "@/assets/slides/slide-visual.jpg";
import slideDigitalSpace from "@/assets/slides/slide-digital-space.jpg";
import slideFound from "@/assets/slides/slide-found.jpg";
import slideMyths from "@/assets/slides/slide-myths.jpg";

const slideImages: Record<number, string> = {
  2: slideCommunity,
  4: slideSmartphone,
  8: slideSocial,
  9: slideVisual,
  11: slideMyths,
  12: slideDigitalSpace,
  13: slideFound,
};

const iconMap: Record<string, React.ElementType> = {
  HandHelping, Wrench, Megaphone, Search, Smartphone, Clock,
  EyeOff, MapPin, UserX, UserCheck, History, MessageCircle,
  Camera, Landmark, Users, Network, ShieldCheck, Play,
  UserCircle, Route, Handshake, Facebook: Users, Instagram: Camera,
};

function SlideIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || Megaphone;
  return <Icon className={className} />;
}

function SlideRenderer({ slide }: { slide: SlideData }) {
  const { layout, content } = slide;
  const image = slideImages[slide.id];
  const hasImage = !!image && layout === "text-image";

  return (
    <div className="w-full h-full flex flex-col p-8 md:p-12 lg:p-16 overflow-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-10 shrink-0">
        {slide.subtitle && (
          <span className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold text-muted-foreground mb-2 block">
            {slide.subtitle}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="text-foreground">{slide.title}</span>
          {slide.titleAccent && (
            <>
              <br />
              <span className="text-gradient font-light italic">{slide.titleAccent}</span>
            </>
          )}
        </h1>
        <div className="w-16 md:w-20 h-1 bg-gradient-coral mt-4" />
      </div>

      {/* Content area */}
      <div className={`flex-1 min-h-0 flex ${hasImage ? "flex-col md:flex-row gap-8" : "flex-col"} justify-center gap-6`}>
        <div className={`flex flex-col justify-center gap-6 ${hasImage ? "md:w-3/5" : ""}`}>
          {content.intro && (
            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-4xl">
              {content.intro}
            </p>
          )}

          {/* Before/After */}
          {content.beforeAfter && (
            <div className="space-y-4">
              <div className="flex items-center gap-6 p-5 rounded-xl bg-secondary/50 border border-border/50">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground w-16">
                  {content.beforeAfter.before.label}
                </span>
                <span className="text-lg md:text-xl font-semibold text-foreground">
                  {content.beforeAfter.before.text}
                </span>
              </div>
              <div className="flex items-center gap-6 p-5 rounded-xl bg-gradient-coral text-primary-foreground">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70 w-16">
                  {content.beforeAfter.after.label}
                </span>
                <span className="text-lg md:text-xl font-semibold">
                  {content.beforeAfter.after.text}
                </span>
              </div>
            </div>
          )}

          {/* Points list */}
          {content.points && (
            <div className="space-y-5">
              {content.points.map((p, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-primary">
                    <SlideIcon name={p.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">{p.title}</h3>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image panel for text-image layout */}
        {hasImage && (
          <div className="hidden md:flex md:w-2/5 items-center justify-center">
            <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden shadow-2xl">
              <img src={image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>
          </div>
        )}

        {/* Grid columns */}
        {layout === "grid-3" && content.columns && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.columns.map((col, i) => (
              <div key={i} className="flex flex-col gap-4 p-6 rounded-xl border border-border bg-card">
                <div className="text-primary">
                  <SlideIcon name={col.icon} className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{col.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{col.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comparison layout */}
        {layout === "comparison" && content.columns && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {content.columns.map((col, i) => (
              <div
                key={i}
                className={`flex flex-col gap-5 p-8 rounded-xl ${
                  col.dark
                    ? "bg-gradient-coral text-primary-foreground shadow-glow"
                    : "bg-secondary/30 border border-border opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <SlideIcon name={col.icon} className="w-7 h-7" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">{col.title}</h3>
                </div>
                <ul className="space-y-4 flex-1">
                  {col.items?.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="mt-1">{col.dark ? "✓" : "✗"}</span>
                      <p className="text-base md:text-lg">{item}</p>
                    </li>
                  ))}
                </ul>
                {col.footerNote && (
                  <p className="text-sm italic opacity-60 border-t border-current/20 pt-4">
                    {col.footerNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Search layout */}
        {layout === "search" && (
          <>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-2xl rounded-full bg-secondary/50 border border-border p-4 px-8 flex items-center gap-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg text-muted-foreground italic">{content.searchQuery}</span>
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                {content.searchCaption}
              </p>
            </div>
            {content.columns && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {content.columns.map((col, i) => (
                  <div key={i} className="flex flex-col gap-4 p-6 rounded-xl bg-secondary/30 border-l-4 border-primary">
                    <div className="flex items-center gap-3">
                      <SlideIcon name={col.icon} className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold text-foreground">{col.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">{col.description}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Cover message */}
        {layout === "cover" && content.message && (
          <p className="text-xl md:text-3xl text-muted-foreground max-w-3xl leading-relaxed">
            {content.message}
          </p>
        )}

        {/* Callout */}
        {content.callout && (
          <div className="mt-auto bg-gradient-coral text-primary-foreground p-6 md:p-8 rounded-xl shadow-glow">
            <p className="text-lg md:text-xl font-medium leading-snug italic">
              {content.callout}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {(slide.footer || slide.footerRight) && (
        <div className="shrink-0 mt-6 pt-4 border-t border-border/50 flex justify-between items-center text-sm text-muted-foreground">
          <span className="max-w-[70%]">{slide.footer}</span>
          {slide.footerRight && (
            <span className="font-bold uppercase tracking-widest text-xs">{slide.footerRight}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function LiderazgosPresentation() {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const total = presentationSlides.length;
  const slideAreaRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "f" || e.key === "F") setIsFullscreen((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      // Create a temporary container with all slides
      const container = document.createElement("div");
      container.style.width = "1280px";
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      document.body.appendChild(container);

      for (let i = 0; i < total; i++) {
        const slideDiv = document.createElement("div");
        slideDiv.style.width = "1280px";
        slideDiv.style.height = "720px";
        slideDiv.style.background = "#0a0a0f";
        slideDiv.style.color = "#ffffff";
        slideDiv.style.padding = "48px";
        slideDiv.style.boxSizing = "border-box";
        slideDiv.style.fontFamily = "'Space Grotesk', 'Inter', sans-serif";
        slideDiv.style.pageBreakAfter = "always";
        slideDiv.style.position = "relative";
        slideDiv.style.overflow = "hidden";

        const slide = presentationSlides[i];
        let html = "";

        if (slide.subtitle) {
          html += `<div style="font-size:12px;text-transform:uppercase;letter-spacing:4px;color:#888;margin-bottom:8px;font-weight:700">${slide.subtitle}</div>`;
        }
        html += `<h1 style="font-size:36px;font-weight:800;margin:0 0 8px;line-height:1.1">${slide.title}</h1>`;
        if (slide.titleAccent) {
          html += `<h1 style="font-size:36px;font-weight:300;font-style:italic;margin:0 0 12px;background:linear-gradient(135deg,#FF6B4A,#E91E84);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${slide.titleAccent}</h1>`;
        }
        html += `<div style="width:60px;height:3px;background:linear-gradient(135deg,#FF6B4A,#E91E84);margin-bottom:24px"></div>`;

        if (slide.content.intro) {
          html += `<p style="font-size:18px;color:#aaa;line-height:1.6;max-width:800px;margin-bottom:20px">${slide.content.intro}</p>`;
        }

        if (slide.content.points) {
          slide.content.points.forEach(p => {
            html += `<div style="margin-bottom:16px"><h3 style="font-size:18px;font-weight:700;margin:0 0 4px">${p.title}</h3><p style="font-size:15px;color:#aaa;margin:0;line-height:1.5">${p.description}</p></div>`;
          });
        }

        if (slide.content.columns) {
          html += `<div style="display:flex;gap:16px;margin-top:12px">`;
          slide.content.columns.forEach(col => {
            html += `<div style="flex:1;padding:20px;background:rgba(255,255,255,0.05);border-radius:12px;border:1px solid rgba(255,255,255,0.1)">`;
            html += `<h3 style="font-size:16px;font-weight:700;margin:0 0 8px">${col.title}</h3>`;
            if (col.description) html += `<p style="font-size:14px;color:#aaa;margin:0;line-height:1.5">${col.description}</p>`;
            if (col.items) {
              col.items.forEach(item => {
                html += `<p style="font-size:14px;color:#aaa;margin:6px 0;line-height:1.4">• ${item}</p>`;
              });
            }
            html += `</div>`;
          });
          html += `</div>`;
        }

        if (slide.content.callout) {
          html += `<div style="margin-top:auto;padding:20px;background:linear-gradient(135deg,#FF6B4A,#E91E84);border-radius:12px;position:absolute;bottom:48px;left:48px;right:48px"><p style="font-size:16px;font-style:italic;margin:0;color:#fff">${slide.content.callout}</p></div>`;
        }

        if (slide.footer) {
          html += `<div style="position:absolute;bottom:16px;left:48px;font-size:12px;color:#666">${slide.footer}</div>`;
        }

        slideDiv.innerHTML = html;
        container.appendChild(slideDiv);
      }

      await html2pdf()
        .set({
          margin: 0,
          filename: "Presentacion-Taller-Liderazgo-Digital.pdf",
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, backgroundColor: "#0a0a0f", width: 1280, height: 720 },
          jsPDF: { unit: "px", format: [1280, 720], orientation: "landscape", hotfixes: ["px_scaling"] },
          pagebreak: { mode: "css" },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isFullscreen ? "fixed inset-0 z-[9999]" : ""}`}>
      {/* Top bar */}
      {!isFullscreen && (
        <div className="shrink-0 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
          <Link to="/liderazgos" className="flex items-center gap-3">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold hidden md:inline">
              Presentación del Taller
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">{isExporting ? "Exportando..." : "PDF"}</span>
            </button>
            <span className="text-sm text-muted-foreground font-mono">
              {current + 1} / {total}
            </span>
            <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide area */}
      <div ref={slideAreaRef} className="flex-1 relative overflow-hidden bg-background">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-secondary z-10">
          <motion.div
            className="h-full bg-gradient-coral"
            animate={{ width: `${((current + 1) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Mesh background */}
        <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <SlideRenderer slide={presentationSlides[current]} />
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          <button
            onClick={prev}
            disabled={current === 0}
            className="p-3 rounded-full glass hover:bg-secondary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 rounded-full glass text-sm font-mono">
            {current + 1} / {total}
          </div>
          <button
            onClick={next}
            disabled={current === total - 1}
            className="p-3 rounded-full glass hover:bg-secondary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {isFullscreen && (
            <button
              onClick={() => { document.exitFullscreen(); }}
              className="p-3 rounded-full glass hover:bg-secondary/80 transition-colors ml-2"
            >
              <Minimize className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Slide number thumbnails (desktop only) */}
        {!isFullscreen && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20 hidden lg:flex">
            {presentationSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? "bg-primary scale-125" : "bg-secondary hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
