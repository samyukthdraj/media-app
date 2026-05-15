import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Import Sonner

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://neha-sreejith.vercel.app"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "EHAS | Visual Portfolio",
    template: "%s | EHAS",
  },
  description:
    "Official brand portfolio of EHAS. A premium showcase of high-quality photography and videography by Neha Sreejith.",
  keywords: [
    "EHAS",
    "Neha Sreejith",
    "Portfolio",
    "Media Gallery",
    "Photography",
    "Videography",
    "Creative Showcase",
  ],
  authors: [{ name: "Neha Sreejith" }],
  creator: "Neha Sreejith",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://neha-sreejith.vercel.app",
    title: "EHAS | Neha Sreejith's Portfolio",
    description: "Official brand portfolio of EHAS by Neha Sreejith.",
    siteName: "EHAS | Neha Sreejith",
  },
  twitter: {
    card: "summary_large_image",
    title: "EHAS | Neha Sreejith's Portfolio",
    description: "Official brand portfolio of EHAS by Neha Sreejith.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {children}
        {/* The Toaster component must be here to show the popups */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
