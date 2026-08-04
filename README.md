# Minimal Portfolio

An editorial portfolio template for designers, artists, photographers, architects, and creative practices.

The project is intentionally small. Its structure follows the visual system: a limited set of rules, applied consistently, with content kept separate from presentation. There is no dashboard, database, or component library to learn. Most portfolio updates happen in Markdown and YAML.

## Design philosophy

Minimalism here means clarity, not absence. The design creates rhythm through proportion, spacing, typography, and the relationship between image and text.

- **One spatial language.** A 12-pixel base unit governs the interface. Margins, gutters, leading, and standard gaps are 24 pixels; selected editorial intervals use 36 pixels.
- **Two columns, deliberately used.** On desktop, the project description remains anchored in the left column while the work scrolls in the right. The homepage uses the same grid without adding unnecessary navigation or decoration.
- **Images retain their character.** Homepage thumbnails use a consistent 3:2 crop for rhythm. Project galleries accept varied proportions, allowing each asset to determine its own presence.
- **Typography behaves editorially.** The layout favors readable measure, stable leading, balanced wrapping, and desktop-only hanging punctuation and bullets.
- **Motion remains quiet.** Page transitions, link states, image enlargement, and thumbnail rollovers provide orientation without becoming the subject.
- **Mobile is its own mode.** The layout becomes a direct single-column sequence. Desktop image-detail behavior is removed rather than compressed into an awkward touch interaction.
- **The content model stays visible.** One folder equals one project. One file contains the site's identity. The architecture is easy to understand by looking at it.

## Features

- Fluid two-column desktop and single-column mobile layouts
- Fixed desktop navigation and project description column
- Strict 3:2 homepage thumbnails with adjustable focal points
- Mixed-ratio project galleries
- Static images, hosted video, and poster-led YouTube embeds
- Optional image and video captions
- Desktop image-detail view with click, Escape, and arrow-key controls
- Subtle homepage image zoom on hover
- Content-driven identity, metadata, About page, and projects
- Reduced-motion support and visible keyboard focus states
- Local image assets with no runtime image service dependency

## Requirements

