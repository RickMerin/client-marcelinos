import { useLayoutEffect } from "react";
import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import { SectionReveal } from "@/components/SectionReveal";
import About from "./About";
import OurGallery from "@/pages/Home/OurGallery";
import ClientReviews from "@/pages/Testimonial/ReviewSection";
import EventVenues from "./EventVenue";
import RoomCard from "@/pages/Home/RoomCard";
import FAQ from "./ContactForm";
import LocationMap from "@/pages/Home/LocationMap";
import Services from "./Services";
import WelcomeModal from "@/components/modals/WelcomeModal";

function Home() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <WelcomeModal />

      {/* Hero Section */}
      <section className="relative w-full">
        <BannerCarousel />

        {/* Booking Form Container - green background + green leaves + premium typography */}
        <div
          id="booking-section"
          className="first-fold-booking relative mx-4 md:mx-auto md:max-w-5xl
                     -mt-10 md:-mt-24
                     rounded-2xl border border-green-700/50
                     px-4 py-6 md:px-8 md:py-8
                     shadow-xl shadow-black/20
                     bg-green-800 text-white">
          {/* Green leaves background overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none rounded-2xl"
            style={{
              backgroundImage: "url('green-leaves-extended.png')",
            }}
          />
          <div className="relative z-10">
            <BookingForm />
          </div>
        </div>
      </section>

      {/* Content Sections — premium spacing, alternating backgrounds, scroll reveal */}
      <section
        id="about"
        className="landing-section px-4 md:px-6 max-w-7xl mx-auto">
        <SectionReveal>
          <About />
        </SectionReveal>
      </section>

      <section
        id="rooms"
        className="landing-section landing-section-alt px-4 md:px-6">
        <SectionReveal>
          <RoomCard />
        </SectionReveal>
      </section>

      <section id="venues" className="landing-section mx-auto bg-white">
        <SectionReveal>
          <EventVenues />
        </SectionReveal>
      </section>

      <section
        id="services"
        className="landing-section landing-section-alt px-4 md:px-6">
        <SectionReveal>
          <Services />
        </SectionReveal>
      </section>

      <section
        id="gallery"
        className="landing-section px-4 md:px-6 max-w-7xl mx-auto bg-white">
        <SectionReveal>
          <OurGallery />
        </SectionReveal>
      </section>

      <section
        id="reviews"
        className="landing-section landing-section-alt px-4 md:px-6">
        <SectionReveal>
          <ClientReviews />
        </SectionReveal>
      </section>

      <section
        id="faq"
        className="landing-section px-4 md:px-6 max-w-7xl mx-auto bg-white">
        <SectionReveal>
          <FAQ />
        </SectionReveal>
      </section>

      <section
        id="location"
        className="landing-section landing-section-alt px-4 md:px-6 mx-auto"
        aria-labelledby="location-heading">
        <SectionReveal>
          <LocationMap />
        </SectionReveal>
      </section>
    </>
  );
}

export default Home;
