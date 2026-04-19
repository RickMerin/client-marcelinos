import { useState } from "react";
import { z } from "zod";
import { ButtonLoader } from "@/components/ui/loader";
import { useTurnstile } from "@/hooks/useTurnstile";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "@/lib/logger/toast";

const contactSchema = z.object({
  full_name: z.string().trim()
  .min(1, "Full name is required")
  .max(50, "Full name must be at most 100 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
    

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;

        const normalized = val.replace(/\s|-/g, "");
        const phPhoneRegex = /^(?:\+63|63|0)9\d{9}$/;

        return phPhoneRegex.test(normalized);
      },
      {
        message: "Invalid phone number (Use 09171234567 or +639171234567)",
      }
    )
    .transform((val) => {
      if (!val) return "";
      const normalized = val.replace(/\s|-/g, "");
      if (normalized.startsWith("09")) return "+63" + normalized.slice(1);
      if (normalized.startsWith("63")) return "+" + normalized;
      if (normalized.startsWith("09")) return "+63" + normalized.slice(1);
      if (normalized.startsWith("63")) return "+" + normalized;
      return normalized;
    }),

  subject: z.string().trim().min(1, "Please select a subject"),

  message: z.string().trim().min(1, "Message cannot be empty")
  .max(255, "Message must be at most 255 characters"),
});

type FormData = z.infer<typeof contactSchema>;

function ContactForm() {
  const {
    containerRef: captchaRef,
    token: captchaToken,
    error: captchaError,
    setError: setCaptchaError,
    reset: resetCaptcha,
  } = useTurnstile({ size: "flexible" });

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] =
    useState<Partial<Record<keyof FormData, string>>>({});

  const contactMutation = useApiMutation("post", {
    onSuccess: () => {
      toast.success({ content: "Message sent! We'll get back to you soon." });
      setFormData({ full_name: "", email: "", phone: "", subject: "", message: "" });
      setFormErrors({});
      resetCaptcha();
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Oops, something went wrong. Please try again later.";
      toast.error({ content: errorMessage });
      resetCaptcha();
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const fieldSchema = contactSchema.shape[name as keyof FormData];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: result.success ? "" : result.error.issues[0].message,
      }));
    }
  };

  const isFormValid = contactSchema.safeParse(formData).success;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setFormErrors({
        full_name: fieldErrors.full_name?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        subject: fieldErrors.subject?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Please verify you're not a robot.");
      return;
    }

    setCaptchaError("");

    contactMutation.mutate({
      url: endpoints.contact,
      body: {
        ...result.data,
        captcha_token: captchaToken,
      },
    });
  };

  const fieldClass =
    "border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow w-full min-h-[48px]";

  return (
    <div className="flex w-full justify-center">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-(--color-sage-muted) bg-white shadow-lg lg:grid-cols-2 lg:min-h-[min(32rem,70vh)]">
        <div className="relative min-h-[14rem] sm:min-h-[17rem] lg:min-h-0">
          <img
            src="/img/banner-3.webp"
            alt="Tropical resort pool and palm trees at Marcelino's"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={960}
            height={640}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 max-w-[85%] p-5 sm:p-7 text-cream">
            <p className="font-display text-fluid-h3 font-light leading-tight">
              Get in <em className="text-gold not-italic">touch</em>
            </p>
            <p className="mt-2 text-md leading-relaxed text-cream/90">
              Questions about stays, events, or the resort? Send a note—we love hearing from you.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <h2
            id="contact-heading"
            className="section-eyebrow font-bold tracking-tight flex justify-center gap-2 px-6 pt-6 text-center text-(--color-) sm:px-8"
          >
            <span className="text-gold">CONTACT</span>
            <span className="text-gold">US</span>
          </h2>

          <div className="flex flex-1 flex-col p-6 pt-4 pb-8 sm:px-8">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              noValidate
              aria-labelledby="contact-heading"
            >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-5 md:gap-y-4">
              <div className="min-w-0">
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  className={fieldClass}
                />
                {formErrors.full_name && (
                  <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                    {formErrors.full_name}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={fieldClass}
                />
                {formErrors.email && (
                  <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className={fieldClass}
                />
                {formErrors.phone && (
                  <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`${fieldClass} bg-white appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="">Subject</option>
                  <option value="Booking Inquiry">Booking Inquiry</option>
                  <option value="Event Request">Event Request</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.subject && (
                  <p className="text-left w-full text-sm text-red-600 mt-1">
                    {formErrors.subject}
                  </p>
                )}
              </div>

              <div className="min-w-0 md:col-span-2">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow resize-y min-h-[120px] w-full"
                />
                {formErrors.message && (
                  <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                    {formErrors.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="turnstile-container w-full min-w-0">
                <div ref={captchaRef} className="w-full min-w-0" />
              </div>
              {captchaError && (
                <p className="text-sm text-red-600">{captchaError}</p>
              )}
              <p className="text-center text-xs leading-relaxed text-black sm:text-left">
                We typically reply within one business day.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                !isFormValid || !captchaToken || contactMutation.isPending
              }
              className={`w-full inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-colors min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isFormValid && captchaToken
                  ? "bg-gold hover:bg-gold-light text-dark uppercase cursor-pointer"
                  : "bg-gold-light cursor-not-allowed uppercase text-dark"
              }`}
            >
              {contactMutation.isPending ? <ButtonLoader /> : "Send Message"}
            </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;

