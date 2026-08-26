import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const previewRoot = new URL("../app/_sites-preview/", import.meta.url);

async function render(pathname = "/") {
  const relativePath = pathname === "/"
    ? "index.html"
    : pathname.includes(".")
      ? pathname.replace(/^\/+/, "")
      : `${pathname.replace(/^\/+|\/+$/g, "")}/index.html`;
  const body = await readFile(new URL(`../out/${relativePath}`, import.meta.url), "utf8");
  const contentType = pathname.endsWith(".xml")
    ? "application/xml"
    : pathname.endsWith(".txt")
      ? "text/plain"
      : "text/html";
  return new Response(body, { status: 200, headers: { "content-type": contentType } });
}

async function collectFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      target.pathname += "/";
      files.push(...await collectFiles(target, extension));
    } else if (entry.name.endsWith(extension)) {
      files.push(target);
    }
  }

  return files;
}

test("server-renders the portfolio home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Make Placid<\/title>/i);
  assert.match(html, />Make Placid<\/a>/);
  assert.match(html, />About &amp; contact<\/a>/);
  assert.equal((html.match(/href="\/projects\/project-\d{2}"/g) ?? []).length, 7);
  assert.match(html, /srcSet="\/images\/responsive\/unsplash\//);
  assert.match(html, /id="home-intro-title">A minimal portfolio for thoughtful creative work\.<\/h1>/);
  assert.equal((html.match(/class="home-project-label"/g) ?? []).length, 7);
  assert.equal((html.match(/class="home-project-subtitle"/g) ?? []).length, 7);
  assert.equal((html.match(/class="home-project-image home-project-image--rollover"/g) ?? []).length, 1);
  assert.match(html, /rel="icon"/);
  assert.match(html, /property="og:image"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders project, about, and not-found routes", async () => {
  const [projectResponse, aboutResponse, notFoundResponse] = await Promise.all([
    render("/projects/project-03"),
    render("/about"),
    render("/404.html"),
  ]);

  assert.equal(projectResponse.status, 200);
  assert.equal(aboutResponse.status, 200);
  assert.equal(notFoundResponse.status, 200);

  const [projectHtml, aboutHtml, notFoundHtml] = await Promise.all([
    projectResponse.text(),
    aboutResponse.text(),
    notFoundResponse.text(),
  ]);

  assert.match(projectHtml, /Project 03 — Complete Case Study/);
  assert.match(projectHtml, /class="video-poster"/);
  assert.match(projectHtml, /ifElv18k2O8/);
  assert.match(projectHtml, /\/images\/unsplash\/xVyR9Tkl23c\.jpg/);
  assert.match(projectHtml, /<h2>Project information<\/h2>/);
  assert.match(projectHtml, /<blockquote>/);
  assert.match(projectHtml, /href="https:\/\/example\.com"/);
  assert.match(projectHtml, /class="project-evidence"/);
  assert.match(projectHtml, /class="media-frame image-row/);
  assert.match(projectHtml, /accessible playback controls/);
  assert.match(projectHtml, /selected detail views/);
  assert.match(projectHtml, /href="\/projects\/project-02"[^>]*>Previous/);
  assert.match(projectHtml, /href="\/projects\/project-04"[^>]*>Next/);
  assert.match(projectHtml, /aria-label="Play I Am Easy To Find, a film by Mike Mills and The National"/);
  assert.doesNotMatch(projectHtml, /youtube-nocookie\.com\/embed/);
  assert.doesNotMatch(projectHtml, /M7lc1UVf-VE|Google Developers/);
  assert.match(aboutHtml, /<button class="site-link" type="button">Close<\/button>/);
  assert.match(aboutHtml, /minimalist portfolio system for designers, artists, photographers, architects, and creative practices/);
  assert.match(aboutHtml, /<span class="hanging-quote">“<\/span>/);
  assert.match(aboutHtml, /<h1 class="visually-hidden">About &amp; contact<\/h1>/);
  assert.match(notFoundHtml, /404 — Page not found\./);
  assert.match(notFoundHtml, /Return to selected projects\./);
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

  assert.match(robots, /Sitemap: https:\/\/maxpfennig\.haus\/make-placid-portfolio\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/maxpfennig\.haus\/make-placid-portfolio\/projects\/project-03<\/loc>/);
});

test("ships a verified and maintainable publication path", async () => {
  const [packageJson, config, basePath, verifier, publishWorkflow, auditWorkflow, changelog] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/base-path.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/verify-static-export.mjs", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/publish-demo.yml", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/dependency-audit.yml", import.meta.url), "utf8"),
    readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"version": "1\.0\.0"/);
  assert.match(packageJson, /"verify:export": "node scripts\/verify-static-export\.mjs"/);
  assert.match(packageJson, /"audit:production"/);
  assert.match(config, /NEXT_PUBLIC_BASE_PATH/);
  assert.match(basePath, /withBasePath/);
  assert.match(verifier, /missing local links or assets/);
  assert.match(publishWorkflow, /actions\/deploy-pages@v4/);
  assert.match(publishWorkflow, /NEXT_PUBLIC_BASE_PATH: \/make-placid-portfolio/);
  assert.match(auditWorkflow, /schedule:/);
  assert.match(changelog, /1\.0\.0 — 2026-08-14/);
  await access(new URL("../public/.nojekyll", import.meta.url));
});

test("keeps configured local media and responsive-image metadata valid", async () => {
  const [projectFiles, manifestSource] = await Promise.all([
    collectFiles(new URL("../content/projects/", import.meta.url), ".md"),
    readFile(new URL("../public/images/responsive/manifest.json", import.meta.url), "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource);

  for (const projectFile of projectFiles) {
    const source = await readFile(projectFile, "utf8");
    const mediaPaths = [...source.matchAll(/(?:src|hoverSrc|poster|socialImage):\s*"(\/[^"]+)"/g)]
      .map((match) => match[1]);

    for (const mediaPath of mediaPaths) {
      await access(new URL("../public" + mediaPath, import.meta.url));
      if (/\.(?:jpe?g|png)$/i.test(mediaPath)) {
        assert.ok(manifest[mediaPath], mediaPath + " should have responsive variants");
      }
    }
  }

  for (const [source, entry] of Object.entries(manifest)) {
    assert.match(entry.sourceHash, /^[a-f0-9]{64}$/, source + " should record its source hash");
    assert.ok(entry.sources.length > 0, source + " should have responsive candidates");
  }
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

  assert.match(page, /getFeaturedProjects\(\)/);
  assert.match(layout, /getSiteConfig\(\)/);
  assert.match(siteConfig, /name: "Make Placid"/);
  assert.match(siteConfig, /homepageTitle:/);
  assert.match(siteConfig, /homepageIntro:/);
  assert.match(siteConfig, /showProjectLabels: true/);
  assert.match(siteConfig, /socialImageAlt:/);
  assert.doesNotMatch(`${page}${layout}${chrome}`, /Make Placid/);
  assert.match(transitionLink, /router\.push\(href\)/);
  assert.doesNotMatch(`${transitionLink}${chrome}`, /location\.assign|window\.location\.assign|history\.back/);
  assert.match(styles, /\.home-grid\s*\{[^}]*padding: var\(--header-height\) var\(--page-gutter\) var\(--rail-height\)/s);
  assert.match(styles, /\.home-intro\s*\{[^}]*position: sticky[^}]*grid-column: 1/s);
  assert.match(styles, /\.home-project-list\s*\{[^}]*grid-column: 2[^}]*padding-top: var\(--homepage-project-start\)/s);
  assert.match(styles, /\.home-project--has-rollover:hover/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*animation: project-page-in/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*padding: var\(--header-height\) var\(--page-gutter\) var\(--rail-height\)/s);
  assert.match(styles, /\.project-navigation\s*\{/);
  assert.match(styles, /\.image-grid\s*\{/);
  assert.match(styles, /\.image-row-track\s*\{/);
  assert.match(styles, /\.html5-banner-frame\s*\{/);
  assert.match(styles, /\.reveal-ready \[data-reveal\]/);
  assert.match(styles, /html:has\(body\.detail-open\),\s*body\.detail-open\s*\{[^}]*overscroll-behavior: none/s);
  assert.match(styles, /\.detail-layer\s*\{[^}]*overscroll-behavior: none/s);
  assert.match(styles, /\.detail-layer:focus\s*\{[^}]*outline: none/s);
  assert.match(styles, /html\.custom-font\s*\{[^}]*font-family: "Portfolio Custom", "Instrument Sans"/s);
  assert.match(layout, /NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT/);
  assert.match(gitignore, /public\/fonts\/portfolio-custom\.woff2/);
  assert.match(envExample, /NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT=false/);
  assert.match(envExample, /NEXT_PUBLIC_SHOW_PROJECT_LABELS=false/);
  assert.match(manifest, /\/images\/responsive\/unsplash\//);
  assert.match(manifest, /"sourceHash": "[a-f0-9]{64}"/);
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
