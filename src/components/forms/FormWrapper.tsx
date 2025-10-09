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
import { Textarea } from "@/components/ui/textarea"; // ✅ add this
import { Button } from "@/components/ui/button";

// Define the Field type
type Field = {
  name: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "number" | "email" | "password" | "textarea";
};

// Define the props for FormWrapper
interface FormWrapperProps<T extends z.ZodType<any, any>> {
  schema: T;
  fields: Field[];
  buttons?: React.ReactNode[];
  onSubmit: SubmitHandler<z.infer<T>>;
  submitLabel?: string;
}

// FormWrapper component
export function FormWrapper<T extends z.ZodType<any, any>>({
  schema,
  fields,
  onSubmit,
  submitLabel = "Submit",
}: FormWrapperProps<T>) {
  // Initialize the form with react-hook-form and zodResolver
  const form = useForm<z.output<T>>({
    resolver: zodResolver(schema) as any,
    defaultValues: Object.fromEntries(
      fields.map((f) => [f.name, ""])
    ) as z.output<T>,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as Path<z.output<T>>}
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === "textarea" ? (
                    <Textarea {...inputField} placeholder={field.placeholder} />
                  ) : (
                    <Input
                      {...inputField}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      className="border-none bg-[#1E1E1E]"
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          type="submit"
          className="w-full text-black text-lg py-6 font-bold ">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
