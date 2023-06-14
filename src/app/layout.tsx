"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import * as Spectrum from "@adobe/react-spectrum";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`h-full ${inter.className} bg-neutral-100`}>
        <Spectrum.SSRProvider>
          <Spectrum.Provider theme={Spectrum.defaultTheme} minHeight="100%">
            {children}
          </Spectrum.Provider>
        </Spectrum.SSRProvider>
      </body>
    </html>
  );
}
