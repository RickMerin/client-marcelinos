import { Card } from "@/components/ui/card";
import ReviewSectionSkeleton from "@/components/skeleton/ReviewSectionSkeleton";

import { useApiQuery } from "@/lib/api/queries/useApiQuery";

import logo from "../../assets/img/marcelinos-logo.svg";

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

type ReviewApiResponse =
  | Review[]
  | ReviewResponse
  | { data?: Review[] | ReviewResponse | { reviews?: Review[] } }
  | undefined;

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : null;
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

  if (response && "reviews" in response && Array.isArray(response.reviews)) {
    return response.reviews.map(normalizeReview);
  }

  const nestedData = response?.data;
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

/* ---------------- COMPONENT ---------------- */

function ClientReviews() {
  /* ---------------- FETCH ---------------- */
  const { data, isLoading, isError } = useApiQuery<ReviewApiResponse>(
    ["reviews"],
    "/reviews",
  );

  const reviews = extractReviews(data).filter(
    (review) => review.comment.trim().length > 0,
  );

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
      className="w-full flex flex-col items-center"
      aria-labelledby="reviews-heading">
      <h2
        id="reviews-heading"
        className="font-display text-3xl font-bold tracking-tight text-center mb-12 text-(--color-charcoal)">
        <span className="green">CLIENT</span>{" "}
        <span className="yellow">REVIEWS</span>
      </h2>

      <div className="w-full max-w-6xl px-4 sm:px-8">
        {/* STATES */}

        {isLoading && <ReviewSectionSkeleton />}

        {isError && (
          <p className="text-center text-red-600 font-medium">
            Failed to load reviews.
          </p>
        )}

        {!isLoading && !isError && reviews.length === 0 && (
          <p className="text-center text-(--color-charcoal) opacity-80">
            No reviews yet.
          </p>
        )}

        {/* Masonry-style grid: CSS columns, varying card heights */}
        {!isLoading && !isError && reviews.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {reviews.map((review, index) => (
              <Card
                key={index}
                className="break-inside-avoid mb-6 bg-white rounded-2xl p-6 shadow-md border border-(--color-sage-muted) flex flex-col">
                {/* Quote */}
                <blockquote className="text-(--color-charcoal) text-sm leading-relaxed mb-4 italic">
                  &ldquo;{review.comment}&rdquo;
                </blockquote>

                {/* Rating stars */}
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 mr-0.5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                      fill={i < review.rating ? "currentColor" : "none"}
                      viewBox="0 0 20 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true">
                      <polygon points="10 15.27 16.18 18 14.54 11.97 19 7.24 12.81 6.63 10 1.5 7.19 6.63 1 7.24 5.46 11.97 3.82 18 10 15.27" />
                    </svg>
                  ))}
                  <span className="ml-2 text-xs text-gray-500">
                    {review.rating}/5
                  </span>
                </div>

                {/* Author: avatar, name, date, logo */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-sage-muted/60">
                  <div className="w-10 h-10 rounded-full bg-(--color-sage-muted) flex items-center justify-center font-semibold text-(--color-charcoal) shrink-0 text-sm">
                    {(review.guest_name ?? "A").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-semibold text-(--color-charcoal) truncate">
                      {review.guest_name ?? "Anonymous Guest"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(review.date)}
                    </p>
                  </div>
                  <img
                    src={logo}
                    alt=""
                    className="w-9 h-9 shrink-0 opacity-80"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ClientReviews;
