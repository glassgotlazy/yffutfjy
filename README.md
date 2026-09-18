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

- **One `requestAnimationFrame` scroll loop** — momentum scroll, progress bar, nav
  condense, nav pill, section rail, parallax, hero exit, scroll-lit type, background hue
  and field velocity all read from a single pass.
- **One `IntersectionObserver`** — section reveals, staggered children, counters. A
  per-frame sweep backs it up so nothing stays hidden after a jump the observer never
  sees: an anchor link, End/Home, a scrollbar drag, or a reload part-way down.

Nothing on the per-frame path reads layout. `offsetTop`, `scrollHeight` and
`offsetHeight` are measured once into a cache and refreshed only when the page can
change shape — resize, reflow, webfont swap. Reading them per frame while also writing
transforms forces a synchronous layout on every frame.

What's on the page:

- **Momentum scroll** — native scrolling still drives everything (scrollbar, keyboard,
  focus, anchors); `<main>` just lags behind it under a transform. The easing is an
  exponential decay normalised by frame time, so it feels identical at 30, 60 and 120 Hz,
  and the catch-up distance is capped at three viewports so a long anchor jump never
  crawls. Off on touch, which already has better native momentum, and off on reduced
  motion. Because a fixed wrapper breaks the browser's own hash scrolling, every in-page
  link is resolved from cached layout offsets instead.
- **Intro curtain** — once per session, dismissible by click, key, wheel or touch, and
  never shown on reduced motion. It is `display:none` by default, so a page with no JS
  never gets a curtain it has no way to dismiss.
- **Scroll-lit paragraph** — the About lede fills word by word in reading order. One
  variable (a running word count) drives it; each word resolves its own opacity from its
  index, so no DOM is touched per frame.
- **Marquee** — a band of real research topics; the track is duplicated so the loop is
  seamless, and it pauses on hover.
- **Decode on hover** — nav labels scramble and resolve, and always restore their real
  text.
- **Scroll progress** — `--sp` (0→1) is written to `:root` once per frame; the progress
  bar, the nav percentage readout and the background gradient all read from it.
- **Background** — a fixed gradient whose hue and focal points track `--sp` (lime at the
  top → violet at the bottom), three slow-drifting parallaxed aurora orbs, and a live
  backdrop over the top.

  The backdrop is a WebGL2 fragment shader: domain-warped fbm, a palette that travels with
  scroll, a swell under the pointer, a vignette that holds the centre back so body copy
  keeps its contrast, and an ordered dither — dark gradients band visibly at 8 bits without
  one. It renders below device resolution because a full-screen shader is fill-rate bound.

  If WebGL is missing, the context is lost, or the shader turns out to be too slow (a
  software rasteriser with no GPU can be far slower than what it replaced), it hands over
  to a canvas-2D node field that tracks the same `--sp`, speeds up with scroll velocity and
  parts around the pointer. The handover is measured live, not assumed: frame cost is
  sampled every 20 frames, the resolution halves once, and then it steps down entirely.
  `document.documentElement.dataset.bg` reports which renderer is live (`gl`, `2d`,
  `2d-degraded`, `2d-recovered`), which is what the tests assert against.

  Each renderer builds its own canvas. A canvas can only ever hand out one kind of context,
  so a shared one would leave the fallback unable to draw — and the dead renderer's last
  frame frozen on screen.

  The orbs get their softness from multi-stop radial gradients, not `filter: blur()`. A
  90px blur on elements that size cost around 40fps by itself. Each orb is also split in
  two: the outer element carries the scroll parallax, the inner one the drift keyframes,
  because a CSS animation on `transform` outranks an inline style and would otherwise
  silently discard the parallax.
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

Verified in Chromium at 1440×900, at 390×844 with touch, and with `reducedMotion: reduce`:
no console errors, no horizontal overflow, all 57 reveal targets resolve, every heading
renders legibly, counters land on their exact values, the copy buttons work, the intro
clears, the footer is reachable at maximum scroll, nav and rail anchors land on target,
the scroll-lit paragraph fills, and the decode effect restores its labels — in all three
modes.

Frame rate is measured under software rasterisation on a shared container, so absolute
numbers are noisy and well below real hardware. Treat them as **relative** only: compare a
change against the previous commit under identical browser flags, which is what the
verification scripts do. `bisect.js` attributes cost per layer by disabling one at a time —
that is how the `filter: blur()` cost below was found.

## Outstanding TODOs

The page carries visible `TODO` markers everywhere a real artefact is still needed. None of
these are fabricated — fill them in as they exist:

- DOI / proceedings links for each paper
- Live demo URLs for the Offline PDF Toolkit and GlucoLog Pro
- Repo link and live demo URL for the Amity Admissions Assistant
- CV / résumé PDF link in the contact section
- `og:url` and `og:image` in `<head>`, once the site is deployed
- An audio file at `assets/audio/ambient.mp3` (see that folder's README)

## Project images

`assets/img/` holds the project screenshots, converted to WebP at 1100px wide (236KB for
all five). They are held to the page's greyscale with
`filter: grayscale(1) contrast(1.06) brightness(.7)` and bloom into their own colour on
hover, so a teal app and a purple one do not fight the monochrome palette. The two
multi-view projects cross-fade to a second screenshot on hover.

Every image carries descriptive alt text and explicit `width`/`height` to avoid layout
shift, and all but the first are `loading="lazy"`.

## Visual language

Near-monochrome, square-edged, display-scale grotesque on pure black with heavy film
grain — adapted from a reference the author supplied. What was taken: the black-and-grain
ground, the strict greyscale, body copy set at headline sizes with tight leading, grey
text deliberately low-contrast against the background, tiny caps labels with a signal dot
(`●RESEARCH 02`), asymmetric editorial blocks, a credentials stack hung top-right, and no
rounded corners anywhere.

Ambient audio is included, at the author's request, as the corner player — see
`assets/audio/README.md` for where to put the track and how to change the two settings.
There is deliberately **no click-to-enter gate**: browsers refuse to start audio without a
user gesture, and rather than putting up a splash screen whose only job is to harvest one
click, the visitor's first real interaction is used as that gesture. Volume is capped, the
ramp is faded, the choice persists, and with no audio file present the control hides itself.

What was not taken: **full-bleed photography.** Much of the reference's weight comes from
imagery. There is none here yet; see the TODOs.

One deliberate deviation: the reference is strictly monochrome, but the brief called for a
single sharp accent. The lime is kept and demoted to the bullet dots, the active rail mark,
the counters and the tagline. To drop it entirely, set `--accent` to `#ffffff`.

## Fonts

Inter Tight and JetBrains Mono load from Google Fonts, with system fallbacks in the stack.
To self-host, drop the `<link>` in `index.html` and point `--font` and `--font-mono` at
local `@font-face` rules.
