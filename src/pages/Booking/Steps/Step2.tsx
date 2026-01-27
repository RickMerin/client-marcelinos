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

interface Props {
  formData: PersonalDetailsFormValues;
  onUpdate: (data: PersonalDetailsFormValues) => void;
}

const STORAGE_KEY = "reservationDetails.personal";

export function Step2({ formData, onUpdate, }: Props) {
  const saved = getFromLocalStorage(STORAGE_KEY);

  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: saved ?? formData,
    mode: "onChange",
  });

  /* ---------- sync VALID data upward + persist ---------- */
  useEffect(() => {
    const sub = form.watch((values) => {
      if (form.formState.isValid) {
        // Ensure all required fields are present and not undefined
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
  }, [form, onUpdate]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Personal Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField
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

          <FormField
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

          <FormField
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

          <FormField
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

          <FormField
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

          <FormField
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

          <FormField
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
