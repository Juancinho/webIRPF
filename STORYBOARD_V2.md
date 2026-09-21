# STORYBOARD_V2 — FiscalScope Nº 01

## The publication, chapter by chapter
### Companion to `VISUAL_PLAN_V4.md` (art direction **COLD PRESS**)

> Read `VISUAL_PLAN_V4.md` first. This document decides, from first principles and for each
> chapter: the question, the centerpiece, what is discarded, the Lieflat lineage, the custom
> SVG, the interaction, the editorial emphasis, the format, and the mobile transformation.
>
> All numbers shown in the wireframes are real outputs of `src/engine/irpf.js` for
> 35.000 € · 2026 · asalariado · individual · estándar. They move with the reader.

---

# THE ARC

The page is one argument told in eight movements, not eight independent sections.

```text
00  PORTADA            cover        the instrument, cold open, your two numbers
        ↓ the net number you just saw has a longer story behind it
01  TU NÓMINA          reading      what you see on the payslip
        ↓ but your payslip starts lower than what you cost
02  EL VIAJE           sticky       what your work costs and where it goes
        ↓ the largest single deduction was IRPF — how is it built?
03  CÓMO FUNCIONA      sticky       brackets, marginal vs effective, the Art. 20 cliff
        ↓ these rules are not eternal — they have been rewritten fifteen times
04  QUINCE AÑOS        figure       same real salary, 2012–2026, and the reforms
        ↓ step back: of every 100 € your work costs, where does it end up?
05  LA CUÑA            INVERTED     the hundred-unit figure, worker ↔ employer, OECD
        ↓ and where does that leave you, among everyone else?
06  TU LUGAR           figure       the salary distribution, and your share of the debt
        ↓ everything above is computable — here is the machinery
07  APÉNDICE           appendix     methodology, parameters, law, questions, sources
```

Rhythm check: reading → sticky → sticky → figure → **inverted** → figure → appendix.
No two consecutive chapters share a format. One inversion, at the climax.

## Standing furniture

**Running header** (appears after the cover, hairline bottom border, 36px tall):

```text
FISCALSCOPE                     03 / CÓMO FUNCIONA EL IRPF                  2026
────────────────────────────────────────────────────────────────────────────────
```

**Chapter rail** (≥1200px, fixed left, 56px wide): numerals `00`–`07` in JetBrains Mono,
`--ink-6`, current chapter `--ink`, a 1px petrol scroll-progress line running through them.
Below 1200px it becomes a compact `ÍNDICE` chip in the running header opening a full-screen
index sheet.

**La cinta** — bottom tape, always reachable from chapters 01–06 (see `VISUAL_PLAN_V4.md §6`).

---

# 00 · PORTADA

| | |
|---|---|
| **Question** | What is this, and what happens to my salary? |
| **Format** | Full-viewport cover. No tape, no running header. Asymmetric: masthead top-left, live figure lower-right. |
| **Centerpiece** | **FIG. 01 — LA REGLA**: a full-width income ruler carrying the reader's own mark, with the net value hanging from it. |
| **Discarded** | The entire `bf95318` hero: eyebrow + marketing title + paragraph + separate calculator card. The calculator *is* the cover. |
| **Lieflat lineage** | F11 Tick Gauge (single-value progress on a real axis) + the gallery's "calendar floor" furniture: a full rim of hairline ticks under the axis, every fifth tick longer, decade marks labelled. |
| **Custom SVG** | Yes — 100 %. Ruler, ticks, reader mark, leader line, the 100-unit proportion bar. |
| **Interaction** | Drag the mark or type in the value; arrow keys step 500 €, Shift+arrow 5.000 €. Year stepper top-right. Everything below the fold recomputes. |

```text
FISCALSCOPE                                              Nº 01 · 2026
PAPEL FISCAL INTERACTIVO · ESPAÑA · 2012—2026


TU SUELDO
BAJO EL                                     35.000 €
MICROSCOPIO                                 BRUTO ANUAL
FISCAL
                        0 ├─────────────●──────────────────────────┤ 150.000
                          ┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊│┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊
                                        │  2,05 × SMI · PERCENTIL 67
                                        ▼
                                            26.397 €
                                            NETO ANUAL
                                            2.200 € AL MES · 12 PAGAS

                                            DE CADA 100 € DE COSTE LABORAL
                                            ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌░░░░░░░░░░░░
                                            57,1 € LLEGAN A TU CUENTA

FUENTE · BOE · AEAT · TGSS · INE                        SIGUE LEYENDO ↓
```

