import image from "@/assets/img/room3.jpg";
import { pricingFormat } from "@/lib/pricingFormat";

interface CardItemProps {
  id: number;
  room_number: string;
  type: string;
  capacity: number;
  price: number;
  status: string;
  description: string;
}

function CardItem(props: CardItemProps) {
  const { room_number, type, capacity, price, description } = props;
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md overflow-hidden border">
      <img src={image} alt={room_number} className="w-full h-60 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{type}</h2>
        <p className="text-gray-600 text-sm mb-1">{capacity} sqm</p>
        <p className="text-gray-600 text-sm mb-1">{price} people</p>
        <p className="text-gray-600 text-sm mb-2">{description}</p>
        <button className="w-full bg-yellow-400 text-white font-semibold py-2 rounded-md hover:bg-yellow-500 transition">
          Book now for {pricingFormat(price)}
        </button>
      </div>
    </div>
  );
}

export default CardItem;
