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
