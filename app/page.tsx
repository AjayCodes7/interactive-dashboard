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

export default function Home() {
    const [thresholdRules, setThresholdRules] = useState<ThresholdRule[]>([]);

    return (
        <div className="flex flex-col items-center bg-gray-950 text-white p-4">
            <div className="w-full max-w-6xl">
                <TimelineSlider />
            </div>

            <div className="w-full max-w-6xl mt-4">
                <InteractiveMap thresholdRules={thresholdRules} />
            </div>

            <div>
                <ThresholdSidebar rules={thresholdRules} setRules={setThresholdRules} />
            </div>
        </div>
    );
}
