import TimelineSlider from "@/components/TimelineSlider";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-10 p-10">
      <h1 className="text-3xl font-bold text-white">Timeline Slider</h1>
      <TimelineSlider />
    </main>
  );
}