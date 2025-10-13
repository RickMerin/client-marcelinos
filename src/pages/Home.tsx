import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import ImageCarousel from '../components/imagecarousel/ImageCarousel';
import Services from "../pages/Services";

function Home() {
  return (
    <>
      <BannerCarousel />
      <BookingForm />
      <ImageCarousel />
      <Services/>
    </>
  );
}



export default Home;
