"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mainEl = mainContentRef.current;
      if (!mainEl) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "PageDown" || e.key === "PageUp" || e.key === "Home" || e.key === "End") {
        const { scrollTop, scrollHeight, clientHeight } = mainEl;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if (e.key === "ArrowDown" && !isAtBottom) {
          e.preventDefault();
          mainEl.scrollTop += 50;
        } else if (e.key === "ArrowUp" && !isAtTop) {
          e.preventDefault();
          mainEl.scrollTop -= 50;
        } else if (e.key === "PageDown" && !isAtBottom) {
          e.preventDefault();
          mainEl.scrollTop += clientHeight;
        } else if (e.key === "PageUp" && !isAtTop) {
          e.preventDefault();
          mainEl.scrollTop -= clientHeight;
        } else if (e.key === "Home") {
          e.preventDefault();
          mainEl.scrollTop = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          mainEl.scrollTop = scrollHeight;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-amber" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-[280px]">
        <Sidebar />
      </div>

      {/* Mobile sidebar - slides in from left */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-200 ease-in-out lg:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-[280px]">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-accent lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo - hidden on mobile since we have hamburger */}
          <div className="hidden lg:flex items-center gap-2">
            <img
              src="/logo_trans_black.png"
              alt="Routing.run"
              className="h-6 w-auto object-contain"
            />
            <span className="font-semibold">Dashboard</span>
          </div>

          <div className="flex-1" />

          <Header user={user} />
        </header>

        {/* Page content */}
        <main
          ref={mainContentRef}
          className="p-4 lg:p-6 min-h-[calc(100vh-56px)] lg:min-h-[calc(100vh-64px)] overflow-y-auto"
          tabIndex={0}
          role="main"
        >
          {children}
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