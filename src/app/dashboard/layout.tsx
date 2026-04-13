"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] dark:bg-[#141414]">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-foreground [--accent:#ecedf3] [--background:#f7f7f7] [--card:#ffffff] [--input:#e4e5ea] [--popover:#ffffff] dark:bg-[#141414] dark:[--accent:#232326] dark:[--background:#141414] dark:[--card:#181818] dark:[--input:#242427] dark:[--popover:#181818]">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 top-6 hidden lg:block">
        <div className="relative mx-auto h-full max-w-[1440px] px-8">
          <div className="pointer-events-auto absolute left-8 top-0 h-full w-64">
            <Sidebar />
          </div>
        </div>
      </div>

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>

      <div className="lg:mx-auto lg:max-w-[1440px] lg:pl-[21rem] lg:pr-8">
        <header className="border-b border-zinc-900 lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="-ml-1 rounded-md border border-zinc-800 bg-zinc-950 p-2 text-foreground/80 hover:bg-zinc-900 hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100">Routing</p>
              <p className="truncate text-xs text-zinc-500">Dashboard</p>
            </div>

            <div className="flex-1" />
          </div>
        </header>

        <main className="min-h-screen bg-[#f7f7f7] px-4 py-6 dark:bg-[#141414] lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1120px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