- **Editorial emphasis**: `26.397 €` at major-data scale (Inter 800, tabular), the title in
  Newsreader at chapter-title scale, `57,1 €` as the hook that chapter 05 will resolve.
- **Mobile**: masthead → statement → value → vertical ruler running down the screen with the
  mark on it → net → the 100-unit bar full-bleed. The ruler rotates; nothing is dropped.

---

# 01 · TU NÓMINA

| | |
|---|---|
| **Question** | What of my salary is actually mine, and what leaves before I see it? |
| **Format** | Reading column with an active margin rail. Quiet chapter — it earns the drama that follows. |
| **Centerpiece** | **FIG. 02 — EL LIBRO DE LA NÓMINA**: an editorial ledger where each line is a strip of countable rungs, one rung = 250 €. Subtractions are dashed and hollow, the result is solid. |
| **Discarded** | The KPI chip grid, the four `InfoCard`s, the stacked distribution bar, the coloured tags. |
| **Lieflat lineage** | F9 Rung Waterfall (solid rungs add, dashed rungs take away) with F1 Rung Bars' countable units and every-fifth-rung dot. |
| **Custom SVG** | Yes. Ledger strips, dashed subtraction rails, leader lines to the right-hand values. |
| **Interaction** | Hover or focus a line → its formula, its legal article and its source appear in the rail (never in a floating tooltip). `12 / 14 pagas` toggles the per-paga column in place. Hovering `IRPF` sets `focus` and dims IRPF's counterparts elsewhere on the page. |

```text
01                 LO QUE VES
                   EN LA NÓMINA
FUENTE
TGSS · AEAT        BRUTO ANUAL      ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌   35.000 €
BOE Art. 19.2.f
                   SS TRABAJADOR    ┆┆┆┆                            −2.275 €
NOTA 01                             6,50 % sobre la base de cotización
El 6,50 % sale de
4,70 % contingen-  IRPF RETENIDO    ┆┆┆┆┆┆┆┆┆┆┆                     −6.329 €
cias comunes +                      tipo efectivo 18,1 %
1,55 % desempleo
+ 0,10 % FP +      ─────────────────────────────────────────────────────────
0,15 % MEI.        NETO ANUAL       ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌          26.397 €

                                    2.200 € / MES     12 PAGAS
                                    1.886 € / MES     14 PAGAS

                   UNA MARCA = 250 € · MARCAS LLENAS SUMAN · HUECAS RESTAN
```

- **Editorial emphasis**: `26.397 €` large; the words `LO QUE VES` in the title set against
  chapter 02's `LO QUE CUESTAS` — the two halves of one sentence, one chapter apart.
- **Preserved**: 12/14 pagas, SMI multiple, "sin IRPF" and "límite 43 % activo" states (now
  as rail notes, not coloured chips), all formulas and legal citations.
- **Mobile**: ledger stays vertical (it already is); the rung strips become full-width and
  the values sit under each label. Rail notes inline, between hairlines.

---

# 02 · EL VIAJE DE CADA EURO

| | |
|---|---|
| **Question** | Of everything your work costs the employer, where does each euro end up? |
| **Format** | **Sticky, full-bleed.** The figure pins for the height of six captions; one graphic transforms through six states. This is the first signature figure. |
| **Centerpiece** | **FIG. 03 — EL DESCENSO**: five stacked proportional strips (coste laboral → bruto → rendimiento íntegro → base imponible → neto), each a barcode of countable ticks, with hairline threads trickling from one strip to the next and the percentage that survives each step parked in the left margin. |
| **Discarded** | The twelve stacked `Paso` cards with gradient badges. The steps survive as scroll captions and as appendix rows; the card stack does not. |
| **Lieflat lineage** | L13 Hourglass Stream, near-literally in grammar: strip width ∝ quantity, threads between stages, conversion percentage in the margin, stage label tied to the strip edge by a hairline. |
| **Custom SVG** | Yes, the most bespoke figure in the publication. Deterministic `rnd` jitter on tick position and opacity gives the strips their texture. |
| **Interaction** | Scroll drives the six states. Hovering any strip segment sets `focus`; clicking pins the step and opens its formula + BOE link in the rail. Reduced motion or no-JS: all six states render stacked and annotated. |