- [Node.js](https://nodejs.org/) 22.13 or newer
- npm, included with Node.js

## Installation

Clone the repository, install its dependencies, and start the local development server:

```bash
git clone <repository-url>
cd minimal-portfolio
npm install
npm run dev
```

Open the local URL printed in the terminal. Changes to content, components, and styles update during development.

## First-time setup

### 1. Set the portfolio identity

Edit `content/site.yml`:

```yaml
name: "Your Name"
description: "Selected design and creative direction."
email: "studio@example.com"
location: "City, Country"
aboutLabel: "About & contact"
closeLabel: "Close"
projectsLabel: "Selected projects"
socialImage: "/og.png"
```

These values populate the navigation, page metadata, accessibility labels, and reusable fields on the About page.

### 2. Write the About page

Edit `content/about.md`. The following tokens are replaced with values from `content/site.yml`:

- `{{name}}`
- `{{email}}`
- `{{location}}`

Standard Markdown is supported, including paragraphs, links, lists, and block quotations.

### 3. Replace the social image

Replace `public/og.png` with a landscape preview image for link sharing. If the filename changes, update `socialImage` in `content/site.yml`.

### 4. Replace the placeholder work

Store portfolio assets under `public/`, organized however you prefer. For example:

```text
public/
  images/
    project-name/
  videos/
    project-name/
```

Paths in project files begin at `public/`, so `public/images/project-name/cover.jpg` becomes `/images/project-name/cover.jpg`.

## Working with projects

Each project lives in its own folder:

```text
content/projects/
  project-name/
    project.md
```

The folder name becomes the URL slug. A project at `content/projects/exhibition/project.md` appears at `/projects/exhibition`.

A complete project file looks like this:

```markdown
---
title: "Exhibition Identity"
order: 1
published: true
thumbnail:
  src: "/images/exhibition/thumbnail.jpg"
  alt: "Exhibition poster installed on a concrete wall"
  focalX: 50
  focalY: 42
media:
  - kind: image
    id: "poster"
    src: "/images/exhibition/poster.jpg"
    ratio: "4 / 5"
    alt: "Black-and-white exhibition poster"
    caption: "Poster, offset lithography, 2026."
---

Exhibition Identity

A concise description of the project, its context, and the work shown.
```

Use `order` to control homepage position. Set `published: false` to keep a project in the repository without displaying it on the site.

### Homepage thumbnails

Homepage thumbnails are always displayed at 3:2. Supply a dedicated 3:2 image when possible; other proportions are cropped automatically.

Use `focalX` and `focalY` to position the crop. Both accept values from `0` to `100`, with `50` representing the center.

### Project media

Project galleries support three media types.

#### Image

```yaml
- kind: image
  id: "project-image"
  src: "/images/project/image.jpg"
  ratio: "4 / 5"
  alt: "A concise visual description"
  caption: "An optional caption."
```

#### Hosted video

```yaml
- kind: video
  id: "hosted-video"
  src: "/videos/project/film.mp4"
  poster: "/images/project/film-poster.jpg"
  ratio: "16 / 9"
  title: "Film title"
  caption: "An optional caption."
```

Hosted videos remain paused until selected and use a minimal play symbol over the poster image.

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

The custom poster keeps YouTube chrome out of the composition until playback begins. If no poster is provided, the standard embed presentation is used.

Ratios use CSS aspect-ratio syntax, such as `3 / 2`, `4 / 5`, `1 / 1`, or `16 / 9`. Captions are optional. When present, the layout applies the design's larger caption interval automatically.

## Interaction

On desktop:

- Select a homepage image to open its project.
- Select a project image to open the full-width detail view.
- Select the expanded image or press Escape to close it.
- Use the left and right arrow keys to move between project images.
- Select the name to return to the top of the homepage.
- Open About and use Close to return to the previous page position.

On mobile, the project gallery remains inline and image-detail mode is disabled.

## Styling

Global design tokens and layout rules live in `app/globals.css`. The primary variables are defined at the top of the file:

```css
:root {
  --spacing-1: 12px;
  --spacing-2: 24px;
  --spacing-3: 36px;
  --dark: #1c1c1a;
  --light: #f7f6f2;
  --link: #70706c;
}
```

Changing these values updates the system globally. Preserve the relationships between them if you want to retain the original rhythm.

## Project structure

```text
app/                  Pages, metadata, and global styles
components/           Navigation, transitions, and project interactions
content/              Site identity, About copy, and project content
lib/content.ts        Content loading and Markdown rendering
public/               Fonts, images, videos, and social assets
tests/                Rendered-route checks
.openai/hosting.json  OpenAI Sites configuration
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build locally |
| `npm test` | Build and verify the rendered routes |
| `npm run lint` | Check the source for common issues |

Run the full verification sequence before publishing:

```bash
npm test
npm run lint
```

## Publishing checklist

- Replace the example name, biography, email address, and project copy.
- Replace the placeholder Unsplash images and example video embeds.
- Replace `public/og.png`.
- Confirm every meaningful image has accurate alternative text.
- Keep third-party image and media credits current.
- Confirm that your font license permits redistribution before making the repository public, or replace the bundled font with one you can distribute.
- Choose and add an open-source license if others should be permitted to reuse the code.
- Run the tests and lint checks.

The included Unsplash placeholder credits are recorded in `content/image-credits.md`.

## Deployment

The project uses [vinext](https://github.com/cloudflare/vinext) and produces a Cloudflare Worker-compatible build. It can be published directly with OpenAI Sites through the included `.openai/hosting.json` configuration.

For another hosting provider, preserve the existing build process or adapt the generated Worker output to that provider's Cloudflare-compatible deployment workflow.
