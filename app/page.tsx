"use client";
import TimelineSlider from "@/components/TimelineSlider";
import InteractiveMap from "@/components/InteractiveMap";
import ThresholdSidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

type ThresholdRule = {
    color: string;
    operator: "<" | "<=" | ">" | ">=" | "=";
    value: number;
};

type PolygonData = {
    coords: [number, number][];
    dataSource: string;
    color: string;
    weatherData?: any;
};

export default function Home() {
    const [thresholdRules, setThresholdRules] = useState<ThresholdRule[]>([]);
    const [startDate, setStartDate] = useState<Date>(new Date("2025-07-18T00:00:00"));
    const [endDate, setEndDate] = useState<Date>(new Date("2025-08-01T00:00:00"));
    const [resolution, setResolution] = useState<"hourly" | "daily">("hourly");

    // Leaflet Map States
    const [drawing, setDrawing] = useState(false);
    const [polygons, setPolygons] = useState<PolygonData[]>([]);
    const [tempPolygon, setTempPolygon] = useState<[number, number][]>([]);
    const [datasetColors, setDatasetColors] = useState<Record<string, string>>({});
    const [activeTimeIndex, setActiveTimeIndex] = useState(0);

    // Function to determine color based on thresholds
    const applyColorRules = (temp: number) => {
        for (let rule of thresholdRules) {
            if (
                (rule.operator === "<" && temp < rule.value) ||
                (rule.operator === "<=" && temp <= rule.value) ||
                (rule.operator === ">" && temp > rule.value) ||
                (rule.operator === ">=" && temp >= rule.value) ||
                (rule.operator === "=" && temp === rule.value)
            ) {
                return rule.color;
            }
        }
        return "gray"; // Default if no rules match
    };

    const findNearestTimeIndex = (timeArray: string[], targetDate: Date) => {
        const targetTime = targetDate.getTime();
        let nearestIndex = 0;
        let smallestDiff = Infinity;

        timeArray.forEach((t, i) => {
            const diff = Math.abs(new Date(t).getTime() - targetTime);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                nearestIndex = i;
            }
        });

        return nearestIndex;
    };

    const getCentroid = (coordinates: [number, number][]) => {
        const latSum = coordinates.reduce((sum, coord) => sum + coord[0], 0);
        const lngSum = coordinates.reduce((sum, coord) => sum + coord[1], 0);
        return [latSum / coordinates.length, lngSum / coordinates.length];
    };
    useEffect(() => {
        const fetchWeatherDataForPolygons = async () => {
            for (const polygon of polygons) {
                const [lat, lng] = getCentroid(polygon.coords);

                console.log(`Calling Open-Meteo API for centroid: ${lat}, ${lng}`);

                const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${
                    startDate.toISOString().split("T")[0]
                }&end_date=${endDate.toISOString().split("T")[0]}&hourly=temperature_2m`;

                const response = await fetch(url);
                const data = await response.json();
                console.log(response);

                if (!data?.hourly?.time || !data?.hourly?.temperature_2m) continue;

                // Determine target time
                const targetTime =
                    startDate.getTime() === endDate.getTime()
                        ? startDate
                        : new Date((startDate.getTime() + endDate.getTime()) / 2);

                // Find nearest temperature
                const nearestIndex = findNearestTimeIndex(data.hourly.time, targetTime);
                const temp = data.hourly.temperature_2m[nearestIndex] ?? 0;

                // Update this polygon's color
                setPolygons((prevPolygons) =>
                    prevPolygons.map((p) =>
                        p.dataSource === polygon.dataSource
                            ? { ...p, weatherData: data, color: applyColorRules(temp) }
                            : p
                    )
                );
            }
        };

        fetchWeatherDataForPolygons();
    }, [startDate, endDate, resolution, polygons]);

    // Update polygon colors when threshold rules or active time index changes
    useEffect(() => {
        setPolygons((prevPolygons) =>
            prevPolygons.map((polygon) => {
                if (!polygon.weatherData?.hourly?.temperature_2m) return polygon;

                const temps = polygon.weatherData.hourly.temperature_2m;
                const temp = temps[activeTimeIndex] ?? temps[0];

                return { ...polygon, color: applyColorRules(temp) };
            })
        );
    }, [thresholdRules, activeTimeIndex]);

    return (
        <div className="flex flex-col items-center bg-gray-950 text-white p-4">
            <div className="w-full max-w-6xl">
                <TimelineSlider
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    resolution={resolution}
                    setResolution={setResolution}
                    activeTimeIndex={activeTimeIndex}
                    setActiveTimeIndex={setActiveTimeIndex}
                />
            </div>

            <div className="w-full max-w-6xl mt-4">
                <InteractiveMap
                    thresholdRules={thresholdRules}
                    drawing={drawing}
                    setDrawing={setDrawing}
                    polygons={polygons}
                    setPolygons={setPolygons}
                    tempPolygon={tempPolygon}
                    setTempPolygon={setTempPolygon}
                    datasetColors={datasetColors}
                    setDatasetColors={setDatasetColors}
                    activeTimeIndex={activeTimeIndex}
                />
            </div>

            <div>
                <ThresholdSidebar rules={thresholdRules} setRules={setThresholdRules} />
            </div>
        </div>
    );
}
