import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Car, Waves } from "lucide-react";

function Services() {
  // 🟢 Static data for your service cards
  const services = [
    {
      icon: <Wifi size={48} />,
      title: "Free Wi-Fi",
      description:
        "Stay connected with our high-speed wireless internet, available throughout all hotel areas and guest rooms.",
    },
    {
      icon: <Car size={48} />,
      title: "Valet Parking",
      description:
        "Enjoy hassle-free parking with our 24/7 valet service — convenience and care for your vehicle from arrival to departure.",
    },
    {
      icon: <Waves size={48} />,
      title: "Swimming Pool",
      description:
        "Relax and unwind in our outdoor swimming pool with a view — perfect for leisure, exercise, or a sunset dip.",
    },
  ];

  return (
    <section className="w-full py-16 bg-gray-50">
      {/* 🟢 Section Title */}
      <h2 className="text-3xl font-bold text-center mb-12">
        <span className="text-green-700">OUR </span>
        <span className="text-yellow-500">SERVICES</span>
      </h2>

      {/* 🟢 Services Cards Container */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
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
}

export default Services;
