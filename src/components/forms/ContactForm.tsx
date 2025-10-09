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
    },
  ];

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof contactSchema>) => {
    console.log("Form submitted:", values);
  };

  return (
    <FormWrapper
      schema={contactSchema}
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Subscribe"
    />
  );
}
