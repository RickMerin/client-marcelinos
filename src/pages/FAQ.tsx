import { useState } from "react";

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, debit cards, and cash payments.",
    },
    {
      question: "What is your check-in and check-out time?",
      answer: "Check-in starts at 2:00 PM, and check-out is until 12:00 PM.",
    },
    {
      question: "Is breakfast included in the room rate?",
      answer: "Yes, breakfast is included in selected room rates.",
    },
    {
      question: "Do you offer airport transfer services?",
      answer:
        "Yes, we provide airport pickup and drop-off services. Please contact our concierge at least 24 hours in advance to arrange your transfer and confirm the rates.",
    },
    {
      question: "Is there a cancellation fee?",
      answer:
        "Cancellations made within 24 hours of the check-in date may incur a fee. Please review your booking details for more information.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
        <h2 className="text-3xl font-bold mt-4 text-center md:text-center">
          <span className="green">FREQUENTLY</span>{" "}
          <span className="yellow">ASKED</span>{" "}
          <span className="green">QUESTIONS</span>

        </h2>
    <div className="faq-container flex flex-col md:flex-row gap-8 py-12 px-6 md:px-20">
        
      {/* Contact Form */}
      <div className="w-full md:w-1/2 bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl yellow font-bold text-center mb-6">
          Contact Us
        </h2>
        <form className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <select className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600">
            <option>Subject</option>
            <option>Booking Inquiry</option>
            <option>Event Request</option>
            <option>Other</option>
          </select>
          <textarea
            placeholder="Your Message"
            rows="4"
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

      {/* FAQ Section */}
      <div className="w-full md:w-1/2">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-800 hover:bg-gray-50"
              >
                {faq.question}
                <span className="text-yellow-500 text-2xl">
                  {activeIndex === index ? "−" : "+"}
                </span>
              </button>
              {activeIndex === index && (
                <div className="p-4 text-gray-600 border-t bg-gray-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>

  );
}
export default FAQ;
