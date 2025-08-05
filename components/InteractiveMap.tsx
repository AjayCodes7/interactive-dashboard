"use client";

import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  useMapEvents
} from "react-leaflet";
import { useState } from "react";
import L, { LatLngExpression, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom small square icon
const squareIcon: DivIcon = L.divIcon({
  className: "custom-square-icon",
  html: `<div style="
    width:10px;
    height:10px;
    background-color:#8B5CF6;
    border:1px solid white;
    border-radius:2px;">
  </div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

// Capture map clicks
function ClickHandler({ onClick }: { onClick: (latlng: LatLngExpression) => void }) {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function InteractiveMap() {
  const [center] = useState<LatLngExpression>([17.385044, 78.486671]);
  const [polygons, setPolygons] = useState<LatLngExpression[][]>([]);
  const [tempPolygon, setTempPolygon] = useState<LatLngExpression[]>([]);

  // Handle clicks to add points or finish polygon
  const handleMapClick = (latlng: LatLngExpression) => {
    if (
      tempPolygon.length > 2 &&
      Math.abs((tempPolygon[0] as [number, number])[0] - (latlng as [number, number])[0]) < 0.0001 &&
      Math.abs((tempPolygon[0] as [number, number])[1] - (latlng as [number, number])[1]) < 0.0001
    ) {
      // Close polygon when clicking near first point
      setPolygons((prev) => [...prev, tempPolygon]);
      setTempPolygon([]);
    } else {
      setTempPolygon((prev) => [...prev, latlng]);
    }
  };

  return (
    <div className="w-full">
      <div
        className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-700"
        style={{ cursor: "crosshair" }} // Change cursor to crosshair
      >
        <MapContainer
          center={center}
          zoom={14}
          minZoom={14}
          maxZoom={14}
          style={{ width: "100%", height: "100%" }}
          dragging
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <ClickHandler onClick={handleMapClick} />

          {/* Completed polygons */}
          {polygons.map((polygon, i) => (
            <Polygon key={i} positions={polygon} pathOptions={{ color: "purple" }} />
          ))}

          {/* Temporary polygon while drawing */}
          {tempPolygon.length > 1 && (
            <Polygon positions={tempPolygon} pathOptions={{ color: "orange", dashArray: "4" }} />
          )}

          {/* Small square markers at each point */}
          {tempPolygon.map((point, i) => (
            <Marker
              key={i}
              position={point}
              icon={squareIcon}
              eventHandlers={{
                click: () => {
                  if (i === 0 && tempPolygon.length > 2) {
                    setPolygons((prev) => [...prev, tempPolygon]);
                    setTempPolygon([]);
                  }
                }
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
