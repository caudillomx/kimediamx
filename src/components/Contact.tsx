import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

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
    // Handle form submission
    console.log("Form submitted:", formState);
  };

  return (
    <section id="contacto" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-glow opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-coral text-sm font-medium uppercase tracking-wider mb-4 block">
            Contacto
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            ¿Listo para{" "}
            <span className="text-gradient">transformar tu marca?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Cuéntanos sobre tu proyecto y te responderemos en menos de 24 horas
            con una propuesta personalizada.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  id="company"
                  value={formState.company}
                  onChange={(e) =>
                    setFormState({ ...formState, company: e.target.value })
                  }
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all"
                  placeholder="Nombre de tu empresa"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  rows={5}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all resize-none"
                  placeholder="Cuéntanos sobre tu proyecto, tus objetivos y cómo podemos ayudarte..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-coral text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
              >
                Enviar mensaje
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Info Cards */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">
                Información de contacto
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:hola@kimedia.mx"
                  className="flex items-center gap-4 text-muted-foreground hover:text-coral transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center group-hover:bg-coral/20 transition-colors">
                    <Mail className="w-5 h-5 text-coral" />
                  </div>
                  <span>hola@kimedia.mx</span>
                </a>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-coral" />
                  </div>
                  <span>Ciudad de México, México</span>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-coral rounded-2xl p-8 text-primary-foreground">
              <h3 className="font-display text-xl font-bold mb-3">
                ¿Prefieres una llamada?
              </h3>
              <p className="opacity-90 mb-6">
                Agenda una videollamada de 30 minutos sin compromiso para 
                discutir tu proyecto y cómo podemos ayudarte.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-foreground hover:text-background transition-colors"
              >
                Agendar llamada
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
