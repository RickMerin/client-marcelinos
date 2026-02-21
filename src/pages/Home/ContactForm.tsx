import { useState } from "react";
import FAQ from "./FAQ";
import { ButtonLoader } from "@/components/ui/loader";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "@/lib/logger/toast";

function ContactForm() {
  interface FormData {
    full_name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({
    full_name: "",
    email: "",
    subject: "",
    message: "",
  });

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const contactMutation = useApiMutation("post", {
    onSuccess: () => {
      toast.success({ content: "Message sent! We'll get back to you soon." });
      setFormData({ full_name: "", email: "", phone: "", subject: "", message: "" });
      setFormErrors({ full_name: "", email: "", subject: "", message: "" });
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

    // Validate field
    let error = "";
    switch (name) {
      case "full_name":
        if (!value.trim()) error = "Full name is required";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!isValidEmail(value)) error = "Invalid email address";
        break;
      case "subject":
        if (!value.trim()) error = "Please select a subject";
        break;
      case "message":
        if (!value.trim()) error = "Message cannot be empty";
        break;
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Check if form is valid
  const isFormValid =
    formData.full_name.trim() &&
    isValidEmail(formData.email) &&
    formData.subject.trim() &&
    formData.message.trim() &&
    !formErrors.full_name &&
    !formErrors.email &&
    !formErrors.subject &&
    !formErrors.message;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    contactMutation.mutate({ url: endpoints.contact, body: formData });
  };

  return (
    <div className="container mx-auto faq-container flex flex-col md:flex-row gap-10 md:gap-12 py-8">
      <div className="w-full md:w-1/2 bg-white shadow-lg rounded-2xl border border-(--color-sage-muted) overflow-hidden">
        <h2
          id="contact-heading"
          className="font-display text-3xl font-bold tracking-tight flex justify-center gap-2 text-center mb-6 pt-6 text-(--color-charcoal)"
        >
          <span className="green">CONTACT</span>
          <span className="yellow">US</span>
        </h2>

        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                aria-label="Full name"
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow w-full"
              />
              {formErrors.full_name && (
                <p className="text-sm ml-2 text-red-600 mt-1">{formErrors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                aria-label="Email address"
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow w-full"
              />
              {formErrors.email && (
                <p className="text-sm  ml-2 text-red-600 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                aria-label="Phone number"
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow w-full"
              />
            </div>

            {/* Subject */}
            <div>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                aria-label="Subject"
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow bg-white w-full"
              >
                <option value="">Subject</option>
                <option value="Booking Inquiry">Booking Inquiry</option>
                <option value="Event Request">Event Request</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.subject && (
                <p className="text-sm text-red-600 mt-1">{formErrors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                aria-label="Message"
                className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow resize-y min-h-[100px] w-full"
              />
              {formErrors.message && (
                <p className="text-sm ml-2 text-red-600 mt-1">{formErrors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || contactMutation.isPending}
              className={`
                inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl
                transition-colors min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                ${isFormValid
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-white cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed text-gray-600'}
              `}
            >
              {contactMutation.isPending ? <ButtonLoader /> : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      <FAQ />
    </div>
  );
}

export default ContactForm;