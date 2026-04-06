import { z } from "zod";
import { FormWrapper } from "./FormWrapper";

// Define the schema using zod
const contactSchema = z.object({
  email: z.email("Invalid email"),
});

export default function ContactForm() {
  // Define the fields for the form
  const fields = [
    {
      name: "email",
      placeholder: "Enter your email",
      type: "email" as const,
      className: "border-none bg-dark",
    },
  ];

  // Handle form submission
  const handleSubmit = () => {
    // Form submission logic
  };

  return (
    <FormWrapper
      schema={contactSchema}
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Subscribe"
      className="flex flex-col gap-4"
    />
  );
}
