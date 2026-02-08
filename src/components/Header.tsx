import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Rooms", href: "#rooms" },
    { label: "Venues", href: "#venues" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Review", href: "#reviews" },
    { label: "Faq", href: "#faq" },
  ];

  const bookNowHandler = () => {
    setOpen(false);
    const event = new Event("open-checkin");
    window.dispatchEvent(event);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/logo.webp"
            alt="Marcelino’s Logo"
            className="h-18 w-19 object-contain"
          />
          <div className="ml-2 leading-tight">
            <div className="text-[20px] font-extrabold tracking-widest text-green-900 font-serif">
              MARCELINO'S
            </div>
            <div className="text-sm tracking-widest font-medium">
              RESORT AND HOTEL
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-4">
              {navLinks.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <a
                      href={item.href}
                      className="text-base font-medium text-black transition-colors hover:text-yellow-600"
                    >
                      {item.label}
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            className="bg-[var(--default-color)] text-white font-semibold hover:bg-yellow-500"
            onClick={bookNowHandler}
          >
            Book Now
          </Button>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden hover:bg-transparent">
              <Menu className="size-9" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="top"
            aria-describedby="mobile-menu-title"
            className="bg-white"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogTitle className="border-b p-4 text-center text-2xl font-extrabold">
              MARCELINO'S
              <div>RESORT AND HOTEL</div>
            </DialogTitle>

            <div id="mobile-menu-title" className="sr-only">
              Mobile Navigation Menu
            </div>

            <nav className="flex flex-col items-center gap-6 p-6">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:text-yellow-600"
                >
                  {item.label}
                </a>
              ))}

              <Button
                className="bg-[var(--default-color)] text-white font-semibold hover:bg-yellow-500"
                onClick={bookNowHandler}
              >
                Book Now
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
