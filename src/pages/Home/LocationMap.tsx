import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import pinIcon from "../../assets/img/25530.png";

const customIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function InteractiveMap() {
// const position: [number, number] = [10.377304062254911, 124.7519214365679];
const position: [number, number] = [10.377273056095643, 124.75196536185709];




  return (
    <div className="container mx-auto">
      <h2
        id="location-heading"
        className="font-display text-3xl font-bold tracking-tight text-center mb-8 text-(--color-charcoal)"
      >
        <span className="green">FIND</span>{" "}
        <span className="yellow">US</span>
      </h2>

      <div className="w-full h-[70vh] rounded-[4px] overflow-hidden border border-(--color-sage-muted) shadow-md">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='© OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

        <Marker position={position} icon={customIcon}>
          <Popup>
            <strong>Marcelino's Place</strong>
            <br />
            A. Mabini Street
            <br />
            Hilongos, Leyte
            <br /><br />
            <a
              href="https://www.google.com/maps?q=10.37727432074707,124.75197963429022"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open in Google Maps
            </a>
          </Popup>
        </Marker>
        </MapContainer>
      </div>
    </div>
  );
}