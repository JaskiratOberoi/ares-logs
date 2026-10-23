import type { Metadata, Viewport } from "next";
import { Michroma, Overpass, Overpass_Mono } from "next/font/google";
import "./globals.css";

const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const overpassMono = Overpass_Mono({
  variable: "--font-overpass-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Ares Sales", template: "%s · Ares Sales" },
  description: "Ares Labs field visit records: site visits, contacts and tagged instrument photos.",
  icons: { icon: "/brand/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1f2a37",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${overpass.variable} ${overpassMono.variable} ${michroma.variable}`}>
      <body>{children}</body>
    </html>
  );
}
