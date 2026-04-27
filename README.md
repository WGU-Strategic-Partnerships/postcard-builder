# Handoff: WGU Strategic Partnerships — Postcard Builder

## Overview

A self-service template builder used by the WGU Strategic Partnerships team to produce branded 6×6" two-sided postcards for table events (conferences, recruiting fairs, partner meetings). Team members fill in a form on the left, see a live preview on the right, then export to PDF for print or share a deep-linked URL with teammates so they can pick up where the user left off.

The builder enforces brand guardrails — locked logo, headline, palette, pattern, and layout — while exposing only safe content fields (URL, campaign name, picklists for facts/stats/quotes/CTAs, optional uploaded QR image).

It currently runs as a single self-contained HTML file embedded into a SharePoint page via an `<iframe>` pointed at GitHub Pages.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working prototype that uses inline-Babel React via CDN. They show the intended look, content model, and behavior — but they are not production code to deploy as-is.

Your task is to **recreate this design in your target codebase's environment** (likely a React/Next.js or Vue app within WGU's broader web stack) using its established patterns, design tokens, build pipeline, and component library. If no host application exists yet, choose the framework that best fits the team's stack — React is the natural fit given the prototype.

The bundled `Postcard Builder (SharePoint).html` is the inline-everything output — useful as a reference but should not be the deployed artifact in a real codebase.

## Fidelity

**High-fidelity.** The mockups represent the intended final visual design — pixel-perfect colors, typography, spacing, and interaction states. Recreate the UI faithfully using your codebase's design system. Specifically:

