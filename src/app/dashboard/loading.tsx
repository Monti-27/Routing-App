import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="h-8 w-8 text-zinc-400" />
        <p className="text-sm text-zinc-500">Loading dashboard...</p>
      </div>
    </div>
  );
}
