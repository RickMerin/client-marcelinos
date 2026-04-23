import { z } from "zod";
import { FormWrapper } from "./FormWrapper";
import { toast } from "@/lib/logger/toast";

const contactSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().email("Invalid email"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be at most 1000 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const fields = [
    {
      name: "full_name",
      placeholder: "Enter your full name",
      type: "text" as const,
      className: "border-none bg-[#1E1E1E] text-white",
    },
    {
      name: "email",
      placeholder: "Enter your email",
      type: "email" as const,
      className: "border-none bg-[#1E1E1E] text-white",
    },
    {
      name: "message",
      placeholder: "Enter your message",
      type: "textarea" as const,
      className: "border-none bg-[#1E1E1E] text-white",
    },
  ];

  const handleSubmit = async (data: ContactFormValues) => {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Failed to submit form.");
    }

    toast.success({ content: "Submitted successfully." });
  };

  return (
    <FormWrapper
      schema={contactSchema}
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Subscribe"
      className="flex flex-col gap-4"
      captcha={{
        enabled: true,
        siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        theme: "dark",
        size: "normal",
        className: "flex flex-col gap-2",
        errorMessage: "Please complete the verification.",
      }}
    />
  );
}