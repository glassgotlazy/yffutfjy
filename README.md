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

One `requestAnimationFrame` loop drives everything scroll-linked (progress bar, nav
condense, scrollspy, parallax, background hue). `IntersectionObserver` drives everything
enter-linked (section reveals, staggered children, counters), with a per-frame sweep as a
safety net so nothing stays hidden after an instant jump — an anchor link, End/Home, a
scrollbar drag, or a reload part-way down the page.

- **Scroll progress** — `--sp` (0→1) is written to `:root` once per frame; the progress
  bar, the nav percentage readout and the background gradient all read from it.
- **Background** — a fixed gradient whose hue and focal points track `--sp` (lime at the
  top → violet at the bottom), plus a canvas node field whose colour and drift also track
  it. Particle count scales with viewport area and drops on coarse-pointer devices; the
  loop stops when the tab is hidden.
- **Cards** — pointer-driven tilt plus a radial spotlight following the cursor. Tilt is
  skipped on touch; the spotlight is not.
- **Counters** — `easeOutExpo` count-up, wired only to the four real figures (53, 880,
  75, 51).

## Reduced motion

`prefers-reduced-motion: reduce` gives a calm fallback: the canvas field is removed, the
hero and reveal animations collapse to a short opacity fade, parallax, tilt and magnetic
buttons are disabled, counters render their final value immediately, and smooth scrolling
is turned off. The preference is also watched at runtime, so flipping it mid-session takes
effect without a reload.

Verified in Chromium at 1440×900 and 390×844, and with `reducedMotion: reduce`: no console
errors, no horizontal overflow, all 44 reveal targets resolve, counters land on their exact
values.

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
