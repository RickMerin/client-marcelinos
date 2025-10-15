interface CardItemProps {
  image: string;
  title: string;
}

function CardItem({ image, title }: CardItemProps) {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-blue-300">
      <img
        src={image}
        alt={title}
        className="w-full h-60 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-1">18 sqm</p>
        <p className="text-gray-600 text-sm mb-1">2 people</p>
        <p className="text-gray-600 text-sm mb-1">
          1 queen bed or 2 separate beds
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Non-refundable, Breakfast included
        </p>
        <button className="w-full bg-yellow-400 text-white font-semibold py-2 rounded-md hover:bg-yellow-500 transition">
          Book now for ₱999
        </button>
      </div>
    </div>
  );
}

export default CardItem;