```text
                               02 / EL VIAJE DE CADA EURO

   57,1 %          COSTE LABORAL TOTAL ─────────────────────────── 46.253 €
   LLEGA           ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
                     ╲  ╲   ╲    ╲   ╲   ╲       −11.253 € SS EMPRESA
   −24,3 %         SALARIO BRUTO ───────────────────────────────── 35.000 €
                   ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
                     ╲  ╲   ╲   ╲    ╲          −2.275 € SS TRABAJADOR
   −6,5 %          RENDIMIENTO ÍNTEGRO ────────────────────────── 32.725 €
                   ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
                     ╲   ╲   ╲   ╲              −2.000 € ART. 19.2.f
   BASE            BASE IMPONIBLE ───────────────────────────────  30.725 €
   IMPONIBLE       ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
                     ╲   ╲   ╲   ╲   ╲   ╲      −6.329 € IRPF
   57,1 %          RENTA NETA ──────────────────────────────────── 26.397 €
   DEL COSTE       ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌

   UNA MARCA = 250 € DE COSTE LABORAL        FUENTE · TGSS · BOE LIRPF · AEAT
```

- **Scroll captions** (right column on desktop, below the pinned figure on mobile) carry the
  protected prose of steps A–L: coste laboral, SS empresa, bruto, SS trabajador, rendimiento
  íntegro, Art. 19.2.f, Art. 20, base imponible, mínimo personal y familiar, cuota por
  tramos, deducción SMI, IRPF final. Each caption keeps its formula and its BOE link.
- **Editorial emphasis**: a typographic beat between states 4 and 5 —
  **`11.253 €`** / `NUNCA APARECEN EN TU NÓMINA` — the employer contribution, set large,
  because it is the number readers have never seen.
- **Mobile**: figure pins at 62vh, captions scroll beneath, three progress dots; strips
  become full-bleed horizontal bars stacked vertically — the same graphic, narrower.

---

# 03 · CÓMO FUNCIONA EL IRPF

The largest chapter: four figures, one lesson, one anomaly.

## FIG. 04 — LA ESCALERA

| | |
|---|---|
| **Question** | Why doesn't "the 30 % bracket" mean I pay 30 %? |
| **Format** | Sticky figure, asymmetric: ruler left (8 cols), explanation right (4 cols). |
| **Centerpiece** | Bracket columns whose physical height is the bracket's span; filled rungs are the euros of *your* base inside it, hollow rungs the capacity you never reach. Your income visibly terminates inside one column. |
| **Discarded** | The bracket table and the Recharts bar chart. |
| **Lieflat lineage** | F1 Rung Bars (one rung = one honest unit, every fifth marked), with the gallery's "unused capacity" expressed as hollow rungs rather than a second color. |
| **Interaction** | Hover a bracket → euros inside, rate, tax generated, appears in the rail. Dragging the salary in the tape fills and empties the columns in real time. |

```text
   0        12.450      20.200          35.200          60.000        →
   ├──────────┼───────────┼────────────────┼────────────────┼─────────
   ▌▌▌▌▌▌▌▌▌▌ ▌▌▌▌▌▌▌▌▌▌▌ ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌ ░░░░░░░░░░░░░░░░ ░░░░░░░░░
   19 %       24 %        30 %             37 %             45 %
   2.366 €    1.860 €     3.158 €          —                —
                                          ↑
                                  TU BASE TERMINA AQUÍ · 30.725 €

   CUOTA ÍNTEGRA 7.383 €  −  MÍNIMO PERSONAL 1.055 €  =  IRPF 6.329 €
   UNA MARCA = 250 € DE BASE IMPONIBLE       FUENTE · BOE · LIRPF Art. 63
```

