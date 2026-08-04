import { getProjects, getSiteConfig } from "@/lib/content";
import { TransitionLink } from "@/components/TransitionLink";

export function generateMetadata() {
  const site = getSiteConfig();
  return { title: { absolute: site.name }, description: site.description };
}

export default function Home() {
  const projects = getProjects();
  const site = getSiteConfig();

  return (
    <main className="home-grid" aria-label={site.projectsLabel}>
      {projects.map((project) => (
        <TransitionLink
          className="home-project"
          href={`/projects/${project.slug}`}
          key={project.slug}
          ariaLabel={`View ${project.title}`}
        >
          {project.thumbnail.src ? (
            <img
              src={project.thumbnail.src}
              alt={project.thumbnail.alt}
              style={{
                objectPosition: `${project.thumbnail.focalX}% ${project.thumbnail.focalY}%`,
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
        </TransitionLink>
      ))}
    </main>
  );
}
