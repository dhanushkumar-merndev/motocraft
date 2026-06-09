import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#080808",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://motocraft.netlify.app'),
  title: "MotoCraft Careers",
  description: "Apply for career opportunities at MotoCraft",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "MotoCraft Careers",
    description: "Apply for career opportunities at MotoCraft",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col" style={{ background: "#080808", color: "#F5F2EE" }}>{children}</body>
    </html>
  );
}
