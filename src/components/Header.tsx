import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";

const SECTION_IDS = [
  "home",
  "about",
  "rooms",
  "venues",
  "services",
  "gallery",
  "reviews",
  "faq",
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("home");
  const navigate = useNavigate();
  const location = useLocation();

  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const desktopLinksRef = useRef<HTMLButtonElement[]>([]);
  const mobileLinksRef = useRef<HTMLButtonElement[]>([]);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  /** While set, scroll-spy won't override activeSection (avoids glitch during nav click scroll) */
  const scrollingToRef = useRef<string | null>(null);
  const scrollTickRef = useRef<number>(0);

  const navLinks = [
    { label: "Home", href: "#home", sectionId: "home" },
    { label: "About", href: "#about", sectionId: "about" },
    { label: "Rooms", href: "#rooms", sectionId: "rooms" },
    { label: "Venues", href: "#venues", sectionId: "venues" },
    { label: "Services", href: "#services", sectionId: "services" },
    { label: "Gallery", href: "#gallery", sectionId: "gallery" },
    { label: "Reviews", href: "#reviews", sectionId: "reviews" },
    { label: "FAQ", href: "#faq", sectionId: "faq" },
  ];

  // GSAP: header entrance animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!headerRef.current) return;
      gsap.fromTo(
        headerRef.current,
        { y: -80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          overwrite: true,
        },
      );
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.15,
            ease: "power2.out",
            overwrite: true,
          },
        );
      }
      if (desktopNavRef.current) {
        const links = desktopLinksRef.current.filter(Boolean);
        if (links.length) {
          gsap.fromTo(
            links,
            { y: -12, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.04,
              delay: 0.25,
              ease: "power2.out",
              overwrite: true,
            },
          );
        }
      }
    });
    return () => ctx.revert();
  }, []);

  // Sync active section when landing on / with hash (e.g. /#faq)
  useEffect(() => {
    if (location.pathname !== "/") return;
    const hash = location.hash.slice(1);
    if (hash && SECTION_IDS.includes(hash as (typeof SECTION_IDS)[number])) {
      setActiveSection(hash);
    }
  }, [location.pathname, location.hash]);

  // Scroll spy: one stable source of truth (section whose top is just past a line)
  // Avoids IntersectionObserver flicker and conflict with scroll listener
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const HEADER_ACTIVE_LINE = 140; // px from top; section "active" when its top is above this

    const computeActive = () => {
      if (scrollingToRef.current) return; // don't override while user clicked a nav link
      const sections = SECTION_IDS.map((id) =>
        document.getElementById(id),
      ).filter((el): el is HTMLElement => el != null);
      if (sections.length === 0) return;
      // Last section (in DOM order) whose top is at or above HEADER_ACTIVE_LINE
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

    // Initial run after a frame so DOM is ready
    const initId = requestAnimationFrame(() => {
      computeActive();
    });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(initId);
      if (scrollTickRef.current) cancelAnimationFrame(scrollTickRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.pathname]);

  // GSAP: mobile dropdown expand/collapse + stagger (inline, no overlay)
  useEffect(() => {
    const wrapper = mobileDropdownRef.current;
    const panel = mobilePanelRef.current;
    if (!wrapper || !panel) return;

    if (open) {
      gsap.set(wrapper, { overflow: "hidden" });
      const height = panel.scrollHeight;
      gsap.fromTo(
        wrapper,
        { maxHeight: 0 },
        {
          maxHeight: height,
          duration: 0.45,
          ease: "power3.out",
          overwrite: true,
        },
      );
      const links = mobileLinksRef.current.filter(Boolean);
      gsap.fromTo(
        links,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.04,
          delay: 0.1,
          ease: "power2.out",
          overwrite: true,
        },
      );
    } else {
      gsap.to(wrapper, {
        maxHeight: 0,
        duration: 0.35,
        ease: "power2.in",
        overflow: "hidden",
        overwrite: true,
      });
    }
  }, [open]);

  const bookNowHandler = () => {
    setOpen(false);
    const event = new Event("open-checkin");
    window.dispatchEvent(event);
  };

  const handleNavClick = (hash: string) => {
    setOpen(false);
    const id = hash.startsWith("#") ? hash.slice(1) : hash;

    // Show this section as active immediately and ignore scroll-spy until scroll settles
    setActiveSection(id);
    scrollingToRef.current = id;
    const clearScrollingRef = () => {
      scrollingToRef.current = null;
    };
    setTimeout(clearScrollingRef, 1600);

    const scrollToSection = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const activeLinkClass =
    "text-yellow-600 font-semibold border-b-2 border-yellow-500 border-solid";

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-1200 w-full border-b bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-8">
        <button
          ref={logoRef}
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded-md transition-transform active:scale-[0.98]">
          <img
            src="/brand-logo.webp"
            alt="Marcelino's Logo"
            className="h-15 w-15 object-contain"
          />
          <div className="ml-2 leading-tight">
            <div className="text-[20px] font-extrabold tracking-widest text-green-900 font-serif">
              MARCELINO'S
            </div>
            <div className="text-sm tracking-widest font-medium">
              RESORT AND HOTEL
            </div>
          </div>
        </button>

        <nav ref={desktopNavRef} className="hidden items-center gap-8 md:flex">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-4">
              {navLinks.map((item, i) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink asChild>
                    <button
                      ref={(el) => {
                        if (el) desktopLinksRef.current[i] = el;
                      }}
                      onClick={() => handleNavClick(item.href)}
                      className={`text-base font-medium transition-colors hover:text-yellow-600 pb-0.5 border-b-2 border-transparent ${
                        isActive(item.sectionId)
                          ? activeLinkClass
                          : "text-black"
                      }`}
                      aria-current={
                        isActive(item.sectionId) ? "true" : undefined
                      }>
                      {item.label}
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            className="text-white font-semibold bg-yellow-500 transition-transform active:scale-[0.98]"
            onClick={bookNowHandler}>
            Book Now
          </Button>
        </nav>

        {/* Mobile: hamburger + inline dropdown (pushes content, no overlay) */}
        <div className="flex md:hidden items-center">
          <Button
            variant="ghost"
            className="hover:bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0 rounded-md transition-transform active:scale-95"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-7" /> : <Menu className="size-7" />}
          </Button>
        </div>
      </div>

      {/* Inline mobile nav: expands below header, no overlap */}
      <div
        ref={mobileDropdownRef}
        className="md:hidden max-h-0 overflow-hidden border-t border-green-100/80 bg-white/98 shadow-sm"
        aria-hidden={!open}
        data-state={open ? "open" : "closed"}>
        <div ref={mobilePanelRef} className="px-4 pb-4">
          <nav className="flex flex-col items-stretch gap-0.5 pt-2 max-h-[70vh] overflow-y-auto">
            {navLinks.map((item, i) => (
              <button
                key={item.label}
                ref={(el) => {
                  if (el) mobileLinksRef.current[i] = el;
                }}
                onClick={() => handleNavClick(item.href)}
                className={`py-3 px-4 text-left text-lg font-medium rounded-lg border-l-4 border-transparent transition-colors hover:bg-green-50 hover:text-yellow-700 active:bg-green-100 touch-manipulation ${
                  isActive(item.sectionId)
                    ? "text-yellow-600 font-semibold bg-green-50/80 border-yellow-500"
                    : "text-black"
                }`}
                aria-current={isActive(item.sectionId) ? "true" : undefined}>
                {item.label}
              </button>
            ))}
            <div className="pt-4 mt-2 border-t border-green-100">
              <Button
                className="w-full bg-yellow-500 text-white font-semibold hover:bg-yellow-600 py-6 text-base rounded-lg transition-transform active:scale-[0.98]"
                onClick={bookNowHandler}>
                Book Now
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
