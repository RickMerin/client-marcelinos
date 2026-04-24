# Step 5 Cancel Feature (Client + API + Database)

This document explains how cancellation works in Step 5 of the booking flow, including:

- where the code starts
- how the cancel modal works
- why the cancel actions disappear after cancellation
- how cancellation is saved to the database
- realtime updates, OTP verification, and policy details
- important implementation notes and edge cases

## 1) Where the cancel flow starts

There are two practical entry points into Step 5:

1. Multi-step booking form (fresh booking flow)

- `src/pages/Booking/Multi-Step-Form.tsx`
- When `current_step === 5`, it renders `Step5`.

2. Receipt page (direct/opened by token/reference)

- `src/pages/Booking/BookingReceiptPage.tsx`
- Fetches booking receipt data and renders `Step5` with `receiptData`.

Primary cancellation UI and behavior is implemented in:

- `src/pages/Booking/Steps/Step5.tsx`

## 2) Step 5 status model used to control cancel UI

In `Step5.tsx`, cancellation behavior is driven by resolved booking status:

- `bookingStatusResolved` is derived from API receipt data (`booking_status`) or form data fallback.
- `isCancelled` is true when status is:
  - `cancelled`
  - `completed` (intentionally treated as non-active in UI)
- `hideBookingActionButtons` is also true for:
  - `occupied`
  - `completed`

This is why cancel/reschedule buttons disappear after cancellation (or completion):

- Action section only renders when:
  - `!isCancelled && !hideBookingActionButtons`

So once backend status becomes `cancelled`, the buttons are no longer rendered by design.

## 3) Cancel button -> modal open

In `Step5.tsx`:

- Clicking `Cancel Booking` calls `handleCancel()`.
- `handleCancel()` sets `isCancelModalOpen = true`.
- A shared `Modal` renders `CancelBookingContent`.

Modal content component:

- `src/components/modals/CancelBookingContent.tsx`

## 4) Cancel modal behavior (OTP-based)

`CancelBookingContent.tsx` requires OTP verification before confirming cancellation.

### 4.1 Send OTP

When user clicks `Send Verification Code`:

- Calls `POST /bookings/{reference}/otp/send`
- Request body: `{ purpose: "cancel" }`

UI guards:

- local resend cooldown (`OTP_RESEND_SECONDS = 60`)
- disabled button while pending/submitting

### 4.2 Confirm cancellation

Modal confirm requires:

- OTP has been sent
- exactly 6 digits
- countdown lock completed
- no ongoing pending request

On confirm, parent `Step5.tsx` does:

- `PATCH /bookings/{reference}/cancel`
- Request body: `{ otp }`

`Step5.tsx` sets:

- `isSubmitting = true`
- `isProcessingCancel = true`

On success:

- closes modal
- intentionally does not immediately reset `isProcessingCancel`
- waits for realtime/receipt refresh to reflect new status

On error:

- unlocks state and shows error toast

## 5) API routes involved

Backend route registration is in:

- `Marcelinos-Backend/routes/api.php`

Relevant public routes:

- `POST /bookings/{booking:reference_number}/otp/send`
- `PATCH /bookings/{booking:reference_number}/cancel`

Both are inside API key middleware group. OTP send route also has throttle middleware.

## 6) Backend cancellation logic (controller)

Main method:

- `Marcelinos-Backend/app/Http/Controllers/API/BookingController.php`
- `cancel(Request $request, Booking $booking)`

Cancellation steps performed server-side:

1. Expiry pre-check:

- `expireIfNeeded($booking)` runs first.
- If already auto-expired/cancelled by policy, request is rejected with message.

2. Request validation:

- requires `otp` string

3. State guard (`$canCancel`):

- Allowed if booking is:
  - `pending_verification`
  - `rescheduled`
  - `reserved` with payment status in:
    - `unpaid`
    - `partial`
    - `paid`
    - `refund_pending`
    - `refunded`

4. OTP verification:

- `BookingActionOtpService::verifyAndConsume(reference, "cancel", otp)`
- Rejects invalid/expired OTP.

5. Persistence:

- Updates booking row:
  - `booking_status = cancelled`

6. Cancellation breakdown:

- Computes fee/refund guidance using `CancellationPolicy::breakdown(total_price, total_paid)`

7. Broadcast:

- Emits `BookingCancelled` event (`broadcast(...)->toOthers()`)

8. Response:

- includes updated booking and cancellation breakdown data.

## 7) How data is saved to database

Database persistence itself happens via Eloquent update in controller:

- `booking->update([ 'booking_status' => Booking::BOOKING_STATUS_CANCELLED ])`

This writes to the `bookings` table `booking_status` column.

