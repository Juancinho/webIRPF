# FiscalScope — Visual Plan V3

## Visual thesis

FiscalScope will become an immersive interactive fiscal paper rather than a themed
dashboard. The design is built from warm porcelain paper, blue ink, rules, numerical
type, direct annotation and a controlled cobalt signal. Figures are composed as editorial objects before
they become interactive. Recharts remains only where its scales, accessibility and data
plumbing are useful; signature figures use bespoke SVG or HTML/CSS geometry.

The Lieflat references are used as a visual grammar, not as pasted templates:

- L14 Hundred Field for literal 100-unit allocation;
- F9 Stepped Waterfall for arithmetic subtraction and salary flow;
- F2 Hairline Area for restrained continuous curves;
- L9 Timeline Almanac for reforms attached to time;
- G3/G4 small-multiple logic for repeated historical structure;
- F12 Paired Rungs and Glance slope grammar for two-point comparison;
- Porcelain/Mono tokens for warm paper, blue ink, hairlines and one controlled signal.

Rejected alternatives are recorded where relevant: donuts hide sequence and make exact
comparison difficult; funnels imply conversion loss rather than fiscal subtraction;
rainbow year series create false categories; generic cards separate conclusions from the
figures that support them.

## Shared figure interaction

Analytical figures receive a consistent zoom language:

- `+` and `−` controls change the visible horizontal scale;
- `Restablecer` returns to 100%;
- the zoomed canvas can be panned horizontally;
- `+`, `-`, and `0` work from the focused figure;
- line charts retain brush/scrub interaction for semantic range zoom;
- click pins a mark; hover/focus previews it;
- reduced-motion mode removes interpolation while retaining state changes.

Zoom is not added to simple numbers or controls where it has no analytical meaning.
On mobile, zoom exposes detail without shrinking labels below a readable size.

---

## 01 — Publication cover / calculator

### QUESTION

For this salary, year and household profile, how much reaches the worker?

### CURRENT PROBLEM

The current marketing hero and rounded calculator shell split the question from its
answer and consume the first viewport with non-data space.

### PRIMARY INSIGHT

The annual net and amount per payment are the immediate result; gross salary is the
input, not an equally weighted KPI.

### PRIMARY VISUAL

A live editorial cover: gross salary and its scale form the left column, while the net
result and a literal 100-unit allocation occupy the right. The figure itself is the
cover.

### VISUAL FAMILY

Custom editorial composition + L14 Hundred Field.

### INTERACTION

Direct number entry, salary range drag, year scrub, 12/14 payments and profile editor.
The proportional field and all downstream figures update from the same state.

### ANNOTATION

Direct labels for net, worker Social Security and IRPF; one block equals 1%.

### TYPOGRAPHIC MOMENT

`26.397 € / NETO ANUAL` and `2.200 € / POR PAGA` using the live result.

### LAYOUT

Near-full viewport cover with publication folio and sources in the margin; no giant
container around the whole calculator.

### MOBILE

Gross input, scrubber and result become one vertical cover. The 100-unit field becomes a
20 × 5 matrix, not a squeezed desktop chart.

### IMPLEMENTATION

Existing React state and fiscal engine; HTML/CSS grid; `FiscalBreakdown` for the field.

---

## 02 — Salary composition

### QUESTION

How is the worker's gross salary divided between net income, IRPF and worker Social
Security?

### CURRENT PROBLEM

Equivalent cards and donut-like summaries conceal the common total and force legend
lookup.

### PRIMARY INSIGHT

The user should count the proportion before reading a label: roughly three quarters of
gross reaches the account in the default case.

### PRIMARY VISUAL

A 100-unit allocation field paired with an exact subtraction ledger.

### VISUAL FAMILY

L14 Hundred Field + F9 arithmetic ledger.

### INTERACTION

Hover/focus/click a category to isolate its blocks and cross-highlight the salary journey.
Zoom is available when the figure is presented as a detailed chapter figure.

### ANNOTATION

Direct labels attach percentages and euro values to their block groups.

### TYPOGRAPHIC MOMENT

`75,4 DE CADA 100 € LLEGAN A TI` from the live calculation.

### LAYOUT

Wide figure breaking the reading column, followed by a narrow explanatory note.

