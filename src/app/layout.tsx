import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { departureMono } from "./_components/utils/load-fonts";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dither Lab",
  description:
    "A fast, interactive tool for experimenting with dithering algorithms. Supports real-time previews, adjustable parameters, and SVG export.",
  icons: [
    // { rel: "icon", sizes: "any", url: "/favicon.ico" },
    { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
  ],
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_URL}/og-image.png`,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${departureMono.variable} antialiased dark`}
      >
        {children}
      </body>
    </html>
  );
}
