# Design QA — 404 page

## Evidence

- Source visual truth: `/Users/mxpf/Documents/Portfolio/.audit/404/reference-project.png`
- Implementation: `/Users/mxpf/Documents/Portfolio/.audit/404/desktop.png`
- State: desktop 404 page, default interaction state
- Viewport: 1052 × 939 CSS pixels
- Source image: 1052 × 939 pixels
- Implementation image: 1052 × 939 pixels
- Device pixel ratio: 2; browser screenshots were normalized to CSS-pixel dimensions

## Full-view comparison

The 404 preserves the source page's fixed two-column header, 24px outer margins, 24px gutter, custom typeface, warm light background, dark text, and bottom-left editorial text placement. The intentionally empty field is consistent with the portfolio's restrained image-and-copy hierarchy.

## Focused comparison

A separate crop was not needed because the only new content—the 404 heading and return link—is fully legible at the full-view scale. Computed layout confirms the copy's lower edge is exactly 24px above the viewport edge.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: custom portfolio font, 18px size, 24px leading, and regular weight match the source system.
- Spacing and layout: desktop grid and header align with the reference; copy bottom gap is exactly 24px.
- Colors and tokens: existing `--light`, `--dark`, and `--link` tokens are reused without drift.
- Image quality: the 404 intentionally contains no imagery or substitute artwork.
- Copy and content: concise, standalone, and consistent with the portfolio's editorial voice.
- Accessibility and behavior: semantic `h1`, labeled region, noindex metadata, visible keyboard focus, reduced-motion inheritance, and a tested return-home path.

## Comparison history

1. Initial pass: bottom spacing measured 48px, inconsistent with the requested 24px rail rhythm.
2. Fix: changed `.not-found-layout` bottom padding to `var(--rail-height)`.
3. Final pass: computed copy bottom gap and layout padding both measure 24px; the return link successfully navigates home.

## Follow-up polish

- P3: capture an additional narrow mobile screenshot if device-specific visual evidence is desired; the existing mobile breakpoint already collapses the page to one column.

final result: passed
