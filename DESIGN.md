# FiscalScope — Design System
## An Immersive Interactive Fiscal Paper

> This document is the permanent visual source of truth for FiscalScope.
>
> FiscalScope is NOT a dashboard, NOT a SaaS interface and NOT a conventional
> financial website.
>
> It is an immersive interactive fiscal publication.
>
> The interface should feel like an economic paper, data-journalism feature,
> visual essay and exploratory fiscal atlas that happens to live on the web.

---

# 1. PRODUCT DEFINITION

FiscalScope explains what happens between:

- the economic cost of labour;
- gross salary;
- employee contributions;
- employer contributions;
- IRPF;
- fiscal mechanisms;
- historical taxation;
- net disposable salary.

It combines:

- calculation;
- explanation;
- exploration;
- historical comparison;
- data visualization;
- methodology;
- legal sources.

The user should feel that they are exploring an authored economic publication,
not navigating a software dashboard.

The design must combine:

**analytical rigor + visual surprise + interaction + editorial clarity.**

---

# 2. CORE DESIGN PRINCIPLE

Do not design:

> a website with an editorial theme.

Design:

> an interactive paper that happens to live on the web.

This distinction must guide every decision.

The page itself is the interface.

The data itself determines the composition.

---

# 3. NEGATIVE REFERENCES

FiscalScope must NOT look like:

- a SaaS dashboard;
- a fintech landing page;
- a telecommunications company website;
- a corporate marketing site;
- a card-based admin application;
- a Tailwind dashboard template;
- a generic React chart demo.

Avoid the conventional sequence:

```text
NAVBAR

HERO

SUBTITLE

CTA / FORM

CARD

CARD

CARD

CHART

CHART
```

Also avoid:

```text
heading
paragraph
rounded card
chart
```

repeated for every section.

---

# 4. PRIMARY VISUAL REFERENCE

The principal data-visualization reference is:

https://github.com/larashero3-dotcom/lieflat-charts

When the `lieflat-charts` skill is installed, its real examples and implementation
should be inspected.

Relevant visual families include:

- Lupi Editorial
- Interactive
- Lupi Basics
- Glance
- Wire

FiscalScope should not copy Lieflat mechanically.

Instead it should adopt the same level of:

- visual intention;
- information hierarchy;
- annotation;
- direct labelling;
- unusual but truthful geometry;
- restrained color;
- data density;
- typography;
- interaction;
- motion.

The benchmark is not "same colors".

The benchmark is "same level of art direction".

---

# 5. DATA IS PROTECTED

The following are domain assets, not design material:

- fiscal formulas;
- IRPF calculations;
- historical parameters;
- Social Security calculations;
- employer contributions;
- personal minimum;
- Art. 19 logic;
- Art. 20 logic;
- 12/14 payment logic;
- inflation adjustments;
- historical datasets;
- tax wedge calculations;
- legal references;
- official sources.

The visual representation may be radically redesigned.

The underlying fiscal meaning must remain correct.

---

# 6. PAGE ARCHITECTURE

FiscalScope should behave like a long-form publication divided into chapters.

Recommended chapter architecture:

```text
01 — TU NÓMINA

02 — DE COSTE LABORAL A NETO

03 — CÓMO FUNCIONA EL IRPF

04 — QUINCE AÑOS DE FISCALIDAD

05 — LA CUÑA FISCAL

06 — LOS MECANISMOS DEL SISTEMA

07 — NORMATIVA Y METODOLOGÍA
```

Each chapter should have its own visual rhythm.

Do not give every chapter the same layout.

Possible chapter types:

- publication cover;
- full-width figure;
- sticky explanatory graphic;
- typographic statement;
- interactive atlas;
- dark/inverted chapter;
- technical appendix;
- small-multiple matrix;
- narrow editorial text section.

---

# 7. PUBLICATION NAVIGATION

Do not use a conventional corporate navbar.

Avoid:

```text
FiscalScope | Tu nómina | Histórico | Distribución | OCDE | Normativa
```

Navigation should feel like document navigation.

Possible patterns:

```text
FISCALSCOPE

01
02
03
04
05
06
07
```

or:

```text
FISCALSCOPE
INTERACTIVE FISCAL PAPER · SPAIN · 2012—2026

INDEX
METHODOLOGY
SHARE
```

or a minimal running header:

```text
FISCALSCOPE             03 / IRPF                 2026
```

