import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "home" },
  { label: "Story", href: "story" },
  { label: "Solutions", href: "solutions" },
  { label: "Process", href: "process" },
  { label: "Portfolio", href: "portfolio" },
  { label: "Stats", href: "stats" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      const ids = navLinks.map((l) => l.href);
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 rounded-[2rem] ${
        scrolled 
          ? "bg-white/95 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-white/50" 
          : "bg-white/20 backdrop-blur-md shadow-sm border border-white/30"
      }`}
    >
      <div 
        className={`w-full px-6 md:px-8 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-[70px]" : "h-[90px]"
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => scrollTo("home")}
          className={`font-black text-gray-900 tracking-tight transition-all duration-300 ${
            scrolled ? "text-xl scale-95" : "text-3xl scale-100"
          }`}
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          iDEED
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className={`relative px-4 py-2 text-sm transition-colors group overflow-hidden ${
                  isActive ? "text-blue-700 font-bold" : "text-gray-700 hover:text-black font-medium"
                }`}
              >
                {link.label}
                {isActive ? (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-1 left-4 right-4 h-[2px] bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                ) : (
                  <div className="absolute bottom-1 left-0 w-full h-[2px] bg-gray-900 transform scale-x-0 group-hover:scale-x-50 origin-center transition-transform duration-300 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollTo("contact")}
            className="px-6 py-2.5 rounded-full bg-blue-600/90 backdrop-blur-sm text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.3)] border border-blue-400/30"
          >
            Start Your Project
          </motion.button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-gray-800 hover:text-black hover:bg-white/20 rounded-full transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="md:hidden absolute top-[115%] left-0 right-0 bg-white/60 backdrop-blur-3xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="px-4 py-5 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className={`text-left px-5 py-3 rounded-2xl text-base transition-all ${
                    activeSection === link.href
                      ? "text-blue-700 font-bold bg-white/50 shadow-sm border border-white/60"
                      : "text-gray-700 hover:text-gray-900 font-medium hover:bg-white/30"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 pb-1 px-1">
                <button
                  onClick={() => scrollTo("contact")}
                  className="w-full py-4 rounded-2xl bg-blue-600/90 text-white text-base font-bold text-center shadow-[0_4px_14px_rgba(37,99,235,0.3)] border border-blue-400/30 backdrop-blur-md"
                >
                  Start Your Project
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
