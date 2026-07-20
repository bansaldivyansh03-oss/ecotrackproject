import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoTracker — Grow a lighter footprint",
  description:
    "Track your carbon footprint, grow a living virtual forest, and build sustainable habits with EcoTracker.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#142B22",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <div className="mx-auto min-h-dvh w-full max-w-md relative bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
