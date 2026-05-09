import "@workspace/ui/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { querySettingsData } from "@workspace/sanity/query";

import { FooterServer, FooterSkeleton } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { Providers } from "@/components/providers";
import { sanityFetch } from "@/lib/sanity/fetch";
import { getNavigationData } from "@/lib/navigation";

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
  const [nav, jsonLdSettings] = await Promise.all([
    getNavigationData(),
    sanityFetch({ query: querySettingsData, tags: ["settings"] }),
  ]);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Navbar navbarData={nav.navbarData} settingsData={nav.settingsData} />
          {children}
          <Suspense fallback={<FooterSkeleton />}>
            <FooterServer />
          </Suspense>
          <CombinedJsonLd
            includeOrganization
            includeWebsite
            settings={jsonLdSettings}
          />
          <Suspense>
            <DraftModeUI />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
