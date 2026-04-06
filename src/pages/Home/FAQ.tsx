import { useState } from "react";
import { LazyMotion, m, AnimatePresence } from "framer-motion";

/**
 * FAQ - Frequently Asked Questions Section
 * SEO friendly with semantic markup and animated interactions using Framer Motion.
 */
function FAQ() {
  // Set the first FAQ as the default opened (index 0)
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer:
        "Currently, we only accept cash payments. Online and digital payment options are not available at this time.",
    },
    {
      question: "What is your check-in and check-out time?",
      answer: "Check-in starts at 12:00 PM, and check-out is until 10:00 AM.",
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
        "Yes, we have a function and event spaces suitable for meetings, parties, and small gatherings. Contact our events team for more details.",
    },
  ];

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      className="md:w-1/2 w-full"
      aria-labelledby="faq-heading"
      itemScope
      itemType="https://schema.org/FAQPage">
      <div className="w-full">
        <h2
          id="faq-heading"
          className="font-display text-3xl font-bold tracking-tight mb-6 text-center text-(--color-charcoal)">
          <span className="green">FREQUENTLY</span>{" "}
          <span className="yellow">ASKED</span>{" "}
          <span className="green">QUESTIONS</span>
        </h2>
        <LazyMotion features={() => import("framer-motion").then((res) => res.domAnimation)}>
          <dl className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="border border-(--color-sage-muted) rounded-xl shadow-sm overflow-hidden bg-white"
                itemProp="mainEntity"
                itemScope
                itemType="https://schema.org/Question">
                <dt>
                  <button
                    onClick={() => handleToggle(index)}
                    aria-expanded={activeIndex === index}
                    aria-controls={`faq-answer-${index}`}
                    className="w-full flex justify-between items-center gap-4 p-5 text-left text-base font-medium text-(--color-charcoal) hover:bg-sage-muted/40 transition-colors rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-sage)"
                    itemProp="name"
                    type="button">
                    <span className="leading-snug">{faq.question}</span>
                    <m.span
                      className="text-(--color-sage) shrink-0 text-xl font-light"
                      initial={false}
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}>
                      {activeIndex === index ? "−" : "+"}
                    </m.span>
                  </button>
                </dt>
                <AnimatePresence>
                  {activeIndex === index && (
                    <m.dd
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
                        className="p-5 text-base leading-relaxed text-(--color-charcoal) opacity-90 border-t border-(--color-sage-muted) bg-cream/50"
                        itemProp="text">
                        {faq.answer}
                      </div>
                    </m.dd>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </dl>
        </LazyMotion>
      </div>
    </section>
  );
}

export default FAQ;
