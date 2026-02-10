import { motion } from "framer-motion";

interface StateData {
  state: string;
  count: number;
}

interface MexicoMapProps {
  stateData: StateData[];
}

// Simplified SVG paths for Mexican states (approximate centroids for labels)
const stateCoords: Record<string, { x: number; y: number }> = {
  "Aguascalientes": { x: 230, y: 290 },
  "Baja California": { x: 50, y: 100 },
  "Baja California Sur": { x: 80, y: 220 },
  "Campeche": { x: 430, y: 340 },
  "Chiapas": { x: 420, y: 410 },
  "Chihuahua": { x: 160, y: 150 },
  "Ciudad de México": { x: 300, y: 340 },
  "Coahuila": { x: 220, y: 170 },
  "Colima": { x: 210, y: 340 },
  "Durango": { x: 190, y: 230 },
  "Estado de México": { x: 290, y: 330 },
  "Guanajuato": { x: 260, y: 300 },
  "Guerrero": { x: 280, y: 380 },
  "Hidalgo": { x: 300, y: 305 },
  "Jalisco": { x: 220, y: 310 },
  "Michoacán": { x: 250, y: 345 },
  "Morelos": { x: 300, y: 350 },
  "Nayarit": { x: 195, y: 280 },
  "Nuevo León": { x: 270, y: 190 },
  "Oaxaca": { x: 350, y: 390 },
  "Puebla": { x: 320, y: 340 },
  "Querétaro": { x: 270, y: 295 },
  "Quintana Roo": { x: 480, y: 330 },
  "San Luis Potosí": { x: 260, y: 260 },
  "Sinaloa": { x: 165, y: 250 },
  "Sonora": { x: 110, y: 130 },
  "Tabasco": { x: 410, y: 360 },
  "Tamaulipas": { x: 300, y: 210 },
  "Tlaxcala": { x: 315, y: 325 },
  "Veracruz": { x: 350, y: 320 },
  "Yucatán": { x: 460, y: 300 },
  "Zacatecas": { x: 220, y: 260 },
};

function getColor(count: number): string {
  if (count === 0) return "hsl(240 8% 18%)";
  if (count <= 2) return "hsl(15 95% 55% / 0.3)";
  if (count <= 5) return "hsl(15 95% 55% / 0.5)";
  if (count <= 10) return "hsl(15 95% 55% / 0.7)";
  return "hsl(15 95% 55%)";
}

export function MexicoMap({ stateData }: MexicoMapProps) {
  const dataMap = new Map(stateData.map((d) => [d.state, d.count]));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg viewBox="0 0 540 470" className="w-full h-auto">
        {Object.entries(stateCoords).map(([state, coords]) => {
          const count = dataMap.get(state) || 0;
          return (
            <motion.g key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <circle
                cx={coords.x}
                cy={coords.y}
                r={count > 0 ? Math.min(8 + count * 2, 24) : 6}
                fill={getColor(count)}
                stroke="hsl(15 95% 55% / 0.4)"
                strokeWidth={count > 0 ? 1.5 : 0.5}
              />
              {count > 0 && (
                <text
                  x={coords.x}
                  y={coords.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {count}
                </text>
              )}
              <title>{`${state}: ${count} participante${count !== 1 ? "s" : ""}`}</title>
            </motion.g>
          );
        })}
        {/* Mexico outline hint */}
        <text x="270" y="460" textAnchor="middle" fill="hsl(240 5% 40%)" fontSize="10">
          Mapa de participantes por estado
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(240 8% 18%)" }} />
          <span>Sin participantes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(15 95% 55% / 0.5)" }} />
          <span>1-5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(15 95% 55%)" }} />
          <span>10+</span>
        </div>
      </div>
    </div>
  );
}
