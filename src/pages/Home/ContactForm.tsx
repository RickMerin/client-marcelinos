import { useState } from "react";
import { z } from "zod";
import { ButtonLoader } from "@/components/ui/loader";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "@/lib/logger/toast";

const contactSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email()
    .refine(
      (val) => z.string().email().safeParse(val).success,
      { message: "Invalid email address" }
    ),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      const normalized = val.replace(/\s|-/g, "");
      const phPhoneRegex = /^(?:\+63|63|0)9\d{9}$/;
      return phPhoneRegex.test(normalized);
    }, {
      message: "Invalid phone number (Use 09171234567 or +639171234567)",
    })
    .transform((val) => {
      if (!val) return "";
      const normalized = val.replace(/\s|-/g, "");
      if (normalized.startsWith("09")) return "+63" + normalized.slice(1);
      if (normalized.startsWith("63")) return "+" + normalized;
      return normalized;
    }),

  subject: z.string().trim().min(1, "Please select a subject"),
  message: z.string().trim().min(1, "Message cannot be empty"),
});

type FormData = z.infer<typeof contactSchema>;

function ContactForm() {
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
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Oops, something went wrong. Please try again later.";
      toast.error({ content: errorMessage });
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
    contactMutation.mutate({ url: endpoints.contact, body: result.data });
  };

  const inputClass =
    "border border-sand-dark rounded-[3px] px-4 py-3.5 text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-shadow w-full bg-white text-base";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="section-eyebrow justify-center">Get in Touch</div>
      <h2
        id="contact-heading"
        className="font-display text-[clamp(36px,4vw,56px)] font-light text-center mb-12 text-ink"
      >
        Contact <em className="italic text-gold">Us</em>
      </h2>

      <div className="bg-white rounded-[4px] border border-sand-dark overflow-hidden p-6 md:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-5" noValidate>
          <div>
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className={inputClass}
            />
            {formErrors.full_name && (
              <p className="text-left w-full text-sm ml-1 text-red-600 mt-1.5">{formErrors.full_name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
            {formErrors.email && (
              <p className="text-left w-full text-sm ml-1 text-red-600 mt-1.5">{formErrors.email}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
            {formErrors.phone && (
              <p className="text-left w-full text-sm ml-1 text-red-600 mt-1.5">{formErrors.phone}</p>
            )}
          </div>

          <div>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Subject</option>
              <option value="Booking Inquiry">Booking Inquiry</option>
              <option value="Event Request">Event Request</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.subject && (
              <p className="text-left w-full text-sm text-red-600 mt-1.5">{formErrors.subject}</p>
            )}
          </div>

          <div>
            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={`${inputClass} resize-y min-h-[120px]`}
            />
            {formErrors.message && (
              <p className="text-left w-full text-sm ml-1 text-red-600 mt-1.5">{formErrors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || contactMutation.isPending}
            className={`btn-primary-mockup w-full text-center min-h-[48px] inline-flex items-center justify-center gap-2 ${
              !isFormValid ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {contactMutation.isPending ? <ButtonLoader /> : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
