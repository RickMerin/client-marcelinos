import { Facebook, Instagram, Twitter } from "lucide-react";
import ContactForm from "./forms/ContactForm";

function Footer() {
  return (
    <footer className="bg-black p-4 text-white space-y-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* ---------------------------------- */}
        <section>
          <h3 className="yellow text-lg font-bold">
            Marcelino's Resort <br /> Hotel
          </h3>
          <p>
            Experience luxury and comfort at its finest. Subscribe to our
            newsletter for exclusive offers and updates.
          </p>
          <ContactForm />
        </section>

        {/* ----------------------------------- */}

        <section>
          <h3 className="yellow text-lg font-bold">Contact Info</h3>
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
            <Facebook className="yellow" size={30} />
            <Instagram className="yellow" size={30} />
            <Twitter className="yellow" size={30} />
          </div>
        </section>
      </div>
      <hr className=" border-white/20 mx-auto" />
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
