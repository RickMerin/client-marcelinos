import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import ImageCarousel from '../components/imagecarousel/ImageCarousel';

function Home() {
  return (
    <>
      <BannerCarousel />
      <BookingForm />
       <ImageCarousel />
    </>
  );
}



export default Home;
