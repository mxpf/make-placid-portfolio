import { getProjects, getSiteConfig } from "@/lib/content";
import { TransitionLink } from "@/components/TransitionLink";
import { columnImageSizes, ResponsiveImage } from "@/components/ResponsiveImage";

export function generateMetadata() {
  const site = getSiteConfig();
  return { title: { absolute: site.name }, description: site.description };
}

export default function Home() {
  const projects = getProjects();
  const site = getSiteConfig();

  return (
    <main className="home-grid" aria-label={site.projectsLabel}>
      <h1 className="visually-hidden">{site.projectsLabel}</h1>
      {projects.map((project, index) => (
        <TransitionLink
          className={`home-project${project.colorMedia ? " color-media" : ""}`}
          href={`/projects/${project.slug}`}
          key={project.slug}
          ariaLabel={`View ${project.title}`}
        >
          <span className="home-project-media">
            {project.thumbnail.src ? (
              <ResponsiveImage
                src={project.thumbnail.src}
                alt={project.thumbnail.alt}
                sizes={columnImageSizes}
                priority={index < 2}
                style={{
                  objectPosition: `${project.thumbnail.focalX}% ${project.thumbnail.focalY}%`,
                  objectFit: project.thumbnail.fit,
                  scale: project.thumbnail.scale,
                  transformOrigin: `${project.thumbnail.focalX}% ${project.thumbnail.focalY}%`,
                }}
              />
            ) : (
              <span
                className="placeholder"
                role="img"
                aria-label={project.thumbnail.alt}
                data-tone={project.thumbnail.tone}
              />
            )}
          </span>
          {site.showProjectLabels ? (
            <span className="home-project-label">{project.homepageLabel ?? project.title}</span>
          ) : null}
        </TransitionLink>
      ))}
    </main>
  );
}
