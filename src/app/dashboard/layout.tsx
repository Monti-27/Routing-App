"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
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
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0f0f10]" />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-foreground [--accent:#ecedf3] [--background:#f7f7f7] [--card:#ffffff] [--input:#e4e5ea] [--popover:#ffffff] dark:bg-[#0f0f10] dark:[--accent:#232326] dark:[--background:#0f0f10] dark:[--card:#18181b] dark:[--input:#232326] dark:[--popover:#1c1c1f]">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 top-6 hidden lg:block">
        <div className="relative mx-auto h-full max-w-[1440px] px-8">
          <div className="pointer-events-auto absolute left-8 top-0 h-full w-64">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      </div>

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      <div className="lg:mx-auto lg:max-w-[1440px] lg:pl-[21rem] lg:pr-8">
        <header className="border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="-ml-1 rounded-md border border-zinc-200 bg-white p-2 text-foreground/80 hover:bg-zinc-50 hover:text-foreground dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Routing</p>
              <p className="truncate text-xs text-muted-foreground">Dashboard</p>
            </div>

            <div className="flex-1" />
          </div>
        </header>

        <main className="min-h-screen overflow-x-hidden bg-[#f7f7f7] px-3 py-4 dark:bg-[#0f0f10] sm:px-4 sm:py-6 lg:px-8 lg:py-10">
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
