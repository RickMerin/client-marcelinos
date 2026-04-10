"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, ChevronRight } from "lucide-react";
import { API } from "@/lib/api/apiClient";

type Message = {
  from: "bot" | "user";
  text: string;
};

type BubbleChatFaq = {
  id: number;
  question: string;
  answer: string;
  sort_order?: number;
};

type BubbleChatFaqResponse = {
  success?: boolean;
  data?: BubbleChatFaq[];
};

const FAQS_FALLBACK: BubbleChatFaq[] = [
  {
    id: 1,
    question: "What payment methods do you accept?",
    answer:
      "Currently, we only accept cash payments. Online and digital payment options are not available at this time.",
  },
  {
    id: 2,
    question: "What is your check-in and check-out time?",
    answer: "Check-in starts at 12:00 PM, and check-out is until 10:00 AM.",
  },
  {
    id: 3,
    question: "Is Wi-Fi available in all rooms?",
    answer:
      "Yes, complimentary high-speed Wi-Fi is available in all rooms and public areas.",
  },
  {
    id: 4,
    question: "Is there a cancellation fee?",
    answer:
      "Cancellations made within 24 hours of the check-in date may incur a fee. Please review your booking details for more information.",
  },
  {
    id: 5,
    question: "Do you have facilities for events or meetings?",
    answer:
      "Yes, we have function and event spaces suitable for meetings, parties, and small gatherings. Contact our events team for more details.",
  },
];

export default function BubbleChat() {
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Welcome! I'm your virtual concierge, here to help you with any questions about your stay.\n\nTap any question below to get started.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [faqs, setFaqs] = useState<BubbleChatFaq[]>(FAQS_FALLBACK);

  useEffect(() => {
    let isMounted = true;

    const loadFaqs = async () => {
      try {
        const response = await API.get<BubbleChatFaqResponse>("/bubble-chat-faqs");
        const items = Array.isArray(response?.data)
          ? response.data
              .filter(
                (item) =>
                  typeof item?.question === "string" &&
                  item.question.trim().length > 0 &&
                  typeof item?.answer === "string" &&
                  item.answer.trim().length > 0,
              )
              .map((item, index) => ({
                id: item.id ?? index + 1,
                question: item.question,
                answer: item.answer,
                sort_order: item.sort_order ?? 0,
              }))
          : [];

        if (!isMounted || items.length === 0) return;
        setFaqs(items);
      } catch {
        // Keep fallback questions when API is unavailable.
      }
    };

    void loadFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFaqClick = (faq: BubbleChatFaq) => {
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
    setMessages((prev) => [...prev, { from: "user", text: faq.question }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: faq.answer }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* CHAT BUBBLE + PROMPT */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 ${
          open ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        } transition-transform duration-300`}>
        {showPrompt && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-white/95 px-2 py-1.5 text-right text-xs font-medium text-gray-800 shadow-md ring-1 ring-black/5 hover:bg-white transition-colors">
            Hi, need help?
          </button>
        )}
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-green-700 text-white shadow-lg hover:bg-green-800 transition-transform duration-300 animate-pulse">
          <MessageCircle className="transition-transform duration-300" />
        </button>
      </div>

      {/* CHAT WINDOW */}
      <div
        className={`
          fixed bottom-4 right-4 sm:right-6 z-50
          w-[90%] max-w-lg
          max-h-[60vh]
          rounded-2xl border shadow-2xl overflow-hidden flex flex-col
          transform transition-all duration-500
          ${open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-10 scale-95 pointer-events-none"}
        `}
        style={{
          background: "linear-gradient(135deg, #a7f3d0 0%, #fef08a 100%)", // green to yellow
        }}>
        {/* HEADER */}
        <div className="flex items-center justify-between  bg-white opacity-70 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-full text-white flex items-center justify-center font-bold">
              <div className="relative inline-block">
                <img
                  src="/brand-logo.webp"
                  alt="Brand Logo"
                  className="block"
                />

                {/* Status circle */}
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-600 rounded-full border-2 border-white"></span>
              </div>
            </div>
            <div>
              <p className="text-sm green font-semibold">
                Marcelino's Concierge
              </p>

              <p className="text-xs green">Ready to help</p>
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              setShowPrompt(false);
            }}
            className="transition-transform duration-200 hover:scale-110">
            <X className="h-5 w-5 text-black/50" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] transition-all duration-300 ${
                msg.from === "user" ? "ml-auto w-fit text-right" : ""
              }`}>
              <p
                className={`mb-1 text-[10px] uppercase tracking-wide font-semibold ${
                  msg.from === "user" ? "text-green-800" : "text-green-700"
                }`}>
                {msg.from === "bot" ? "Marcelino's Concierge" : "You"}
              </p>
              <div
                className={`rounded-xl px-3 py-2 shadow-sm whitespace-pre-line transition-all duration-300 ${
                  msg.from === "user"
                    ? "bg-green-700 text-white"
                    : "bg-green-50 border-l-4 border-green-600 text-gray-800"
                }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="max-w-[60%] text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce delay-0"></div>
              <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce delay-300"></div>
            </div>
          )}

          {/* Inline suggested replies (user's questions) */}
          {faqs.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-green-700 font-semibold text-right">
                You can ask
              </p>
              <div className="flex flex-wrap gap-2 justify-end">
                {faqs.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleFaqClick(faq)}
                    className="inline-flex items-center gap-1 rounded-full bg-green-700/90 text-white px-3 py-2 text-xs hover:bg-green-800 transition shadow-sm max-w-[85%]">
                    <span className="truncate">{faq.question}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="py-2 text-center text-[10px] green shrink-0">
          Powered by Marcelino's Virtual Concierge
        </div>
      </div>
    </>
  );
}
