import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation } from "swiper/modules";
import WriteReviewModal from "../Home/Modals/WriteReviewModal";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";

import logo from "../../assets/img/marcelinos-logo.svg";

import "swiper/css";
import "swiper/css/navigation";

/* ---------------- TYPES ---------------- */

interface Review {
  guest_name: string | null;
  rating: number;
  title: string;
  comment: string;
  date: string | null;
}

interface ReviewResponse {
  reviews: Review[];
}

/* ---------------- COMPONENT ---------------- */

function ClientReviews() {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ---------------- FETCH ---------------- */

  const { data, isLoading, isError } = useApiQuery<ReviewResponse>(
    ["reviews"],
    "/reviews"
  );

  const reviews = data?.reviews ?? [];

  /* ---------------- SUBMIT ---------------- */

  const handleReviewSubmit = async (data: {
    stars: number;
    review_text: string;
  }) => {
    console.log(data);
  };

  /* ---------------- FORMAT DATE ---------------- */

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Recently";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* ---------------- RENDER ---------------- */

  return (
    <section
      id="reviews"
      className="bg-[#faf7f2] py-16 flex flex-col items-center"
    >
      {/* HEADER */}

      <h1 className="text-3xl font-bold text-center mb-12">
        <span className="green header">CLIENT</span>{" "}
        <span className="yellow header">REVIEWS</span>
      </h1>

      {/* CONTAINER */}

      <div className="relative w-full max-w-6xl px-4 sm:px-8">

        {/* NAV BUTTONS */}

        <button
          ref={prevRef}
          className="absolute left-0 sm:-left-10 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white"
        >
          <ChevronLeft />
        </button>

        <button
          ref={nextRef}
          className="absolute right-0 sm:-right-10 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-yellow-400 hover:text-white"
        >
          <ChevronRight />
        </button>

        {/* STATES */}

        {isLoading && (
          <p className="text-center text-gray-500">
            Loading reviews...
          </p>
        )}

        {isError && (
          <p className="text-center text-red-500">
            Failed to load reviews.
          </p>
        )}

        {!isLoading && !isError && reviews.length === 0 && (
          <p className="text-center text-gray-500">
            No reviews yet.
          </p>
        )}

        {/* SWIPER */}

        {!isLoading && !isError && reviews.length > 0 && (
          <div className="relative w-full max-w-6xl px-4 sm:px-8 overflow-visible">
          <Swiper
            modules={[Navigation]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onBeforeInit={(swiper: any) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            centeredSlides
            centeredSlidesBounds={true}
            grabCursor
            loop={true}
            spaceBetween={25}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {reviews.map((review, index) => (
              <SwiperSlide
                key={index}
                className="flex justify-center"
              >
                {({ isActive, isPrev, isNext }) => (

                  <div
                    className={`
                      w-full flex justify-center transition-all duration-500
                      ${
                        isActive
                          ? "scale-95 h-full blur-0"
                          : isPrev || isNext
                          ? "scale-88 h-[10%] blur-[2px]"
                          : "scale-88 h-[10%] blur-[2px]"
                      }
                    `}
                  >

                    {/* CARD */}

                <Card className="bg-white rounded-2xl p-6 w-full max-w-[380px] shadow-md h-auto min-h-[240px]">
                  <div className="space-y-5">

                    {/* HEADER */}
                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {(review.guest_name ?? "A").charAt(0)}
                      </div>

                      <div className="leading-tight">
                        <h3 className="font-semibold text-m">
                          {review.guest_name ?? "Anonymous Guest"}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {formatDate(review.date)}
                        </p>
                      </div>

                      <img
                        src={logo}
                        className="w-10 ml-auto"
                      />

                    </div>


                    {/* STARS */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400 w-6 h-6"
                              : "text-gray-300 w-6 h-6"
                          }
                        />
                      ))}
                    </div>


                    {/* TITLE */}
                    {/* <h4 className="font-semibold text-sm leading-tight">
                      {review.title}
                    </h4> */}


                    {/* COMMENT */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>

                  </div>

                </Card>

                  </div>

                )}
              </SwiperSlide>
            ))}
          </Swiper>
          </div>
        )}
      </div>

      {/* BUTTON */}

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-10 px-6 py-3 bg-green-700 text-white rounded-lg"
      >
        <i>Write a review</i>
      </button>

      <WriteReviewModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </section>
  );
}

export default ClientReviews; 