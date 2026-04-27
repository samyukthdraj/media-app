import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Import Sonner

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Gallery Admin",
  description: "Upload and share photos and videos",
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
