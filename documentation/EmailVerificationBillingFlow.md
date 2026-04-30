# Email Verification and Billing Statement Flow

## Purpose

This document explains the guest email verification flow in Step 4 and how it reaches the billing statement used by the confirmation email.

## Canonical Paths

- Email confirmation link: `GET /billing/{booking.id}?token={billing_token}`
- Billing statement PDF: `GET /billing-statements/{booking.reference_number}/pdf`
- Guest receipt flow: `GET /booking-receipt/{receipt_token}`

## Important Token Rules

- `billing_token` is the raw guest billing access token used by the billing page.
- `receipt_token` is only for the receipt route.
- `reference_number` is not valid for the billing access route.

If Step 4 uses the receipt token or reference number for the billing page, the backend returns `Billing access denied` because `showBillingByAccessToken()` expects the booking database ID and the raw billing token.

## Flow Overview

1. Guest submits the booking form in Step 4.
2. The booking is created with `email_verification_required = true`.
3. The backend generates a raw billing token and stores only its hash in `access_token`.
4. The verification email contains the signed billing link with the correct booking ID and billing token.
5. When the guest confirms the email, Step 4 polls the booking record until `email_verified_at` is present.
6. Step 4 then redirects to the same billing statement route used by the email.

## Why This Matters

There are two different guest-facing views:

- The billing statement page shown after email confirmation.
- The receipt page shown from the booking receipt flow.

They are not interchangeable. The billing statement route needs the billing token, while the receipt route uses the receipt token.

## Troubleshooting

- If Step 4 shows `Billing access denied`, verify that the frontend is sending `booking.id` and `billing_token` to `/billing/{id}`.
- If the PDF download works but the action buttons fail, check that the page was opened through the billing statement route and not the receipt route.
- If a link works in email but not in Step 4, confirm that the frontend is using the API-provided `billing_token` rather than `receipt_token`.

## Related Files

- `src/pages/Booking/Steps/Step4.tsx`
- `src/pages/Booking/Multi-Step-Form.tsx`
- `src/pages/Billing/BillingStatementPage.tsx`
- `src/pages/Booking/Steps/Step5.tsx`
- `src/types/booking.types.ts`
