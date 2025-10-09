🧩 FormWrapper — Reusable Form Component

A lightweight, reusable form generator built with React Hook Form, Zod, and shadcn/ui.
It allows developers to quickly scaffold and validate forms without repetitive boilerplate.

-

⚙️ Features

✅ Zod schema validation out of the box

⚡ React Hook Form integration for performance and control

🧱 Dynamic fields from a config array

💅 Works seamlessly with shadcn/ui components

🧾 Handles both Input and Textarea automatically

-

📦 File Structure

```plaintext
src/
└── components/
    ├── ui/
    │   ├── form.tsx
    │   ├── input.tsx
    │   ├── textarea.tsx
    │   └── button.tsx
    ├── FormWrapper.tsx      # Reusable component
    └── ContactForm.tsx      # Example usage
```

-

🚀 Getting Started

**1. Import the Wrapper**

```tsx
import { FormWrapper } from "@/components/FormWrapper";
import { z } from "zod";
```

**2. Define Your Schema**

Define validation using Zod — this ensures strong typing and runtime safety.

```tsx
const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
});
```

> 💡 **Pro tip:** Always type your schema values with `z.infer<typeof schema>` to ensure form consistency.

- **3. Define Your Fields**

Each field in the form is represented by a simple config object.

```tsx
const fields = [
  {
    name: "email",
    placeholder: "Enter your email",
    type: "email" as const,
  },
];
```

| Key            | Type                                                        | Description                         |
| -------------- | ----------------------------------------------------------- | ----------------------------------- |
| `name`         | `string`                                                    | Must match a key in your Zod schema |
| `label?`       | `string`                                                    | Optional visible label text         |
| `placeholder?` | `string`                                                    | Input placeholder                   |
| `type?`        | `"text" \| "number" \| "email" \| "password" \| "textarea"` | Defaults to `"text"`                |

- **4. Handle Submission**
  Define your submit handler. It receives strongly typed form data.

```tsx
const handleSubmit = (values: z.infer<typeof contactSchema>) => {
  console.log("Form submitted:", values);
};
```

- **5. Use the Wrapper**

Finally, render your form using the wrapper component.

```tsx
<FormWrapper
  schema={contactSchema}
  fields={fields}
  onSubmit={handleSubmit}
  submitLabel="Subscribe"
/>
```

-

🧰 **Props Reference**
| Prop | Type | Required | Description |
| ------------- | ------------------------------------------ | -------- | ------------------------------------- |
| `schema` | `ZodType<any, any>` | ✅ | Zod validation schema |
| `fields` | `Field[]` | ✅ | Array of field definitions |
| `onSubmit` | `(values: z.infer<typeof schema>) => void` | ✅ | Form submission handler |
| `submitLabel` | `string` | ❌ | Custom submit button label |
| `buttons` | `React.ReactNode[]` | ❌ | Optional extra buttons (e.g., cancel) |

-

🧪 **Example — Contact Form**

Here’s a minimal working example:

```tsx
import { z } from "zod";
import { FormWrapper } from "./FormWrapper";

const contactSchema = z.object({
  email: z.string().email("Invalid email"),
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
```

-

🧠 **Notes & Best Practices**

Always match field.name with keys in your Zod schema.

Keep validation logic in schemas — don’t mix it into UI.

Prefer composable, small schemas (can be reused across forms).

Add new field types (like select, checkbox, etc.) directly inside FormWrapper.

-

💡 **Extending It**

To support more input types (e.g., select, switch, checkbox), just extend this section in FormWrapper.tsx:

```tsx
{
  field.type === "textarea" ? (
    <Textarea {...inputField} placeholder={field.placeholder} />
  ) : (
    <Input
      {...inputField}
      type={field.type || "text"}
      placeholder={field.placeholder}
    />
  );
}
```
