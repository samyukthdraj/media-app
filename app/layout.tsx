import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Import Sonner

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://neha-sreejith.vercel.app"),
  title: {
    default: "Neha Sreejith | EHAS Portfolio",
    template: "%s | Neha Sreejith",
  },
  description: "Professional media portfolio of Neha Sreejith (EHAS). A premium showcase of high-quality photography and videography.",
  keywords: ["Neha Sreejith", "EHAS", "Portfolio", "Media Gallery", "Photography", "Videography", "Creative Showcase"],
  authors: [{ name: "Neha Sreejith" }],
  creator: "Neha Sreejith",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://neha-sreejith.vercel.app",
    title: "Neha Sreejith | EHAS Portfolio",
    description: "Professional media portfolio of Neha Sreejith (EHAS).",
    siteName: "EHAS Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neha Sreejith | EHAS Portfolio",
    description: "Professional media portfolio of Neha Sreejith (EHAS).",
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