Possible navigation systems:

- vertical chapter rail;
- small floating index;
- margin navigation;
- compact INDEX trigger;
- running chapter header;
- scroll progress indicator.

Navigation must remain visually secondary to content.

---

# 8. PUBLICATION MASTHEAD

FiscalScope should behave like a publication masthead, not a corporate logo.

Possible language:

```text
FISCALSCOPE
INTERACTIVE FISCAL PAPER
SPAIN · 2012—2026
```

or:

```text
FISCAL
SCOPE

Nº 01 · 2026
```

The identity should feel editorial and restrained.

---

# 9. NO CONVENTIONAL HERO

There is no conventional marketing hero.

Do not begin with:

```text
eyebrow
large marketing title
paragraph
large whitespace
calculator card
```

The first viewport is the cover of the interactive paper.

Title, salary value, controls, source metadata and the first visualization should
coexist in one composition.

The calculator is not below the hero.

**THE CALCULATOR IS THE HERO.**

---

# 10. FIRST VIEWPORT

The first viewport should immediately communicate:

- what FiscalScope is;
- the user's gross salary;
- resulting net salary;
- current fiscal year;
- first proportional interpretation;
- official source context.

Conceptual structure:

```text
FISCALSCOPE                                  Nº 01
RADIOGRAFÍA FISCAL INTERACTIVA               2026


TU SUELDO
BAJO EL
MICROSCOPIO
FISCAL


                    32.000 €
                    BRUTO

                         ↓

                    24.433 €
                    NETO


BOE · INE · TGSS
ESPAÑA · 2012—2026
```

This is a structural example, not a literal layout requirement.

---

# 11. NO GIANT CALCULATOR CARD

Never place the entire calculator inside a giant rounded rectangle.

The calculator should live directly on the editorial canvas.

Use:

- whitespace;
- rules;
- columns;
- baselines;
- large typography;
- proportional marks;
- annotations.

Rounded containers are allowed only for small UI surfaces such as:

- compact controls;
- floating menus;
- tooltips;
- transient interaction.

A whole chapter or major figure should not be contained inside a large rounded card.

---

# 12. EDITORIAL GRID

Desktop should use a disciplined but flexible grid.

Suggested canvas:

```css
--page-max: 1500px;
--reading-max: 760px;
--gutter: clamp(18px, 3vw, 40px);
```

The layout should support:

- narrow reading columns;
- wide figures;
- large margins;
- asymmetry;
- margin notes;
- figures escaping the text column;
- full-bleed visualization.

Important graphics may occupy approximately:

```text
90–96vw
```

when appropriate.

---

# 13. USE THE MARGINS

Desktop margins are information space.

Margins may contain:

- source notes;
- methodological notes;
- definitions;
- current values;
- legal references;
- selected thresholds;
- chapter navigation;
- figure labels.

Example:

```text
MAIN FIGURE                         MARGIN

                                    TIPO MARGINAL
                                    37 %

                                    Solo afecta
                                    a la última
                                    parte de renta.
```

This is a major mechanism for making FiscalScope feel like a publication instead of
a standard website.

---

# 14. COLOR SYSTEM

FiscalScope should be primarily monochrome.

Suggested palette:

```css
:root {
  --paper: #F0EFEB;
  --paper-raised: #F7F6F2;

  --ink: #1C1C1A;
  --ink-soft: #4A4944;

  --muted: #8D8C86;
  --faint: #C8C7C0;

  --grid: #D8D7D0;
  --grid-soft: #E6E5DF;

  --signal: #F05A3C;

  --positive: #426D55;
  --negative: #9C493A;
}
```

Exact values may be tuned.

Meaning is more important than exact hex values.

Use accent only for meaningful focus:

- selected year;
- user position;
- current marginal bracket;
- active comparison;
- interactive state;
- one anomaly.

Do not decorate with color.

Avoid categorical rainbow palettes.

---

# 15. DARK CHAPTERS

Use one or two deliberate inversions to create narrative rhythm.

Good candidates:

- tax wedge;
- historical comparison;
- major summary.

Example:

```css
background: #171715;
color: #F0EFEB;
```

with the same restrained signal accent.

Do not create random dark cards.

Invert the entire chapter.

---

# 16. TYPOGRAPHIC SYSTEM

FiscalScope should use two typographic voices.

## Editorial voice

