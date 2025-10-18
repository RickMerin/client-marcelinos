import CardItem from "@/components/cards/CardItem";

function Rooms() {
  const rooms = [
    { id: 1, title: "Exclusive Room", image: "src/assets/img/room3.jpg" },
    { id: 2, title: "Deluxe Room", image: "src/assets/img/room3.jpg" },
    { id: 3, title: "Family Suite", image: "src/assets/img/room3.jpg" },
    { id: 4, title: "Luxury Room", image: "src/assets/img/room3.jpg" },
    { id: 5, title: "Presidential Suite", image: "src/assets/img/room3.jpg" },
    { id: 6, title: "Economy Room", image: "src/assets/img/room3.jpg" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold yellow header mb-6 text-center">
        Rooms
      </h1>

      {/* 3 columns on medium+, 1 on small */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <CardItem key={room.id} image={room.image} title={room.title} />
        ))}
      </div>
    </div>
  );
}

export default Rooms;
