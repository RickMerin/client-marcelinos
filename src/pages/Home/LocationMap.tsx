import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import pinIcon from "../../assets/img/25530.png";

const customIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// ✅ Handles auto-open + close-on-zoom
function MapBehavior({ markerRef }: { markerRef: any }) {
  const map = useMapEvents({
    zoomstart() {
      // Close popup when zooming starts
      markerRef.current?.closePopup();
    },
  });

  useEffect(() => {
    // Open popup when map is ready
    markerRef.current?.openPopup();
  }, [map]);

  return null;
}

export default function InteractiveMap() {
  const markerRef = useRef<L.Marker>(null);
  const position: [number, number] = [
    10.377273056095643,
    124.75196536185709,
  ];

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">
        <span className="green">FIND</span>{" "}
        <span className="yellow">US</span>
      </h2>

      <div className="w-full h-[30vh] md:h-[60vh] rounded-[4px] overflow-hidden shadow-md">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position} icon={customIcon} ref={markerRef}>
            <Popup>
              <strong>Marcelino's Resort & Hotel</strong>
              <br />
              A. Mabini Street, Hilongos,  Leyte
              <br />
              <br />
              <a
                href="https://www.google.com/maps?q=10.37727432074707,124.75197963429022"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold underline"
              >
                Open in Google Maps
              </a>
            </Popup>
          </Marker>

          {/* ✅ Behavior Controller */}
          <MapBehavior markerRef={markerRef} />
        </MapContainer>
      </div>
    </div>
  );
}