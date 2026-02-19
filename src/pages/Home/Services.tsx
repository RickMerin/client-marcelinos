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
    <section
      id="services"
      className="w-full"
      aria-labelledby="services-heading">
      <h2
        id="services-heading"
        className="font-display text-3xl font-bold tracking-tight text-center mb-12 text-(--color-charcoal)">
        <span className="green">OUR </span>
        <span className="yellow">SERVICES</span>
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {services.map((service, index) => (
          <Card
            key={index}
            className="landing-premium-card landing-card-interactive group w-full min-h-[220px] rounded-2xl text-center cursor-pointer flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] hover:bg-(--color-cream) hover:text-green-900 hover:border-amber-200/60 focus-within:ring-2 focus-within:ring-(--color-sage) focus-within:ring-offset-2">
            <CardContent className="flex flex-col items-center justify-center text-center p-6">
              <div className="text-white/95 mb-3 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-inherit">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed opacity-90 text-inherit">
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
