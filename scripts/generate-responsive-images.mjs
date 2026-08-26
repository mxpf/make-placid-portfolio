import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
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

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function hashFile(filePath) {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

async function collectGeneratedImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectGeneratedImages(absolute));
    } else if (entry.name.endsWith(".webp")) {
      files.push(absolute);
    }
  }

  return files;
}

await mkdir(outputRoot, { recursive: true });

const manifestPath = path.join(outputRoot, "manifest.json");
const previousManifest = await readFile(manifestPath, "utf8")
  .then(JSON.parse)
  .catch((error) => {
    if (error.code === "ENOENT") return {};
    throw error;
  });
const manifest = {};
const images = await collectImages(imagesRoot);
const expectedOutputs = new Set();
let generated = 0;
let reused = 0;

for (const sourcePath of images) {
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) continue;

  const relative = path.relative(imagesRoot, sourcePath);
  const parsed = path.parse(relative);
  const sourceUrl = `/images/${relative.split(path.sep).join("/")}`;
  const targetDirectory = path.join(outputRoot, parsed.dir);
  await mkdir(targetDirectory, { recursive: true });

  const candidates = widths.filter((width) => width <= metadata.width);
  const largestTarget = widths.at(-1);
  if (
    largestTarget &&
    metadata.width < largestTarget &&
    !candidates.includes(metadata.width)
  ) {
    candidates.push(metadata.width);
  }
  if (candidates.length === 0) candidates.push(metadata.width);
  const sources = candidates.map((width) => {
    const outputName = `${parsed.name}-${width}.webp`;
    const outputPath = path.join(targetDirectory, outputName);
    const outputRelative = path.relative(imagesRoot, outputPath).split(path.sep).join("/");
    expectedOutputs.add(outputPath);
    return { src: `/images/${outputRelative}`, width, outputPath };
  });
  const sourceHash = await hashFile(sourcePath);
  const previous = previousManifest[sourceUrl];
  const outputsExist = await Promise.all(sources.map(({ outputPath }) => exists(outputPath)));
  const sameCandidates = previous?.sources?.length === sources.length && sources.every(
    ({ src, width }, index) =>
      previous.sources[index]?.src === src && previous.sources[index]?.width === width,
  );
  const canReuse = sameCandidates && outputsExist.every(Boolean) &&
    previous.sourceHash === sourceHash;

  if (canReuse) {
    reused += 1;
  } else {
    for (const { width, outputPath } of sources) {
      await sharp(sourcePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(outputPath);
    }
    generated += 1;
  }

  manifest[sourceUrl] = {
    width: metadata.width,
    height: metadata.height,
    sourceHash,
    sources: sources.map(({ src, width }) => ({ src, width })),
  };
}

const generatedImages = await collectGeneratedImages(outputRoot);
await Promise.all(
  generatedImages
    .filter((filePath) => !expectedOutputs.has(filePath))
    .map((filePath) => rm(filePath, { force: true })),
);
await writeFile(
  manifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `Responsive images ready: ${generated} regenerated, ${reused} reused, ${images.length} total.`,
);
