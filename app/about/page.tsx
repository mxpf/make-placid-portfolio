import { getAboutHtml, getSiteConfig } from "@/lib/content";

export function generateMetadata() {
  const site = getSiteConfig();
  return {
    title: site.aboutLabel,
    description: `About and contact information for ${site.name}.`,
    alternates: { canonical: "/about" },
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