### MOBILE

20 × 5 grid with the ledger below; selected category remains visible without hover.

### IMPLEMENTATION

HTML/CSS blocks with shared highlighted-category state.

---

## 03 — Salary journey

### QUESTION

Where does every euro of total labour cost go before net income reaches the worker?

### CURRENT PROBLEM

Independent rows explain amounts but do not visually preserve the remaining total after
each subtraction.

### PRIMARY INSIGHT

Employer cost is wider than gross salary, and each fiscal deduction visibly narrows the
same stream until only net remains.

### PRIMARY VISUAL

A proportional, annotated flow/stepped waterfall: employer cost → employer SS → gross →
worker SS → IRPF → net. Stage width is the amount remaining.

### VISUAL FAMILY

F9 Stepped Waterfall with the object-continuity logic of L13, implemented as a custom
fiscal flow. L13 alone is rejected because this is arithmetic, not conversion.

### INTERACTION

Hover/focus previews a deduction; click pins and cross-highlights matching composition
blocks. Zoom and horizontal pan expose small stages. A restrained scroll sequence may
advance the highlighted stage.

### ANNOTATION

Each subtraction is written on the geometry; source and unit remain visible in frame one.

### TYPOGRAPHIC MOMENT

`CUESTA X € / LLEGAN Y €`.

### LAYOUT

Full-width dark chapter with a left narrative rail and a sticky figure on large screens.

### MOBILE

Vertical flow with proportional bar widths and a pinned step selector; no compressed
Sankey.

### IMPLEMENTATION

Bespoke accessible SVG with CSS transitions and `IntersectionObserver` for staged emphasis.

---

## 04 — IRPF brackets

### QUESTION

Which slices of taxable income enter each bracket, and how much tax does each slice
generate?

### CURRENT PROBLEM

A generic chart cannot make the marginal structure or unused ranges physically obvious.

### PRIMARY INSIGHT

The marginal rate applies only to the final occupied slice, not the full income.

### PRIMARY VISUAL

A proportional progressive ruler. Range width follows euros; occupied income fills each
segment; the user's taxable income terminates inside the active bracket; tax generated is
attached directly to every occupied segment.

### VISUAL FAMILY

Custom SVG progressive ruler informed by F7 proportional spans, but retaining contiguous
income geometry.

### INTERACTION

Hover/focus previews bracket details; click pins; keyboard arrows move between brackets;
zoom and pan expose narrow low-income bands without destroying proportional truth.

### ANNOTATION

`TU RENTA TERMINA AQUÍ`, exact bracket range, rate, income within bracket and generated
tax.

### TYPOGRAPHIC MOMENT

The live marginal rate sits beside the ruler, not inside a KPI card.

### LAYOUT

Full-width figure crossing a narrow explanatory text column.

### MOBILE

The ruler rotates into a vertical progressive spine. Labels alternate sides and the
active bracket expands.

### IMPLEMENTATION

Existing bracket calculation data rendered by bespoke SVG/HTML.

---

## 05 — Marginal vs effective rate

### QUESTION

Why is the marginal rate larger than the effective rate?

### CURRENT PROBLEM

Two adjacent numbers look like competing KPIs and do not explain their different bases.

### PRIMARY INSIGHT

Only the last income slice is taxed at the marginal rate; the effective rate is the
weighted result over the total.

### PRIMARY VISUAL

A large typographic statement linked to a small occupied-tail ruler and a whole-base
effective strip.

### VISUAL FAMILY

Glance oversized-number grammar + custom proportional strips.

### INTERACTION

Hovering either term highlights its denominator in the bracket figure. No independent
zoom is needed because the linked bracket ruler owns scale exploration.

### ANNOTATION

`35 % NO ES TU TIPO EFECTIVO` and `18,1 % SOBRE EL TOTAL`, using live values.

### TYPOGRAPHIC MOMENT

The statement itself is the scene.

### LAYOUT

Quiet asymmetric interlude between dense figures.

### MOBILE

Stacked statement and two full-width strips.

### IMPLEMENTATION

HTML/CSS using shared fiscal state.

---

## 06 — Historical 2012–2026 comparison

### QUESTION

With the same real gross salary, which fiscal years leave more or less net income?

### CURRENT PROBLEM

