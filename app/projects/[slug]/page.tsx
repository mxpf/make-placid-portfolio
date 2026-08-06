import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectExperience } from "@/components/ProjectExperience";
import { getProject, getProjects, getSiteConfig } from "@/lib/content";

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
  const socialImage = project.socialImage ?? project.thumbnail.src ?? site.socialImage;

  return {
    title: project.title,
    description: project.seoDescription,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.seoDescription,
      type: "article",
      url: `/projects/${project.slug}`,
      images: [{ url: socialImage, alt: project.thumbnail.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.seoDescription,
      images: [socialImage],
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

  const projects = getProjects();
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previous = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const next = projectIndex < projects.length - 1 ? projects[projectIndex + 1] : null;
  const previousProject = previous ? { slug: previous.slug, title: previous.title } : null;
  const nextProject = next ? { slug: next.slug, title: next.title } : null;

  return (
    <ProjectExperience
      project={project}
      previousProject={previousProject}
      nextProject={nextProject}
    />
  );
}
