import type { Metadata } from "next";
import { Geist } from "next/font/google";

import WebsiteLoader from "@/components/layout/website-loader";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GYM House",
  description:
    "Build strength, improve performance and transform your body at GYM House.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} bg-[#080908]`}
      >
        <WebsiteLoader />

        {children}
      </body>
    </html>
  );
}