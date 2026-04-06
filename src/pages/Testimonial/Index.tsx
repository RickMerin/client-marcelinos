import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API } from "@/lib/api/apiClient";
import type { BookingReferenceResponse } from "@/types/booking.types";
import { InlineLoader, ButtonLoader } from "@/components/ui/loader";

const MySwal = withReactContent(Swal);

export default function TestimonialPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const reference = searchParams.get("reference");
  const identifier = token ?? reference;

  const [booking, setBooking] = useState<BookingReferenceResponse["booking"] | null>(null);
  const [hasTestimonial, setHasTestimonial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  // Title state removed
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      setError("Missing link. Please use the link from your email.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const bookingPath = token
      ? `bookings/receipt/${encodeURIComponent(token)}`
      : `bookings/reference/${encodeURIComponent(reference!)}`;

    API.get<BookingReferenceResponse>(bookingPath)
      .then((data) => {
        if (!cancelled && data.booking) {
          setBooking(data.booking);
          setHasTestimonial(Boolean(data.has_testimonial));
        } else if (!cancelled) {
          setError("Booking not found.");
        }
      })
      .catch((err: Error & { response?: { status: number } }) => {
        if (!cancelled) {
          const msg = err.response?.status === 404
            ? "Booking not found."
            : (err.message || "Failed to load booking.");
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [identifier, token, reference]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (rating < 1 || rating > 5) {
      setFormError("Please select a rating from 1 to 5 stars.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Please share your experience in a few words.");
      return;
    }
    if (comment.trim().length < 10) {
      setFormError("Please write at least 10 characters.");
      return;
    }

    if (!identifier) return;
    setSubmitting(true);

    try {
      const reviewPath = token
        ? `bookings/receipt/${encodeURIComponent(token)}/review`
        : `bookings/reference/${encodeURIComponent(reference!)}/review`;

      await API.post<{ message: string }>(reviewPath, {
        rating,
        comment: comment.trim(),
      });

      await MySwal.fire({
        icon: "success",
        title: (
          <p className="text-base font-semibold text-green-700">Thank you!</p>
        ),
        html: (
          <p className="text-sm text-gray-700">
            Your review has been submitted. We appreciate your feedback.
          </p>
        ),
        confirmButtonColor: "#1f5d1e",
      });

      setRating(0);
      setComment("");
      setHasTestimonial(true);
    } catch (err: unknown) {
      const message =
        (err as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to submit review. Please try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#faf7f2] min-h-[60vh] flex items-center justify-center px-4">
        <InlineLoader message="Loading..." className="min-h-[40vh]" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#faf7f2] min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold green mb-2">Invalid or missing link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg green-bg hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </section>
    );
  }

  if (hasTestimonial) {
    return (
      <section className="bg-[#faf7f2] min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold green mb-2">Thank you</h1>
          <p className="text-gray-600 mb-6">
            You have already submitted a review for this stay.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg green-bg hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </section>
    );
  }

  const guestName =
    booking?.guest &&
    typeof booking.guest === "object" &&
    "first_name" in booking.guest &&
    "last_name" in booking.guest
      ? `${(booking.guest as { last_name?: string }).last_name || ""} ${(booking.guest as { first_name?: string }).first_name || ""}`.trim()
      : "Guest";

  return (
    <section className="bg-[#faf7f2] min-h-[60vh] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#1f5d1e] font-medium hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            <span className="green">Share your experience</span>
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Hi {guestName}, we hope you enjoyed your stay. Your feedback helps us improve.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star rating */}
            <div className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="focus:outline-none transition transform hover:scale-110"
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 ${
                        s <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title field removed as requested */}

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Your review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#1f5d1e] focus:border-transparent resize-y min-h-[120px]"
              />
              <p className="text-xs text-gray-500 mt-1">At least 10 characters.</p>
            </div>

            {formError && (
              <p className="text-sm text-red-600 font-medium text-center">
                {formError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <Link
                to="/"
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-center font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold green-bg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition min-w-[140px]"
              >
                {submitting ? <ButtonLoader /> : "Submit review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
