import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import ImageCarousel from '../components/imagecarousel/ImageCarousel';
import About from "./About";
import FAQ from "./FAQ";
import Services from "../components/cards/Services";

function Home() {
  return (
    <>
      <BannerCarousel />
      <BookingForm/>
      <About/>
      <Services/>
      <ImageCarousel />
      <FAQ/>
    </>
  );
}



export default Home;
