# Make Placid

Make Placid is a quiet static portfolio template for creative practices that want the work to stay in front.

It is not a CMS, a dashboard, or a design-system showroom. It is a small Next.js export with a deliberate spatial language, Markdown and YAML content, local media, and enough verification to make publishing feel boring in the best possible way.

The template gives you a frame strong enough to keep a portfolio coherent, and simple enough that replacing the work still feels like editing the work.

**[View the demo](https://maxpfennig.haus/make-placid-portfolio/)** / **[View it in use](https://maxpfennig.haus)** / **[Start a new repository](https://github.com/new?template_name=make-placid-portfolio&template_owner=mxpf)**

![Make Placid portfolio example](docs/preview.png)

## What It Protects

A portfolio can become busy for reasons that have very little to do with the work. Make Placid tries to hold a few useful boundaries.

- **The work stays primary.** The interface uses proportion, spacing, type, and motion to create orientation without becoming the subject.
- **Content stays close to the material.** Each project lives in its own folder. The site identity lives in one YAML file. Media paths point to files you can see.
- **The grid does real work.** Desktop keeps a 38/62 relationship between context and work. Smaller screens keep the same ordering logic without pretending the desktop layout still fits.
- **The build is disposable.** The published site is a static export. Generated images can be recreated. Private fonts and local clutter stay outside the repository.
- **The demo remains a demo.** Example copy, Unsplash images, and remote video embeds are there to show the system. They are not meant to become your portfolio by accident.

## What You Get

- A content-driven homepage with optional introduction copy and inline Markdown links
- Curated homepage/project sequencing, with direct-link-only published projects available outside the visible sequence
- Project pages with a fixed desktop summary column and a responsive single-column grid on smaller screens
- Static images, image grids, proportion-aware image rows, mixed-media rows, hosted video, YouTube embeds, and local HTML5 banners
- Captions with inline Markdown, optional project evidence, thumbnail subtitles, focal points, fit, scale, and rollover images
- Desktop image-detail mode with focus restoration, click, Escape, and arrow-key controls
- Previous/next project navigation drawn from the curated project order
- Project-level social images with a site-wide fallback
- Responsive WebP variants generated at build time
- Local font loading, optional private-font override, reduced-motion support, visible focus states, and restrained link interactions
- Static-export verification for routes, local assets, responsive candidates, social cards, and video posters

## Requirements

- [Node.js](https://nodejs.org/) 22.13 or newer
- npm, included with Node.js

## Quick Start

Clone the template, install dependencies, and start the local server:

```bash
git clone https://github.com/mxpf/make-placid-portfolio.git
cd make-placid-portfolio
npm install
npm run dev
```

Open the local URL printed in the terminal. Most portfolio edits happen in `content/` and `public/`.

## Make It Yours

### Set the site identity

Edit `content/site.yml`:

```yaml
name: "Your Name"
description: "Selected design and creative direction."
homepageTitle: "Creative direction and selected work."
homepageIntro: "A concise introduction to the practice and [selected work](https://portfolio.example.com)."
url: "https://portfolio.example.com"
language: "en"
locale: "en_US"
keywords:
  - "design"
  - "portfolio"
email: "studio@example.com"
location: "City, Country"
aboutLabel: "About & contact"
closeLabel: "Close"
projectsLabel: "Selected projects"
showProjectLabels: true
socialImage: "/og.png"
socialImageAlt: "Your Name - selected work"
favicon: "/favicon.png"
appleTouchIcon: "/apple-touch-icon.png"
```

These values feed navigation, homepage copy, metadata, `robots.txt`, `sitemap.xml`, social previews, icons, accessibility labels, and reusable About-page fields.

`homepageIntro` accepts inline Markdown links. Omit both `homepageTitle` and `homepageIntro` if you want a compact homepage that begins with the project list.

### Write the About page

Edit `content/about.md`. These tokens are replaced from `content/site.yml`:

- `{{name}}`
- `{{email}}`
- `{{location}}`

The About page accepts ordinary Markdown: paragraphs, links, lists, and block quotations.

### Replace social and icon images

Replace `public/og.png` with a 1200x630 image for link sharing. If you change the filename, update `socialImage` in `content/site.yml`.

Replace `public/favicon.png` and `public/apple-touch-icon.png` with square brand assets, then update their paths if needed.

Projects can also define their own `socialImage`. Use the same 1200x630 size. A good convention is:

```text
public/social/projects/project-slug.png
```

referenced as:

```yaml
socialImage: "/social/projects/project-slug.png"
```

If a project does not define `socialImage`, its Open Graph and Twitter metadata use the site-wide card.

### Choose typography

The template includes [Instrument Sans](https://github.com/Instrument/instrument-sans) under the SIL Open Font License. Its license lives at `public/fonts/OFL.txt`.

For a privately licensed font, place a regular WOFF2 file here:

```text
public/fonts/portfolio-custom.woff2
```

Then copy the private environment example and enable the custom font:

```bash
cp .env.example .env.local
```

```text
NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT=true
```

Git ignores both `.env.local` and `portfolio-custom.woff2`, so the public template never ships your private font file. Leave the flag `false` to use Instrument Sans.

### Replace the demonstration assets

Keep portfolio assets under `public/`, organized in a way you will still understand later:

```text
public/
  images/
    project-name/
  videos/
    project-name/
  embeds/
    project-name/
```

Project paths begin after `public/`. For example, `public/images/project-name/cover.jpg` becomes `/images/project-name/cover.jpg`.

## Projects

Each project lives in its own folder:

```text
content/projects/
  project-name/
    project.md
```

The folder name becomes the URL slug. A project at `content/projects/exhibition/project.md` appears at `/projects/exhibition/`.

Start with this shape:

```markdown
---
title: "Exhibition Identity"
homepageLabel: "Exhibition"
homepageSubtitle: "Identity and environmental graphics"
seoDescription: "A concise exhibition identity across print and space."
socialImage: "/social/projects/exhibition.png"
order: 1
published: true
featured: true
colorMedia: false
thumbnail:
  src: "/images/exhibition/thumbnail.jpg"
  hoverSrc: "/images/exhibition/thumbnail-hover.jpg"
  alt: "Exhibition poster installed on a concrete wall"
  focalX: 50
  focalY: 42
  fit: "cover"
  scale: 1
evidence:
  role: "Creative direction and design"
  mandate: "Create a recognizable exhibition identity"
  scale: "Print, digital, and environmental applications"
  outcome: "A reusable system for the full exhibition program"
media:
  - kind: image
    id: "poster"
    src: "/images/exhibition/poster.jpg"
    ratio: "4 / 5"
    alt: "Black-and-white exhibition poster"
    caption: "Poster, **offset lithography**, 2026."
    captionPosition: "below"
    detail: true
---

# Exhibition Identity

A concise description of the project, its context, and the work shown.

Additional paragraphs, lists, links, and block quotes appear below the lead media.
```

`order` controls the sequence. `published: false` keeps a project in the repository without generating its page. `featured: false` keeps a published page available by direct link while removing it from the homepage and previous/next navigation.

`homepageLabel`, `homepageSubtitle`, `seoDescription`, and `socialImage` are optional. The homepage label falls back to the project title. Set `colorMedia: true` when a project should keep its original color instead of using the default monochrome treatment.

### Homepage thumbnails

Homepage thumbnails use `--thumbnail-ratio`, which defaults to `1.618 / 1`. A dedicated thumbnail crop usually gives the calmest result.

Use `focalX` and `focalY` to position a cropped image. Both accept values from `0` to `100`, with `50` as the center.

Use `fit: "cover"` or `fit: "contain"` to control cropping, and `scale` for small optical corrections. Add `hoverSrc` for a desktop rollover. On touch devices, the alternate image becomes the stable thumbnail because there is no reliable hover state.

Set `showProjectLabels: true` in `content/site.yml` to show labels and optional subtitles beneath thumbnails. Set it to `false` for an image-only homepage.

For a private labels-on preview without changing content, add this to `.env.local`:

```text
NEXT_PUBLIC_SHOW_PROJECT_LABELS=true
```

## Media

Project galleries support seven media structures. Every top-level item needs a unique `id`. Captions accept inline Markdown and can sit `"above"` or `"below"` the media.

### Image

```yaml
- kind: image
  id: "project-image"
  src: "/images/project/image.jpg"
  ratio: "4 / 5"
  alt: "A concise visual description"
  fit: "cover"
  position: "50% 40%"
  scale: 1
  detail: true
  border: false
  caption: "An optional caption with **inline formatting**."
  captionPosition: "below"
```

Set `detail: false` to keep an image out of the desktop enlargement view. Existing image entries default to `true`.

### Image grid

```yaml
- kind: image-grid
  id: "application-grid"
  ratio: "16 / 10"
  columns: 2
  gap: "2px"
  background: "#f0f0ed"
  border: true
  images:
    - src: "/images/project/application-a.jpg"
      alt: "First application"
      label: "Print"
    - src: "/images/project/application-b.jpg"
      alt: "Second application"
      label: "Digital"
      fit: "contain"
```

Grids keep a fixed outer ratio and equal columns. Each cell can define its own fit, position, scale, and optional label.

### Image row

```yaml
- kind: image-row
  id: "poster-row"
  gap: "24px"
  caption: "A proportion-aware row of related work."
  images:
    - src: "/images/project/poster-a.jpg"
      alt: "First poster"
      width: 1200
      height: 1600
      detail: true
    - src: "/images/project/poster-b.jpg"
      alt: "Second poster"
      width: 1200
      height: 1600
```

Rows use each source's width and height to preserve proportional relationships. On small screens, the row becomes a vertical sequence.

### Mixed-media row

```yaml
- kind: media-row
  id: "process-row"
  gap: "24px"
  items:
    - kind: image
      src: "/images/project/storyboard.jpg"
      alt: "Storyboard sequence"
      width: 16
      height: 9
    - kind: video
      id: "motion-test"
      src: "/videos/project/motion-test.mp4"
      poster: "placeholder"
      ratio: "16 / 9"
      title: "Motion test"
      autoplay: true
      width: 16
      height: 9
```

Mixed rows accept images, hosted videos, and YouTube items. Autoplay video is muted, loops inline, and pauses when visitors request reduced motion.

### Hosted video

```yaml
- kind: video
  id: "hosted-video"
  src: "/videos/project/film.mp4"
  poster: "/images/project/film-poster.jpg"
  ratio: "16 / 9"
  title: "Film title"
  controls: true
  audioControls: true
  caption: "An optional caption."
```

Click-to-play videos reveal browser controls after the poster is selected. Set `controls: true` to use Make Placid's compact play/pause control, and add `audioControls: true` for mute/unmute. Set `autoplay: true` for muted looping playback.

### YouTube

```yaml
- kind: youtube
  id: "youtube-video"
  youtubeId: "VIDEO_ID"
  poster: "/images/project/youtube-poster.jpg"
  ratio: "16 / 9"
  title: "Film title"
  caption: "An optional caption."
```

A custom poster keeps YouTube's interface out of the composition until playback begins. Without one, the privacy-enhanced embed loads immediately.

### HTML5 banner

```yaml
- kind: html5
  id: "campaign-banner"
  src: "/embeds/project-banner/index.html"
  width: 970
  height: 250
  title: "Animated campaign banner"
```

HTML5 media scales a local creative to its configured dimensions inside a sandboxed, non-interactive iframe. Keep the creative and its relative assets together under `public/embeds/`.

## Responsive Images

Source images stay where you put them. During the build, `npm run images` creates optimized WebP candidates at several widths and records dimensions and SHA-256 source hashes in `public/images/responsive/manifest.json`.

Images that have not changed reuse verified output. Changed images regenerate. Orphaned generated variants are removed.

The production build also prunes superseded source images from the export after reading rendered metadata and poster attributes, so video posters and social cards that still appear in HTML remain available in `out/`.

Run image generation manually after adding or replacing source files:

```bash
npm run images
```

Once published, the site does not need a runtime image service or third-party image request.

## Interaction

On desktop:

- Select a homepage image to open its project.
- Select a project image to open the detail view.
- Select the expanded image or press Escape to close it.
- Use the left and right arrow keys to move between detail images.
- Outside detail mode, use the left and right arrow keys or the visible Previous/Next links to move through the curated project sequence.
- Select the site name to return to the homepage.
- Open About and use Close to return to the previous page position.

On mobile, the project gallery remains inline and image-detail mode is disabled.

## Styling

Most visual decisions begin in `app/globals.css`:

```css
:root {
  --page-gutter: 24px;
  --column-gap: 24px;
  --thumbnail-ratio: 1.618 / 1;
  --homepage-project-start: calc(56dvh - var(--header-height));
  --spacing-1: 12px;
  --spacing-2: 24px;
  --spacing-3: 36px;
  --dark: #1c1c1a;
  --light: #f7f6f2;
  --link: #70706c;
}
```

The individual numbers matter less than their relationship. The template uses a 12-pixel base unit, 24-pixel standard spacing, and a few 36-pixel editorial pauses. Keep that rhythm if you want the original density to survive new content.

## Project Structure

```text
app/                  Pages, metadata, and global styles
components/           Navigation, transitions, and project interactions
content/              Site identity, About copy, and project content
lib/content.ts        Content loading and Markdown rendering
public/               Fonts, images, videos, embeds, and social assets
scripts/              Image generation and export verification utilities
tests/                Rendered-route checks
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run images` | Generate responsive WebP image variants |
| `npm run build` | Create the static production export in `out/` |
| `npm run verify:export` | Check the export for missing local routes and assets |
| `npm test` | Build, verify the export, and check rendered routes |
| `npm run lint` | Check source files |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run audit:production` | Audit production dependencies |

Before publishing:

```bash
npm test
npm run lint
npm run typecheck
```

## Before Publishing Your Own Portfolio

- Replace the example name, biography, email address, and project copy.
- Replace or intentionally keep the demonstration images and remote video embeds.
- Replace `public/og.png`, favicon, and Apple touch icon.
- Update `url`, language, locale, keywords, and social-image text in `content/site.yml`.
- Confirm every meaningful image has accurate alternative text.
- Keep third-party media credits current.
- Keep privately licensed fonts in the ignored `portfolio-custom.woff2` slot.
- Run the verification commands.

## Deployment

`npm run build` produces a complete static site in `out/`. That directory can be published with GitHub Pages, Cloudflare Pages, Netlify, Vercel, or another static host.

This repository includes a GitHub Actions workflow that publishes the demo whenever `main` changes. It first tests the ordinary domain-root build, then creates a second export for the repository subpath:

```yaml
NEXT_PUBLIC_BASE_PATH: /make-placid-portfolio
NEXT_PUBLIC_SITE_URL: https://maxpfennig.haus/make-placid-portfolio
```

For your own GitHub Pages project site, update those values in `.github/workflows/publish-demo.yml`, then enable `Settings > Pages > GitHub Actions`.

For a custom domain root, leave `NEXT_PUBLIC_BASE_PATH` empty and set `NEXT_PUBLIC_SITE_URL` to the public origin.

## Licensing

The software is available under the [MIT License](LICENSE). Third-party fonts, photographs, and remote media keep their original licenses or terms; those details are collected in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Instrument Sans is included under the SIL Open Font License 1.1. Unsplash demonstration credits are recorded in `content/image-credits.md`. The optional `portfolio-custom.woff2` file is deliberately excluded from the repository and the MIT-licensed distribution.

## Release Status

Version 1.0.0 established the foundation: static export, project-subpath support, automated demo publishing, dependency checks, and complete demonstration content. See [CHANGELOG.md](CHANGELOG.md) for the release record.
