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
  // Initialize form state using useState hook
  const [formData, setFormData] = useState({
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
  interface FormData {
    full_name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target; // Extract the input's name and current value
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value, // Update only the specific field that changed
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault(); // Prevent the default form submission behavior (page reload)
    contactMutation.mutate({ url: endpoints.contact, body: formData });
  };

  return (
    <div className="container mx-auto faq-container flex flex-col md:flex-row gap-8 py-12">
      {/* ========================== CONTACT FORM SECTION ========================== */}
      <div className="w-full md:w-1/2 bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl yellow font-bold text-center mb-6">
          Contact Us
        </h2>

        {/* The form element – handles input and submission */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Full Name Input */}
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* Email Address Input */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* Phone Number Input (optional) */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* Subject Selection Dropdown */}
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600">
            <option value="">Subject</option>
            <option value="Booking Inquiry">Booking Inquiry</option>
            <option value="Event Request">Event Request</option>
            <option value="Other">Other</option>
          </select>

          {/* Message Textarea */}
          <textarea
            name="message"
            placeholder="Your Message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={contactMutation.isPending}
            className="inline-flex items-center justify-center gap-2 yellow-bg text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px]">
            {contactMutation.isPending ? <ButtonLoader /> : "Send Message"}
          </button>
        </form>
      </div>

      {/* ==== FAQ SECTION ======== */}
      <FAQ />
    </div>
  );
}

// Export the component so it can be imported and used in other files
export default ContactForm;
