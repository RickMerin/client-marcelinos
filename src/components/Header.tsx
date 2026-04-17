import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { House, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartDates, setCartDates] = useState<{
    checkIn?: string;
    checkOut?: string;
  } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [visibleCartCount, setVisibleCartCount] = useState(6);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateCartCount = () => {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItems(items);
      const totalCount = items.reduce(
        (acc: number, item: any) => acc + (item.quantity || 0),
        0,
      );
      setCartCount(totalCount);

      try {
        const resDate = JSON.parse(
          localStorage.getItem("reservationDate") || "{}",
        );
        if (resDate.check_in && resDate.check_out) {
          setCartDates({
            checkIn: resDate.check_in,
            checkOut: resDate.check_out,
          });
        } else {
          setCartDates(null);
        }
      } catch (e) {
        setCartDates(null);
      }
    };

    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);
  useEffect(() => {
    if (!isCartOpen) return;
    setVisibleCartCount(6);
    const timer = window.setTimeout(() => {
      setVisibleCartCount((prev) => Math.min(prev + 6, cartItems.length));
    }, 140);
    return () => window.clearTimeout(timer);
  }, [isCartOpen, cartItems.length]);

  const removeItem = (id: number, itemType: string) => {
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const newItems = items.filter(
      (i: any) => !(i.id === id && i.itemType === itemType),
    );
    localStorage.setItem("cartItems", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const headerRef = useRef<HTMLElement>(null);
  const scrollingToRef = useRef<string | null>(null);
  const scrollTickRef = useRef<number>(0);

  const navLinks: {
    label: string;
    href: string;
    sectionId: string;
  }[] = [
    { label: "About Us", href: "#about", sectionId: "about" },
    { label: "Rooms", href: "#rooms", sectionId: "rooms" },
    { label: "Venues", href: "#venues", sectionId: "venues" },
    {
      label: "Services",
      href: "#services",
      sectionId: "services",
    },
    { label: "Gallery", href: "#gallery", sectionId: "gallery" },
    { label: "Contact", href: "#contact", sectionId: "contact" },
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // GSAP: header entrance
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
      const elementPosition =
        bookingSection.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - headerOffset),
        behavior: "smooth",
      });
    }
    window.dispatchEvent(new Event("open-checkin"));
  };

  const proceedToBookNow = () => {
    setIsCartOpen(false);
    bookNowHandler();
  };

  const handleNavClick = (hash: string) => {
    setOpen(false);
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    setActiveSection(id);
    scrollingToRef.current = id;
    setTimeout(() => {
      scrollingToRef.current = null;
    }, 1600);

    const scrollToSection = () => {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 72;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: "smooth",
        });
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
  const renderedCartItems = cartItems.slice(0, visibleCartCount);
  const hasMoreCartItems = visibleCartCount < cartItems.length;
  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce((total, item: any) => {
        const quantity = Number(item?.quantity) || 0;
        const price = Number(item?.price) || 0;
        return total + quantity * price;
      }, 0),
    [cartItems],
  );

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
          className="flex items-center gap-1 cursor-pointer focus:outline-none z-210"
        >
          <img
            src="/brand-logo.webp"
            alt="Marcelino's Logo"
            className="h-12 w-12 object-contain"
          />
          <div className="ml-1 mt-1 leading-tight inline-block">
            <div className="text-xs -mb-0.75 font-extrabold tracking-widest text-cream font-serif">
              MARCELINO'S
            </div>
            <div className="text-xs text-gold-light tracking-[0.15em] font-medium w-full text-center">
              RESORT HOTEL
            </div>
          </div>
        </button>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-9 list-none">
          {navLinks.map((item) => {
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  className={`relative flex items-center text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 whitespace-nowrap bg-transparent border-none cursor-pointer ${
                    isActive(item.sectionId)
                      ? "text-gold-light"
                      : "text-cream/90 hover:text-gold-light"
                  }`}
                  aria-current={isActive(item.sectionId) ? "true" : undefined}
                >
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
          <li className="relative flex items-center">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="relative text-cream/90 hover:text-gold-light transition-colors duration-300 cursor-pointer"
                  aria-label="View Cart"
                >
                  <House className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full max-w-[100vw] sm:max-w-lg bg-cream overflow-y-auto z-[9999] flex flex-col p-0 border-l border-sand-dark/60"
              >
                <SheetHeader className="px-6 py-5 border-b border-sand-dark/50 sticky top-0 bg-cream z-10 text-left gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <SheetTitle className="font-display text-2xl font-semibold text-ink m-0">
                    Selected spaces
                    </SheetTitle>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="p-1.5 -mr-1.5 text-ink-soft hover:text-ink rounded-full hover:bg-sand transition-all cursor-pointer flex-shrink-0"
                      aria-label="Close cart"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft m-0">
                      {cartCount} {cartCount === 1 ? "item" : "items"}
                    </p>
                    {cartItems.length > 0 && (
                      <span className="inline-flex items-center rounded-full border border-sand-dark/60 bg-sand px-2.5 py-1 text-xs font-semibold text-ink-soft">
                        Subtotal: ₱{cartSubtotal.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {cartDates?.checkIn &&
                    cartDates?.checkOut &&
                    cartCount > 0 && (
                      <div className="mt-1 text-xs font-medium text-sea bg-sage-muted py-1.5 px-3 rounded-full inline-block border border-sea/20 self-start">
                        Dates:{" "}
                        {new Date(cartDates.checkIn).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}{" "}
                        &mdash;{" "}
                        {new Date(cartDates.checkOut).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </div>
                    )}
                </SheetHeader>

                <div className="flex-1 p-6 space-y-4 bg-linear-to-b from-cream via-cream to-sand/30">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12 px-4 flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-sand-dark/70 bg-white/80">
                      <House className="w-12 h-12 text-sand-dark" />
                      <p className="text-ink-soft font-medium">
                      No rooms or spaces selected yet
                      </p>
                    </div>
                  ) : (
                    renderedCartItems.map((item: any) => (
                      <div
                        key={`${item.itemType}-${item.id}`}
                        className="flex items-start gap-4 p-4 bg-white rounded-[12px] border border-sand-dark/60 shadow-sm relative"
                      >
                        <div className="w-18 h-18 rounded-[10px] overflow-hidden bg-sand flex-shrink-0 border border-sand-dark/50">
                          {item.featured_image ? (
                            <img
                              src={item.featured_image}
                              alt={item.name || item.type}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-full h-full bg-sand-dark/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-7">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="inline-flex rounded-full border border-sand-dark/60 bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                              {item.itemType === "venue" ? "Venue" : "Room"}
                            </span>
                          </div>
                          <h4 className="font-display font-medium text-ink text-lg leading-tight truncate">
                            {item.name || item.type || "Listing"}
                          </h4>
                          <p className="text-sm text-ink-soft">
                            Quantity: {item.quantity}
                          </p>
                          <div className="mt-2 font-semibold text-sea text-base">
                            {item.price
                              ? `₱${(Number(item.price) * item.quantity).toLocaleString()}`
                              : "Price varies"}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="absolute top-4 right-4 text-ink-soft/70 hover:text-red-600 transition-colors cursor-pointer"
                          onClick={() => removeItem(item.id, item.itemType)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                  {hasMoreCartItems && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setVisibleCartCount((prev) =>
                          Math.min(prev + 6, cartItems.length),
                        )
                      }
                      className="w-full border-sand-dark/70 bg-white hover:bg-sand/40"
                    >
                      Show more items
                    </Button>
                  )}
                </div>

                <div className="px-6 py-5 border-t border-sand-dark/60 bg-white sticky bottom-0 z-10 w-full mb-0">
                  {cartItems.length > 0 && (
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-ink-soft font-medium">Estimated subtotal</span>
                      <span className="font-semibold text-ink">₱{cartSubtotal.toLocaleString()}</span>
                    </div>
                  )}
                  <Button
                    onClick={proceedToBookNow}
                    className="w-full py-6 text-black font-semibold cursor-pointer"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Book Now
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>

        {/* Mobile quick actions */}
        <div className="lg:hidden flex items-center gap-5 z-210">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative text-cream/90 hover:text-gold-light transition-colors duration-300 cursor-pointer"
            aria-label="View Cart"
          >
            <House className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          {/* Hamburger */}
          <button
            className="flex flex-col justify-center gap-[5px] w-8 h-8 bg-transparent border-none p-1 cursor-pointer z-210"
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
        </div>
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
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="font-display text-fluid-nav font-light text-cream/80 py-4 tracking-[0.04em] transition-all duration-300 hover:text-gold-light hover:translate-x-1.5 bg-transparent border-none cursor-pointer flex items-center justify-center text-center w-full max-w-sm"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
