import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export type ImageMedia = {
  kind: "image";
  id: string;
  src?: string;
  ratio: string;
  alt: string;
  caption?: string;
  captionHtml?: string;
  captionPosition?: "above" | "below";
  tone?: number;
  fit?: "cover" | "contain";
  position?: string;
  scale?: number;
  detail?: boolean;
  border?: boolean;
};

export type ImageGridItem = {
  src: string;
  alt: string;
  label?: string;
  width?: number;
  height?: number;
  fit?: "cover" | "contain";
  position?: string;
  scale?: number;
  detail?: boolean;
};

export type ImageGridMedia = {
  kind: "image-grid";
  id: string;
  ratio: string;
  images: ImageGridItem[];
  columns?: number;
  gap?: string;
  background?: string;
  border?: boolean;
  caption?: string;
  captionHtml?: string;
  captionPosition?: "above" | "below";
};

export type ImageRowMedia = {
  kind: "image-row";
  id: string;
  height?: string;
  images: ImageGridItem[];
  gap?: string;
  caption?: string;
  captionHtml?: string;
  captionPosition?: "above" | "below";
};

export type MediaRowItem =
  | (ImageGridItem & {
      kind: "image";
    })
  | (Omit<VideoMedia, "kind" | "caption" | "captionHtml" | "captionPosition"> & {
      kind: "video";
      width: number;
      height: number;
    })
  | (Omit<YouTubeMedia, "kind" | "caption" | "captionHtml" | "captionPosition"> & {
      kind: "youtube";
      width: number;
      height: number;
    });

export type MediaRowMedia = {
  kind: "media-row";
  id: string;
  items: MediaRowItem[];
  gap?: string;
  caption?: string;
  captionHtml?: string;
  captionPosition?: "above" | "below";
};

export type VideoMedia = {
  kind: "video";
  id: string;
  src: string;
  poster: string;
  ratio: string;
  title: string;
  autoplay?: boolean;
  controls?: boolean;
  audioControls?: boolean;
  caption?: string;
  captionHtml?: string;
  captionPosition?: "above" | "below";
};

export type YouTubeMedia = {
  kind: "youtube";
  id: string;
  youtubeId: string;
  poster?: string;
  ratio: string;
  title: string;
  caption?: string;
  captionHtml?: string;
  captionPosition?: "above" | "below";
};

export type Html5Media = {
  kind: "html5";
  id: string;
  src: string;
  width: number;
  height: number;
  title: string;
  caption?: string;
  captionHtml?: string;
  captionPosition?: "above" | "below";
};

export type ProjectMedia = ImageMedia | ImageGridMedia | ImageRowMedia | MediaRowMedia | VideoMedia | YouTubeMedia | Html5Media;

export type Project = {
  slug: string;
  title: string;
  homepageLabel?: string;
  homepageSubtitle?: string;
  seoDescription: string;
  socialImage?: string;
  colorMedia: boolean;
  order: number;
  published: boolean;
  featured: boolean;
  homepageWide?: boolean;
  thumbnail: {
    src?: string;
    hoverSrc?: string;
    alt: string;
    focalX: number;
    focalY: number;
    fit: "cover" | "contain";
    scale: number;
    tone: number;
  };
  media: ProjectMedia[];
  evidence?: {
    role?: string;
    mandate?: string;
    scale?: string;
    outcome?: string;
  };
  descriptionHtml: string;
};

export type SiteConfig = {
  name: string;
  description: string;
  homepageTitle?: string;
  homepageIntro?: string;
  url: string;
  language: string;
  locale: string;
  keywords: string[];
  email: string;
  location: string;
  aboutLabel: string;
  closeLabel: string;
  projectsLabel: string;
  showProjectLabels: boolean;
  socialImage: string;
  socialImageAlt: string;
  favicon: string;
  appleTouchIcon: string;
};

const contentRoot = path.join(process.cwd(), "content");
const projectsRoot = path.join(contentRoot, "projects");
const projectFiles = Object.fromEntries(
  readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [
      entry.name,
      readFileSync(path.join(projectsRoot, entry.name, "project.md"), "utf8"),
    ]),
);
const aboutSource = readFileSync(path.join(contentRoot, "about.md"), "utf8");
const siteSource = readFileSync(path.join(contentRoot, "site.yml"), "utf8");

function renderMarkdown(source: string) {
  const html = marked.parse(source, { async: false }) as string;
  return html.replace(
    /(<blockquote>\s*<p>)([“‘"'])/g,
    '$1<span class="hanging-quote">$2</span>',
  );
}
function renderInlineMarkdown(source: string) {
  return marked.parseInline(source, { async: false }) as string;
}

function parseProjectFile(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Project files must begin with YAML frontmatter.");
  return { data: parseYaml(match[1]), content: match[2] };
}

function readProject(slug: string): Project {
  const source = projectFiles[slug];
  if (!source) throw new Error(`Unknown project: ${slug}`);
  const { data, content } = parseProjectFile(source);

  return {
    slug,
    title: data.title,
    homepageLabel: data.homepageLabel,
    homepageSubtitle: data.homepageSubtitle,
    seoDescription: data.seoDescription ?? data.title,
    socialImage: data.socialImage,
    colorMedia: data.colorMedia ?? false,
    order: data.order,
    published: data.published,
    featured: data.featured ?? true,
    homepageWide: data.homepageWide,
    thumbnail: {
      src: data.thumbnail?.src,
      hoverSrc: data.thumbnail?.hoverSrc,
      alt: data.thumbnail.alt,
      focalX: data.thumbnail.focalX ?? 50,
      focalY: data.thumbnail.focalY ?? 50,
      fit: data.thumbnail.fit ?? "cover",
      scale: data.thumbnail.scale ?? 1,
      tone: data.thumbnail.tone ?? 1,
    },
    media: data.media.map((media: ProjectMedia) => ({
      ...media,
      detail: media.kind === "image" ? media.detail ?? true : undefined,
      captionHtml: media.caption ? renderInlineMarkdown(media.caption) : undefined,
    })) as ProjectMedia[],
    evidence: data.evidence,
    descriptionHtml: renderMarkdown(content),
  };
}

export function getProjects() {
  return Object.keys(projectFiles)
    .map((slug) => readProject(slug))
    .filter((project) => project.published)
    .sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects() {
  return getProjects().filter((project) => project.featured);
}

export function getProject(slug: string) {
  if (!projectFiles[slug]) return null;
  const project = readProject(slug);
  return project.published ? project : null;
}

export function getSiteConfig(): SiteConfig {
  const data = parseYaml(siteSource);
  return {
    ...data,
    url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || data.url || "",
    language: data.language ?? "en",
    locale: data.locale ?? "en_US",
    keywords: data.keywords ?? [],
    showProjectLabels:
      process.env.NEXT_PUBLIC_SHOW_PROJECT_LABELS === "true"
        ? true
        : data.showProjectLabels ?? false,
    socialImageAlt: data.socialImageAlt ?? `${data.name} portfolio`,
    favicon: data.favicon ?? "/favicon.png",
    appleTouchIcon: data.appleTouchIcon ?? "/apple-touch-icon.png",
  } as SiteConfig;
}

export function getAboutHtml() {
  const config = getSiteConfig();
  const source = aboutSource
    .replaceAll("{{name}}", config.name)
    .replaceAll("{{email}}", config.email)
    .replaceAll("{{location}}", config.location);
  return renderMarkdown(source);
}
