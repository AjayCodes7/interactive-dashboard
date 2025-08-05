"use client";

import * as Slider from "@radix-ui/react-slider";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

type TimelineSliderProps = {
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    resolution: "hourly" | "daily";
    setResolution: (res: "hourly" | "daily") => void;
    activeTimeIndex: number;
    setActiveTimeIndex: (index: number) => void;
};

export default function TimelineSlider({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resolution,
    setResolution,
    activeTimeIndex,
    setActiveTimeIndex,
}: TimelineSliderProps) {
    const now = new Date();
    const [mode, setMode] = useState<"single" | "range">("single");

    // Generate date array
    const data = useMemo(() => {
        if (resolution === "hourly") {
            return Array.from({ length: 30 * 24 }, (_, i) => {
                const date = new Date(now);
                date.setHours(now.getHours() - 15 * 24 + i);
                return date;
            });
        } else {
            return Array.from({ length: 30 }, (_, i) => {
                const date = new Date(now);
                date.setDate(now.getDate() - 15 + i);
                return date;
            });
        }
    }, [resolution]);

    // Map startDate and endDate to slider indices
    const value = useMemo(() => {
        const formatKey = resolution === "hourly" ? "yyyy-MM-dd HH:00" : "yyyy-MM-dd";
        const findIndex = (target: Date) =>
            data.findIndex((d) => format(d, formatKey) === format(target, formatKey));

        if (mode === "single") {
            const idx = findIndex(endDate);
            return [idx !== -1 ? idx : data.length - 1];
        } else {
            const startIdx = findIndex(startDate);
            const endIdx = findIndex(endDate);
            return [startIdx !== -1 ? startIdx : 0, endIdx !== -1 ? endIdx : data.length - 1];
        }
    }, [startDate, endDate, data, mode, resolution]);

    // Handle slider changes
    const handleValueChange = (val: number[]) => {
        if (mode === "single") {
            const selected = data[val[0]];
            setStartDate(selected);
            setEndDate(selected); // same for single mode
        } else {
            const start = data[val[0]];
            const end = data[val[1]];
            setStartDate(start);
            setEndDate(end);
        }
    };

    return (
        <div className="w-full p-4 bg-slate-900 rounded-xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 text-white">
                <CalendarIcon size={18} />
                <span className="text-sm font-medium">
                    Time Period: {format(startDate, "MMM dd, yyyy")}
                    {mode === "single" ? "" : ` → ${format(endDate, "MMM dd, yyyy")}`}
                </span>
            </div>

            {/* Controls */}
            <div className="flex justify-between mb-4">
                <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as "hourly" | "daily")}
                    className="px-3 py-2 bg-slate-800 text-white rounded border border-gray-700"
                >
                    <option value="hourly">Hourly Resolution</option>
                    <option value="daily">Day-wise Resolution</option>
                </select>

                <button
                    onClick={() => setMode(mode === "single" ? "range" : "single")}
                    className="px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700"
                >
                    {mode === "single" ? "Switch to Range" : "Switch to Single"}
                </button>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-gray-400">
                <span>{format(data[0], "MMM dd, yyyy")}</span>
                <span>{format(data[data.length - 1], "MMM dd, yyyy")}</span>
            </div>

            {/* Slider */}
            <Slider.Root
                className="relative flex items-center w-full h-5 mt-4"
                value={value}
                max={data.length - 1}
                step={1}
                min={0}
                onValueChange={handleValueChange}
            >
                <Slider.Track className="relative flex-grow h-1 bg-gray-600 rounded-full">
                    <Slider.Range className="absolute h-full bg-purple-500 rounded-full" />
                </Slider.Track>

                {value.map((v, i) => (
                    <Tooltip.Provider key={i} delayDuration={0}>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <Slider.Thumb
                                    aria-label={
                                        mode === "single"
                                            ? "Time Selector"
                                            : i === 0
                                              ? "Start Time"
                                              : "End Time"
                                    }
                                    className="block w-4 h-4 bg-purple-600 rounded-full border-2 border-white cursor-pointer"
                                />
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content
                                    side="top"
                                    className="px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg"
                                >
                                    {resolution === "hourly"
                                        ? format(data[v], "MMM dd, yyyy HH:00")
                                        : format(data[v], "MMM dd, yyyy")}
                                    <Tooltip.Arrow className="fill-gray-800" />
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                ))}
            </Slider.Root>

            {/* Selected Value */}
            <div className="mt-4 text-center text-sm text-purple-400">
                {mode === "single"
                    ? `Selected: ${
                          resolution === "hourly"
                              ? format(endDate, "MMM dd, yyyy HH:00")
                              : format(endDate, "MMM dd, yyyy")
                      }`
                    : `Selected: ${
                          resolution === "hourly"
                              ? format(startDate, "MMM dd, yyyy HH:00")
                              : format(startDate, "MMM dd, yyyy")
                      } → ${
                          resolution === "hourly"
                              ? format(endDate, "MMM dd, yyyy HH:00")
                              : format(endDate, "MMM dd, yyyy")
                      }`}
            </div>
        </div>
    );
}
