import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { getSiteConfig } from "@/lib/content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  const origin = site.url || "https://portfolio.example.com";
  const socialImage = new URL(site.socialImage, origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: site.name,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    keywords: site.keywords,
    alternates: { canonical: "/" },
    icons: {
      icon: [{ url: site.favicon, type: "image/png", sizes: "64x64" }],
      apple: [{ url: site.appleTouchIcon, type: "image/png", sizes: "180x180" }],
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

  return (
    <html lang={site.language} className={customFontEnabled ? "custom-font" : undefined}>
      <body>
        <SiteChrome
          name={site.name}
          aboutLabel={site.aboutLabel}
          closeLabel={site.closeLabel}
        />
        {children}
        <div className="bottom-rail" aria-hidden="true" />
      </body>
    </html>
  );
}
