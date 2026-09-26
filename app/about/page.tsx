import { getAboutHtml, getSiteConfig } from "@/lib/content";
import { absoluteSiteUrl } from "@/lib/base-path";

export function generateMetadata() {
  const site = getSiteConfig();
  const description = `About and contact information for ${site.name}.`;
  const canonicalUrl = absoluteSiteUrl(site.url, "/about");
  const socialImageUrl = absoluteSiteUrl(site.url, site.socialImage);
  return {
    title: site.aboutLabel,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${site.aboutLabel} — ${site.name}`,
      description,
      type: "website" as const,
      url: canonicalUrl,
      images: [{ url: socialImageUrl, width: 1200, height: 630, alt: site.socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${site.aboutLabel} — ${site.name}`,
      description,
      images: [socialImageUrl],
    },
  };
}

export default function AboutPage() {
  const site = getSiteConfig();

  return (
    <main className="about-layout">
      <h1 className="visually-hidden">{site.aboutLabel}</h1>
      <article
        className="about-copy"
        data-reveal
        dangerouslySetInnerHTML={{ __html: getAboutHtml() }}
      />
    </main>
  );
}
