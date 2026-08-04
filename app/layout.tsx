import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteChrome } from "@/components/SiteChrome";
import { getSiteConfig } from "@/lib/content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = new URL(site.socialImage, origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: site.name,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    openGraph: {
      title: site.name,
      description: site.description,
      type: "website",
      images: [{ url: socialImage, width: 1743, height: 909, alt: `${site.name} portfolio` }],
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

  return (
    <html lang="en">
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
