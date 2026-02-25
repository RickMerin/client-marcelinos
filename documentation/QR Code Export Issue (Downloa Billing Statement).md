QR Code Export Issue – Root Cause & Final Fix Documentation
📌 Task Overview

Fix the error occurring when exporting a receipt component as an image using dom-to-image, specifically when a QR code (SVG) is included.

Error Encountered
GET data:image/png;base64,... net::ERR_INVALID_URL

Even after fixing CORS, the export still failed.

🧠 Root Cause Analysis

The issue was NOT:

❌ CORS

❌ Incorrect QR URL

❌ Backend storage

❌ Laravel configuration

❌ TypeScript error

The real issue:

dom-to-image cannot properly render external SVG images inside a canvas.

Why This Happens

When using:

dom-to-image

html2canvas

jsPDF

Any canvas-based export library

External SVG images cause problems because:

The library tries to fetch the image

It attempts to draw it inside a canvas

Canvas security restrictions block it

It results in ERR_INVALID_URL

Even if:

The SVG loads correctly in the browser

CORS is configured properly

Canvas rendering still fails.

✅ Final Working Solution
✔ Convert SVG to Base64 Before Rendering

Instead of using the external SVG URL directly:

<img src={qrCodeUrl} />

We convert the SVG into a Base64 data URL first.

🟢 Step 1 — Add State
const [qrBase64, setQrBase64] = useState<string | undefined>();
🟢 Step 2 — Fetch and Convert SVG
useEffect(() => {
  if (!qrCodeUrl) return;

  fetch(qrCodeUrl)
    .then(res => res.text())
    .then(svgText => {
      const base64 = `data:image/svg+xml;base64,${btoa(svgText)}`;
      setQrBase64(base64);
    })
    .catch(err => console.error(err));
}, [qrCodeUrl]);
🟢 Step 3 — Use Base64 Image Instead
<img src={qrBase64} />
🚀 Why This Fix Works

Instead of:

https://your-backend/qr-image/uuid.svg

The component now uses:

data:image/svg+xml;base64,...

This means:

No external network request

No CORS check

No canvas security violation

No SVG fetch issue

No invalid URL error

The image is now fully inlined and safe for canvas rendering.

💎 Optional (Better Long-Term Fix)

Instead of generating SVG from Laravel, generate PNG:

->format('png')

Instead of:

->format('svg')

PNG works more reliably with:

dom-to-image

html2canvas

PDF generators

Canvas export tools

🏗 Best Practice for Exporting Components

When exporting HTML to image or PDF:

Always inline:

Images

SVGs

Fonts

Never rely on:

External URLs

Cross-origin resources

📌 Final Conclusion

The problem was a library limitation, not a backend issue.

The correct professional solution is:

Convert all external SVG images to Base64 before rendering to canvas.

Now:

Receipt export works

QR renders correctly

No console errors

No CORS issues

No invalid URL errors

Status: ✅ Resolved