import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// import pinIcon from '../../assets/img/marcelinos-logo.svg';
import pinIcon from "../../assets/img/25530.png";

// Custom icon
const customIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function InteractiveMap() {
  const position: [number, number] = [10.374, 124.749];

  return (
    <div className="w-full h-[70vh] shadow-lg">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            {/* <img src={logo} alt="Marcelino's Logo" className="w-12 ml-auto object-contain"/>  */}
            <b>Marcelino's Place</b>
            <br />
            9QG2+VQQ, Hilongos, Leyte
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
