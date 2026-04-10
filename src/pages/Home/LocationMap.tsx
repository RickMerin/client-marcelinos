export default function InteractiveMap() {
  const placeQuery = "Marcelino's Place, Hilongos, Leyte";
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(placeQuery)}&output=embed`;

  return (
    <div className="w-full">
      <div className="section-eyebrow">Find Us</div>
      <h2 className="font-display text-fluid-h2 font-light text-ink leading-[1.1] mb-10">
        Visit <em className="italic text-gold">Marcelino's</em>
      </h2>

      <div className="relative w-full h-[30vh] md:h-[60vh] rounded-[4px] overflow-hidden">
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
