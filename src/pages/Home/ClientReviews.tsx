  
import {  useRef,useState } from "react";
import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import WriteReviewModal from "./Modals/WriteReviewModal";

import client1 from "../../assets/img/room3.jpg";
import logo from "../../assets/img/marcelinos-logo.svg";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const reviews = [
    {
      name: "Sophia L.",
      date: "August 15, 2025",
      text: "The attention to detail was impressive. From the décor to the hospitality, everything was perfect!",
      stars: 4,
      img: client1,
    },
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
        {
      name: "Sophia L.",
      date: "August 15, 2025",
      text: "The attention to detail was impressive. From the décor to the hospitality, everything was perfect!",
      stars: 4,
      img: client1,
    },
  ];

function ClientReviews() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef<SwiperType | null>(null);
  // 🔹 modal open/close state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 handle submit event (connect to backend later)
  const handleReviewSubmit = (data: { stars: number; review_text: string }) => {
    console.log("Submitted review:", data);
    // Example:
    // await fetch("/api/reviews", { method: "POST", body: JSON.stringify(data) });
  };

  return (
    <div className="bg-[#faf7f2] py-16 flex flex-col items-center relative overflow-hidden">
      <h1 className="text-3xl font-bold text-center mb-12">
        <span className="green header">CLIENT</span>{" "}
        <span className="yellow header">REVIEWS</span>
      </h1>

      <div className="relative w-full max-w-6xl px-4 sm:px-8 flex justify-center">
        {/* Navigation Buttons */}
        <button
          ref={prevRef}
          className="absolute left-2 sm:-left-10 top-1/2 -translate-y-1/2 z-30 bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          ref={nextRef}
          className="absolute right-2 sm:-right-10 top-1/2 -translate-y-1/2 z-30 bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <Swiper
          modules={[Navigation, Pagination]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onBeforeInit={(swiper) => {
            // Attach navigation before Swiper initializes
            // @ts-ignore
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-ignore
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          centeredSlides={true}
          loop={true}
          grabCursor={true}
          observer={true}
          observeParents={true}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 25,
            },
          }}
          className="pb-10"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
              {({ isActive, isPrev, isNext }) => (
                <div
                  className={`flex justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? "scale-100 opacity-100 z-30"
                      : isPrev || isNext
                      ? "scale-90 opacity-80 z-20"
                      : "scale-75 opacity-40 z-10"
                  }`}
                  style={{
                    transformOrigin: "center center",
                    transitionProperty: "transform, opacity, filter",
                    filter: isActive ? "blur(0px)" : "blur(3px)", 
                  }}
                >
                  <Card
                    className="bg-white gap-0 item-stretch rounded-2xl p-3 sm:p-8 text-left flex flex-col justify-between
                               w-[90vw] sm:w-[400px] md:w-[450px] h-auto sm:h-[270px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={review.img}
                        alt={review.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {review.name}
                        </h3>
                        <p className="text-[10px] text-gray-500">
                          {review.date}
                        </p>
                      </div>
                      <img
                        src={logo}
                        alt="Marcelino's Logo"
                        className="w-8 sm:w-10 ml-auto object-contain"
                      />
                    </div>

                    {/* Star Rating */}
                      <div className="flex gap-1 mt-3 mb-2">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-5 h-5 ${
                              idx < review.stars
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-700 text-[12px] leading-relaxed mt-0 mb-8">
                        {review.text}
                      </p>
                  </Card>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div>


    <div className="text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 mt-10 text-white font-semibold rounded-lg green-bg active:scale-95 transition-all duration-200"
          >
            Write a review
          </button>

          <WriteReviewModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleReviewSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default ClientReviews;
