import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Script from "next/script";

const ltSuperior = localFont({
  src: [
    { path: "../../fonts/lt-superior/light.otf", weight: "300" },
    { path: "../../fonts/lt-superior/regular.otf", weight: "400" },
    { path: "../../fonts/lt-superior/medium.otf", weight: "500" },
    { path: "../../fonts/lt-superior/semibold.otf", weight: "600" },
    { path: "../../fonts/lt-superior/bold.otf", weight: "700" },
    { path: "../../fonts/lt-superior/extrabold.otf", weight: "800" },
  ],
  variable: "--font-lt-superior",
  display: "swap",
});

const ltSuperiorMono = localFont({
  src: [
    { path: "../../fonts/lt-superior-mono/regular.otf", weight: "400" },
    { path: "../../fonts/lt-superior-mono/medium.otf", weight: "500" },
    { path: "../../fonts/lt-superior-mono/semibold.otf", weight: "600" },
    { path: "../../fonts/lt-superior-mono/bold.otf", weight: "700" },
  ],
  variable: "--font-lt-superior-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Routing.Run Dashboard",
  description: "API gateway with multi-provider LLM routing",
  icons: {
    icon: "/logo_trans_black.png",
    shortcut: "/logo_trans_black.png",
    apple: "/logo_trans_black.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html
      className={`${ltSuperior.variable} ${ltSuperiorMono.variable} h-full`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex h-full min-h-0 flex-col bg-[#f7f7f7] text-foreground antialiased dark:bg-[#141414]">
        {isDevelopment ? (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        ) : null}
        <Script
          src="https://cdn.databuddy.cc/databuddy.js"
          data-client-id="6eac3218-8169-4ae2-bb34-e88a303fac76"
          data-track-hash-changes="true"
          data-track-attributes="true"
          data-track-outgoing-links="true"
          data-track-interactions="true"
          data-track-web-vitals="true"
          data-track-errors="true"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f7f7f7] dark:bg-[#141414]">
              {children}
            </main>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
