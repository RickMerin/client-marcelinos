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

/* ---------------- TYPES (MATCHES YOUR API) ---------------- */

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

  /* ---------------- FETCH REVIEWS ---------------- */

  const { data, isLoading, isError } = useApiQuery<ReviewResponse>(
    ["reviews"],
    "/reviews"
  );

  const reviews = data?.reviews ?? [];

  /* ---------------- SUBMIT HANDLER ---------------- */

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
      className="bg-[#faf7f2] py-16 flex flex-col items-center relative overflow-hidden"
    >
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

        {/* Loading */}
        {isLoading && (
          <p className="text-center text-gray-500">Loading reviews...</p>
        )}

        {/* Error */}
        {isError && (
          <p className="text-center text-red-500">
            Failed to load reviews.
          </p>
        )}

        {/* No Reviews */}
        {!isLoading && !isError && reviews.length === 0 && (
          <p className="text-gray-500">No reviews yet.</p>
        )}

        {/* Swiper */}
        {!isLoading && !isError && reviews.length > 0 && (
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
            grabCursor
            observer
            observeParents
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 10 },
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 25 },
            }}
            className="pb-10"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                {({ isActive, isPrev, isNext }) => (
                  <div
                    className={`flex justify-center transition-all duration-700 ${
                      isActive
                        ? "scale-100 opacity-100 z-30"
                        : isPrev || isNext
                        ? "scale-90 opacity-80 z-20"
                        : "scale-75 opacity-40 z-10"
                    }`}
                    style={{
                      filter: isActive ? "blur(0px)" : "blur(3px)",
                    }}
                  >
                    <Card className="bg-white rounded-2xl p-6 w-[90vw] sm:w-96">

                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                          {(review.guest_name ?? "A").charAt(0)}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {review.guest_name ?? "Anonymous Guest"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatDate(review.date)}
                          </p>
                        </div>

                        <img
                          src={logo}
                          alt="Marcelino's Logo"
                          className="w-10 ml-auto object-contain"
                        />
                      </div>

                      {/* Stars */}
                      <div className="flex gap-1 mt-3 mb-2">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-5 h-5 ${
                              idx < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Title */}
                      <h4 className="font-medium text-sm">
                        {review.title}
                      </h4>

                      {/* Comment */}
                      <p className="text-gray-700 text-sm mt-2">
                        {review.comment}
                      </p>
                    </Card>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Write Review Button */}
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
    </section>
  );
}

export default ClientReviews;
