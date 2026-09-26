# Make Placid Core

This package is the versioned foundation for Make Placid implementations.

It currently establishes the semantic visual contract used by the demo and
downstream portfolios. Future releases will add the shared content, media, and
static-export modules. Implementations should set `--ground`, `--ink`,
`--body-ink`, `--quiet-ink`, `--link-ink`, and `--focus-ink`; component styles
consume the semantic names rather than a site's raw colors.

The default values use the light roles from the
[Thinkinghaus palette](https://keeping.haus/thinkinghaus-palette/).
