import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectExperience } from "@/components/ProjectExperience";
import { getCuratedProjects, getProject, getProjects, getSiteConfig } from "@/lib/content";
import { absoluteSiteUrl } from "@/lib/base-path";

const socialImageSize = { width: 1200, height: 630 };

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const site = getSiteConfig();
  const socialImage = project.socialImage ?? site.socialImage;
  const socialImageAlt = project.socialImage
    ? `${project.title} — ${site.name} portfolio case study`
    : site.socialImageAlt;
  const canonicalUrl = absoluteSiteUrl(site.url, `/projects/${project.slug}`);
  const socialImageUrl = absoluteSiteUrl(site.url, socialImage);

  return {
    title: project.title,
    description: project.seoDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: project.title,
      description: project.seoDescription,
      type: "article",
      url: canonicalUrl,
      images: [{ url: socialImageUrl, ...socialImageSize, alt: socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.seoDescription,
      images: [{ url: socialImageUrl, ...socialImageSize, alt: socialImageAlt }],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const projects = getCuratedProjects();
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previous = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const next = projectIndex >= 0 && projectIndex < projects.length - 1
    ? projects[projectIndex + 1]
    : null;

  return (
    <ProjectExperience
      project={project}
      previousProject={previous ? { slug: previous.slug, title: previous.title } : null}
      nextProject={next ? { slug: next.slug, title: next.title } : null}
    />
  );
}
