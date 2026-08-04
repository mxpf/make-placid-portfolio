import { getAboutHtml, getSiteConfig } from "@/lib/content";

export function generateMetadata() {
  return { title: getSiteConfig().aboutLabel };
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
