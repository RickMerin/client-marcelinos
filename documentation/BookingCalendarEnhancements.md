# Booking Calendar Enhancements

This document explains the recent structural improvements made to the booking calendar, specifically within `src/components/forms/FormWrapper.tsx`. The goal of the enhancement was to provide a more flexible, user-friendly, and modern date selection flow (similar to Airbnb) while automatically preventing invalid Booking configurations.

## Key Features

### 1. Flexible Independent Submissions (No Strict Forward-Only Locking)

Previously, the Check-in calendar locked dates strictly based on the Check-out date, and the Check-out calendar locked dates based on Check-in. This created a restrictive user experience.

**Change made:**
The `isDateDisabledForField` logic inside `FormWrapper.tsx` was revised.

- **Check-in calendar:** Can select _any_ valid forward-facing date regardless of what the current check-out date is. We removed the strict check that previously disabled any check-in date after the currently selected check-out date.
- **Check-out calendar:** Still disables dates before the Check-in date (enforced by the requirement of at least 1 night/day gap depending on `minOff`), but it respects new changes natively.

```typescript
// Inside FormWrapper.tsx -> isDateDisabledForField

if (field.name === "check_out") {
  const ci = form.getValues("check_in");
  // ...
  const ciD = startOfDay(ciDate);
  const n = diffDays(ciD, d);

  // Automatically disable check-out dates that are BEFORE the check-in date + minimum required offset.
  if (n < minOff) return true;

  // Check if any dates between check-in and the potential check-out are fully booked
  return stayOverlapsBlocked(
    ciD,
    nightsForOverlap,
    blockedDates,
    blockedDateStayMode,
  );
}

if (field.name === "check_in") {
  // Allow all future valid dates. Re-calculation handles Check-out adjustments automatically.
}
```

### 2. Auto-Select & Pop Open Check-out Calendar

When a user opens the Check-in calendar and selects a date, they used to have to manually open the Check-out calendar.

**Change made:**
We modified the `onSelect` handler for the `<Calendar />` internally dynamically setting the next logical state.
If the check-in calendar triggers `date` selection:

1. It automatically calculates the `new check-out date` by adding the minimum needed offset (`minOff`) to the selected check-in date.
2. It pushes this value into the form via `form.setValue("check_out", ...)`.
3. It instantly triggers `setOpenCalendarField("check_out")`, popping open the next UI step naturally for the user.

```typescript
onSelect={(date) => {
  inputField.onChange(date);

  if (field.name === "check_in" && date) {
    const minOff = field.minCheckOutOffsetDays ?? 1;
    const newCi = startOfDay(new Date(date));
    const newCo = new Date(newCi);
    newCo.setDate(newCo.getDate() + minOff); // Auto-advances minimum required days

    form.setValue("check_out", newCo, { shouldValidate: true });
    setOpenCalendarField("check_out"); // Auto-opens check-out calendar popover
  }
  // ...
}}
```

### 3. Check-out Backward Auto-Adjustment

When a user alters the Check-out date, if they pick a date that is _earlier_ than the currently selected Check-in date, the form gracefully pushes the Check-in date backward to retain a valid `minOff` stay, rather than throwing a blocking error.

```typescript
else if (field.name === "check_out" && date) {
  const ci = form.getValues("check_in");
  // ...
  if (diffDays(ciDate, date) < minOff) {
    const newCi = new Date(date);
    newCi.setDate(newCi.getDate() - minOff);
    form.setValue("check_in", newCi, { shouldValidate: true });
  }
  setOpenCalendarField(null);
}
```

## Summary

By removing mutual restrictive blocks and leaning into **auto-adjustments**, the Date Selectors flow smoothly into each other. Selecting Check-in automatically guides the user to Check-out, and manually forcing Check-out backwards smartly drags the Check-in date backwards with it. All the while, API-validated `blocked-dates` ensure guests can never select a date range spanning fully booked days.

---

## Fix: Check-out Date Reversion Bug (MWA-449)

### Issue

When selecting dates on the landing page booking bar, the check-out date would occasionally revert to a stale default value (e.g., reverting to "20" when the user selected "28"). This was particularly visible when:

1. User selected check-in date (e.g., 25)
2. Check-out calendar auto-opens with default suggestion (e.g., 26)
3. User selects check-out date (e.g., 28)
4. In some cases, the check-out would unexpectedly revert to the initial default or an intermediate value

### Root Cause

The calendar date selection handler in `FormWrapper.tsx` was passing raw Date objects from the `react-day-picker` library without normalizing them to local start-of-day. When form state updates were triggered during rapid state changes (e.g., auto-opening check-out after check-in), the unnormalized dates could be overwritten by fallback logic that recalculated default values. Additionally, when check-out violated the minimum offset requirement, the code was adjusting check-in backwards, which could trigger unintended form re-renders.

### Solution

Modified the `onSelect` handler in `src/components/forms/FormWrapper.tsx` with three key improvements:

