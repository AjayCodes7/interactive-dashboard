import { create } from "zustand";

interface DashboardState {
  timeline: number[];
  setTimeline: (val: number[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  timeline: [0],
  setTimeline: (val) => set({ timeline: val }),
}));