Used for:

- chapter titles;
- major statements;
- publication cover;
- selected quotations / explanations.

This may be:

- an editorial serif;
- a distinctive display face;
- or a highly expressive grotesk.

## Data / interface voice

Used for:

- numbers;
- labels;
- annotations;
- controls;
- metadata;
- tables.

This should be highly readable and precise.

Inter or another high-quality grotesk can be used here.

Numbers should use:

```css
font-variant-numeric: tabular-nums lining-nums;
```

---

# 17. TYPOGRAPHIC SCALE

Use large contrast between levels.

Indicative scale:

```text
metadata        11–12px
labels          12–14px
body            16–19px

small title     24–36px
chapter title   48–80px

chapter number  100–220px

major statement 60–140px
major data      70–180px
```

Do not make all headings approximately the same size.

Numbers are graphic material.

---

# 18. TEXT MUST ALSO BE DESIGNED

Do not render every idea as a paragraph.

Important quantitative or conceptual ideas should become visual moments.

Instead of:

```text
El tipo marginal no se aplica a todo tu salario.
```

consider:

```text
37 %

NO ES
LO QUE PAGAS
SOBRE TODO
TU SUELDO.
```

followed by:

```text
Solo afecta a la fracción de renta
que entra en el último tramo.
```

Text itself can become visualization.

---

# 19. EMPHASIS SYSTEM

Use a deliberate editorial hierarchy.

## Major data statement

```text
42,9 %
```

## Major conclusion

```text
NO LLEGA
AL NETO
```

## Inline emphasis

```text
Solo los **últimos 4.800 €** entran en este tramo.
```

## Margin note

```text
NOTA 04

El tipo efectivo y
el marginal miden
cosas diferentes.
```

## Figure annotation

```text
← tu renta termina aquí
```

## Source

```text
FUENTE · BOE · Ley 35/2006
```

Do not randomly bold entire paragraphs.

---

# 20. CHAPTER NUMBERS

Major chapters should have visible numbering.

Example:

```text
03 / 07

CÓMO FUNCIONA
EL IRPF
```

The number may become a large pale graphic element.

Chapter numbers help establish the publication metaphor.

---

# 21. FIGURES, NOT CHART CARDS

Major visualizations are figures.

Example:

```text
FIG. 04

DE CADA EURO DE COSTE LABORAL,
¿CUÁNTO TERMINA EN TU RENTA NETA?

[visualization]

Cada bloque representa 1 €.

FUENTE · TGSS · AEAT · FiscalScope
```

Figures should not automatically have:

- borders;
- backgrounds;
- rounded corners;
- shadows.

Let the page itself carry the figure.

---

# 22. CHART DESIGN PHILOSOPHY

Every chart must begin with one question:

> What exact question does this visualization answer?

Do not select chart type from the current implementation.

Select it from the data and the question.

Possible visual languages include:

- annotated line;
- direct-labelled line;
- strip plot;
- dot plot;
- slopegraph;
- proportional strip;
- progressive ruler;
- countable-unit field;
- 100-block matrix;
- connected dots;
- small multiples;
- range band;
- threshold diagram;
- timeline;
- custom flow;
- custom SVG;
- hybrid HTML/SVG composition.

---

# 23. NO DEFAULT CHART-LIBRARY LOOK

Charts must not visibly look like default:

- Recharts;
- Chart.js;
- ECharts;
- D3 examples.

Even if one of these libraries supplies scales or geometry, customize:

- labels;
- marks;
- typography;
- annotations;
- axes;
- grid;
- interaction;
- transitions;
- layout.

Every major figure should feel individually art-directed.

---

# 24. CUSTOM SVG

Custom SVG is strongly encouraged when it improves clarity or originality.

Especially for:

- salary journey;
- IRPF progressive brackets;
- tax wedge;
- Art.20;
- threshold visualizations;
- historical annotations;
- proportional decompositions.

Use native SVG when it enables:

- precise geometry;
- custom annotations;
- direct labels;
- meaningful transitions;
- large interaction hit areas;
- responsive composition.

Do not introduce another chart library unless technically justified.

---

# 25. STATIC FIRST FRAME

Every visualization must already communicate before interaction.

A user should understand:

- what is being measured;
- the unit;
- primary pattern;
- current state;
- important result;

without opening a tooltip.

Interaction adds depth.

It must not rescue a weak chart.

