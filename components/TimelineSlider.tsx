"use client";

import * as Slider from "@radix-ui/react-slider";
import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react"; // icon library
import * as Tooltip from "@radix-ui/react-tooltip";

export default function TimelineSlider() {
  const now = new Date();

  // Dropdown selection: hourly or day-wise resolution
  const [resolution, setResolution] = useState<"hourly" | "daily">("hourly");

  // Mode: single or range
  const [mode, setMode] = useState<"single" | "range">("single");

  // Generate data based on resolution
  const data = useMemo(() => {
    if (resolution === "hourly") {
      return Array.from({ length: 30 * 24 }, (_, i) => {
        const date = new Date(now);
        date.setHours(now.getHours() - (15 * 24) + i);
        return date;
      });
    } else {
      return Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now);
        date.setDate(now.getDate() - 15 + i);
        return date;
      });
    }
  }, [resolution, now]);

  // Default slider values
  const [value, setValue] = useState<number[]>([data.length - 1]);

  // Handle mode toggle
  const toggleMode = () => {
    if (mode === "single") {
      setMode("range");
      setValue([data.length - (resolution === "hourly" ? 24 : 5), data.length - 1]);
    } else {
      setMode("single");
      setValue([data.length - 1]);
    }
  };

  // // Handle resolution change
  // const handleResolutionChange = (res: "hourly" | "daily") => {
  //   setResolution(res);
  //   if (mode === "single") {
  //     setValue([res === "hourly" ? 719 : 29]);
  //   } else {
  //     setValue([res === "hourly" ? 696 : 25, res === "hourly" ? 719 : 29]);
  //   }
  // };

    const handleResolutionChange = (res: "hourly" | "daily") => {
    const length = res === "hourly" ? 30 * 24 : 30;
    setResolution(res);
    if (mode === "single") {
      setValue([length - 1]);
    } else {
      setValue([length - Math.floor(length / 5), length - 1]);
    }
  };

  // Calculate displayed period
  const startDate = data[mode === "single" ? value[0] : value[0]];
  const endDate = mode === "single" ? data[value[0]] : data[value[1]];

  const periodDays =
    mode === "single"
      ? 1
      : differenceInDays(endDate, startDate) + 1; // inclusive day count

  return (
    <div className="w-full p-4 bg-slate-900 rounded-xl">
      {/* Summary Header */}
      <div className="flex items-center gap-2 mb-4 text-white">
        <CalendarIcon size={18} />
        <span className="text-sm font-medium">
          Time Period:{" "}
          {format(startDate, "MMM dd, yyyy")} →
          {mode === "single" ? "" : ` ${format(endDate, "MMM dd, yyyy")}`}{" "}
          ({periodDays} {periodDays === 1 ? "day" : "days"})
        </span>
      </div>

      {/* Controls */}
      <div className="flex justify-between mb-4">
        {/* Resolution Dropdown */}
        <select
          value={resolution}
          onChange={(e) => handleResolutionChange(e.target.value as "hourly" | "daily")}
          className="px-3 py-2 bg-slate-800 text-white rounded border border-gray-700"
        >
          <option value="hourly">Hourly Resolution</option>
          <option value="daily">Day-wise Resolution</option>
        </select>

        {/* Mode Toggle */}
        <button
          onClick={toggleMode}
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
        onValueChange={setValue}
      >
        <Slider.Track className="relative flex-grow h-1 bg-gray-600 rounded-full">
          <Slider.Range className="absolute h-full bg-purple-500 rounded-full" />
        </Slider.Track>

        {value.map((v, i) => (
  <Tooltip.Provider key={i} delayDuration={0}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Slider.Thumb
          aria-label={mode === "single" ? "Time Selector" : i === 0 ? "Start Time" : "End Time"}
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

      {/* Selected Values */}
      <div className="mt-4 text-center text-sm text-purple-400">
        {mode === "single"
          ? `Selected: ${
              resolution === "hourly"
                ? format(data[value[0]], "MMM dd, yyyy HH:00")
                : format(data[value[0]], "MMM dd, yyyy")
            }`
          : `Selected: ${
              resolution === "hourly"
                ? format(data[value[0]], "MMM dd, yyyy HH:00")
                : format(data[value[0]], "MMM dd, yyyy")
            } → ${
              resolution === "hourly"
                ? format(data[value[1]], "MMM dd, yyyy HH:00")
                : format(data[value[1]], "MMM dd, yyyy")
            }`}
      </div>
    </div>
  );
}
