# Reschedule Calendar Validation

This document explains the logic used in the rescheduling flow, specifically in the `RescheduleBookingContent.tsx` component, to validate and block dates that are fully booked or unavailable.

## Overview

When a guest chooses to reschedule an existing booking, they only select a **new check-in date**, while the system carries over the duration (number of nights/days) from their original booking. Because it's a fixed-duration reschedule, the checking logic needs to verify that the **entire future block** starting from the selected new check-in date is available.

## Core Validation Logic

### 1. Fetching Blocked Dates (`useApiQuery`)

The calendar begins by querying the `/blocked-dates` endpoint, passing in the current `booking_reference`. Passing the reference allows the backend to ignore the dates currently held by _this exact booking_ so a guest could theoretically overlap their own dates while shifting.

```typescript
const { data, isLoading } = useApiQuery<BlockedDatesResponse>(
  ["blocked-dates", referenceNumber],
  `/blocked-dates?booking_reference=${referenceNumber}`,
);
```

### 2. Processing the API Response

The `data` array is mapped to a `Set` strings (for `toDayKey`) and into an array of JS `Date` objects (`blockedDates`). We also generate a dictionary mapping those string dates to specific `blockedReasons` (e.g., {"2024-05-01": "Fully Booked"}).

```typescript
const blockedDates = useMemo(() => {
  return blockedDateRows.map((d) => new Date(d.date + "T12:00:00"));
}, [blockedDateRows]);
```

### 3. Validating the Overlap (`stayOverlapsBlocked`)

This is the heart of the reschedule logic. We have to verify that a selected check-in date can support the full `currentDays` without hitting a single blocked date.

```typescript
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

  // Loop from check-in day through check-out day
  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (blockedSet.has(toDayKey(d))) return true;
  }
  return false;
}
```

If **any day** within the loop matches a blocked date in the Set, the entire stay is invalid.

### 4. Disabling Dates on the Calendar (`isDateDisabled`)

The calendar component takes in an `isDateDisabled` callback. This function runs for every visible cell in the Calendar.

```typescript
const isDateDisabled = useCallback(
  (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Condition 1: Date is in the past
    if (d < todayStart) return true;

    // Condition 2: Date itself is explicitly blocked
    if (blockedDates.some((b) => toDayKey(b) === toDayKey(d))) return true;

    // Condition 3: Date is available, but the required stay length would overlap a blocked date
    return stayOverlapsBlocked(d, days, blockedDates);
  },
  [todayStart, blockedDates, days],
);
```

#### Why we separate logic into `isOverlapInvalid`:

If a day is inherently available but selecting it would cause the stay to overlap an upcoming blocked date, it's categorized through (`isOverlapInvalid`). This allows the UI to render the date nicely (or with a specific hover-style) and present a unique popup reason: _"Your selected stay overlaps with blocked dates. Please adjust your dates."_ rather than a generic "Unavailable".

### Submission Validation Check

Finally, as an extra layer of security before sending the API `MUTATION` request, we verify the `stayOverlapsBlocked` helper manually on form submission. If the logic fails, a toast error is fired preventing the request.

---

## Reschedule UI and Interaction Enhancements

This section documents the newer UX improvements made on top of the base validation logic.

### 1. Stay Highlight Includes Checkout Day

The reschedule calendar uses shared stay-range modifiers from `src/lib/calendar/stayRange.ts`.

The visual range now includes both boundaries:

- Check-in day is highlighted
- Checkout day is highlighted
- Intermediate days are highlighted as the middle band

This improves clarity for guests when selecting and reviewing a full stay range.

### 2. Legend and Date State Semantics

The reschedule screen includes a legend panel next to the calendar to explain date states:

- Blocked or booked
- Would overlap this stay
- Your selected stay

In the actual calendar UI (`CalendarWithDisabledReasons.tsx`), blocked dates now render in red for stronger visual distinction.

### 3. Date-State Rendering and Tooltips

`src/components/calendar/CalendarWithDisabledReasons.tsx` supports a presentation mode (`reasonStyle="soft"`) used by reschedule.

Date state behavior:

- Blocked date: disabled, red style, tooltip reason from blocked-date API
- Fully booked date: disabled, distinct conflict style
- Overlap-invalid date: disabled with overlap style and overlap reason
- Selected stay range: highlighted using shared stay modifiers

Users can click disabled dates to view the exact reason in a tooltip.

### 4. Calendar + Right Rail Layout

The calendar area in `RescheduleBookingContent.tsx` uses a two-column desktop layout:

- Left: main calendar (larger width)
- Right: legend and duration controls stacked vertically

The right panel keeps legend and increment controls organized while preserving focus on the calendar.

### 5. Duration (Nights/Days) Controls

Guests can increase/decrease reschedule duration via +/- controls.

- Label adapts by booking type (`Number of Nights` vs `Number of Days`)
- Decrement is disabled at minimum value of 1
- Every change re-evaluates overlap invalid states and disabled dates in real time

### 6. OTP Verification for Reschedule Submission

Reschedule submission requires a 6-digit OTP.

Flow summary:

1. User sends OTP via `/bookings/{reference}/otp/send`
2. Countdown-based resend guard is applied (`OTP_RESEND_SECONDS`)
3. Submission requires:
   - selected date
   - valid non-overlapping stay range
   - sent OTP and 6-digit code
4. Reschedule request sent to `/bookings/{reference}/reschedule`

This ensures both date validity and verification security before applying schedule changes.

### 7. Responsive/Mobile Summary Improvements

The stay summary section (Original Stay / New Stay) was compacted for better mobile usability:

- Shorter card height
- Clearer check-in/check-out display
- Reduced scrolling burden

These are presentation updates and do not alter reschedule rules or API payload behavior.

### Files Involved

- `src/components/modals/RescheduleBookingContent.tsx`
- `src/components/calendar/CalendarWithDisabledReasons.tsx`
- `src/lib/calendar/stayRange.ts`
