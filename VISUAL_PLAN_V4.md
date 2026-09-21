# VISUAL_PLAN_V4 — FiscalScope

## Art direction: **COLD PRESS**
### An immersive interactive economic publication

> V4 supersedes every previous redesign attempt (V1–V3).
> The orange / coral / salmon direction is **rejected and retired**.
> Nothing from the previous visual layer is preserved or reproduced.
>
> The baseline for this work is commit `bf95318` (*cambios menores*) — the last state of
> FiscalScope before any redesign attempt. That baseline's visual and interaction layer is
> **disposable**; its fiscal engine, datasets, sources and functionality are **protected**.

---

# 0. WHAT WE ARE MAKING

Not a prettier website. Not a dashboard. Not a landing page.

**FiscalScope Nº 01 — an interactive economic paper about what happens between what your
work costs and what reaches your account.**

One continuous scroll. Eight numbered chapters. One live fiscal state driving every figure
on the page. A reader can scroll it like a printed feature and never touch a control — or
grab the tape and interrogate fifteen years of Spanish tax law with it.

The governing sentence for every decision below:

> **The page is the instrument. The data determines the composition.**

---

# 1. THE ONE-LINE ARGUMENT OF THE PUBLICATION

Every number below was computed from the existing engine (`src/engine/irpf.js`, 2026
parameters). The whole page serves this spine:

```text
De cada 100 € que cuesta tu trabajo,
57,1 € llegan a tu cuenta.              35.000 € brutos · 2026

El mismo sueldo real dejaba
27.472 € netos en 2016
26.397 € netos en 2026                  35.000 € constantes de 2026
                                        −1.075 € reales en diez años

Entre 17.000 € y 18.500 € de bruto,
cada euro extra tributa al 79 %.        retirada de la reducción del Art. 20
```

These are the three climaxes of the narrative. They are not slogans: they are outputs of
`calcularNomina`, `calcularTipoMarginal` and `INFLACION_A_2026`, and they recompute live
with the reader's own salary. **No figure, statement or annotation in this redesign may
assert anything the engine does not produce.**

---

# 2. COLOR SYSTEM — cold, mineral, restrained

Bone paper. Cold charcoal ink. Slate greys. One petrol signal. One ink-blue counter.
No orange, no coral, no salmon, no warm accent anywhere in the product.

```css
:root {
  /* paper */
  --bone:          #EDEBE4;   /* page ground */
  --bone-raised:   #F5F3EE;   /* transient surfaces only: tape, menus, tooltips, sheets */
  --bone-sunk:     #E4E2DA;   /* table zebra, inactive track */

  /* ink ladder — 7 cold steps; lightness IS data */
  --ink:           #16191B;   /* charcoal, near-black, slightly cold */
  --ink-2:         #394247;
  --ink-3:         #5A6468;   /* slate */
  --ink-4:         #818A8E;   /* muted — lightest tone allowed for text */
  --ink-5:         #A6ADB0;
  --ink-6:         #C4C8C8;   /* faint: source lines, minor ticks */
  --ink-7:         #DCDED9;   /* hairline grid */

  --rule:          #D2D5D0;
  --rule-soft:     #E3E3DD;

  /* the only two chromatic roles in the publication */
  --signal:        #0B5560;   /* DEEP PETROL — "you / now / selected" */
  --signal-soft:   #B9CBCC;
  --counter:       #23406E;   /* INK BLUE — "the other year / the other perspective" */
  --counter-soft:  #BFC8D6;

  /* inverted chapter (05 · LA CUÑA) */
  --night:         #0E1214;
  --night-ink:     #E8E6DF;
  --night-rule:    #232A2D;
  --night-signal:  #58A4AF;
  --night-counter: #8AA4CE;
}
```

## Semantic contract (enforced, not decorative)

| Role | Color | Used for |
|---|---|---|
| Primary data | `--ink` | the current year, the reader's own values, the main series |
| Context data | `--ink-3` → `--ink-6` | other years, other countries, the rest of the distribution |
| **SIGNAL** | `--signal` | exactly one thing per figure: *you are here / this is now* |
| **COUNTER** | `--counter` | exactly one comparison: selected year, other perspective |
| Structure | `--rule`, `--ink-7` | hairlines, calendar floors, guide rails |

