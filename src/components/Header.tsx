import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { href: "metodologia", label: "Metodología" },
  { href: "servicios", label: "Servicios" },
  { href: "equipo", label: "Equipo" },
  { href: "contacto", label: "Contacto" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getNavHref = (sectionId: string) => {
    return isHomePage ? `#${sectionId}` : `/#${sectionId}`;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto px-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-10 h-10 bg-gradient-coral rounded-xl flex items-center justify-center shadow-glow/50"
            >
              <span className="font-display font-bold text-primary-foreground text-lg">Ki</span>
            </motion.div>
            <span className="font-display font-bold text-xl text-foreground">media</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={getNavHref(link.href)}
                className="relative text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium text-sm group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-coral group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <a
              href={getNavHref("contacto")}
              className="group flex items-center gap-2 bg-gradient-coral text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              Hablemos
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={getNavHref(link.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-coral transition-colors py-2 font-medium text-lg"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href={getNavHref("contacto")}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-gradient-coral text-primary-foreground px-6 py-4 rounded-xl font-bold mt-2"
              >
                <Sparkles className="w-4 h-4" />
                Hablemos
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
