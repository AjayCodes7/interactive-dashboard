import TimelineSlider from "@/components/TimelineSlider";
import InteractiveMap from "@/components/InteractiveMap";
import ThresholdSidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-gray-950 text-white p-4">
      {/* Both components share the same container width */}
      <div className="w-full max-w-6xl">
        <TimelineSlider />
      </div>

      <div className="w-full max-w-6xl mt-4">
        <InteractiveMap />
      </div>

      <div>
        <ThresholdSidebar/>
      </div>
    </div>
  );
}