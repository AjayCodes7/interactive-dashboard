"use client";

import dynamic from "next/dynamic";
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

type LatLngExpression = [number, number];

const Map = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function InteractiveMap({
    thresholdRules,
    drawing,
    setDrawing,
    polygons,
    setPolygons,
    tempPolygon,
    setTempPolygon,
    datasetColors,
    setDatasetColors,
    activeTimeIndex,
}: {
    thresholdRules: ThresholdRule[];
    drawing: boolean;
    setDrawing: (v: boolean) => void;
    polygons: PolygonData[];
    setPolygons: (v: PolygonData[] | ((prev: PolygonData[]) => PolygonData[])) => void;
    tempPolygon: LatLngExpression[];
    setTempPolygon: (
        v: LatLngExpression[] | ((prev: LatLngExpression[]) => LatLngExpression[])
    ) => void;
    datasetColors: Record<string, string>;
    setDatasetColors: (
        v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)
    ) => void;
    activeTimeIndex: number;
}) {
    return (
        <Map
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
    );
}
