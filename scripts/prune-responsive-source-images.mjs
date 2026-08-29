import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import imageManifest from "../public/images/responsive/manifest.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = path.resolve(root, process.argv[2] ?? "out");
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath = configuredBasePath && configuredBasePath !== "/"
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const preservedSources = new Set();

function withoutBasePath(pathname) {
  if (!basePath || pathname === basePath) return pathname === basePath ? "/" : pathname;
  return pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : pathname;
}

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtml(target));
    } else if (entry.name.endsWith(".html")) {
      files.push(target);
    }
  }

  return files;
}

async function removeFinderMetadata(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return removeFinderMetadata(target);
    if (entry.name === ".DS_Store") return rm(target, { force: true });
  }));
}

for (const htmlFile of await collectHtml(clientRoot)) {
  const html = await readFile(htmlFile, "utf8");
  for (const match of html.matchAll(/(?:content|poster)="([^"]+)"/g)) {
    try {
      const pathname = withoutBasePath(new URL(match[1], "https://portfolio.local").pathname);
      if (imageManifest[pathname]) preservedSources.add(pathname);
    } catch {
      // Ignore metadata values that are not URLs.
    }
  }
}

await Promise.all(
  Object.keys(imageManifest).map((sourceUrl) =>
    preservedSources.has(sourceUrl)
      ? Promise.resolve()
      : rm(path.join(clientRoot, sourceUrl), { force: true }),
  ),
);

await removeFinderMetadata(clientRoot);

console.log(
  `Removed ${Object.keys(imageManifest).length - preservedSources.size} superseded source images; kept ${preservedSources.size} metadata images.`,
);
