import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
// import { renderToStaticMarkup } from "react-dom/server";

// function getIcon(complaint) {
//   // const category = getCategoryByName(categoryName);
//   // const Icon = category?.icon || getCategoryByName("Otros").icon;
//   const Icon = categoryIcons[complaint.categoryIcon] || categoryIcons["more-horizontal"];

//   const iconMarkup = renderToStaticMarkup(
//     <Icon size={22} color="white" strokeWidth={2.5} />
//   )

//   return L.divIcon({
//     html: `<div class="map-category-icon">
//             ${iconMarkup}
//            </div>`,
//     className:"",
//     iconSize: [34, 34],
//     iconAnchor: [17, 34],
//     popupAnchor: [0, -34]
//   });
// }

function getIcon(complaint) {
  return L.icon({
    iconUrl: `/iconos/${complaint.categoryIcon}`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export default function MapView({ selectedPosition, complaints }) {

  function formatDate(date) {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="relative h-[420px] md:h-[700px] w-full">
      <MapContainer
        center={[-32.816, -61.394]}
        zoom={13}
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <ZoomControl position="topright" />
        
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
    
        {
          selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>Ubicación seleccionada para el reclamo</Popup>
            </Marker>
          )
        }
        {
          complaints.map(complaint => (
            <Marker key={complaint.id} position={complaint.position} icon={getIcon(complaint)}>
              <Popup className="custom-popup">
                <div className="popup-card">
                  {
                    complaint.photoPreview && (
                      <img 
                        src={complaint.photoPreview}
                        alt="Foto Reclamo"
                        className="popup-image"
                      />
                    )
                  }
                  <div className="popup-badge">{complaint.category}</div>
                  <p className="popup-description">{complaint.description}</p>
                  <p className="popup-id">N° {complaint.numeroReclamo}</p>
                  <p className="popup-id">Cargado el {formatDate(complaint.createdAt)}</p>
                </div>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>
    </div>

  )
}
