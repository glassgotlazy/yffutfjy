# Anuansh Tiwari — portfolio

Single-page, scroll-driven personal site. Static HTML, CSS and vanilla JS — no build
step, no framework, no dependencies. Open `index.html` or serve the folder:

```sh
python3 -m http.server 8000
```

## Layout

```
index.html            all markup, one page
assets/css/style.css  tokens, layout, every transition and keyframe
assets/js/main.js     the motion layer
```

## Motion

Two engines drive everything, so nothing competes for frames:

- **One `requestAnimationFrame` scroll loop** — progress bar, nav condense, nav pill,
  section rail, parallax, hero exit, background hue and field velocity all read from a
  single pass.
- **One `IntersectionObserver`** — section reveals, staggered children, counters. A
  per-frame sweep backs it up so nothing stays hidden after a jump the observer never
  sees: an anchor link, End/Home, a scrollbar drag, or a reload part-way down.

What's on the page:

- **Scroll progress** — `--sp` (0→1) is written to `:root` once per frame; the progress
  bar, the nav percentage readout and the background gradient all read from it.
- **Background** — a fixed gradient whose hue and focal points track `--sp` (lime at the
  top → violet at the bottom), three slow-drifting parallaxed aurora orbs, and a canvas
  node field whose colour tracks `--sp` and whose drift speeds up with scroll velocity.
  Particle count scales with viewport area, drops on coarse-pointer devices, and the loop
  stops when the tab is hidden.
- **Split text** — headings split into words (mask wipe from below) or characters (rise,
  unblur, settle out of depth). The hero name then takes one light sweep across its
  letters. Real spaces are preserved between word spans, so headings still copy and read
  correctly.
- **Nav** — one pill slides and resizes between links rather than each link carrying its
  own chip; hover borrows it, leaving returns it to the active section.
- **Section rail** — a fixed set of marks on the right, the active one widening to the
  accent; labels fade in on hover.
- **Cards** — pointer tilt (softer on the smaller cards), a radial spotlight fill, and a
  1px border lit by a gradient that follows the pointer.
- **Cursor** — a soft light trails the pointer and brightens over interactive elements.
  It uses `mix-blend-mode: screen`, so it can only ever brighten, never dim text, and the
  native cursor is never hidden — nothing is lost if it never starts.
- **Counters** — `easeOutExpo` count-up with a glow while running, wired only to the four
  real figures (53, 880, 75, 51).
- **Contact** — copy-to-clipboard buttons with a morphing check and a toast, falling back
  to a selection-based copy where the clipboard API is blocked.

## Reduced motion

`prefers-reduced-motion: reduce` gives a calm fallback: the canvas field and cursor glow
are removed, orbs stop drifting, hero and reveal animations collapse to a short opacity
fade, split text renders in place, parallax / tilt / magnetics / hero exit are disabled,
counters render their final value immediately, and smooth scrolling is off. The border
glow stays — it is light, not movement. The preference is watched at runtime, so flipping
it mid-session takes effect without a reload.

Verified in Chromium at 1440×900 and 390×844, and with `reducedMotion: reduce`: no console
errors, no horizontal overflow, all 58 reveal targets resolve, all 56 staggered chips land
at full opacity, every heading renders legibly, counters land on their exact values, and
the copy buttons work in all three modes.

## Outstanding TODOs

The page carries visible `TODO` markers everywhere a real artefact is still needed. None of
these are fabricated — fill them in as they exist:

- DOI / proceedings links for each paper
- Live demo URLs and repo links for each project
- Project screenshots (the striped placeholders in `.project__shot`)
- CV / résumé PDF link in the contact section
- `og:url` and `og:image` in `<head>`, once the site is deployed

## Fonts

Space Grotesk, Inter and JetBrains Mono load from Google Fonts, with system fallbacks in
the stack. To self-host, drop the `<link>` in `index.html` and point `--font-display`,
`--font-body` and `--font-mono` at local `@font-face` rules.
