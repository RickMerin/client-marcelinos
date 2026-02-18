import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FAQ - Frequently Asked Questions Section
 * SEO friendly with semantic markup and animated interactions using Framer Motion.
 */
function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "Currently, we only accept cash payments. Online and digital payment options are not available at this time.",
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

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="md:w-1/2"
      aria-labelledby="faq-heading"
      itemScope
      itemType="https://schema.org/FAQPage">
      {/* FAQ Header with SEO-friendly <h2> */}
      <div className="w-full">
        <h2
          id="faq-heading"
          className="text-3xl font-bold mb-3 text-center md:text-center">
          <span className="green header">FREQUENTLY</span>{" "}
          <span className="yellow header">ASKED</span>{" "}
          <span className="green header">QUESTIONS</span>
        </h2>
        <dl className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg shadow-sm"
              itemProp="mainEntity"
              itemScope
              itemType="https://schema.org/Question">
              <dt>
                <button
                  onClick={() => handleToggle(index)}
                  aria-expanded={activeIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-800 hover:bg-gray-50"
                  itemProp="name"
                  tabIndex={0}
                  type="button">
                  <span>{faq.question}</span>
                  <motion.span
                    className="text-yellow-500 text-2xl"
                    initial={false}
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}>
                    {activeIndex === index ? "−" : "+"}
                  </motion.span>
                </button>
              </dt>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.dd
                    id={`faq-answer-${index}`}
                    itemProp="acceptedAnswer"
                    itemScope
                    itemType="https://schema.org/Answer"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden">
                    <div
                      className="p-4 text-gray-600 border-t bg-gray-50"
                      itemProp="text">
                      {faq.answer}
                    </div>
                  </motion.dd>
                )}
              </AnimatePresence>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default FAQ;