Related model constants and status definitions are in:

- `Marcelinos-Backend/app/Models/Booking.php`

The same model also contains unpaid-expiry auto-cancel logic:

- `isExpiredUnpaid()`
- `expireIfUnpaidExceededRule()` (transaction + `lockForUpdate` + set `booking_status=cancelled`)

## 8) Why Step 5 hides cancel actions after status becomes cancelled

The hide behavior is intentional and defensive:

1. UX reason:

- cancelled/completed booking is no longer an active reservation, so action buttons are removed.

2. Double-submit prevention:

- avoids repeated cancel attempts after status transition.

3. Consistency with backend business rules:

- backend also blocks invalid state transitions, but frontend hides actions earlier for clarity.

## 9) Realtime update path after cancellation

### 9.1 Guest receipt page subscription

`BookingReceiptPage.tsx` subscribes to realtime event:

- Channel: `booking.{receipt_token_or_reference}`
- Event: `BookingStatusUpdated`

On event:

- Debounced `refetchReceipt()`
- Step5 re-renders with fresh `booking_status`
- Cancel/Reschedule buttons disappear because status is now `cancelled`

### 9.2 Observer-driven status event

Backend observer:

- `Marcelinos-Backend/app/Observers/BookingObserver.php`

When booking status/payment changes, it dispatches:

- `BookingStatusUpdated`

Event class:

- `Marcelinos-Backend/app/Events/BookingStatusUpdated.php`

Payload includes status fields and timestamps.

## 10) OTP internals and limits

Service:

- `Marcelinos-Backend/app/Services/BookingActionOtpService.php`

Important behavior:

- Purpose must be `cancel` or `reschedule`
- OTP is 6 digits
- Hashed (`sha256`) and cached by booking reference + purpose
- TTL is 10 minutes
- Verification consumes OTP (one-time use)
- Email send rate limiting/cooldown is enforced

## 11) Auto-cancel policy that can affect Step 5

Separate from manual cancel button, backend can auto-cancel unpaid reserved bookings by policy time rules.

Controller and receipt reads call `expireIfNeeded()` so stale unpaid bookings can become cancelled when accessed.

Implication in Step 5:

- A booking may appear active, then switch to cancelled on next fetch/realtime update.
- The same hide rules still apply (`isCancelled`).

## 12) Important implementation notes

1. `Step5.tsx` currently calls cancel endpoint with hardcoded URL:

- `/bookings/${referenceNumber}/cancel`

2. `src/lib/api/endpoints.ts` currently has a malformed `cancelBooking` template with extra spaces:

- `/bookings/ ${reference} /cancel`

Because Step5 uses a direct URL string, cancellation still works there. However, any future code that uses `endpoints.cancelBooking()` may fail unless that endpoint template is corrected.

3. There is an older standalone `ReceiptPage` component inside `Step5.tsx` that listens to `.booking.cancelled` directly. The active receipt flow is `BookingReceiptPage.tsx` + `useRealtimeEvent("BookingStatusUpdated")`. Keep this in mind to avoid confusion during refactors.

## 13) Quick end-to-end sequence

1. User reaches Step 5 and clicks `Cancel Booking`.
2. Modal opens (`CancelBookingContent`).
3. User requests OTP (`POST /otp/send`, purpose `cancel`).
4. User enters OTP and confirms.
5. Frontend calls `PATCH /cancel` with OTP.
6. Backend validates state + OTP.
7. Backend updates `bookings.booking_status = cancelled`.
8. Backend returns cancellation breakdown and broadcasts status updates.
9. Receipt page realtime listener refetches booking.
10. Step 5 re-renders and hides cancel/reschedule actions.

## 14) Files to check when debugging this feature

Frontend:

- `src/pages/Booking/Steps/Step5.tsx`
- `src/components/modals/CancelBookingContent.tsx`
- `src/pages/Booking/BookingReceiptPage.tsx`
- `src/hooks/useRealtimeEvent.ts`
- `src/lib/realtime/channels.ts`
- `src/lib/api/endpoints.ts`

Backend:

- `Marcelinos-Backend/routes/api.php`
- `Marcelinos-Backend/app/Http/Controllers/API/BookingController.php`
- `Marcelinos-Backend/app/Services/BookingActionOtpService.php`
- `Marcelinos-Backend/app/Models/Booking.php`
- `Marcelinos-Backend/app/Observers/BookingObserver.php`
- `Marcelinos-Backend/app/Events/BookingStatusUpdated.php`
- `Marcelinos-Backend/app/Events/BookingCancelled.php`
- `Marcelinos-Backend/docs/cancellation-refund-policy-workflow.md`
