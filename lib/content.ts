import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import aboutSource from "../content/about.md?raw";
import project01Source from "../content/projects/project-01/project.md?raw";
import project02Source from "../content/projects/project-02/project.md?raw";
import project03Source from "../content/projects/project-03/project.md?raw";
import project04Source from "../content/projects/project-04/project.md?raw";
import project05Source from "../content/projects/project-05/project.md?raw";
import project06Source from "../content/projects/project-06/project.md?raw";
import project07Source from "../content/projects/project-07/project.md?raw";
import project08Source from "../content/projects/project-08/project.md?raw";
import project09Source from "../content/projects/project-09/project.md?raw";
import project10Source from "../content/projects/project-10/project.md?raw";
import project11Source from "../content/projects/project-11/project.md?raw";
import siteSource from "../content/site.yml?raw";

export type ImageMedia = {
  kind: "image";
  id: string;
  src?: string;
  ratio: string;
  alt: string;
  caption?: string;
  captionHtml?: string;
  tone?: number;
  fit?: "cover" | "contain";
  position?: string;
  scale?: number;
  detail?: boolean;
};

export type ImageGridItem = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  position?: string;
  scale?: number;
};

export type ImageGridMedia = {
  kind: "image-grid";
  id: string;
  ratio: string;
  images: ImageGridItem[];
  caption?: string;
  captionHtml?: string;
};

export type VideoMedia = {
  kind: "video";
  id: string;
  src: string;
  poster: string;
  ratio: string;
  title: string;
  autoplay?: boolean;
  caption?: string;
  captionHtml?: string;
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
};

export type ProjectMedia = ImageMedia | ImageGridMedia | VideoMedia | YouTubeMedia;

export type Project = {
  slug: string;
  title: string;
  homepageLabel?: string;
  seoDescription: string;
  socialImage?: string;
  colorMedia: boolean;
  order: number;
  published: boolean;
  thumbnail: {
    src?: string;
    alt: string;
    focalX: number;
    focalY: number;
    fit: "cover" | "contain";
    scale: number;
    tone: number;
  };
  media: ProjectMedia[];
  descriptionHtml: string;
};

export type SiteConfig = {
  name: string;
  description: string;
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

const projectFiles: Record<string, string> = {
  "project-01": project01Source,
  "project-02": project02Source,
  "project-03": project03Source,
  "project-04": project04Source,
  "project-05": project05Source,
  "project-06": project06Source,
  "project-07": project07Source,
  "project-08": project08Source,
  "project-09": project09Source,
  "project-10": project10Source,
  "project-11": project11Source,
};

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
    seoDescription: data.seoDescription ?? data.title,
    socialImage: data.socialImage,
    colorMedia: data.colorMedia ?? false,
    order: data.order,
    published: data.published,
    thumbnail: {
      src: data.thumbnail?.src,
      alt: data.thumbnail.alt,
      focalX: data.thumbnail.focalX ?? 50,
      focalY: data.thumbnail.focalY ?? 50,
      fit: data.thumbnail.fit ?? "cover",
      scale: data.thumbnail.scale ?? 1,
      tone: data.thumbnail.tone ?? 1,
    },
    media: data.media.map((media: ProjectMedia) => ({
      ...media,
      captionHtml: media.caption ? renderInlineMarkdown(media.caption) : undefined,
    })),
    descriptionHtml: renderMarkdown(content),
  };
}

export function getProjects() {
  return Object.keys(projectFiles)
    .map((slug) => readProject(slug))
    .filter((project) => project.published)
    .sort((a, b) => a.order - b.order);
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
    url: data.url ?? "",
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
