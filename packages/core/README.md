# Make Placid Core

This package is the versioned foundation for Make Placid implementations.

It currently establishes the semantic visual contract used by the demo and
downstream portfolios. Future releases will add the shared content, media, and
static-export modules. Implementations should set `--ground`, `--ink`,
`--body-ink`, `--quiet-ink`, `--link-ink`, and `--focus-ink`; component styles
consume the semantic names rather than a site's raw colors.

## Governing palette

Make Placid uses [Thinkinghaus palette v0.6](https://keeping.haus/thinkinghaus-palette/) as its governing color reference. [`thinkinghaus-v0.6.css`](thinkinghaus-v0.6.css) and [`thinkinghaus-v0.6.tokens.json`](thinkinghaus-v0.6.tokens.json) are pinned byte-for-byte from upstream commit [`7ac354f`](https://github.com/mxpf/thinkinghaus-palette/tree/7ac354fa15ac0798db84ed4291215d8a44f35947), the same release that governs the upstream Figma export. Builds never depend on GitHub at runtime; package consumers can import the stable `./thinkinghaus.css` and `./thinkinghaus.tokens.json` export paths.

The governing anchors are ivory/neutral-0 `#F4EDDF`, body/neutral-400 `#AFADA6`, taupe/neutral-500 `#9C9281`, and charcoal/neutral-1000 `#1C1811`. Components use semantic roles through [`tokens.css`](tokens.css): standard links match body copy (`#474135` light / `#AFADA6` dark) and rely on underlining for recognition; ochre focus and warning remain `#785800` / `#B79142`, moss success `#506624` / `#97AA74`, clay error `#9B4127` / `#D2836C`, and slate information `#446081` / `#8CA3C0`.

Use `600` accents on light backgrounds and `400` accents on dark backgrounds. Keep faint roles decorative. Use dedicated fill tokens together with their `on-*-fill` foregrounds; do not turn text-accent colors into arbitrary button fills. New controls should follow the [Thinkinghaus UI guidance](https://keeping.haus/thinkinghaus-ui/).
