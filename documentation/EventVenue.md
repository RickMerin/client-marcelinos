# 🏨 EventVenues Component (TypeScript + React)

## 📘 Overview
The **`EventVenues`** component displays a responsive grid of event venue cards — each with an image, price, rating stars, and a “Book Now” button.  
It’s designed for hotel or resort booking systems and built using **React + TypeScript**, **Tailwind CSS**, and **lucide-react** icons.

---

## 📂 File Location
src/pages/Home/EventVenue.tsx


---

## ⚙️ Requirements

Before using the component, make sure these dependencies are installed:

```bash
npm install lucide-react
 ```
---
### 🧠 Component Logic Breakdown
1. Static Data

The component defines a venues array that stores static venue data:

```tsx
const venues = [
  {
    image: venue1,
    price: "₱900/night",
    title: "Exclusive Room",
    description: "Stay in comfort and style with our exclusive room. Perfect for relaxation and convenience.",
  },
  ...
];
```
---
Each venue has:

image → imported static image

price → text displayed on a badge

title → name of the venue

description → short venue details

You can later replace this array with data fetched from an API.

2. Image Imports

Images are imported directly from your project assets folder:

```tsx
import venue1 from "@/assets/img/venue1.jpg";
import venue2 from "@/assets/img/venue2.jpg";
import venue3 from "@/assets/img/venue3.jpg";
```
---
✅ Make sure these paths exist:

```tsx
src/assets/img/venue1.jpg
src/assets/img/venue2.jpg
src/assets/img/venue3.jpg
```

---

3. UI Structure

The section is wrapped inside:
```tsx
<section className="w-full py-16 bg-white">
```

Inside it, the layout is built with:

Title: “EVENT VENUES”

Grid: 3 responsive columns (grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3)

Card: Image, price tag, cart icon, title, description, and rating stars.

---

5. Ratings

The stars are generated using:

```tsx
{[...Array(4)].map((_, i) => (
  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
))}
```
To change the number of stars, update Array(4).

----

6. Integration Example

Add it to your Home page or any component where you want to display event venues:
```tsx
import EventVenues from "@/src/pages/EventVenues";

function HomePage() {
  return (
    <main>
      <EventVenues />
    </main>
  );
}

export default HomePage;
```

---

📄 License

This component is free to use and modify for educational or project purposes.