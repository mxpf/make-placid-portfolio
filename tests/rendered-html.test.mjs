import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const previewRoot = new URL("../app/_sites-preview/", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const env = {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
  const context = {
    waitUntil() {},
    passThroughOnException() {},
  };
  const request = new Request(`http://localhost${pathname}`, {
    headers: { accept: "text/html" },
  });
  const response = await worker.fetch(request, env, context);
  const location = response.headers.get("location");

  if ([301, 302, 307, 308].includes(response.status) && location) {
    return worker.fetch(
      new Request(new URL(location, request.url), {
        headers: { accept: "text/html" },
      }),
      env,
      context,
    );
  }

  return response;
}

test("server-renders the portfolio home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Max Pfennighaus<\/title>/i);
  assert.match(html, />Max Pfennighaus<\/a>/);
  assert.match(html, />About &amp; contact<\/a>/);
  assert.equal((html.match(/href="\/projects\/project-\d{2}"/g) ?? []).length, 7);
  assert.equal((html.match(/src="\/images\/unsplash\//g) ?? []).length, 3);
  assert.match(html, /src="\/images\/projects\/jj\/jj-07\.png"/);
  assert.match(html, /src="\/images\/projects\/hk\/hk-01\.png"/);
  assert.match(html, /src="\/images\/projects\/synchrony\/synchrony-01\.png"/);
  assert.match(html, /src="\/images\/projects\/ibm\/ibm-04\.png"/);
  assert.match(html, /class="home-project color-media"/);
  assert.match(html, /srcSet="\/images\/responsive\/unsplash\//);
  assert.doesNotMatch(html, /home-project-label/);
  assert.match(html, /rel="icon"/);
  assert.match(html, /property="og:image"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders project and about routes", async () => {
  const [synchronyResponse, johnsonResponse, hollandKnightResponse, ibmResponse, campaignResponse, aboutResponse] = await Promise.all([
    render("/projects/project-03"),
    render("/projects/project-01"),
    render("/projects/project-02"),
    render("/projects/project-04"),
    render("/projects/project-05"),
    render("/about"),
  ]);

  assert.equal(synchronyResponse.status, 200);
  assert.equal(johnsonResponse.status, 200);
  assert.equal(hollandKnightResponse.status, 200);
  assert.equal(ibmResponse.status, 200);
  assert.equal(campaignResponse.status, 200);
  assert.equal(aboutResponse.status, 200);

  const [synchronyHtml, johnsonHtml, hollandKnightHtml, ibmHtml, campaignHtml, aboutHtml] = await Promise.all([
    synchronyResponse.text(),
    johnsonResponse.text(),
    hollandKnightResponse.text(),
    ibmResponse.text(),
    campaignResponse.text(),
    aboutResponse.text(),
  ]);

  assert.match(synchronyHtml, /Synchrony/);
  assert.match(synchronyHtml, /project-layout color-media/);
  assert.match(synchronyHtml, /synchrony-20\.png/);
  assert.match(synchronyHtml, /The platform supported social communications, cultural moments, and community-specific messages/);
  assert.doesNotMatch(synchronyHtml, /synchrony-(04|06|07|09|11|14|16|18|21)\.png/);
  assert.match(campaignHtml, /class="video-poster"/);
  assert.match(campaignHtml, /ifElv18k2O8/);
  assert.match(campaignHtml, /aria-label="Play I Am Easy To Find, a film by Mike Mills and The National"/);
  assert.doesNotMatch(campaignHtml, /youtube-nocookie\.com\/embed/);
  assert.doesNotMatch(campaignHtml, /M7lc1UVf-VE|Google Developers/);
  assert.match(johnsonHtml, /Johnson &amp; Johnson/);
  assert.match(johnsonHtml, /project-layout color-media/);
  assert.match(johnsonHtml, /jj-gif-01\.gif/);
  assert.match(johnsonHtml, /jj-gif-03\.gif/);
  assert.match(johnsonHtml, /jj-video-01\.mp4/);
  assert.match(johnsonHtml, /autoPlay=""/);
  assert.match(johnsonHtml, /loop=""/);
  assert.match(johnsonHtml, /muted=""/);
  assert.match(johnsonHtml, /playsInline=""/);
  assert.match(hollandKnightHtml, /Holland &amp; Knight/);
  assert.match(hollandKnightHtml, /hk-16\.png/);
  assert.match(hollandKnightHtml, /The system remained recognizable across informal, physical brand touchpoints\./);
  assert.match(ibmHtml, /IBM/);
  assert.match(ibmHtml, /project-layout color-media/);
  assert.match(ibmHtml, /ibm-33\.png/);
  assert.match(ibmHtml, /The interaction model carried into a live executive presentation/);
  assert.doesNotMatch(ibmHtml, /ibm-(01|02|03|06|12|14|16|18|19|20|21|23|24|25|29|32)\.png/);
  assert.match(aboutHtml, />About &amp; contact<\/a>/);
  assert.match(aboutHtml, /senior creative leader with more than 25 years of experience/);
});

test("defines search-engine discovery routes", async () => {
  const [robots, sitemap, siteConfig] = await Promise.all([
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../content/site.yml", import.meta.url), "utf8"),
  ]);

  assert.match(robots, /dynamic = "force-static"/);
  assert.match(robots, /\$\{site\.url\}\/sitemap\.xml/);
  assert.match(sitemap, /getProjects\(\)/);
  assert.match(sitemap, /\$\{site\.url\}\/projects\/\$\{project\.slug\}/);
  assert.match(siteConfig, /url: "https:\/\/maxpfennig\.haus"/);
});

test("keeps identity copy in the content layer", async () => {
  const [page, layout, chrome, transitionLink, styles, siteConfig, packageJson, gitignore, envExample, manifest, license, notices] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/TransitionLink.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../content/site.yml", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.gitignore", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../public/images/responsive/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../LICENSE", import.meta.url), "utf8"),
    readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getProjects\(\)/);
  assert.match(layout, /getSiteConfig\(\)/);
  assert.match(siteConfig, /name: "Max Pfennighaus"/);
  assert.match(siteConfig, /showProjectLabels: false/);
  assert.match(siteConfig, /socialImageAlt:/);
  assert.doesNotMatch(`${page}${layout}${chrome}`, /Max Pfennighaus/);
  assert.match(transitionLink, /router\.push\(href\)/);
  assert.doesNotMatch(`${transitionLink}${chrome}`, /location\.assign|window\.location\.assign|history\.back/);
  assert.match(styles, /\.home-grid\s*\{[^}]*padding: var\(--header-height\) 24px var\(--rail-height\)/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*animation: project-page-in/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*padding: var\(--header-height\) 24px 0/s);
  assert.match(styles, /\.project-gallery > \.media-item:last-child:not\(:has\(\.media-caption\)\)\s*\{[^}]*margin-bottom: var\(--rail-height\)/s);
  assert.match(styles, /\.project-gallery > \.media-item:last-child:has\(\.media-caption\)\s*\{[^}]*calc\(var\(--spacing-3\) \+ var\(--rail-height\)\)/s);
  assert.match(styles, /html:has\(body\.detail-open\),\s*body\.detail-open\s*\{[^}]*overscroll-behavior: none/s);
  assert.match(styles, /\.detail-layer\s*\{[^}]*overscroll-behavior: none/s);
  assert.match(styles, /\.detail-layer:focus\s*\{[^}]*outline: none/s);
  assert.match(styles, /html\.custom-font\s*\{[^}]*font-family: "mxpf-sans", "Instrument Sans"/s);
  assert.match(layout, /NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT/);
  assert.match(gitignore, /public\/fonts\/portfolio-custom\.woff2/);
  assert.match(envExample, /NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT=false/);
  assert.match(envExample, /NEXT_PUBLIC_SHOW_PROJECT_LABELS=false/);
  assert.match(manifest, /\/images\/responsive\/unsplash\//);
  assert.match(license, /MIT License/);
  assert.match(notices, /SIL Open Font License 1\.1/);
  assert.match(packageJson, /"images": "node scripts\/generate-responsive-images\.mjs"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await access(new URL("../public/fonts/InstrumentSans-Regular.woff2", import.meta.url));
  await access(new URL("../public/fonts/OFL.txt", import.meta.url));
  await assert.rejects(access(new URL("../public/fonts/UntitledSansWeb-Regular.woff2", import.meta.url)));
  await assert.rejects(access(new URL("SkeletonPreview.tsx", previewRoot)));
  await assert.rejects(access(new URL("preview.css", previewRoot)));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
