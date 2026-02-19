import { usePageSEO } from "@/hooks/usePageSEO";

function RefundPolicy() {
  usePageSEO({
    title: "Refund Policy | Marcelinos Hotel & Resort",
    description:
      "Refund and cancellation policy for Marcelinos Hotel & Resort in Hilongos, Leyte. Down payment, cancellation fees, and how to request a refund.",
    path: "/refund-policy",
    keywords:
      "refund policy, cancellation, Marcelinos, hotel resort Hilongos Leyte, booking refund",
  });

  return (
    <div id="refund-policy" className="min-h-screen bg-neutral-50">
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-green-900 md:text-4xl">
            Refund Policy
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Last updated: February 2025
          </p>
        </header>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-800">
          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              1. Introduction
            </h2>
            <p>
              Marcelinos Hotel & Resort (“we,” “our,” or “Marcelinos”) is
              committed to clear and fair refund and cancellation practices.
              This Refund Policy explains when and how we handle refunds for
              room and venue bookings at our property in Hilongos, Leyte,
              Philippines. By making a reservation, you agree to this policy.
              For general booking and payment terms, please see our{" "}
              <a
                href="/terms-and-conditions"
                className="text-green-800 underline hover:text-green-900"
              >
                Terms and Conditions
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              2. Down Payment (Non-Refundable)
            </h2>
            <p>
              A <strong>50% cash down payment</strong> is required to confirm
              your reservation. This down payment is{" "}
              <strong>non-refundable</strong>. If you cancel your booking for
              any reason, the 50% down payment will not be returned. We encourage
              you to confirm your travel plans before completing your
              reservation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              3. Cancellation of Fully Paid Bookings
            </h2>
            <p>
              If you have paid the full amount for your stay and later cancel
              your booking, a <strong>30% deduction</strong> will be applied
              from the total amount paid. The remaining balance (70%) may be
              refunded to you in accordance with the process described below,
              subject to any additional fees that may apply for late
              cancellations (see Section 4).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              4. Late Cancellations
            </h2>
            <p>
              Cancellations made within <strong>24 hours of the check-in
              date</strong> may incur additional fees or may not be eligible for
              a refund of the refundable portion. We will assess each situation
              and inform you of any extra charges. To avoid late cancellation
              fees, please notify us as soon as you know you need to cancel or
              change your dates.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              5. How to Request a Refund or Cancel
            </h2>
            <p>
              To cancel your booking or request a refund, please contact us as
              soon as possible using the contact form on our website or the
              contact details provided on our homepage. Include your booking
              reference number and the reason for cancellation. We will confirm
              receipt of your request and advise you on the refund amount (if
              any) and the expected processing time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              6. Refund Processing
            </h2>
            <p>
              Refunds, when applicable, will be processed using the same method
              of payment used for the booking (e.g., cash refund or other method
              as we may specify). Processing may take a reasonable time
              depending on banking or administrative procedures. We will notify
              you once the refund has been initiated. You are responsible for
              providing correct and up-to-date contact and payment information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              7. No-Show and Early Departure
            </h2>
            <p>
              If you do not arrive on the check-in date and do not notify us in
              advance (“no-show”), your booking may be treated as cancelled and
              no refund will be issued. Early departure (leaving before your
              scheduled check-out date) does not entitle you to a refund for the
              unused nights unless we agree otherwise in writing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              8. Changes by Marcelinos
            </h2>
            <p>
              If we are unable to honor your reservation (e.g., due to
              unforeseen circumstances, maintenance, or force majeure), we will
              work with you to reschedule your stay or provide a full refund of
              amounts paid, as appropriate. We will contact you using the
              details provided at booking.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              9. Questions and Contact
            </h2>
            <p>
              If you have questions about this Refund Policy or need to cancel
              or request a refund, please contact us through our website’s
              contact form or at the contact details provided on our homepage
              (Marcelinos Hotel & Resort, Hilongos, Leyte, Philippines).
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}

export default RefundPolicy;
