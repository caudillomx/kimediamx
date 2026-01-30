import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Linkedin, Twitter, Instagram } from "lucide-react";

const team = [
  {
    name: "Jesús Caudillo",
    role: "Founder & Executive Director",
    focus: "Strategy & Vision",
    description: "Lidera la visión general, dirección estratégica y arquitectura de proyectos digitales.",
    initials: "JC",
    color: "coral",
  },
  {
    name: "Sandra Doroteo",
    role: "Digital Strategy Lead",
    focus: "Strategy & Execution",
    description: "Diseña y ejecuta estrategias digitales, supervisa implementación de campañas.",
    initials: "SD",
    color: "magenta",
  },
  {
    name: "Ana Sofía Roces",
    role: "Operations Coordinator",
    focus: "Project Support",
    description: "Soporta coordinación interna, tiempos, logística y comunicación cross-team.",
    initials: "AR",
    color: "electric",
  },
  {
    name: "Ulises Jurado",
    role: "Performance Specialist",
    focus: "Paid Media",
    description: "Lidera campañas de paid media, estrategia publicitaria y optimización de performance.",
    initials: "UJ",
    color: "cyan",
  },
  {
    name: "David Pantoja",
    role: "Audiovisual Lead",
    focus: "Video Production",
    description: "Produce y dirige contenido audiovisual, filmación, edición y assets multimedia.",
    initials: "DP",
    color: "lime",
  },
  {
    name: "Yair Castaldi",
    role: "Creative Designer",
    focus: "Visual Identity",
    description: "Desarrolla conceptos visuales, branding y assets gráficos con storytelling visual.",
    initials: "YC",
    color: "coral",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  coral: { bg: "bg-coral", border: "border-coral/30", text: "text-coral" },
  magenta: { bg: "bg-magenta", border: "border-magenta/30", text: "text-magenta" },
  electric: { bg: "bg-electric", border: "border-electric/30", text: "text-electric" },
  cyan: { bg: "bg-cyan", border: "border-cyan/30", text: "text-cyan" },
  lime: { bg: "bg-lime", border: "border-lime/30", text: "text-lime" },
};

function TeamCard({ member, index }: { member: typeof team[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const colors = colorMap[member.color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotateY: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="relative bg-card rounded-3xl p-6 border border-border h-full overflow-hidden transition-all duration-500 hover:border-coral/30 hover:shadow-glow/10">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Avatar */}
          <div className="mb-5">
            <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              <span className="font-display text-xl font-bold text-background">
                {member.initials}
              </span>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-coral transition-colors">
              {member.name}
            </h3>
            <p className={`text-sm font-semibold ${colors.text} mb-1`}>{member.role}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-medium">
              {member.focus}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {member.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Team() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="equipo" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -right-32 w-64 h-64 rounded-full border border-coral/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full border border-magenta/10"
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
          <span className="inline-block px-4 py-2 rounded-full bg-magenta/10 border border-magenta/30 text-magenta text-sm font-bold mb-6">
            ✨ El Equipo
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            Creativos que{" "}
            <span className="text-gradient-sunset">hacen magia</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Un equipo multidisciplinario apasionado por transformar marcas.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <TeamCard key={member.name} member={member} index={index} />
          ))}
        </div>

        {/* Join us CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">¿Quieres ser parte del equipo?</p>
          <a
            href="mailto:hola@kimedia.mx"
            className="inline-flex items-center gap-2 text-coral font-semibold hover:underline"
          >
            Envíanos tu portafolio →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
