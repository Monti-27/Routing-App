import { Sidebar } from "@/components/layout/sidebar";
import ComponentOrderingGraph from "./ComponentOrderingGraph";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-foreground [--accent:#ecedf3] [--background:#f7f7f7] [--card:#ffffff] [--input:#e4e5ea] [--popover:#ffffff] dark:bg-[#141414] dark:[--accent:#232326] dark:[--background:#141414] dark:[--card:#181818] dark:[--input:#242427] dark:[--popover:#181818]">
      <div className="pointer-events-none fixed inset-x-0 bottom-6 top-6 hidden lg:block">
        <div className="relative mx-auto h-full max-w-[1440px] px-8">
          <div className="pointer-events-auto absolute left-8 top-0 h-full w-64">
            <Sidebar />
          </div>
        </div>
      </div>

      <div className="lg:mx-auto lg:max-w-[1440px] lg:pl-[21rem] lg:pr-8">
        <main className="min-h-screen px-4 py-6 lg:px-8 lg:py-10">
          <ComponentOrderingGraph />
        </main>
      </div>
    </div>
  );
}
