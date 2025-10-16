/**
 * ClientReviews Component
 * --------------------------------------------
 * Displays a carousel of client testimonials using Swiper.js.
 * Fetches data dynamically from the Laravel API.
 */

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination } from "swiper/modules";

import client1 from "../../assets/img/room3.jpg";
import logo from "../../assets/img/marcelinos-logo.svg";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ClientReviews() {
  /** Swiper and navigation references */
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef<SwiperType | null>(null);

  
  /** Client review data (static)*/
  // const reviews = [
  //   {
  //     name: "Sophia L.",
  //     date: "August 15, 2025",
  //     text: "The attention to detail was impressive. From the décor to the hospitality, everything was perfect!",
  //     stars: 4,
  //     img: client1,
  //   },
  //   {
  //     name: "David & Anna",
  //     date: "September 3, 2025",
  //     text: "Marcelino's Place is a gem! The elegant setting and exceptional service made our anniversary celebration unforgettable.",
  //     stars: 5,
  //     img: client1,
  //   },
  //   {
  //     name: "Sophia L.",
  //     date: "August 15, 2025",
  //     text: "The attention to detail was impressive. From the décor to the hospitality, everything was perfect!",
  //     stars: 4,
  //     img: client1,
  //   },
  //   {
  //     name: "Michael R.",
  //     date: "July 20, 2025",
  //     text: "A beautiful venue with a warm ambiance — our wedding reception turned out exactly as we dreamed.",
  //     stars: 5,
  //     img: client1,
  //   },
  // ];

  // dynamic through API in future iterations

  /** Holds client review data */
  const [reviews, setReviews] = useState([]);

  /** Fetch dynamic review data from API */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        const simplified = data.map((item) => ({
          name: `${item.guest.first_name} ${item.guest.last_name}`,
          date: new Date(item.review_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          text: item.review_text,
          stars: item.stars,
          img: client1,
        }));
        setReviews(simplified);
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  /** Initialize navigation once Swiper mounts */
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.params) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, []);

  return (
    <div className="bg-[#faf7f2] py-16 flex flex-col items-center relative overflow-hidden">
      {/* Section Header */}
      <h1 className="text-3xl font-bold text-center mb-12">
        <span className="green header">CLIENT</span>{" "}
        <span className="yellow header">REVIEWS</span>
      </h1>

      <div className="relative w-full max-w-6xl px-8 flex justify-center">
        {/* Custom Navigation Buttons */}
        <button
          ref={prevRef}
          className="absolute -left-10 top-1/2 -translate-y-1/2 z-30 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          ref={nextRef}
          className="absolute -right-10 top-1/2 -translate-y-1/2 z-30 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Swiper Carousel */}
        <Swiper
  modules={[Navigation, Pagination]}
  onSwiper={(swiper) => (swiperRef.current = swiper)}
  spaceBetween={20}
  slidesPerView={3}
  centeredSlides={true}
  loop={true}
  grabCursor={true}
  pagination={{
    clickable: true,
    renderBullet: function (index, className) {
      // Only render 3 bullets max
      if (index < 3) {
        return `<span class="${className}"></span>`;
      }
      return ""; // skip others
    },
  }}
  className="pb-10"
>
          {reviews.map((review, i) => (
            <SwiperSlide key={i} style={{ width: 360 }}>
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
                    filter: isActive ? "blur(0px)" : "blur(1.5px)",
                  }}
                >
                  <Card
                    className="bg-white shadow-md gap-1 rounded-2xl p-8 text-left flex flex-col justify-between
                               w-[450px] h-[270px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  >
                    {/* Reviewer Info */}
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

                    {/* Star Rating */}
                    <div className="flex gap-1 mt-6">
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
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      {review.text}
                    </p>
                  </Card>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ClientReviews;