---

# 26. INTERACTION SYSTEM

Interaction is a first-class requirement.

Use these conventions consistently:

## Hover
Temporary exploration.

## Click
Pin / lock a value.

## Drag
Explore continuous values.

## Scrub
Move through time or range.

## Toggle
Change perspective.

## Linked selection
Update related figures.

## Keyboard focus
Provide equivalent exploration when practical.

Interaction must reveal information.

Avoid meaningless hover animation.

---

# 27. CROSS-HIGHLIGHTING

Related visualizations should communicate.

Hovering IRPF may:

- emphasize IRPF in salary composition;
- emphasize IRPF in salary journey;
- expose percentage;
- expose euros;
- dim unrelated pieces.

Hovering a year may:

- highlight its historical curve;
- update comparison text;
- update effective rate;
- update timeline metadata.

Hovering a tax bracket may:

- isolate that bracket;
- display taxable amount;
- display rate;
- display tax generated.

---

# 28. SHARED FISCAL STATE

Selections such as:

```text
salary = 32.000 €
year = 2020
payments = 12
```

should drive related figures.

Potentially synchronize:

- calculator;
- salary decomposition;
- IRPF bracket position;
- marginal rate;
- tax wedge;
- historical figures;
- Art.20 position.

One underlying fiscal state.

Many visual representations.

---

# 29. TOOLTIP STYLE

Avoid generic floating chart-library tooltips.

Prefer direct dynamic annotations.

When tooltips are useful:

```text
2020

25.984 €
NETO REAL

18,4 %
IRPF EFECTIVO
```

Keep them:

- compact;
- typographically hierarchical;
- low-chrome;
- accessible;
- visually consistent.

---

# 30. SALARY CALCULATOR

The calculator should itself be a figure.

The user should not perceive:

```text
form → submit → result cards
```

Instead:

salary input, visual result and proportional interpretation should coexist.

Conceptual language:

```text
32.000 €
SALARIO BRUTO

0 € ─────────────●────────────────── 150.000 €


                           24.433 €
                           NETO ANUAL

                           2.036 €
                           POR PAGA
```

Changing salary should immediately transform the visualization.

---

# 31. SALARY COMPOSITION

Avoid default donut charts.

Preferred directions:

- proportional strips;
- countable units;
- dot fields;
- euro blocks;
- nested subtraction;
- allocation bands.

Use direct labels.

Geometry should have quantitative meaning.

---

# 32. SALARY JOURNEY

This is a signature FiscalScope figure.

Question:

> Where does each euro of labour cost go?

The visual should represent:

```text
COSTE LABORAL
██████████████████████████████████████

          ↓ cotizaciones empresa

SALARIO BRUTO
████████████████████████████

          ↓ SS trabajador

████████████████████████

          ↓ IRPF

RENTA NETA
████████████████████
```

Width or area must represent real quantities.

Integrate:

- values;
- percentage;
- source;
- explanatory labels.

---

# 33. SALARY-JOURNEY SCROLLYTELLING

A sticky full-height figure may be used.

Suggested sequence:

```text
01
total labour cost

02
employer contributions detach

03
gross salary remains

04
employee contributions detach

05
IRPF detaches

06
net salary remains
```

Use the same graphic transforming over time.

Do not create six separate cards.

---

# 34. IRPF PROGRESSIVE RULER

Progressive taxation should be visually obvious.

Create an income ruler where physical geometry represents brackets.

Show:

- bracket range;
- bracket rate;
- amount of user income inside;
- tax generated;
- current marginal bracket.

Conceptual example:

```text
0       12.450      20.200          35.200          60.000
├──────────┼───────────┼────────────────┼────────────────

██████████ ███████████ ████████████████▓▓▓░░░░░░░░░

19 %       24 %        30 %             37 %

                                            ↑
                                      TU RENTA
```

The user's income visibly terminates inside the relevant bracket.

---

# 35. MARGINAL VS EFFECTIVE

This concept deserves a separate visual lesson.

For example:

```text
MARGINAL
37 %

aplica solo aquí
                      ↓
██████████████████████▓


EFECTIVO
18,4 %

resultado total
sobre la base completa
```

Use a major statement such as:

```text
37 %

NO ES
TU TIPO EFECTIVO.
```

when the user's data supports it.

---

# 36. HISTORICAL ATLAS

