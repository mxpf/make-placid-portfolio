import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve(process.argv[2] || "out");
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath = configuredBasePath && configuredBasePath !== "/"
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const missing = new Set();
const missingFragments = new Set();
let htmlFiles = 0;
const htmlByRelativePath = new Map();

function localPath(url) {
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;
  if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return null;

  const relative = basePath ? pathname.slice(basePath.length) || "/" : pathname;
  if (relative === "/") return "index.html";
  const normalized = relative.replace(/^\/+/, "");
  if (path.extname(normalized)) return normalized;
  return path.join(normalized, "index.html");
}

async function verifyReference(url, sourceRelativePath) {
  if (url.startsWith("#")) {
    const html = htmlByRelativePath.get(sourceRelativePath);
    const fragment = decodeURIComponent(url.slice(1));
    if (fragment && html && !html.includes(`id="${fragment}"`) && !html.includes(`name="${fragment}"`)) {
      missingFragments.add(`${sourceRelativePath} -> ${url}`);
    }
    return;
  }
  const relative = localPath(url);
  if (!relative) return;
  try {
    await access(path.join(outputDirectory, relative));
  } catch {
    missing.add(url);
  }
}

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collect(location);
      continue;
    }
    if (entry.name.endsWith(".html")) {
      htmlFiles += 1;
      htmlByRelativePath.set(path.relative(outputDirectory, location), await readFile(location, "utf8"));
    }
  }
}

async function verify(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await verify(location);
      continue;
    }

    if (entry.name.endsWith(".css")) {
      const css = await readFile(location, "utf8");
      for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        await verifyReference(match[1], path.relative(outputDirectory, location));
      }
      continue;
    }

    if (!entry.name.endsWith(".html")) continue;

    const relativePath = path.relative(outputDirectory, location);
    const html = htmlByRelativePath.get(relativePath) ?? "";
    for (const match of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
      await verifyReference(match[1], relativePath);
    }
    for (const match of html.matchAll(/srcSet="([^"]+)"/g)) {
      for (const candidate of match[1].split(",")) {
        await verifyReference(candidate.trim().split(/\s+/, 1)[0], relativePath);
      }
    }
  }
}

await collect(outputDirectory);
await verify(outputDirectory);

if (!htmlFiles) throw new Error("Static export does not contain any HTML files.");
if (missing.size) {
  throw new Error(`Static export references missing local files:\n${[...missing].sort().join("\n")}`);
}
if (missingFragments.size) {
  throw new Error(`Static export contains missing fragment targets:\n${[...missingFragments].sort().join("\n")}`);
}

console.log(`Static export verified: ${htmlFiles} HTML files, no missing local links or assets.`);
