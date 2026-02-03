import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Mail, MapPin, ArrowRight, Sparkles, Rocket } from "lucide-react";

export function Contact() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formState);
  };

  return (
    <section id="contacto" className="py-24 lg:py-32 relative overflow-hidden bg-[hsl(var(--surface-light))]">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--surface-light))] via-[hsl(240_10%_92%)] to-[hsl(var(--surface-light))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(15_95%_55%_/_0.08),_transparent_60%)]" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 right-[20%] w-20 h-20 bg-coral/30 rounded-3xl blur-sm"
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-40 left-[10%] w-16 h-16 bg-magenta/30 rounded-2xl blur-sm"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isHeaderInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-coral text-primary-foreground text-sm font-bold mb-6"
          >
            <Rocket className="w-4 h-4" />
            Let's Create
          </motion.div>
          
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            ¿Listo para{" "}
            <span className="text-gradient-sunset">transformar tu marca?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Cuéntanos tu visión y hagamos magia juntos. Respondemos en menos de 24 horas.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Contact Form - Takes 3 columns */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-[hsl(var(--background))] rounded-3xl p-8 lg:p-10 border border-[hsl(240_8%_30%)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral transition-colors"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral transition-colors"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-foreground mb-2">
                    Empresa / Marca
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral transition-colors"
                    placeholder="Nombre de tu empresa o marca"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                    ¿Cómo podemos ayudarte? *
                  </label>
                  <textarea
                    id="message"
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    rows={5}
                    className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral transition-colors resize-none"
                    placeholder="Cuéntanos sobre tu proyecto, tus objetivos, tus sueños más locos..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-coral text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Enviar mensaje
                  <Sparkles className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Quick Contact */}
            <div className="bg-[hsl(var(--background))] rounded-3xl p-6 border border-[hsl(240_8%_30%)]">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                Contacto directo
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:hola@kimedia.mx"
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary hover:bg-coral/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-coral" />
                  </div>
                  <span className="text-foreground group-hover:text-coral transition-colors font-medium">
                    hola@kimedia.mx
                  </span>
                </a>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary">
                  <div className="w-10 h-10 rounded-lg bg-magenta/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-magenta" />
                  </div>
                  <span className="text-muted-foreground">Ciudad de México</span>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-gradient-sunset rounded-3xl p-6 text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  ¿Prefieres WhatsApp?
                </h3>
                <p className="opacity-90 mb-6 text-sm">
                  Escríbenos directo y te respondemos en menos de 4 horas.
                </p>
                <a
                  href="https://wa.me/525573500846"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-background text-foreground px-5 py-3 rounded-xl font-bold hover:bg-foreground hover:text-background transition-colors text-sm"
                >
                  Enviar mensaje
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Fun fact */}
            <div className="bg-[hsl(var(--background))] rounded-3xl p-6 border border-[hsl(240_8%_30%)] text-center">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">Fun fact:</span> Respondemos el 90% de los mensajes en menos de 4 horas.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
