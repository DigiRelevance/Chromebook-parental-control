# SCOUT brand system

**SCOUT** — **S**elf-hosted **C**hromeOS **O**versight & **U**sage **T**racker for the family.
Tagline: *Your rules, kept at home.* Alternate: *Screen time, set at home.* /
*Parental controls that never leave the house.*

Round one of the brand system (v0.1). Source designs: the "SCOUT brand system
and store assets" canvas; the files here are what the product and the store
listing actually use.

## The idea

Paper, ink and brass. Stationery and a well-made notebook, not a security
dashboard. We are **calm, fair, at home, in the parent's hands**. We are never
gamified, corporate-security, nanny-cam or childish: no padlocks, eyes, radar
sweeps or red alert badges.

- **Shape.** 2–3 px corner radii. Nothing pill-shaped.
- **Colour.** Warm neutrals and one metallic accent, used once per surface.
- **Type.** Serif headlines, sans body, mono for codes.
- **Space.** Generous margins. One message per surface.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| Paper | `#f7f4ee` | Page background |
| Paper 2 | `#efeadd` | Cards, chips, subtle fills |
| Card | `#fffdf9` | Raised surfaces |
| Line | `#d9d2c2` | Borders, dividers |
| Ink | `#22201c` | Primary text (14.8:1 on Paper) |
| Ink soft | `#5c574d` | Secondary text (6.5:1 on Paper) |
| Brass | `#8a6d2f` | Accent, buttons, the mark (white text 4.9:1) |
| Brass soft | `#b79a55` | Highlights, never under text |

Status colours, product UI only: OK `#3d7a4f`, Warn `#a6700f`, Bad `#a1352b`.

Rules: brass text on Paper is 4.4:1, so brass is never a text colour. Warn on
Paper is 3.9:1: fills and large numerals only. No red anywhere in icons or tiles.
These are the `--paper`, `--ink`, `--brass`… tokens in `web/src/style.css`,
`extension/popup.html` and `extension/pages/blocked.html`.

## Type

Three free Google Fonts, the same three the console and extension use.

- **Newsreader** (serif) for headlines and the wordmark. Medium 500 for names
  and captions, Regular 400 for taglines. Tight tracking above 48 px. Sentence
  case, no full stop on captions.
- **Archivo** (sans) for body and UI. Regular 400 body, Semibold 600 labels.
  Small labels uppercase with 0.08 em tracking.
- **IBM Plex Mono** for codes: pairing codes (`KTRM-XPBD`), times
  (`08:00–20:00`), hex values. Never for sentences.

The wordmark is the word SCOUT set in Newsreader Medium, letter-spacing −0.02 em
above 48 px. There is no separate logotype file.

## The mark

Direction B, "Hours": allowed hours on a clock face. Brass disc, paper hands,
the quarter between the hands cut out (transparent). No letters, no gradients.

| File | Size | Notes |
| --- | --- | --- |
| `mark.svg` | 48 px and up | Full mark with centre dot |
| `mark-32.svg` | 32 px | Centre dot simplified |
| `mark-16.svg` | 16 px | Brass alone, hands dropped; the cut-out carries the idea |
| `mark-home.svg` | any | Direction A, "Home": paper house on the brass square. Kept as the alternative; not used by the product |

Rendered PNGs for Chrome live in `extension/icons/icon{16,32,48,128}.png` and
the console favicon is `web/public/favicon.svg`. On the dark toolbar bare brass
is 3.3:1, which is why the 16 px version is a solid shape with no paper detail.

## Lock-page illustration

`lock-illustration.svg` (460×320): the mark resting for the night under a
crescent moon, brass soft for moon and stars, line colour for the ground. Used
inline on `extension/pages/blocked.html`. The lock page gives *a clear reason,
not a scary error*.

## Store and social assets

| File | Size | Where it goes |
| --- | --- | --- |
| `store/tile-small-paper.png` | 440×280 | Chrome Web Store small promo tile |
| `store/tile-small-brass.png` | 440×280 | Chrome Web Store small promo tile (alternate) |
| `store/marquee.png` | 1400×560 | Chrome Web Store marquee tile |
| `store/social-preview.png` | 1280×640 | GitHub → Settings → General → Social preview |

Store screenshots (1280×800) are captured from the real product, not drawn:
popup, lock page, policy editor, devices, usage. Copy for the lock-page frame:
"A clear reason, not a scary error".

## Regenerating

```
npm run brand:assets     # needs Playwright; tiles fetch the three Google Fonts
```

Edit the SVGs here, run the script, commit the PNGs it rewrites.
