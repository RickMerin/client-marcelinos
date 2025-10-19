# 🏨 Services Component

## 📘 Overview
The **`Services`** component is a React functional component that displays a collection of service cards such as **Hotel Booking**, **Resort Packages**, **24/7 Concierge**, and **Dining Experience**.  
It uses **static data** (hardcoded list) and is styled using **Tailwind CSS** and **ShadCN UI** components.

---

## 🧩 File Path
src/components/Services.tsx

## ⚙️ Dependencies

Make sure you have the following installed:

```bash
npm install lucide-react
``` 

---

Also used:

@/components/ui/card → ShadCN UI card component

Tailwind CSS → for responsive design and hover effects

---

## 🧠 Full Component Code
```tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Hotel, Umbrella, ConciergeBell, Coffee } from "lucide-react";

const Services = () => {
  // 🟢 Static data for service cards
  const services = [
    {
      icon: <Hotel size={48} />,
      title: "Hotel Booking",
      description: "Book your stay in just a few clicks.",
    },
    {
      icon: <Umbrella size={48} />,
      title: "Resort Packages",
      description: "Relax and unwind with our exclusive deals.",
    },
    {
      icon: <ConciergeBell size={48} />,
      title: "24/7 Concierge",
      description: "Get premium support anytime, anywhere.",
    },
    {
      icon: <Coffee size={48} />,
      title: "Dining Experience",
      description: "Enjoy world-class meals and beverages.",
    },
  ];

  return (
    <section className="w-full py-16 bg-gray-50">
      {/* 🟢 Section Header */}
      <h2 className="text-3xl font-bold text-center mb-12">
        <span className="text-green-800">OUR </span>
        <span className="text-yellow-500">SERVICES</span>
      </h2>

      {/* 🟢 Services Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
        {services.map((service, index) => (
          <Card
            key={index}
            className="group w-full h-56 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white hover:bg-green-800 flex flex-col items-center justify-center text-center"
          >
            <CardContent className="flex flex-col items-center justify-center text-center p-6">
              <div className="text-yellow-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-base font-semibold mb-1 text-green-800 group-hover:text-white">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-300">
                {service.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
```
---

### export default Services;

🖌️ Design Notes

Background: Light gray (bg-gray-50) for a soft neutral tone.

Hover Effects:

Card background turns green (hover:bg-green-800)

Text color changes to white

Icon slightly enlarges on hover

Responsive Grid Layout:

1 column on mobile

2 on small screens

3–4 on medium and large screens

📄 Usage Example

You can include this component in your homepage or any other page like this:

---

```tsx
import Services from "@/components/Services";

const Home = () => {
  return (
    <div>
      {/* Other homepage sections */}
      <Services />
      {/* Footer, etc. */}
    </div>
  );
};

export default Home;
```