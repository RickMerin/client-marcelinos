export default function InteractiveMap() {
  const placeQuery = "Marcelino's Place, Hilongos, Leyte";
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(placeQuery)}&output=embed`;

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">
        <span className="green">FIND</span>{" "}
        <span className="yellow">US</span>
      </h2>

      <div className="relative w-full h-[30vh] md:h-[60vh] rounded-[4px] overflow-hidden shadow-md bg-white">
        <iframe
          title="Marcelino's Place location"
          src={mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}