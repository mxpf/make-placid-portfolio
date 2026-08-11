import sharp from "sharp";

const background = "#eeede9";

const jobs = [
  {
    input: "public/images/projects/ibm/ibm-26.png",
    output: "public/images/projects/ibm/ibm-home.png",
    extract: { left: 58, top: 0, width: 1050, height: 700 },
  },
  {
    input: "public/images/projects/nyt/nyt-campaign-t.png",
    output: "public/images/projects/nyt/nyt-home.png",
    extract: { left: 849, top: 310, width: 601, height: 401 },
  },
  {
    input: "public/images/projects/nyt/nyt-insider.png",
    output: "public/images/projects/nyt/nyt-insider-home.png",
    extract: { left: 1190, top: 8730, width: 1008, height: 672 },
  },
  {
    input: "public/images/projects/npr/npr-ux.png",
    output: "public/images/projects/npr/npr-home.png",
    extract: { left: 930, top: 1165, width: 1410, height: 805 },
  },
  {
    input: "public/images/projects/sands/sands-details-cover.png",
    output: "public/images/projects/sands/sands-home.png",
    extract: { left: 1020, top: 180, width: 1500, height: 1000 },
  },
  {
    input: "public/images/projects/amazon/amazon-cover.png",
    output: "public/images/projects/amazon/amazon-home.png",
    extract: { left: 880, top: 168, width: 1520, height: 1013 },
  },
  {
    input: "public/images/projects/ussteel/ussteel-2024-process-improvements.png",
    output: "public/images/projects/ussteel/ussteel-home.png",
    extract: { left: 600, top: 430, width: 915, height: 610 },
  },
  {
    input: "public/images/projects/caterpillar/caterpillar-2025-sustainability-cover.png",
    output: "public/images/projects/caterpillar/caterpillar-home.png",
    extract: { left: 80, top: 550, width: 1950, height: 1300 },
  },
];

for (const job of jobs) {
  const image = sharp(job.input).extract(job.extract);

  await image
    .resize(1500, 1000, {
      fit: job.contain ? "contain" : "cover",
      background,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(job.output);

  console.log(`Generated ${job.output}`);
}
