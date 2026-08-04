# Minimal Portfolio

A content-led portfolio template for designers, artists, and creative practices. It uses a two-column desktop layout, a focused mobile presentation, and a consistent 24-pixel spatial system.

## Customize the portfolio

Start with these content files:

- `content/site.yml` controls the name, description, contact details, navigation labels, and social-preview image.
- `content/about.md` contains the biography and contact copy. The `{{name}}`, `{{email}}`, and `{{location}}` tokens use values from `site.yml`.
- `content/projects/<slug>/project.md` defines each project. Add or remove folders to change the number of projects.
- `public/og.png` is the social-preview card. Replace it when changing the portfolio identity.

Projects are ordered with `order` and can be hidden with `published: false`. Every project needs an independent homepage thumbnail; thumbnails are always cropped to 3:2 and can be reframed with `focalX` and `focalY` values from 0 to 100.

Project galleries accept three media types:

```yaml
media:
  - kind: image
    id: "project-image"
    src: "/images/project/image.jpg"
    ratio: "4 / 5"
    alt: "A concise description of the image"
    caption: "An optional caption."

  - kind: video
    id: "hosted-video"
    src: "/videos/project/film.mp4"
    poster: "/images/project/film-poster.jpg"
    ratio: "16 / 9"
    title: "Film title"

  - kind: youtube
    id: "youtube-video"
    youtubeId: "VIDEO_ID"
    poster: "/images/project/youtube-poster.jpg"
    ratio: "16 / 9"
    title: "Film title"
```

Store local images and videos under `public/`. The included Unsplash placeholders are documented in `content/image-credits.md` and should be replaced with final work before publishing a real portfolio.

## Behavior

On desktop, the name and About link stay fixed while the portfolio scrolls. Project descriptions remain in the left column and media scrolls in the right. Selecting an image opens the full-width detail view; click it or press Escape to close, and use the left and right arrow keys to move through images.

On mobile, projects use a single-column layout and the desktop image-detail mode is disabled. Native video and YouTube media begin from a poster image and play only after the visitor chooses to start them.

## Run locally

Node.js 22.13 or newer is required.

```bash
npm install
npm run dev
```

Use `npm run build` to create a production build, `npm test` to verify rendered routes, and `npm run lint` to check the source.
