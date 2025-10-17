import { useState } from "react";
import Swal from "sweetalert2";
import FAQ from "./FAQ";

function ContactForm() {
  // 🧠 State for form inputs
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          title: "Message Sent!",
          text: "Thank you for contacting us. We'll get back to you soon.",
          icon: "success",
          confirmButtonColor: "#facc15",
        });

        setFormData({
          full_name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        Swal.fire({
          title: "Oops!",
          text: "Something went wrong. Please try again later.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
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
      {/* CONTACT FORM */}
      <div className="w-full md:w-1/2 bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl yellow font-bold text-center mb-6">
          Contact Us
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

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

          <textarea
            name="message"
            placeholder="Your Message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          ></textarea>

          <button
            type="submit"
            className="yellow-bg text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* FAQ COMPONENT */}
      <FAQ />
    </div>
  );
}

export default ContactForm;
