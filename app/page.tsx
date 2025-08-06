"use client";
import TimelineSlider from "@/components/TimelineSlider";
import InteractiveMap from "@/components/InteractiveMap";
import ThresholdSidebar from "@/components/Sidebar";
import { useState, useEffect, useRef } from "react";
import { ThresholdRule, PolygonData } from "@/types/types";

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

    // Function to find the nearest time index according to the user selected input
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
    const cache = useRef(new Map());

    const fetchWeatherDataForPolygons = async () => {
        const updatedPolygons = [];

        for (const polygon of polygons) {
            const [lat, lng] = getCentroid(polygon.coords);

            const key = `${lat},${lng},${startDate.toISOString().split("T")[0]},${endDate.toISOString().split("T")[0]}`;

            let data;

            // Use cache if available
            if (cache.current.has(key)) {
                // console.log("From cache");
                data = cache.current.get(key);
                // console.log(data);
            } else {
                // console.log("Calling API");
                const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${
                    startDate.toISOString().split("T")[0]
                }&end_date=${endDate.toISOString().split("T")[0]}&hourly=temperature_2m`;

                try {
                    const response = await fetch(url);
                    data = await response.json();
                } catch (err) {
                    console.error("Error fetching weather data:", err);
                    updatedPolygons.push(polygon);
                    continue;
                }

                // Save result to cache
                cache.current.set(key, data);
            }

            if (!data?.hourly?.time || !data?.hourly?.temperature_2m) {
                updatedPolygons.push(polygon);
                continue;
            }

            // Determine target time
            const targetTime =
                startDate.getTime() === endDate.getTime()
                    ? startDate
                    : new Date((startDate.getTime() + endDate.getTime()) / 2);

            // Find nearest temperature
            const nearestIndex = findNearestTimeIndex(data.hourly.time, targetTime);
            const temp = data.hourly.temperature_2m[nearestIndex] ?? 0;

            updatedPolygons.push({
                ...polygon,
                weatherData: data,
                color: applyColorRules(temp),
            });
        }

        // console.log(updatedPolygons);

        // Update all polygons at once
        setPolygons(updatedPolygons);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchWeatherDataForPolygons();
        }, 1000);

        return () => clearTimeout(handler);
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
