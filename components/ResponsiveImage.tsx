import type { CSSProperties } from "react";
import imageManifest from "@/public/images/responsive/manifest.json";
import { withBasePath } from "@/lib/base-path";

type ManifestEntry = {
  width: number;
  height: number;
  sources: Array<{ src: string; width: number }>;
};

type ResponsiveImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  ariaHidden?: boolean;
};

const manifest = imageManifest as Record<string, ManifestEntry>;

export const columnImageSizes = "(max-width: 767px) calc(100vw - 48px), calc((100vw - 72px) / 2)";
export const detailImageSizes = "calc(100vw - 48px)";

export function ResponsiveImage({
  src,
  alt,
  sizes,
  className,
  style,
  priority = false,
  ariaHidden = false,
}: ResponsiveImageProps) {
  const entry = manifest[src];
  const srcSet = entry?.sources
    .map((source) => `${withBasePath(source.src)} ${source.width}w`)
    .join(", ");
  const fallbackSrc = withBasePath(entry?.sources.at(-1)?.src ?? src);

  return (
    // A build-time WebP/srcset pipeline replaces Next's runtime image service.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={fallbackSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={entry?.width}
      height={entry?.height}
      alt={alt}
      aria-hidden={ariaHidden || undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={style}
    />
  );
}
