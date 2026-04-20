import { useState, useEffect, useCallback } from "react";
import ReviewSectionSkeleton from "@/components/skeleton/ReviewSectionSkeleton";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";

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

type ReviewApiResponse =
  | Review[]
  | ReviewResponse
  | { data?: Review[] | ReviewResponse | { reviews?: Review[] } }
  | undefined;

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function pickNumber(value: unknown): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(5, Math.round(numeric)));
}

function normalizeReview(item: unknown): Review {
  const source = (item ?? {}) as Record<string, unknown>;
  return {
    guest_name:
      pickString(source.guest_name) ??
      pickString(source.guestName) ??
      pickString(source.name),
    rating: pickNumber(source.rating ?? source.stars ?? source.rate),
    title: pickString(source.title) ?? "",
    comment:
      pickString(source.comment) ??
      pickString(source.review) ??
      pickString(source.message) ??
      "",
    date:
      pickString(source.date) ??
      pickString(source.created_at) ??
      pickString(source.createdAt),
  };
}

function extractReviews(response: ReviewApiResponse): Review[] {
  if (Array.isArray(response)) return response.map(normalizeReview);

  if (response && typeof response === "object" && "reviews" in response && Array.isArray(response.reviews)) {
    return response.reviews.map(normalizeReview);
  }

  const nestedData =
    response && typeof response === "object" && "data" in response
      ? response.data
      : undefined;
  if (Array.isArray(nestedData)) return nestedData.map(normalizeReview);

  if (
    nestedData &&
    typeof nestedData === "object" &&
    "reviews" in nestedData &&
    Array.isArray((nestedData as { reviews?: unknown[] }).reviews)
  ) {
    return ((nestedData as { reviews?: unknown[] }).reviews ?? []).map(
      normalizeReview,
    );
  }

  return [];
}

function ClientReviews() {
  const { data, isLoading, isError } = useApiQuery<ReviewApiResponse>(
    ["reviews"],
    "/reviews",
  );

  const reviews = extractReviews(data).filter(
    (review) => review.comment.trim().length > 0,
  );

  const [currentIdx, setCurrentIdx] = useState(0);

  const nextReview = useCallback(() => {
    if (reviews.length === 0) return;
    setCurrentIdx((i) => (i + 1) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(nextReview, 5000);
    return () => clearInterval(interval);
  }, [nextReview, reviews.length]);

  const current = reviews[currentIdx];

  return (
    <div
      className="max-w-[760px] mx-auto text-center"
      aria-labelledby="reviews-heading"
    >
      <div
        className="section-eyebrow justify-center"
        style={{ color: "rgba(250,250,249,0.65)" }}
      >
        Guest Stories
      </div>

      {isLoading && <ReviewSectionSkeleton />}

      {isError && (
        <p className="text-center text-base text-red-300 font-medium">
          Failed to load reviews.
        </p>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <p className="text-center text-base text-cream/80">No reviews yet.</p>
      )}

      {!isLoading && !isError && current && (
        <>
          <blockquote
            className="font-display text-fluid-quote font-light italic leading-normal text-cream my-8 transition-all duration-600"
            key={currentIdx}
            style={{
              animation: "fadeUp 0.6s ease both",
            }}
          >
            &ldquo;{current.comment}&rdquo;
          </blockquote>
          <p className="text-[13px] tracking-[0.2em] uppercase text-cream/60 font-medium">
            {current.guest_name ?? "Anonymous Guest"}
            {current.date && ` — ${current.date}`}
          </p>

          {reviews.length > 1 && (
            <div className="flex justify-center gap-2.5 mt-12">
              {reviews.slice(0, Math.min(reviews.length, 5)).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 border-none cursor-pointer ${
                    i === currentIdx
                      ? "bg-gold-light scale-[1.3]"
                      : "bg-cream/25 hover:bg-cream/40"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClientReviews;
