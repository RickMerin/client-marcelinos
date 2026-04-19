import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { CalendarRange, Luggage, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  getFromLocalStorage,
  saveToLocalStorage,
  BOOKING_EXPIRATION,
} from "@/lib/storage/localStorage";
import { formatDate } from "@/lib/formatters/formatDate";
import { ROOM_TYPE_FILTER_OPTIONS } from "@/lib/constants/booking.constants";

function cartLineBadgeLabel(item: { itemType?: string; type?: string }): string {
  if (item.itemType === "venue") return "Venue";
  const slug = String(item.type ?? "")
    .trim()
    .toLowerCase();
  if (!slug) return "Room";
  const found = ROOM_TYPE_FILTER_OPTIONS.find((o) => o.value === slug);
  return found ? found.label : "Room";
}

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
  /** Mirrors `reservationDate` from localStorage (wrapped format via getFromLocalStorage). */
  const [stayWindow, setStayWindow] = useState<{
    checkIn: string;
    checkOut: string;
    days: number;
  } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [visibleCartCount, setVisibleCartCount] = useState(6);
  const navigate = useNavigate();
  const location = useLocation();

  const syncCartFromStorage = useCallback(() => {
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(items);
    const totalCount = items.reduce(
      (acc: number, item: any) => acc + (item.quantity || 0),
      0,
    );
    setCartCount(totalCount);

    const rd = getFromLocalStorage("reservationDate") as {
      check_in?: string;
      check_out?: string;
      days?: number;
    } | null;

    if (rd?.check_in && rd?.check_out) {
      setStayWindow({
        checkIn: rd.check_in,
        checkOut: rd.check_out,
        days: Number(rd.days) || 0,
      });
    } else {
      setStayWindow(null);
    }
  }, []);

  useEffect(() => {
    syncCartFromStorage();
    window.addEventListener("cart-updated", syncCartFromStorage);
    window.addEventListener("reservation-date-updated", syncCartFromStorage);
    window.addEventListener("storage", syncCartFromStorage);
    return () => {
      window.removeEventListener("cart-updated", syncCartFromStorage);
      window.removeEventListener(
        "reservation-date-updated",
        syncCartFromStorage,
      );
      window.removeEventListener("storage", syncCartFromStorage);
    };
  }, [syncCartFromStorage]);

  /** Same-tab updates (e.g. home booking bar) do not fire `storage`; refresh when opening the drawer. */
  useEffect(() => {
    if (isCartOpen) syncCartFromStorage();
  }, [isCartOpen, syncCartFromStorage]);
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

  const hasValidStayForBooking =
    Boolean(stayWindow?.checkIn && stayWindow?.checkOut) &&
    Number(stayWindow?.days) > 0;

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
    const rd = getFromLocalStorage("reservationDate") as {
      check_in?: string;
      check_out?: string;
      days?: number;
    } | null;

    const canEnterBookingFlow =
      rd &&
      rd.check_in &&
      rd.check_out &&
      Number(rd.days) > 0;

    if (canEnterBookingFlow) {
      const details = getFromLocalStorage("reservationDetails") as
        | Record<string, unknown>
        | null
        | undefined;
      saveToLocalStorage(
        "reservationDetails",
        { ...(details || {}), current_step: 1 },
        BOOKING_EXPIRATION,
      );
      navigate("/create-booking");
      return;
    }

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
            className="h-11 w-11 object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
          />
          <div className=" mt-1 leading-tight inline-block text-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            <div className="text-[0.9rem] -mb-0.75 font-extrabold tracking-widest text-cream font-serif">
              MARCELINO'S
            </div>
            <div className="text-[0.9rem] text-gold-light tracking-[0.15em] font-medium w-full text-center">
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
                  className={`relative flex items-center text-[13px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)] font-medium tracking-[0.15em] uppercase transition-colors duration-300 whitespace-nowrap bg-transparent border-none cursor-pointer ${
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
          <li className="relative z-220 flex items-center">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="relative z-10 text-cream/90 hover:text-gold-light transition-colors duration-300 cursor-pointer"
                  aria-label="View Cart"
                >
                  <Luggage className="w-5 h-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]" strokeWidth={1.75} />
                  <span
                    className={`absolute -top-2 -right-3 flex min-h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold tabular-nums ${
                      cartCount > 0
                        ? "bg-emerald-600 text-white"
                        : "border border-cream/35 bg-dark/80 text-cream/90"
                    }`}
                  >
                    {cartCount}
                  </span>
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full max-w-[100vw] sm:max-w-lg bg-cream overflow-y-auto z-[9999] flex flex-col p-0 border-l border-sand-dark/60"
              >
                <SheetHeader className="px-6 py-5 border-b border-sand-dark/50 sticky top-0 bg-cream z-10 text-left gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <SheetTitle className="font-display text-2xl font-semibold text-ink m-0 leading-tight pr-2">
                      Selected spaces
                    </SheetTitle>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="p-1.5 -mr-1.5 mt-0.5 text-ink-soft hover:text-ink rounded-full hover:bg-sand transition-all cursor-pointer shrink-0"
                      aria-label="Close cart"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="rounded-xl border border-sand-dark/55 bg-white p-3.5 shadow-sm">
                    <div className="mb-2.5 flex items-center gap-2 text-ink">
                      <CalendarRange
                        className="h-4 w-4 shrink-0 text-sea"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                        Stay dates
                      </span>
                    </div>
                    {hasValidStayForBooking && stayWindow ? (
                      <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <div className="min-w-0">
                          <dt className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                            Check-in
                          </dt>
                          <dd className="m-0 text-sm font-semibold tabular-nums text-ink">
                            {formatDate(stayWindow.checkIn)}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                            Check-out
                          </dt>
                          <dd className="m-0 text-sm font-semibold tabular-nums text-ink">
                            {formatDate(stayWindow.checkOut)}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="m-0 text-sm leading-snug text-ink-soft">
                        No travel dates selected yet. Use the{" "}
                        <strong className="font-semibold text-ink">
                          Check Availability
                        </strong>{" "}
                        bar on the home page to set check-in and check-out.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      {cartCount} {cartCount === 1 ? "item" : "items"}
                    </p>
                    {cartItems.length > 0 && (
                      <span className="inline-flex items-center rounded-full border border-sand-dark/60 bg-sand px-2.5 py-1 text-xs font-semibold text-ink-soft">
                        Subtotal: ₱{cartSubtotal.toLocaleString()}
                      </span>
                    )}
                  </div>
                </SheetHeader>

                <div className="flex-1 p-6 space-y-4 bg-linear-to-b from-cream via-cream to-sand/30">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12 px-4 flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-sand-dark/70 bg-white/80">
                      <Luggage className="w-12 h-12 text-sand-dark" strokeWidth={1.25} />
                      <p className="text-ink-soft font-medium">
                      No rooms or spaces selected yet
                      </p>
                    </div>
                  ) : (
                    renderedCartItems.map((item: any) => (
                      <div
                        key={`${item.itemType}-${item.id}`}
                        className="flex items-stretch gap-4 p-4 bg-white rounded-[12px] border border-sand-dark/60 shadow-sm"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[10px] border border-sand-dark/50 bg-sand sm:h-28 sm:w-28">
                          {item.featured_image ? (
                            <img
                              src={item.featured_image}
                              alt={item.name || item.type}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="h-full w-full bg-sand-dark/40" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                          <span className="inline-flex w-fit rounded-full border border-sand-dark/60 bg-sand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                            {cartLineBadgeLabel(item)}
                          </span>
                          <h4 className="font-display text-lg font-medium leading-tight text-ink">
                            {item.name || item.type || "Listing"}
                          </h4>
                          <p className="m-0 text-sm text-ink-soft">
                            Quantity: {item.quantity}
                          </p>
                          <p className="m-0 mt-1 text-base font-semibold text-sea">
                            {item.price
                              ? `₱${(Number(item.price) * item.quantity).toLocaleString()}`
                              : "Price varies"}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 self-start rounded-md p-1.5 text-ink-soft/70 transition-colors hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeItem(item.id, item.itemType)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
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
                    <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink-soft font-medium">
                        Estimated subtotal
                      </span>
                      <span className="shrink-0 text-right font-semibold tabular-nums text-ink">
                        ₱{cartSubtotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {cartItems.length > 0 && !hasValidStayForBooking && (
                    <p className="mb-3 text-center text-xs leading-snug text-ink-soft">
                      Save check-in and check-out from the home page first, or tap
                      below to open the booking bar. After dates are saved,
                      continue goes to booking step 1.
                    </p>
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
        <div className="relative z-220 flex items-center gap-5 lg:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative z-10 text-cream/90 hover:text-gold-light transition-colors duration-300 cursor-pointer"
            aria-label="View Cart"
          >
            <Luggage className="w-5 h-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]" strokeWidth={1.75}  />
            <span
              className={`absolute -top-2 -right-3 flex min-h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold tabular-nums ${
                cartCount > 0
                  ? "bg-emerald-600 text-white"
                  : "border border-cream/35 bg-dark/80 text-cream/90"
              }`}
            >
              {cartCount}
            </span>
          </button>
          {/* Hamburger */}
          <button
            className="flex flex-col justify-center gap-[5px] w-8 h-8 bg-transparent border-none p-1 cursor-pointer z-210 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
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
