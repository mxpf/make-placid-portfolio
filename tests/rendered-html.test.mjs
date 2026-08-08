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
  const expectedProjectLinks = [
    ["johnson-johnson", "Johnson &amp; Johnson"],
    ["new-york-times", "The New York Times"],
    ["holland-knight", "Holland &amp; Knight"],
    ["npr", "NPR"],
    ["synchrony", "Synchrony"],
    ["sands", "Sands"],
    ["ibm", "IBM"],
    ["amazon", "Amazon"],
    ["times-insider", "Times Insider"],
    ["us-steel", "U. S. Steel"],
    ["caterpillar", "Caterpillar"],
  ];
  assert.equal((html.match(/class="home-project(?: color-media)?(?: home-project--closing)?"/g) ?? []).length, 11);
  let previousLinkIndex = -1;
  for (const [slug, label] of expectedProjectLinks) {
    const linkIndex = html.indexOf(`href="/projects/${slug}"`);
    assert.ok(linkIndex > previousLinkIndex, `${label} should appear in the requested sequence`);
    previousLinkIndex = linkIndex;
  }
  assert.equal((html.match(/src="\/images\/unsplash\//g) ?? []).length, 0);
  assert.match(html, /src="\/images\/responsive\/projects\/jj\/jj-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/hk\/hk-home-984\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/synchrony\/synchrony-home-900\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/ibm\/ibm-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/nyt\/nyt-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/nyt\/nyt-insider-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/npr\/npr-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/sands\/sands-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/amazon\/amazon-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/ussteel\/ussteel-home-1440\.webp"/);
  assert.match(html, /src="\/images\/responsive\/projects\/caterpillar\/caterpillar-home-1440\.webp"/);
  assert.match(html, /class="home-project color-media"/);
  assert.match(html, /srcSet="\/images\/responsive\/projects\//);
  assert.equal((html.match(/class="home-project-label"/g) ?? []).length, 11);
  assert.match(html, /class="home-project color-media home-project--closing"/);
  assert.match(html, /class="home-footer"/);
  assert.match(html, /aria-label="Portfolio footer"/);
  assert.match(html, /href="mailto:maxpfennighaus@gmail\.com"/);
  assert.match(html, /<h1 class="visually-hidden">Selected projects<\/h1>/);
  assert.match(html, /rel="icon"/);
  assert.match(html, /property="og:image"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders project and about routes", async () => {
  const [synchronyResponse, johnsonResponse, hollandKnightResponse, ibmResponse, nytResponse, insiderResponse, nprResponse, sandsResponse, aboutResponse] = await Promise.all([
    render("/projects/synchrony"),
    render("/projects/johnson-johnson"),
    render("/projects/holland-knight"),
    render("/projects/ibm"),
    render("/projects/new-york-times"),
    render("/projects/times-insider"),
    render("/projects/npr"),
    render("/projects/sands"),
    render("/about"),
  ]);

  assert.equal(synchronyResponse.status, 200);
  assert.equal(johnsonResponse.status, 200);
  assert.equal(hollandKnightResponse.status, 200);
  assert.equal(ibmResponse.status, 200);
  assert.equal(nytResponse.status, 200);
  assert.equal(insiderResponse.status, 200);
  assert.equal(nprResponse.status, 200);
  assert.equal(sandsResponse.status, 200);
  assert.equal(aboutResponse.status, 200);

  const [synchronyHtml, johnsonHtml, hollandKnightHtml, ibmHtml, nytHtml, insiderHtml, nprHtml, sandsHtml, aboutHtml] = await Promise.all([
    synchronyResponse.text(),
    johnsonResponse.text(),
    hollandKnightResponse.text(),
    ibmResponse.text(),
    nytResponse.text(),
    insiderResponse.text(),
    nprResponse.text(),
    sandsResponse.text(),
    aboutResponse.text(),
  ]);

  assert.match(synchronyHtml, /Synchrony/);
  assert.match(synchronyHtml, /project-layout color-media/);
  assert.match(synchronyHtml, /synchrony-20\.png/);
  assert.match(synchronyHtml, /The system flexed across enterprise commitments and cultural moments/);
  assert.doesNotMatch(synchronyHtml, /synchrony-(06|07|09|11|14|16|21)\.png/);
  assert.match(nytHtml, /The New York Times/);
  assert.match(nytHtml, /project-layout color-media/);
  assert.match(nytHtml, /nyt-01\.png/);
  assert.match(nytHtml, /nyt-campaign-t\.png/);
  assert.match(nytHtml, /nyt-campaign-products\.png/);
  assert.match(nytHtml, /nyt-international-print\.png/);
  assert.match(nytHtml, /nyt-international-banners\.png/);
  assert.match(nytHtml, /first comprehensive system connecting editorial and marketing expression/);
  assert.match(nytHtml, /surpass one million digital subscribers/);
  assert.doesNotMatch(nytHtml, /nyt-insider(?:-site|-subscription)?\.png/);
  assert.doesNotMatch(nytHtml, /Letter spacing is tight/);
  assert.match(nytHtml, /href="\/projects\/johnson-johnson"[^>]*>Previous/);
  assert.match(nytHtml, /href="\/projects\/holland-knight"[^>]*>Next/);
  assert.match(insiderHtml, /Times Insider/);
  assert.match(insiderHtml, /project-layout color-media/);
  assert.match(insiderHtml, /nyt-insider-launch\.png/);
  assert.match(insiderHtml, /nyt-insider-home\.png/);
  assert.match(insiderHtml, /nyt-insider-site-home\.png/);
  assert.match(insiderHtml, /nyt-insider-subscription-home\.png/);
  assert.match(insiderHtml, /subscription product built around access to the newsroom/);
  assert.match(insiderHtml, /The digital experience brought reporting/);
  assert.match(nprHtml, /Designing public radio for a multi-platform world/);
  assert.match(nprHtml, /more than 250 member stations/);
  assert.match(nprHtml, /designed its logo and identity/);
  assert.match(nprHtml, /npr-one-experience\.png/);
  assert.match(nprHtml, /npr-product-family\.png/);
  assert.match(nprHtml, /npr-lobby-work\.png/);
  assert.doesNotMatch(nprHtml, /npr-ux\.png/);
  assert.doesNotMatch(nprHtml, /npr-lobby\.png/);
  assert.match(nprHtml, /npr-org-desktop\.png/);
  assert.match(nprHtml, /npr-org-tablet\.png/);
  assert.match(nprHtml, /npr-org-mobile\.png/);
  assert.match(nprHtml, /image-grid/);
  assert.match(nprHtml, /The npr\.org rebuild reorganized complex editorial pages/);
  assert.match(nprHtml, /I designed the NPR One mark/);
  assert.doesNotMatch(nprHtml, /ifElv18k2O8|I Am Easy To Find|\/images\/unsplash\//);
  assert.match(sandsHtml, /Two directions for a global ESG reporting system/);
  assert.match(sandsHtml, /Details of Progress/);
  assert.match(sandsHtml, /Places That Thrive/);
  assert.match(sandsHtml, /sands-details-cover\.png/);
  assert.match(sandsHtml, /sands-thrive-impact\.png/);
  assert.equal((sandsHtml.match(/class="media-caption"/g) ?? []).length, 2);
  assert.match(johnsonHtml, /Johnson &amp; Johnson/);
  assert.match(johnsonHtml, /project-layout color-media/);
  assert.match(johnsonHtml, /jj-gif-01\.gif/);
  assert.match(johnsonHtml, /jj-gif-03\.gif/);
  assert.match(johnsonHtml, /jj-video-01\.mp4/);
  assert.match(johnsonHtml, /loop=""/);
  assert.match(johnsonHtml, /muted=""/);
  assert.match(johnsonHtml, /playsInline=""/);
  assert.match(johnsonHtml, /class="video-autoplay-toggle"/);
  assert.match(johnsonHtml, /aria-label="Play Johnson &amp; Johnson brand film"/);
  assert.match(hollandKnightHtml, /Holland &amp; Knight/);
  assert.match(hollandKnightHtml, /hk-16\.png/);
  assert.match(hollandKnightHtml, /The visual language remained recognizable across informal and promotional touchpoints\./);
  assert.match(ibmHtml, /IBM/);
  assert.match(ibmHtml, /project-layout color-media/);
  assert.match(ibmHtml, /ibm-home\.png/);
  assert.match(ibmHtml, /ibm-33\.png/);
  assert.match(ibmHtml, /The interaction model carried into a live executive presentation/);
  assert.doesNotMatch(ibmHtml, /ibm-(01|02|03|06|12|14|16|18|19|20|21|23|24|25|29|32)\.png/);
  assert.match(aboutHtml, />About &amp; contact<\/a>/);
  assert.match(aboutHtml, /senior creative and design leader with more than two decades of experience/);
  assert.match(aboutHtml, /href="\/max-pfennighaus-resume\.pdf"/);
  assert.match(aboutHtml, /mailto:maxpfennighaus@gmail\.com/);
  assert.match(aboutHtml, /<h1 class="visually-hidden">About &amp; contact<\/h1>/);
  assert.ok(aboutHtml.indexOf("currently open") < aboutHtml.indexOf("I work comfortably"));
  assert.ok(aboutHtml.indexOf("LinkedIn") < aboutHtml.indexOf("I work comfortably"));
  assert.match(nytHtml, /<nav class="project-navigation" aria-label="More projects">/);
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
  const [page, layout, chrome, projectExperience, contentLibrary, transitionLink, styles, siteConfig, packageJson, gitignore, envExample, manifest, license, notices] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ProjectExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/content.ts", import.meta.url), "utf8"),
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
  assert.match(siteConfig, /showProjectLabels: true/);
  assert.match(siteConfig, /email: "maxpfennighaus@gmail\.com"/);
  assert.match(siteConfig, /socialImageAlt:/);
  assert.doesNotMatch(`${page}${layout}${chrome}`, /Max Pfennighaus/);
  assert.match(transitionLink, /router\.push\(href\)/);
  assert.match(contentLibrary, /marked\.parseInline/);
  assert.match(contentLibrary, /captionHtml:/);
  assert.match(projectExperience, /dangerouslySetInnerHTML=\{\{ __html: media\.captionHtml \}\}/);
  assert.match(projectExperience, /className="detail-close-control"/);
  assert.match(projectExperience, />\s*Close\s*<\/button>/);
  assert.match(styles, /UntitledSansWeb-RegularItalic\.woff/);
  assert.match(styles, /\.media-caption a\s*\{/);
  assert.doesNotMatch(`${transitionLink}${chrome}`, /location\.assign|window\.location\.assign|history\.back/);
  assert.match(styles, /\.home-grid\s*\{[^}]*padding: var\(--header-height\) 24px var\(--spacing-3\)/s);
  assert.match(styles, /\.home-project--closing\s*\{[^}]*grid-column: 1 \/ -1/s);
  assert.match(styles, /\.home-project--closing \.home-project-media\s*\{[^}]*aspect-ratio: 3 \/ 1/s);
  assert.match(styles, /\.home-footer\s*\{/);
  assert.match(styles, /\.detail-close-control\s*\{[^}]*position: fixed/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*animation: project-page-in/s);
  assert.match(styles, /\.project-layout\s*\{[^}]*padding: var\(--header-height\) 24px 0/s);
  assert.match(styles, /\.project-gallery > \.media-item:last-child\s*\{[^}]*margin-bottom: var\(--spacing-3\)/s);
  assert.match(styles, /\.project-navigation\s*\{[^}]*margin-bottom: var\(--rail-height\)/s);
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
  await access(new URL("../public/max-pfennighaus-resume.pdf", import.meta.url));
  await assert.rejects(access(new URL("../public/fonts/UntitledSansWeb-Regular.woff2", import.meta.url)));
  await assert.rejects(access(new URL("SkeletonPreview.tsx", previewRoot)));
  await assert.rejects(access(new URL("preview.css", previewRoot)));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
