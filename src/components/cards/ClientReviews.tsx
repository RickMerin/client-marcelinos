import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import client1 from "../../assets/img/room3.jpg";
import logo from "../../assets/img/marcelinos-logo.svg";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ClientReviews() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const reviews = [
    {
      name: "David & Anna",
      date: "September 3, 2025",
      text: "Marcelino's Place is a gem! The elegant setting and exceptional service made our anniversary celebration unforgettable.",
      stars: 5,
      img: client1,
    },
    {
      name: "Sophia L.",
      date: "August 15, 2025",
      text: "The attention to detail was impressive. From the décor to the hospitality, everything was perfect!",
      stars: 4,
      img: client1,
    },
    {
      name: "Michael R.",
      date: "July 20, 2025",
      text: "A beautiful venue with a warm ambiance — our wedding reception turned out exactly as we dreamed.",
      stars: 5,
      img: client1,
    },
  ];

  return (
    <div className="bg-[#faf7f2] py-16 flex flex-col items-center relative">
      <h1 className="text-3xl font-bold text-center mb-12">
        <span className="green header">CLIENT</span>{" "}
        <span className="yellow header">REVIEWS</span>
      </h1>

      {/* Swiper Container */}
      <div className="relative w-full max-w-lg">
        {/* Navigation Buttons */}
        <button
          ref={prevRef}
          className="absolute -left-10 top-1/2 -translate-y-1/2 z-10 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          ref={nextRef}
          className="absolute -right-10 top-1/2 -translate-y-1/2 z-10 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          loop={true}
          onInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          className="pb-10"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
              <Card className="w-[360px] h-[270px] bg-white gap-0 shadow-md rounded-2xl p-10 text-left mx-auto flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center">
                  <img
                    src={review.img}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.name}
                    </h3>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                  <img
                    src={logo}
                    alt="Marcelino's Logo"
                    className="w-10 ml-auto object-contain"
                  />
                </div>

                <div className="flex gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.stars
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-10 leading-relaxed">
                  {review.text}
                </p>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ClientReviews;
