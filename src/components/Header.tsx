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
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Review", href: "#reviews" },
    { label: "Faq", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex h-18 items-center justify-between px-4 md:px-8">
        {/* --- Logo --- */}
        <a href="/" className="flex items-center">
          <img
            src="/logo.webp"
            alt="Marcelino’s Logo"
            className="w-19 h-18 object-contain"
          />
        <div className="flex flex-col gap-0 leading-tight w-[200px]">
          <div className="text-[20px] text-green-900 tracking-widest font-extrabold font-serif text-black">
            MARCELINO'S
          </div>

          <div className="w-full flex flex-row justify-between tracking-widest text-medium font-medium">
            <span>RESORT AND HOTEL </span>
          </div>
        </div>
        </a>

        {/* --- Desktop Navigation --- */}
        <nav className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-4">
              {navLinks.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <a
                      href={item.href}
                      className="text-base font-medium text-black hover:text-yellow-600 transition-colors">
                      {item.label}
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button className="bg-[var(--default-color)] hover:bg-yellow-500 text-white font-semibold rounded-md">
            Book Now
          </Button>
        </nav>

        {/* --- Mobile Menu --- */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-black hover:bg-transparent">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            aria-describedby="mobile-menu-title"
            className="bg-white">
            {/* Add DialogTitle for accessibility */}

            <DialogTitle className="text-center text-2xl font-extrabold p-4 border-b">
              Marcelino’s
            </DialogTitle>
            <div className="sr-only" id="mobile-menu-title">
              Mobile Navigation Menu
            </div>
            <nav
              aria-labelledby="mobile-menu-title"
              className="flex flex-col justify-center items-center gap-3 md:mt-10 p-5">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:text-yellow-600">
                  <span>{item.label}</span>
                </a>
              ))}
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg">
                Book Now
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