The 2012–2026 section should behave like an exploratory fiscal atlas.

Do not simply show:

```text
chart 1
chart 2
chart 3
```

Begin with a strong comparison.

Example:

```text
MISMO SALARIO BRUTO

2012                  2026

25.840 €              26.397 €
NETO REAL             NETO REAL

            +557 €
```

Then allow exploration.

---

# 37. TIME SCRUBBER

The historical chapter should allow navigation through time.

Concept:

```text
2012 ──────────●────────────────── 2026
              2017
```

Scrubbing may update:

- net salary;
- effective IRPF;
- tax wedge;
- key thresholds;
- chart highlights;
- annotations.

The reader should feel the fiscal system changing over time.

---

# 38. HISTORICAL COLOR STRATEGY

Avoid 15 saturated colors.

Use:

```text
reference/current year   charcoal
selected comparison      signal accent
context years            gray
```

Prefer direct labels.

Avoid huge legends.

---

# 39. HISTORICAL EVENTS

Important reforms may appear as restrained annotations.

Example:

```text
2015
REFORMA IRPF
──────────────
Cambio de escala
y mínimos
```

Use thin rules.

Do not cover the chart with broad colored backgrounds.

---

# 40. SMALL MULTIPLES

Use small multiples when they reveal pattern better than an overloaded figure.

Good candidates:

- net curves;
- effective-rate curves;
- Art.20 regimes;
- historical snapshots.

Do not place every small multiple inside a separate card.

Treat the entire matrix as a single figure.

---

# 41. TAX WEDGE

This is another signature figure.

Question:

> Of every €100 that labour costs the employer, where does it go?

Use geometry where 100 has physical meaning.

Possible:

- 100 blocks;
- 100 dots;
- proportional strip;
- countable matrix.

Example framing:

```text
DE CADA 100 €
DE COSTE LABORAL

57 €
LLEGAN COMO
RENTA NETA

43 €
SE DISTRIBUYEN ENTRE

IRPF
SS TRABAJADOR
SS EMPRESA
```

---

# 42. TAX-WEDGE PERSPECTIVES

Switching:

```text
TRABAJADOR ↔ COSTE EMPRESARIAL
```

should morph the same graphic.

Maintain object continuity.

Do not replace one graphic with an unrelated chart.

---

# 43. ART.20

Do not use a generic line chart.

The mechanism itself is the visual story.

Explicitly identify:

```text
PLANA

──────────────
              \
               \
                \
                 ───────── CERO

                 CLIFF
```

Show:

- start threshold;
- transition;
- disappearance;
- user position.

Use direct editorial annotation.

---

# 44. THRESHOLD EVOLUTION

Do not default to grouped bar charts.

Possible representations:

- connected dots;
- slopegraph;
- mini timeline;
- small multiples;
- threshold ruler;
- table + sparkline.

Choose from the question and data.

---

# 45. FULL-BLEED FIGURES

Some figures should deliberately escape the normal reading column.

Strong candidates:

- salary journey;
- historical atlas;
- IRPF ruler;
- tax wedge.

Use width confidently.

Do not constrain every visualization to a standard centered card.

---

# 46. STICKY FIGURES

For complex concepts, use sticky figures selectively.

Example:

```text
LEFT                          RIGHT

explanation 01                [STICKY FIGURE]

explanation 02                [FIGURE TRANSFORMS]

explanation 03                [FIGURE TRANSFORMS]
```

Good candidates:

- salary journey;
- progressive IRPF.

---

# 47. PAGE RHYTHM

The page should alternate between:

- large figures;
- quiet text;
- major data statements;
- sticky sections;
- dense exploratory graphics;
- dark chapter;
- technical appendix.

Example:

```text
PUBLICATION COVER

↓

LIVE SALARY FIGURE

↓

TYPOGRAPHIC INSIGHT

↓

SALARY JOURNEY

↓

IRPF LESSON

↓

MARGINAL VS EFFECTIVE POSTER

↓

HISTORICAL ATLAS

↓

DARK TAX-WEDGE CHAPTER

↓

ART.20

↓

APPENDIX
```

---

# 48. RULES AND SIMPLE PRIMITIVES

Use simple graphic primitives deliberately:

- hairlines;
- baselines;
- leader lines;
- ticks;
- dots;
- bracket marks;
- subtle grids;
- dotted guides.

They should connect information.

