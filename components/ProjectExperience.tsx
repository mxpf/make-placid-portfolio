"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import type { Html5Media, ImageGridItem, ImageMedia, MediaRowMedia, Project, ProjectMedia, VideoMedia, YouTubeMedia } from "@/lib/content";
import { columnImageSizes, detailImageSizes, galleryImageSizes, ResponsiveImage } from "@/components/ResponsiveImage";
import { TransitionLink } from "@/components/TransitionLink";
import { withBasePath } from "@/lib/base-path";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

type ViewTransitionStyle = CSSProperties & { viewTransitionName?: string };

function ratioStyle(ratio: string): CSSProperties {
  return { aspectRatio: ratio };
}
function ImageVisual({
  media,
  className = "",
  sizes = galleryImageSizes,
  priority = false,
  crop = true,
}: {
  media: ImageMedia;
  className?: string;
  sizes?: string;
  priority?: boolean;
  crop?: boolean;
}) {
  if (media.src) {
    const position = media.position ?? "50% 50%";

    return (
      <ResponsiveImage
        className={className}
        src={media.src}
        alt={media.alt}
        sizes={sizes}
        priority={priority}
        style={crop ? {
          objectFit: media.fit ?? "cover",
          objectPosition: position,
          scale: media.scale ?? 1,
          transformOrigin: position,
        } : undefined}
      />
    );
  }

  return (
    <span
      className={`placeholder ${className}`}
      data-tone={media.tone ?? 1}
      role="img"
      aria-label={media.alt}
      style={ratioStyle(media.ratio)}
    />
  );
}

