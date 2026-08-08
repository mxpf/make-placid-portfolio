"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ImageGridItem, ImageMedia, Project, ProjectMedia, VideoMedia, YouTubeMedia } from "@/lib/content";
import { columnImageSizes, detailImageSizes, ResponsiveImage } from "@/components/ResponsiveImage";
import { TransitionLink } from "@/components/TransitionLink";

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
  sizes = columnImageSizes,
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

function HostedVideo({ media }: { media: VideoMedia }) {
  const [playing, setPlaying] = useState(false);
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

  const toggleAutoplayVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, []);

  if (media.autoplay) {
    return (
      <div className="media-frame autoplay-video" style={ratioStyle(media.ratio)}>
        <video
          ref={videoRef}
          src={media.src}
          poster={media.poster === "placeholder" ? undefined : media.poster}
          autoPlay={autoplayAllowed}
          muted
          loop
          playsInline
          aria-label={media.title}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button
          type="button"
          className="video-autoplay-toggle"
          aria-label={`${playing ? "Pause" : "Play"} ${media.title}`}
          onClick={toggleAutoplayVideo}
        >
          <span className={playing ? "pause-icon" : "play-icon"} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="media-frame" style={ratioStyle(media.ratio)}>
      {!playing && (
        <button
          type="button"
          className="video-poster"
          aria-label={`Play ${media.title}`}
          onClick={() => setPlaying(true)}
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
        <video src={media.src} controls autoPlay playsInline aria-label={media.title} />
      )}
    </div>
  );
}

function ImageGrid({ media }: { media: Extract<ProjectMedia, { kind: "image-grid" }> }) {
  return (
    <div
      className="media-frame image-grid"
      style={{
        ...ratioStyle(media.ratio),
        gridTemplateColumns: `repeat(${media.images.length}, minmax(0, 1fr))`,
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
        </span>
      ))}
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
}: {
  media: ProjectMedia;
  onOpenImage: (media: ImageMedia) => void;
  transitionName?: string;
  canOpenDetail: boolean;
  priority: boolean;
}) {
  if (media.kind === "video") return <HostedVideo media={media} />;

  if (media.kind === "youtube") return <YouTubeVideo media={media} />;

  if (media.kind === "image-grid") return <ImageGrid media={media} />;

  if (!canOpenDetail || media.detail === false) {
    return (
      <div className="media-frame" style={ratioStyle(media.ratio)}>
        <ImageVisual media={media} priority={priority} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="gallery-image-button"
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

function MediaCaption({ media }: { media: ProjectMedia }) {
  if (!media.captionHtml) return null;

  return (
    <figcaption
      className="media-caption"
      dangerouslySetInnerHTML={{ __html: media.captionHtml }}
    />
  );
}

function splitDescriptionHtml(html: string) {
  const match = html.match(/^(\s*<h1[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>)([\s\S]*)$/);
  return match
    ? { leadHtml: match[1], bodyHtml: match[2] }
    : { leadHtml: html, bodyHtml: "" };
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
    () => project.media.filter((media): media is ImageMedia => media.kind === "image"),
    [project.media],
  );
  const description = useMemo(
    () => splitDescriptionHtml(project.descriptionHtml),
    [project.descriptionHtml],
  );
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [transitionId, setTransitionId] = useState<string | null>(null);
  const [supportsDetail, setSupportsDetail] = useState(false);
  const detailScroller = useRef<HTMLDivElement>(null);
  const detailCloseButton = useRef<HTMLButtonElement>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);

  const detailImage = detailIndex === null ? null : staticImages[detailIndex];
  const [leadMedia, ...remainingMedia] = project.media;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setSupportsDetail(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

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
    if (!supportsDetail) return;
    const index = staticImages.findIndex((image) => image.id === media.id);
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

  return (
    <main className={`project-layout${project.colorMedia ? " color-media" : ""}`}>
      <div className="project-summary-column">
        <div className="project-summary">
          <div
            className="project-summary-lead"
            dangerouslySetInnerHTML={{ __html: description.leadHtml }}
          />
          {description.bodyHtml ? (
            <div
              className="project-summary-body"
              dangerouslySetInnerHTML={{ __html: description.bodyHtml }}
            />
          ) : null}
        </div>
      </div>

      <figure className="media-item project-lead-media">
        <GalleryMedia
          media={leadMedia}
          onOpenImage={openDetail}
          canOpenDetail={supportsDetail}
          priority
          transitionName={transitionId === `project-image-${leadMedia.id}` ? transitionId : undefined}
        />
        <MediaCaption media={leadMedia} />
      </figure>

      <section className="project-gallery" aria-label={`${project.title} media`}>
        {remainingMedia.map((media) => (
          <figure className="media-item" key={media.id}>
            <GalleryMedia
              media={media}
              onOpenImage={openDetail}
              canOpenDetail={supportsDetail}
              priority={false}
              transitionName={transitionId === `project-image-${media.id}` ? transitionId : undefined}
            />
            <MediaCaption media={media} />
          </figure>
        ))}
      </section>

      <nav className="project-navigation" aria-label="More projects">
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
