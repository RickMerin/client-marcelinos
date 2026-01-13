import { z } from "zod";

/* ---------------- helpers ---------------- */
const toTitleCase = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

/* ---------------- schema ---------------- */
export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required").transform(toTitleCase),

  middleName: z
    .string()
    .nullable()
    .transform((v) => (v ? `${v.charAt(0).toUpperCase()}.` : null)),

  lastName: z.string().min(1, "Last name is required").transform(toTitleCase),

  gender: z
    .string()
    .min(1, "Gender is required")
    .refine(
      (v) => v === "Male" || v === "Female",
      "Gender must be Male or Female"
    ),

  phone: z
    .string()
    .regex(/^09\d{9}$/, "Phone must start with 09 and be 11 digits"),

  email: z.string().email("Invalid email address"),

  address: z.string().min(1, "Address is required").transform(toTitleCase),

  idFile: z.string().nullable().optional(),
});

export type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;
