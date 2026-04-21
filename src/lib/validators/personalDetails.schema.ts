import { z } from "zod";

/* ---------------- helpers ---------------- */
const toUpperCase = (value: string) => value.trim().toUpperCase();

/* ---------------- schema ---------------- */
export const createPersonalDetailsSchema = (isInternational = false) =>
  z.object({
    firstName: z.string().min(1, "First name is required").transform(toUpperCase),

    middleName: z
      .union([z.string(), z.null()])
      .transform((v) =>
        v && typeof v === "string" && v.trim() ? v.trim().toUpperCase() : null,
      ),

    lastName: z.string().min(1, "Last name is required").transform(toUpperCase),

    gender: z.enum(["male", "female", "other"], {
      message: "Please select a gender",
    }),

    // Keep base schema permissive; local-vs-foreign requirement is enforced in step validation.
    phone: z
      .string()
      .optional()
      .transform((v) => (v ?? "").trim().toUpperCase()),

    email: z
      .string()
      .email("Invalid email address")
      .transform((v) => v.toUpperCase()),

    address: z.string().min(1, "Address is required").transform(toUpperCase),

    idFile: z.string().nullable().optional(),
  });

export const personalDetailsSchema = createPersonalDetailsSchema(false);

export type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;
