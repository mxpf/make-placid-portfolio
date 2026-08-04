import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Max Pfennighaus",
      template: "%s — Max Pfennighaus",
    },
    description: "Selected design and creative direction by Max Pfennighaus.",
    openGraph: {
      title: "Max Pfennighaus",
      description: "Selected design and creative direction by Max Pfennighaus.",
      type: "website",
      images: [{ url: socialImage, width: 1743, height: 909, alt: "Max Pfennighaus portfolio" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Max Pfennighaus",
      description: "Selected design and creative direction by Max Pfennighaus.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteChrome />
        {children}
        <div className="bottom-rail" aria-hidden="true" />
      </body>
    </html>
  );
}