- All hex colors are exact and must match.
- Font sizes, line heights, letter spacing should be reproduced exactly.
- The 600×600 px postcard render area is fixed (1px = 0.01 inch at 6×6").
- Layout positions on the postcard (locked artboard) are absolute and must not be made responsive — they are designed for print.

The form panel UI itself is somewhat more flexible — feel free to adapt to your codebase's form components — but match the visual hierarchy and spacing.

---

## Screens / Views

There is one primary view: the **Builder**, a two-column layout.

### Builder Layout

- **Container**: full viewport, `display: grid; grid-template-columns: 460px 1fr; min-height: 100vh;`
- **Left panel** (form): `460px` wide, white background (`#fff`), right border `1px solid #e0e6ee`, `overflow-y: auto`, `height: 100vh`.
- **Right panel** (preview): flexible, `padding: 32px`, background `#f4f6f9`, `overflow-y: auto`.

#### Form panel structure

1. **Sticky header** (top of form):
   - Background `#001731` (WGU midnight)
   - Padding `24px 28px 18px`
   - Title: "Postcard Builder" — Oswald 700, 22px, uppercase, letter-spacing 0.02em, white
   - Subtitle: 12px Jost, color `#BBD0E8`, line-height 1.4

2. **Form sections** — each `padding: 22px 28px 18px`, separated by `1px solid #eef2f6` border-bottom. Each section has a numbered step indicator (`#0070F0` blue circle, 22×22, white digit). Section titles: Oswald 700, 13px, uppercase, letter-spacing 0.16em, color `#0070F0`.

   Sections in order:
   1. Campaign & URL (campaign name input + URL input)
   2. QR Code (toggle: generate-from-URL vs upload image)
   3. Front Subhead (textarea, 140-char limit)
   4. Front CTA (single-select picklist, 5 options)
   5. Stats Strip (multi-select, max 3, ordered)
   6. Fast Facts (multi-select, max 5, ordered)
   7. Pull Quote (toggle: pick from library / write own; if library: single-select; if custom: text + attribution inputs)
   8. Back CTA (single-select picklist, 5 options)
   9. Locked items (read-only list with tooltips explaining why each is locked)

3. **Field components**:
   - **CharCounter** — right-aligned, 11px, color `#A7A7A7`. Color shifts to `#d97706` (warn) at >90% of max, `#dc2626` (over) when exceeded.
   - **PickItem** — see picklists below.
   - **LockedRow** — gray background `#f4f6f9`, padlock icon, "why?" tooltip trigger that reveals an explanation on hover.

4. **Picklists** (PickItem):
   - Container: vertical flex, gap 6px
   - Each item: padding `10px 12px`, border `1px solid #e0e6ee`, border-radius 6px, white bg, cursor pointer
   - Hover: border `#0070F0`, bg `#f7faff`
   - Selected: border `#0070F0`, bg `#eef6ff`, inset shadow
   - Disabled (max selections reached): opacity 0.45, cursor not-allowed
   - Each item has: a custom checkbox (18×18, rounded 4px, blue when checked with white checkmark SVG), text content, and (for multi-select) an order badge (lime `#97E152` circle, 22×22, navy digit) showing display order

#### Preview panel structure

1. **Toolbar** (top): horizontal flex, gap 10px
   - "Save as PDF (print)" button — lime `#97E152` bg, navy text, with print icon
   - "Copy share link" button — blue `#0070F0` bg, white text, with link icon
   - "Reset" button — secondary (white bg, navy text, gray border)
   - Right-aligned text: "6 × 6 in · 600 × 600 px" 11px gray

2. **Help banner**: 12px informational text in light blue box (`bg #eef6ff`, border `1px solid #b8d8fc`), explains how to use the builder.

3. **Preview row**: horizontal flex, gap 32px, justify-content center, flex-wrap allowed.
   - Front side (with label "Front (1A)" above)
   - Back side (with label "Back (1B)" above)
   - Each card: `box-shadow: 0 12px 36px rgba(0,23,49,0.18)`, border-radius 4px, overflow hidden

4. **Toast notification**: appears bottom-center on share-link copy. Navy bg, white text, shadow, 200ms fade-in.

---

### Postcard Front (locked artboard, 600×600 px)

- **Background**: WGU midnight (`#001731`) base
- **Pattern overlay**: `assets/swirl-navy.png`, full-cover, opacity 0.6
- **Gradient overlay**: `linear-gradient(120deg, rgba(0,23,49,0.92) 0%, rgba(0,23,49,0.55) 55%, rgba(0,23,49,0.2) 100%)`
- **Content padding**: 52px all sides
- **Top bar** (flex, justify-between, align flex-start):
  - Left: white WGU wordmark image, 110px wide
  - Right: stacked uppercase eyebrow, "Strategic" / "Partnerships", 10px, lime `#97E152`, letter-spacing 0.26em, weight 700
- **Hero block** (locked text):
  - "Talent.\n[On] [Demand.]" — Oswald 700, 109px, line-height 0.88, white. "On" colored sky `#46B1EF`, "Demand." colored lime `#97E152`. Letter-spacing -0.01em.
  - Optional editable subhead below: 15px Jost, line-height 1.4, color `#BBD0E8`, max-width 360px, margin-top 18px
- **Bottom CTA** (flex, justify-between, align flex-end, gap 20):
  - Left: stacked CTA text (selected from picklist) in Oswald 700 22px white uppercase, then URL in 11px sky `#46B1EF` uppercase letter-spacing 0.14em
  - Right: 96×96 QR code (white modules on midnight bg, 4% padding)
- **Campaign mark**: 8px Jost, color `#BBD0E8`, opacity 0.55, letter-spacing 0.18em uppercase, position absolute bottom 6px right 8px, z-index 50, pointer-events none

### Postcard Back (locked artboard, 600×600 px)

- **Background**: white
- **Top band**: full-width, 64px tall, midnight bg
  - Left: white WGU wordmark image, 76px wide
  - Right: "Fast Facts" — Oswald 700, 18px, lime, uppercase, letter-spacing 0.1em
  - Padding `0 44px`
- **Lime accent bar**: full-width, 3px tall, lime `#97E152`, directly below band (top: 64)
- **Title block** (top: 92, left/right: 44):
  - "Why partner with WGU." — Oswald 700, 34px, navy `#002855`, uppercase, letter-spacing -0.005em, line-height 0.95, max-width 420
  - 42×3 medium-blue (`#0070F0`) accent bar 10px below title
- **Stats strip** (top: 160, only if stats present):
  - 3-column grid (configurable up to 3), gap 10
  - Background `#97E15222` (lime 13% alpha), border `1px solid #97E15266`, padding `12px 14px`
  - Each cell: centered, separated by `1px solid #00285522` right-borders
  - Number: Newsreader 600, 28px, navy, line-height 1, letter-spacing -0.02em
  - Label: 9px Jost, uppercase, letter-spacing 0.2em, navy 75% opacity, weight 600, margin-top 4
- **Facts list** (top: 240 when stats present, else 168):
  - Vertical flex, gap 8
  - Each fact: row, gap 14, align flex-start
    - Number badge "01"–"05" — Oswald 700, 26px, medium-blue `#0070F0`, line-height 0.9, min-width 34, padding-top 1
    - Text — 12.5px Jost, line-height 1.35, navy, weight 500
- **Quote block** (bottom: 110, only if quote present):
  - Border-top `1px solid #00285522`, padding-top 10
  - Layout: flex row, gap 10, align flex-start
  - Open-quote glyph: Newsreader 600, 30px, medium-blue, line-height 0.6, padding-top 8
  - Quote text: Newsreader italic, 12px, line-height 1.35, navy
  - Attribution: 10px, uppercase, letter-spacing 0.12em, medium-blue, weight 600, prefixed with "— ", margin-top 4
- **Bottom CTA bar** (full-width, bottom: 0, midnight bg, padding `14px 44px`):
  - Flex row, gap 16, align center
  - Left: 72×72 QR code (white on midnight)
  - Right: stacked text
    - CTA (selected from picklist) — Oswald 700, 22px, white, uppercase, line-height 0.95, two lines split on ". " (last line colored lime)
    - "Scan · {url}" — 10px Jost, sky `#46B1EF`, uppercase, letter-spacing 0.14em, margin-top 5
- **Campaign mark**: same as front, but color `#002855` (navy)

---

## Interactions & Behavior

### Live preview
Every form change updates the preview immediately (React state, no debounce on preview render itself).

### URL state encoding
On every state change, debounced 300ms, the full state object is JSON-stringified, URI-encoded, base64-encoded, and written to `window.location.hash` as `#s=<encoded>`. On load, the hash is decoded and merged over `DEFAULTS`. This makes every configuration deep-linkable.

### Share link
"Copy share link" button writes `window.location.href` to clipboard, shows a toast: "Share link copied — paste into email or a SharePoint message." Toast auto-dismisses after 2.4s.

### Reset
Confirmation dialog → resets to `DEFAULTS`, clears the hash.

### Picklist limits
- Stats: max 3 selections. Beyond limit, unselected items become disabled.
- Facts: max 5 selections. Same disabled behavior.
- Order badges show the selection order (1, 2, 3...) which determines display order on the postcard.
- CTAs (front, back): single-select radio behavior.

### QR code
- Two modes: **generate from URL** (default) or **upload image**.
- Upload: file input accepts `image/*`, FileReader reads as data URL, stored in state, replaces generated QR.
- Generate: real QR encoder (`qrcode-mini.js`) — encodes UTF-8 byte mode at error correction level M, auto-selects smallest version (1–10) that fits. Returns 2D boolean matrix; rendered as inline SVG with crisp-edges.
- Both front (96×96) and back (72×72) QRs use the same source.

### PDF export (print)
`window.print()`. Print CSS (`@media print`):
- `@page { size: 6in 6in; margin: 0; }`
- Hides form panel, toolbar, help banner, labels, toast
- Forces each preview side to its own page (`page-break-after: always`)
- Each card sized exactly 6in × 6in via inline transform: `.card-frame > div { transform: scale(calc(6in / 600px)); }`
- `print-color-adjust: exact` to preserve background fills (browsers strip them by default)

---

## State Management

State is a single React `useState` object. Initial state is `loadInitialState()` — reads URL hash, falls back to `DEFAULTS`.

### State shape

```js
{
  campaign: string,           // optional, max 50 chars, shown as small mark bottom-right
  subhead: string,            // max 140 chars
  url: string,                // max 80 chars, drives front+back+QR
  qrMode: 'url' | 'image',
  qrImage: string,            // data URL when qrMode='image'
  factIds: string[],          // exactly 5, ordered
  statIds: string[],          // exactly 3, ordered
  quoteId: string,            // single quote ID
  customQuote: boolean,       // if true, use custom fields
  customQuoteText: string,    // max 180
  customQuoteAttribution: string,  // max 60
  frontCtaId: string,
  backCtaId: string,
}
```

### DEFAULTS

```js
{
  campaign: "",
  subhead: "A workforce engine purpose-built for your org — 100% online, competency-based, and accredited.",
  url: "partners.wgu.edu",
  qrMode: "url",
  qrImage: "",
  factIds: ["f1", "f2", "f3", "f4", "f5"],
  statIds: ["s1", "s2", "s3"],
  quoteId: "q1",
  customQuote: false,
  customQuoteText: "",
  customQuoteAttribution: "",
  frontCtaId: "fc1",
  backCtaId: "bc1",
}
```

### Content libraries (from `source/libraries.jsx`)

- **15 facts** (`f1`–`f15`)
- **10 stats** (`s1`–`s10`) — each `{num, label}`
- **10 quotes** (`q1`–`q10`) — each `{text, attribution}`
- **5 front CTAs** (`fc1`–`fc5`) — short action text
- **5 back CTAs** (`bc1`–`bc5`) — two-line text (split on ". ")

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| Midnight | `#001731` | Front bg, back top band, back bottom CTA |
| Navy | `#002855` | All body text, back title |
| Medium Blue | `#0070F0` | Section headers, accents, picklist selection |
| Sky | `#46B1EF` | "On" word, URL eyebrow |
| Lime | `#97E152` | "Demand.", accents, success buttons |
| White | `#FFFFFF` | Front headline, logo |
| Form bg | `#f4f6f9` | Preview panel bg |
| Form border | `#e0e6ee` | Form section dividers |
| Form sub-border | `#eef2f6` | Section internal divider |
| Muted | `#A7A7A7` | Counters, secondary labels |
| Field label | `#264468` | Form field labels |
| Subhead text | `#BBD0E8` | Front subhead, header subtitle |
| Warn | `#d97706` | Counter near limit |
| Over | `#dc2626` | Counter exceeded |

### Typography
- **Display**: Jost, 'Futura PT', Arial, sans-serif (fallback chain)
- **Serif**: Newsreader, 'Rocky', Georgia, serif (used for stat numbers + quote text)
- **Campaign**: Oswald, 'Program Nar OT', Arial, sans-serif (used for hero headline, section headers, CTAs, fact numbers)

Load via Google Fonts: Jost 400/500/600/700, Newsreader 400/500/600 italic, Oswald 400/500/600/700.

### Spacing
- Form section padding: `22px 28px 18px`
- Form header padding: `24px 28px 18px`
- Postcard padding (front): 52px
- Postcard padding (back): 44px horizontal, banded vertically

### Border radius
- Form inputs: 6px
- Picklist items: 6px
- Buttons: 6px
- Card frame (preview): 4px
- Stats strip: 0 (sharp corners — intentional editorial look)

### Shadows
- Card preview: `0 12px 36px rgba(0,23,49,0.18)`
- Toast: `0 4px 16px rgba(0,0,0,0.2)`
- Form input focus: `0 0 0 3px rgba(0,112,240,0.15)`
- Button focus: same as input

---

## Assets

All in `assets/` folder:

- **`swirl-navy.png`** — official WGU Strategic Partnerships swirl pattern, used as front background overlay at 60% opacity. **Locked** — do not allow user to swap.
- **`wgu-wordmark-white.png`** — white-recolored WGU wordmark (derived from `wgu-wordmark.png`), used on both pages over navy. Generated by detecting non-white pixels in the source wordmark and recoloring opaque pixels white with alpha-preserved antialiasing.
- **`wgu-wordmark.png`** — original full-color WGU wordmark (kept for reference; not used in render).

In a production codebase, replace these with the team's official brand asset URLs/CDN paths. Confirm with the WGU brand team that the white-recolored wordmark is acceptable, or request an official white logo from them.

---

## Files

### Prototype source (`source/` in this handoff folder)
- `postcard-render.jsx` — `<PostcardFront>` and `<PostcardBack>` React components, plus `<PostcardQR>` and `<CampaignMark>` helpers. The locked-down artboard renderer.
- `libraries.jsx` — content libraries (facts/stats/quotes/CTAs).
- `qrcode-mini.js` — compact QR encoder (UTF-8 byte mode, EC level M, auto-versioning v1–v10). Public-domain implementation based on the Kazuhiko Arase qrcode-generator algorithm. ~16KB minified.
- `colors_and_type.css` — original WGU brand tokens (font imports + variables).

### Top-level reference files
- `Postcard Builder.html` — the working prototype. Open in any browser to see the design fully working. This is the source of truth for behavior.
- `Postcard Builder (SharePoint).html` — single-file inlined bundle (all assets as data URLs). Currently deployed on GitHub Pages and embedded into SharePoint via iframe.

---

## Recreation Notes for the Implementation

1. **Lock the artboard**: the postcard renderers (`PostcardFront`, `PostcardBack`) take a `data` prop. Do not expose CSS overrides or per-element editing. The team's whole reason for this tool is brand-locked output.

2. **Validate locked content** at the API layer if you persist designs server-side: reject any payload that tries to set logo/headline/pattern/colors.

3. **Real QR**: do not ship the placeholder "stylized random pattern" version. Use a real QR library (e.g. `qrcode` on npm) or port `qrcode-mini.js`. Test by scanning with a phone before launch.

4. **Print export**: the current `window.print()` approach works but depends on the user's browser print settings. For higher fidelity, render to a server-side PDF with Puppeteer or use a print service. Keep the 6×6" page size and the no-margin `@page` rule.

5. **Persist to a backend** (optional but recommended): instead of base64-in-URL, store designs in a database keyed by short ID. URL becomes `/postcards/<id>`. Allows for design history, team libraries, and avoids the 8KB practical URL limit if libraries grow.

6. **Auth**: this currently runs as anonymous-public on GitHub Pages. In production, gate it behind WGU SSO and scope to the Strategic Partnerships team.

7. **Library admin**: add an admin role that can edit the facts/stats/quotes/CTAs libraries without a code deploy. Currently they live in `libraries.jsx`.
