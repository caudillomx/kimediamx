import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize,
  HandHelping, Wrench, Megaphone, Search, Smartphone, Clock,
  EyeOff, MapPin, UserX, UserCheck, History, MessageCircle,
  Camera, Landmark, Users, Network, ShieldCheck, Play,
  UserCircle, Route, Handshake, X,
} from "lucide-react";
import { presentationSlides, type SlideData } from "@/data/presentationSlides";
import kimediaLogo from "@/assets/kimedia-logo.png";

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
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-6">
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
  const total = presentationSlides.length;

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
      <div className="flex-1 relative overflow-hidden bg-background">
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
