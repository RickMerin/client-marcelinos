# Modals

Reusable modal components and the welcome (disclaimer) modal.

---

## File overview

| File | Purpose |
|------|---------|
| `Modal.tsx` | Reusable modal shell (controlled, no persistence). |
| `ModalDesign.tsx` | Welcome content (copy + Accept button). |
| `WelcomeModal.tsx` | Welcome modal that uses `Modal` + `ModalDesign` and localStorage so it doesn’t show again after accept. |

---

## Full setup examples

### 1. WelcomeModal (one-time disclaimer)

**Where it’s used:** `src/pages/Home/Index.tsx`

Add the welcome modal once at the top of your page so it shows on first visit and never again after the user accepts.

**Step 1 – Import:**

```tsx
import WelcomeModal from "@/components/modals/WelcomeModal";
```

**Step 2 – Render at the top of your layout:**

```tsx
function Home() {
  return (
    <>
      <WelcomeModal />
      <section className="relative w-full">
        {/* Rest of your page: banner, forms, sections, etc. */}
      </section>
    </>
  );
}

export default Home;
```

**Behavior:** On first visit the modal is open. When the user clicks “Accept” or the X button, acceptance is saved in `localStorage` and the modal closes. On later visits it stays closed and does not pop up again.

---

### 2. Reusable Modal (custom content, controlled open/close)

Use the shared `Modal` when you need a modal with your own content, controlled by your own state (e.g. a button opens it, close button or overlay closes it).

**Pattern (same as in `src/pages/Home/ClientReviews.tsx` for `WriteReviewModal`):**

1. Add state: `const [isModalOpen, setIsModalOpen] = useState(false);`
2. Add a trigger (e.g. button) that sets state to `true`.
3. Render `<Modal open={...} onClose={...}>{children}</Modal>` and pass your content as `children`.

**Full example:**

```tsx
import { useState } from "react";
import Modal from "@/components/modals/Modal";

function MyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded bg-yellow-600 px-6 py-2 text-white hover:bg-yellow-800">
        Open modal
      </button>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton={true}>
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-4">Your title</h2>
          <p>Your content here.</p>
        </div>
      </Modal>
    </section>
  );
}

export default MyPage;
```

**With custom styling (no background image):**

```tsx
<Modal
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  contentClassName="bg-white text-black p-8 max-w-md rounded-xl shadow-lg mx-2"
  backgroundImage=""
  showCloseButton={true}>
  <h2>Custom modal</h2>
  <p>Content...</p>
</Modal>
```

---

### 3. Existing usage in this project

| Component | File | Usage |
|-----------|------|--------|
| **WelcomeModal** | `src/pages/Home/Index.tsx` | Rendered once at the top of the home page; no props. |
| **WriteReviewModal** | `src/pages/Home/ClientReviews.tsx` | Controlled by `isModalOpen`; trigger button “Write a review” sets `setIsModalOpen(true)`; modal receives `open`, `onClose`, and `onSubmit`. (This modal uses its own layout; you can use the reusable `Modal` in the same way for other pages.) |

**ClientReviews pattern (for reference):**

```tsx
// State
const [isModalOpen, setIsModalOpen] = useState(false);

// Trigger
<button onClick={() => setIsModalOpen(true)}>Write a review</button>

// Modal
<WriteReviewModal
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleReviewSubmit}
/>
```

Use the same pattern with `Modal` + your own content when you need a generic modal.

---

## API reference

### Reusable `Modal` – props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Whether the modal is visible. |
| `onClose` | `() => void` | — | Called when the modal should close (e.g. close button). |
| `children` | `React.ReactNode` | — | Content rendered inside the modal. |
| `showCloseButton` | `boolean` | `true` | Whether to show the X button in the top-right. |
| `contentClassName` | `string` | (green styled box) | Class name for the inner content container. |
| `backgroundImage` | `string` | `"/green-leaves-extended.png"` | URL for the background image; pass `""` to hide. |

### `ModalDesign` – props

| Prop | Type | Description |
|------|------|-------------|
| `onAccept` | `() => void` | Called when the user clicks “Accept”. |

Used only inside `WelcomeModal`; not intended for direct use elsewhere.

### `WelcomeModal` – props

No props. Just import and render once (e.g. on the home page).