## FIG. 05 — 37 % NO ES LO QUE PAGAS

A typographic poster, not a chart. Two aligned tick gauges under it, same axis, so the
difference is geometric rather than rhetorical.

```text
   37 %                        MARGINAL   ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
                                          se aplica sólo a tu último tramo
   NO ES
   LO QUE PAGAS                EFECTIVO   ▌▌▌▌▌▌▌▌▌▌▌▌▌
   SOBRE TODO                             18,1 % del bruto · 6.329 €
   TU SUELDO.
```

- **Lieflat lineage**: F11 Tick Gauge ×2 on a shared axis. **Discarded**: prose + chips.
- **Editorial emphasis**: the statement is set in Newsreader at major-statement scale; the
  rate shown is always the reader's real marginal rate, never a hard-coded 37.

## FIG. 06 — EL ACANTILADO (Art. 20)

| | |
|---|---|
| **Question** | Why does a raise sometimes barely reach me? |
| **Format** | Full-bleed figure, the anomaly of the publication. |
| **Centerpiece** | The Art. 20 reduction curve annotated **PLANA / CAÍDA / CERO**, drawn over a marginal-rate barcode: one tick per 250 € of gross, tick height = total marginal rate. The 79 % spike between 17.000 € and 18.500 € is visible without any interaction. |
| **Discarded** | The Recharts multi-line chart with a year legend. |
| **Lieflat lineage** | L3 Barcode Lollipop for the marginal field + a bespoke threshold diagram in the gallery's annotation idiom (all-caps leader-line notes, hairline rules, no colored background bands). |
| **Interaction** | Year selection re-draws the curve (`reduccionTrabajo` per year, real or nominal via the existing toggle). The reader's position is a petrol mark that slides with the tape. |

```text
   7.302 €  ──────────────────┐ PLANA
   REDUCCIÓN                  │ hasta 14.852 € la reducción es máxima
   MÁXIMA                     ╲
                               ╲   CAÍDA
                                ╲  cada euro extra retira 1,75 €
                                 ╲ de reducción
                                  ╲
   0 €                             ╲──────────────── CERO  desde 19.747 €

   MARGINAL  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███████▁▁▁▁▁▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
   TOTAL     6 %             79 %        50 %                  TU POSICIÓN ●
             UNA MARCA = 250 € DE BRUTO      FUENTE · BOE · LIRPF Art. 20
```

## FIG. 07 — CIEN EUROS

