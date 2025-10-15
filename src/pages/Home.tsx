import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import ImageCarousel from '../components/imagecarousel/ImageCarousel';
import About from "./About";
import ClientReviews  from "../components/cards/ClientReviews";
import banner from '../assets/img/marcelinos-banner.jpg';
import RoomCard from "@/components/cards/RoomCard";
import FAQ from "./FAQ";
import LocationMap from "@/components/map/LocationMap";
import Services from "../components/cards/Services";


function Home() {
  return (  
    <>
      <BannerCarousel />
      <BookingForm/>
      <About/>
      <RoomCard />
      <Services/>
      <ImageCarousel />
      < ClientReviews />
      <img src={banner} alt="marcelinos-banner" />
      <FAQ/>
      <LocationMap/>
    </>
  );
}



export default Home;
