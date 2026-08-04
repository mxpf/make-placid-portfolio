import { getAboutHtml } from "@/lib/content";

export const metadata = {
  title: "About & contact",
};

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
