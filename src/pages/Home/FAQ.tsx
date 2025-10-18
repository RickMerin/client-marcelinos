import { useState } from "react";

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept gcash, paypal, and cash payments.",
    },
    {
      question: "What is your check-in and check-out time?",
      answer: "Check-in starts at 2:00 PM, and check-out is until 12:00 PM.",
    },
    {
      question: "Is Wi-Fi available in all rooms?",
      answer:
        "Yes, complimentary high-speed Wi-Fi is available in all rooms and public areas.",
    },
    {
      question: "Is there a cancellation fee?",
      answer:
        "Cancellations made within 24 hours of the check-in date may incur a fee. Please review your booking details for more information.",
    },
    {
    question: "Do you have facilities for events or meetings?",
    answer:
      "Yes, we have function rooms and event spaces suitable for meetings, parties, and small gatherings. Contact our events team for more details.",
  },
  ];

  const toggleFAQ = (index:any) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
        

      {/* FAQ Section */}
      <div className="w-full">
      <h2 className="text-3xl font-bold mb-3 text-center md:text-center">
          <span className="green header">FREQUENTLY</span>{" "}
          <span className="yellow header">ASKED</span>{" "}
          <span className="green header">QUESTIONS</span>

        </h2>
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

  );
}
export default FAQ;