| | |
|---|---|
| **Question** | If they raise me 100 €, how much arrives? |
| **Centerpiece** | 100 countable units; the ones that reach the reader are inked, the rest hollow, grouped by destination (IRPF, SS). |
| **Lieflat lineage** | L14 Hundred Field — unit decomposition, one mark = one euro, unit declared in the subtitle. **Not** a donut. |
| **Interaction** | The increment is draggable (the existing simulator's control, preserved): 100 € · 1.000 € · 3.000 € · custom. The field re-forms; the sentence above it rewrites. |
| **Preserved** | The full raise-simulator arithmetic and its explanatory breakdown, now set as a margin note. |

- **Mobile for chapter 03**: the bracket ruler rotates to vertical and scrolls; the poster
  stays as-is (it is type); the cliff figure becomes a vertical curve with the barcode as a
  left-hand gutter; the hundred field reflows to 10 × 10.

---

# 04 · QUINCE AÑOS DE FISCALIDAD

| | |
|---|---|
| **Question** | The same real salary — what did it leave in 2012, and what does it leave now? |
| **Format** | Figure chapter, wide. Opens with a comparison, then allows exploration. |
| **Centerpiece** | **FIG. 08 — MISMO SUELDO, QUINCE AÑOS**: one dumbbell per year, hollow dot = net in that year, ink dot = net today, beads between them = the euros of real net lost or gained. Then **FIG. 09 — EL ATLAS**: direct-labelled hairlines with a year selector, and **FIG. 10 — LAS LÍNEAS INVISIBLES**: connected-dot threshold tracks with the reforms annotated. |
| **Discarded** | The fifteen-color line chart and its legend; the grouped threshold bars; the colored reform timeline. |
| **Lieflat lineage** | F12 Dumbbell Queue (beads = real units, no crossing lines) for the comparison; F2/F3 Hairline Line with direct end labels for the atlas; L11 Trend Lineage for the reform and threshold tracks. |
| **Interaction** | Scrub 2012 → 2026: the selected year turns petrol across every figure on screen and the comparison sentence rewrites. Year multi-selection and **CSV export preserved**. Real (€ 2026) ↔ nominal toggle preserved and made explicit in the subtitle. |

```text
                         MISMO PODER ADQUISITIVO · 35.000 € DE 2026

   2012   ○───●●●●●───────────────●   26.872 €      −600 € frente a 2016
   2013   ○───●●●●●───────────────●   26.860 €
   2014   ○───●●●●───────────────●    26.899 €
   2015   ○──────────────────────●    27.430 €
   2016   ○──────────────────────●    27.472 €   ← MÁXIMO DE LA SERIE
   …
   2024   ○───●●●●●●●●───────────●    26.613 €
   2025   ○───●●●●●●●●●──────────●    26.506 €
   2026   ●                           26.397 €   ← HOY

   UNA CUENTA = 25 € REALES DE DIFERENCIA        FUENTE · INE IPC · BOE
```

```text
   EL ATLAS · NETO REAL POR NIVEL DE RENTA          REAL (€2026) ◀▶ NOMINAL

   60.000 €┤                                              ╱───────── 2026
           │                                        ╱╱────────────── 2016
           │                                  ╱╱╱╱
   30.000 €┤                        ╱╱╱╱╱╱
           │              ╱╱╱╱╱                    ← TU SALARIO
           │    ╱╱╱╱
           └────┬──────────┬──────────┬──────────┬──────────┬────────
             15.000     35.000     55.000     75.000     95.000

   2012 ──────●───────────────────────────────────────────────── 2026
                        ▲ 2016 SELECCIONADO
```

- **Editorial emphasis**: the chapter's opening statement is the −1.075 € finding, stated
  plainly and sourced: *"El mismo sueldo real dejaba 27.472 € en 2016 y deja 26.397 € en
  2026."* Reforms appear as thin annotated rules on the atlas (2015 reforma, 2019 Art. 20,
  2023 MEI + tramo 47 %), never as colored background bands.
- **Mobile**: dumbbells become a vertical list with the bead count inline; the atlas drops
  to two hairlines (current year + scrubbed year) over a grey envelope of the other
  thirteen; the scrubber sits directly under the figure, 44px tall.

---

# 05 · LA CUÑA FISCAL  *(INVERTED)*

| | |
|---|---|
| **Question** | Of every 100 € your work costs, where does it actually go — and how does that compare abroad? |
| **Format** | **Full-bleed night ground.** The only inversion in the publication. Entered by a full-width hairline and a held beat of empty ground. |
| **Centerpiece** | **FIG. 11 — DE CADA 100 €**: 100 countable blocks in four groups, morphing between the worker and employer perspectives. Then **FIG. 12 — ESPAÑA EN LA OCDE**: a single-axis country strip. |
| **Discarded** | The **pie chart** (categorically: geometry with no countable meaning) and the OECD bar chart. |
| **Lieflat lineage** | L14 Hundred Field on a dark card — the one place Lieflat allows inversion, because the figure is a field of marks that needs the ground to hold it. L2 Dot Cascade / strip plot for the country ranking. |
| **Interaction** | `TRABAJADOR ◀▶ COSTE EMPRESARIAL` morphs the same 100 blocks — object continuity, never a graphic swap. Hovering a group sets `focus` and dims the rest. In the OECD strip, selecting a reference country (preserved) pulls it up as the counter mark. |

