# brag-plan.md

Source: https://portfolio-tau-nine-4wkwkxlnn5.vercel.app/
Invocation: `/brag <url>` — no flags.
Tone: `polished` (research portfolio, not a joke project)
Format: landscape · Duration: 21s · Music: on · SFX: on · Voice: off

---

## Planning rubric

1. **What is it?** A personal research portfolio for Anuansh Tiwari — AI security research, Lucknow.
2. **Who is it for?** Conference contacts, collaborators, internship/recruiting reads.
3. **What is the single strongest claim?** "Claims are cheap. I build the corpus, run the experiment, and publish the numbers."
4. **Hardest number on the page?** n = 880 prompt corpus (first-party safety-filter experiment).
5. **Second-hardest?** 75 sources → 51 coded studies, PRISMA-informed review.
6. **Most visual artifact?** Offline PDF Toolkit UI shot + GlucoLog Pro dashboard shot (both on-page).
7. **Actual copy to reuse?** "I research how generative AI breaks — and build tools that don't." / "Measurement first." / "Privacy as architecture, not as a promise."
8. **What is NOT the story?** CGPA, coursework, the long skills grid, TODO placeholder links. Cut all of it.
9. **Hook?** The break/build line. It is already the best sentence on the site — do not rewrite it.

**Creative angle:** *Receipts.* Every claim on screen is immediately backed by a number pulled from the page. The edit's rhythm is claim → number → cut. No SaaS language, no abstract filler.

---

## Storyboard

| # | t (s) | Scene | On-screen text | Motion / transition | SFX |
|---|---|---|---|---|---|
| 1 | 0.0–2.6 | Hook. Near-black (#07080a), single line, centred. | "I research how generative AI breaks" then, on 1.5s, italic "— and build tools that don't." | Line 1 settles by 0.5s and holds. Line 2 wipes in under it. No motion on the hold. | `interface/bong_001.ogg` at 1.5s |
| 2 | 2.6–5.6 | Reveal. Hero identity. | ANUANSH TIWARI / AI SECURITY RESEARCH · LUCKNOW, INDIA | Hard cut. Name scales in 0.25s, eyebrow fades under it. Hold 2.3s. | `impact/impactSoft_medium_001.ogg` on cut |
| 3 | 5.6–9.4 | Highlight A — the experiment. Paper card (ICETA 2026). | "Weaponizing Generative AI" / **n = 880** / "prompt corpus. Run first-party." | Card slides up; the 880 counts up 0→880 over 0.6s then holds ~2.4s. | `ui/click2.ogg` on card, `interface/click_003.ogg` on counter settle |
| 4 | 9.4–13.2 | Highlight B — the review. | "AI resume screening — critical review" / **75 sources → 51 coded studies** / "PRISMA-informed" | 75 lands, arrow draws, 51 lands 0.4s later. Hold 2.2s. | `ui/rollover2.ogg` on arrow draw |
| 5 | 13.2–17.6 | Highlight C — show the thing. Real product UI. | "Offline PDF Toolkit — **53 tools, client-side**" → "No server to send it to." | PDF-toolkit screenshot enters at slight scale, GlucoLog dashboard cross-cuts at 15.4s. Closing line types over the dimmed UI. | `impact/impactSoft_medium_004.ogg` on cross-cut |
| 6 | 17.6–21.0 | Outro. Back to near-black. | "Measurement first." / anuanshtiwari191@gmail.com · github.com/glassgotlazy | Everything else falls away; the phrase holds 1.6s, contact fades in beneath. Music tail. | `interface/bong_001.ogg` |

**Total: 21.0s** (inside the 15–25s law.)

Readability check: every line holds ≥0.9s settled; the two sentences (scene 1 line 1, scene 5 closer) hold 2.0s+.

---

## Assets from the page

- Hero copy, "Measurement first", "Privacy as architecture, not as a promise"
- `assets/img/pdf-toolkit.webp`, `assets/img/glucolog.webp` (scene 5 — pull these, don't mock them up)
- Palette: background `#07080a`, dark scheme throughout — match it, don't invent a brand

## Music cue guidance

Bundled track: `assets/music/happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` — cue preset ships at `assets/music/cues/happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.json`. Land the scene-2 cut and the scene-5 cross-cut on the nearest strong cue; cue timing is guidance only, readability wins. Audio-reactive treatment: subtle — RMS breathes the hero glow and the product-card presence in scenes 2 and 5. No waveform or equalizer visuals.

## Share copy (draft)

> I research how generative AI breaks — and build tools that don't.
> n = 880 prompt corpus. 51 coded studies. 53 PDF tools that never leave your browser.
> portfolio-tau-nine-4wkwkxlnn5.vercel.app

---

## Resume instructions

In the project repo, with the `brag` and `hyperframes-*` skills installed:

```
/brag --tone polished
```

Drop this file at `brag-output/brag-plan.md` first and tell it to start from Step 3 — inspection and planning are already done.
