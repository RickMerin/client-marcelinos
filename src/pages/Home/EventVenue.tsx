import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";

// 🖼️ Import static images (adjust paths if needed)
import venue1 from "@/assets/img/venue1.jpg";
import venue2 from "@/assets/img/venue2.jpg";
import venue3 from "@/assets/img/venue3.jpg";

function EventVenues() {
  // 🟢 Static venue data
  const venues = [
    {
      image: venue1,
      price: "₱900/night",
      title: "Exclusive Room",
      description:
        "Stay in comfort and style with our exclusive room. Perfect for relaxation and convenience.",
    },
    {
      image: venue2,
      price: "₱1,200/night",
      title: "Garden Pavilion",
      description:
        "Host your dream outdoor event surrounded by lush gardens and elegant ambiance.",
    },
    {
      image: venue3,
      price: "₱1,500/night",
      title: "Beachfront Venue",
      description:
        "Enjoy a perfect seaside event experience with a stunning ocean view backdrop.",
    },
  ];

  return (
    <section className="w-full py-16 bg-white">
      {/* 🟢 Section Title */}
      <h2 className="text-4xl font-bold text-center mb-12">
        <span className="text-green-800">EVENT </span>
        <span className="text-yellow-500">VENUES</span>
      </h2>

      {/* 🟢 Venue Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
        {venues.map((venue, index) => (
          <Card
            key={index}
            className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:bg-green-800"
          >
            {/* Venue Image */}
            <div className="relative w-full h-56 px-4 pt-4">
              <img
                src={venue.image}
                alt={venue.title}
                className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Price Tag */}
              <span className="absolute top-7 left-7 bg-yellow-400 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {venue.price}
              </span>

              {/* Cart Icon */}
              <div className="absolute top-7 right-7 bg-white p-1 rounded-full shadow-md">
                <ShoppingCart size={18} className="text-green-800" />
              </div>
            </div>

            {/* 🗂️ Card Content */}
            <CardContent className="p-6 flex flex-col justify-between h-52">
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-white">
                  {venue.title}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-200">
                  {venue.description}
                </p>
              </div>

              {/* ⭐ Rating + Button */}
              <div className="mt-4">
                <div className="flex justify-start mb-3">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <button className="bg-yellow-400 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-300">
                  Book Now
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default EventVenues;