function HostedVideo({
  media,
  onIntentionalPlay,
}: {
  media: VideoMedia;
  onIntentionalPlay?: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(media.autoplay === true);
  const [autoplayAllowed, setAutoplayAllowed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!media.autoplay) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      const allowed = !query.matches;
      setAutoplayAllowed(allowed);
      if (!allowed) videoRef.current?.pause();
    };

    syncPreference();
    query.addEventListener("change", syncPreference);
    return () => query.removeEventListener("change", syncPreference);
  }, [media.autoplay]);

  useEffect(() => {
    if (!media.autoplay || !autoplayAllowed) return;
    void videoRef.current?.play().catch(() => setPlaying(false));
  }, [autoplayAllowed, media.autoplay]);

  const toggleVideoPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      onIntentionalPlay?.();
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [onIntentionalPlay]);

  const handleVideoSurfaceClick = useCallback(() => {
    if (playing) toggleVideoPlayback();
  }, [playing, toggleVideoPlayback]);

  const toggleMuted = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
  }, []);

  if (media.autoplay) {
    return (
      <div
        className={`media-frame autoplay-video${playing ? " is-playing" : ""}`}
        style={ratioStyle(media.ratio)}
        onClick={handleVideoSurfaceClick}
      >
        <video
          ref={videoRef}
          src={withBasePath(media.src)}
          poster={media.poster === "placeholder" ? undefined : media.poster}
          autoPlay={autoplayAllowed}
          muted={muted}
          loop
          playsInline
          disablePictureInPicture
          aria-label={media.title}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {media.controls === true ? (
          <div className="video-control-group">
            <button
              type="button"
              className="video-autoplay-toggle"
              aria-label={`${playing ? "Pause" : "Play"} ${media.title}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleVideoPlayback();
              }}
            >
              <span className={playing ? "pause-icon" : "play-icon"} aria-hidden="true" />
            </button>
            {media.audioControls === true ? (
              <button
                type="button"
                className="video-autoplay-toggle"
                aria-label={`${muted ? "Unmute" : "Mute"} ${media.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleMuted();
                }}
              >
                <span className={muted ? "mute-icon" : "sound-icon"} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`media-frame${playing ? " is-playing" : ""}`}
      style={ratioStyle(media.ratio)}
      onClick={handleVideoSurfaceClick}
    >
      {!playing && (
        <button
          type="button"
          className="video-poster"
          aria-label={`Play ${media.title}`}
          onClick={() => {
            onIntentionalPlay?.();
            setPlaying(true);
          }}
        >
          {media.poster !== "placeholder" && (
            <ResponsiveImage
              src={media.poster}
              alt=""
              ariaHidden
              sizes={columnImageSizes}
            />
          )}
          <span className="play-triangle" aria-hidden="true" />
        </button>
      )}
      {playing && (
        <>
          <video
            ref={videoRef}
            src={withBasePath(media.src)}
            controls={media.controls === undefined}
            autoPlay
            playsInline
            disablePictureInPicture
            muted={muted}
            aria-label={media.title}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
          />
          {media.controls === true ? (
            <div className="video-control-group">
              <button
                type="button"
                className="video-autoplay-toggle"
                aria-label={`${playing ? "Pause" : "Play"} ${media.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleVideoPlayback();
                }}
              >
                <span className={playing ? "pause-icon" : "play-icon"} aria-hidden="true" />
              </button>
              {media.audioControls === true ? (
                <button
                  type="button"
                  className="video-autoplay-toggle"
                  aria-label={`${muted ? "Unmute" : "Mute"} ${media.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleMuted();
                  }}
                >
                  <span className={muted ? "mute-icon" : "sound-icon"} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function ImageGrid({ media }: { media: Extract<ProjectMedia, { kind: "image-grid" }> }) {
  return (
    <div
      className={`media-frame image-grid${media.border ? " media-frame--bordered" : ""}`}
      style={{
        ...ratioStyle(media.ratio),
        background: media.background,
        gap: media.gap,
        gridTemplateColumns: `repeat(${media.columns ?? media.images.length}, minmax(0, 1fr))`,
      }}
    >
      {media.images.map((image, index) => (
        <span className="image-grid-cell" key={`${media.id}-${index}`}>
          <ImageVisual
            media={{
              kind: "image",
              id: `${media.id}-${index}`,
              ratio: "1 / 1",
              ...image,
            } satisfies ImageMedia & ImageGridItem}
          />
          {image.label ? <span className="image-grid-label">{image.label}</span> : null}
        </span>
      ))}
    </div>
  );
}

function ImageRow({
  media,
  onOpenImage,
  canOpenDetail,
}: {
  media: Extract<ProjectMedia, { kind: "image-row" }>;
  onOpenImage: (media: ImageMedia) => void;
  canOpenDetail: boolean;
}) {
  const gap = media.gap ?? "0px";

  return (
    <div
      className={`media-frame image-row${media.images.length > 2 ? " image-row--optical-tight" : ""}`}
      style={{
        "--image-row-gap": gap,
      } as CSSProperties}
    >
      <div className="image-row-track">
        {media.images.map((image, index) => {
          const imageMedia = {
            kind: "image",
            id: `${media.id}-${index}`,
            ratio: image.width && image.height ? `${image.width} / ${image.height}` : "1 / 1",
            ...image,
          } satisfies ImageMedia & ImageGridItem;
          const canOpen = canOpenDetail && image.detail === true;

          return (
            <span
              className="image-row-cell"
              key={imageMedia.id}
              style={image.width && image.height ? { "--image-row-ratio": image.width / image.height } as CSSProperties : undefined}
            >
              {canOpen ? (
                <button
                  type="button"
                  className="image-row-detail-button"
                  onClick={() => onOpenImage(imageMedia)}
                  aria-label={`Open detail view: ${image.alt}`}
                >
                  <ImageVisual media={imageMedia} crop={false} />
                </button>
              ) : (
                <ImageVisual media={imageMedia} crop={false} />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MediaRow({ media }: { media: MediaRowMedia }) {
  const gap = media.gap ?? "0px";

  return (
    <div
      className={`media-frame image-row media-row${media.items.length > 2 ? " image-row--optical-tight" : ""}`}
      style={{
        "--image-row-gap": gap,
      } as CSSProperties}
    >
      <div className="image-row-track">
        {media.items.map((item, index) => (
          <span
            className="image-row-cell"
            key={`${media.id}-${index}`}
            style={item.width && item.height ? { "--image-row-ratio": item.width / item.height } as CSSProperties : undefined}
          >
            {item.kind === "video" ? (
              <MediaRowVideo media={item} />
            ) : item.kind === "youtube" ? (
              <YouTubeVideo media={item} />
            ) : (() => {
              const image: ImageGridItem = item;
              return (
                <ImageVisual
                  media={{
                    kind: "image",
                    id: `${media.id}-${index}`,
                    ratio: "1 / 1",
                    ...image,
                  } satisfies ImageMedia & ImageGridItem}
                  crop={false}
                />
              );
            })()}
          </span>
        ))}
      </div>
    </div>
  );
}

function MediaRowVideo({
  media,
}: {
  media: Extract<MediaRowMedia["items"][number], { kind: "video" }>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldAutoplay = media.autoplay ?? true;
  const [autoplayAllowed, setAutoplayAllowed] = useState(false);

  useEffect(() => {
    if (!shouldAutoplay) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      const allowed = !query.matches;
      setAutoplayAllowed(allowed);
      if (!allowed) videoRef.current?.pause();
    };

    syncPreference();
    query.addEventListener("change", syncPreference);
    return () => query.removeEventListener("change", syncPreference);
  }, [shouldAutoplay]);

  useEffect(() => {
    if (!shouldAutoplay || !autoplayAllowed) return;
    void videoRef.current?.play().catch(() => undefined);
  }, [autoplayAllowed, shouldAutoplay]);

  return (
    <video
      ref={videoRef}
      src={withBasePath(media.src)}
      poster={media.poster === "placeholder" ? undefined : withBasePath(media.poster)}
      autoPlay={shouldAutoplay && autoplayAllowed}
      controls={!shouldAutoplay && media.controls !== false}
      muted={shouldAutoplay}
      loop={shouldAutoplay}
      playsInline
      disablePictureInPicture
      aria-label={media.title}
    />
  );
}

function Html5Banner({ media }: { media: Html5Media }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const resize = () => setScale(stage.clientWidth / media.width);
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [media.width]);

  return (
    <div
      className="html5-banner-stage media-frame--bordered"
      ref={stageRef}
      style={{
        aspectRatio: `${media.width} / ${media.height}`,
        maxWidth: media.width,
      }}
    >
      <iframe
        className="html5-banner-frame"
        src={withBasePath(media.src)}
        width={media.width}
        height={media.height}
        title={media.title}
        loading="lazy"
        sandbox="allow-scripts"
        tabIndex={-1}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

function YouTubeVideo({ media }: { media: YouTubeMedia }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="media-frame" style={ratioStyle(media.ratio)}>
      {!playing && media.poster ? (
        <button
          type="button"
          className="video-poster"
          aria-label={`Play ${media.title}`}
          onClick={() => setPlaying(true)}
        >
          <ResponsiveImage
            src={media.poster}
            alt=""
            ariaHidden
            sizes={columnImageSizes}
          />
          <span className="play-triangle" aria-hidden="true" />
        </button>
      ) : (
        <iframe
          className="youtube-frame"
          src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=1&playsinline=1&rel=0`}
          title={media.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}

function GalleryMedia({
  media,
  onOpenImage,
  transitionName,
  canOpenDetail,
  priority,
  onIntentionalPlay,
}: {
  media: ProjectMedia;
  onOpenImage: (media: ImageMedia) => void;
  transitionName?: string;
  canOpenDetail: boolean;
  priority: boolean;
  onIntentionalPlay?: () => void;
}) {
  if (media.kind === "video") return <HostedVideo media={media} onIntentionalPlay={onIntentionalPlay} />;

  if (media.kind === "youtube") return <YouTubeVideo media={media} />;

  if (media.kind === "html5") return <Html5Banner media={media} />;

  if (media.kind === "image-grid") return <ImageGrid media={media} />;

  if (media.kind === "image-row") {
    return <ImageRow media={media} onOpenImage={onOpenImage} canOpenDetail={canOpenDetail} />;
  }

  if (media.kind === "media-row") return <MediaRow media={media} />;

  if (!canOpenDetail || media.detail !== true) {
    return (
      <div
        className={`media-frame${media.border ? " media-frame--bordered" : ""}`}
        style={ratioStyle(media.ratio)}
      >
        <ImageVisual media={media} priority={priority} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`gallery-image-button${media.border ? " media-frame--bordered" : ""}`}
      onClick={() => onOpenImage(media)}
      aria-label={`Open detail view: ${media.alt}`}
      style={{
        ...ratioStyle(media.ratio),
        viewTransitionName: transitionName,
      } as ViewTransitionStyle}
    >
      <ImageVisual media={media} priority={priority} />
    </button>
  );
}

type ProjectNavigationItem = Pick<Project, "slug" | "title">;

function MediaCaption({
  media,
  position = "below",
}: {
  media: ProjectMedia;
  position?: "above" | "below";
}) {
  if (!media.captionHtml) return null;

  return (
    <figcaption
      className={`media-caption media-caption--${position}`}
      dangerouslySetInnerHTML={{ __html: media.captionHtml }}
    />
  );
}

function ProjectMediaFigure({
  media,
  children,
}: {
  media: ProjectMedia;
  children: ReactNode;
}) {
  const captionPosition = media.captionPosition ?? "below";

  return (
    <>
      {captionPosition === "above" ? <MediaCaption media={media} position="above" /> : null}
      {children}
      {captionPosition !== "above" ? <MediaCaption media={media} position="below" /> : null}
    </>
  );
}

function splitDescriptionHtml(html: string) {
  const match = html.match(/^(\s*<h1[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>)([\s\S]*)$/);
  return match
    ? { leadHtml: match[1], bodyHtml: match[2] }
    : { leadHtml: html, bodyHtml: "" };
}

function ProjectEvidence({ project }: { project: Project }) {
  if (!project.evidence) return null;

  const items = [
    ["Role", project.evidence.role],
    ["Mandate", project.evidence.mandate],
    ["Scale", project.evidence.scale],
    ["Outcome", project.evidence.outcome],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  if (items.length === 0) return null;

  return (
    <dl className="project-evidence" aria-label={`${project.title} project evidence`}>
      {items.map(([label, value]) => (
        <div className="project-evidence-item" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectExperience({
  project,
  previousProject,
  nextProject,
}: {
  project: Project;
  previousProject: ProjectNavigationItem | null;
  nextProject: ProjectNavigationItem | null;
}) {
  const staticImages = useMemo(
    () => project.media.flatMap((media) => {
      if (media.kind === "image" && media.detail === true) return [media];
      if (media.kind !== "image-row") return [];

      return media.images.flatMap((image, index) => image.detail === true ? [{
        kind: "image" as const,
        id: `${media.id}-${index}`,
        ratio: image.width && image.height ? `${image.width} / ${image.height}` : "1 / 1",
        ...image,
      }] : []);
    }),
    [project.media],
  );
  const description = useMemo(
    () => splitDescriptionHtml(project.descriptionHtml),
    [project.descriptionHtml],
  );
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [transitionId, setTransitionId] = useState<string | null>(null);
  const [supportsDetail, setSupportsDetail] = useState(false);
  const [forceFullOpacity, setForceFullOpacity] = useState(false);
  const projectLayout = useRef<HTMLElement>(null);
  const projectSummary = useRef<HTMLDivElement>(null);
  const detailScroller = useRef<HTMLDivElement>(null);
  const detailCloseButton = useRef<HTMLButtonElement>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const detailImage = detailIndex === null ? null : staticImages[detailIndex];
  const [leadMedia, ...remainingMedia] = project.media;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setSupportsDetail(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const layout = projectLayout.current;
    const summary = projectSummary.current;
    if (!layout || !summary) return;

    const updateMediaOffset = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const headerHeight = Number.parseFloat(rootStyles.getPropertyValue("--header-height")) || 72;
      const summaryRect = summary.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      // The summary is bottom-locked on desktop. Align the complete lead-media
      // block with its top edge so an above-image caption participates in the
      // same row instead of floating above the project heading.
      const offset = Math.max(
        summaryRect.top - layoutRect.top - headerHeight - window.scrollY,
        0,
      );
      layout.style.setProperty("--project-media-offset", `${Math.round(offset)}px`);
      layout.classList.add("is-media-aligned");
    };

    updateMediaOffset();

    const observer = new ResizeObserver(updateMediaOffset);
    observer.observe(summary);
    window.addEventListener("resize", updateMediaOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMediaOffset);
      layout.style.removeProperty("--project-media-offset");
      layout.classList.remove("is-media-aligned");
    };
  }, [project.slug]);

  useEffect(() => {
    const layout = projectLayout.current;
    if (!layout) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    let frame = 0;

    const updateOpacity = () => {
      frame = 0;
      if (forceFullOpacity || reduceMotion.matches || mobileViewport.matches) {
        layout.style.setProperty("--project-content-opacity", "1");
        return;
      }

      const rootStyles = getComputedStyle(document.documentElement);
      const start = Number.parseFloat(rootStyles.getPropertyValue("--project-content-opacity-start")) || 0.1;
      const fadeViewport = Number.parseFloat(rootStyles.getPropertyValue("--project-content-fade-viewport")) || 12;
      const distance = Math.max(window.innerHeight * fadeViewport / 100, 1);
      const progress = Math.min(Math.max(window.scrollY / distance, 0), 1);
      const opacity = start + ((1 - start) * progress);
      layout.style.setProperty("--project-content-opacity", opacity.toFixed(3));
    };

    const scheduleOpacityUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateOpacity);
    };

    updateOpacity();
    window.addEventListener("scroll", scheduleOpacityUpdate, { passive: true });
    window.addEventListener("resize", scheduleOpacityUpdate);
    reduceMotion.addEventListener("change", scheduleOpacityUpdate);
    mobileViewport.addEventListener("change", scheduleOpacityUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleOpacityUpdate);
      window.removeEventListener("resize", scheduleOpacityUpdate);
      reduceMotion.removeEventListener("change", scheduleOpacityUpdate);
      mobileViewport.removeEventListener("change", scheduleOpacityUpdate);
      layout.style.removeProperty("--project-content-opacity");
    };
  }, [forceFullOpacity, project.slug]);

  useEffect(() => {
    if (detailIndex === null) {
      document.body.classList.remove("detail-open");
      return;
    }

    document.body.classList.add("detail-open");
    return () => document.body.classList.remove("detail-open");
  }, [detailIndex]);

  const runTransition = useCallback((update: () => void) => {
    const startViewTransition = (document as ViewTransitionDocument).startViewTransition;
    if (!startViewTransition) {
      update();
      return Promise.resolve();
    }

    const transition = startViewTransition.call(document, update);
    void transition.ready.catch(() => undefined);
    return transition.finished;
  }, []);

  const openDetail = useCallback((media: ImageMedia) => {
    if (!supportsDetail || media.detail !== true) return;
    const index = staticImages.findIndex((image) => image.id === media.id);
    if (index === -1) return;
    detailTrigger.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const name = `project-image-${media.id}`;
    flushSync(() => setTransitionId(name));
    void runTransition(() => flushSync(() => setDetailIndex(index)))
      .catch(() => undefined)
      .finally(() => setTransitionId(null));
  }, [runTransition, staticImages, supportsDetail]);

  const closeDetail = useCallback(() => {
    if (!detailImage) return;
    const name = `project-image-${detailImage.id}`;
    flushSync(() => setTransitionId(name));
    void runTransition(() => flushSync(() => setDetailIndex(null)))
      .catch(() => undefined)
      .finally(() => {
        setTransitionId(null);
        detailTrigger.current?.focus({ preventScroll: true });
      });
  }, [detailImage, runTransition]);

  useEffect(() => {
    if (detailIndex === null) return;
    const activeIndex = detailIndex;
    detailCloseButton.current?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetail();
      } else if (event.key === "ArrowLeft" && activeIndex > 0) {
        event.preventDefault();
        setDetailIndex(activeIndex - 1);
        detailScroller.current?.scrollTo({ top: 0 });
      } else if (event.key === "ArrowRight" && activeIndex < staticImages.length - 1) {
        event.preventDefault();
        setDetailIndex(activeIndex + 1);
        detailScroller.current?.scrollTo({ top: 0 });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDetail, detailIndex, staticImages.length]);

  useEffect(() => {
    function onProjectNavigationKeyDown(event: KeyboardEvent) {
      if (detailIndex !== null) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === "ArrowLeft" && previousProject) {
        event.preventDefault();
        router.push(withBasePath(`/projects/${previousProject.slug}`));
      } else if (event.key === "ArrowRight" && nextProject) {
        event.preventDefault();
        router.push(withBasePath(`/projects/${nextProject.slug}`));
      }
    }

    window.addEventListener("keydown", onProjectNavigationKeyDown);
    return () => window.removeEventListener("keydown", onProjectNavigationKeyDown);
  }, [detailIndex, nextProject, previousProject, router]);

  return (
    <main
      ref={projectLayout}
      className={`project-layout${project.colorMedia ? " color-media" : ""}`}
      data-project={project.slug}
    >
      <div className="project-summary-column">
        <div className="project-summary" ref={projectSummary} data-reveal>
          <div
            className="project-summary-lead"
            dangerouslySetInnerHTML={{ __html: description.leadHtml }}
          />
          <ProjectEvidence project={project} />
          {description.bodyHtml ? (
            <div
              className="project-summary-body"
              dangerouslySetInnerHTML={{ __html: description.bodyHtml }}
            />
          ) : null}
        </div>
      </div>

      <div className="project-media-column">
        <figure
          className="media-item project-lead-media"
        >
          <ProjectMediaFigure media={leadMedia}>
            <div className="project-media-visual" data-scroll-opacity>
              <GalleryMedia
                media={leadMedia}
                onOpenImage={openDetail}
                canOpenDetail={supportsDetail}
                priority
                onIntentionalPlay={() => setForceFullOpacity(true)}
                transitionName={transitionId === `project-image-${leadMedia.id}` ? transitionId : undefined}
              />
            </div>
          </ProjectMediaFigure>
        </figure>

        <section className="project-gallery" aria-label={`${project.title} media`}>
          {remainingMedia.map((media) => (
            <figure className="media-item" key={media.id} data-reveal>
              <ProjectMediaFigure media={media}>
                <div className="project-media-visual" data-scroll-opacity>
                  <GalleryMedia
                    media={media}
                    onOpenImage={openDetail}
                    canOpenDetail={supportsDetail}
                    priority={false}
                    onIntentionalPlay={() => setForceFullOpacity(true)}
                    transitionName={transitionId === `project-image-${media.id}` ? transitionId : undefined}
                  />
                </div>
              </ProjectMediaFigure>
            </figure>
          ))}
        </section>

        <nav className="project-navigation" aria-label="More projects" data-reveal>
          {previousProject ? (
            <TransitionLink href={`/projects/${previousProject.slug}`}>
              Previous — {previousProject.title}
            </TransitionLink>
          ) : <span />}
          {nextProject ? (
            <TransitionLink href={`/projects/${nextProject.slug}`}>
              Next — {nextProject.title}
            </TransitionLink>
          ) : <span />}
        </nav>
      </div>

      {detailImage ? (
        <div className="detail-layer" ref={detailScroller} role="dialog" aria-modal="true" aria-label="Image detail" tabIndex={-1}>
          <button
            className="detail-close-control"
            type="button"
            onClick={closeDetail}
            ref={detailCloseButton}
          >
            Close
          </button>
          <button className="detail-close" type="button" onClick={closeDetail} aria-label="Close image detail">
            <div
              className="detail-media"
              key={detailImage.id}
              style={{ viewTransitionName: transitionId ?? undefined } as ViewTransitionStyle}
            >
              <ImageVisual media={detailImage} sizes={detailImageSizes} priority crop={false} />
            </div>
          </button>
        </div>
      ) : null}
    </main>
  );
}
