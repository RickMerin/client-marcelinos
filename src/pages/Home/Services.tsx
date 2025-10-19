import { Card, CardContent } from "@/components/ui/card";
import { Hotel, Umbrella, ConciergeBell, Coffee } from "lucide-react";

function Services() {
  // 🟢 Static data for your service cards
  const services = [
    {
      icon: <Hotel size={48} />,
      title: "Hotel Booking",
      description:
        "Easily browse and reserve hotel rooms online. View room details, availability, and pricing — all in one place.",
    },
    {
      icon: <Umbrella size={48} />,
      title: "Resort Packages",
      description:
        "Choose from exclusive resort deals that include accommodations, dining, and leisure activities designed for relaxation.",
    },
    {
      icon: <ConciergeBell size={48} />,
      title: "24/7 Concierge",
      description:
        "Access round-the-clock assistance for your travel needs — from booking transportation to arranging special requests.",
    },
    {
      icon: <Coffee size={48} />,
      title: "Dining Experience",
      description:
        "Enjoy fine dining with curated menus from top chefs, available through pre-booked meal packages or on-site restaurants.",
    },
  ];

  return (
    <section id="services" className="w-full py-16 bg-gray-50">
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
            className="group w-full h-56 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white hover:bg-green-800 flex flex-col items-center justify-center text-center">
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
