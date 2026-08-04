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

  assert.match(projectHtml, /Project 03 — Motion/);
  assert.match(projectHtml, /class="video-poster"/);
  assert.match(projectHtml, /ifElv18k2O8/);
  assert.match(projectHtml, /\/images\/unsplash\/xVyR9Tkl23c\.jpg/);
  assert.match(projectHtml, /aria-label="Play I Am Easy To Find, a film by Mike Mills and The National"/);
  assert.doesNotMatch(projectHtml, /youtube-nocookie\.com\/embed/);
  assert.doesNotMatch(projectHtml, /M7lc1UVf-VE|Google Developers/);
  assert.match(aboutHtml, />Close<\/button>/);
  assert.match(aboutHtml, /independent designer working across identity, editorial, digital products, and environments/);
  assert.match(aboutHtml, /<span class="hanging-quote">“<\/span>/);
});

test("keeps identity copy in the content layer", async () => {
  const [page, layout, chrome, styles, siteConfig, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../content/site.yml", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getProjects\(\)/);
  assert.match(layout, /getSiteConfig\(\)/);
  assert.match(siteConfig, /name: "Max Pfennighaus"/);
  assert.doesNotMatch(`${page}${layout}${chrome}`, /Max Pfennighaus/);
  assert.match(styles, /\.home-grid\s*\{[^}]*padding: var\(--header-height\) 24px var\(--rail-height\)/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*animation: project-page-in/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*padding: var\(--header-height\) 24px 0/s);
  assert.match(styles, /\.project-gallery > \.media-item:last-child:not\(:has\(\.media-caption\)\)\s*\{[^}]*margin-bottom: var\(--rail-height\)/s);
  assert.match(styles, /\.project-gallery > \.media-item:last-child:has\(\.media-caption\)\s*\{[^}]*calc\(var\(--spacing-3\) \+ var\(--rail-height\)\)/s);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("SkeletonPreview.tsx", previewRoot)));
  await assert.rejects(access(new URL("preview.css", previewRoot)));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
