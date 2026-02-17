import * as React from "react";
import { useForm, SubmitHandler, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarWithDisabledReasons as Calendar } from "@/components/calendar/CalendarWithDisabledReasons"

import { CalendarDays, Minus, Plus } from "lucide-react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
type Field = {
  name: string;
  label?: string;
  placeholder?: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "counter"
    | "calendar"
    | "select"
    | "drawer"
    | "date";
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  options?: any[];
  value?: any;
};

interface FormWrapperProps<T extends z.ZodType<any, any>> {
  schema: T;
  fields: Field[];
  onSubmit: SubmitHandler<z.infer<T>>;
  submitLabel?: string;
  className?: string;
  onChangeFields?: (values: Partial<z.infer<T>>) => Partial<z.infer<T>>;
}

export function FormWrapper<T extends z.ZodType<any, any>>({
  schema,
  fields,
  onSubmit,
  submitLabel = "Submit",
  className,
  onChangeFields,
}: FormWrapperProps<T>) {
  const [open, setOpen] = React.useState(false);

  // ✅ derive default values from fields
  const defaultValues = Object.fromEntries(
    fields.map((f) => [f.name, f.value ?? (f.type === "counter" ? 1 : "")])
  ) as z.output<T>;

  const hasScrolledRef = React.useRef(false);

  React.useEffect(() => {
    const openCalendar = () => {
      setOpen(true);

      const bookingEl = document.getElementById("booking-section");
      const heroTop = window.scrollY < 100;

      if (hasScrolledRef.current && !heroTop) {
        window.scrollTo({
          behavior: "smooth",
          top: 200,
        });
        hasScrolledRef.current = false;
        return;
      }

      if (!heroTop && bookingEl) {
        bookingEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        hasScrolledRef.current = true;
      }
    };

    window.addEventListener("open-checkin", openCalendar);

    return () => {
      window.removeEventListener("open-checkin", openCalendar);
    };
  }, []);



  const form = useForm<z.output<T>>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const days = form.watch("days" as Path<z.output<T>>);
  const checkIn = form.watch("check_in" as Path<z.output<T>>);

  // ✅ dynamically update computed fields like check_out
  React.useEffect(() => {
    if (!onChangeFields) return;
    const updated = onChangeFields({
      days,
      check_in: checkIn,
    } as unknown as Partial<z.infer<T>>);
    if (updated) {
      Object.entries(updated).forEach(([key, val]) => {
        const current = form.getValues(key as Path<z.output<T>>);
        if (val && current !== val)
          form.setValue(key as Path<z.output<T>>, val as any, {
            shouldValidate: false,
          });
      });
    }
  }, [days, checkIn]);

  type BlockedDatesResponse = {
    blocked_dates: Array<{
      date: string;
      reason?: string | null;
    }>;
  };

  const { data } = useApiQuery<BlockedDatesResponse>(
    ["blocked-dates"],
    "/blocked-dates"
  );
  const blockedDates = React.useMemo(() => {
    return (
      data?.blocked_dates?.map((d) => new Date(d.date + "T00:00:00")) ?? []
    );
  }, [data]);

  const blockedReasons = React.useMemo(() => {
    const map: Record<string, string> = {};
    data?.blocked_dates?.forEach((d) => {
      map[d.date] = d.reason ?? "Unavailable";
    });
    return map;
  }, [data]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as Path<z.output<T>>}
            render={({ field: inputField }) => (
              <FormItem>
                {field.label && <FormLabel>{field.label}</FormLabel>}
                <FormControl>
                  {(() => {
                    switch (field.type) {
                      case "textarea":
                        return (
                          <Textarea
                            {...inputField}
                            placeholder={field.placeholder}
                          />
                        );

                      case "counter":
                        return (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue(
                                  field.name as Path<z.output<T>>,
                                  Math.max(
                                    1,
                                    (form.getValues(
                                      field.name as Path<z.output<T>>
                                    ) || 1) - 1
                                  ) as any
                                )
                              }>
                              <Minus />
                            </Button>
                            <Input
                              {...inputField}
                              type="number"
                              className="text-center"
                              min={1}
                              onChange={(e) =>
                                inputField.onChange(Number(e.target.value))
                              }
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue(
                                  field.name as Path<z.output<T>>,
                                  ((form.getValues(
                                    field.name as Path<z.output<T>>
                                  ) || 0) + 1) as any
                                )
                              }>
                              <Plus />
                            </Button>
                          </div>
                        );

                      case "calendar":
                        return (
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  " font-normal h-12",
                                  !inputField.value && "text-muted-foreground",
                                  field.className
                                )}>
                                {inputField.value ? (
                                  new Date(inputField.value).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <CalendarDays size={16} />
                                    <span>
                                      {field.placeholder || "Pick date"}
                                    </span>
                                  </div>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="p-0">
                              <Calendar
                                mode="single"
                                selected={inputField.value}
                                onSelect={(date) => {
                                  inputField.onChange(date);
                                  setOpen(false);
                                }}
                                disabled={[
                                  { before: new Date(new Date().setHours(0, 0, 0, 0)) },
                                  ...blockedDates,
                                ]}
                                blockedReasons={blockedReasons}

                              />
                            </PopoverContent>
                          </Popover>
                        );

                      case "date":
                        return (
                          <Input
                            {...inputField}
                            type="text"
                            className={field.className}
                            readOnly={field.readOnly}
                            disabled={field.disabled}
                            value={
                              inputField.value
                                ? new Date(inputField.value).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )
                                : "Select Check-in Date"
                            }
                          />
                        );

                      default:
                        return (
                          <Input
                            {...inputField}
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            className={field.className}
                            disabled={field.disabled}
                            readOnly={field.readOnly}
                          />
                        );
                    }
                  })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button
          type="submit"
          className="w-full text-white text-lg py-6 yellow-bg cursor-pointer font-bold">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
