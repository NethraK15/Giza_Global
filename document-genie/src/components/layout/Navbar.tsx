import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, FileText } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-border/80 glass supports-[backdrop-filter]:bg-background/85"
    >
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
          <div className="gradient-primary rounded-xl p-2 shadow-sm">
            <FileText aria-hidden="true" className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="tracking-tight">Giza Global</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                location.pathname === link.to
                  ? "text-foreground bg-accent shadow-sm"
                  : "text-foreground/80 dark:text-foreground/85 hover:text-foreground hover:bg-accent/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle className="h-9 w-9 rounded-full border-border/80 bg-background/90" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/auth?tab=signup">Start Free Trial</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation-menu"
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-border/80 bg-background/95 overflow-hidden"
          >
            <div className="p-4 space-y-1">
              <div className="mb-3 flex justify-end">
                <ThemeToggle className="h-9 w-9 rounded-full border-border/80 bg-background/90" />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    location.pathname === link.to
                      ? "text-foreground bg-accent"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/70"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-3 border-t mt-3">
                <Button variant="outline" className="flex-1" size="sm" asChild>
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>Log in</Link>
                </Button>
                <Button variant="default" className="flex-1" size="sm" asChild>
                  <Link to="/auth?tab=signup" onClick={() => setMobileOpen(false)}>Start Free</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
