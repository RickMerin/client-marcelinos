import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Hotel, Umbrella, ConciergeBell } from "lucide-react";

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
  ];

  return (
    <section className="py-12 bg-gray-50 text-center">
      {/* 🟢 Section Title */}
      <h2 className="text-3xl font-bold mb-8">
        <span className="text-green-800">OUR </span>
        <span className="text-yellow-500">SERVICES</span>
      </h2>

      {/* 🟢 Services Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {services.map((service, index) => (
          <Card
            key={index}
            className="group w-56 h-56 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white hover:bg-green-800 text-center flex flex-col items-center justify-center"
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
