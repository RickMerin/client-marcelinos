import { usePageSEO } from "@/hooks/usePageSEO";
import { useScrollToTop } from "@/hooks/useScrollToTop";

function Terms() {
  useScrollToTop();
  usePageSEO({
    title: "Terms and Conditions | Marcelino's Hotel & Resort",
    description:
      "Terms and Conditions for Marcelino's Hotel & Resort in Hilongos, Leyte. Booking policy, check-in and check-out, payment, cancellation, and house rules.",
    path: "/terms-and-conditions",
    keywords:
      "terms and conditions, Marcelino's, hotel resort Hilongos Leyte, booking policy, cancellation policy",
  });

  return (
    <div id="terms-and-conditions" className="min-h-screen bg-neutral-50">
      <article className="mx-auto max-w-3xl px-4 pt-28 pb-10 md:pt-36 md:pb-14">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-green-900 md:text-4xl">
            Terms and Conditions
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
              Welcome to Marcelino's Hotel & Resort. These Terms and Conditions
              (“Terms”) govern your use of our website and the booking, stay,
              and related services we provide. By accessing our website, making
              a reservation, or using our services, you agree to be bound by
              these Terms. Marcelino's Hotel & Resort is located in Hilongos,
              Leyte, Philippines. If you do not agree with any part of these
              Terms, please do not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              2. Use of Our Website and Services
            </h2>
            <p>
              Our website allows you to browse room and venue options, make
              reservations, contact us, and (where applicable) submit reviews
              after your stay. You agree to use the website only for lawful
              purposes and to provide accurate and complete information when
              making a booking or contacting us. You must be of legal age (or
              have parental consent) to enter into a binding agreement. We
              reserve the right to refuse or cancel bookings that violate these
              Terms or that we reasonably believe are fraudulent or made in
              error.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              3. Reservations and Bookings
            </h2>
            <p>
              A reservation is confirmed only after you complete the booking
              process on our website and receive a booking reference number (and
              any confirmation we send). You are responsible for ensuring that
              the details you provide (dates, guest information, contact
              details, and address) are correct. We may contact you to verify
              your booking. Room and venue availability are subject to change;
              we will inform you as soon as practicable if we cannot honor a
              confirmed reservation and will work with you to find an
              alternative or provide a refund in accordance with our
              cancellation policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              4. Check-In and Check-Out
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Check-in:</strong> Check-in time is 12:00 PM (noon). A
                valid government-issued ID must be presented upon check-in.
              </li>
              <li>
                <strong>Check-out:</strong> Check-out time is 10:00 AM. After
                check-out, guests must ensure that all personal belongings are
                secured. The resort shall not be held liable for any items left
                behind or lost after check-out.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              5. Payment Policy
            </h2>
            <p>
              Payment terms will be communicated at the time of booking or
              confirmation. By way of general policy:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                A <strong>50% cash down payment</strong> is required and is{" "}
                <strong>non-refundable</strong>.
              </li>
              <li>
                For fully paid bookings, a <strong>30% deduction</strong> will
                be applied in case of cancellation.
              </li>
            </ul>
            <p>
              We currently accept cash payments. Other payment methods (if
              offered) will be specified on our website or at the property.
              Prices are subject to applicable taxes and fees as indicated
              during the booking process.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              6. Cancellation and Modifications
            </h2>
            <p>
              Cancellations and date or room modifications may be subject to
              fees as stated in our Payment Policy (e.g., non-refundable 50%
              down payment; 30% deduction for cancellation of fully paid
              bookings). Cancellations made within 24 hours of the check-in date
              may incur additional fees. To cancel or modify a booking, please
              contact us as soon as possible using the contact details on our
              website. Refunds, if any, will be processed in accordance with our
              policy and may take a reasonable time to reflect.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              7. House Rules and Conduct
            </h2>
            <p>
              Guests must comply with our house rules and conduct themselves in
              a manner that does not disturb other guests or damage property.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>No smoking:</strong> Smoking is strictly prohibited
                inside the rooms. A penalty of <strong>Php 5,000.00</strong>{" "}
                will be charged for violations.
              </li>
              <li>
                <strong>Damage and loss:</strong> Guests are responsible for any
                damage to or loss of property. The following charges apply for
                lost or broken items:
              </li>
            </ul>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Television – Php 25,000.00</li>
              <li>Emergency Lights – Php 2,000.00</li>
              <li>Cups and Glass – Php 100.00 each</li>
              <li>Lost / Loss of Room Key – Php 1,000.00</li>
              <li>Bed Sheet / Blanket / Towel Stain – Php 500.00 each</li>
              <li>Slippers – Php 100.00 each</li>
              <li>Remote – Php 500.00</li>
              <li>Towel – Php 500.00 each</li>
            </ul>
            <p>
              We reserve the right to evict guests who breach these rules or
              whose behavior is disruptive or unlawful, without refund.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              8. Liability
            </h2>
            <p>
              To the fullest extent permitted by law, Marcelino's Hotel & Resort
              shall not be liable for any loss, damage, injury, or expense
              (including loss of belongings after check-out, theft, or
              accidents) except where caused by our gross negligence or willful
              misconduct. Your use of our website and services is at your own
              risk. We do not guarantee uninterrupted or error-free access to
              our website or that booking data will always be accurate or
              available.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              9. Intellectual Property and Content
            </h2>
            <p>
              The content on our website (including text, images, logos, and
              design) is owned by Marcelino's Hotel & Resort or our licensors
              and is protected by copyright and other intellectual property
              laws. You may not copy, modify, distribute, or use our content for
              commercial purposes without our prior written consent. If you
              submit a review or testimonial, you grant us a non-exclusive
              license to display and use it for promotional and operational
              purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              10. Privacy
            </h2>
            <p>
              Your use of our website and services is also governed by our{" "}
              <a
                href="/privacy-policy"
                className="text-green-800 underline hover:text-green-900"
              >
                Privacy Policy
              </a>
              , which describes how we collect, use, and protect your personal
              information. By using our services, you consent to the practices
              described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              11. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. The “Last updated”
              date at the top of this page will be revised when we make changes.
              Continued use of our website or services after changes constitutes
              acceptance of the updated Terms. For existing reservations, the
              Terms in effect at the time of booking may apply to that
              reservation unless we notify you otherwise.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              12. Governing Law and Disputes
            </h2>
            <p>
              These Terms shall be governed by the laws of the Philippines. Any
              dispute arising out of or relating to these Terms or your stay at
              Marcelino's Hotel & Resort shall be subject to the exclusive
              jurisdiction of the courts in the Philippines, to the extent
              permitted by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              13. Contact Us
            </h2>
            <p>
              For questions about these Terms and Conditions, your booking, or
              our services, please contact us through our website’s contact form
              or at the contact details provided on our homepage (Marcelino's
              Hotel & Resort, Hilongos, Leyte, Philippines).
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}

export default Terms;
