import "@workspace/ui/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { FooterServer, FooterSkeleton } from "@/components/footer";
import { JsonLdServer } from "@/components/json-ld-server";
import { NavbarServer, NavbarSkeleton } from "@/components/navbar-server";
import { PreviewBar } from "@/components/preview-bar";
import { Providers } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

async function DraftModeUI() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <PreviewBar />
      <VisualEditing />
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Suspense fallback={<NavbarSkeleton />}>
            <NavbarServer />
          </Suspense>
          {children}
          <Suspense fallback={<FooterSkeleton />}>
            <FooterServer />
          </Suspense>
          <Suspense>
            <JsonLdServer />
          </Suspense>
          <Suspense>
            <DraftModeUI />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
