import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import EventVenueSkeleton from "@/components/skeleton/EventVenueSkeleton";
import { pricingFormat } from "@/lib/pricingFormat";

function EventVenues() {
  const dummy_img_url =
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2338";

  const venues = [
    {
      image: dummy_img_url,
      price: 900,
      title: "Exclusive Room",
      description:
        "Stay in comfort and style with our exclusive room. Perfect for relaxation and convenience.",
    },
    {
      image: dummy_img_url,
      price: 900,
      title: "Garden Pavilion",
      description:
        "Host your dream outdoor event surrounded by lush gardens and elegant ambiance.",
    },
    {
      image: dummy_img_url,
      price: 900,
      title: "Beachfront Venue",
      description:
        "Enjoy a perfect seaside event experience with a stunning ocean view backdrop.",
    },
  ];

  const isLoading = false;

  return (
    <section id="event-and-venues" className="w-full py-16 bg-gray-50">
      {/* 🟢 Section Title */}
      <h2 className="text-3xl font-bold text-center mb-12">
        <span className="text-green-800">EVENT </span>
        <span className="text-yellow-500">VENUE</span>
      </h2>

      {/* 🟢 Venue Cards */}

      {isLoading ? (
        <EventVenueSkeleton />
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
          {venues.map((venue, index) => (
            <Card
              key={index}
              className="group overflow-hidden rounded-2xl p-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:bg-green-800">
              {/* 🖼️ CardHeader (Image + Price + Cart) */}
              <CardHeader className="relative w-full p-0 overflow-hidden">
                <img
                  src={venue.image}
                  width={450}
                  height={250}
                  alt={venue.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <span className="absolute top-3 left-3 bg-yellow-400 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {pricingFormat(venue.price)}/night
                </span>

                <div className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-md">
                  <ShoppingCart size={18} className="text-green-800" />
                </div>
              </CardHeader>

              {/* 🧾 CardContent (Title + Description) */}
              <CardContent className="">
                <div>
                  <CardTitle className="text-lg font-semibold mb-2 group-hover:text-white">
                    {venue.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 group-hover:text-gray-200">
                    {venue.description}
                  </CardDescription>
                </div>
              </CardContent>

              {/* ⭐ CardFooter (Rating + Button) */}
              <CardFooter className="p-6 pt-0 flex flex-col items-start">
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default EventVenues;
