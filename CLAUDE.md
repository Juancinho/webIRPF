# CLAUDE.md — FiscalScope

Always read `DESIGN.md` before changing the interface.

The redesign goal is a calm, editorial fiscal-data publication inspired by
Lieflat Charts, not a generic dashboard.

Protected concerns:
- fiscal formulas and historical parameters;
- source/legal attribution;
- existing interactions and export/share behavior;
- responsive and accessible operation.

Use Lieflat's `SKILL.md`/catalog/templates to understand chart grammar, but port only
the needed structures into the application's existing framework.

Do not:
- replace the app with static report HTML;
- keep demo data;
- introduce a second chart library casually;
- turn every section into a rounded card;
- use decorative gradients/glassmorphism;
- use many saturated colors for years.

Before finishing, run the build/lint/tests and inspect at 375px, 768px and 1440px.
