# AGENTS.md — FiscalScope

FiscalScope is an immersive interactive fiscal paper.

Before making any substantial UI or visualization change, read:

1. `DESIGN.md`
2. `REDESIGN_PROMPT.md` if the current task is the redesign
3. `VISUAL_PLAN_V4.md` — the current art direction (COLD PRESS)
4. `STORYBOARD_V2.md` — the current chapter-by-chapter plan
5. the installed `lieflat-charts` skill when the task involves visualization

The main visual reference is:

https://github.com/larashero3-dotcom/lieflat-charts

Do not merely copy its colors. Study its actual visualization grammar.

---

## Product identity

FiscalScope must NOT be designed as:

- a SaaS dashboard;
- a corporate website;
- a fintech landing page;
- a telecom-style website;
- a card-based admin interface;
- a generic React application.

FiscalScope should feel like:

- an interactive research paper;
- economic data journalism;
- a visual fiscal essay;
- a high-end data publication;
- an exploratory fiscal atlas.

The guiding principle is:

> Do not design a website with a paper-like theme.
> Design an interactive paper that happens to live on the web.

---

## Protected fiscal logic

Do not casually modify:

- IRPF formulas;
- tax brackets;
- historical parameters;
- Social Security logic;
- employer contribution calculations;
- personal minimum;
- Art. 19;
- Art. 20;
- inflation adjustment;
- 12/14 payment logic;
- tax wedge calculations;
- historical datasets;
- legal references;
- source data.

The fiscal data and domain logic are the source of truth.

The visual representation is redesignable.

---

## Before redesigning a visualization

For every major figure:

1. identify the exact question it answers;
2. inspect its underlying data;
3. identify what is weak about the current encoding;
4. choose the best visual representation;
5. do not preserve the current chart type automatically;
6. consider a custom SVG;
7. define the main static insight;
8. define useful interaction;
9. define annotations;
10. define mobile behavior.

Do not treat existing JSX as the design specification.

---

## Lieflat usage

When visualization work is involved and the skill is installed, inspect:

- `SKILL.md`
- `catalog.md`
- `report-catalog.md`
- `mono-tokens.js`
- `color-presets.js`
- relevant templates
- relevant examples

Prefer:

- Lupi Editorial for dense explanation;
- Interactive for exploration;
- Lupi Basics only when a conventional chart is genuinely optimal;
- Glance for concise summary figures.

Do not import complete standalone report templates into the application.

Port the visual concepts into FiscalScope's architecture.

---

## Visual architecture

Never introduce or preserve by default:

- conventional corporate navbars;
- giant marketing heroes;
- large rounded calculator cards;
- repetitive card grids;
- `heading → paragraph → card → chart` section templates;
- generic dashboard KPI grids;
- default chart-library styling.

Prefer:

- publication mastheads;
- chapter numbers;
- running headers;
- marginal navigation;
- figure numbers;
- source lines;
- margin notes;
- full-width figures;
- sticky visual narratives;
- asymmetric editorial layouts;
- large typographic data statements;
- open page composition.

---

## Navigation

Navigation should behave like document navigation.

Prefer:

- chapter rail;
- compact INDEX;
- running chapter header;
- subtle progress indicator;
- margin navigation.

Do not build a typical product navbar unless there is a strong documented reason.

---

## Cards and surfaces

Do not wrap major content in large rounded cards.

Rounded containers are acceptable for:

- compact controls;
- menus;
- tooltips;
- transient interactive surfaces.

Major chapters and figures should normally remain open on the page.

Use:

- whitespace;
- rules;
- grid;
- alignment;
- typography;

for grouping.

---

## Typography

Treat typography as part of visualization.

Use:

- strong numeric hierarchy;
- editorial statements;
- margin notes;
- metadata;
- source lines;
- direct annotations.

Important conclusions may become large typographic visual moments.

Do not render all explanatory content as identical paragraphs.

Numbers should use tabular figures.

---

## Charts

Charts must not look like default:

- Recharts;
- Chart.js;
- ECharts;
- D3 examples.

Customize:

- geometry;
- labels;
- grid;
- marks;
- typography;
- annotation;
- interaction;
- transitions.

Consider:

- proportional strips;
- countable units;
- slopegraphs;
- small multiples;
- strip plots;
- direct-labelled lines;
- custom timelines;
- progressive rulers;
- connected dots;
- range bands;
- custom SVG.

Avoid unnecessary pie and donut charts.

---

## Static-first rule

Every figure must communicate before interaction.

A tooltip must never be required to understand the basic chart.

Interaction adds detail.

---

## Interaction language

Use consistent semantics:

- hover = temporary exploration;
- click = pin / lock;
- drag = explore continuous range;
- scrub = time navigation;
- toggle = change perspective;
- linked selection = synchronize related figures.

Where multiple figures depend on the same salary/year state, keep them synchronized.

---

## Cross-highlighting

Related visualizations should highlight one another where meaningful.

Examples:

- IRPF hover may highlight IRPF in salary journey;
- historical-year hover may update comparison text;
- bracket hover may show tax generated;
- tax-wedge hover may update explanatory labels.

---

## Motion

Motion should explain changes.

Good:

- number interpolation;
- bracket filling;
- proportional segment resizing;
- year cursor movement;
- line transition.

Avoid:

- decorative scrolling animations;
- bouncing;
- playful spring physics;
- random fade-in effects.

Respect `prefers-reduced-motion`.

---

## Mobile

Do not merely stack desktop components.

Recompose major figures for mobile.

Examples:

- horizontal ruler → vertical ruler;
- wide salary flow → vertical flow;
- historical atlas → focused comparison + scrubber;
- margin note → inline editorial note.

Mobile should remain visually ambitious.

---

## Sources

Keep official attribution visible.

Important figures should show their source where appropriate.

Do not hide methodology behind an icon.

---

## Implementation constraints

Do not migrate frameworks merely for design.

Do not add a second chart library unless justified.

Prefer:

1. current application stack;
2. native SVG for bespoke editorial graphics;
3. lightweight HTML/CSS when appropriate.

Preserve performance.

Do not ship demo assets from Lieflat.

---

## Validation

Before finishing UI work:

- run production build;
- run lint;
- run tests if present;
- verify fiscal calculations;
- inspect console errors/warnings;
- inspect 375px;
- inspect 768px;
- inspect 1440px;
- check keyboard navigation;
- check reduced motion;
- verify source attribution.

---

## Screenshot critique

After implementing an important section, ask:

> Does this still look like a normal website?

If yes, redesign it.

Ask:

> Could this screenshot come from a generic dashboard template?

If yes, redesign it.

Ask:

> Does the chart still look like a default chart-library component?

If yes, redesign it.

Ask:

> Does it feel like an authored interactive economic publication?

If no, redesign it.

---

## Final rule

The data is the source of truth.

The current presentation is disposable.

Let the data determine the composition.
