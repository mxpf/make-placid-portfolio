import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteChrome } from "@/components/SiteChrome";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getSiteConfig } from "@/lib/content";
import { absoluteSiteUrl, withBasePath } from "@/lib/base-path";
import "./globals.css";

const instrumentSans = localFont({
  src: [
    {
      path: "../public/fonts/InstrumentSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-instrument-sans",
  fallback: ["Arial", "Helvetica"],
  adjustFontFallback: "Arial",
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  const origin = site.url || "https://portfolio.example.com";
  const socialImage = absoluteSiteUrl(origin, site.socialImage);

  return {
    metadataBase: new URL(origin),
    title: {
      default: site.name,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    keywords: site.keywords,
    alternates: { canonical: origin },
    icons: {
      icon: [{ url: withBasePath(site.favicon), type: "image/png", sizes: "64x64" }],
      apple: [{ url: withBasePath(site.appleTouchIcon), type: "image/png", sizes: "180x180" }],
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: site.name,
      description: site.description,
      type: "website",
      url: origin,
      locale: site.locale,
      siteName: site.name,
      images: [{ url: socialImage, width: 1200, height: 630, alt: site.socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getSiteConfig();
  const customFontEnabled = process.env.NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT === "true";
  const htmlClassName = [
    instrumentSans.variable,
    customFontEnabled ? "custom-font" : "",
  ].filter(Boolean).join(" ");

  return (
    <html lang={site.language} className={htmlClassName}>
      <body>
        <SiteChrome
          name={site.name}
          aboutLabel={site.aboutLabel}
          closeLabel={site.closeLabel}
        />
        <ScrollReveal />
        {children}
        <div className="bottom-rail" aria-hidden="true" />
      </body>
    </html>
  );
}
