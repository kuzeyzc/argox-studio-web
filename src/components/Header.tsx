import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface HeaderProps {
  onBookNow: () => void;
}

type NavLink = {
  label: string;
  path: string;
  hash?: string;
};

type NavDropdown = {
  label: string;
  items: NavLink[];
};

const navStructure = {
  simple: [
    { label: "Anasayfa", path: "/" },
    { label: "Sanatçılar", path: "/sanatcilar" },
    { label: "Oyna-Kazan", path: "/oyunlar" },
    {
      label: "Hizmetler",
      items: [
        { label: "Koleksiyon", path: "/koleksiyon" },
        { label: "Piercing", path: "/piercing" },
      ],
    } as NavDropdown,
    {
      label: "Stüdyo",
      items: [
        { label: "Hakkımızda", path: "/hakkimizda" },
        { label: "Hizmetlerimiz", path: "/hizmetler" },
        { label: "Dövme'nin Tarihçesi", path: "/tarihce" },
      ],
    } as NavDropdown,
    { label: "İletişim", path: "/", hash: "iletisim" },
  ],
};

const isDropdown = (item: NavLink | NavDropdown): item is NavDropdown =>
  "items" in item;

const Header = ({ onBookNow }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSlim, setIsSlim] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const pathname = location.pathname;
  const hash = location.hash?.slice(1) || "";

  const isLinkActive = (link: NavLink) => {
    const href = link.hash ? `${link.path}#${link.hash}` : link.path;
    return link.hash
      ? pathname === link.path && hash === link.hash
      : pathname === link.path;
  };

  const isDropdownActive = (dropdown: NavDropdown) =>
    dropdown.items.some(isLinkActive);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
  }, [isDark]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSlim(window.scrollY > 48);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 glass transition-all duration-300 ${
        isSlim ? "py-0" : ""
      }`}
    >
      <div
        className={`container mx-auto flex items-center justify-between transition-all duration-300 ${
          isSlim ? "h-12" : "h-16"
        }`}
        style={{ paddingLeft: "clamp(1rem, 2vw, 2rem)", paddingRight: "clamp(1rem, 2vw, 2rem)" }}
      >
        <Link
          to="/"
          className={`font-heading font-bold tracking-widest text-foreground transition-all duration-300 ${
            isSlim ? "text-lg" : "text-xl"
          }`}
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }}
        >
          ARGO<span className="text-primary">X</span>
        </Link>

        {/* Desktop nav */}
        <nav
          ref={dropdownRef}
          className="hidden lg:flex items-center gap-4 xl:gap-5"
        >
          {navStructure.simple.map((item) => {
            if (isDropdown(item)) {
              const isOpen = openDropdown === item.label;
              const active = isDropdownActive(item);
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(isOpen ? null : item.label)
                    }
                    className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 pt-2 -translate-x-2"
                      >
                        <div className="nav-dropdown-panel min-w-[180px] py-2 rounded-lg border border-primary/20 shadow-xl">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.path + (sub.hash ?? "")}
                              to={sub.hash ? `${sub.path}#${sub.hash}` : sub.path}
                              className={`block px-4 py-2 text-sm font-medium transition-colors ${
                                isLinkActive(sub)
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            const link = item as NavLink;
            const href = link.hash ? `${link.path}#${link.hash}` : link.path;
            const isActive = isLinkActive(link);
            return (
              <Link
                key={link.path + (link.hash ?? "")}
                to={href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            aria-label="Tema değiştir"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={onBookNow}
            className="bg-primary text-primary-foreground px-4 py-2 text-xs sm:text-sm font-heading font-bold tracking-wider hover:brightness-110 transition-all shrink-0"
          >
            RANDEVU AL
          </button>
          <button
            className="lg:hidden text-foreground p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu - Accordion */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden glass overflow-hidden border-t border-border/50"
          >
            <nav className="p-4" style={{ padding: "clamp(1rem, 2vw, 2rem)" }}>
              <div className="flex flex-col gap-1">
                {/* Anasayfa */}
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 px-3 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/" && !hash
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  Anasayfa
                </Link>

                {/* Sanatçılar */}
                <Link
                  to="/sanatcilar"
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 px-3 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/sanatcilar"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  Sanatçılar
                </Link>

                {/* Oyna-Kazan */}
                <Link
                  to="/oyunlar"
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 px-3 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/oyunlar"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  Oyna-Kazan
                </Link>

                {/* Hizmetler - Accordion */}
                <Collapsible className="w-full">
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors [&[data-state=open]]:text-primary [&>svg]:transition-transform [&[data-state=open]>svg]:rotate-180">
                    Hizmetler
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="flex flex-col pl-4 gap-1 pb-2">
                      <Link
                        to="/koleksiyon"
                        onClick={() => setMobileOpen(false)}
                        className={`py-2 px-3 text-sm rounded-md ${
                          pathname === "/koleksiyon"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        Koleksiyon
                      </Link>
                      <Link
                        to="/piercing"
                        onClick={() => setMobileOpen(false)}
                        className={`py-2 px-3 text-sm rounded-md ${
                          pathname === "/piercing"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        Piercing
                      </Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Stüdyo - Accordion */}
                <Collapsible className="w-full">
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors [&[data-state=open]]:text-primary [&>svg]:transition-transform [&[data-state=open]>svg]:rotate-180">
                    Stüdyo
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="flex flex-col pl-4 gap-1 pb-2">
                      <Link
                        to="/hakkimizda"
                        onClick={() => setMobileOpen(false)}
                        className={`py-2 px-3 text-sm rounded-md ${
                          pathname === "/hakkimizda"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        Hakkımızda
                      </Link>
                      <Link
                        to="/hizmetler"
                        onClick={() => setMobileOpen(false)}
                        className={`py-2 px-3 text-sm rounded-md ${
                          pathname === "/hizmetler"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        Hizmetlerimiz
                      </Link>
                      <Link
                        to="/tarihce"
                        onClick={() => setMobileOpen(false)}
                        className={`py-2 px-3 text-sm rounded-md ${
                          pathname === "/tarihce"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        Dövme'nin Tarihçesi
                      </Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* İletişim */}
                <Link
                  to="/#iletisim"
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 px-3 text-sm font-medium rounded-md transition-colors ${
                    hash === "iletisim"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  İletişim
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
