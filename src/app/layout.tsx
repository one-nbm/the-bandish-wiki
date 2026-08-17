import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { ThemeProvider } from "./ThemeProvider";
import "./globals.css";

const googleSans = Google_Sans_Flex({
  variable: "--font-google-sans",
  subsets: ["latin"],
  axes: ["ROND"],
});

export const metadata: Metadata = {
  title: "The Bandish Wiki",
  description: "A catalogue of Bandishes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* CHANGED: Download the Rounded icon set instead of Outlined */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" 
        />
      </head>
      
      {/* ADDED: inline style to force the ROND variable axis to max (100) */}
      <body 
        className={`${googleSans.variable} font-sans min-h-screen flex flex-col antialiased`}
        style={{ fontVariationSettings: '"ROND" 25' }}
      >
        {/* ADDED: The ThemeProvider to fix the Dark Mode state across pages! */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}