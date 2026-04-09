import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import {
  Armchair,
  Bed,
  Images,
  Landmark,
  Mail,
  type LucideIcon,
} from "lucide-react";

const SECTION_IDS = [
  "home",
  "about",
  "rooms",
  "venues",
  "services",
  "gallery",
  "reviews",
  "contact",
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("home");
  const navigate = useNavigate();
  const location = useLocation();

  const headerRef = useRef<HTMLElement>(null);
  const scrollingToRef = useRef<string | null>(null);
  const scrollTickRef = useRef<number>(0);

  const navLinks: {
    label: string;
    href: string;
    sectionId: string;
    Icon: LucideIcon;
  }[] = [
    { label: "Rooms", href: "#rooms", sectionId: "rooms", Icon: Bed },
    { label: "Venues", href: "#venues", sectionId: "venues", Icon: Landmark },
    {
      label: "Amenities",
      href: "#services",
      sectionId: "services",
      Icon: Armchair,
    },
    { label: "Gallery", href: "#gallery", sectionId: "gallery", Icon: Images },
    { label: "Contact", href: "#contact", sectionId: "contact", Icon: Mail },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const hash = location.hash.slice(1);
    if (hash && SECTION_IDS.includes(hash as (typeof SECTION_IDS)[number])) {
      setActiveSection(hash);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const HEADER_ACTIVE_LINE = 140;
    const computeActive = () => {
      if (scrollingToRef.current) return;
      const sections = SECTION_IDS.map((id) =>
        document.getElementById(id),
      ).filter((el): el is HTMLElement => el != null);
      if (sections.length === 0) return;
      let current: string | null = "home";
      for (const el of sections) {
        const top = el.getBoundingClientRect().top;
        if (top <= HEADER_ACTIVE_LINE) current = el.id;
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (scrollTickRef.current) cancelAnimationFrame(scrollTickRef.current);
      scrollTickRef.current = requestAnimationFrame(() => {
        scrollTickRef.current = 0;
        computeActive();
      });
    };
    const initId = requestAnimationFrame(() => computeActive());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initId);
      if (scrollTickRef.current) cancelAnimationFrame(scrollTickRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // GSAP: header entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!headerRef.current) return;
      gsap.fromTo(
        headerRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", overwrite: true },
      );
    });
    return () => ctx.revert();
  }, []);

  const bookNowHandler = () => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { openCheckIn: true } });
      return;
    }
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      const headerOffset = 72;
      const elementPosition = bookingSection.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, elementPosition - headerOffset), behavior: "smooth" });
    }
    window.dispatchEvent(new Event("open-checkin"));
  };

  const handleNavClick = (hash: string) => {
    setOpen(false);
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    setActiveSection(id);
    scrollingToRef.current = id;
    setTimeout(() => { scrollingToRef.current = null; }, 1600);

    const scrollToSection = () => {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 72;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - headerOffset, behavior: "smooth" });
      } else {
        window.location.hash = hash;
      }
    };

    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(scrollToSection, 350);
      return;
    }
    scrollToSection();
  };

  const isActive = (sectionId: string) =>
    activeSection !== null && activeSection === sectionId;

  const isHome = () => location.pathname === "/";

  return (
    <>
      <nav
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-200 flex items-center justify-between transition-all duration-400 ${
          scrolled
            ? "bg-dark/96 backdrop-blur-md py-3.5 px-6 lg:px-16 xl:px-20"
            : "bg-linear-to-b from-dark/70 to-transparent py-5 px-6 lg:px-16 xl:px-20"
        }`}
      >
        {/* Logo */}
        <button
          onClick={() =>
            isHome()
              ? window.scrollTo({ top: 0, behavior: "smooth" })
              : navigate("/")
          }
          className="flex items-center gap-2 cursor-pointer focus:outline-none z-210"
        >
          <img
            src="/brand-logo.webp"
            alt="Marcelino's Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="font-display text-xl font-normal text-cream tracking-[0.04em]">
            Marcelino's <span className="text-gold-light italic">Resort</span>
          </span>
        </button>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-9 list-none">
          {navLinks.map((item) => {
            const NavIcon = item.Icon;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  className={`relative flex items-center gap-2 text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 whitespace-nowrap bg-transparent border-none cursor-pointer ${
                    isActive(item.sectionId)
                      ? "text-gold-light"
                      : "text-cream/90 hover:text-gold-light"
                  }`}
                  aria-current={isActive(item.sectionId) ? "true" : undefined}
                >
                  <NavIcon
                    className="h-[15px] w-[15px] shrink-0 opacity-90"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {item.label}
                  <span
                    className={`absolute bottom-[-5px] left-0 h-[1.5px] bg-gold-light transition-all duration-300 ease-out ${
                      isActive(item.sectionId) ? "right-0" : "right-full"
                    }`}
                  />
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={bookNowHandler}
              className="bg-gold text-ink px-6 py-2.5 rounded-[3px] text-[13px] font-semibold tracking-widest uppercase transition-colors duration-300 hover:bg-gold-light border-none cursor-pointer min-h-[44px]"
            >
              Book Now
            </button>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8 bg-transparent border-none p-1 cursor-pointer z-210"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className={`block w-full h-[1.5px] bg-cream transition-transform duration-350 ease-out origin-center ${
              open ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-full h-[1.5px] bg-cream transition-all duration-300 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-full h-[1.5px] bg-cream transition-transform duration-350 ease-out origin-center ${
              open ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-190 bg-dark/98 flex flex-col items-center justify-center transition-opacity duration-350 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((item) => {
          const NavIcon = item.Icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="font-display text-[clamp(28px,7vw,44px)] font-light text-cream/80 py-4 tracking-[0.04em] transition-all duration-300 hover:text-gold-light hover:translate-x-1.5 bg-transparent border-none cursor-pointer flex items-center justify-center gap-4 text-center w-full max-w-sm"
            >
              <NavIcon
                className="h-8 w-8 shrink-0 text-gold-light/70"
                strokeWidth={1.5}
                aria-hidden
              />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={bookNowHandler}
          className="mt-8 bg-gold text-ink px-10 py-4 rounded-[3px] text-sm font-semibold tracking-[0.15em] uppercase cursor-pointer border-none transition-colors hover:bg-gold-light min-h-[52px]"
        >
          Book Now
        </button>
      </div>
    </>
  );
}
