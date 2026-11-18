---
name: Fimrash Logistics Services
description: Same-day landmark-to-landmark motorcycle courier in Kano, dressed in Kofar Mata indigo cloth.
colors:
  pit: "#0b1240"
  indigo: "#14215c"
  indigo-dip: "#1b2e7a"
  indigo-first-dip: "#2c47a8"
  wash: "#8fa8e8"
  mist: "#c9d3f2"
  cotton: "#f1eadb"
  cotton-shade: "#e6dcc6"
  cotton-bright: "#fffaf0"
  signal-orange: "#f28c28"
  signal-orange-lit: "#f59c45"
  ink: "#0e1745"
  ink-soft: "#3a4677"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 6.2vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  display-hausa:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 4.9vw, 4.4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.5rem)"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1, 'lnum' 1"
  lede:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.01em"
rounded:
  digit: "0.5rem"
  field: "0.75rem"
  button: "0.85rem"
  tile: "1rem"
  card: "1.1rem"
  strip: "1.2rem"
  swatch: "1.4rem"
  band: "1.6rem"
  pill: "9999px"
spacing:
  gutter-phone: "16px"
  gutter: "24px"
  panel-pad: "20px"
  panel-pad-wide: "28px"
  band-y: "80px"
  band-y-wide: "112px"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.pit}"
    rounded: "{rounded.button}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-orange-lit}"
  button-cotton:
    backgroundColor: "{colors.cotton}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-cotton-hover:
    backgroundColor: "#fff8ea"
  button-ghost:
    textColor: "{colors.cotton}"
    rounded: "{rounded.button}"
    padding: "0 1.5rem"
    height: "3.25rem"
  field:
    backgroundColor: "{colors.cotton-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 2.6rem 0 1rem"
    height: "3.4rem"
  field-dark:
    backgroundColor: "rgba(11, 18, 64, 0.55)"
    textColor: "{colors.cotton}"
    rounded: "{rounded.field}"
    padding: "0 1rem"
    height: "3.4rem"
  booking-swatch:
    backgroundColor: "{colors.cotton}"
    textColor: "{colors.ink}"
    rounded: "{rounded.swatch}"
    padding: "28px"
  track-strip:
    backgroundColor: "{colors.pit}"
    textColor: "{colors.cotton}"
    rounded: "{rounded.strip}"
    padding: "24px"
  language-toggle:
    backgroundColor: "rgba(11, 18, 64, 0.55)"
    textColor: "{colors.mist}"
    rounded: "{rounded.pill}"
    height: "2.25rem"
  language-toggle-active:
    backgroundColor: "{colors.cotton}"
    textColor: "{colors.pit}"
---

# Design System: Fimrash Logistics Services

## Overview

**Creative North Star: "Kofar Mata Indigo"**

