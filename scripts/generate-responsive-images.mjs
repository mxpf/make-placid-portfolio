import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesRoot = path.join(root, "public", "images");
const outputRoot = path.join(imagesRoot, "responsive");
const widths = [480, 960, 1440];
const supported = new Set([".jpg", ".jpeg", ".png"]);

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (absolute !== outputRoot) files.push(...await collectImages(absolute));
    } else if (supported.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolute);
    }
  }

  return files;
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const manifest = {};
const images = await collectImages(imagesRoot);

for (const sourcePath of images) {
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) continue;

  const relative = path.relative(imagesRoot, sourcePath);
  const parsed = path.parse(relative);
  const sourceUrl = `/images/${relative.split(path.sep).join("/")}`;
  const targetDirectory = path.join(outputRoot, parsed.dir);
  await mkdir(targetDirectory, { recursive: true });

  const candidates = widths.filter((width) => width <= metadata.width);
  if (candidates.length === 0) candidates.push(metadata.width);
  const sources = [];

  for (const width of candidates) {
    const outputName = `${parsed.name}-${width}.webp`;
    const outputPath = path.join(targetDirectory, outputName);
    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(outputPath);

    const outputRelative = path.relative(imagesRoot, outputPath).split(path.sep).join("/");
    sources.push({ src: `/images/${outputRelative}`, width });
  }

  manifest[sourceUrl] = {
    width: metadata.width,
    height: metadata.height,
    sources,
  };
}

await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Generated responsive WebP variants for ${images.length} images.`);
