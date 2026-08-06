import sharp from "sharp";

const jobs = [
  {
    input: "public/images/projects/nyt/nyt-campaign.png",
    output: "public/images/projects/nyt/nyt-campaign-t.png",
    extract: { left: 528, top: 982, width: 2301, height: 1534 },
  },
  {
    input: "public/images/projects/nyt/nyt-campaign.png",
    output: "public/images/projects/nyt/nyt-campaign-products.png",
    extract: { left: 528, top: 5636, width: 2304, height: 1536 },
  },
  {
    input: "public/images/projects/nyt/nyt-insider.png",
    output: "public/images/projects/nyt/nyt-insider-launch.png",
    extract: { left: 532, top: 1200, width: 2052, height: 1376 },
  },
  {
    input: "public/images/projects/nyt/nyt-insider-site.png",
    output: "public/images/projects/nyt/nyt-insider-site-home.png",
    extract: { left: 0, top: 0, width: 1280, height: 853 },
  },
  {
    input: "public/images/projects/nyt/nyt-insider-subscription.png",
    output: "public/images/projects/nyt/nyt-insider-subscription-home.png",
    extract: { left: 0, top: 0, width: 1280, height: 720 },
  },
  {
    input: "public/images/projects/npr/npr-ux.png",
    output: "public/images/projects/npr/npr-one-experience.png",
    extract: { left: 538, top: 2100, width: 2365, height: 1330 },
  },
  {
    input: "public/images/projects/npr/npr-ux.png",
    output: "public/images/projects/npr/npr-product-family.png",
    extract: { left: 538, top: 3200, width: 2365, height: 1330 },
  },
  {
    input: "public/images/projects/npr/npr-lobby.png",
    output: "public/images/projects/npr/npr-lobby-work.png",
    extract: { left: 530, top: 1145, width: 2302, height: 1296 },
  },
];

for (const job of jobs) {
  await sharp(job.input)
    .extract(job.extract)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(job.output);

  console.log(`Generated ${job.output}`);
}
