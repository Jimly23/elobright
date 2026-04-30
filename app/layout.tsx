import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local"; // 1. Import localFont
import "./globals.css";

// 2. Konfigurasi Font Satoshi
const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/Satoshi-Variable.ttf", // Sesuaikan dengan nama file Anda
      weight: "100 900", // Jika file-nya 'Variable', pakai range ini
    },
  ],
  variable: "--font-satoshi",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elobright - English Test",
  description: "Advanced English certification test",
};

import CountdownPopup from "@/src/components/CountdownPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${satoshi.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CountdownPopup />
        {children}
      </body>
    </html>
  );
}