"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PHAddressSelector } from "@/components/forms/PHAddressSelector";

import {
  createPersonalDetailsSchema,
  type PersonalDetailsFormValues,
  type PersonalDetailsParsedValues,
} from "@/lib/validators/personalDetails.schema";

import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/lib/storage/localStorage";
import { FormData } from "@/types/booking.types";

/** FormData for step 2: same as PersonalDetailsFormValues but gender can be "" when not selected */
type Step2FormData = Omit<PersonalDetailsFormValues, "gender"> & {
  gender: PersonalDetailsFormValues["gender"] | "";
};

interface Props {
  formData: Step2FormData;
  onUpdate: (data: PersonalDetailsParsedValues) => void;
  onValuesChange?: (updates: Partial<FormData>) => void;
}

const STORAGE_KEY = "reservationDetails.personal";
const ADDRESS_STORAGE_KEY = "reservationDetails.personal.phAddress";

export function Step2({ formData, onUpdate, onValuesChange }: Props) {
  const saved = getFromLocalStorage(STORAGE_KEY);

  const raw = saved ?? formData;
  const toUpper = (v: string) =>
    v != null && v !== "" ? String(v).toUpperCase() : v;

  const isInternationalAddress = () => {
    const storedAddress = getFromLocalStorage(ADDRESS_STORAGE_KEY) as
      | { addressType?: "local" | "international" }
      | null;
    return storedAddress?.addressType === "international";
  };

  const [isInternational, setIsInternational] = useState(isInternationalAddress());

  const form = useForm<
    PersonalDetailsFormValues,
    unknown,
    PersonalDetailsParsedValues
  >({
    resolver: zodResolver(createPersonalDetailsSchema(isInternational)),
    defaultValues: {
      ...raw,
      firstName: toUpper(raw.firstName) ?? "",
      middleName:
        raw.middleName != null && raw.middleName !== ""
          ? String(raw.middleName).toUpperCase()
          : null,
      lastName: toUpper(raw.lastName) ?? "",
      gender:
        raw.gender === "male" || raw.gender === "female" || raw.gender === "other"
          ? raw.gender
          : undefined,
      phone: raw.phone ?? "",
      email: raw.email ?? "",
      address: toUpper(raw.address) ?? "",
    },
    mode: "onChange",
  });

  /* ---------- scroll to top when Step2 is shown ---------- */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  /* ---------- sync current values to parent (so Continue stays disabled when gender empty) ---------- */
  useEffect(() => {
    const sub = form.watch((values) => {
      const schema = createPersonalDetailsSchema(isInternational);

      onValuesChange?.({
        firstName: values.firstName,
        middleName: values.middleName ?? null,
        lastName: values.lastName,
        gender:
          values.gender === "male" || values.gender === "female" || values.gender === "other"
            ? values.gender
            : "",
        phone: values.phone,
        email: values.email,
        address: values.address,
      });
      const parsedResult = schema.safeParse(values);
      if (parsedResult.success) {
        try {
          const parsed = parsedResult.data;
          onUpdate(parsed);
          saveToLocalStorage(STORAGE_KEY, parsed);
        } catch (e) {
          // ignore parse errors here, formState.isValid should prevent this
        }
      }
    });

    return () => sub.unsubscribe();
  }, [form, isInternational, onUpdate, onValuesChange]);

  useEffect(() => {
    if (!isInternational) return;
    // Foreign guests are not required to provide local contact number.
    form.setValue("phone", "", { shouldValidate: true, shouldDirty: true });
  }, [form, isInternational]);

  const labelClass =
    "text-sm font-medium text-ink-soft [&>.text-muted]:opacity-70";
  const requiredMark = (
    <span className="text-red-500" aria-hidden>
      *
    </span>
  );

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="space-y-2">
          <p className="booking-funnel-eyebrow">Guest details</p>
          <h2 className="landing-section-title">Personal Information</h2>
          <p className="text-sm opacity-80 max-w-2xl text-ink-soft">
            We&apos;ll use this to confirm your booking and get in touch. All
            fields marked with * are required.
          </p>
        </div>

        <div className="booking-form-panel">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4 text-ink">
                Your name
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        First Name {requiredMark}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          placeholder="Juan"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Last Name {requiredMark}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          placeholder="Dela Cruz"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className={labelClass}>
                        Middle Name{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          placeholder="Optional"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel className={labelClass}>
                      Gender {requiredMark}
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                        onBlur={field.onBlur}
                        aria-invalid={!!form.formState.errors.gender}
                        className="h-12 w-full rounded-md border border-input bg-transparent px-3 text-sm text-ink shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>option]:bg-background">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4 text-ink">
                Contact details
              </h3>
              <div
                className={`grid grid-cols-1 gap-4 ${
                  isInternational ? "sm:grid-cols-1" : "sm:grid-cols-2"
                }`}>
                {!isInternational && (
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>
                          Phone Number {requiredMark}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            type="tel"
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            placeholder="09XXXXXXXXXX"
                          />
                        </FormControl>
                        <p className="italic text-xs text-yellow-500 mt-1">
                        A valid 11 digit Philippine phone number is required for local guests.
                      </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Email Address {requiredMark}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="email"
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="name@domain.com"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="italic text-xs text-yellow-500 mt-1">
                        A valid email address is required for booking verification
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4 text-ink">
                Address
              </h3>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>
                      Full address / Country {requiredMark}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <PHAddressSelector
                          value={field.value ?? ""}
                          onChange={(next) => field.onChange(next || "")}
                          onAddressTypeChange={(addressType) =>
                            setIsInternational(addressType === "international")
                          }
                        />
                        <input
                          type="hidden"
                          name={field.name}
                          ref={field.ref}
                          value={field.value ?? ""}
                          onBlur={field.onBlur}
                          readOnly
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
