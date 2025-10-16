import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import ImageCarousel from "../components/imagecarousel/ImageCarousel";
import About from "./About";
import ClientReviews from "../components/cards/ClientReviews";
import banner from "../assets/img/marcelinos-banner.jpg";
import EventVenues from "../components/cards/EventVenue";
import RoomCard from "@/components/cards/RoomCard";
import FAQ from "./FAQ";
import LocationMap from "@/components/map/LocationMap";
import Services from "../components/cards/Services";

function Home() {
  return (
    <>
      <section className="relative">
        <BannerCarousel />
        <div className="absolute bg-gray-500 text-white left-1/2 top-full -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-6xl py-10 px-4 rounded-lg shadow-lg">
          <BookingForm />
        </div>
      </section>
      <About />
      <RoomCard />
      <EventVenues />
      <Services />
      <ImageCarousel />
      <ClientReviews />
      <img src={banner} alt="marcelinos-banner" />
      <FAQ />
      <LocationMap />
    </>
  );
}

export default Home;
