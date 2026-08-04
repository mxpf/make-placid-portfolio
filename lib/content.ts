import { marked } from "marked";
import { parse as parseYaml } from "yaml";

export type ImageMedia = {
  kind: "image";
  id: string;
  src?: string;
  ratio: string;
  alt: string;
  caption?: string;
  tone?: number;
};

export type VideoMedia = {
  kind: "video";
  id: string;
  src: string;
  poster: string;
  ratio: string;
  title: string;
  caption?: string;
};

export type YouTubeMedia = {
  kind: "youtube";
  id: string;
  youtubeId: string;
  poster?: string;
  ratio: string;
  title: string;
  caption?: string;
};

export type ProjectMedia = ImageMedia | VideoMedia | YouTubeMedia;

export type Project = {
  slug: string;
  title: string;
  order: number;
  published: boolean;
  thumbnail: {
    src?: string;
    alt: string;
    focalX: number;
    focalY: number;
    tone: number;
  };
  media: ProjectMedia[];
  descriptionHtml: string;
};

export type SiteConfig = {
  name: string;
  description: string;
  email: string;
  location: string;
  aboutLabel: string;
  closeLabel: string;
  projectsLabel: string;
  socialImage: string;
};

const projectFiles = import.meta.glob("../content/projects/*/project.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const aboutFiles = import.meta.glob("../content/about.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const siteFiles = import.meta.glob("../content/site.yml", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function renderMarkdown(source: string) {
  const html = marked.parse(source, { async: false }) as string;
  return html.replace(
    /(<blockquote>\s*<p>)([“‘"'])/g,
    '$1<span class="hanging-quote">$2</span>',
  );
}

function parseProjectFile(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Project files must begin with YAML frontmatter.");
  return { data: parseYaml(match[1]), content: match[2] };
}

function readProject(slug: string): Project {
  const key = Object.keys(projectFiles).find((file) => file.endsWith(`/${slug}/project.md`));
  if (!key) throw new Error(`Unknown project: ${slug}`);
  const source = projectFiles[key];
  const { data, content } = parseProjectFile(source);

  return {
    slug,
    title: data.title,
    order: data.order,
    published: data.published,
    thumbnail: {
      src: data.thumbnail?.src,
      alt: data.thumbnail.alt,
      focalX: data.thumbnail.focalX ?? 50,
      focalY: data.thumbnail.focalY ?? 50,
      tone: data.thumbnail.tone ?? 1,
    },
    media: data.media,
    descriptionHtml: renderMarkdown(content),
  };
}

export function getProjects() {
  return Object.keys(projectFiles)
    .map((file) => file.match(/\/projects\/([^/]+)\/project\.md$/)?.[1])
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => readProject(slug))
    .filter((project) => project.published)
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string) {
  if (!Object.keys(projectFiles).some((file) => file.endsWith(`/${slug}/project.md`))) return null;
  const project = readProject(slug);
  return project.published ? project : null;
}

export function getSiteConfig(): SiteConfig {
  const source = Object.values(siteFiles)[0];
  if (!source) throw new Error("Missing content/site.yml.");
  return parseYaml(source) as SiteConfig;
}

export function getAboutHtml() {
  const config = getSiteConfig();
  const source = Object.values(aboutFiles)[0]
    .replaceAll("{{name}}", config.name)
    .replaceAll("{{email}}", config.email)
    .replaceAll("{{location}}", config.location);
  return renderMarkdown(source);
}
