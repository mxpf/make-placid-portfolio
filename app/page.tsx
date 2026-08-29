import { getCuratedProjects, getSiteConfig } from "@/lib/content";
import { TransitionLink } from "@/components/TransitionLink";
import { columnImageSizes, ResponsiveImage } from "@/components/ResponsiveImage";

export function generateMetadata() {
  const site = getSiteConfig();
  return { title: { absolute: site.name }, description: site.description };
}
export default function Home() {
  const projects = getCuratedProjects();
  const site = getSiteConfig();
  const hasIntro = Boolean(site.homepageTitle || site.homepageIntro);

  return (
    <main className="home-grid" aria-label={site.projectsLabel}>
      {hasIntro ? (
        <section className="home-intro" aria-labelledby="home-intro-title" data-reveal>
          <div className="home-intro-copy">
            <h1 id="home-intro-title">{site.homepageTitle ?? site.name}</h1>
            {site.homepageIntro ? (
              <p dangerouslySetInnerHTML={{ __html: site.homepageIntroHtml }} />
            ) : null}
          </div>
        </section>
      ) : (
        <h1 className="visually-hidden">{site.projectsLabel}</h1>
      )}

      {hasIntro ? <h2 className="visually-hidden">{site.projectsLabel}</h2> : null}

      <div className="home-project-list">
        {projects.map((project, index) => (
          <TransitionLink
            className={[
              "home-project",
              index === 0 ? "home-project--lead" : "",
              project.homepageWide ? "home-project--wide" : "",
              project.colorMedia ? "color-media" : "",
              project.thumbnail.hoverSrc ? "home-project--has-rollover" : "",
            ].filter(Boolean).join(" ")}
            href={`/projects/${project.slug}`}
            key={project.slug}
            ariaLabel={`View ${project.title}`}
            dataReveal={index !== 0}
          >
            <span className="home-project-media">
              {project.thumbnail.src ? (
                <>
                  <ResponsiveImage
                    src={project.thumbnail.src}
                    alt={project.thumbnail.alt}
                    sizes={project.homepageWide ? "calc(100vw - 48px)" : columnImageSizes}
                    className="home-project-image home-project-image--base"
                    priority={index < 2}
                    style={{
                      objectPosition: `${project.thumbnail.focalX}% ${project.thumbnail.focalY}%`,
                      objectFit: project.thumbnail.fit,
                      scale: project.thumbnail.scale,
                      transformOrigin: `${project.thumbnail.focalX}% ${project.thumbnail.focalY}%`,
                    }}
                  />
                  {project.thumbnail.hoverSrc ? (
                    <ResponsiveImage
                      src={project.thumbnail.hoverSrc}
                      alt=""
                      sizes={project.homepageWide ? "calc(100vw - 48px)" : columnImageSizes}
                      className="home-project-image home-project-image--rollover"
                      ariaHidden
                      style={{
                        objectPosition: `${project.thumbnail.focalX}% ${project.thumbnail.focalY}%`,
                        objectFit: project.thumbnail.fit,
                        scale: project.thumbnail.scale,
                        transformOrigin: `${project.thumbnail.focalX}% ${project.thumbnail.focalY}%`,
                      }}
                    />
                  ) : null}
                </>
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
              <span className="home-project-label">
                <span className="home-project-name">{project.homepageLabel ?? project.title}</span>
                {project.homepageSubtitle ? (
                  <span className="home-project-subtitle">{project.homepageSubtitle}</span>
                ) : null}
              </span>
            ) : null}
          </TransitionLink>
        ))}
      </div>
    </main>
  );
}
