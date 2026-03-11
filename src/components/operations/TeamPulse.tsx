import { motion } from "framer-motion";
import { ActionItem, TeamMember } from "@/hooks/useOperationsData";

interface TeamPulseProps {
  items: ActionItem[];
  teamMembers: TeamMember[];
  onFilterByMember: (name: string | null) => void;
  activeMember: string | null;
}

const colorMap: Record<string, string> = {
  coral: "from-coral to-coral-light",
  magenta: "from-magenta to-[hsl(340,85%,60%)]",
  electric: "from-electric to-[hsl(55,100%,60%)]",
  cyan: "from-cyan to-[hsl(200,90%,55%)]",
  lime: "from-lime to-[hsl(100,85%,55%)]",
};

const TeamPulse = ({ items, teamMembers, onFilterByMember, activeMember }: TeamPulseProps) => {
  const coreTeam = teamMembers.filter(m => m.category === "core");

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Equipo</h3>
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterByMember(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !activeMember
              ? "bg-gradient-coral text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos
        </motion.button>
        {teamMembers.map(member => {
          const count = items.filter(i => i.responsible_name === member.full_name && i.status !== "completado").length;
          const isActive = activeMember === member.full_name;
          const gradient = colorMap[member.avatar_color] || colorMap.coral;

          return (
            <motion.button
              key={member.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterByMember(isActive ? null : member.full_name)}
              className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-gradient-to-r " + gradient + " text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
              <span className="truncate max-w-[100px]">{member.full_name}</span>
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-primary-foreground/20" : "bg-muted"
                }`}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TeamPulse;
