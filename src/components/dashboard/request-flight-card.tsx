"use client";

import { useEffect, useState } from "react";
import { FlightStatusCardAdaptive } from "@/components/ui/flight-status-card";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestFlightCardProps {
  requestsUsed: number;
  requestsTotal: number;
  planTier: string;
  loading: boolean;
}

function getTimeUntilReset(): { hours: number; minutes: number } {
  const now = new Date();
  const resetUtc = new Date(now);
  resetUtc.setUTCDate(resetUtc.getUTCDate() + 1);
  resetUtc.setUTCHours(0, 0, 0, 0);
  const diffMs = resetUtc.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

export function RequestFlightCard({
  requestsUsed,
  requestsTotal,
  planTier,
  loading,
}: RequestFlightCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilReset);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilReset());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 sm:px-5 sm:py-4 dark:border-zinc-800 dark:bg-[#18181b]">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-6 w-14" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-6 w-full rounded-full" />
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, requestsTotal - requestsUsed);
  const progress = requestsTotal > 0 ? (requestsUsed / requestsTotal) * 100 : 0;
  const tierLabel = planTier.charAt(0).toUpperCase() + planTier.slice(1);

  return (
    <div className="w-full">
      <FlightStatusCardAdaptive
        departureCode={requestsUsed.toString()}
        arrivalCode={requestsTotal.toString()}
        departureCity="Requests Used"
        arrivalCity="Daily Limit"
        departureTime={`${tierLabel} Plan`}
        arrivalTime={`${remaining.toLocaleString()} left`}
        eta={`${padTwo(timeLeft.hours)}H ${padTwo(timeLeft.minutes)}M`}
        timezone="Until Daily Reset"
        nextEvent="REMAINING"
        nextEventTime={remaining.toLocaleString()}
        progress={Math.min(progress, 100)}
        remainingTime={`-${padTwo(timeLeft.hours)}H ${padTwo(timeLeft.minutes)}M`}
      />
    </div>
  );
}
