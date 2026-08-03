import type { Metadata } from "next";
import {
  Geist,
  Noto_Sans_Ethiopic,
} from "next/font/google";
import AuthProvider from "@/components/providers/auth-provider";
import LanguageGate from "@/components/layout/language-gate";
import SmoothScroll from "@/components/layout/smooth-scroll";
import WebsiteLoader from "@/components/layout/website-loader";
import LanguageProvider from "@/components/providers/language-provider";
import SiteTranslator from "@/components/providers/site-translator";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const notoSansEthiopic =
  Noto_Sans_Ethiopic({
    subsets: ["ethiopic"],
    variable: "--font-ethiopic",
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
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${geist.variable} ${notoSansEthiopic.variable} bg-[#080908]`}
      >
      <LanguageProvider>
        <AuthProvider>
          <LanguageGate>
            <SiteTranslator />

            <WebsiteLoader />

            <SmoothScroll>
              {children}
            </SmoothScroll>
          </LanguageGate>
        </AuthProvider>
      </LanguageProvider>
      </body>
    </html>
  );
}