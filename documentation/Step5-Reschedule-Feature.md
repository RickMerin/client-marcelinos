# Step 5 Reschedule Feature (Client + API + Database)

This document explains how rescheduling works in Step 5 of the booking flow, including:

- where the code starts
- how the reschedule modal works
- why the reschedule button hides when status becomes rescheduled
- how the new schedule is saved to the database
- OTP + availability validation
- realtime update behavior
- code snippets with plain-language explanations

## 1) Where the reschedule flow starts

There are two practical entry points into Step 5:

1. Multi-step booking flow

- `src/pages/Booking/Multi-Step-Form.tsx`
- When `current_step === 5`, it renders `Step5`.

2. Receipt page flow

- `src/pages/Booking/BookingReceiptPage.tsx`
- Fetches receipt data and renders `Step5` with `receiptData`.

Main reschedule UI logic is in:

- `src/pages/Booking/Steps/Step5.tsx`

Main reschedule modal content is in:

- `src/components/modals/RescheduleBookingContent.tsx`

## 2) How Step 5 opens the reschedule modal

In `Step5.tsx`:

- Reschedule button click: `setIsRescheduleModalOpen(true)`
- `Modal` renders `RescheduleBookingContent`
- Props passed include:
  - `referenceNumber`
  - `currentCheckIn`
  - `currentDays`
  - `bookingType`

Important callback behavior:

- `onSuccess={() => setIsProcessingReschedule(true)}`
- This immediately puts the button into processing state after successful submit.

## 3) Why the reschedule button hides when status is rescheduled

`Step5.tsx` computes:

- `isRescheduled = bookingStatusResolved === "rescheduled"`

Reschedule button render condition:

- `!isRescheduled && <Reschedule Button ... />`

So once backend updates `booking_status` to `rescheduled`, this button is no longer rendered.

Also, a state unlock effect is used:

- `useEffect(() => { if (bookingStatusResolved === "rescheduled") setIsProcessingReschedule(false); }, [bookingStatusResolved])`

This means UI waits for status confirmation, then clears processing state.

## 4) Reschedule modal flow (frontend)

File:

- `src/components/modals/RescheduleBookingContent.tsx`

### 4.1 Date and duration selection

User picks:

- new check-in date
- number of days/nights

Calendar disables invalid options using blocked dates from:

- `GET /blocked-dates?booking_reference={reference}`

Why booking reference is included:

- allows backend to exclude this booking's own currently held dates during validation.

### 4.2 Overlap prevention

The modal prevents selecting a date range that overlaps blocked dates using:

- `stayOverlapsBlocked(...)`

A second guard runs in submit handler before API call to avoid invalid requests.

### 4.3 OTP for reschedule

Reschedule requires OTP:

1. Send OTP:

- `POST /bookings/{reference}/otp/send`
- body: `{ purpose: "reschedule" }`

2. Confirm submit:

- requires 6-digit OTP
- calls:
  - `PATCH /bookings/{reference}/reschedule`

Payload includes:

- `check_in`
- `check_out`
- `days`
- `otp`
- plus venue-specific fields for venue same-day behavior

## 5) API routes involved

Route definitions are in:

- `Marcelinos-Backend/routes/api.php`

Relevant routes:

- `POST /bookings/{booking:reference_number}/otp/send`
- `PATCH /bookings/{reference}/reschedule`

## 6) Backend reschedule logic (controller)

Main method:

- `Marcelinos-Backend/app/Http/Controllers/API/BookingController.php`
- `reschedule(Request $request, $reference)`

Server steps:

1. Validates request:

- `check_in` required date
- `check_out` required date and `after:check_in`
- `otp` required string

2. Loads booking by reference

3. Business guards:

- blocks if expired-unpaid policy already cancelled booking
- blocks if booking is `pending_verification`
- blocks if booking is `cancelled` or `completed`

4. Availability checks for existing resources:

- current rooms must be available on new dates
- current room-lines (grouped inventory) must be available
- current venues must be available

5. OTP verification:

- `BookingActionOtpService::verifyAndConsume(reference, "reschedule", otp)`

6. Recompute price/payment:

- recalculates nights
- recalculates `total_price`
- recalculates `payment_status` from amounts paid vs new total

7. Persistence:

- updates booking:
  - `check_in`
  - `check_out`
  - `total_price`
  - `payment_status`
  - `booking_status = rescheduled`

8. Broadcast + response:

- broadcasts `BookingRescheduled`
- returns updated booking payload

## 7) How reschedule is saved to the database

Persistence is done via Eloquent `update()` on the `bookings` row:

- `check_in` and `check_out` are replaced with new schedule
- `total_price` is updated to match new duration
- `payment_status` is re-derived
- `booking_status` is set to `rescheduled`

So the reschedule is not just status-only; it is a schedule + pricing + status update.

## 8) Realtime behavior after reschedule

Primary live update path used by receipt UI:

