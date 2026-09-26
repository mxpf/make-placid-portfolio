import { z } from "zod";

const localPath = z.string().startsWith("/", "must be a root-relative path beginning with /");
const localOrRemotePath = z.string().refine(
  (value) => value.startsWith("/") || /^https:\/\//.test(value),
  "must be a root-relative path or an HTTPS URL",
);
const ratio = z.string()
  .regex(/^\s*\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\s*$/, "must use a width / height ratio")
  .refine((value) => value.split("/").every((part) => Number(part.trim()) > 0), "ratio values must be greater than zero");
const mediaId = z.string().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, "must contain only letters, numbers, hyphens, and underscores");
const youtubeId = z.string().regex(/^[a-zA-Z0-9_-]{6,20}$/, "must be a valid YouTube video id");
const cssLength = z.string().regex(/^\d+(?:\.\d+)?(?:px|rem|em|%|vw|vh|svw|svh|dvw|dvh)$/, "must be a positive CSS length");
const captionFields = {
  caption: z.string().optional(),
  captionPosition: z.enum(["above", "below"]).optional(),
};
const imageFields = {
  src: localPath,
  alt: z.string().min(1),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  fit: z.enum(["cover", "contain"]).optional(),
  position: z.string().optional(),
  scale: z.number().positive().optional(),
  detail: z.boolean().optional(),
};
const imageItemSchema = z.strictObject(imageFields).refine(
  (item) => (item.width === undefined) === (item.height === undefined),
  { message: "width and height must be provided together" },
);

const imageSchema = z.strictObject({
  kind: z.literal("image"),
  id: mediaId,
  src: localPath.optional(),
  ratio,
  alt: z.string().min(1),
  tone: z.number().min(0).optional(),
  fit: z.enum(["cover", "contain"]).optional(),
  position: z.string().optional(),
  scale: z.number().positive().optional(),
  detail: z.boolean().optional(),
  border: z.boolean().optional(),
  ...captionFields,
});
const videoSchema = z.strictObject({
  kind: z.literal("video"),
  id: mediaId,
  src: localOrRemotePath,
  poster: z.union([localPath, z.literal("placeholder")]),
  ratio,
  title: z.string().min(1),
  autoplay: z.boolean().optional(),
  controls: z.boolean().optional(),
  audioControls: z.boolean().optional(),
  ...captionFields,
});
const youtubeSchema = z.strictObject({
  kind: z.literal("youtube"),
  id: mediaId,
  youtubeId,
  poster: localPath.optional(),
  ratio,
  title: z.string().min(1),
  ...captionFields,
});
const html5Schema = z.strictObject({
  kind: z.literal("html5"),
  id: mediaId,
  src: localPath,
  width: z.number().positive(),
  height: z.number().positive(),
  title: z.string().min(1),
  ...captionFields,
});
const imageGridSchema = z.strictObject({
  kind: z.literal("image-grid"),
  id: mediaId,
  ratio,
  images: z.array(imageItemSchema).min(1),
  columns: z.number().int().positive().optional(),
  gap: cssLength.optional(),
  background: z.string().optional(),
  border: z.boolean().optional(),
  ...captionFields,
}).superRefine((grid, context) => {
  if (grid.columns !== undefined && grid.columns > grid.images.length) {
    context.addIssue({ code: "custom", path: ["columns"], message: "cannot exceed the number of images" });
  }
});
const imageRowSchema = z.strictObject({
  kind: z.literal("image-row"),
  id: mediaId,
  height: cssLength.optional(),
  images: z.array(imageItemSchema).min(1),
  gap: cssLength.optional(),
  ...captionFields,
});
const mediaRowItemSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("image"), ...imageFields }),
  videoSchema.omit({ id: true, ratio: true }).extend({ width: z.number().positive(), height: z.number().positive() }),
  youtubeSchema.omit({ id: true, ratio: true }).extend({ width: z.number().positive(), height: z.number().positive() }),
]);
const mediaRowSchema = z.strictObject({
  kind: z.literal("media-row"),
  id: mediaId,
  items: z.array(mediaRowItemSchema).min(1),
  gap: cssLength.optional(),
  ...captionFields,
});

const projectSchema = z.strictObject({
  title: z.string().min(1),
  homepageLabel: z.string().optional(),
  homepageSubtitle: z.string().optional(),
  seoDescription: z.string().optional(),
  socialImage: localPath.optional(),
  colorMedia: z.boolean().optional(),
  order: z.number().int().nonnegative(),
  published: z.boolean(),
  featured: z.boolean().optional(),
  homepageWide: z.boolean().optional(),
  thumbnail: z.strictObject({
    src: localPath.optional(),
    hoverSrc: localPath.optional(),
    alt: z.string().min(1),
    focalX: z.number().min(0).max(100).optional(),
    focalY: z.number().min(0).max(100).optional(),
    fit: z.enum(["cover", "contain"]).optional(),
    scale: z.number().positive().optional(),
    tone: z.number().min(0).optional(),
  }),
  media: z.array(z.discriminatedUnion("kind", [imageSchema, videoSchema, youtubeSchema, html5Schema, imageGridSchema, imageRowSchema, mediaRowSchema])).min(1),
  evidence: z.strictObject({
    role: z.string().optional(),
    mandate: z.string().optional(),
    scale: z.string().optional(),
    outcome: z.string().optional(),
  }).optional(),
}).superRefine((project, context) => {
  const ids = new Set<string>();
  for (const [index, media] of project.media.entries()) {
    if (ids.has(media.id)) {
      context.addIssue({ code: "custom", path: ["media", index, "id"], message: `duplicate media id: ${media.id}` });
    }
    ids.add(media.id);
  }
});

const siteSchema = z.strictObject({
  name: z.string().min(1),
  description: z.string().min(1),
  homepageTitle: z.string().optional(),
  homepageIntro: z.string().optional(),
  url: z.string().url(),
  language: z.string().min(2),
  locale: z.string().min(2),
  keywords: z.array(z.string().min(1)),
  email: z.string().email(),
  location: z.string().min(1),
  aboutLabel: z.string().min(1),
  closeLabel: z.string().min(1),
  projectsLabel: z.string().min(1),
  showProjectLabels: z.boolean().optional(),
  socialImage: localPath,
  socialImageAlt: z.string().min(1).optional(),
  favicon: localPath.optional(),
  appleTouchIcon: localPath.optional(),
});

function formatError(label: string, error: z.ZodError) {
  const issues = error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; ");
  return new Error(`${label} is invalid — ${issues}`);
}

export function validateProjectData(data: unknown, slug: string) {
  const result = projectSchema.safeParse(data);
  if (!result.success) throw formatError(`content/projects/${slug}/project.md`, result.error);
  return result.data;
}

export function validateSiteData(data: unknown) {
  const result = siteSchema.safeParse(data);
  if (!result.success) throw formatError("content/site.yml", result.error);
  return result.data;
}
