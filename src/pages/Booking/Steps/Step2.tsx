"use client";

import { useEffect } from "react";
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

import {
  personalDetailsSchema,
  type PersonalDetailsFormValues,
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
  onUpdate: (data: PersonalDetailsFormValues) => void;
  onValuesChange?: (updates: Partial<FormData>) => void;
}

const STORAGE_KEY = "reservationDetails.personal";

export function Step2({ formData, onUpdate, onValuesChange }: Props) {
  const saved = getFromLocalStorage(STORAGE_KEY);

  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      ...(saved ?? formData),
      gender:
        (saved ?? formData).gender === "Male" ||
        (saved ?? formData).gender === "Female"
          ? (saved ?? formData).gender
          : undefined,
      middleName: (saved ?? formData).middleName ?? null,
    },
    mode: "onChange",
  });

  /* ---------- sync current values to parent (so Continue stays disabled when gender empty) ---------- */
  useEffect(() => {
    const sub = form.watch((values) => {
      onValuesChange?.({
        firstName: values.firstName,
        middleName: values.middleName ?? null,
        lastName: values.lastName,
        gender:
          values.gender === "Male" || values.gender === "Female"
            ? values.gender
            : "",
        phone: values.phone,
        email: values.email,
        address: values.address,
      });
      if (form.formState.isValid) {
        try {
          const parsed = personalDetailsSchema.parse(values);
          onUpdate(parsed);
          saveToLocalStorage(STORAGE_KEY, parsed);
        } catch (e) {
          // ignore parse errors here, formState.isValid should prevent this
        }
      }
    });

    return () => sub.unsubscribe();
  }, [form, onUpdate, onValuesChange]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Personal Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField<PersonalDetailsFormValues, "lastName">
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Last Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<PersonalDetailsFormValues, "middleName">
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Middle Name{" "}
                  <small className="text-gray-400">(optional)</small>
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField<PersonalDetailsFormValues, "firstName">
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<PersonalDetailsFormValues, "gender">
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gender <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || undefined)
                    }
                    className="h-10 w-full rounded-md border px-3">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<PersonalDetailsFormValues, "phone">
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>
                  Phone Number <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<PersonalDetailsFormValues, "email">
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>
                  Email Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<PersonalDetailsFormValues, "address">
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>
                  Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
