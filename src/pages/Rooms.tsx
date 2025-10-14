import CardItem from "@/components/cards/CardItem";

function Rooms() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
<h1 className="text-4xl font-bold yellow header mb-6 text-center">
        Rooms
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 space-y-4">
              {[0,1,2,3,4].map((item)=> (
        <CardItem/>
    ))}
      </div>
    </div>
  );
}

export default Rooms;
