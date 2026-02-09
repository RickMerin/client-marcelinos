import { useEffect } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { BookingReceipt, BookingReferenceResponse } from "@/types/booking.types";
import { Step5 } from "./Steps/Step5";
import { Stepper } from "./Stepper";
import { Card } from "@/components/ui/card";
import { STEPS } from "./constants/steps.config";
import { PageLoader } from "@/components/ui/loader";
import { clearBookingStorage } from "@/lib/storage/localStorage";

interface BookingReceiptPageProps {
  referenceNumber: string;
}

const RECEIPT_STEP = 5;

export function BookingReceiptPage({ referenceNumber }: BookingReceiptPageProps) {
  useEffect(() => {
    clearBookingStorage();
  }, []);

  const { data, isLoading, isError } = useApiQuery<BookingReceipt>(
    ["booking-receipt", referenceNumber],
    `/booking-receipt/${referenceNumber}`,
    { retry: 1 }
  );
  const { data: bookingReferenceData } = useApiQuery<BookingReferenceResponse>(
    ["booking-reference", referenceNumber],
    `/bookings/reference/${referenceNumber}`,
    { retry: 1 }
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
    <main className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="p-8 shadow-none border-none">
          <Stepper steps={STEPS} currentStep={RECEIPT_STEP} />
          <div className="mt-4 mb-8 min-h-87.5">
            <Step5 receiptData={receipt} qrCodeUrl={qrCodeUrl} />
          </div>
        </Card>
      </div>
    </main>
  );
}
