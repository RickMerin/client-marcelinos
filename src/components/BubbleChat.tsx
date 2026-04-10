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
            className="rounded-md border border-[rgba(198,161,91,0.55)] bg-[rgba(198,161,91,0.95)] px-2.5 py-1.5 text-right text-xs font-semibold tracking-wide text-[#0F1F3D] shadow-md hover:bg-[rgba(230,211,163,0.96)] transition-colors">
            Hi, need help?
          </button>
        )}
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(230,211,163,0.55)] bg-[linear-gradient(145deg,#C6A15B,#B8955A)] text-[#0F1F3D] shadow-[0_12px_30px_rgba(15,31,61,0.35)] hover:brightness-105 transition-transform duration-300 animate-pulse">
          <MessageCircle className="transition-transform duration-300" />
        </button>
      </div>

      {/* CHAT WINDOW */}
      <div
        className={`
          fixed bottom-4 right-4 sm:right-6 z-50
          w-[90%] max-w-lg
          max-h-[60vh]
          rounded-2xl border border-[rgba(230,211,163,0.28)] shadow-2xl overflow-hidden flex flex-col
          before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(115deg,transparent_0%,transparent_36%,rgba(230,211,163,0.10)_48%,transparent_60%,transparent_100%)] before:translate-x-[-120%] before:animate-[chat-luxury-shimmer_6s_ease-in-out_infinite]
          transform transition-all duration-500
          ${open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-10 scale-95 pointer-events-none"}
        `}
        style={{
          background:
            "linear-gradient(160deg, rgba(14,27,44,0.98) 0%, rgba(20,38,60,0.98) 55%, rgba(11,21,36,0.98) 100%)",
        }}>
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[rgba(230,211,163,0.28)] bg-[rgba(198,161,91,0.16)] px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-full text-white flex items-center justify-center font-bold">
              <div className="relative inline-block">
                <img
                  src="/brand-logo.webp"
                  alt="Brand Logo"
                  className="block"
                />

                {/* Status circle */}
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0F1F3D] bg-[#C6A15B]"></span>
              </div>
            </div>
            <div>
              <p className="font-display text-base font-semibold tracking-[0.02em] text-[#F6F7F5]">
                Marcelino's Concierge
              </p>

              <p className="text-xs text-[rgba(230,211,163,0.88)]">Ready to help</p>
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              setShowPrompt(false);
            }}
            className="transition-transform duration-200 hover:scale-110">
            <X className="h-5 w-5 text-[rgba(246,247,245,0.72)]" />
          </button>
        </div>

        {/* BODY */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] transition-all duration-300 ${
                msg.from === "user" ? "ml-auto w-fit text-right" : ""
              }`}>
              <p
                className={`mb-1 text-[10px] uppercase tracking-wide font-semibold ${
                  msg.from === "user"
                    ? "text-[rgba(230,211,163,0.92)]"
                    : "text-[rgba(246,247,245,0.72)]"
                }`}>
                {msg.from === "bot" ? "Marcelino's Concierge" : "You"}
              </p>
              <div
                className={`rounded-xl px-3 py-2 shadow-sm whitespace-pre-line transition-all duration-300 ${
                  msg.from === "user"
                    ? "border border-[rgba(230,211,163,0.38)] bg-[linear-gradient(145deg,#C6A15B,#B8955A)] text-[#0F1F3D] shadow-[0_6px_18px_rgba(15,31,61,0.28)]"
                    : "border border-[rgba(230,211,163,0.22)] bg-[rgba(246,247,245,0.08)] text-[#F6F7F5]"
                }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="max-w-[60%] rounded-lg border border-[rgba(230,211,163,0.25)] bg-[rgba(246,247,245,0.08)] px-3 py-2 text-[#F6F7F5] flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-[#E6D3A3] rounded-full animate-bounce delay-0"></div>
              <div className="w-2 h-2 bg-[#E6D3A3] rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-[#E6D3A3] rounded-full animate-bounce delay-300"></div>
            </div>
          )}

          {/* Inline suggested replies (user's questions) */}
          {faqs.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-[rgba(230,211,163,0.9)] font-semibold text-right">
                You can ask
              </p>
              <div className="flex flex-wrap gap-2 justify-end">
                {faqs.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleFaqClick(faq)}
                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(230,211,163,0.45)] bg-[rgba(198,161,91,0.94)] px-3 py-2 text-xs font-medium text-[#0F1F3D] hover:bg-[rgba(230,211,163,0.96)] transition shadow-sm max-w-[85%]">
                    <span className="truncate">{faq.question}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="relative z-10 shrink-0 border-t border-[rgba(230,211,163,0.2)] bg-[rgba(198,161,91,0.08)] py-2 text-center text-[10px] text-[rgba(230,211,163,0.86)]">
          Powered by Marcelino's Virtual Concierge
        </div>
      </div>
      <style>{`
        @keyframes chat-luxury-shimmer {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          18% {
            opacity: 0.85;
          }
          42% {
            opacity: 0.35;
          }
          60% {
            transform: translateX(120%);
            opacity: 0;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}