```text
                          DE CADA 100 € DE COSTE LABORAL

   ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪   RENTA NETA            57 €
   ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪
   ▪                                IRPF                  14 €
   ▪▪▪▪▪▪▪▪▪▪▪▪▪▪
   ▪▪▪▪▪                            SS TRABAJADOR          5 €
   ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         SS EMPRESA            24 €

   UN BLOQUE = 1 € DE CADA 100 € DE COSTE LABORAL · 57 + 14 + 5 + 24 = 100

   ──────────────────────────────────────────────────────────────────────
   CUÑA FISCAL · OCDE 2025 · SOLTERO SIN HIJOS AL 100 % DEL SALARIO MEDIO

   CL ·   MX ·  NZ ·  CH ·  IL ·  US ·  UK ·  PT ·  ES ·  SE ·  IT ·  BE
   ─┴──────┴─────┴─────┴─────┴─────┴─────┴─────┴─────●─────┴─────┴─────┴─
   7,5                          │ MEDIA OCDE 35,1  ESPAÑA 41,4      52,5
```

- **Editorial emphasis**: `57 €` set at major-data scale in bone on night, resolving the
  hook planted on the cover. Beneath it, the caveat that the OECD figure is a standardised
  single-worker case and not the reader's own — preserved from the baseline, not softened.
- **Sources**: `FUENTE · OECD Taxing Wages 2026, tabla 1.2 · TGSS · AEAT`, with the DOI,
  exactly as the engine records them.
- **Mobile**: the hundred field reflows to 10 × 10 with group labels to the right; the
  country strip rotates vertical, Spain and the OECD mean pinned, others scrollable.

---

# 06 · TU LUGAR Y TU PARTE

| | |
|---|---|
| **Question** | Where do I stand among everyone else — and what part of the public debt is mine? |
| **Format** | Two-movement figure chapter on bone again, after the inversion. Asymmetric: first movement wide, second narrow and quiet. |
| **Centerpiece** | **FIG. 13 — CIEN TRABAJADORES**: 100 marks ordered by salary, the reader's position inked in petrol, P10/P25/P50/P75/P90 as labelled hairlines. **FIG. 15 — TU PARTE**: one major number plus a rung strip of years-to-repay. |
| **Discarded** | The area + bar Recharts composition; the composed debt chart. |
| **Lieflat lineage** | L14 Hundred Field for the distribution (unit decomposition: one mark = one worker in a hundred, honest because percentiles are published), F11 Tick Gauge + F1 Rung Bars for the debt. |
| **Interaction** | Hovering any percentile hairline reports the salary at that point. The origin→destination year scenario (preserved) animates the reader's mark between two years' distributions. The debt projection horizon stays adjustable. |

```text
   CIEN TRABAJADORES EN ESPAÑA, ORDENADOS POR SALARIO · 2026

   ▪▪▪▪▪▪▪▪▪▪|▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪|▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪●▪▪▪|▪▪▪▪▪▪▪▪|▪▪
             P10            P25                    TÚ  P50      P75  P90
           12.800 €       18.593 €                67   26.090 €

   UNA MARCA = UN TRABAJADOR DE CADA CIEN   FUENTE · INE EAES tabla 28191
   2025 Y 2026 SON PROYECCIÓN PROPIA (+3,2 % ANUAL), NO DATO PUBLICADO

   ──────────────────────────────────────────────────────────────────────
   34.664 €           TU PARTE DE LA DEUDA PÚBLICA · 2026
                      ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌
                      5,5 AÑOS DE TU IRPF ÍNTEGRO
                      UNA MARCA = UN AÑO   FUENTE · Banco de España · INE
```

- **Editorial emphasis**: the percentile as a plain sentence — *"Ganas más que 67 de cada
  100 trabajadores"* — next to the mark, with the estimate caveat kept visible, not hidden.
- **Mobile**: the hundred field becomes 10 rows of 10 with the percentile hairlines as row
  labels; the debt movement is already vertical.

---

# 07 · APÉNDICE

| | |
|---|---|
| **Question** | How was all of this computed, and under what law? |
| **Format** | Research appendix. Dense two-column technical setting, smaller type, `--bone-sunk` table zebra. The tape retracts. |
| **Centerpiece** | The tables themselves. No decorative figures in this chapter. |
| **Discarded** | The gradient timeline badges, the colored milestone cards, the accordion chrome. |
| **Lieflat lineage** | The gallery's source-row typography and table discipline — uppercase, letterspaced, hairline-ruled, no boxes. L11 Trend Lineage for the chronology spine. |
| **Interaction** | Year selector drives the parameter table (preserved). Questions are a `<details>` list, open-by-default on desktop for the first, keyboard operable. |

