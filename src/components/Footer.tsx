import { Facebook, ArrowRight } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const first_link = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Rooms", href: "#rooms" },
    { name: "Venues", href: "#venues" },
    { name: "Services", href: "#services" },
    { name: "Gallery", href: "#gallery" },
    { name: "Review", href: "#reviews" },
  ];

  const second_link = [
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    // { name: "FAQs", href: "/faqs" },
    // { name: "Careers", href: "/careers" }, //for future expansion
    { name: "Sitemap", href: "/sitemap" },
  ];

  const handleSectionClick = (e: React.MouseEvent, hash: string) => {
    e.preventDefault();
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
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
    } else {
      scrollToSection();
    }
  };

  return (
    <footer className="bg-black px-4 py-10 text-white space-y-4">
      <div className="container mx-auto grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
        {/* ---------------------------------- */}
        {/* <section className="col-span-3 md:col-span-1 mb-5 md:mb-0">
          <h3 className="yellow md:text-lg font-bold">
            Marcelino's Resort Hotel
          </h3>
          <p>
            Experience luxury and comfort at its finest. Subscribe to our
            newsletter for exclusive offers and updates.
          </p>
          <ContactForm />
        </section> */}

        {/* ----------------------------------- */}

        <section className="col-span-1 md:col-span-1">
          <h3 className="yellow md:text-lg font-bold">Contact Info</h3>
          <ul className="mt-4">
            <li>
              <p>09********</p>
            </li>
            <li>
              <p>09********</p>
            </li>
          </ul>
          <p className="my-5">Hilongos, Leyte</p>
          <div className="flex gap-3">
            <Link
              to="https://www.facebook.com/profile.php?id=61557457680496"
              target="_blank"
              rel="noopener noreferrer">
              <Facebook className="yellow" size={30} />
            </Link>
            {/* <Link to="https://www.instagram.com/marcelinosplace/">
              <Instagram className="yellow" size={30} />
            </Link>
            <Link to="https://x.com/marcelinosplace">
              <Twitter className="yellow" size={30} />
            </Link> */}
          </div>
        </section>

        {/* ----------------------------------- */}

        <section>
          <h3 className="yellow md:text-lg font-bold">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            {first_link.map((link) => (
              <li key={link.name} className="flex items-center gap-2">
                <ArrowRight size={16} className="yellow" />
                <button
                  type="button"
                  onClick={(e) => handleSectionClick(e, link.href)}
                  className="hover:underline text-sm text-left bg-transparent border-none p-0 cursor-pointer text-white font-inherit">
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ----------------------------------- */}

        <section>
          <h3 className="yellow md:text-lg font-bold">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            {second_link.map((link) => (
              <li key={link.name} className="flex items-center gap-2">
                <ArrowRight size={16} className="yellow" />
                <Link
                  to={link.href}
                  className="hover:underline text-sm text-white no-underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <hr className=" border-white/20 mx-auto my-10" />
      <p className="text-center text-sm text-white/80">
        <small>
          &copy; {new Date().getFullYear()} Marcelino's Place | All Rights
          Reserved.
        </small>
      </p>
    </footer>
  );
}

export default Footer;
