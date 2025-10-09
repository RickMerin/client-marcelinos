import { z } from "zod";
import { FormWrapper } from "./FormWrapper";

const contactSchema = z.object({
  email: z.email("Invalid email"),
});

export default function ContactForm() {
  const fields = [
    {
      name: "email",
      placeholder: "Enter your email",
      type: "email" as const,
    },
  ];

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
