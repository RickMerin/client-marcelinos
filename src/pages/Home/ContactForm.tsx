import { useState } from "react";
import FAQ from "./FAQ";
import { ButtonLoader } from "@/components/ui/loader";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "@/lib/logger/toast";

/**
 * ContactForm Component
 * ---------------------
 * This component provides a contact form where users can submit their inquiries.
 * The form data is sent to a backend API endpoint using a POST request.
 * Toast notifications surface success and error states.
 */
function ContactForm() {
  // Type definitions for form and alerts
  interface FormData {
    full_name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }

  interface SweetAlertConfig {
    title: string;
    text: string;
    icon: "success" | "error" | "warning" | "info" | "question";
    confirmButtonColor: string;
  }

  // Initialize form state using useState hook
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const contactMutation = useApiMutation("post", {
    onSuccess: () => {
      toast.success({
        content: "Message sent! We'll get back to you soon.",
      });

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    },
    onError: () => {
      toast.error({
        content: "Oops, something went wrong. Please try again later.",
      });
    },
  });

  /**
   * handleChange
   * ------------
   * Handles changes in any form input field.
   * Updates the corresponding value in the `formData` state dynamically.
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    contactMutation.mutate({ url: endpoints.contact, body: formData });
  };

  return (
    <div className="container mx-auto faq-container flex flex-col md:flex-row gap-10 md:gap-12 py-8">
      {/* Contact Form - theme borders, readable inputs */}
      <div className="w-full md:w-1/2 bg-white shadow-lg rounded-2xl border border-(--color-sage-muted) overflow-hidden">
        <h2
          id="contact-heading"
          className="font-display text-3xl font-bold tracking-tight flex justify-center gap-2 text-center mb-6 pt-6 text-(--color-charcoal)">
          <span className="green">CONTACT</span>
          <span className="yellow">US</span>
        </h2>

        <div className="p-6 pt-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4"
            noValidate>
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
              aria-label="Full name"
              className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              aria-label="Email address"
              className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChange={handleChange}
              aria-label="Phone number"
              className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow"
            />
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              aria-label="Subject"
              className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow bg-white">
              <option value="">Subject</option>
              <option value="Booking Inquiry">Booking Inquiry</option>
              <option value="Event Request">Event Request</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              name="message"
              placeholder="Your Message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
              aria-label="Message"
              className="border border-(--color-sage-muted) rounded-xl px-4 py-3 text-(--color-charcoal) placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-(--color-sage) focus:border-transparent transition-shadow resize-y min-h-[100px]"></textarea>
            <button
              type="submit"
              disabled={contactMutation.isPending}
              className="inline-flex items-center justify-center gap-2 bg-[#1f5d1e] text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
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
