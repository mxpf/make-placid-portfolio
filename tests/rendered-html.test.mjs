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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMetaContent(html, attribute, value) {
  const match = html.match(new RegExp(
    `<meta (?=[^>]*\\b${attribute}="${escapeRegExp(value)}")(?=[^>]*\\bcontent="([^"]*)")[^>]*>`,
    "i",
  ));
  assert.ok(match, `Missing ${attribute}="${value}" metadata`);
  return match[1];
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
  assert.doesNotMatch(html, /href="\/projects\/project-08"/);
  assert.match(html, /srcSet="\/images\/responsive\/unsplash\//);
  assert.match(html, /id="home-intro-title">A minimal portfolio for thoughtful creative work\.<\/h1>/);
  assert.match(html, /responsive media, and <a href="https:\/\/nextjs\.org\/docs\/app\/guides\/static-exports">static deployment<\/a>\./);
  assert.match(html, /class="home-project home-project--lead"/);
  assert.equal((html.match(/class="home-project-label"/g) ?? []).length, 7);
  assert.equal((html.match(/class="home-project-subtitle"/g) ?? []).length, 7);
  assert.equal((html.match(/class="home-project-image home-project-image--rollover"/g) ?? []).length, 1);
  assert.match(html, /rel="icon"/);
  assert.match(html, /<html lang="en" class="[^"]*__variable_[a-z0-9]+[^"]*">/);
  assert.match(html, /<link rel="preload" href="\/_next\/static\/media\/[^"]+\.woff2" as="font" crossorigin="" type="font\/woff2"\/>/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /<section class="home-intro" aria-labelledby="home-intro-title">/);
  assert.doesNotMatch(html, /<section class="home-intro"[^>]*data-reveal/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders project, about, and not-found routes", async () => {
  const [projectResponse, fallbackSocialResponse, lastCuratedResponse, directOnlyResponse, aboutResponse, notFoundResponse] = await Promise.all([
    render("/projects/project-03"),
    render("/projects/project-02"),
    render("/projects/project-07"),
    render("/projects/project-08"),
    render("/about"),
    render("/404.html"),
  ]);

  assert.equal(projectResponse.status, 200);
  assert.equal(fallbackSocialResponse.status, 200);
  assert.equal(lastCuratedResponse.status, 200);
  assert.equal(directOnlyResponse.status, 200);
  assert.equal(aboutResponse.status, 200);
  assert.equal(notFoundResponse.status, 200);

  const [projectHtml, fallbackSocialHtml, lastCuratedHtml, directOnlyHtml, aboutHtml, notFoundHtml] = await Promise.all([
    projectResponse.text(),
    fallbackSocialResponse.text(),
    lastCuratedResponse.text(),
    directOnlyResponse.text(),
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
  assert.equal(
    getMetaContent(projectHtml, "property", "og:image"),
    "https://maxpfennig.haus/make-placid-portfolio/social/projects/project-03.png",
  );
  assert.equal(getMetaContent(projectHtml, "property", "og:image:width"), "1200");
  assert.equal(getMetaContent(projectHtml, "property", "og:image:height"), "630");
  assert.equal(getMetaContent(projectHtml, "name", "twitter:image"), "https://maxpfennig.haus/make-placid-portfolio/social/projects/project-03.png");
  assert.equal(getMetaContent(projectHtml, "name", "twitter:image:width"), "1200");
  assert.equal(getMetaContent(projectHtml, "name", "twitter:image:height"), "630");
  assert.equal(
    getMetaContent(fallbackSocialHtml, "property", "og:image"),
    "https://maxpfennig.haus/make-placid-portfolio/og.png",
  );
  assert.equal(getMetaContent(fallbackSocialHtml, "property", "og:image:width"), "1200");
  assert.equal(getMetaContent(fallbackSocialHtml, "property", "og:image:height"), "630");
  assert.equal(getMetaContent(fallbackSocialHtml, "name", "twitter:image"), "https://maxpfennig.haus/make-placid-portfolio/og.png");
  assert.match(lastCuratedHtml, /href="\/projects\/project-06"[^>]*>Previous/);
  assert.doesNotMatch(lastCuratedHtml, /Next —/);
  assert.doesNotMatch(lastCuratedHtml, /href="\/projects\/project-08"/);
  assert.match(directOnlyHtml, /Project 08 — Direct Link/);
  assert.doesNotMatch(directOnlyHtml, /Previous —|Next —/);
  assert.doesNotMatch(directOnlyHtml, /class="project-navigation"/);
  assert.match(projectHtml, /aria-label="Play I Am Easy To Find, a film by Mike Mills and The National"/);
  assert.doesNotMatch(projectHtml, /youtube-nocookie\.com\/embed/);
  assert.doesNotMatch(projectHtml, /M7lc1UVf-VE|Google Developers/);
  assert.match(aboutHtml, /<button class="site-link" type="button">Close<\/button>/);
  assert.match(aboutHtml, /minimalist portfolio system for designers, artists, photographers, architects, and creative practices/);
  assert.match(aboutHtml, /<span class="hanging-quote">“<\/span>/);
  assert.match(aboutHtml, /<h1 class="visually-hidden">About &amp; contact<\/h1>/);
  assert.match(notFoundHtml, /404 — Page not found\./);
  assert.match(notFoundHtml, /Return home\./);
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
  assert.match(sitemap, /<loc>https:\/\/maxpfennig\.haus\/make-placid-portfolio\/projects\/project-08<\/loc>/);
});

test("ships a verified and maintainable publication path", async () => {
  const [packageJson, config, basePath, verifier, pruner, publishWorkflow, auditWorkflow, changelog] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/base-path.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/verify-static-export.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/prune-responsive-source-images.mjs", import.meta.url), "utf8"),
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
  assert.match(verifier, /\(\?:href\|src\|poster\)/);
  assert.match(pruner, /\(\?:content\|poster\)/);
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
    const socialImagePaths = [...source.matchAll(/socialImage:\s*"(\/[^"]+)"/g)]
      .map((match) => match[1]);

    for (const mediaPath of mediaPaths) {
      await access(new URL("../public" + mediaPath, import.meta.url));
      if (mediaPath.startsWith("/images/") && /\.(?:jpe?g|png)$/i.test(mediaPath)) {
        assert.ok(manifest[mediaPath], mediaPath + " should have responsive variants");
      }
    }

    for (const socialImagePath of socialImagePaths) {
      const card = await readFile(new URL("../public" + socialImagePath, import.meta.url));
      assert.equal(card.readUInt32BE(16), 1200, socialImagePath + " should be 1200px wide");
      assert.equal(card.readUInt32BE(20), 630, socialImagePath + " should be 630px tall");
    }
  }

  for (const [source, entry] of Object.entries(manifest)) {
    assert.match(entry.sourceHash, /^[a-f0-9]{64}$/, source + " should record its source hash");
    assert.ok(entry.sources.length > 0, source + " should have responsive candidates");
  }

  const htmlFiles = await collectFiles(new URL("../out/", import.meta.url), ".html");
  const posterReferences = new Set();
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    for (const match of html.matchAll(/poster="([^"]+)"/g)) {
      const posterPath = match[1].split(/[?#]/, 1)[0];
      if (posterPath.startsWith("/")) posterReferences.add(posterPath);
    }
  }

  assert.ok(posterReferences.has("/images/unsplash/h2coDswHOAw.jpg"), "export should keep hosted-video poster sources");
  for (const posterPath of posterReferences) {
    await access(new URL("../out" + posterPath, import.meta.url));
  }
});

test("keeps identity copy in the content layer", async () => {
  const [page, projectPage, layout, chrome, transitionLink, scrollReveal, projectExperience, styles, siteConfig, contentLibrary, packageJson, gitignore, envExample, manifest, license, notices] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/projects/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/TransitionLink.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ScrollReveal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ProjectExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../content/site.yml", import.meta.url), "utf8"),
    readFile(new URL("../lib/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.gitignore", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../public/images/responsive/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../LICENSE", import.meta.url), "utf8"),
    readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getCuratedProjects\(\)/);
  assert.match(projectPage, /getCuratedProjects\(\)/);
  assert.doesNotMatch(`${page}${projectPage}`, /getFeaturedProjects\(\)/);
  assert.match(layout, /getSiteConfig\(\)/);
  assert.match(siteConfig, /name: "Make Placid"/);
  assert.match(siteConfig, /homepageTitle:/);
  assert.match(siteConfig, /homepageIntro:/);
  assert.match(siteConfig, /\[static deployment\]\(https:\/\/nextjs\.org\/docs\/app\/guides\/static-exports\)/);
  assert.match(siteConfig, /showProjectLabels: true/);
  assert.match(siteConfig, /socialImageAlt:/);
  assert.doesNotMatch(`${page}${layout}${chrome}`, /Make Placid/);
  assert.match(transitionLink, /router\.push\(href\)/);
  assert.match(contentLibrary, /getCuratedProjects/);
  assert.match(contentLibrary, /homepageIntroHtml:/);
  assert.doesNotMatch(`${transitionLink}${chrome}`, /location\.assign|window\.location\.assign|history\.back/);
  assert.match(page, /<section className="home-intro" aria-labelledby="home-intro-title">/);
  assert.doesNotMatch(page, /className="home-intro"[^>]*data-reveal/);
  assert.match(styles, /\.home-grid\s*\{[^}]*padding: var\(--header-height\) var\(--page-gutter\) var\(--rail-height\)/s);
  assert.match(styles, /\.home-intro\s*\{[^}]*position: sticky[^}]*grid-column: 1/s);
  assert.match(styles, /\.home-project-list\s*\{[^}]*grid-column: 2[^}]*padding-top: var\(--homepage-project-start\)/s);
  assert.match(styles, /\.home-project--has-rollover:hover/s);
  assert.match(styles, /--homepage-project-start: calc\(56dvh - var\(--header-height\)\)/);
  assert.match(styles, /--reveal-distance: 4px/);
  assert.match(styles, /--reveal-opacity-duration: 180ms/);
  assert.match(styles, /--reveal-movement-duration: 180ms/);
  assert.match(styles, /--reveal-stagger: 20ms/);
  assert.match(scrollReveal, /getPropertyValue\("--reveal-stagger"\)\) \|\| 20/);
  assert.match(styles, /@keyframes homepage-intro-entry-reveal\s*\{[\s\S]*?opacity: 0[\s\S]*?transform: translateY\(var\(--reveal-distance\)\)[\s\S]*?opacity: 1[\s\S]*?transform: translateY\(0\)/s);
  assert.match(styles, /@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\.home-intro h1,\s*\.home-intro p\s*\{[^}]*animation: homepage-intro-entry-reveal var\(--reveal-opacity-duration\) ease-out both/s);
  assert.match(styles, /\.home-intro p\s*\{[^}]*animation-delay: var\(--reveal-stagger\)/s);
  assert.match(styles, /--homepage-lead-opacity-rest: 1/);
  assert.match(styles, /\.home-project--lead \.home-project-image--base\s*\{[^}]*opacity: max\([^}]*var\(--homepage-lead-opacity-rest\)[^}]*var\(--homepage-content-opacity-current/s);
  assert.match(styles, /\.home-project--lead\s*\{[^}]*will-change: opacity, transform[^}]*homepage-lead-opacity-in[^}]*homepage-lead-movement-in/s);
  assert.doesNotMatch(styles, /\.home-project--lead \.home-project-media\s*\{[^}]*homepage-lead-movement-in/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*animation: project-page-in/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*padding: var\(--header-height\) var\(--page-gutter\) 0/s);
  assert.match(styles, /\.project-summary\s*\{[^}]*bottom: 0[^}]*max-height: calc\(100dvh - var\(--header-height\)\)/s);
  assert.match(styles, /body:has\(\.project-layout\) \.bottom-rail\s*\{[^}]*display: none/s);
  assert.match(styles, /\.project-navigation\s*\{/);
  assert.match(styles, /\.image-grid\s*\{/);
  assert.match(styles, /\.image-row-track\s*\{/);
  assert.match(styles, /\.html5-banner-frame\s*\{/);
  assert.match(styles, /\.reveal-ready \[data-reveal\]/);
  assert.match(styles, /html:has\(body\.detail-open\),\s*body\.detail-open\s*\{[^}]*overscroll-behavior: none/s);
  assert.match(styles, /\.detail-layer\s*\{[^}]*inset: var\(--header-height\) 0 0[^}]*overscroll-behavior: none/s);
  assert.match(styles, /\.detail-layer:focus\s*\{[^}]*outline: none/s);
  assert.match(styles, /\.media-caption a,\s*\.home-intro a\s*\{[^}]*text-decoration-line: underline/s);
  assert.match(styles, /\.project-navigation a\s*\{[^}]*text-decoration-color: transparent[^}]*text-decoration-color 180ms ease/s);
  assert.match(styles, /\.project-navigation a:hover\s*\{[^}]*text-decoration-color: color-mix\(in srgb, currentColor 45%, transparent\)/s);
  assert.doesNotMatch(styles, /\.project-navigation a\s*\{[^}]*transform:/s);
  assert.match(layout, /import localFont from "next\/font\/local"/);
  assert.match(layout, /const instrumentSans = localFont/);
  assert.match(layout, /path: "\.\.\/public\/fonts\/InstrumentSans-Regular\.woff2"/);
  assert.match(layout, /variable: "--font-instrument-sans"/);
  assert.match(layout, /fallback: \["Arial", "Helvetica"\]/);
  assert.match(layout, /adjustFontFallback: "Arial"/);
  assert.match(layout, /display: "swap"/);
  assert.match(layout, /preload: true/);
  assert.match(layout, /instrumentSans\.variable/);
  assert.match(layout, /className=\{htmlClassName\}/);
  assert.match(styles, /html\s*\{[^}]*font-family: var\(--font-instrument-sans\), Arial, Helvetica, sans-serif/s);
  assert.match(styles, /html\.custom-font\s*\{[^}]*font-family: "Portfolio Custom", var\(--font-instrument-sans\)/s);
  assert.doesNotMatch(styles, /font-family: "Instrument Sans";[\s\S]*?InstrumentSans-Regular\.woff2/s);
  assert.match(projectExperience, /function VideoControls/);
  assert.equal((projectExperience.match(/<VideoControls/g) ?? []).length, 2);
  assert.equal((projectExperience.match(/className="video-control-group"/g) ?? []).length, 1);
  assert.match(layout, /NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT/);
  assert.match(gitignore, /public\/fonts\/portfolio-custom\.woff2/);
  assert.match(gitignore, /\/tmp\//);
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