Do not use them randomly as decoration.

---

# 49. DIRECT LABELS

Prefer:

```text
──────────── 2026

──────── 2012
```

instead of detached legends.

Direct labels make the figure feel editorial and easier to read.

---

# 50. ANNOTATIONS

Important figures should contain meaningful annotations when the data supports them.

Examples:

```text
TU SUELDO TERMINA AQUÍ
```

```text
ESTE TRAMO SOLO AFECTA
A LOS ÚLTIMOS 4.800 €
```

```text
AQUÍ DESAPARECE
LA REDUCCIÓN
```

```text
DE CADA 100 €
X € LLEGAN AL NETO
```

Annotations must be derived from real calculations.

Never invent findings for dramatic effect.

---

# 51. MOTION

Motion should communicate state change.

Good motion:

- salary bands resizing;
- bracket filling;
- timeline marker moving;
- line morphing;
- number interpolation;
- proportional segments reallocating;
- annotations repositioning.

Bad motion:

- bouncing;
- playful springs;
- every section fading into view;
- decorative parallax.

Indicative timing:

```text
UI state change       180–300 ms
figure transition     450–800 ms
```

---

# 52. REDUCED MOTION

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

No information may depend on animation.

---

# 53. MOBILE

Mobile should feel like a digital publication.

Do not simply stack desktop cards.

Recompose visualizations.

Examples:

```text
desktop IRPF ruler
→ mobile vertical ruler

desktop wide salary flow
→ mobile vertical shrinking flow

desktop historical atlas
→ focused comparison + timeline scrubber

desktop margin note
→ inline note
```

Use:

- large type;
- edge-to-edge figures;
- chapter markers;
- sticky compact controls;
- vertical graphic compositions.

---

# 54. ACCESSIBILITY

Target WCAG AA.

Require:

- semantic headings;
- visible focus;
- keyboard-compatible controls;
- touch-friendly interaction;
- accessible chart summaries;
- text alternatives;
- sufficient contrast;
- no essential hover-only information.

---

# 55. SOURCES

Sources are part of the visual language.

Use patterns such as:

```text
FUENTE
BOE · INE · TGSS
```

or:

```text
BOE · Ley 35/2006
Euros constantes de 2026
```

Do not hide important methodology behind tiny icons.

---

# 56. APPENDIX

The ending should feel like a research appendix.

Suggested structure:

```text
APPENDIX

A
METODOLOGÍA

B
FUENTES

C
PARÁMETROS

D
NORMATIVA

E
LIMITACIONES
```

Use:

- compact tables;
- legal timelines;
- source references;
- methodological notes.

---

# 57. FOOTER

Do not create a standard multi-column website footer.

End like a publication.

For example:

```text
────────────────────────────────────

FISCALSCOPE

Datos:
BOE · INE · TGSS

Periodo:
2012—2026

Metodología:
FiscalScope

────────────────────────────────────

END OF REPORT
```

---

# 58. VISUAL QUALITY TEST

For every major figure ask:

## Visual
Does it look materially different from default chart-library output?

## Informational
Can the primary message be understood quickly?

## Interactive
Does interaction reveal something useful?

## Editorial
Are annotations integrated into the figure?

## Typographic
Are the important numbers prioritized?

## Honest
Does the geometry truthfully represent the data?

## Integrated
Does it feel like part of FiscalScope rather than an embedded widget?

If not, redesign it.

---

# 59. SCREENSHOT TEST

For every major chapter:

Take a screenshot.

Ignore the FiscalScope branding.

Ask:

> Could this belong to any generic dashboard or startup?

If yes, redesign it.

Ask:

> Does this look like a default chart-library implementation?

If yes, redesign it.

Ask:

> Does this feel like an authored interactive economic publication?

If no, redesign it.

---

# 60. FINAL PRINCIPLE

Do not force fiscal data into conventional web components.

Let:

- amount;
- proportion;
- history;
- sequence;
- threshold;
- comparison;
- interaction;

determine the composition.

Use:

**typography + geometry + annotation + interaction + motion + whitespace**

as one unified design system.

FiscalScope should feel:

- minimal but rich;
- experimental but rigorous;
- editorial but interactive;
- beautiful but analytically useful;
- unusual but understandable;
- immersive but precise.

Above all:

**FISCALSCOPE MUST NOT LOOK LIKE A NORMAL WEBSITE.**
