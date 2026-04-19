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
