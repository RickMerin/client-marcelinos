import { usePageSEO } from "@/hooks/usePageSEO";
import { useScrollToTop } from "@/hooks/useScrollToTop";

function PrivacyPolicy() {
  useScrollToTop();
  usePageSEO({
    title: "Privacy Policy | Marcelinos Hotel & Resort",
    description:
      "Privacy Policy for Marcelinos Hotel & Resort in Hilongos, Leyte. How we collect, use, and protect your data when you book rooms, contact us, or leave a review.",
    path: "/privacy-policy",
    keywords:
      "privacy policy, Marcelinos, hotel resort Hilongos Leyte, data protection, booking privacy",
  });

  return (
    <div id="privacy-policy" className="min-h-screen bg-neutral-50">
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-green-900 md:text-4xl">
            Privacy Policy
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
              Marcelinos Hotel & Resort (“we,” “our,” or “Marcelinos”) operates
              this website and related booking and contact services. We are
              committed to protecting your privacy. This Privacy Policy explains
              what information we collect when you use our website (including
              when you make a reservation, contact us, or leave a review), how
              we use and store it, and your rights regarding your data. Our
              services are offered from Hilongos, Leyte, Philippines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              2. Information We Collect
            </h2>
            <p>We collect information you provide directly and data that is stored temporarily in your browser.</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Booking and reservation:</strong> When you create a
                booking, we collect your name, gender, phone number, email
                address, full address (including region, city, barangay, street,
                zip code), check-in and check-out dates, room and venue
                selections, payment method preference, and optional preferences
                (e.g., newsletter, notifications).
              </li>
              <li>
                <strong>Contact form:</strong> When you submit an inquiry, we
                collect your full name, email, phone number, subject, and
                message.
              </li>
              <li>
                <strong>Reviews and testimonials:</strong> If you submit a
                review after your stay (e.g., via a link with your booking
                reference), we collect your rating, title, and comment, which
                may be linked to your booking for verification.
              </li>
              <li>
                <strong>Local storage (your device):</strong> To improve your
                experience, we temporarily store reservation details (e.g.,
                dates, selected rooms) in your browser’s local storage. This
                data expires after a short period (e.g., 30 minutes) or is
                cleared when you complete or abandon a booking. We may also store
                a simple flag (e.g., that you have seen the welcome message) so
                we do not show it again.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process and manage your room and venue reservations.</li>
              <li>Send you booking confirmations and receipts (e.g., reference number and booking details).</li>
              <li>Respond to your contact form inquiries.</li>
              <li>Verify and publish testimonials or reviews (when you choose to submit them).</li>
              <li>Improve our website and booking flow (e.g., by using temporarily stored reservation data so you can complete a booking without losing your progress).</li>
              <li>Comply with applicable laws and protect our rights and the security of our systems.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              4. Data Storage and Retention
            </h2>
            <p>
              Booking and contact data you submit are sent to our servers and
              retained as needed to fulfill your reservation, respond to
              inquiries, and for legal or operational purposes. Data stored in
              your browser (local storage) is temporary and is cleared
              automatically or when you complete or abandon a booking. We do not
              retain local storage data on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              5. Third-Party Services
            </h2>
            <p>
              Our website uses or may use the following in a way that could
              involve data processing:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Our backend and API:</strong> Your booking and contact
                form submissions are sent to our own backend services to process
                reservations and messages.
              </li>
              <li>
                <strong>Philippine address data (PSGC):</strong> When you enter
                your address during booking, we may use the Philippine Standard
                Geographic Code (PSGC) API (e.g., psgc.gitlab.io) to help you
                select region, province, municipality, and barangay. Your full
                address is then submitted to us; we do not control the PSGC
                provider’s own privacy practices.
              </li>
            </ul>
            <p>
              We do not sell your personal information to third parties for
              marketing. We may share data only as required by law or to protect
              our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              6. Security
            </h2>
            <p>
              We take reasonable steps to protect your personal information
              using technical and organizational measures. Data is transmitted
              over secure connections where applicable. You are responsible for
              keeping your booking reference and any links we send you
              confidential.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              7. Your Rights
            </h2>
            <p>
              Depending on applicable law, you may have the right to access,
              correct, or delete your personal data, or to object to or restrict
              certain processing. To exercise these rights or ask questions
              about your data, please contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              8. Children
            </h2>
            <p>
              Our services are not directed at minors. We do not knowingly
              collect personal information from children. If you believe we have
              received data from a child, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. The “Last
              updated” date at the top will be revised when we make changes. We
              encourage you to review this page periodically. Continued use of
              our website after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-green-900">
              10. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or our handling of
              your personal data, please contact us through our website’s
              contact form or at the contact details provided on our homepage
              (Marcelinos Hotel & Resort, Hilongos, Leyte, Philippines).
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}

export default PrivacyPolicy;
