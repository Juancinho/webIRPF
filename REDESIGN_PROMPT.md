# FiscalScope — Master Redesign Prompt for Codex / Claude Code

You are redesigning an existing production web application: FiscalScope.

Public reference:
https://fiscal-scope.vercel.app/

Visual reference / chart skill:
https://github.com/larashero3-dotcom/lieflat-charts

The goal is a **complete visual redesign**, not a cosmetic reskin.

## Mandatory first steps

1. Read `DESIGN.md` completely.
2. Inspect the repository architecture, `package.json`, routes, styling system, chart
   libraries, state management, fiscal calculation modules, tests and data files.
3. Run the current project locally before editing.
4. Identify the existing behavior of every major section.
5. Record a short implementation plan in the terminal/output before changing code.
6. Do not change framework or application architecture unless there is a concrete
   technical need.

If the `lieflat-charts` skill is installed, read its:
- `SKILL.md`
- `catalog.md`
- `mono-tokens.js`
- `color-presets.js`
- relevant templates/examples

Use Lieflat to guide chart selection and visual grammar, not as a drop-in site template.

## Product goal

Turn FiscalScope into a polished, minimalist, editorial fiscal-data product.

The desired feeling is:
- economic research publication;
- interactive data story;
- precise financial instrument;
- warm paper + charcoal ink;
- restrained use of a single accent;
- excellent typography;
- generous whitespace;
- dense data only where density is useful.

It must NOT look like:
- an admin dashboard;
- a generic Tailwind card gallery;
- a fintech landing page;
- a glassmorphism template;
- an AI startup site.

## Preserve behavior

Treat existing fiscal calculations and datasets as protected domain logic.

Do not knowingly alter:
- historical IRPF parameters;
- Social Security calculations;
- inflation adjustments;
- 12/14-payment logic;
- Art. 19 / Art. 20 behavior;
- personal minimum behavior;
- tax wedge data;
- legal sources;
- year comparison logic.

If refactoring domain logic is necessary, add regression checks first.

## Work order

Implement in this order:

### Phase 1 — audit and foundation
- inspect current UX and code;
- create design tokens;
- update global typography/background/layout;
- build reusable low-level primitives;
- establish responsive grid.

### Phase 2 — navigation + hero + calculator
- redesign header;
- redesign hero;
- rebuild calculator layout around one dominant result;
- replace button clutter with refined controls;
- preserve every calculator behavior.

### Phase 3 — salary journey + brackets
- turn the salary journey into an annotated editorial ledger/flow;
- create a clearer progressive IRPF bracket visualization;
- retain formulas and sources.

### Phase 4 — historical charts
- use Lieflat Lupi Editorial / Lupi Basics principles;
- current year in dark ink;
- one selected comparison in accent;
- remaining context in gray;
- direct labels where practical;
- avoid a 15-color legend;
- separate conflicting units instead of creating unreadable dual axes.

### Phase 5 — tax wedge + mechanisms
- redesign tax wedge as proportional/countable data;
- preserve worker/employer perspectives;
- redesign Art.20 curves and threshold evolution;
- clearly annotate PLANA / CLIFF / CERO.

### Phase 6 — normative appendix
- redesign normative history, parameters, FAQ and sources as a calm research appendix;
- improve tables;
- reduce duplicated prose without removing essential caveats.

### Phase 7 — polish
- responsive pass at 375 / 768 / 1440 px;
- keyboard and focus pass;
- reduced-motion pass;
- performance pass;
- verify sources and links;
- build/lint/test.

## Chart implementation rule

Do not automatically add Chart.js or ECharts.

First determine what chart library the application already uses. If it can reproduce
the target output cleanly, keep it.

Use native SVG for bespoke editorial charts when that is simpler and lighter.

If Lieflat provides a useful template:
1. understand the data contract;
2. understand its geometry and annotation strategy;
3. port the design into a reusable component in the current stack;
4. replace all demo data with FiscalScope data;
5. keep FiscalScope's accessibility and responsive requirements.

## Visual rules

Follow `DESIGN.md` as the source of truth.

Especially:
- background near `#F0EFEB`;
- ink near `#1C1C1A`;
- thin gray rules;
- one accent used sparingly;
- Inter;
- tabular numerals;
- minimal shadows;
- cards only where a distinct interactive surface is needed;
- no visual noise;
- no unnecessary icons;
- no arbitrary gradients.

## Validation

Before finishing:

- run the production build;
- run lint/tests if present;
- exercise representative salaries across low / middle / high ranges;
- compare several historical years;
- check 12 and 14 payments;
- verify all major toggles and year selectors;
- verify mobile layout;
- verify no horizontal overflow;
- verify no demo data survived;
- check console warnings/errors;
- ensure accessible focus states;
- ensure reduced motion.

Then provide a concise summary:
- files changed;
- major visual decisions;
- chart implementation decisions;
- any domain logic intentionally untouched;
- any remaining technical debt.

Do not stop after creating mockups. Implement the redesign in the actual application.
