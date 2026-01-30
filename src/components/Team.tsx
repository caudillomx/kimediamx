import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Linkedin, Twitter } from "lucide-react";

const team = [
  {
    name: "Jesús Caudillo",
    role: "Founder & Executive Director",
    focus: "Strategy, Vision and Product Direction",
    description:
      "Lidera la visión general, dirección estratégica y arquitectura de proyectos. Define ecosistemas digitales y decisiones de alto nivel.",
    initials: "JC",
  },
  {
    name: "Sandra Doroteo",
    role: "Digital Strategy & Operations Lead",
    focus: "Strategy Implementation and Execution",
    description:
      "Diseña y ejecuta estrategias digitales, supervisa implementación de campañas y coordina entregables entre proyectos.",
    initials: "SD",
  },
  {
    name: "Ana Sofía Roces",
    role: "Operations Coordinator",
    focus: "Logistics and Project Support",
    description:
      "Soporta coordinación interna, tiempos, logística y comunicación cross-team. Mantiene estabilidad en flujos de trabajo.",
    initials: "AR",
  },
  {
    name: "Ulises Jurado",
    role: "Performance Marketing & Ads Specialist",
    focus: "Paid Media Optimization",
    description:
      "Lidera campañas de paid media, estrategia publicitaria y optimización de performance en todas las plataformas.",
    initials: "UJ",
  },
  {
    name: "David Pantoja",
    role: "Audiovisual Production Lead",
    focus: "Video and Multimedia Production",
    description:
      "Produce y dirige contenido audiovisual, incluyendo filmación, edición y assets multimedia para campañas.",
    initials: "DP",
  },
  {
    name: "Yair Castaldi",
    role: "Visual Creative & Designer",
    focus: "Graphic Design and Visual Identity",
    description:
      "Desarrolla conceptos visuales, elementos de branding y assets gráficos. Contribuye a dirección creativa y storytelling visual.",
    initials: "YC",
  },
];

function TeamCard({ member, index }: { member: typeof team[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-card rounded-2xl p-6 border border-border h-full hover:border-coral/30 transition-all duration-500 flex flex-col">
        {/* Avatar */}
        <div className="mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center">
            <span className="font-display text-xl font-bold text-primary-foreground">
              {member.initials}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            {member.name}
          </h3>
          <p className="text-coral text-sm font-medium mb-1">{member.role}</p>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3">
            {member.focus}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {member.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Team() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="equipo" className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-coral text-sm font-medium uppercase tracking-wider mb-4 block">
            Nuestro Equipo
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Profesionales que{" "}
            <span className="text-gradient">hacen la diferencia</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Un equipo multidisciplinario con experiencia en estrategia, 
            performance, creatividad y producción audiovisual.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <TeamCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
