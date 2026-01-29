import { z } from "zod";

/* ---------------- helpers ---------------- */
const toUpperCase = (value: string) => value.trim().toUpperCase();

/* ---------------- schema ---------------- */
export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required").transform(toUpperCase),

  middleName: z
    .union([z.string(), z.null()])
    .transform((v) =>
      v && typeof v === "string" && v.trim() ? v.trim().toUpperCase() : null,
    ),

  lastName: z.string().min(1, "Last name is required").transform(toUpperCase),

  gender: z.enum(["Male", "Female"], {
    message: "Please select a gender",
  }),

  phone: z
    .string()
    .regex(/^09\d{9}$/, "Phone must start with 09 and be 11 digits"),

  email: z.string().email("Invalid email address"),

  address: z.string().min(1, "Address is required").transform(toUpperCase),

  idFile: z.string().nullable().optional(),
});

export type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;