Many equal-weight colored lines and a detached legend make year comparison visually
expensive.

### PRIMARY INSIGHT

Current/reference is charcoal, one pinned comparison is coral, and all other years are
thin context.

### PRIMARY VISUAL

A large direct-labelled curve atlas plus a year scrubber and opening paired comparison.
Context years recede; selected years end in direct labels.

### VISUAL FAMILY

F2 Hairline continuous plot + F12 paired comparison + L9 event annotations.

### INTERACTION

Scrub years continuously; click to pin; brush or zoom controls change the salary domain;
hover previews; selected year updates the opening comparison and related rate figure.

### ANNOTATION

2015, 2019 and 2026 reforms appear as thin hairlines with short factual notes.

### TYPOGRAPHIC MOMENT

`MISMO SALARIO / 2015: X € / 2026: Y € / DIFERENCIA: Z €`.

### LAYOUT

Atlas chapter: opening comparison in the margin, wide plot nearly full bleed.

### MOBILE

Focused two-year comparison and swipe/scrub; context curves remain faint and chart is
zoomable rather than text being reduced.

### IMPLEMENTATION

Hybrid Recharts for scales/brush and custom overlay/direct labels.

---

## 07 — Personal historical evolution

### QUESTION

How have this user's real net salary, effective IRPF and total worker burden evolved over
time?

### CURRENT PROBLEM

Three measures and a table read as a dashboard panel rather than one historical account.

### PRIMARY INSIGHT

The net trajectory is primary; rates are explanatory traces aligned to the same years.

### PRIMARY VISUAL

An annotated strip timeline with one strong net line and two restrained rate traces,
followed by a compact small-multiple row for selected regime years.

### VISUAL FAMILY

L9 Almanac + G3 shared-axis small multiples.

### INTERACTION

Year scrubber, pin, zoom/pan, linked historical selection and keyboard arrows.

### ANNOTATION

Direct final values, best/worst year and factual reform markers.

### TYPOGRAPHIC MOMENT

`HOY RECIBES X € MÁS/MENOS QUE EN 2019`.

### LAYOUT

Wide chart, compact margin insights, technical table collapsed into the appendix.

### MOBILE

Single selected-year view plus a scrollable historical strip.

### IMPLEMENTATION

Hybrid line chart, custom event overlay and accessible data table.

---

## 08 — Effective-rate evolution

### QUESTION

How did the intensity of IRPF change across income levels and years?

### CURRENT PROBLEM

An overloaded line chart encourages color matching rather than reading regimes.

### PRIMARY INSIGHT

The shape and crossing of regimes matter more than fifteen individual colors.

### PRIMARY VISUAL

Small multiples for selected fiscal regimes with a linked selected-year overlay and
shared axes.

### VISUAL FAMILY

G3/G4 small multiples + F2 hairline curves.

### INTERACTION

Click a mini-plot to promote it; scrub year; zoom salary domain; pin comparison.

### ANNOTATION

Direct marginal thresholds and the user's position are attached to the promoted curve.

### TYPOGRAPHIC MOMENT

`A IGUAL PODER ADQUISITIVO` introduces the comparison basis.

### LAYOUT

Editorial matrix without individual cards.

### MOBILE

Horizontal snap strip of mini-plots plus one promoted plot.

### IMPLEMENTATION

SVG/Recharts hybrid with shared domain state.

---

## 09 — Tax wedge

### QUESTION

Of every €100 of employer labour cost, where does the money go?

### CURRENT PROBLEM

The current figure is clearer than a donut but remains isolated inside a normal section
and lacks cross-highlighting and object continuity.

### PRIMARY INSIGHT

One hundred is literal. The dominant net share and three deductions can be counted and
compared immediately.

### PRIMARY VISUAL

A 100-block field on an inverted chapter with an attached ledger and worker/employer
perspective morph.

### VISUAL FAMILY

L14 Hundred Field.

### INTERACTION

Worker/employer toggle preserves block identity; category hover/focus/click isolates;
zoom/pan supports detailed inspection on mobile and keyboard controls mirror buttons.

### ANNOTATION

Each block equals 1%; the selected component is named and quantified directly.

### TYPOGRAPHIC MOMENT

`DE CADA 100 € / X € LLEGAN COMO RENTA NETA`.

