// Import necessary React hooks and external libraries
import { useState } from "react";
import Swal from "sweetalert2"; // For alert modals (success, error, warning messages)
import FAQ from "./FAQ"; // Importing the FAQ component to display beside the contact form

/**
 * ContactForm Component
 * ---------------------
 * This component provides a contact form where users can submit their inquiries.
 * The form data is sent to a backend API endpoint using a POST request.
 * SweetAlert2 is used to display success, error, and warning messages.
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

  /**
   * handleChange
   * ------------
   * Handles changes in any form input field.
   * Updates the corresponding value in the `formData` state dynamically.
   */
  const handleChange = (e) => {
    const { name, value } = e.target; // Extract the input's name and current value
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Update only the specific field that changed
    }));
  };

  /**
   * handleSubmit
   * ------------
   * Triggered when the user submits the form.
   * Prevents page reload, sends data to the backend API, and shows feedback alerts.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior (page reload)

    try {
      // Send a POST request to the backend API with the user's message data
      const response = await fetch("http://127.0.0.1:8000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure data is sent as JSON
        },
        body: JSON.stringify(formData), // Convert form data to JSON format
      });

      // If the response is successful (status 200–299)
      if (response.ok) {
        Swal.fire({
          title: "Message Sent!",
          text: "Thank you for contacting us. We'll get back to you soon.",
          icon: "success",
          confirmButtonColor: "#facc15",
        });

        // Reset all form fields to empty
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        // Handle non-OK responses (server errors, validation issues, etc.)
        Swal.fire({
          title: "Oops!",
          text: "Something went wrong. Please try again later.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      // Catch network or connection errors (e.g., API not reachable)
      console.error("Error:", error);
      Swal.fire({
        title: "Network Error",
        text: "Please check your internet connection.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
    }
  };

  return (
    <div className="faq-container flex flex-col md:flex-row gap-8 py-12 px-6 md:px-20">
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
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Subject</option>
            <option value="Booking Inquiry">Booking Inquiry</option>
            <option value="Event Request">Event Request</option>
            <option value="Other">Other</option>
          </select>

          {/* Message Textarea */}
          <textarea
            name="message"
            placeholder="Your Message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          ></textarea>

          {/* Submit Button */}
          <button
            type="submit"
            className="yellow-bg text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Send Message
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
