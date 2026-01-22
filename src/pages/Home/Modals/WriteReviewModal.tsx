import React, { useState } from "react";
import { Star } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface WriteReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    stars: number;
    review_text: string;
  }) => Promise<void> | void;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const MySwal = withReactContent(Swal);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation
    if (stars === 0) {
      setError("Please select at least one star.");
      return;
    }
    if (review.trim().length < 5) {
      setError("Please write a review with at least 5 characters.");
      return;
    }

    // ✅ Clear error
    setError("");

    // ✅ Submit data
    await onSubmit({ stars, review_text: review });
    setStars(0);
    setReview("");
    onClose();

    await MySwal.fire({
      icon: "success",
      title: (
        <p className="text-base font-semibold text-green-700">Thank you!</p>
      ),
      html: (
        <p className="text-sm text-gray-700">
          Your review has been submitted successfully.
        </p>
      ),
      confirmButtonColor: "#1f5d1e",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black">
          ✕
        </button>

        <h2 className="text-xl font-semibold text-green-800 text-center mb-4">
          Write a Review
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ⭐ Star Rating */}
          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  className="focus:outline-none">
                  <Star
                    className={`w-8 h-8 ${
                      s <= stars
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* ❗ Error below stars */}
            {error && (
              <p className="text-sm text-red-600 font-medium text-center">
                {error}
              </p>
            )}
          </div>

          {/* 📝 Review Textarea */}
          <textarea
            placeholder="Share your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full border rounded-lg p-3 min-h-30 outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* 🔘 Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReviewModal;
