"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ImageMedia, Project, ProjectMedia, VideoMedia, YouTubeMedia } from "@/lib/content";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

type ViewTransitionStyle = CSSProperties & { viewTransitionName?: string };

function ratioStyle(ratio: string): CSSProperties {
  return { aspectRatio: ratio };
}

function ImageVisual({ media, className = "" }: { media: ImageMedia; className?: string }) {
  if (media.src) {
    return <img className={className} src={media.src} alt={media.alt} />;
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
            <img src={media.poster} alt="" aria-hidden="true" />
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
          <img src={media.poster} alt="" aria-hidden="true" />
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
}: {
  media: ProjectMedia;
  onOpenImage: (media: ImageMedia) => void;
  transitionName?: string;
  canOpenDetail: boolean;
}) {
  if (media.kind === "video") return <HostedVideo media={media} />;

  if (media.kind === "youtube") return <YouTubeVideo media={media} />;

  if (!canOpenDetail) {
    return (
      <div className="media-frame" style={ratioStyle(media.ratio)}>
        <ImageVisual media={media} />
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
      <ImageVisual media={media} />
    </button>
  );
}

export function ProjectExperience({ project }: { project: Project }) {
  const staticImages = useMemo(
    () => project.media.filter((media): media is ImageMedia => media.kind === "image"),
    [project.media],
  );
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [transitionId, setTransitionId] = useState<string | null>(null);
  const [supportsDetail, setSupportsDetail] = useState(false);
  const detailScroller = useRef<HTMLDivElement>(null);

  const detailImage = detailIndex === null ? null : staticImages[detailIndex];

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

    return startViewTransition.call(document, update).finished;
  }, []);

  const openDetail = useCallback((media: ImageMedia) => {
    if (!supportsDetail) return;
    const index = staticImages.findIndex((image) => image.id === media.id);
    const name = `project-image-${media.id}`;
    flushSync(() => setTransitionId(name));
    runTransition(() => flushSync(() => setDetailIndex(index))).finally(() => setTransitionId(null));
  }, [runTransition, staticImages, supportsDetail]);

  const closeDetail = useCallback(() => {
    if (!detailImage) return;
    const name = `project-image-${detailImage.id}`;
    flushSync(() => setTransitionId(name));
    runTransition(() => flushSync(() => setDetailIndex(null))).finally(() => setTransitionId(null));
  }, [detailImage, runTransition]);

  useEffect(() => {
    if (detailIndex === null) return;
    detailScroller.current?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetail();
      } else if (event.key === "ArrowLeft" && detailIndex > 0) {
        event.preventDefault();
        setDetailIndex(detailIndex - 1);
        detailScroller.current?.scrollTo({ top: 0 });
      } else if (event.key === "ArrowRight" && detailIndex < staticImages.length - 1) {
        event.preventDefault();
        setDetailIndex(detailIndex + 1);
        detailScroller.current?.scrollTo({ top: 0 });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDetail, detailIndex, staticImages.length]);

  return (
    <main className="project-layout">
      <div className="project-summary-column">
        <div
          className="project-summary"
          dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
        />
      </div>

      <section className="project-gallery" aria-label={`${project.title} media`}>
        {project.media.map((media) => (
          <figure className="media-item" key={media.id}>
            <GalleryMedia
              media={media}
              onOpenImage={openDetail}
              canOpenDetail={supportsDetail}
              transitionName={transitionId === `project-image-${media.id}` ? transitionId : undefined}
            />
            {media.caption && <figcaption className="media-caption">{media.caption}</figcaption>}
          </figure>
        ))}
      </section>

      {detailImage ? (
        <div className="detail-layer" ref={detailScroller} role="dialog" aria-modal="true" aria-label="Image detail" tabIndex={-1}>
          <button className="detail-close" type="button" onClick={closeDetail} aria-label="Close image detail">
            <div
              className="detail-media"
              key={detailImage.id}
              style={{ viewTransitionName: transitionId ?? undefined } as ViewTransitionStyle}
            >
              <ImageVisual media={detailImage} />
            </div>
          </button>
        </div>
      ) : null}
    </main>
  );
}
