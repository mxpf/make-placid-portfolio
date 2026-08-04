import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const previewRoot = new URL("../app/_sites-preview/", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
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
  assert.equal((html.match(/src="\/images\/unsplash\//g) ?? []).length, 7);
  assert.match(html, /srcSet="\/images\/responsive\/unsplash\//);
  assert.equal((html.match(/class="home-project-label"/g) ?? []).length, 7);
  assert.match(html, /rel="icon"/);
  assert.match(html, /property="og:image"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders project and about routes", async () => {
  const [projectResponse, aboutResponse] = await Promise.all([
    render("/projects/project-03"),
    render("/about"),
  ]);

  assert.equal(projectResponse.status, 200);
  assert.equal(aboutResponse.status, 200);

  const [projectHtml, aboutHtml] = await Promise.all([
    projectResponse.text(),
    aboutResponse.text(),
  ]);

  assert.match(projectHtml, /Project 03 — Complete Case Study/);
  assert.match(projectHtml, /class="video-poster"/);
  assert.match(projectHtml, /ifElv18k2O8/);
  assert.match(projectHtml, /\/images\/unsplash\/xVyR9Tkl23c\.jpg/);
  assert.match(projectHtml, /<h2>Project information<\/h2>/);
  assert.match(projectHtml, /<blockquote>/);
  assert.match(projectHtml, /href="https:\/\/example\.com"/);
  assert.match(projectHtml, /aria-label="Play I Am Easy To Find, a film by Mike Mills and The National"/);
  assert.doesNotMatch(projectHtml, /youtube-nocookie\.com\/embed/);
  assert.doesNotMatch(projectHtml, /M7lc1UVf-VE|Google Developers/);
  assert.match(aboutHtml, />Close<\/button>/);
  assert.match(aboutHtml, /independent designer working across identity, editorial, digital products, and environments/);
  assert.match(aboutHtml, /<span class="hanging-quote">“<\/span>/);
});

test("publishes search-engine discovery routes", async () => {
  const [robotsResponse, sitemapResponse] = await Promise.all([
    render("/robots.txt"),
    render("/sitemap.xml"),
  ]);

  assert.equal(robotsResponse.status, 200);
  assert.equal(sitemapResponse.status, 200);

  const [robots, sitemap] = await Promise.all([
    robotsResponse.text(),
    sitemapResponse.text(),
  ]);

  assert.match(robots, /Sitemap: https:\/\/max-pfennighaus-studio\.mxpf\.chatgpt\.site\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/max-pfennighaus-studio\.mxpf\.chatgpt\.site\/projects\/project-03<\/loc>/);
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
  assert.match(styles, /html\.custom-font\s*\{[^}]*font-family: "Portfolio Custom", "Instrument Sans"/s);
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
