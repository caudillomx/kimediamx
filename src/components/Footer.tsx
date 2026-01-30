import { Instagram, Facebook, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// TikTok icon (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/kimediamx", label: "Instagram", color: "hover:text-magenta" },
  { icon: Facebook, href: "https://www.facebook.com/kimediamx", label: "Facebook", color: "hover:text-cyan" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@kimediamx", label: "TikTok", color: "hover:text-coral" },
];

export function Footer() {
  return (
    <footer className="relative bg-card border-t border-border overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-coral/50 to-transparent" />
      
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-coral rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="font-display font-bold text-primary-foreground text-2xl">Ki</span>
              </div>
              <span className="font-display font-bold text-2xl text-foreground">media</span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Agencia digital creativa especializada en análisis, estrategia, 
              performance marketing y producción audiovisual.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground ${social.color} transition-colors`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-coral" />
              Explora
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Metodología", href: "#metodologia" },
                { label: "Servicios", href: "#servicios" },
                { label: "Equipo", href: "#equipo" },
                { label: "Contacto", href: "#contacto" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-coral transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric" />
              Servicios
            </h4>
            <ul className="space-y-3">
              {[
                "Análisis Digital",
                "Estrategia",
                "Performance Ads",
                "Producción Audiovisual",
              ].map((service) => (
                <li key={service}>
                  <a
                    href="#metodologia"
                    className="text-muted-foreground hover:text-coral transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-electric opacity-0 group-hover:opacity-100 transition-opacity" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} KiMedia. Todos los derechos reservados.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Hecho con <Heart className="w-4 h-4 text-coral fill-coral" /> en CDMX
            <span className="text-coral font-bold">• To be known 🚀</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
