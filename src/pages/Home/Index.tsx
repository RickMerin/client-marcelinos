"use client";

import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import { SectionReveal } from "@/components/SectionReveal";
import WelcomeModal from "@/components/modals/WelcomeModal";
import BubbleChat from "@/components/BubbleChat";

import About from "./About";
import EventVenues from "./EventVenue";
import Services from "./Services";
import FAQ from "./ContactForm";

import OurGallery from "@/pages/Home/OurGallery";
import RoomCard from "@/pages/Home/RoomCard";
import ClientReviews from "@/pages/Testimonial/ReviewSection";
import LocationMap from "@/pages/Home/LocationMap";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const navState = location.state as { openCheckIn?: boolean } | null;
    if (!navState?.openCheckIn) return;

    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("open-checkin"));
      navigate(location.pathname + location.search + location.hash, {
        replace: true,
        state: null,
      });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [location, navigate]);

  return (
    <>
      {/* Welcome Popup */}
      <WelcomeModal />

      {/* Hero Section */}
      <section className="relative w-full">
        <BannerCarousel />

        {/* Booking Form */}
        <div
          id="booking-section"
          className="first-fold-booking relative mx-4 md:mx-auto md:max-w-5xl
                     -mt-10 md:-mt-24
                     rounded-2xl border border-green-700/50
                     px-4 py-6 md:px-8 md:py-8
                     shadow-xl shadow-black/20
                     bg-green-800 text-white"
        >
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none rounded-2xl"
            style={{ backgroundImage: "url('green-leaves-extended.png')" }}
          />

          <div className="relative z-10">
            <BookingForm />
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="landing-section px-4 md:px-6 max-w-7xl mx-auto"
      >
        <SectionReveal>
          <About />
        </SectionReveal>
      </section>

      {/* Rooms */}
      <section
        id="rooms"
        className="landing-section landing-section-alt px-4 md:px-6"
      >
        <SectionReveal>
          <RoomCard />
        </SectionReveal>
      </section>

      {/* Venues */}
      <section id="venues" className="landing-section mx-auto bg-white">
        <SectionReveal>
          <EventVenues />
        </SectionReveal>
      </section>

      {/* Services */}
      <section
        id="services"
        className="landing-section landing-section-alt px-4 md:px-6"
      >
        <SectionReveal>
          <Services />
        </SectionReveal>
      </section>

      {/* Gallery */}
      <section
        id="gallery"
        className="landing-section px-4 md:px-6 max-w-7xl mx-auto bg-white"
      >
        <SectionReveal>
          <OurGallery />
        </SectionReveal>
      </section>

      {/* Reviews */}
      <section
        id="reviews"
        className="landing-section landing-section-alt px-4 md:px-6"
      >
        <SectionReveal>
          <ClientReviews />
        </SectionReveal>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="landing-section px-4 md:px-6 max-w-7xl mx-auto bg-white"
      >
        <SectionReveal>
          <FAQ />
        </SectionReveal>
      </section>

      {/* Location */}
      <section
        id="location"
        className="landing-section landing-section-alt px-4 md:px-6 mx-auto"
        aria-labelledby="location-heading"
      >
        <SectionReveal>
          <LocationMap />
        </SectionReveal>
      </section>

      {/* 🔵 Floating Chat Bubble */}
      <BubbleChat />
    </>
  );
}

export default Home;