Rules:

- Two chromatic roles maximum per figure. A third means the figure is doing two jobs —
  split it.
- **No semantic red/green.** Gains and losses are encoded by geometry and direction, not
  hue: solid marks add, dashed or hollow marks subtract (Lieflat's waterfall grammar), and
  direction is spelled out in words (`−1.075 €`, `LLEGA`, `NO LLEGA`).
- No gradients, no glass, no shadows, no glow, no rounded chapter containers. Rounded
  corners exist only on transient UI: the tape, menus, tooltips, the index sheet.
- Fifteen years never become fifteen colors. Years are encoded by **position and
  lightness**, plus direct labels.

## Dark chapter

Chapter **05 · LA CUÑA FISCAL** inverts entirely — full-bleed `--night`, bone ink, petrol
lifted to `--night-signal`. It is the only inversion in the publication, placed at the
structural climax (the 100-unit figure) for narrative rhythm. No dark cards anywhere else.

---

# 3. TYPOGRAPHY — two voices and a stamp

| Voice | Family | Role |
|---|---|---|
| Editorial | **Newsreader** (variable serif) | chapter titles, major statements, pull quotes, masthead |
| Data / interface | **Inter** | numbers, labels, annotations, controls, body, tables |
| Stamp | **JetBrains Mono** | figure numbers, source lines, parameter tables, legal references, chapter numerals |

Playfair Display is retired — too bridal, too warm for this direction. Newsreader is cold,
newspaper-grade, excellent at 80–140px, with a real italic for editorial emphasis. Three
families, tightly scoped weights (Newsreader 400/500 + italic, Inter 400/500/600/800,
JetBrains Mono 400/500) — the same single Google Fonts request the baseline already makes.

```css
.num { font-variant-numeric: tabular-nums lining-nums; }
```

Every euro figure, percentage, year and table cell uses tabular numerals so values stay
column-aligned while they animate.

## Scale (deliberately violent contrast)

```text
stamp / source      10–11px    JetBrains Mono, uppercase, .10em tracking
label               11–13px    Inter 600, uppercase, .08em tracking
body                16–19px    Inter 400, 1.62 line-height, max 68ch
margin note         12.5px     Inter 400, --ink-3
figure annotation   11–13px    Inter 500/600
small title         28–36px    Newsreader 400
chapter title       clamp(44px, 7vw, 92px)    Newsreader 400, -.02em
major statement     clamp(40px, 9vw, 128px)   Newsreader 400, 0.92 line-height
major data          clamp(48px, 11vw, 168px)  Inter 800, tabular, -.03em
chapter numeral     clamp(96px, 18vw, 240px)  JetBrains Mono 400, --ink-7, behind content
```

Headings are never all the same size. A number is graphic material: where a number is the
point of a section, it is set larger than the heading above it.

---

# 4. GRID, MARGINS AND FORMAT

```css
:root {
  --page-max:    1500px;
  --reading-max: 68ch;    /* ~740px */
  --gutter:      clamp(18px, 3vw, 40px);
  --rail:        216px;   /* margin rail, >=1200px only */
}
```

Desktop is a 12-column field with a **persistent margin rail** left of the reading column.
The rail is information space, not whitespace: chapter numeral, source lines,
methodological notes, legal references, live parameter values, figure keys. This single
mechanism does most of the work of making the page read as a publication.

```text
│ RAIL          │ READING COLUMN / FIGURE FIELD                          │
│               │                                                        │
│ 03            │ CÓMO FUNCIONA                                          │
│               │ EL IRPF                                                │
│ FUENTE        │                                                        │
│ BOE · AEAT    │ [FIG. 03 — escapes to the full figure field]           │
│               │                                                        │
│ NOTA 02       │ body text returns to the narrow reading column          │
│ El tipo       │ …                                                      │
│ marginal y el │                                                        │
│ efectivo mide │                                                        │
│ cosas dist.   │                                                        │
```

Format vocabulary, assigned per chapter and never uniformly:

- **reading** — narrow column, rail active
- **figure** — figure escapes the reading column to the full 12-column field
- **full-bleed** — 100vw, hairlines run to the viewport edge
- **sticky** — figure pinned, text scrolls past it (chapters 02 and 03 only)
- **inverted** — full-bleed night ground (chapter 05 only)
- **appendix** — dense two-column technical setting (chapter 07 only)

No chapter uses the same rhythm as its neighbour. No figure sits inside a rounded card.

---

# 5. CHART GRAMMAR — ported from Lieflat, not copied

Inspected: `SKILL.md`, `catalog.md`, `mono-tokens.js`, `color-presets.js`,
`templates/lupi-gallery.html`, `templates/basics-gallery.html`. We port the **grammar**
into our own React/SVG components with FiscalScope data only. No Lieflat HTML, demo data
or assets ship.

## The five borrowed rules

1. **Hairline over ink-blob.** Data strokes 0.6–0.9px (×1.8 where a chromatic role
   replaces grey, per Lieflat's ink-boost rule). Structure at 0.5–0.7px.
2. **Countable units.** Where a quantity can honestly be decomposed, it is drawn as
   countable marks with a declared unit, stated in a legend line:
   `UNA MARCA = 250 € · CADA QUINTA MARCA LLEVA PUNTO`. Never decompose into units that do
   not exist; when rounding loses a unit, say so in the note.
3. **Environment furniture.** Half the quality is non-data structure: calendar floors,
   dotted guide rails, every-fifth-unit dots, rim ticks, leader lines from mark to label,
   baseline rules. Sparse fiscal data earns density from furniture, never from invented
   detail.
4. **Direct labels, no legends.** Series are named at their own end point with a leader
   hairline. A 15-item legend is a design failure.
5. **Deterministic texture.** Mark length and opacity jitter use Lieflat's
   `rnd(i,k) = |((i*73856093) ^ (k*19349663)) % 1000| / 1000` — never `Math.random()`.
   The page must screenshot identically on every reload.

## Chart-type audit

Every figure was re-selected from the question and the data, auditing Lupi Editorial →
Lupi Basics → Glance, per the skill's hard constraint. Nothing is retained by default.

| Figure | Question | Old encoding (bf95318) | Verdict | Lieflat lineage | New encoding |
|---|---|---|---|---|---|
| 01 La nómina | What is my net, really? | slider + KPI chips + stacked bar | **discard** | F11 Tick Gauge | income ruler carrying the reader's mark, live |
| 02 El viaje | Where does each euro of labour cost go? | 12 stacked step cards | **discard** | L13 Hourglass Stream + F9 Rung Waterfall | vertical proportional strips of countable ticks, threads trickling between stages, percentages parked in the margin |
| 03 La escalera | How does progressivity actually work? | table + bars | **discard** | F1 Rung Bars | bracket columns of rungs; filled = your income inside, hollow = unused capacity |
| 04 Marginal vs efectivo | Is 37 % what I pay? | prose + chips | **discard** | F11 Tick Gauge ×2 | two aligned tick gauges under a typographic poster |
| 05 El acantilado | What happens to Art. 20 as income rises? | Recharts line | **discard** | L3 Barcode Lollipop + threshold diagram | Art. 20 curve annotated PLANA / CAÍDA / CERO over a marginal-rate barcode (one tick per 250 €) |
| 06 Cien euros | Of 100 € more, how much arrives? | prose + numbers | **discard** | L14 Hundred Field | 100 countable units, the arriving ones inked |
| 07 Mismo sueldo | Same real salary — what changed? | multi-line chart | **discard** | F12 Dumbbell Queue | dumbbell per year, beads = € of real net lost or gained |
| 08 El atlas | How does net vary by income and year? | 15-color line chart | **discard** | F2 / F3 Hairline Line | direct-labelled hairlines: current year ink, selection petrol, rest grey, plus scrubber |
| 09 Las reformas | How did the thresholds move? | grouped bars + colored timeline | **discard** | L11 Trend Lineage | connected-dot threshold tracks with reform annotations on hairlines |
| 11 De cada 100 € | Where do 100 € of labour cost go? | **pie chart** | **discard** | L14 Hundred Field | 100 blocks on night ground, morphing worker ↔ employer |
| 12 La OCDE | Where does Spain sit? | bar chart | **discard** | L2 Dot Cascade / strip plot | single-axis country strip, Spain inked, OECD mean as a rule |
| 13 Dónde estás | Where am I in the distribution? | area + bars | **discard** | L14 + F11 | 100 marks = 100 workers ordered, your position marked, percentile ruler |
| 15 Tu parte | What is my share of public debt? | composed + bars | **discard** | F11 Tick Gauge + F1 rungs | one major number plus a years-to-repay rung strip |

## The figure library

Three shared pieces in `src/figures/`:

- **`ChartFrame`** — the common frame: SVG canvas, hover readout box and axis controls.
- **`useDomainZoom`** — **domain zoom, never image zoom**. Scaling the drawing would thicken
  strokes and type like magnifying a photograph; instead the horizontal *domain* moves, the
  figure recomputes its scales and its tick marks, and the type keeps its size. The vertical
  axis is deliberately left fixed: it is the axis being compared across series, and rescaling
  it would make the slope lie. Wheel, pinch, drag, `+`, `−`, `0` and the arrows. Only the
  five figures with a continuous money axis carry it — the rate curve, the cliff, the atlas,
  the art. 20 history and the distribution curve.
- **The readout box** (`tip`) — HTML over the canvas rather than SVG, so the type is crisp
  and the box can overflow the plot. It follows the cursor, flips near the edges and lists
  each series with its colour dot and value, replacing native `<title>` tooltips.

Categorical figures — rows of countries, years or percentiles — have no continuous axis to
rescale, so they carry no zoom; on narrow screens they scroll sideways at full type size.

Final count: **twenty-four figures**, listed in `STORYBOARD_V2.md`. Every figure of the
pre-redesign application is present; ten are new.

## Chart technology decision

**Bespoke SVG in React. No chart library.**

Reasoning, not preference: these figures are ruler geometry, countable marks, threshold
annotation and direct labelling. Recharts supplies none of that and actively fights the
last three. The data is already precomputed by the engine (`DATOS_CHART`, `CURVA_ART20`,
`DATOS_UMBRALES`, …), so all that is needed is linear scaling — about 60 lines in
`src/figures/scale.js`, no dependency.

Consequence: **Recharts becomes unused and is removed from `package.json`** at the end of
implementation (bundle reduction, one less default look to fight). No second chart library
is introduced. If one figure turns out to genuinely need a library, that is raised as a
decision rather than silently added.

## Static-first rule

Every figure must be fully legible before any interaction and before any animation.
Tooltips add a second layer; they never carry the primary reading. A figure that needs
hover to make sense gets redesigned.

---

# 6. ONE FISCAL STATE

```js
{ bruto, anio, pagas,
  opts: { regimen, ccaa, tributacion, nHijos, nHijosMenores3, nAscendientes },
  focus }   // cross-highlight token: 'irpf' | 'ssTra' | 'ssEmp' | 'neto' | year | bracket
```

Held in one provider, seeded and persisted by the existing `useURLState` (extended with
`pagas` and the scroll anchor; existing parameter names and share behaviour preserved
verbatim). Every figure reads it; nothing keeps a private copy of the salary.

`focus` is the cross-highlighting bus: hovering IRPF anywhere dims the unrelated segments
of the journey, the ruler, the wedge and the hundred-field at once.

## LA CINTA — the persistent instrument

There is no calculator card and no navbar. A slim **tape** docks to the bottom of the
viewport once the cover scrolls away:

```text
──────────────────────────────────────────────────────────────────────────────
 BRUTO  35.000 €  ├────────────●──────────────────────┤   2026 ◀▶   12 PAGAS
 NETO   26.397 €  ·  2.200 €/mes  ·  57,1 € de cada 100 € de coste   PERFIL ▾
──────────────────────────────────────────────────────────────────────────────
```

- Bone-raised, one hairline top border, 12px radius, no shadow.
- Drag or keyboard-arrow the salary; every figure on screen retitles and reshapes.
- Year stepper, pagas toggle, and `PERFIL ▾` (régimen, CCAA, tributación, hijos,
  menores de 3, ascendientes) as a compact sheet — every `ConfigPanel` option preserved.
- Mobile: two rows, 56px tall, above the safe area; `PERFIL` and `ÍNDICE` open sheets.
- Hidden on the cover and in the appendix, where it would be noise.

## Interaction semantics (consistent everywhere)

| Gesture | Meaning |
|---|---|
| hover / focus | temporary exploration; sets `focus` |
| click | pin a value or year until clicked again |
| drag | explore a continuous range (salary, increment) |
| scrub | move through time, 2012–2026 |
| toggle | change perspective (worker ↔ employer, real ↔ nominal) |
| keyboard | arrows on every scrubber and ruler; Tab reaches every mark group |

---

# 7. MOTION

Motion explains a state change or it does not exist.

```text
value interpolation          220–320 ms   ease-out
strip / rung re-proportion   420–700 ms   cubic-bezier(.2,.7,.3,1)
scrubber + year transition   300 ms
figure first reveal          stagger 8–14 ms per mark, 900 ms total, once, on scroll-in
```

No parallax, no bounce, no spring, no decorative section fade-ins. Number changes
interpolate so the reader sees the quantity move rather than blink.

`prefers-reduced-motion: reduce` disables all reveal and interpolation; figures render at
final state and stay fully informative. No information is ever animation-only.

---

# 8. MOBILE (375px) — recomposed, not stacked

Each figure has a designed portrait form, specified per chapter in `STORYBOARD_V2.md`.
Standing rules:

- The margin rail collapses into inline notes at 12.5px in `--ink-3` between hairlines.
- Horizontal rulers become vertical rulers; the scroll direction carries the axis.
- The sticky scrollytelling of chapters 02–03 becomes a **pinned figure with a 3-step dot
  progress** — the same graphic transforming, never three separate cards.
- The historical atlas drops from 15 hairlines to **selected year vs current year**, driven
  by the scrubber, with the other 13 as a grey envelope band.
- Full-bleed figures run edge to edge with a 16px type gutter; no horizontal page scroll at
  any breakpoint.
- The tape stays thumb-reachable; all hit areas ≥ 44px.

---

# 9. ACCESSIBILITY

- Semantic `<section>` per chapter, one `<h2>` each, ordered heading levels, skip link to
  the index.
- Every figure is a `<figure>` with `<figcaption>` and carries a visually-hidden data table
  or one-sentence summary stating measure, unit and key values.
- Every interactive mark group is keyboard reachable; visible 2px petrol focus ring with
  2px offset on bone.
- Contrast: body and small labels ≥ 4.5:1, large type ≥ 3:1, adjacent data marks ≥ 3:1.
  `--ink-4` is the lightest tone permitted for text; lighter tones are structure only.
- No hover-only information. Color is never the only channel: every series carries a direct
  label, a position, or a geometry difference.
- `prefers-reduced-motion` honoured; `prefers-contrast: more` thickens hairlines to 1.2px
  and drops the `--ink-6/7` tier.

---

# 10. PROTECTED — what this redesign must not touch

Untouched files:

- `src/engine/irpf.js` — every formula, parameter table, historical dataset, OECD table,
  debt table, distribution table, projection and threshold.
- `test/irpf.test.js` — passes unchanged, before and after.

Preserved behaviour (re-expressed visually, never removed):

- salary, year, régimen, CCAA, tributación, hijos, menores de 3, ascendientes;
- 12 / 14 pagas;
- real (€ 2026) ↔ nominal toggle;
- year multi-selection in the historical chapter and its **CSV export**;
- raise simulator with adjustable increment;
- worker ↔ employer wedge perspectives;
- Art. 20 curve, threshold evolution, real/nominal switch;
- distribution percentile and the origin/destination year scenario;
- OECD comparison with reference-country selection;
- public debt projection with adjustable horizon;
- reform chronology, parameter tables, FAQ, **all BOE / AEAT / TGSS / INE / OECD source
  links**, the estimate markers (`e`) and every methodological caveat;
- share URL and its parameter names.

Sources are part of the visual language: every figure carries a `FUENTE ·` line in
JetBrains Mono, and methodology is never hidden behind an icon.

---

# 11. COMPONENT ARCHITECTURE

```text
src/
  engine/irpf.js              ← untouched
  state/FiscalState.jsx       ← the provider: bruto, anio, pagas, opts, focus
  state/fiscalContext.js      ← the context + useFiscal hook (fast-refresh split)
  hooks/useURLState.js        ← extended with `pagas`; param names preserved
  hooks/useChapters.js        ← chapter observation, progress, sticky steps
  hooks/useNarrow.js          ← portrait recomposition switch
  styles/
    paper.css                 ← tokens, grid, rail, type scale, focus, motion, print
    figures.css               ← figure frame, annotation, legend, narrow-screen rules
    shell.css                 ← cover, running header, rail, index, cinta, colophon
  figures/
    Figure.jsx                ← FIG. nn · title · subtitle · field · note · source
    scale.js                  ← linear/clamped scales, ticks, units, rnd()
    marks.jsx                 ← TickStrip · HundredField · Series · YouMark ·
                                Leader · Rule · TickFloor · Label
  chapters/
    00Portada.jsx  01Nomina.jsx  02Viaje.jsx  03Irpf.jsx
    04QuinceAnios.jsx  05Cuna.jsx  06TuLugar.jsx  07Apendice.jsx
  shell/
    Masthead.jsx  RunningHeader.jsx  ChapterRail.jsx  Indice.jsx  Cinta.jsx  Colofon.jsx
```

The `bf95318` components are read for behavioural inventory and then retired. Their
explanatory prose, legal references and caveats are re-homed into chapter margins and the
appendix — **the words are protected content, the JSX is not**.

---

# 12. IMPLEMENTATION ORDER (after approval)

1. **Reset** — restore `src/` and `index.html` to `bf95318`; delete V1–V3 artefacts
   (`redesign.css`, `tokens.css`, `PayrollStudy`, `SalaryJourney`, `FigureZoom`,
   `FiscalBreakdown`, `BracketChart`, …). Confirm `npm run build`, `npm run lint`,
   `npm test` green on the baseline before anything else.
2. **Foundation** — `paper.css` tokens, grid, rail, type, focus; fonts swapped;
   `FiscalState` + extended `useURLState`; `Figure` frame + `scale.js` + `rnd`.
3. **Shell** — masthead, running header, chapter rail, index sheet, `Cinta`, colophon.
4. **Chapters 00–03** — cover, nómina, viaje, IRPF (the signature figures).
5. **Chapters 04–06** — atlas, dark wedge + OECD, tu lugar + deuda.
6. **Chapter 07** — appendix: chronology, parameters, FAQ, sources, limitations.
7. **Polish** — responsive 375 / 768 / 1440, keyboard, reduced motion, contrast audit,
   console audit, performance, source-link verification.
8. **Validation** — build, lint, tests; salary sweep low/middle/high; 12 vs 14 pagas; every
   year; every régimen and CCAA; real vs nominal; CSV export; share-URL round trip; no demo
   data; no horizontal overflow.
9. **Remove Recharts** from `package.json` once no figure imports it.

---

# 13. QUALITY GATE

Before a chapter is called finished, screenshot it and answer:

- Could this belong to a generic dashboard or startup? → redesign.
- Does it look like default chart-library output? → redesign.
- Is the primary message readable without interaction? → if no, redesign.
- Is every annotation derived from a real calculation? → if no, delete the annotation.
- Is any warm accent visible anywhere? → remove it.
- Does it feel like an authored interactive economic publication? → if no, redesign.

---

# 14. DECISIONS — RESOLVED BY THE AUTHOR

1. **Light/dark theme toggle — RETIRED.** `useTheme`, `ThemeToggle` and the
   `data-theme` bootstrap script in `index.html` are removed. FiscalScope is one
   art-directed bone publication whose only inversion is chapter 05, which keeps that
   inversion meaningful as narrative rhythm.
2. **Editorial serif — NEWSREADER.** Variable, cold, newspaper-grade, with a real italic
   for inline emphasis. Playfair Display is dropped from the font request.
3. **Chapter count — EIGHT (00–07).** Distribution and public debt stay merged in
   `06 · TU LUGAR Y TU PARTE`, under one question: where the system places you.
