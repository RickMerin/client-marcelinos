# FAQ + Contact Page

## Overview

This document explains the structure and functionality of the **FAQ & Contact Page Component** built using **React.js** and **Tailwind CSS**.

The page allows users to **send inquiries directly** through a contact form and **view common questions** through a collapsible FAQ section.  
The design focuses on clarity, responsiveness, and ease of interaction while keeping the layout clean and modern.

---

## Key Features

- **Interactive Accordion:** Expands or collapses answers when users click a question.  
- **Responsive Design:** Stacks vertically on mobile and side-by-side on larger screens.  
- **Contact Form:** Allows users to input name, email, phone number, subject, and message.  
- **Accessible Inputs:** Each field includes focus styles for clear user feedback.  
- **Simple Logic:** Built entirely with React’s `useState` for smooth toggling behavior.

---

## Technologies Used

| Tool / Library | Purpose |
|----------------|----------|
| **React.js** | Component-based user interface |
| **Tailwind CSS** | Utility-first styling and responsiveness |
| **JavaScript (ES6)** | Logic and event handling |

---

## Implementation Steps

### 1. Component Setup

Create a file named `FAQ.jsx` inside your components folder:

```bash
src/components/FAQ.jsx
```

### 2. Add the Component Code

Paste the complete FAQ component code inside the file.

### 3. Import and Use

Import the FAQ component into your page file:

```tsx
import FAQ from '@/components/FAQ';

function ContactPage() {
  return (
    <>
      <FAQ />
    </>
  );
}

export default ContactPage;
```

---

## How It Works

1. **State Management**  
   Uses a `useState` hook to track which FAQ item is currently active.

2. **Toggle Behavior**  
   Clicking a question opens its answer.  
   Clicking it again closes it.

3. **Layout and Responsiveness**  
   - On small screens, the contact form and FAQ stack vertically.  
   - On larger screens, they appear side-by-side using Flexbox and Tailwind classes.

---

## File Structure Example

```
src/
  components/
    FAQ.jsx
  assets/
    styles/
      faq.css (optional)
```

---

## Customization

- Add or remove questions by editing the `faqs` array inside the component.  
- Adjust colors or spacing using Tailwind utility classes.  
- Modify focus ring and border styles for a different accent color.

---

## Expected Output

A clean two-column layout containing:  
- A **Contact Form** on the left with all necessary input fields.  
- A **Frequently Asked Questions** section on the right with collapsible answers.

The page is fully responsive and transitions smoothly between layouts.

---

## Summary

This component provides a balanced combination of usability and simplicity:

- Built with modern React best practices.  
- Clean, responsive Tailwind design.  
- Easy to maintain and customize.  
- Suitable for any hospitality, business, or service website.

---

**Made with clarity and care.**
