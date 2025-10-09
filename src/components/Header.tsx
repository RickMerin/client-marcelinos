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

export default function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Room", href: "/room" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Review", href: "/review" },
    { label: "Faq", href: "/faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        {/* --- Logo --- */}
        <a href="/" className="flex items-center">
          <img
            src="/logo.webp"
            alt="Marcelino’s Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="text-2xl font-extrabold text-black">
            Marcelino’s
          </span>
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

          <Button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg">
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
          <SheetContent side="top" className="bg-white">
            <nav className="flex flex-wrap justify-content-center items-center gap-5 md:mt-10 p-5">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-black hover:text-yellow-600">
                  {item.label}
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
