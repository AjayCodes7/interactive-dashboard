"use client"
import { useState } from "react";

type ThresholdRule = {
  color: string;
  operator: "<" | "<=" | ">" | ">=" | "=";
  value: number;
};

export default function ThresholdSidebar() {
  const [rules, setRules] = useState<ThresholdRule[]>([]);

  const addRule = () => {
    setRules([...rules, { color: "#FF0000", operator: "<", value: 0 }]);
  };

  const updateRule = (index: number, updated: Partial<ThresholdRule>) => {
    setRules(rules.map((r, i) => (i === index ? { ...r, ...updated } : r)));
  };

  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Threshold Rules</h3>

      {rules.map((rule, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          {/* Color Picker */}
          <input
            type="color"
            value={rule.color}
            onChange={(e) => updateRule(i, { color: e.target.value })}
            className="w-8 h-8 p-0 border-none"
          />

          {/* Operator Selector */}
          <select
            value={rule.operator}
            onChange={(e) => updateRule(i, { operator: e.target.value as ThresholdRule["operator"] })}
            className="bg-slate-800 text-white rounded px-2 py-1"
          >
            <option value="<">&lt;</option>
            <option value="<=">&le;</option>
            <option value=">">&gt;</option>
            <option value=">=">&ge;</option>
            <option value="=">=</option>
          </select>

          {/* Value Input */}
          <input
            type="number"
            value={rule.value}
            onChange={(e) => updateRule(i, { value: parseFloat(e.target.value) })}
            className="bg-slate-800 text-white rounded px-2 py-1 w-20"
          />

          {/* Delete Button */}
          <button
            onClick={() => deleteRule(i)}
            className="text-red-400 hover:text-red-500"
          >
            🗑
          </button>
        </div>
      ))}

      <button
        onClick={addRule}
        className="bg-purple-600 hover:bg-purple-700 text-white w-full rounded px-4 py-2 mt-2"
      >
        Add Rule
      </button>
    </div>
  );
}
