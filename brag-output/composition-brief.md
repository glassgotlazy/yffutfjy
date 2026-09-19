# Hyperframes Composition Brief: Anuansh Tiwari — Portfolio

## Objective
Create a short launch-style brag video for the Anuansh Tiwari research portfolio.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21.0 seconds

## Source Material
- Project root: `/home/user/yffutfjy`
- Primary files read: `index.html`, `assets/css/style.css`, `assets/img/*`
- Product name: Anuansh Tiwari — AI security research
- Tagline / strongest claim: "I research how generative AI breaks — and build tools that don't."
- Key UI to recreate: not recreated — the real screenshots ship as assets
- Copy that must appear verbatim:
  - "I research how generative AI breaks"
  - "— and build tools that don't."
  - "Measurement first."
  - "No server to send it to."

## Creative Direction
- Tone preset: `polished`
- Creative direction: *Receipts.* Claim → number → cut. Every claim is backed by a figure from the page.
- Interpretation: restraint over energy. Long holds, hard cuts, no easing theatrics. The numbers
  are the payoff, so they land alone and hold.
- Hook: the break/build line, unrewritten — it is already the best sentence on the site.
- Outro: "Measurement first." + contact.
- Avoid: generic SaaS language, abstract filler, any visual redesign of the source.

## Visual Identity
Taken from the live stylesheet, not the plan's draft values — the plan quoted `#07080a`, which
predates the monochrome restyle.

- Background: `#060606`
- Text: `#f4f4f4`
- Body: `#8c8c8c`
- Accent: `#c6f24e` (used sparingly, as on the site)
- Display font: Inter Tight (localized to `assets/fonts/`, OFL)
- Mono font: JetBrains Mono (localized, OFL)
- References: square corners, hairline rules, uppercase display type, heavy black ground

## Storyboard
`brag-output/brag-plan.md` is the creative contract.

1. Hook — 2.65s — the two-line claim
2. Identity — 2.95s — ANUANSH TIWARI / AI SECURITY RESEARCH · LUCKNOW, INDIA
3. The experiment — 3.80s — "Weaponizing Generative AI" / n = 880 counting up
4. The review — 3.80s — 75 sources → 51 coded studies / PRISMA-informed
5. The product — 4.40s — real PDF Toolkit UI, cross-cut to GlucoLog, closing line
6. Outro — 3.40s — "Measurement first." + contact

## Implementation notes (post-build)
- Scenes are six sub-compositions under `composition/compositions/`, mounted from the host.
  The first monolithic build tripped `nested_structure_needs_subcomposition` on every scene.
- GSAP is vendored at `assets/gsap.min.js`. The CDN is unreachable from this environment, and a
  render must not depend on the network anyway.
- Fonts are localized from Google Fonts (both OFL) into `assets/fonts/`; a named `font-family`
  without a local `@font-face` is a lint error.
- SFX slot durations are set to each file's exact length — a slot longer than its media is
  silently shortened, and the overlong slots also collided on track 11.

## Audio
- Audio role: sparse professional accents over a warm bed
- Audio arc: bed enters under the hook, holds flat through the numbers, tails out under the outro
- Music: `happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` (bundled with /brag)
- Music treatment: baseline 0.34 via a `data-automation` volume lane; 0.6s fade-in, fade to 0
  across 19.4→21.0 so the final SFX rings over the tail
- Music cue guidance: bundled preset `cues/…vol-9….music-cues.json`
  - beat-lock 1: scene-2 hard cut at **2.65s** (strong cue; plan wanted 2.6)
  - beat-lock 2: scene-5 cross-cut at **15.28s** (beat; plan wanted 15.4)
  - beat-grid: scene-4 sequence at **9.50 / 10.01 / 10.54** (75 → arrow → 51)
  - Deviation: the plan put the scene-1 payoff SFX at 1.5s. Moved to 1.15s so the second line
    holds 1.5s rather than 1.15s — readability wins over the cue, per the brief's own rule.
- Audio-reactive treatment: subtle. Per-frame RMS from `assets/audio-data.json` (632 frames,
  8 bands, 30fps) breathes the shared glow behind the identity card (scene 2) and swells the
  ground behind the product panel at 60% gain (scene 5). Both targets are the one host-level
  `#glow` element: a sub-composition timeline cannot reach across the host boundary, so driving
  a panel inside scene 5 from the main timeline was not available once the scenes became
  sub-compositions. No waveform or equalizer visuals.
- Audio-coupled moments:
  - 1.15s — second line of the hook lands
  - 2.65s — identity cut (beat-locked)
  - 5.60s / 6.60s — card arrives, counter settles
  - 10.01s — arrow draws (beat-grid)
  - 15.28s — product cross-cut (beat-locked)
  - 17.60s — outro
- SFX: `bong_001`, `impactSoft_medium_001`, `click2`, `click_003`, `rollover2`,
  `impactSoft_medium_004` — all CC0 (Kenney), copied into `composition/assets/sfx/`