The public face of Fimrash is cloth from Kano's own dye pits at Kofar Mata. Indigo, woven and drenched, is the ground of every public surface; undyed cotton appears only where the cloth was "bound", as resist panels that carry the things a sender touches (the booking swatch, the fare board, the handover-code cards). A running stitch, irregular and slightly wandering, borders those panels the way thread bound the cloth before dyeing. Tie-resist rings mark places: landmarks on the map, stations in the how-it-works strip. One colour is not from the vat: the brand's signal orange (#F28C28, the arrow in the Fimrash logo), reserved for the action. In CSS it lives in `--iw-turmeric` (historical name).

The world is confident and dense rather than airy. Bands alternate cloth and cotton at full width, each a single statement; the type is heavy, tight and close-set, the numbers are big and tabular because the fare is the promise. Texture is always real-feeling (SVG fibre noise blended soft-light into indigo, low-contrast slub on cotton) and never decorative gradients for their own sake. The world deliberately refuses the green-and-white courier template and dark neon "tech" styling.

Scope: this file describes the public world only (homepage, public header, footer and mobile dock, and the indigo re-dye of /send and /track). The internal consoles at /rider and /ops (rider console, reconciliation hub, auth gate, internal header) intentionally keep the older slate/emerald operational look and are outside this system.

**Key Characteristics:**
- Indigo cloth ground with woven fibre texture; cotton resist panels for every interactive surface.
- Hand-irregular running-stitch borders inset inside panels, never on the panel edge.
- Tie-resist concentric rings as the place-marker and station motif.
- Signal orange is the single action colour; everything else is indigo or cotton.
- Heavy Bricolage Grotesque display over Figtree body, both carrying the Hausa hooked letters.
- Bilingual by construction: the Hausa headline has its own smaller clamp so longer copy still balances.

## Colors

Two materials and one spice: a family of indigos from pit-black to faded wash, a family of undyed cottons, and signal orange.

### Primary
- **Kofar Mata Indigo** (indigo): the cloth. Default background of the public world, the woven `cloth` surface, the swap button and digit tiles on cotton, the outline colour of the indigo outline button.
- **Dye-Pit Black** (pit): the deepest dye. Header, footer, mobile dock, the Track strip, the handover-code band; also the text colour on signal orange and on the active language pill.
- **Lighter Dip** (indigo-dip) and **First Dip** (indigo-first-dip): the lifted highlights inside the cloth gradient, the hover state of indigo controls, the focus border of cotton fields, and the zone headings of the fare board.

### Secondary
- **Signal orange** (signal orange): the one action colour. Book, Send, Call the desk; the global focus ring; text selection; the focus border of dark fields. **Signal Orange Lit** (signal-orange-lit) is its hover only.

### Neutral
- **Undyed Cotton** (cotton): resist panels and the text colour of headings on indigo.
- **Cotton in Shade** (cotton-shade): the fare-board band, a second cotton step so two cotton bands never butt together at the same value.
- **Bright Cotton** (cotton-bright): the inside of fields and cards on cotton, and the fare-row hover wash.
- **Mist** (mist): body text on indigo. **Wash** (wash): secondary text on indigo (hints, help text, sub-labels).
- **Indigo Ink** (ink): primary text on cotton. **Soft Ink** (ink-soft): secondary text on cotton.

### Named Rules
**The One Spice Rule.** Signal orange is used only for the primary action, focus and selection. If it appears as decoration, a border, or a background field, it is wrong.

**The No-Grey Rule.** Secondary text is always tinted from the vat: soft ink on cotton, wash or mist on indigo. A neutral grey never appears on a public surface.

**The Cloth-and-Cotton Rule.** Every public surface is either cloth (indigo, woven) or cotton (undyed, slub). A plain white or a flat untextured indigo panel is not part of the world.

## Typography

**Display Font:** Bricolage Grotesque (opsz 12–96, weight 500–800; falls back to Figtree, system-ui)
**Body Font:** Figtree (weight 400–800; falls back to system-ui, Segoe UI, Roboto)

**Character:** A loud, slightly quirky optical-size grotesque for headlines and figures, sitting over a friendly, highly legible geometric body. Both faces were chosen because they render Hausa's hooked letters (ɓ ɗ ƙ ƴ) natively.

### Hierarchy
- **Display** (800, clamp(2.9rem, 6.2vw, 5.4rem), 0.95, -0.035em, balanced wrap): the single hero headline in cotton on cloth. In Hausa it steps down to its own clamp (display-hausa).
- **Headline** (750, clamp(2rem, 4.2vw, 3.5rem), 1.02, -0.03em): one per band.
- **Title** (700, 1.35rem, 1.15): station titles, the Track label, the sellers band (which scales it up to clamp(1.5rem, 2.6vw, 2.1rem)).
- **Figure** (800, 2.6rem, tabular lining numerals): the live fare. Fare-board prices and code digits use the same display-800 tabular treatment at smaller sizes (1.25rem, 1.9rem).
- **Lede** (400, clamp(1.05rem, 1.4vw, 1.2rem), 1.55, max 34rem): the paragraph under a headline.
- **Body** (400, ~1.02–1.05rem, relaxed leading): station and band copy.
- **Label** (700, 0.8rem, +0.01em, sentence case): field labels and the fare label. The fare-board zone headings are the one place a label goes uppercase (+0.08em), because they head a price table.

### Named Rules
**The Tabular Promise Rule.** Every price, minute count, waybill, phone number and code uses tabular lining numerals. Numbers that are promises do not jiggle.

**The Two-Clamp Rule.** Any headline whose Hausa copy runs longer than its English gets its own Hausa size, never a truncation or a shared compromise.

## Layout

A single 1240px container with 16px phone gutters and 24px from 640px. Bands run full-bleed, alternating cloth and cotton, with generous vertical rhythm: 80px on phones and 112px on wide screens for primary bands, 64–96px for lighter bands (sellers, desk). Wide layouts use a 12-column grid split 5/7 (copy or swatch left, map or cards right).

The first viewport is a working tool, not a poster: headline and the cotton booking swatch on the left, the resist map on the right, the deep-dyed Track strip beneath the map. On phones the order changes deliberately: headline, swatch, Track strip, then the map, which sits in a horizontal scroller at a legible minimum width (560px) and auto-scrolls to centre the chosen route. A fixed two-button dock (Send, Track) stays under the thumb on every public page below 768px, and the footer reserves bottom padding for it.

Breakpoints are Tailwind's: 640px, 768px, 1024px.

## Elevation & Depth

Depth comes from the dye, not from stacking. The cloth itself carries depth (radial gradients from a lighter dip at the top-right to pit at the bottom-left, under the woven noise). Panels lift off it with a single long, soft, indigo-tinted drop shadow, as fabric laid on fabric. Signal orange buttons glow faintly in their own colour. There are no grey shadows anywhere.

### Shadow Vocabulary
- **Laid Cloth** (`box-shadow: 0 30px 60px -30px rgba(11,18,64,0.9)`): the booking swatch and the how-it-works band (-36px spread there).
- **Signal Glow** (`box-shadow: 0 10px 24px -10px rgba(242,140,40,0.7), 0 2px 0 rgba(11,18,64,0.25)`): the primary button at rest; deepens to 0.85 alpha and 14px/28px on hover.
- **Dock Lift** (`box-shadow: 0 -12px 30px -12px rgba(11,18,64,0.6)`): the mobile dock, cast upward onto the page.
- **Inset Thread** (`box-shadow: inset 0 0 0 2px ...`): outline buttons draw their border as an inset shadow so the stroke never changes the button's size.

### Named Rules
**The Dye-Tinted Shadow Rule.** Every shadow is pit indigo or signal orange, long and negatively spread. Neutral black or grey shadows are not part of the world.

## Shapes

Soft, cloth-like corners that scale with the panel: digit tiles 0.5rem, fields 0.75rem, buttons 0.85rem, icon tiles 1rem, code cards 1.1rem, the Track strip 1.2rem, the booking swatch 1.4rem, the how-it-works band 1.6rem. The bigger the cloth, the rounder the corner. Pills are reserved for the language toggle and round icon buttons (swap, fare-row arrows).

The running stitch is the defining border. It is an SVG thread inset 10px inside its panel (7px on small cards), with a corner radius matching the panel, an irregular dash pattern (7 4.5 5 6.5 8.5 4 6 5.5 4.5 7) and a fractal-noise displacement so it wanders like hand-sewn thread. Indigo thread (rgba(27,46,122,0.55)) on cotton, cotton thread (rgba(241,234,219,0.6)) on indigo.

Tie-resist rings are the other recurring form: concentric circles alternating solid and dotted strokes, cotton on indigo, with a slight dye-bleed displacement. They mark landmarks on the map, the how-it-works stations, and the faint dye-pit rings radiating from the old city behind the map.

## Components

### Buttons
Heavy, tactile and thumb-sized.
- **Shape:** gently rounded (0.85rem), minimum height 3.25rem (3rem in the dock, 2.75rem in the header), Bricolage Grotesque 750 at 1.05rem, icon gap 0.6rem.
- **Primary (signal orange):** pit text on signal orange with the Signal Glow. The only button that commits: Book, Send, Call the desk.
- **Hover / Focus / Active:** hover lightens to signal-orange-lit and deepens the glow; active nudges down 1px and scales to 0.99 on the world's ease (cubic-bezier(0.16, 1, 0.3, 1), 180ms); focus is the global 3px signal orange ring offset 3px.
- **Cotton:** ink on cotton, for the secondary action placed on indigo (Track, sellers CTA); hover brightens toward #fff8ea.
- **Ghost:** cotton text with a 2px inset cotton thread at 35%, full opacity on hover; used on pit (the dock's Track).
- **Indigo outline:** indigo text with a 2px inset indigo thread, used on cotton for the secondary contact action (WhatsApp).

### Cards / Containers
- **Booking swatch:** cotton with slub, 1.4rem corners, 20–28px padding, Laid Cloth shadow, ink running stitch. Holds From/To, swap, the live fare figure and the signal orange Book button.
- **Track strip:** pit cloth, 1.2rem corners, cotton stitch, dark field plus cotton button.
- **Handover-code cards:** cotton for the parties who see the code, indigo cloth for the rider who does not; 7px-inset stitch; four indigo digit tiles, or masked pit tiles for the rider.
- **Fare board:** a cotton-shade band of rows divided by 1px ink lines at 12%; a row hovers to bright cotton; each row ends in a round 44px arrow that fills indigo on hover.

### Inputs / Fields
- **Style:** bright cotton fill, 2px ink border at 14%, 0.75rem corners, 3.4rem tall, Figtree 600 at 1.05rem. Selects carry an indigo chevron at the right.
- **Focus:** border shifts to first-dip indigo with a 4px first-dip halo at 18%.
- **Dark variant:** pit at 55% with a cotton border at 22% and mist placeholder; focus switches border and halo to signal orange.

### Navigation
- **Header:** sticky pit cloth, 4–4.5rem tall, the reversed Fimrash lockup (34px tall on phones, 40px from 640px). Links are Figtree 600 in mist, cotton on hover; the current page sits on a 10% cotton wash. The signal orange Send button sits at the right from 640px.
- **Language toggle:** a pit pill with a cotton inner hairline; EN / HA segments 44px wide, active segment is a cotton pill with pit text. Always visible, on every public page.
- **Mobile dock:** fixed pit bar below 768px, two equal buttons (signal orange Send, ghost Track) with safe-area padding.
- **Footer:** pit cloth, reversed lockup at 48px, tagline in wash, links in mist.

### Resist Map (signature)
Kano's landmarks drawn as tie-resist rings on the cloth over faint dye-pit rings and dotted neighbour threads. The chosen route is a curved cotton running stitch with a soft soaked halo, revealed by a mask that "dyes in" along the path (1400ms); the A and B rings bloom from 20% scale (1100ms), and the selected nodes are knocked out so the thread dives under them. Labels are cotton with an indigo paint-order halo. Clicking a node alternately sets A then B, but the map is a pointer enhancement only: the selects in the swatch remain the accessible control. Reduced motion collapses all animation to 1ms.

### Re-dyed legacy pages (/send, /track)
The booking form and tracking route card are older Tailwind components wrapped in an indigo skin that remaps the emerald ramp to indigo and the light slate steps to cotton, sets the body and display faces, and lays a slub cotton ground. This is a recolour, not a rebuild: they do not yet use the stitch, the resist panels or the world's button and field components, and the /send form copy is English-only.

## Do's and Don'ts

### Do:
- **Do** put every interactive surface on cotton or deep cloth, bordered by the irregular running stitch inset 10px (7px on small cards).
- **Do** keep signal orange to the primary action, focus ring and selection; one signal orange button per band.
- **Do** set every price, time, code and phone number in tabular lining numerals; prices in display 800.
- **Do** tint all secondary text from the vat: soft ink on cotton, wash or mist on indigo.
- **Do** give Hausa copy its own size where it runs long, and keep the EN/HA toggle in the header of every public page.
- **Do** use tie-resist rings for places and stations, with the dye-bleed displacement so edges never look machine-perfect.
- **Do** keep Send and Track one tap away: header on desktop, the fixed dock on phones.

### Don't:
- **Don't** use the green-and-white courier palette or dark neon tech styling on public pages; the emerald and slate look belongs only to the internal /rider and /ops consoles.
- **Don't** use neutral grey for text, borders or shadows.
- **Don't** draw the stitch as a uniform CSS dashed outline on the panel edge; the thread is irregular, displaced and inset.
- **Don't** use signal orange as a background field, border or decoration.
- **Don't** add small uppercase kicker or eyebrow lines above headlines; the headline stands alone in each band.
- **Don't** invent trust claims, ratings or counts; trust is shown by mechanism (the code cards, the fare board).
- **Don't** make the map the only way to choose a route.


## Logo

The official artwork lives in `Graphics_logo/` (client-supplied: primary, reversed, one-colour and stacked lockups, mark, app icon, and the colour and type spec). Web-ready transparent cut-outs are generated into `frontend/public/brand/` by un-mixing each file from its flat background into the exact brand inks: deep blue #1B3A6B, mid blue #2C5AA0, signal orange #F28C28, white, and light blue #A9BCE4. Each PNG records its source in metadata.

- **Indigo and dark grounds:** `fimrash-lockup-reversed.png` (header, footer, dark sign-in) and `fimrash-mark-reversed.png` (dark internal header).
- **Cotton and light grounds:** `fimrash-lockup.png` (printed and on-screen waybill, light sign-in) and `fimrash-mark.png`.
- **Single ink:** `fimrash-lockup-mono.png`. Stacked versions exist for square placements.
- **Icons:** `favicon-32/48.png` (rounded app icon), `apple-touch-icon.png`, `icon-192/512.png` (full-bleed, for the web manifest), and `og-card.png` (1200x630 share card).
- **Brand rules (from the spec sheet):** keep clear space of one arrowhead-height around the logo; minimum width is 96px on screen; never recolour or redraw the artwork. Use `BrandLogo` (PublicShell.jsx), which picks the file by the ground it sits on.
- **Wordmark type** is Archivo 800 inside the artwork. Site typography stays Bricolage Grotesque and Figtree; do not set "FIMRASH" as live text.
- The internal consoles (`/rider`, `/ops`) map their emerald utility palette to the brand blues via `.skin-brand`.
