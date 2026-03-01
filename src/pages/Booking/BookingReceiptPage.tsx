import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import {
  BookingReceipt,
  BookingReferenceResponse,
} from "@/types/booking.types";
import { Step5 } from "./Steps/Step5";
import { ProgressIndicator } from "./ProgressIndicator";
import { PageLoader } from "@/components/ui/loader";
import { clearBookingStorage } from "@/lib/storage/localStorage";
import { useRealtimeEvent } from "@/hooks/useRealtimeEvent";
import { RealtimeChannels } from "@/lib/realtime/channels";
import { queryKeys } from "@/lib/api/endpoints";

interface BookingReceiptPageProps {
  referenceNumber: string;
}

const RECEIPT_STEP = 5;

export function BookingReceiptPage({
  referenceNumber,
}: BookingReceiptPageProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    clearBookingStorage();
  }, []);

  useRealtimeEvent({
    channel: RealtimeChannels.booking(referenceNumber),
    event: "BookingStatusUpdated",
    isPrivate: false,
    enabled: !!referenceNumber,
    onEvent: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.receipt(referenceNumber),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.byReference(referenceNumber),
      });
      queryClient.refetchQueries({
        queryKey: queryKeys.bookings.receipt(referenceNumber),
      });
      queryClient.refetchQueries({
        queryKey: queryKeys.bookings.byReference(referenceNumber),
      });
    },
  });

  const { data, isLoading, isError } = useApiQuery<BookingReceipt>(
    ["booking-receipt", referenceNumber],
    `/booking-receipt/${referenceNumber}`,
    { retry: 1 },
  );
  const { data: bookingReferenceData } = useApiQuery<BookingReferenceResponse>(
    ["booking-reference", referenceNumber],
    `/bookings/reference/${referenceNumber}`,
    { retry: 1 },
  );
  const receipt: BookingReceipt | undefined = data;
  const qrCodeUrl = bookingReferenceData?.qr_code_url ?? null;

  if (isLoading) {
    return <PageLoader message="Loading receipt…" />;
  }

  if (isError || !receipt) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Receipt not found or failed to load.</p>
          <p className="text-sm mt-2">Reference: {referenceNumber}</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4 pb-10 landing-section-alt"
      style={{ backgroundColor: "var(--color-cream)" }}>
      <div className="w-full max-w-6xl mx-auto">
        <ProgressIndicator currentStep={RECEIPT_STEP} />
        <div className="mt-6 mb-8">
          <Step5 receiptData={receipt} qrCodeUrl={qrCodeUrl} />
        </div>
      </div>
    </main>
  );
}
