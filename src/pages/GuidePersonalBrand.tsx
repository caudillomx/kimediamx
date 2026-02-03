import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Lock, CheckCircle, BookOpen, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GuideRegistrationModal } from "@/components/guide/GuideRegistrationModal";
import { personalBrandGuide, GuideChapter } from "@/data/guideContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function GuidePersonalBrand() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  // Check localStorage for registration
  useEffect(() => {
    const storedEmail = localStorage.getItem("kimedia_guide_personal_brand");
    if (storedEmail) {
      setIsRegistered(true);
      setUserEmail(storedEmail);
    }
  }, []);

  const handleRegister = async (data: { name: string; email: string; phone?: string }) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("guide_registrations").insert({
        guide_type: "personal_brand",
        email: data.email,
        name: data.name,
        phone: data.phone || null,
      });

      if (error) throw error;

      // Store in localStorage
      localStorage.setItem("kimedia_guide_personal_brand", data.email);
      setIsRegistered(true);
      setUserEmail(data.email);
      setIsModalOpen(false);
      toast.success("¡Guía desbloqueada! Ya puedes acceder a todo el contenido.");
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChapterClick = (chapter: GuideChapter) => {
    if (chapter.isPremium && !isRegistered) {
      setIsModalOpen(true);
    } else {
      setActiveChapter(activeChapter === chapter.id ? null : chapter.id);
    }
  };

  const guide = personalBrandGuide;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-magenta to-coral flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">Guía Marca Personal</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-magenta/10 border border-magenta/20 mb-6">
              <BookOpen className="w-4 h-4 text-magenta" />
              <span className="text-sm font-medium text-magenta">Guía completa</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {guide.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              {guide.description}
            </p>

            {isRegistered ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime/10 border border-lime/20">
                <CheckCircle className="w-4 h-4 text-lime" />
                <span className="text-sm font-medium text-lime">Acceso completo desbloqueado</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-coral hover:opacity-90 text-white font-semibold py-6 px-8"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Desbloquear guía completa
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Chapters */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-4">
            {guide.chapters.map((chapter, index) => {
              const isLocked = chapter.isPremium && !isRegistered;
              const isActive = activeChapter === chapter.id;

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    onClick={() => handleChapterClick(chapter)}
                    className={`p-6 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? "bg-card border-coral"
                        : isLocked
                        ? "bg-secondary/30 border-border hover:border-muted-foreground"
                        : "bg-card border-border hover:border-coral/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-foreground">{chapter.title}</h3>
                          {isLocked && (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{chapter.description}</p>
                      </div>
                      {!isLocked && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isActive ? "rotate-180" : ""}`}>
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Chapter content */}
                    {isActive && !isLocked && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-border"
                      >
                        <div className="space-y-6">
                          {chapter.content.map((block, blockIndex) => (
                            <div key={blockIndex} className="prose prose-invert prose-sm max-w-none">
                              {block.split("\n").map((line, lineIndex) => {
                                if (line.startsWith("**") && line.endsWith("**")) {
                                  return (
                                    <h4 key={lineIndex} className="text-lg font-bold text-foreground mt-4 mb-2">
                                      {line.replace(/\*\*/g, "")}
                                    </h4>
                                  );
                                }
                                if (line.startsWith("• ") || line.startsWith("- ")) {
                                  return (
                                    <li key={lineIndex} className="text-muted-foreground ml-4">
                                      {line.substring(2)}
                                    </li>
                                  );
                                }
                                if (line.startsWith("✅") || line.startsWith("❌") || line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.") || line.startsWith("5.")) {
                                  return (
                                    <p key={lineIndex} className="text-muted-foreground">
                                      {line}
                                    </p>
                                  );
                                }
                                if (line.trim() === "") return null;
                                return (
                                  <p key={lineIndex} className="text-muted-foreground">
                                    {line.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
                                  </p>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Locked overlay message */}
                    {isLocked && (
                      <div className="mt-4 p-4 rounded-lg bg-coral/5 border border-coral/20">
                        <p className="text-sm text-coral">
                          🔒 Regístrate gratis para acceder a este capítulo
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isRegistered && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-coral/10 to-magenta/10 border border-coral/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Desbloquea los 8 capítulos
              </h2>
              <p className="text-muted-foreground mb-6">
                Accede a todo el contenido premium, plantillas y el plan de acción de 30 días.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-coral hover:opacity-90 text-white font-semibold py-6 px-8"
              >
                Registrarme gratis
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Registration Modal */}
      <GuideRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guideType="personal_brand"
        onSubmit={handleRegister}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
