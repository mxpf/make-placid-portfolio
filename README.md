# Make Placid

Make Placid is a quiet foundation for portfolios built around visual work. It is meant for designers, artists, photographers, architects, and creative practices, though the structure is simple enough to bend in other directions.

I made it because a portfolio should not become another piece of software to maintain. The project stays deliberately small: a few visual rules, applied consistently, with the work kept separate from its presentation. There is no dashboard, database, or component library to learn. Most changes happen in Markdown and YAML, close to the material they describe.

**[See the template](https://maxpfennig.haus/make-placid-portfolio/)** · **[See it in use](https://maxpfennig.haus)** · **[Start with this repository](https://github.com/new?template_name=make-placid-portfolio&template_owner=mxpf)**

![Make Placid portfolio example](docs/preview.png)

## The useful constraint

The site is quiet, but not empty. Its character comes from proportion, spacing, typography, and the changing relationship between image and text. The point is not to erase design. It is to make enough thoughtful decisions that the design can stop asking for attention.

- **A small spatial language.** A 12-pixel base unit governs the interface. Margins, gutters, leading, and standard gaps are 24 pixels; a few editorial intervals use 36 pixels.
- **An asymmetric grid with a job to do.** On desktop, a 38/62 split keeps context in the left column and gives the work more room on the right. The same relationship continues through the homepage, projects, About page, and 404.
- **Typography that helps with reading.** The layout favors a comfortable measure, steady leading, balanced wrapping, and desktop-only hanging punctuation and bullets.
- **Motion that explains rather than performs.** Page transitions, link states, image enlargement, and thumbnail rollovers provide orientation without becoming the subject.
- **A structure you can see.** One folder is one project. One file holds the site's identity. You should be able to understand the architecture by looking at it.

## What it does

- Fluid asymmetric desktop and single-column mobile layouts
- Fixed desktop navigation and project description column
- Editorial homepage introduction with featured-project filtering
- Responsive 1.618:1 thumbnails with focal points, fit, scale, subtitles, and rollover images
- Static images, image grids, proportion-aware image rows, mixed-media rows, hosted video, HTML5 banners, and poster-led YouTube embeds
- Inline-formatted captions above or below media
- Optional project evidence for role, mandate, scale, and outcome
- Desktop image-detail view with focus restoration, click, Escape, and arrow-key controls
- Previous/next project navigation with keyboard shortcuts
- Scroll reveals and thumbnail opacity transitions with reduced-motion fallbacks
- Content-driven identity, metadata, About page, and projects
- Configurable project-level search and social metadata
- Responsive WebP image variants generated at build time
- Configurable homepage project labels and subtitles
- Reduced-motion support and visible keyboard focus states
- Local image assets with no runtime image service dependency

## Requirements

- [Node.js](https://nodejs.org/) 22.13 or newer
- npm, included with Node.js

## Installation

Clone the repository, install the dependencies, and start the local development server:

```bash
git clone https://github.com/mxpf/make-placid-portfolio.git
cd make-placid-portfolio
npm install
npm run dev
```

Open the local URL printed in the terminal. Changes to the content, components, and styles appear as you work.

## First-time setup

### 1. Set the portfolio identity

Edit `content/site.yml`:

```yaml
name: "Your Name"
description: "Selected design and creative direction."
homepageTitle: "Creative direction and selected work."
homepageIntro: "A concise introduction to the practice and the work shown here."
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
socialImageAlt: "Your Name — selected work"
favicon: "/favicon.png"
appleTouchIcon: "/apple-touch-icon.png"
```

This is the one file that tells the rest of the site who it belongs to. Its values fill the homepage introduction, navigation, canonical URLs, search metadata, link previews, icons, accessibility labels, and reusable fields on the About page. Omit `homepageTitle` and `homepageIntro` for the compact, project-only homepage. The same configuration also produces `robots.txt` and `sitemap.xml`.

### 2. Write the About page

Edit `content/about.md`. The following tokens are replaced with values from `content/site.yml`:

- `{{name}}`
- `{{email}}`
- `{{location}}`

The page accepts ordinary Markdown: paragraphs, links, lists, and block quotations.

### 3. Set the typography

The template includes [Instrument Sans](https://github.com/Instrument/instrument-sans) under the SIL Open Font License. Its license lives at `public/fonts/OFL.txt`.

For a privately licensed font, place a regular WOFF2 file at:

```text
public/fonts/portfolio-custom.woff2
```

Then create a private environment file from the included example and enable the custom font:

```bash
cp .env.example .env.local
```

```text
NEXT_PUBLIC_PORTFOLIO_CUSTOM_FONT=true
```

Git ignores both `.env.local` and `portfolio-custom.woff2`, so neither becomes part of the public template. Leave the flag `false` to use Instrument Sans without requesting the private font file. If you add another typeface, make sure its license permits web embedding on your deployment.

### 4. Replace the social and icon images

Replace `public/og.png` with a landscape preview image for link sharing. If the filename changes, update `socialImage` in `content/site.yml`.

Replace `public/favicon.png` and `public/apple-touch-icon.png` with your own square brand assets, then update their paths in `content/site.yml` if necessary.

### 5. Replace the demonstration work

Keep portfolio assets under `public/`, organized in whatever way remains understandable to you. For example:

```text
public/
  images/
    project-name/
  videos/
    project-name/
```

Project paths begin after `public/`, so `public/images/project-name/cover.jpg` becomes `/images/project-name/cover.jpg`.

## Working with projects

Each project lives in its own folder:

```text
content/projects/
  project-name/
    project.md
```

The folder name becomes the URL slug. A project stored at `content/projects/exhibition/project.md` appears at `/projects/exhibition`.

A complete project file looks like this:

```markdown
---
title: "Exhibition Identity"
homepageLabel: "Exhibition"
homepageSubtitle: "Identity and environmental graphics"
seoDescription: "A concise exhibition identity across print and space."
socialImage: "/images/exhibition/social.jpg"
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

Exhibition Identity

A concise description of the project, its context, and the work shown.
```

`order` controls the sequence. Set `published: false` to keep a project in the repository without generating its route. Set `featured: false` to leave a published project available by URL while removing it from the homepage and the previous/next sequence.

`homepageLabel`, `homepageSubtitle`, `seoDescription`, and `socialImage` are optional. The label falls back to the full project title. The social image falls back first to the homepage thumbnail, then to the site-wide image. Set `colorMedia: true` when the project should keep its original color instead of using the default monochrome treatment.

### Homepage thumbnails

Homepage thumbnails use the configurable `--thumbnail-ratio`. It defaults to the 1.618:1 proportion used by the reference portfolio. A dedicated crop usually works best, though other proportions can be cropped or contained.

Use `focalX` and `focalY` to position the crop. Both accept values from `0` to `100`, with `50` representing the center.

Use `fit: "cover"` or `fit: "contain"` to control cropping, and `scale` for small optical corrections. Add `hoverSrc` for a desktop rollover; on touch devices, the alternate image becomes the stable thumbnail instead of waiting for a hover that never comes.

Set `showProjectLabels: true` in `content/site.yml` to show labels and optional `homepageSubtitle` values beneath thumbnails. Set it to `false` for an image-only homepage.

When `showProjectLabels` is `false`, add `NEXT_PUBLIC_SHOW_PROJECT_LABELS=true` to `.env.local` for a temporary private preview without changing the content file.

### Project media

Project galleries support seven media structures. Every top-level item needs a unique `id`. Captions accept inline Markdown and can sit `"above"` or `"below"` the media.

#### Image

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

Set `detail: false` to keep an image out of the desktop enlargement view. Existing image entries default to `true`. Use `fit`, `position`, and `scale` for optical adjustments without preparing another source file.

#### Image grid

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

Grids keep a fixed outer ratio and equal columns. Each cell can have its own fit, position, scale, and optional label.

#### Image row

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

Rows use each source's width and height to preserve the relationship between their proportions. On small screens, they settle into a vertical sequence. Individual images can opt into the desktop detail viewer.

#### Mixed-media row

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

Mixed rows accept images, hosted videos, and YouTube items. Autoplay video is muted, loops inline, and pauses when a visitor requests reduced motion.

#### Hosted video

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

Click-to-play videos reveal the browser's native controls after the poster is selected. Set `controls: true` to use Make Placid's compact play/pause control, and add `audioControls: true` for mute/unmute. Set `autoplay: true` for muted looping playback. Autoplay stays off when reduced motion is enabled.

#### YouTube

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

#### HTML5 banner

```yaml
- kind: html5
  id: "campaign-banner"
  src: "/embeds/project-banner/index.html"
  width: 970
  height: 250
  title: "Animated campaign banner"
```

HTML5 media scales a local creative to its configured dimensions inside a sandboxed, non-interactive iframe. Keep the creative and all of its relative assets together under `public/embeds/`.

Ratios use CSS `aspect-ratio` syntax, such as `3 / 2`, `4 / 5`, `1 / 1`, or `16 / 9`.

### Complete demonstration project

`content/projects/project-03/project.md` gathers the core editorial system and several advanced media features into one case study:

- Headings, paragraphs, lists, a block quotation, and an external link
- Project evidence and inline-formatted captions
- Static images and a proportion-aware image row
- Hosted video with a poster and compact controls
- YouTube video with a custom poster
- A thumbnail rollover, subtitle, and project-specific social metadata

Use it to see how the pieces fit together. Replace or remove it before the portfolio becomes your own.

## Responsive images

The source photographs stay where you put them. At build time, a script creates optimized WebP candidates at several widths and records their dimensions and SHA-256 source hash in a generated manifest. Images that have not changed reuse verified output. Changed images regenerate, and orphaned variants are removed. The components use `srcset` and context-specific `sizes` values so the browser can choose an appropriate file for a thumbnail, gallery column, or detail view.

Generate variants manually after adding or replacing images:

```bash
npm run images
```

The same command runs before every production build. Once the site is published, it does not need a runtime image service or third-party image request.

## Interaction

On desktop:

- Select a homepage image to open its project.
- Select a project image to open the full-width detail view.
- Select the expanded image or press Escape to close it.
- Use the left and right arrow keys to move between project images.
- Outside the detail view, use the left and right arrow keys—or the visible Previous/Next links—to move between featured projects.
- Select the name to return to the top of the homepage.
- Open About and use Close to return to the previous page position.

On mobile, the project gallery remains inline and image-detail mode is disabled.

## Styling

Most visual decisions begin in `app/globals.css`. The primary variables are defined at the top of the file:

```css
:root {
  --page-gutter: 24px;
  --column-gap: 24px;
  --thumbnail-ratio: 1.618 / 1;
  --homepage-project-start: calc(68dvh - var(--header-height));
  --spacing-1: 12px;
  --spacing-2: 24px;
  --spacing-3: 36px;
  --dark: #1c1c1a;
  --light: #f7f6f2;
  --link: #70706c;
}
```

Changing these values changes the system everywhere. The individual numbers matter less than the relationships between them; keep those relationships if you want to preserve the original rhythm.

## Project structure

```text
app/                  Pages, metadata, and global styles
components/           Navigation, transitions, and project interactions
content/              Site identity, About copy, and project content
lib/content.ts        Content loading and Markdown rendering
public/               Fonts, images, videos, and social assets
scripts/              Authoring utilities, including image generation
tests/                Rendered-route checks
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run images` | Generate responsive WebP image variants |
| `npm run build` | Create the static production export in `out/` |
| `npm run verify:export` | Check the export for missing local routes and assets |
| `npm test` | Build, verify the export, and check the rendered routes |
| `npm run lint` | Check the source for common issues |
| `npm run typecheck` | Check TypeScript without emitting files |

Before publishing, run the full verification sequence:

```bash
npm test
npm run lint
npm run typecheck
```

The repository also runs a weekly dependency audit. Production dependency failures stop publication. Development-tool findings are reported separately, where they can be handled without quietly taking the demo offline.

## Before it leaves the room

- Replace the example name, biography, email address, and project copy.
- Replace or approve the licensed demonstration images and example video embeds.
- Replace `public/og.png`.
- Replace the favicon and Apple touch icon.
- Update `url`, language, locale, keywords, and social-image text in `content/site.yml`.
- Confirm every meaningful image has accurate alternative text.
- Keep third-party image and media credits current.
- Keep privately licensed fonts in the ignored `portfolio-custom.woff2` slot.
- Run the tests and lint checks.

## Licensing

The software is available under the [MIT License](LICENSE). Third-party fonts, photographs, and remote media keep their original licenses or terms; those details are collected in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Instrument Sans is included under the SIL Open Font License 1.1. The Unsplash demonstration credits are recorded in `content/image-credits.md`. The optional `portfolio-custom.woff2` file is deliberately excluded from the repository and the MIT-licensed distribution.

## Deployment

`npm run build` produces a complete static site in `out/`. That directory can be published with GitHub Pages, Cloudflare Pages, Netlify, Vercel, or another static host. The finished site does not need a server, database, or runtime image service.

The included GitHub Actions workflow publishes the demonstration site whenever `main` changes. It first tests the ordinary domain-root build, then creates a second export for the repository subpath.

For your own GitHub Pages project site, update the two values in `.github/workflows/publish-demo.yml`:

```yaml
NEXT_PUBLIC_BASE_PATH: /your-repository-name
NEXT_PUBLIC_SITE_URL: https://your-account.github.io/your-repository-name
```

Then enable **Settings → Pages → GitHub Actions**. The workflow deploys `out/`. The export verifier stops it if an internal page, image, stylesheet, script, or responsive-image candidate is missing.

When hosting at a custom domain root, leave `NEXT_PUBLIC_BASE_PATH` empty and set `NEXT_PUBLIC_SITE_URL` to the public origin. The same source can live at a root domain, a GitHub project site, or another static host without rewriting its content paths.

## Release status

Version 1.0.0 established the part that should remain boring: a dependable static export, project-subpath support, automated demo publishing, dependency checks, and a complete set of demonstration content. See [CHANGELOG.md](CHANGELOG.md) for the release record.
