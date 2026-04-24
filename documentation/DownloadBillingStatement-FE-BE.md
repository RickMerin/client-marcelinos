# Billing Statement Download Flow (Frontend + Backend)

This document explains the full billing statement download feature used in Step 5.

## Scope

- Frontend trigger and UX behavior in Step 5
- Backend API route and controller flow
- PDF view/template source
- Mobile vs desktop behavior
- Common troubleshooting checklist

## Frontend Implementation

### Main file

- `client-marcelinos/src/pages/Booking/Steps/Step5.tsx`

### Download trigger

- Function: `downloadReceipt()`
- API call:
	- `GET /bookings/{reference_number}/billing-statement/pdf`
	- Called via `API.get<Blob>(..., { responseType: "blob" })`

### Button behavior

- Initial label: `Download Receipt`
- While generating: `Generating PDF...`
- After success: `Downloaded`
- Button is disabled while generating and after success (until page reload)

### Mobile behavior

- Mobile is detected by `isMobilePdfClient()` (user-agent based)
- On mobile:
	- opens PDF blob in a new tab/window
	- falls back to `window.location.href` if popup is blocked
	- revokes object URL after timeout

### Desktop behavior

- Creates a temporary `<a>` element
- Sets `download` filename to:
	- `marcelinos-billing-statement-{reference}.pdf`
- Triggers browser download

### Frontend error handling

- If no reference: toast error
- If API request fails: toast `Failed to generate the PDF billing statement.`

## Backend Implementation

### Route

- File: `Marcelinos-Backend/routes/api.php`
- Route:
	- `GET /bookings/{booking:reference_number}/billing-statement/pdf`
- Middleware:
	- API key group (`EnsureApiKeyIsValid`)
	- throttle: `receipt_lookup`

### Controller method

- File: `Marcelinos-Backend/app/Http/Controllers/API/BookingController.php`
- Method: `downloadBillingStatementPdf(string $token)`

Flow inside method:

1. Resolve booking via `findReceiptBooking($token)`
2. Return 404 if not found
3. Block pending email-verification bookings via `rejectIfPendingVerification(...)`
4. Build statement data with `buildBillingStatementData($booking)`
5. Generate PDF with DomPDF:
	 - `Pdf::loadView('billing-statements.step5', $statement)`
	 - paper: A4 portrait
6. Return file download response with timestamped filename

### PDF template

- File: `Marcelinos-Backend/resources/views/billing-statements/step5.blade.php`

Current template includes:

- Guest/account details
- Booking/payment summaries
- Itemized line items and totals
- Friendly "Thank you / Next step" notes
- Optional Messenger CTA link for deposit settlement
- QR code section (centered)
- Friendly non-technical wording

### Data used by the PDF

- Built by `buildBillingStatementData(...)` in `BookingController`
- Includes:
	- booking and guest identity fields
	- room and venue computed items
	- totals and balance
	- status and payment labels
	- issued/check-in/check-out times
	- QR image data URI
	- down payment and deposit note values
	- Messenger prefilled link

## Messenger Link in PDF

- Base URL is resolved by `messengerChatUrl()` in backend controller
- Env key supported:
	- `FRONTEND_MESSENGER_CHAT_URL`
- Fallback used when missing:
	- `https://m.me/61557457680496`

## Security and Integrity Notes

- PDF data is generated from backend booking records (not from editable browser DOM)
- API key middleware protects endpoint access
- Rate limiting (`receipt_lookup`) protects against abuse
- Pending verification bookings are blocked from PDF issuance

## Troubleshooting Checklist

If download fails or PDF looks incorrect, check in this order:

1. Confirm booking has valid `reference_number`
2. Confirm API key is present on frontend requests
3. Confirm route exists in `routes/api.php`
4. Confirm `downloadBillingStatementPdf()` is reachable and error-free
5. Rebuild blade cache:
	 - `php artisan view:cache`
6. Verify DomPDF package is available and configured
7. Verify QR file exists in `storage/public` when expected

## Quick Test Cases

1. Desktop download creates `.pdf` file with expected filename
2. Mobile opens PDF in tab/app viewer
3. Download button state transitions:
	 - `Download Receipt` -> `Generating PDF...` -> `Downloaded`
4. Booking not found returns 404 JSON
5. Pending verification booking is blocked
6. PDF shows centered QR and friendly wording