```text
   APÉNDICE

   A  METODOLOGÍA      cómo se calcula cada paso, y qué no incluye el modelo
   B  PARÁMETROS       2012—2026: tramos, bases máximas, tipos SS, MEI,
                       mínimos, Art. 19, Art. 20, deducción SMI, solidaridad
   C  NORMATIVA        cronología de reformas con su referencia BOE
   D  PREGUNTAS        7 preguntas — progresividad fría, marginal, Art. 20,
                       mínimo personal vs mínimo exento, euros constantes…
   E  FUENTES          BOE · AEAT · TGSS · INE · OCDE · Banco de España
   F  LIMITACIONES     carácter orientativo, régimen foral aproximado,
                       IPC 2026 estimado, proyección salarial propia

   ──────────────────────────────────────────────────────────────────────
   FISCALSCOPE · Nº 01
   DATOS   BOE · INE · TGSS · AEAT · OCDE · Banco de España
   PERIODO 2012—2026
   MÉTODO  FiscalScope · herramienta independiente, sin afiliación política
   ──────────────────────────────────────────────────────────────────────
                            FIN DEL INFORME
```

- **Preserved verbatim**: every FAQ answer, every milestone, every source URL, every
  methodological caveat and estimate marker from `NormativaFAQ`, `CronologiaTimeline` and
  the engine's comments. Prose is deduplicated where the same caveat appeared three times —
  never removed.
- **Mobile**: single column; tables become labelled rows with the year as a heading; no
  horizontal scroll.

---

# CROSS-CHAPTER BEHAVIOUR

| Source of interaction | Consequence elsewhere |
|---|---|
| Salary changes (tape, cover ruler) | Every figure in chapters 00–06 recomputes and relabels |
| Year changes | Brackets, Art. 20 curve, wedge, distribution, debt, parameter table |
| Hover `IRPF` anywhere | IRPF segment emphasised in ledger, journey, ruler, wedge; rest dimmed |
| Hover a year in the atlas | Comparison sentence, dumbbell row and reform annotation update |
| Hover a bracket | Euros inside, rate and tax generated shown in the rail |
| `TRABAJADOR ◀▶ EMPRESA` | The same 100 blocks re-group; the journey highlights employer cost |
| Real ◀▶ nominal | Atlas, dumbbells, thresholds and their subtitles switch together |

One fiscal state. Many representations. Never two components disagreeing about the salary.

---

# WHAT SURVIVES FROM `bf95318`, AND IN WHAT FORM

| Baseline component | Fate |
|---|---|
| `engine/irpf.js`, `test/irpf.test.js` | **Untouched** |
| `CalculadoraCard`, `Calculadora`, `ConfigPanel` | Behaviour → cover ruler + `Cinta` + `PERFIL` sheet |
| `DesgloseEducativo` (steps A–L) | Prose and sources → chapter 02 captions + appendix A |
| `SimuladorSubida` | → FIG. 07 Cien euros |
| `GraficoComparativo` (+ CSV export) | → FIG. 08 + FIG. 09, export preserved |
| `GraficoMecanismos` (Art. 20, umbrales) | → FIG. 06 + FIG. 10 |
| `CuñaFiscal` (pie) | → FIG. 11, pie discarded |
| `OCDEComparativa` | → FIG. 12 |
| `DistribucionSalarial` | → FIG. 13 + FIG. 14 |
| `DeudaPublica` | → FIG. 15 |
| `CronologiaTimeline`, `NormativaFAQ` | → appendix C, D, E |
| `ThemeToggle` / `useTheme` | **Retired** — one bone publication, one inverted chapter |
| `ScrollReveal`, `SectionTransition`, `ProgressDots`, `SidebarWidget`, `Historico`, `Normativa`, `CurvaIRPF`, `FiscalBreakdown`, `BracketChart`, `PayrollStudy`, `SalaryJourney`, `FigureZoom`, `ConceptDetails` | Retired |
| `index.css`, `App.css`, `styles/redesign.css`, `styles/tokens.css` | Replaced by `paper.css` + `figures.css` |

