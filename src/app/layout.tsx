import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { ThemeProvider } from "./ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google';
import AuthButton from "@/components/AuthButton";
import Navbar from "@/components/Navbar";
import SmoothScrolling from "@/components/SmoothScrolling";
import "./globals.css";

const googleSans = Google_Sans_Flex({
  variable: "--font-google-sans",
  subsets: ["latin"],
  axes: ["ROND", "wdth"],
  adjustFontFallback: false,
});


export const metadata: Metadata = {
  title: {
    template: "%s | The Bandish Wiki",
    default: "The Bandish Wiki",
  },
  applicationName: "The Bandish Wiki",
  description: "An open-source catalogue of Hindustani classical bandishes and raags.",
  metadataBase: new URL("https://bandish-wiki.vercel.app"),
  openGraph: {
    title: "The Bandish Wiki",
    description: "An open-source catalogue of Hindustani classical bandishes and raags.",
    url: "https://bandish-wiki.vercel.app",
    siteName: "The Bandish Wiki",
    locale: "en_US",
    type: "website",
  },
  verification: {
    google: 'XLcf67BKg90PNoJCHeQ_7W8xBeEvNm1VNWDz2bj1K88',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* CHANGED: Download the Rounded icon set instead of Outlined */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>

      {/* ADDED: inline style to force the ROND variable axis to max (100) */}
      <body
        className={`${googleSans.variable} font-sans min-h-screen flex flex-col antialiased relative overflow-x-hidden bg-m3-surface dark:bg-m3-surface-dark text-gray-900 dark:text-white transition-colors duration-500`}
        style={{ fontVariationSettings: '"ROND" 25' }}
      >
        {/* ADDED: The ThemeProvider to fix the Dark Mode state across pages! */}
        <ThemeProvider>
          <SmoothScrolling>
            <Navbar>
              <AuthButton />
            </Navbar>

            {children}
            <SpeedInsights />
          </SmoothScrolling>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-XELFB1P2TX" />
      </body>
    </html>
  );
}