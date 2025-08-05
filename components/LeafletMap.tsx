"use client";

import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L, { LatLngExpression, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

import { fetchWeatherData, getCentroid } from "@/utils/fetchWeatherData";

type ThresholdRule = {
    color: string;
    operator: "<" | "<=" | ">" | ">=" | "=";
    value: number;
};

// Custom icon
const pointIcon = (color: string): DivIcon =>
    L.divIcon({
        className: "custom-point-icon",
        html: `<div style="width:12px;height:12px;background-color:${color};
      border:1px solid white;border-radius:3px;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });

function ClickHandler({
    onClick,
    drawing,
}: {
    onClick: (latlng: LatLngExpression) => void;
    drawing: boolean;
}) {
    useMapEvents({
        click(e) {
            if (drawing) onClick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function LeafletMap({ thresholdRules }: { thresholdRules: ThresholdRule[] }) {
    const [center] = useState<LatLngExpression>([17.385044, 78.486671]);
    const [drawing, setDrawing] = useState(false);
    const [polygons, setPolygons] = useState<
        {
            coords: LatLngExpression[];
            dataSource: string;
            color: string;
            weatherData?: any;
        }[]
    >([]);
    const [tempPolygon, setTempPolygon] = useState<LatLngExpression[]>([]);

    const handleMapClick = (latlng: LatLngExpression) => {
        if (!drawing) return;

        if (
            tempPolygon.length >= 3 &&
            Math.abs((tempPolygon[0] as [number, number])[0] - (latlng as [number, number])[0]) <
                0.0001 &&
            Math.abs((tempPolygon[0] as [number, number])[1] - (latlng as [number, number])[1]) <
                0.0001
        ) {
            finishPolygon();
            return;
        }

        if (tempPolygon.length >= 12) {
            alert("You can only create up to 12 points.");
            return;
        }

        setTempPolygon((prev) => [...prev, latlng]);
    };

    const [datasetColors, setDatasetColors] = useState<Record<string, string>>({
        "Dataset A": "#8B5CF6",
        "Dataset B": "#10B981",
        "Dataset C": "#F59E0B",
    });

    useEffect(() => {
        setPolygons((prev) =>
            prev.map((polygon) => {
                if (!polygon.weatherData) return polygon;

                // For now, just pick hour 0 (later, connect TimelineSlider)
                const temp = polygon.weatherData.temperature_2m[0];
                return { ...polygon, color: applyColorRules(temp) };
            })
        );
    }, [thresholdRules]);

    const finishPolygon = async () => {
        if (tempPolygon.length < 3) {
            alert("A polygon requires at least 3 points.");
            return;
        }

        const datasetName = window.prompt("Enter a name for this dataset:", "Dataset A")?.trim();
        if (!datasetName) {
            alert("Polygon creation cancelled.");
            return;
        }

        let color = datasetColors[datasetName];
        if (!color) {
            color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            setDatasetColors((prev) => ({ ...prev, [datasetName]: color }));
        }

        const [centroidLat, centroidLng] = getCentroid(tempPolygon);
        const weatherData = await fetchWeatherData(centroidLat, centroidLng);

        setPolygons((prev) => [
            ...prev,
            { coords: tempPolygon, dataSource: datasetName, color, weatherData },
        ]);

        setTempPolygon([]);
        setDrawing(false);
    };

    // Helper to convert LatLngExpression to [number, number]
    function toLatLngTuple(point: LatLngExpression): [number, number] {
        if (Array.isArray(point)) return point as [number, number];
        if ("lat" in point && "lng" in point) return [point.lat, point.lng];
        if ((point as any).lat !== undefined && (point as any).lng !== undefined)
            return [(point as any).lat, (point as any).lng];
        // fallback
        return [0, 0];
    }

    // Calculate centroid of polygon
    function getCentroid(points: LatLngExpression[]): [number, number] {
        let latSum = 0,
            lngSum = 0;
        points.forEach((pt) => {
            const [lat, lng] = toLatLngTuple(pt);
            latSum += lat;
            lngSum += lng;
        });
        return [latSum / points.length, lngSum / points.length];
    }

    const deletePolygon = (index: number) => {
        setPolygons((prev) => prev.filter((_, i) => i !== index));
    };

    const applyColorRules = (temp: number) => {
        for (let rule of thresholdRules) {
            if (
                (rule.operator === "<" && temp < rule.value) ||
                (rule.operator === ">" && temp > rule.value) ||
                (rule.operator === "<=" && temp <= rule.value) ||
                (rule.operator === ">=" && temp >= rule.value) ||
                (rule.operator === "=" && temp === rule.value)
            ) {
                return rule.color;
            }
        }
        return "gray"; // default color
    };

    return (
        <div className="flex gap-4">
            <div
                className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-700"
                style={{ cursor: drawing ? "crosshair" : "grab" }}
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
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    <ClickHandler onClick={handleMapClick} drawing={drawing} />

                    {/* {polygons.map((polygon, i) => (
            <Polygon
              key={i}
              positions={polygon.coords}
              pathOptions={{ color: "purple" }}
            />
          ))} */}

                    {polygons.map((polygon, i) => (
                        <Polygon
                            key={i}
                            positions={polygon.coords}
                            pathOptions={{ color: polygon.color }}
                        />
                    ))}

                    {tempPolygon.length > 1 && (
                        <Polygon
                            positions={tempPolygon}
                            pathOptions={{ color: "orange", dashArray: "4" }}
                        />
                    )}

                    {tempPolygon.map((point, i) => (
                        <Marker
                            key={i}
                            position={point}
                            icon={pointIcon(i === 0 ? "green" : "#8B5CF6")}
                            eventHandlers={{
                                click: () => {
                                    if (i === 0 && tempPolygon.length >= 3) finishPolygon();
                                },
                            }}
                        />
                    ))}
                </MapContainer>
            </div>

            <div className="w-64 bg-slate-900 rounded-lg p-4">
                <button
                    onClick={() => setDrawing(!drawing)}
                    className={`w-full px-4 py-2 rounded mb-4 ${
                        drawing
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-purple-600 hover:bg-purple-700"
                    }`}
                >
                    {drawing ? "Cancel Drawing" : "Start Drawing"}
                </button>

                <h3 className="text-lg font-semibold mb-2">Polygons</h3>
                {polygons.length === 0 && (
                    <p className="text-sm text-gray-400">No polygons drawn.</p>
                )}

                {polygons.map((polygon, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center text-sm mb-2 p-2 bg-slate-800 rounded"
                    >
                        <span>
                            {polygon.dataSource} ({polygon.coords.length} pts)
                        </span>
                        <button
                            onClick={() => deletePolygon(i)}
                            className="text-red-400 hover:text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
