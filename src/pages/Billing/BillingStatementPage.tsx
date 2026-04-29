import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Home } from "lucide-react";

import { Step5, Step5Skeleton } from "@/pages/Booking/Steps/Step5";
import { toBookingReceipt } from "@/pages/Booking/BookingReceiptPage";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import type {
  BookingReferenceResponse,
  BookingReceipt,
} from "@/types/booking.types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageSEO } from "@/hooks/usePageSEO";

function BillingAccessDeniedView({
  variant,
  details,
}: {
  variant: "invalid" | "expired" | "verification" | "error";
  details?: string;
}) {
  usePageSEO({
    title: "Billing statement unavailable | Marcelino's Resort Hotel",
    description: "Your billing statement link is invalid or has expired.",
    path: "/billing",
    keywords: "billing statement, token, expired, Marcelinos Resort Hotel",
  });

  const message =
    variant === "expired"
      ? "This billing statement link has expired."
      : variant === "verification"
        ? "Please confirm your booking first using the email verification link we sent you."
      : variant === "invalid"
        ? "This billing statement link is invalid."
        : "Unable to load your billing statement.";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <div className="mx-auto max-w-lg w-full text-center bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <p className="font-display text-2xl font-bold tracking-tight text-green-900">
          Billing access denied
        </p>
        <p className="mt-3 text-neutral-600">{message}</p>
        {details ? (
          <p className="mt-2 text-xs text-neutral-500 break-words">
            {details}
          </p>
        ) : null}
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-green-800 text-white hover:bg-green-900 focus-visible:ring-green-800/50"
          >
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="size-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export function BillingStatementPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  usePageSEO({
    title: "Billing Statement | Marcelino's Resort Hotel",
    description: "Your official billing statement.",
    path: "/billing",
    keywords: "billing statement, Marcelinos",
  });

  const endpoint =
    id && token
      ? `/billing/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`
      : "";

  const queryKey = useMemo(
    () => ["billing", String(id ?? ""), token] as string[],
    [id, token],
  );

  const { data, isLoading, isError, error } = useApiQuery<BookingReferenceResponse>(
    queryKey,
    endpoint,
    {
      enabled: Boolean(id && token),
      retry: 0,
      staleTime: 10_000,
    },
  );

  const receipt: BookingReceipt | null = useMemo(
    () => (data ? toBookingReceipt(data) : null),
    [data],
  );

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-full max-w-[1200px] px-6 lg:px-12 pt-15">
          <Step5Skeleton />
        </div>
      </main>
    );
  }

  if (isError || !receipt) {
    const apiErr = error as unknown as
      | {
          response?: {
            status?: number;
            data?: { error?: string; message?: string };
          };
          message?: string;
        }
      | undefined;

    const status = apiErr?.response?.status;
    const code = apiErr?.response?.data?.error;

    const variant =
      token === ""
        ? "invalid"
        : status === 403 && code === "token_expired"
          ? "expired"
          : status === 403 && code === "email_verification_required"
            ? "verification"
            : status === 403
            ? "invalid"
            : "error";

    return (
      <BillingAccessDeniedView
        variant={variant}
        details={apiErr?.response?.data?.message ?? apiErr?.message}
      />
    );
  }

  // This guest "billing statement" route intentionally does NOT enable
  // online payment actions, because those flows require the receipt token.
  return (
    <main
      className="booking-funnel min-h-screen flex flex-col items-center pb-10 landing-section-alt"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 pt-15">
        <div className="mt-6 mb-8">
          <Step5
            receiptData={receipt}
            qrCodeUrl={receipt.qr_code_url ?? null}
            onlinePaymentAction={{
              visible: false,
              label: "",
              isLoading: false,
              onClick: () => {
                // no-op
              },
            }}
            // Step5 uses `receiptData.*` to decide which blocks to show.
          />
        </div>
      </div>
    </main>
  );
}

export default BillingStatementPage;

