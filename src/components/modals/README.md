# Modals

Reusable modal components and the welcome (disclaimer) modal.

---

## Reusable `Modal`

A controlled modal shell: overlay, optional background image, close button, and slot for any content.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Whether the modal is visible. |
| `onClose` | `() => void` | — | Called when the modal should close (e.g. close button). |
| `children` | `React.ReactNode` | — | Content rendered inside the modal. |
| `showCloseButton` | `boolean` | `true` | Whether to show the X button in the top-right. |
| `contentClassName` | `string` | (green styled box) | Class name for the inner content container. |
| `backgroundImage` | `string` | `"/green-leaves-extended.png"` | URL for the background image; pass `""` to hide. |

### Example

```tsx
import Modal from "@/components/modals/Modal";

function MyPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <p>Your content here.</p>
      </Modal>
    </>
  );
}
```

Custom styling:

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  contentClassName="bg-white text-black p-8 max-w-md rounded-xl"
  backgroundImage=""
  showCloseButton={true}
>
  <h2>Custom modal</h2>
</Modal>
```

---

## `ModalDesign`

The welcome/disclaimer content used inside the welcome modal: header, intro text, assurances, quote, and “Accept” button. Not meant to be used alone; it’s used by `WelcomeModal`.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onAccept` | `() => void` | Called when the user clicks “Accept”. |

---

## `WelcomeModal`

The Marcelino’s welcome/disclaimer modal. It:

- Shows once per device (or until storage is cleared).
- Remembers acceptance in `localStorage` under the key `marcelino_modal_accepted`.
- Does **not** show again after the user clicks “Accept” or the close (X) button.

No props. Use it once on the app (e.g. on the home page).

### Example

```tsx
import WelcomeModal from "@/components/modals/WelcomeModal";

function Home() {
  return (
    <>
      <WelcomeModal />
      {/* rest of page */}
    </>
  );
}
```

### Behavior

- **First visit:** Modal is open. User can close via “Accept” or X; acceptance is saved as `"true"` in `localStorage`.
- **Later visits:** On load, the component reads `localStorage`. If the value is `"true"`, the modal stays closed and does not pop up again.
- No `useEffect` is used; the “already accepted” check is done in the initial `useState` so the modal never flashes open after accept.

---

## File overview

| File | Purpose |
|------|---------|
| `Modal.tsx` | Reusable modal shell (controlled, no persistence). |
| `ModalDesign.tsx` | Welcome content (copy + Accept button). |
| `WelcomeModal.tsx` | Welcome modal that uses `Modal` + `ModalDesign` and localStorage so it doesn’t show again after accept. |
