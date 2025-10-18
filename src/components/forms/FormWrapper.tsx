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
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Minus, Plus } from "lucide-react";

// ---------- Types ----------
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
  options?: any[]; // ✅ changed to plural
};

interface FormWrapperProps<T extends z.ZodType<any, any>> {
  schema: T;
  fields: Field[];
  buttons?: React.ReactNode[];
  onSubmit: SubmitHandler<z.infer<T>>;
  submitLabel?: string;
  className?: string;
  onChangeFields?: (values: Partial<z.infer<T>>) => Partial<z.infer<T>>; // ✅ added
}

// ---------- Component ----------
export function FormWrapper<T extends z.ZodType<any, any>>({
  schema,
  fields,
  onSubmit,
  submitLabel = "Submit",
  className,
  onChangeFields,
}: FormWrapperProps<T>) {
  // Drawer state
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.output<T>>({
    resolver: zodResolver(schema) as any,
    defaultValues: Object.fromEntries(
      fields.map((f) => [f.name, f.type === "counter" ? 1 : ""])
    ) as z.output<T>,
  });

  // ✅ Auto update computed fields (e.g., check_out)
  // Watch only specific form values, not the entire object
  const days = form.watch("days" as Path<z.output<T>>);
  const checkIn = form.watch("check_in" as Path<z.output<T>>);

  React.useEffect(() => {
    if (!onChangeFields) return;

    const updated = onChangeFields({
      days,
      check_in: checkIn,
    } as unknown as Partial<z.infer<T>>);
    if (updated) {
      Object.entries(updated).forEach(([key, val]) => {
        const currentVal = form.getValues(key as Path<z.output<T>>);
        // ✅ Prevent unnecessary re-renders if value didn't actually change
        if (currentVal !== val) {
          form.setValue(key as Path<z.output<T>>, val as any, {
            shouldValidate: false,
          });
        }
      });
    }
  }, [days, checkIn, onChangeFields]);

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
                <FormLabel>{field.label}</FormLabel>
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
                              value={
                                form.watch(field.name as Path<z.output<T>>) || 1
                              }
                              min={1}
                              onChange={(e) =>
                                form.setValue(
                                  field.name as Path<z.output<T>>,
                                  Math.max(1, Number(e.target.value)) as any
                                )
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
                                id="date"
                                className={cn(
                                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border bg-transparent px-2 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                                  className,
                                  "overflow-hidden text-ellipsis whitespace-nowrap"
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
                                  <div className="flex justify-start gap-2">
                                    <CalendarDays />
                                    <span>Select Date</span>
                                  </div>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto overflow-hidden p-0"
                              align="start">
                              <Calendar
                                mode="single"
                                selected={inputField.value}
                                captionLayout="dropdown"
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                onSelect={(date) => {
                                  inputField.onChange(date);
                                  setOpen(false);
                                }}
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
                            disabled={field.disabled}
                            readOnly={field.readOnly}
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
                                : "Select Check-in Date First"
                            }
                            onChange={(e) =>
                              inputField.onChange(new Date(e.target.value))
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
          className="w-full text-black text-lg py-6 font-bold">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
