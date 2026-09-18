# Ambient audio

Drop your track here as `ambient.mp3` (and optionally `ambient.ogg` /
`ambient.wav` — the page lists all three as `<source>` and the browser picks
whichever it can play).

Until a playable file exists, the player control in the bottom-right corner
hides itself rather than showing a button that does nothing. Nothing else on
the page depends on it.

Two settings, both in `assets/js/main.js` in the `sound` module:

| Constant | Default | Meaning |
|---|---|---|
| `VOLUME` | `0.32` | playback ceiling — deliberately not full volume |
| `START_MUTED` | `false` | set `true` to stay silent until the visitor asks for sound |

The visitor's choice is stored in `localStorage` under `at-sound`, so once
someone mutes it, it stays muted on their next visit.

## Why there is no click-to-enter gate

Browsers refuse to start audio without a user gesture. Sites that want sound
playing immediately usually solve this with a splash screen that exists only
to harvest one click. Instead, the first real interaction on the page —
pointer, key, wheel or touch — is used as that gesture, so the content is
never held behind a wall. Verified against Chromium's default autoplay policy,
not just a permissive test flag.

Keep the file small. A visitor on mobile data pays for it, so `preload` is set
to `none` and nothing is fetched until sound is actually requested.
