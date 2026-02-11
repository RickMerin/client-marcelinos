import { useEffect } from "react";
import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import About from "./About";
import OurGallery from "@/pages/Home/OurGallery";
import ClientReviews from "./ClientReviews";
import EventVenues from "./EventVenue";
import RoomCard from "@/pages/Home/RoomCard";
import FAQ from "./ContactForm";
import LocationMap from "@/pages/Home/LocationMap";
import Services from "./Services";
import WelcomeModal from "@/components/modals/WelcomeModal";

function Home() {
  // Scroll to section if hash exists
  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        // Remove "#" from hash
        const id = hash.replace("#", "");
        // Try to find element by id
        const el = document.getElementById(id);
        if (el) {
          // Smooth scroll
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, []);

  return (
    <>
      <WelcomeModal />

      <section className="relative w-full">
        <BannerCarousel />
        <div className="spacer h-30 md:h-0"></div>
        <div className="absolute pb-3 pt-5 text-white inset-x-2 transform bg-green-900 -translate-y-1/2 mx-auto max-w-5xl rounded-xl">
          <div
            id="booking-section"
            className="absolute pb-3 pt-5 text-white inset-x-2 transform bg-green-900 -translate-y-1/2 mx-auto max-w-5xl rounded-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none"
              style={{ backgroundImage: "url('green-leaves-extended.png')" }}
            ></div>
            <BookingForm />
          </div>
        </div>
        <div className="spacer h-50 md:h-25"></div>
      </section>

      {/* Sections with proper ids */}
      <div id="about"><About /></div>
      <div id="rooms"><RoomCard /></div>
      <div id="venues"><EventVenues /></div>
      <div id="services"><Services /></div>
      <div id="gallery"><OurGallery /></div>
      <div id="reviews"><ClientReviews /></div>
      <div id="faq"><FAQ /></div>
      <div id="location"><LocationMap /></div>
    </>
  );
}

export default Home;
