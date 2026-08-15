import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve(process.argv[2] || "out");
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath = configuredBasePath && configuredBasePath !== "/"
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const missing = new Set();
let htmlFiles = 0;

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

async function verifyReference(url) {
  const relative = localPath(url);
  if (!relative) return;
  try {
    await access(path.join(outputDirectory, relative));
  } catch {
    missing.add(url);
  }
}

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(location);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    htmlFiles += 1;
    const html = await readFile(location, "utf8");
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
      await verifyReference(match[1]);
    }
    for (const match of html.matchAll(/srcSet="([^"]+)"/g)) {
      for (const candidate of match[1].split(",")) {
        await verifyReference(candidate.trim().split(/\s+/, 1)[0]);
      }
    }
  }
}

await visit(outputDirectory);

if (!htmlFiles) throw new Error("Static export does not contain any HTML files.");
if (missing.size) {
  throw new Error(`Static export references missing local files:\n${[...missing].sort().join("\n")}`);
}

console.log(`Static export verified: ${htmlFiles} HTML files, no missing local links or assets.`);
