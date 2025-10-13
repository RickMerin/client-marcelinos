import { BannerCarousel } from "@/components/carousels/BannerCarousel";
import BookingForm from "@/components/forms/BookingForm";
import About from "./About";
import FAQ from "./FAQ";

function Home() {
  return (
    <>
      <BannerCarousel />
      <BookingForm/>
      <About/>
      <FAQ/>
    </>
  );
}

export default Home;
