"use client";

import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import { SectionReveal } from "@/components/SectionReveal";
import Section from "@/components/Section";
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
			<WelcomeModal />

			{/* ── HERO ── */}
			<section className="relative w-full">
				<BannerCarousel />
			</section>

			{/* ── BOOKING BAR ── */}
			<div
				id="booking-section"
				className="first-fold-booking relative z-10 bg-gradient-forest-bar">
				<BookingForm />
			</div>

			{/* ── ABOUT ── */}
			<Section id="about" className="section-depth-light">
				<SectionReveal>
					<About />
				</SectionReveal>
			</Section>

			{/* ── ROOMS (dark) ── */}
			<Section id="rooms" className="section-depth-forest" fullWidth>
				<div className="max-w-[1400px] mx-auto px-6 lg:px-16 xl:px-20">
					<SectionReveal>
						<RoomCard />
					</SectionReveal>
				</div>
			</Section>

			{/* ── VENUES (sand bg) ── */}
			<Section id="venues" className="section-depth-sand">
				<SectionReveal>
					<EventVenues />
				</SectionReveal>
			</Section>

			{/* ── AMENITIES / SERVICES ── */}
			<Section id="services" className="section-depth-light">
				<SectionReveal>
					<Services />
				</SectionReveal>
			</Section>

			{/* ── GALLERY ── */}
			<Section id="gallery" className="section-depth-light">
				<SectionReveal>
					<OurGallery />
				</SectionReveal>
			</Section>

			{/* ── REVIEWS (sea bg) ── */}
			<Section id="reviews" className="section-depth-sea text-cream">
				<SectionReveal>
					<ClientReviews />
				</SectionReveal>
			</Section>

			{/* ── CTA STRIP ── */}
			<div className="cta-strip-luxury py-16 md:py-20 lg:py-24 px-6 lg:px-16 xl:px-20 flex items-center justify-between gap-10 flex-wrap max-md:flex-col max-md:items-start max-md:gap-8">
				<h2
					className="cta-strip-inner font-display text-[clamp(32px,4vw,56px)] font-light leading-[1.15] text-cream">
					Ready to{" "}
					<em className="italic text-gold">Escape</em> to Paradise?
				</h2>
				<Link
					to="/create-booking"
					className="cta-strip-inner btn-primary-mockup max-md:w-full max-md:text-center flex items-center justify-center">
					Book Your Stay Today
				</Link>
			</div>

			{/* ── CONTACT ── */}
			<Section id="contact" className="section-depth-light">
				<SectionReveal>
					<FAQ />
				</SectionReveal>
			</Section>

			{/* ── LOCATION ── */}
			<Section id="location" className="section-depth-sand">
				<SectionReveal>
					<LocationMap />
				</SectionReveal>
			</Section>

			<BubbleChat />
		</>
	);
}

export default Home;