#### 1. Normalize Selected Dates to Start-of-Day

All selected calendar dates are now normalized using `startOfDay()` before being written to form state, ensuring consistent semantics:

```typescript
onSelect={(date) => {
  const selectedDate = date
    ? startOfDay(new Date(date))
    : undefined;
  inputField.onChange(selectedDate);
  // ...
}}
```

#### 2. Make Explicit Check-out Selection Authoritative

When a user explicitly selects a check-out date, it is immediately written to form state with validation enabled. This prevents stale/default values from overwriting the user's selection during subsequent re-renders:

```typescript
} else if (
  field.name === "check_out" &&
  selectedDate
) {
  // Write the explicit check-out selection immediately
  form.setValue(
    "check_out",
    selectedDate,
    { shouldValidate: true }
  );

  // Then handle minimum offset validation
  if (ci) {
    const ciDate = new Date(ci as string | Date);
    const minOff = field.minCheckOutOffsetDays ?? 1;
    if (
      diffDays(startOfDay(ciDate), selectedDate) < minOff
    ) {
      // Clamp check_out forward to meet minimum requirement
      const minCo = startOfDay(ciDate);
      minCo.setDate(minCo.getDate() + minOff);
      form.setValue("check_out", minCo, { shouldValidate: true });
    }
  }
}
```

#### 3. Clamp Check-out Forward on Offset Violations

Instead of mutating check-in backwards (which could trigger unintended form state changes), the code now clamps the check-out date forward to meet the minimum offset requirement. This keeps the user's check-in selection stable and respects their intent.

### Testing Verification

To verify the fix:

1. Open the landing page booking bar
2. Select a check-in date (e.g., 25)
3. In the auto-opened check-out calendar, select a date further ahead (e.g., 28)
4. Confirm the check-out date remains consistently at the selected value and does not revert

### Files Modified

- `src/components/forms/FormWrapper.tsx` — Calendar `onSelect` handler

---

## Fix: Check-out Date Redirect Bug (MWA-449 - Secondary Issue)

### Issue

When a user had already selected valid check-in and check-out dates, and then re-opened the check-out calendar to select the **same** check-out date again, the date would unexpectedly redirect to a different date, sometimes before the check-in date.

**Scenario:**

1. Check-in: 25, Check-out: 28 (valid)
2. User opens check-out calendar again
3. User clicks 28 (the current selected date)
4. Date redirects to a different value (e.g., 26 or a date before 25)

### Root Cause

The check-out selection handler was calling `inputField.onChange(selectedDate)` immediately, then separately calling `form.setValue("check_out", ...)` with potential adjustments. This dual-call pattern caused:

1. **Race condition**: The form state was updated twice in rapid succession
2. **Validation happening after user input**: The validation logic would read check-in, compare it against the just-set check-out, and potentially issue a second `form.setValue` call with an adjusted date
3. **Inconsistent normalization**: The `startOfDay` normalization wasn't being applied consistently across all code paths

### Solution

Restructured the check-out selection handler to **validate first, then apply once**:

```typescript
} else if (
  field.name === "check_out" &&
  selectedDate
) {
  const ci = form.getValues(
    "check_in" as Path<z.output<T>>,
  );

  // Validate check-out relative to check-in BEFORE applying
  let finalCheckOut = selectedDate;
  if (ci) {
    const ciDate = new Date(ci as string | Date);
    const ciNorm = startOfDay(ciDate);
    const minOff = field.minCheckOutOffsetDays ?? 1;
    const dayDiff = diffDays(ciNorm, selectedDate);

    // Only adjust if selected date violates minimum offset
    if (dayDiff < minOff) {
      finalCheckOut = new Date(ciNorm);
      finalCheckOut.setDate(finalCheckOut.getDate() + minOff);
    }
  }

  // Apply the final validated date ONCE
  inputField.onChange(finalCheckOut);
  suppressNextCalendarCloseRef.current = null;
  setOpenCalendarField(null);
}
```

**Key improvements:**

1. **Single form update**: Only one `inputField.onChange` call with the final validated date
2. **Validation before application**: Check offsets and apply corrections before updating form state
3. **Respects user selection**: If the selected date is valid, it is accepted as-is; only invalid dates (too close to check-in) are auto-adjusted forward
4. **No double-updates**: Eliminates the race condition of multiple `setValue` calls

### Testing Verification

To verify this fix:

1. Set check-in to 25 and check-out to 28 (both valid)
2. Re-open the check-out calendar
3. Click the same date (28)
4. **Expected**: Check-out remains at 28
5. **Previously buggy behavior**: Date would redirect to an earlier value

To test boundary conditions:

1. Set check-in to 25
2. Open check-out calendar and select 26 (only 1 day apart, which is valid for rooms)
3. Re-open check-out calendar and click 26 again
4. **Expected**: Check-out remains at 26

### Files Modified

- `src/components/forms/FormWrapper.tsx` — Calendar `onSelect` handler for check-out field
