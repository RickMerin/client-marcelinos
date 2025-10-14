import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import client1 from "../../assets/img/room3.jpg";
import logo from '../../assets/img/marcelinos-logo.svg';
import { useState } from "react";

function ClientReviews() {
  const reviews = [
    {
      name: "David & Anna",
      date: "September 3, 2025",
      text: "Marcelino's Place is a gem! The elegant setting and exceptional service made our anniversary celebration unforgettable.",
      stars: 5,
      img: client1,
    },
    {
      name: "Sophia L.",
      date: "August 15, 2025",
      text: "The attention to detail was impressive. From the décor to the hospitality, everything was perfect!",
      stars: 4,
      img: client1,
    },
    {
      name: "Michael R.",
      date: "July 20, 2025",
      text: "A beautiful venue with a warm ambiance — our wedding reception turned out exactly as we dreamed.",
      stars: 5,
      img: client1,
    },
  ];

  const [index, setIndex] = useState(0);
  const next = () => setIndex((prev) => (prev + 1) % reviews.length);
  const prev = () => setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const review = reviews[index];

  return (
    <div className="bg-[#faf7f2] py-16 flex flex-col items-center relative">
      <h1 className="text-3xl font-bold text-center mb-12">
        <span className="green header">CLIENT</span>{" "}
        <span className="yellow header">REVIEWS</span>
      </h1>

      {/* Review Card */}
      <Card className="max-w-md bg-white shadow-md rounded-2xl p-12 text-left transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center">
          <img
            src={review.img}
            alt={review.name}
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{review.name}</h3>
            <p className="text-sm text-gray-500">{review.date}</p>
          </div>
                <img src={logo} alt="Marcelino's Logo" className="w-12 ml-auto object-contain"/>   
            </div>

        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < review.stars
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-gray-700 leading-relaxed">{review.text}</p>
      </Card>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-90 top-70 transform -translate-y-1/2 bg-white p-4 rounded-full shadow hover:bg-gray-100"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <button
        onClick={next}
        className="absolute right-90 top-70 transform -translate-y-1/2 bg-white p-4 rounded-full shadow hover:bg-gray-100"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

export default ClientReviews;
