🏨 RoomCard Component Documentation
📘 Overview

The RoomCard component is a React functional component that displays a swiper carousel of room cards (e.g., Exclusive Room, Deluxe Room, Family Suite, Luxury Room).
It uses Swiper.js for the sliding effect and Tailwind CSS for responsive, modern styling.

Each card displays an image and title from a static room list, making it ideal for hotel or resort websites.

🧩 File Location

src/components/RoomCard.tsx

⚙️ Dependencies

Make sure the following dependencies are installed before using the component:

npm install swiper
npm install --save-dev @types/swiper


This component also depends on:

CardItem → a custom component that displays each room’s image and title

Tailwind CSS → for layout and styling

React → for rendering UI components

🧠 Component Structure

```tsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import CardItem from "./CardItem";

function RoomCard() {
  const rooms = [
    { id: 1, title: "Exclusive Room", image: "src/assets/img/room1.jpg" },
    { id: 2, title: "Deluxe Room", image: "src/assets/img/room2.jpg" },
    { id: 3, title: "Family Suite", image: "src/assets/img/room3.jpg" },
    { id: 4, title: "Luxury Room", image: "src/assets/img/room4.jpg" },
  ];

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        <span className="text-green-900">OUR</span>{" "}
        <span className="text-yellow-500">ROOMS</span>
      </h1>

      <Swiper
        spaceBetween={20}
        slidesPerView={3}
        pagination={{ clickable: true }}
        grabCursor={true}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        modules={[Pagination, Autoplay]}
        style={{
          width: "90%",
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "50px",
        }}
      >
        {rooms.map((room) => (
          <SwiperSlide key={room.id}>
            <CardItem image={room.image} title={room.title} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default RoomCard;

```


🖌️ Design Notes

🎨 Visual Style

Light gray background (bg-gray-50) for clean contrast

Centered heading with green and yellow color accents

Responsive Swiper slides with smooth autoplay and clickable pagination

🖱️ Interactivity

Automatically slides every 3 seconds

Users can drag or swipe between rooms

Works on all screen sizes — 1 slide (mobile), 2 slides (tablet), 3 slides (desktop)

🏗️ How It Works

The component imports Swiper.js and its modules (Pagination, Autoplay).

A static rooms array provides room titles and image paths.

Each room is rendered inside a SwiperSlide using the CardItem component.

Swiper handles the looping, autoplay, and responsiveness.

📄 Usage Example

To use RoomCard in your homepage or any other page:

```tsx
import RoomCard from "@/components/RoomCard";

const Home = () => {
  return (
    <div>
      {/* Other sections */}
      <RoomCard />
      {/* Footer, etc. */}
    </div>
  );
};

export default Home;

```
🧰 Tips

✅ Ensure your images are correctly located in:
src/assets/img/ (e.g., room1.jpg, room2.jpg, etc.)

✅ Adjust the number of slides by editing the slidesPerView property.
✅ You can change the autoplay delay or disable pagination easily inside the Swiper props.

📦 Example Folder Structure

src/
├── assets/
│   └── img/
│       ├── room1.jpg
│       ├── room2.jpg
│       ├── room3.jpg
│       └── room4.jpg
├── components/
│   ├── CardItem.tsx
│   └── RoomCard.tsx

🧾 License

This component is free to use and modify for educational or personal projects.