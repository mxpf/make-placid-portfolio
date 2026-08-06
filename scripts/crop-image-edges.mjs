import { rename } from "node:fs/promises";
import sharp from "sharp";

const root = "public/images/projects";

const jobs = [
  // Holland & Knight presentation-board export rules.
  ["hk/hk-home.png", 984, 656, { bottom: 1 }],
  ["hk/hk-01.png", 2422, 1363, { bottom: 1 }],
  ["hk/hk-02.png", 1177, 614, { right: 1, bottom: 1 }],
  ["hk/hk-03.png", 1158, 609, { left: 1, bottom: 1 }],
  ["hk/hk-04.png", 2422, 1362, { top: 1 }],
  ["hk/hk-05.png", 1167, 657, { bottom: 1 }],
  ["hk/hk-06.png", 1167, 657, { bottom: 1 }],
  ["hk/hk-07.png", 2422, 1262, { bottom: 1 }],
  ["hk/hk-08.png", 1214, 471, { bottom: 2 }],
  ["hk/hk-10.png", 2422, 1156, { bottom: 2 }],
  ["hk/hk-13.png", 1167, 656, { bottom: 1 }],
  ["hk/hk-14.png", 1167, 655, { bottom: 1 }],
  ["hk/hk-16.png", 1167, 655, { bottom: 1 }],

  // Synchrony screenshot and board edges.
  ["synchrony/synchrony-01.png", 2422, 1363, { bottom: 1 }],
  ["synchrony/synchrony-05.png", 1167, 609, { bottom: 1 }],
  ["synchrony/synchrony-08.png", 1167, 609, { bottom: 1 }],
  ["synchrony/synchrony-10.png", 1586, 1834, { left: 1, right: 1 }],
  ["synchrony/synchrony-12.png", 2422, 1964, { left: 1, right: 1 }],
  ["synchrony/synchrony-15.png", 2418, 1562, { left: 1, right: 1 }],
  ["synchrony/synchrony-17.png", 1026, 660, { bottom: 1 }],
  ["synchrony/synchrony-18.png", 1026, 660, { bottom: 1 }],
  ["synchrony/synchrony-19.png", 749, 1010, { top: 1, bottom: 1 }],
  ["synchrony/synchrony-20.png", 748, 966, { bottom: 1 }],

  // IBM video-frame letterboxing and presentation-board rules.
  ["ibm/ibm-05.png", 2422, 1362, { right: 1 }],
  ["ibm/ibm-07.png", 1498, 845, { right: 1, bottom: 1 }],
  ["ibm/ibm-08.png", 1498, 845, { top: 1, right: 1, bottom: 1 }],
  ["ibm/ibm-10.png", 1498, 999, { right: 1, bottom: 1 }],
  ["ibm/ibm-11.png", 1498, 999, { right: 1, bottom: 1 }],
  ["ibm/ibm-15.png", 1167, 779, { bottom: 1 }],
  ["ibm/ibm-17.png", 1497, 900, { top: 1 }],
  ["ibm/ibm-22.png", 1498, 999, { top: 50, bottom: 50 }],
  ["ibm/ibm-26.png", 1167, 702, { top: 1, bottom: 1 }],
  ["ibm/ibm-27.png", 1167, 702, { top: 1, bottom: 1 }],
  ["ibm/ibm-30.png", 1498, 999, { right: 1, bottom: 1 }],
  ["ibm/ibm-31.png", 1498, 999, { right: 1, bottom: 1 }],
  ["ibm/ibm-33.png", 1167, 779, { top: 40, bottom: 40 }],

  // Thin page-frame rules on the Sands pitch boards.
  ["sands/sands-details-cover.png", 2550, 3300, { top: 2, right: 2, bottom: 2, left: 2 }],
  ["sands/sands-details-environment.png", 5100, 3300, { top: 2, right: 2, bottom: 2, left: 2 }],
  ["sands/sands-details-performance.png", 5100, 3300, { top: 2, right: 2, bottom: 2, left: 2 }],
  ["sands/sands-thrive-cover.png", 2550, 3300, { top: 2, right: 2, bottom: 2, left: 2 }],
  ["sands/sands-thrive-destination.png", 5092, 3292, { right: 1 }],
  ["sands/sands-thrive-impact.png", 5100, 3300, { top: 2, right: 2, bottom: 2, left: 2 }],

  // Single-pixel screenshot/export borders found in the final audit.
  ["jj/jj-19.png", 876, 2040, { right: 1, bottom: 1 }],
  ["jj/jj-20.png", 876, 2040, { right: 1, bottom: 1 }],
];

for (const [relativePath, originalWidth, originalHeight, trim] of jobs) {
  const path = `${root}/${relativePath}`;
  const left = trim.left ?? 0;
  const top = trim.top ?? 0;
  const width = originalWidth - left - (trim.right ?? 0);
  const height = originalHeight - top - (trim.bottom ?? 0);
  const metadata = await sharp(path).metadata();

  if (metadata.width === width && metadata.height === height) {
    console.log(`Already cropped ${path}`);
    continue;
  }

  if (metadata.width !== originalWidth || metadata.height !== originalHeight) {
    throw new Error(
      `Unexpected dimensions for ${path}: ${metadata.width}x${metadata.height}; expected ${originalWidth}x${originalHeight}`,
    );
  }

  const temporaryPath = `${path}.cropped.png`;
  await sharp(path)
    .extract({ left, top, width, height })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(temporaryPath);
  await rename(temporaryPath, path);
  console.log(`Cropped ${path} to ${width}x${height}`);
}