---

# CHAPTER-BY-CHAPTER VALIDATION CHECKLIST

For each chapter, before it is called done:

1. Reads correctly at 375 / 768 / 1440 px, no horizontal overflow.
2. Every figure legible with JavaScript interaction untouched and with motion disabled.
3. Every annotation traced to an engine output.
4. Source line present and correct.
5. Keyboard path complete; focus visible on bone and on night.
6. No warm hue anywhere in the rendered pixels.
7. Screenshot passes the six questions in `VISUAL_PLAN_V4.md §13`.


---

# WHAT SHIPPED (implementation notes)

Twenty-three figures, numbered FIG. 01–23 in reading order. Every figure from the
pre-redesign app is present — none was dropped — and eight are new.

| Fig | Cap. | Figura | Origen |
|---|---|---|---|
| 01 | 00 | La regla — la portada interactiva | nueva |
| 02 | 01 | El libro de la nómina | nueva |
| 03 | 01 | El desglose completo, paso a paso | `DesgloseEducativo` |
| 04 | 02 | El descenso — el viaje de cada euro | `DesgloseEducativo` (scrollytelling) |
| 05 | 03 | La escalera de tramos | `CalculadoraCard` / `BracketChart` |
| 06 | 03 | Marginal frente a efectivo (cartel) | nueva |
| 07 | 03 | La curva de tipos | nueva |
| 08 | 03 | El acantilado del art. 20 | `GraficoMecanismos` |
| 09 | 03 | Cien euros de subida | `SimuladorSubida` |
| 10 | 04 | Mismo sueldo, quince años | `GraficoComparativo` (3) |
| 11 | 04 | El ranking de épocas | nueva |
| 12 | 04 | Comparador de dos años | nueva |
| 13 | 04 | El atlas — neto y tipo efectivo por renta | `GraficoComparativo` (1 y 2) |
| 14 | 04 | Progresividad en frío | nueva |
| 15 | 04 | El art. 20 a través de los años | `GraficoMecanismos` (pestaña art20) |
| 16 | 04 | Las líneas invisibles — umbrales | `GraficoMecanismos` (pestaña umbrales) |
| 17 | 05 | De cada 100 € de coste laboral | `CuñaFiscal` (tarta descartada) |
| 18 | 05 | España en la OCDE | `OCDEComparativa` |
| 19 | 06 | La curva de la distribución | `DistribucionSalarial` |
| 20 | 06 | Los percentiles | `DistribucionSalarial` |
| 21 | 06 | Cien trabajadores | nueva |
| 22 | 06 | La distribución a lo largo del tiempo | `DistribucionSalarial` (histórico) |
| 23 | 06 | Tu parte de la deuda | `DeudaPublica` |

Interaction, applied to every dense figure:

- **Zoom y paneo** (`ZoomSvg`): rueda o pellizco para ampliar alrededor del cursor,
  arrastre para desplazarse, doble clic o ⟲ para reiniciar, y las mismas acciones desde
  el teclado (`+`, `−`, `0`, flechas) cuando la figura tiene el foco. En móvil las figuras
  densas abren ya ampliadas en lugar de encoger sus etiquetas.
- **Readout propio** en lugar de tooltip flotante: una línea de lectura sobre la figura que
  sigue al cursor y nombra cada magnitud.
- **Estado fiscal compartido**: cambiar el año en cualquier figura —o pulsar un año en el
  ranking o en la evolución— mueve toda la publicación a ese año.

Deviations from the storyboard, and why:

- **El número de capítulo dejó de ser marca de agua.** Se superponía al título en los
  capítulos 02, 05 y 07; ahora abre el capítulo como elemento de flujo.
- **The base imponible is drawn as a dashed aside inside FIG. 04**, not as a step in the
  cash descent: `neto = bruto − SS − IRPF`, so a thread from the base to the net would have
  been a false geometry.
- **Threshold evolution and the art. 20 history are separate figures** (15 y 16): they
  answer different questions and share no axis.
