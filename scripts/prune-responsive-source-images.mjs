import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import imageManifest from "../public/images/responsive/manifest.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = path.join(root, "dist", "client");

await Promise.all(
  Object.keys(imageManifest).map((sourceUrl) =>
    rm(path.join(clientRoot, sourceUrl), { force: true }),
  ),
);

console.log(`Removed ${Object.keys(imageManifest).length} superseded source images from the deployment bundle.`);
