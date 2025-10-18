# 🏨 EventVenues Component Documentation

## 📘 Overview
The **`EventVenues`** component is a reusable React UI section that displays a list of event venue cards with images, prices, ratings, and a “Book Now” button.  
It is styled using **Tailwind CSS** and uses icons from **lucide-react**.  

This component fits perfectly in the homepage or any section that highlights available event venues, rooms, or accommodations.

---

## ⚙️ File Location
You can place this file inside your project’s components directory:
src/components/EventVenues.jsx


---

## 🧩 Dependencies

Make sure these packages are installed:

```bash
npm install lucide-react
src/components/ui/card.jsx
```

### 🧠 How It Works
1. Static Data

The component defines a venues array containing:

image – the venue photo path

price – display text for the price

title – name of the venue

description – short text about the venue

You can replace this array with data fetched from an API or database later.

2. Layout and Styling

Tailwind CSS handles responsive grid design (grid-cols-1 sm:grid-cols-2 md:grid-cols-3)

Hover effects and transitions give it an interactive look

Colors: Green (text-green-800) and Yellow (text-yellow-400) theme

3. Components Used

<Card> and <CardContent> from @/components/ui/card

<ShoppingCart> and <Star> icons from lucide-react

### 🧱 How to Use
Step 1: Import the Component

```tsx
import EventVenues from "@/components/EventVenues";
```
---
Step 2: Add It to a Page
```tsx
import EventVenues from "@/components/EventVenues";

function Home() {
  return (
    <div>
      {/* Other sections */}
      <EventVenues />
    </div>
  );
}

export default Home;
```
---
### 🖼️ Images

Make sure the image paths exist:

public/images/venue1.jpg
public/images/venue2.jpg
public/images/venue3.jpg

---

