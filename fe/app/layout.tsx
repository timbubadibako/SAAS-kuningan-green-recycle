import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { PwaRegister } from "../components/pwa-register";

export const metadata: Metadata = {
  title: "Green Cycle Kuningan | Bersih, Hijau, Berkelanjutan",
  description: "Sistem ERP Timbangan Rongsok, Inventory 4 Gudang & Finansial - Bersih, Hijau, Berkelanjutan",
  manifest: "/manifest.json",
  themeColor: "#14532d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