### LAYOUT

Full-width charcoal chapter, not a dark card.

### MOBILE

20 × 5 field and stacked ledger; same blocks reorder rather than disappear.

### IMPLEMENTATION

HTML/CSS field with shared highlighted component and controlled motion.

---

## 10 — Art.20

### QUESTION

Where is the flat reduction, where is the cliff, and where does the benefit reach zero?

### CURRENT PROBLEM

A generic multi-line chart makes the mechanism's shape secondary and hides the user's
position.

### PRIMARY INSIGHT

Plateau → cliff → zero is the figure. Historical context supports that shape.

### PRIMARY VISUAL

A bespoke directly annotated mechanism curve, with contextual years faint behind the
selected year.

### VISUAL FAMILY

F2 hairline grammar adapted into custom SVG mechanism geometry.

### INTERACTION

Scrub/pin year; move salary marker; click plateau/cliff/zero; zoom/pan income domain.

### ANNOTATION

Large `PLANA`, `CLIFF`, `CERO`, exact thresholds and `TU SUELDO` marker.

### TYPOGRAPHIC MOMENT

The net retained from an extra €100 inside the cliff is shown as a large factual number.

### LAYOUT

Wide mechanism figure beside a narrow explanation; no paragraph-card stack.

### MOBILE

Single selected curve, persistent zone labels and horizontal zoom.

### IMPLEMENTATION

Bespoke SVG from existing Art.20 datasets.

---

## 11 — Threshold evolution

### QUESTION

How have SMI, withholding exemption and Art.20 boundaries moved since 2012?

### CURRENT PROBLEM

Four similar lines and a legend make structural relationships difficult to follow.

### PRIMARY INSIGHT

Distance and crossings between thresholds define who is exposed to each mechanism.

### PRIMARY VISUAL

An annotated band/range plot: the Art.20 interval becomes a band; SMI and exemption are
direct-labelled lines.

### VISUAL FAMILY

Range-band editorial chart + L9 annotations.

### INTERACTION

Nominal/real toggle, year scrub, zoom/pan, hover/focus and click-to-pin.

### ANNOTATION

Direct end labels, crossings and changes in band width.

### TYPOGRAPHIC MOMENT

`LA ZONA DE RIESGO MIDE X € EN 2026`.

### LAYOUT

Full-width technical figure with source notes beneath the baseline.

### MOBILE

Focused time window with zoom and direct labels kept outside the plot.

### IMPLEMENTATION

Custom SVG band with existing threshold datasets.

---

## 12 — Normative / methodology appendix

### QUESTION

Which legal changes, sources and assumptions support the figures?

### CURRENT PROBLEM

A filterable timeline works, but it still reads as a page section rather than a paper
appendix and keeps too many small containers.

### PRIMARY INSIGHT

Fiscal results are traceable to dated legal changes and named official sources.

### PRIMARY VISUAL

An annotated vertical almanac with reform type, legal citation and only the parameters
that changed.

### VISUAL FAMILY

L9 Timeline Almanac.

### INTERACTION

Filter by IRPF/SS/CCAA/SMI, expand legal detail, keyboard navigation and deep links.
Timeline scale can zoom between the full 15-year span and local periods.

### ANNOTATION

Short reform summaries live on the timeline; long caveats move to appendix notes.

### TYPOGRAPHIC MOMENT

`APPENDIX / A METODOLOGÍA / B FUENTES / C PARÁMETROS / D NORMATIVA`.

### LAYOUT

Quiet paper appendix with folios, rules and dense source typography.

### MOBILE

Single vertical spine with full-width expandable entries.

### IMPLEMENTATION

Existing React timeline and links, visually restructured; no data changes.

---

## Before / after quality gates

Every major figure must pass these checks:

1. The first frame communicates measure, unit, current state and main pattern.
2. The geometry encodes a fiscal quantity rather than decorating a component.
3. Labels are attached to marks; tooltips add detail rather than supply meaning.
4. Zoom has a visible reset, keyboard access and does not hide sources.
5. Mobile is recomposed rather than merely stacked.
6. No demo Lieflat data, sources or conclusions enter FiscalScope.
7. All calculation inputs and outputs remain owned by the existing fiscal engine.
