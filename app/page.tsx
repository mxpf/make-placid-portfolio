import { getProjects } from "@/lib/content";
import { TransitionLink } from "@/components/TransitionLink";

export const metadata = {
  title: { absolute: "Max Pfennighaus" },
  description: "Selected work by Max Pfennighaus.",
};

export default function Home() {
  const projects = getProjects();

  return (
    <main className="home-grid" aria-label="Selected projects">
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
