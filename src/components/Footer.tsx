import { Instagram, Linkedin, Youtube, Twitter } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/kimedia.mx", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/kimedia", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@kimedia", label: "YouTube" },
  { icon: Twitter, href: "https://twitter.com/kimedia_mx", label: "Twitter" },
];

const footerLinks = [
  {
    title: "Servicios",
    links: [
      { label: "Análisis Digital", href: "#metodologia" },
      { label: "Estrategia", href: "#metodologia" },
      { label: "Performance Ads", href: "#metodologia" },
      { label: "Producción", href: "#metodologia" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Nosotros", href: "#equipo" },
      { label: "Metodología", href: "#metodologia" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-coral rounded-lg flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-xl">Ki</span>
              </div>
              <span className="font-display font-semibold text-xl text-foreground">media</span>
            </a>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Agencia digital especializada en análisis, estrategia, 
              performance marketing y producción audiovisual.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-coral hover:bg-coral/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-semibold text-foreground mb-4">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground text-sm hover:text-coral transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} KiMedia. Todos los derechos reservados.
          </p>
          <p className="text-muted-foreground text-sm">
            To be known. 🚀
          </p>
        </div>
      </div>
    </footer>
  );
}
