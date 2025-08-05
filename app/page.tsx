"use client";
import TimelineSlider from "@/components/TimelineSlider";
import InteractiveMap from "@/components/InteractiveMap";
import ThresholdSidebar from "@/components/Sidebar";
import { useState } from "react";

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
    const [endDate, setEndDate] = useState<Date>(new Date("2025-07-18T00:00:00"));
    const [resolution, setResolution] = useState<"hourly" | "daily">("hourly");

    // Leaflet Map States
    const [drawing, setDrawing] = useState(false);
    const [polygons, setPolygons] = useState<PolygonData[]>([]);
    const [tempPolygon, setTempPolygon] = useState<[number, number][]>([]);
    const [datasetColors, setDatasetColors] = useState<Record<string, string>>({
        // "Dataset A": "#8B5CF6",
        // "Dataset B": "#10B981",
        // "Dataset C": "#F59E0B",
    });

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
                />
            </div>

            <div>
                <ThresholdSidebar rules={thresholdRules} setRules={setThresholdRules} />
            </div>
        </div>
    );
}
