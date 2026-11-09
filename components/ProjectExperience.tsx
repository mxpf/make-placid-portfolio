"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Html5Media, ImageGridItem, ImageMedia, MediaRowMedia, Project, ProjectMedia, VideoMedia, YouTubeMedia } from "@/lib/content";
import { columnImageSizes, detailImageSizes, galleryImageSizes, ResponsiveImage } from "@/components/ResponsiveImage";
import { ImageDetailDialog } from "@/components/ImageDetailDialog";
import { TransitionLink } from "@/components/TransitionLink";
import { useProjectKeyboardNavigation } from "@/components/useProjectKeyboardNavigation";
import { useAutoplayPermission } from "@/components/useAutoplayPermission";
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

function VideoControls({
  title,
  playing,
  muted,
  showAudioControls,
  onTogglePlayback,
  onToggleMuted,
}: {
  title: string;
  playing: boolean;
  muted: boolean;
  showAudioControls: boolean;
  onTogglePlayback: () => void;
  onToggleMuted: () => void;
}) {
  return (
    <div className="video-control-group">
      <button
        type="button"
        className="video-autoplay-toggle"
        aria-label={`${playing ? "Pause" : "Play"} ${title}`}
        onClick={(event) => {
          event.stopPropagation();
          onTogglePlayback();
        }}
      >
        <span className={playing ? "pause-icon" : "play-icon"} aria-hidden="true" />
      </button>
      {showAudioControls ? (
        <button
          type="button"
          className="video-autoplay-toggle"
          aria-label={`${muted ? "Unmute" : "Mute"} ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleMuted();
          }}
        >
          <span className={muted ? "mute-icon" : "sound-icon"} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function HostedVideo({
  media,
  autoplayDefault = false,
  inRow = false,
}: {
  media: VideoMedia;
  autoplayDefault?: boolean;
  inRow?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [playbackIntent, setPlaybackIntent] = useState<"play" | "pause" | null>(null);
  const shouldAutoplay = media.autoplay ?? autoplayDefault;
  const [muted, setMuted] = useState(shouldAutoplay);
  const autoplayAllowed = useAutoplayPermission(shouldAutoplay);
  const videoRef = useRef<HTMLVideoElement>(null);
  const usesNativeControls = !shouldAutoplay && media.controls === undefined;
  const usesCustomControls = media.controls === true;
  const surfaceControlsPlayback = !usesNativeControls && !usesCustomControls;
  const showVideo = shouldAutoplay || inRow || started;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = media.playbackRate ?? 1;
    const shouldPlay = playbackIntent === "play"
      || (playbackIntent === null && shouldAutoplay && autoplayAllowed);
    if (shouldPlay) {
      void video.play().catch(() => setPlaying(false));
    } else if (playbackIntent === "pause" || shouldAutoplay) {
      video.pause();
    }
  }, [autoplayAllowed, media.playbackRate, playbackIntent, shouldAutoplay, showVideo]);

  const toggleVideoPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setPlaybackIntent(video.paused ? "play" : "pause");
  }, []);

  const toggleMuted = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
  }, []);

  return (
    <div
      className={`${inRow ? "row-video " : ""}media-frame${shouldAutoplay ? " autoplay-video" : ""}${playing ? " is-playing" : ""}`}
      style={ratioStyle(media.ratio)}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          src={withBasePath(media.src)}
          poster={media.poster === "placeholder" ? undefined : withBasePath(media.poster)}
          autoPlay={shouldAutoplay && autoplayAllowed}
          controls={usesNativeControls}
          muted={muted}
          loop={shouldAutoplay}
          playsInline
          disablePictureInPicture
          role={surfaceControlsPlayback ? "button" : undefined}
          tabIndex={surfaceControlsPlayback ? 0 : undefined}
          aria-label={surfaceControlsPlayback ? `${playing ? "Pause" : "Play"} ${media.title}` : media.title}
          aria-pressed={surfaceControlsPlayback ? playing : undefined}
          onClick={surfaceControlsPlayback ? toggleVideoPlayback : undefined}
          onKeyDown={surfaceControlsPlayback ? (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            toggleVideoPlayback();
          } : undefined}
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = media.playbackRate ?? 1;
          }}
          onPlay={() => {
            setStarted(true);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaybackIntent("pause");
            setPlaying(false);
          }}
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        />
      ) : null}
      {!shouldAutoplay && !started ? (
        <button
          type="button"
          className="video-poster"
          aria-label={`Play ${media.title}`}
          onClick={() => {
            setStarted(true);
            setPlaybackIntent("play");
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
      ) : null}
      {(shouldAutoplay || started) && usesCustomControls ? (
          <VideoControls
            title={media.title}
            playing={playing}
            muted={muted}
            showAudioControls={media.audioControls === true}
            onTogglePlayback={toggleVideoPlayback}
            onToggleMuted={toggleMuted}
          />
      ) : null}
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [mobileGalleryEnabled, setMobileGalleryEnabled] = useState(false);
  const mobileGalleryLabel = media.mobileGalleryLabel;

  useEffect(() => {
    if (!mobileGalleryLabel) return;
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobileGalleryEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [mobileGalleryLabel]);

  const moveToSlide = useCallback((index: number) => {
    const track = trackRef.current;
    const slides = track?.querySelectorAll<HTMLElement>(":scope > .image-row-cell");
    const first = slides?.[0];
    const target = slides?.[index];
    if (!track || !first || !target) return;

    track.scrollTo({
      left: target.offsetLeft - first.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, []);

  return (
    <div
      className={`media-frame image-row${media.images.length > 2 ? " image-row--optical-tight" : ""}${mobileGalleryLabel ? " mobile-swipe-gallery" : ""}`}
      style={{
        "--image-row-gap": gap,
      } as CSSProperties}
      role={mobileGalleryLabel ? "region" : undefined}
      aria-roledescription={mobileGalleryLabel ? "carousel" : undefined}
      aria-label={mobileGalleryLabel}
    >
      {mobileGalleryLabel ? (
        <div className="mobile-gallery-heading">
          <h3>{mobileGalleryLabel}</h3>
          <span aria-live="polite" aria-atomic="true">{activeSlide + 1} / {media.images.length}</span>
        </div>
      ) : null}
      <div
        className="image-row-track"
        id={mobileGalleryLabel ? `${media.id}-mobile-track` : undefined}
        ref={trackRef}
        tabIndex={mobileGalleryEnabled ? 0 : undefined}
        onScroll={mobileGalleryLabel ? () => {
          const track = trackRef.current;
          const slides = track?.querySelectorAll<HTMLElement>(":scope > .image-row-cell");
          const first = slides?.[0];
          if (!track || !slides?.length || !first) return;
          const distances = Array.from(slides, (slide) => Math.abs(slide.offsetLeft - first.offsetLeft - track.scrollLeft));
          setActiveSlide(distances.indexOf(Math.min(...distances)));
        } : undefined}
        onKeyDown={mobileGalleryLabel ? (event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          event.stopPropagation();
          const next = Math.max(0, Math.min(media.images.length - 1, activeSlide + (event.key === "ArrowRight" ? 1 : -1)));
          setActiveSlide(next);
          moveToSlide(next);
        } : undefined}
      >
        {media.images.map((image, index) => {
          const imageMedia = {
            kind: "image",
            id: `${media.id}-${index}`,
            ratio: image.width && image.height ? `${image.width} / ${image.height}` : "1 / 1",
            ...image,
          } satisfies ImageMedia & ImageGridItem;
          const canOpen = canOpenDetail && image.detail === true;

          return (
            <div
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
            </div>
          );
        })}
      </div>
      {mobileGalleryLabel ? (
        <div className="mobile-gallery-controls">
          <span>Swipe to browse</span>
          <button
            type="button"
            aria-label={`Previous ${mobileGalleryLabel} image`}
            aria-controls={`${media.id}-mobile-track`}
            disabled={activeSlide === 0}
            onClick={() => moveToSlide(activeSlide - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            aria-label={`Next ${mobileGalleryLabel} image`}
            aria-controls={`${media.id}-mobile-track`}
            disabled={activeSlide === media.images.length - 1}
            onClick={() => moveToSlide(activeSlide + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MediaRow({
  media,
  onOpenImage,
  canOpenDetail,
}: {
  media: MediaRowMedia;
  onOpenImage: (media: ImageMedia) => void;
  canOpenDetail: boolean;
}) {
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
          <div
            className="image-row-cell"
            key={`${media.id}-${index}`}
            style={item.width && item.height ? { "--image-row-ratio": item.width / item.height } as CSSProperties : undefined}
          >
            {item.kind === "video" ? (
              <HostedVideo
                media={{
                  ...item,
                  id: `${media.id}-${index}`,
                  ratio: `${item.width} / ${item.height}`,
                }}
                autoplayDefault
                inRow
              />
            ) : item.kind === "youtube" ? (
              <YouTubeVideo media={{
                ...item,
                id: `${media.id}-${index}`,
                ratio: `${item.width} / ${item.height}`,
              }} />
            ) : (() => {
              const image: ImageGridItem = item;
              const imageMedia = {
                kind: "image",
                id: `${media.id}-${index}`,
                ratio: image.width && image.height ? `${image.width} / ${image.height}` : "1 / 1",
                ...image,
              } satisfies ImageMedia & ImageGridItem;
              return canOpenDetail && image.detail === true ? (
                <button
                  type="button"
                  className="image-row-detail-button"
                  onClick={() => onOpenImage(imageMedia)}
                  aria-label={`Open detail view: ${image.alt}`}
                >
                  <ImageVisual media={imageMedia} crop={false} />
                </button>
              ) : <ImageVisual media={imageMedia} crop={false} />;
            })()}
          </div>
        ))}
      </div>
    </div>
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
          src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=${playing ? 1 : 0}&playsinline=1&rel=0`}
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

  if (media.kind === "html5") return <Html5Banner media={media} />;

  if (media.kind === "image-grid") return <ImageGrid media={media} />;

  if (media.kind === "image-row") {
    return <ImageRow media={media} onOpenImage={onOpenImage} canOpenDetail={canOpenDetail} />;
  }

  if (media.kind === "media-row") {
    return <MediaRow media={media} onOpenImage={onOpenImage} canOpenDetail={canOpenDetail} />;
  }

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
      if (media.kind === "image-row") return media.images.flatMap((image, index) => image.detail === true ? [{
        kind: "image" as const,
        id: `${media.id}-${index}`,
        ratio: image.width && image.height ? `${image.width} / ${image.height}` : "1 / 1",
        ...image,
      }] : []);
      if (media.kind === "media-row") return media.items.flatMap((item, index) => item.kind === "image" && item.detail === true ? [{
        id: `${media.id}-${index}`,
        ratio: item.width && item.height ? `${item.width} / ${item.height}` : "1 / 1",
        ...item,
        kind: "image" as const,
      }] : []);
      return [];
    }),
    [project.media],
  );
  const description = useMemo(
    () => splitDescriptionHtml(project.descriptionHtml),
    [project.descriptionHtml],
  );
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [transitionId, setTransitionId] = useState<string | null>(null);
  const projectLayout = useRef<HTMLElement>(null);
  const projectSummary = useRef<HTMLDivElement>(null);
  const detailScroller = useRef<HTMLDivElement>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);

  const detailImage = detailIndex === null ? null : staticImages[detailIndex];
  const [leadMedia, ...remainingMedia] = project.media;
  const hasProjectNavigation = Boolean(previousProject || nextProject);
  useProjectKeyboardNavigation({
    disabled: detailIndex !== null,
    previousProject,
    nextProject,
  });

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
    const summary = projectSummary.current;
    if (!summary) return;

    const updateScrollCue = () => {
      const scrollable = summary.scrollHeight > summary.clientHeight + 1;
      const atEnd = summary.scrollTop + summary.clientHeight >= summary.scrollHeight - 1;
      summary.dataset.scrollable = String(scrollable);
      summary.dataset.scrollEnd = String(!scrollable || atEnd);
    };

    updateScrollCue();
    const observer = new ResizeObserver(updateScrollCue);
    observer.observe(summary);
    summary.addEventListener("scroll", updateScrollCue, { passive: true });

    return () => {
      observer.disconnect();
      summary.removeEventListener("scroll", updateScrollCue);
    };
  }, [project.slug]);

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
    if (media.detail !== true) return;
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
  }, [runTransition, staticImages]);

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
                canOpenDetail
                priority
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
                    canOpenDetail
                    priority={false}
                    transitionName={transitionId === `project-image-${media.id}` ? transitionId : undefined}
                  />
                </div>
              </ProjectMediaFigure>
            </figure>
          ))}
        </section>

        {hasProjectNavigation ? (
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
        ) : null}
      </div>

      {detailImage ? (
        <ImageDetailDialog
          scrollerRef={detailScroller}
          onClose={closeDetail}
          onPrevious={detailIndex !== null && detailIndex > 0 ? () => {
            setDetailIndex(detailIndex - 1);
            detailScroller.current?.scrollTo({ top: 0 });
          } : undefined}
          onNext={detailIndex !== null && detailIndex < staticImages.length - 1 ? () => {
            setDetailIndex(detailIndex + 1);
            detailScroller.current?.scrollTo({ top: 0 });
          } : undefined}
          currentIndex={(detailIndex ?? 0) + 1}
          total={staticImages.length}
        >
          <span
              className="detail-media"
              key={detailImage.id}
              style={{ viewTransitionName: transitionId ?? undefined } as ViewTransitionStyle}
            >
              <ImageVisual media={detailImage} sizes={detailImageSizes} priority crop={false} />
          </span>
        </ImageDetailDialog>
      ) : null}
    </main>
  );
}
