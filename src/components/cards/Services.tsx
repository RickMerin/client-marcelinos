import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Hotel, Umbrella, ConciergeBell, Coffee } from "lucide-react";

const Services = () => {
  // 🟢 Static data for your cards
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
      {/* 🟢 Section Title */}
      <h2 className="text-3xl font-bold text-center mb-12">
        <span className="green header">OUR </span>
        <span className="yellow header">SERVICES</span>
      </h2>

      {/* 🟢 Services Cards Container */}
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

export default Services;
