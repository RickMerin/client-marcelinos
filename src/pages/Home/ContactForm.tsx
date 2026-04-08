import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ButtonLoader } from "@/components/ui/loader";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "@/lib/logger/toast";

console.log("origin", window.location.origin);declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

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

      if (normalized.startsWith("09")) {
        return "+63" + normalized.slice(1);
      }

      if (normalized.startsWith("63")) {
        return "+" + normalized;
      }

      return normalized;
    }),

  subject: z.string().trim().min(1, "Please select a subject"),

  message: z.string().trim().min(1, "Message cannot be empty")
  .max(255, "Message must be at most 255 characters"),
});

type FormData = z.infer<typeof contactSchema>;

function ContactForm() {
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] =
    useState<Partial<Record<keyof FormData, string>>>({});

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string>("");

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaError("");

    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryTimer: number | null = null;

    const initTurnstile = () => {
      if (!mounted) return;

      if (!captchaRef.current) {
        retryTimer = window.setTimeout(initTurnstile, 300);
        return;
      }

      if (!window.turnstile) {
        retryTimer = window.setTimeout(initTurnstile, 300);
        return;
      }

      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(captchaRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        theme: "light",
        size: "normal",
        callback: (token: string) => {
          setCaptchaToken(token);
          setCaptchaError("");
        },
        "expired-callback": () => {
          setCaptchaToken(null);
          setCaptchaError("Captcha expired. Please verify again.");
        },
        "error-callback": () => {
          setCaptchaToken(null);
          setCaptchaError("Captcha failed. Please try again.");
        },
      });
    };

    initTurnstile();

    return () => {
      mounted = false;

      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }

      if (window.turnstile && widgetIdRef.current && window.turnstile.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
    };
  }, []);

  const contactMutation = useApiMutation("post", {
    onSuccess: () => {
      toast.success({ content: "Message sent! We'll get back to you soon." });

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setFormErrors({});
      resetCaptcha();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Oops, something went wrong. Please try again later.";

      toast.error({ content: errorMessage });
      resetCaptcha();
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

  return (
    <center>
      <div
        id="contact"
        className="w-full max-w-2xl bg-white shadow-lg rounded-2xl border border-(--color-sage-muted) overflow-hidden"
      >
        <h2
          id="contact-heading"
          className="font-display text-3xl font-bold tracking-tight flex justify-center gap-2 text-center mb-6 pt-6 text-(--color-charcoal)"
        >
          <span className="green">CONTACT</span>
          <span className="yellow">US</span>
        </h2>

        <div className="p-6 pt-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4"
            noValidate
          >
            <div>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow w-full"
              />
              {formErrors.full_name && (
                <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                  {formErrors.full_name}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow w-full"
              />
              {formErrors.email && (
                <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                  {formErrors.email}
                </p>
              )}
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow w-full"
              />
              {formErrors.phone && (
                <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                  {formErrors.phone}
                </p>
              )}
            </div>

            <div>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow bg-white w-full"
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

            <div>
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow resize-y min-h-[100px] w-full"
              />
              {formErrors.message && (
                <p className="text-left w-full text-sm ml-2 text-red-600 mt-1">
                  {formErrors.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <div ref={captchaRef} />
              {captchaError && (
                <p className="text-sm text-red-600">{captchaError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                !isFormValid || !captchaToken || contactMutation.isPending
              }
              className={`inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-colors min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isFormValid && captchaToken
                  ? "bg-[#829F6E] hover:bg-[#AFBE9C] text-white cursor-pointer"
                  : "bg-[#AFBE9C] cursor-not-allowed text-white"
              }`}
            >
              {contactMutation.isPending ? <ButtonLoader /> : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </center>
  );
}

export default ContactForm;