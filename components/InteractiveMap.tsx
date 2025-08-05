"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
type ThresholdRule = {
    color: string;
    operator: "<" | "<=" | ">" | ">=" | "=";
    value: number;
};

// Dynamically import React-Leaflet components
const Map = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function InteractiveMap({ thresholdRules }: { thresholdRules: ThresholdRule[] }) {
    return <Map thresholdRules={thresholdRules} />;
}
