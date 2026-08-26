import { getAboutHtml, getSiteConfig } from "@/lib/content";
import { absoluteSiteUrl } from "@/lib/base-path";

export function generateMetadata() {
  const site = getSiteConfig();
  return {
    title: site.aboutLabel,
    description: `About and contact information for ${site.name}.`,
    alternates: { canonical: absoluteSiteUrl(site.url, "/about") },
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
