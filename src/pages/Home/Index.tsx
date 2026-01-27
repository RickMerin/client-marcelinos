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

function Home() {
  return (
    <>
      <section className="relative w-full">
        <BannerCarousel />
        <div className="spacer h-30 md:h-0"></div>
        <div className="absolute pb-3 pt-5 text-white inset-x-2 transform bg-green-900 -translate-y-1/2 mx-auto max-w-5xl rounded-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none"
          style={{ backgroundImage: "url('green-leaves-extended.png')" }}
        ></div>
          <BookingForm />
        </div>
        <div className="spacer h-50 md:h-25"></div>
      </section>
      <About />
      <RoomCard />
      <EventVenues />
      <Services />
      <OurGallery />
      <ClientReviews />
      <FAQ />
      <LocationMap />
    </>
  );
}

export default Home;
