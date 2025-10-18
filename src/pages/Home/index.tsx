import { BannerCarousel } from "./BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import ImageCarousel from "@/components/imagecarousel/ImageCarousel";
import About from "@/components/sections/About";
import ClientReviews from "@/components/sections/ClientReviews";
// import banner from '../assets/img/marcelinos-banner.jpg';
import EventVenues from "@/components/cards/EventVenue";
import RoomCard from "@/components/cards/RoomCard";
import FAQ from "@/components/sections/FAQ";
import LocationMap from "@/components/map/LocationMap";
import Services from "@/components/cards/Services";

function Home() {
  return (
    <>
      <section className="relative">
        <BannerCarousel />
        <div className="spacer h-30 md:h-0"></div>
        <div className="absolute pb-3 pt-5 text-white inset-x-2 transform -translate-y-1/2 mx-auto bg-gray-400 max-w-5xl rounded-xl">
          <BookingForm />
        </div>
        <div className="spacer h-50 md:h-25"></div>
      </section>
      <About />
      <RoomCard />
      <EventVenues />
      <Services />
      <ImageCarousel />
      <ClientReviews />
      {/* <img src={banner} alt="marcelinos-banner" /> */}
      <FAQ />
      <LocationMap />
    </>
  );
}

export default Home;