- `BookingReceiptPage.tsx` subscribes to `BookingStatusUpdated`
- channel: `booking.{receiptTokenOrReference}`
- on event: debounced `refetchReceipt()`

Why this works for reschedule too:

- booking status/payment change triggers `BookingObserver`
- observer dispatches `BookingStatusUpdated`
- Step5 receives fresh status via refetched receipt data

## 9) Code snippets you might not be familiar with (explained)

### Snippet A: Overlap detection loop

```ts
function stayOverlapsBlocked(
  checkIn: Date,
  days: number,
  blockedDates: Date[],
): boolean {
  const blockedSet = new Set(blockedDates.map(toDayKey));
  const start = new Date(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate(),
  );

  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (blockedSet.has(toDayKey(d))) return true;
  }

  return false;
}
```

What it does:

- Builds a fast-lookup `Set` of blocked days
- Iterates every day in the proposed stay window
- Returns `true` immediately when any blocked date is hit

Why this pattern is used:

- `Set.has(...)` is fast
- early return avoids unnecessary checks once conflict is found

### Snippet B: Venue same-day span logic

```ts
const selectedStaySpanDays = useMemo(
  () => (allowsSameDayReschedule ? Math.max(0, days - 1) : days),
  [allowsSameDayReschedule, days],
);
```

What it does:

- For venue bookings, `1 day` means same-day event
- So internal range span becomes `0` (check-in and check-out same calendar day)

Why `useMemo`:

- Recomputes only when dependencies change
- avoids recalculating on every render

### Snippet C: `check_out` payload workaround for same-day validation

```ts
const payloadCheckOut = selectedDate
  ? allowsSameDayReschedule && selectedStaySpanDays === 0
    ? `${payloadCheckIn} 23:59:59`
    : toDayKey(addDays(selectedDate, selectedStaySpanDays))
  : "";
```

What it does:

- For same-day venue flow, sends end-of-day timestamp
- Helps satisfy backend validation rule `check_out after check_in`

Why it matters:

- Same-day human intent still passes strict date ordering validation

### Snippet D: OTP verification and one-time consumption

```php
if (! $this->bookingActionOtpService->verifyAndConsume(
    $booking->reference_number,
    BookingActionOtpService::PURPOSE_RESCHEDULE,
    (string) $request->input('otp'),
)) {
    return response()->json([
        'message' => 'Invalid or expired verification code.',
    ], 422);
}
```

What it does:

- Validates OTP for this booking + purpose
- Consumes the OTP when valid (cannot be reused)

Why it matters:

- Prevents replay attacks and accidental duplicate submissions

### Snippet E: Database update for reschedule

```php
$booking->update([
    'check_in' => $checkIn,
    'check_out' => $checkOut,
    'total_price' => $newTotal,
    'payment_status' => $nextPaymentStatus,
    'booking_status' => Booking::BOOKING_STATUS_RESCHEDULED,
]);
```

What it does:

- Saves the full result of rescheduling in one update

Why this is important:

- Keeps schedule, billing, payment state, and booking state consistent

## 10) Important implementation notes

1. The active receipt realtime flow is `BookingStatusUpdated` via `useRealtimeEvent` in `BookingReceiptPage.tsx`.

2. There is a separate `BookingRescheduled` event class in backend (`app/Events/BookingRescheduled.php`) that currently broadcasts to channel `bookings`.

3. Step 5 UI logic relies on `booking_status` refresh from receipt data, not only local modal state.

4. After reschedule status is applied, reschedule button is hidden (`!isRescheduled`), while other actions follow their own conditions.

## 11) Quick end-to-end sequence

1. User opens Step 5.
2. Clicks `Reschedule Booking`.
3. Reschedule modal opens.
4. User selects date + duration (calendar blocks invalid ranges).
5. User requests OTP (`purpose: reschedule`).
6. User submits OTP and new schedule.
7. Backend validates state, availability, OTP.
8. Backend recalculates total/payment and updates booking row.
9. Booking status becomes `rescheduled`.
10. Receipt data refresh/realtime update returns new status.
11. Step 5 hides reschedule button for this booking.

## 12) Files to check when debugging this feature

Frontend:

- `src/pages/Booking/Steps/Step5.tsx`
- `src/components/modals/RescheduleBookingContent.tsx`
- `src/pages/Booking/BookingReceiptPage.tsx`
- `src/hooks/useRealtimeEvent.ts`

Backend:

- `Marcelinos-Backend/routes/api.php`
- `Marcelinos-Backend/app/Http/Controllers/API/BookingController.php`
- `Marcelinos-Backend/app/Services/BookingActionOtpService.php`
- `Marcelinos-Backend/app/Models/Booking.php`
- `Marcelinos-Backend/app/Observers/BookingObserver.php`
- `Marcelinos-Backend/app/Events/BookingStatusUpdated.php`
- `Marcelinos-Backend/app/Events/BookingRescheduled.php`

Related existing doc:

- `documentation/RescheduleCalendarValidation.md`
