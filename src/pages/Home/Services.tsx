import { Card, CardContent } from "@/components/ui/card";
import { Hotel, Umbrella, ConciergeBell, Coffee, CalendarCheck2, SearchCheck, ClipboardList } from "lucide-react";

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
      icon: <CalendarCheck2 size={48} />,
      title: "Event Reservation",
      description:
        "Book a space for events such as meetings, celebrations, or gatherings, with real-time availability and complete booking information.",
    },
    {
      icon: <SearchCheck size={48} />,
      title: "Availability Checking",
      description:
        "Check available spaces in real time based on selected dates, ensuring accurate and up-to-date booking options.",
    },
    {
      icon: <ClipboardList size={48} />,
      title: "Booking Summary",
      description:
        "Provides a clear overview of booking details including selected stay, chosen space, and booking total before confirmation.",
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
