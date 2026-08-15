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
  return (
    <main className="about-layout">
      <article
        className="about-copy"
        dangerouslySetInnerHTML={{ __html: getAboutHtml() }}
      />
    </main>
  );
}
