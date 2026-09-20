# Lieflat Charts setup

Lieflat Charts is already an Agent Skill; you do not need to create a replacement
skill just to use its chart language.

Repository:
https://github.com/larashero3-dotcom/lieflat-charts

## Install with the skills CLI

```bash
npx skills add https://github.com/larashero3-dotcom/lieflat-charts --skill lieflat-charts
```

## Claude Code manual install

```bash
git clone https://github.com/larashero3-dotcom/lieflat-charts \
  ~/.claude/skills/lieflat-charts
```

Verify:

```bash
test -f ~/.claude/skills/lieflat-charts/SKILL.md
test -f ~/.claude/skills/lieflat-charts/catalog.md
test -f ~/.claude/skills/lieflat-charts/mono-tokens.js
```

## Codex manual install

```bash
git clone https://github.com/larashero3-dotcom/lieflat-charts \
  ~/.codex/skills/lieflat-charts
```

Verify the same files under `~/.codex/skills/lieflat-charts`.

## Project files

Copy into the root of the FiscalScope repository:

- `DESIGN.md`
- `AGENTS.md` for Codex
- `CLAUDE.md` for Claude Code
- optionally keep `REDESIGN_PROMPT.md` as the task prompt

Then start the agent from the project root and give it the contents of
`REDESIGN_PROMPT.md`, or simply tell it:

> Read DESIGN.md and your project instructions, inspect the existing FiscalScope
> implementation, then execute the full redesign. Use lieflat-charts for chart design
> decisions while preserving all existing fiscal logic and behavior.

## License note

Lieflat Charts is published under PolyForm Noncommercial 1.0.0. If FiscalScope is used
commercially, check the repository license and obtain the necessary permission before
copying template/code assets directly. General visual principles can still be used as
inspiration.
