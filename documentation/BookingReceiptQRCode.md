# Booking Receipt QR Code

## Overview
The booking receipt QR code points to the backend receipt endpoint so guests can open the digital receipt directly from the API.

## Route
Backend route:

```
GET /booking-receipt/{reference}
```

## Frontend behavior
The QR code is rendered in the receipt view and uses the backend base URL from environment variables:

- Development: `VITE_API_URL_DEV`
- Production: `VITE_API_URL_PROD`

If neither is set, it falls back to:

```
https://Marcelinos-Backend.test/api
```

## Example
If the reference number is `ABC123`, the QR code value will be:

```
https://Marcelinos-Backend.test/api/booking-receipt/ABC123
```

## Configuration
Set these in `.env`:

```
VITE_ENV=development
VITE_API_URL_DEV=https://Marcelinos-Backend.test/api
```

## Location in code
Receipt QR code generation is in:

- `src/pages/Booking/Steps/Step5.tsx`
