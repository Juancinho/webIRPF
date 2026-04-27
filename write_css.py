import os

css = r'''@import "tailwindcss";

* { box-sizing: border-box; }

html { color-scheme: dark; }
html[data-theme="light"] { color-scheme: light; }

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-image: var(--bg-grad);
  background-attachment: fixed;
  transition: background-color 0.6s ease, color 0.6s ease;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

/* ═══════════════════════════════════════════════════════════════════════
   PALETA — Dorado cálido sobre charcoal
   ═══════════════════════════════════════════════════════════════════════ */

:root {
  --bg:           #050505;
  --surface:      #0c0c0e;
  --surface2:     #141416;
  --surface3:     #1c1c1f;
  --border:       #27272a;
  --border-light: #3f3f46;

  --text:        #a1a1aa;
  --text-soft:   #71717a;
  --text-h:      #f4f4f5;

  --accent:       #d4a853;
  --accent2:      #c9956b;
  --accent-light: #e8c87a;
  --accent-dim:   rgba(212,168,83,0.10);
  --accent-soft:  rgba(212,168,83,0.04);
  --accent-on:    #0c0c0e;

  --green:    #34d399;
  --red:      #fb7185;
  --yellow:   #fbbf24;

  --glow-accent: rgba(212,168,83,0.12);
  --glow-green:  rgba(52,211,153,0.10);
  --glow-red:    rgba(251,113,133,0.10);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.40), 0 1px 3px rgba(0,0,0,0.25);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.40), 0 2px 6px rgba(0,0,0,0.20);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.50), 0 4px 12px rgba(0,0,0,0.30);

  --bg-grad:
    radial-gradient(ellipse 70% 40% at 15% 0%, rgba(212,168,83,0.035) 0%, transparent 55%),
    radial-gradient(ellipse 50% 35% at 85% 10%, rgba(201,149,107,0.02) 0%, transparent 50%),
    radial-gradient(ellipse 60% 30% at 50% 100%, rgba(212,168,83,0.015) 0%, transparent 50%);

  --orb-opacity: 0.30;

  --radius:      20px;
  --radius-sm:   16px;
  --radius-xs:   12px;
}

/* ── Light / day ── */
html[data-theme="light"] {
  --bg:           #fafaf9;
  --surface:      #ffffff;
  --surface2:     #f5f5f4;
  --surface3:     #e7e5e4;
  --border:       #e7e5e4;
  --border-light: #d6d3d1;

  --text:        #57534e;
  --text-soft:   #a8a29e;
  --text-h:      #1c1917;

  --accent:       #a16207;
  --accent2:      #92400e;
  --accent-light: #78350f;
  --accent-dim:   rgba(161,98,7,0.08);
  --accent-soft:  rgba(161,98,7,0.03);
  --accent-on:    #ffffff;

  --green:    #047857;
  --red:      #be123c;
  --yellow:   #b45309;

  --glow-accent: rgba(161,98,7,0.10);
  --glow-green:  rgba(4,120,87,0.10);
  --glow-red:    rgba(190,18,60,0.08);

  --shadow-sm: 0 1px 2px rgba(28,25,23,0.06), 0 1px 3px rgba(28,25,23,0.04);
  --shadow-md: 0 4px 16px rgba(28,25,23,0.08), 0 2px 6px rgba(28,25,23,0.05);
  --shadow-lg: 0 16px 40px rgba(28,25,23,0.10), 0 4px 10px rgba(28,25,23,0.06);

  --bg-grad:
    radial-gradient(ellipse 70% 40% at 15% 0%, rgba(161,98,7,0.025) 0%, transparent 55%),
    radial-gradient(ellipse 50% 35% at 85% 10%, rgba(146,64,14,0.015) 0%, transparent 50%);

  --orb-opacity: 0.10;
}

html[data-theme="light"] .text-white,
html[data-theme="light"] .text-white\/90,
html[data-theme="light"] .text-white\/80,
html[data-theme="light"] .text-white\/70,
html[data-theme="light"] .text-white\/60,
html[data-theme="light"] .text-white\/50 { color: var(--text-h) !important; }
html[data-theme="light"] .year-btn.active { color: #ffffff !important; }
html[data-theme="light"] .btn-primary { color: #ffffff !important; }
html[data-theme="light"] .section-badge { color: #ffffff !important; }
html[data-theme="light"] .paso-badge { color: #ffffff !important; }
html[data-theme="light"] .paso-final-badge svg { stroke: #ffffff !important; }

html[data-theme="light"] .text-\[\#7a8baa\] { color: var(--text-soft) !important; }
html[data-theme="light"] .text-\[\#94a3b8\] { color: var(--text) !important; }
html[data-theme="light"] .text-\[\#64748b\] { color: var(--text-soft) !important; }
html[data-theme="light"] .text-\[\#b0becc\] { color: var(--text-h) !important; }

html[data-theme="light"] .text-emerald-400,
html[data-theme="light"] .text-emerald-400\/80 { color: #047857 !important; }
html[data-theme="light"] .text-emerald-400\/60,
html[data-theme="light"] .text-emerald-400\/50 { color: rgba(4,120,87,0.7) !important; }
html[data-theme="light"] .text-emerald-400\/40 { color: rgba(4,120,87,0.55) !important; }
html[data-theme="light"] .text-emerald-300 { color: #059669 !important; }
html[data-theme="light"] .text-emerald-300\/80 { color: rgba(5,150,105,0.85) !important; }
html[data-theme="light"] .text-red-400 { color: #be123c !important; }
html[data-theme="light"] .text-red-400\/60 { color: rgba(190,18,60,0.7) !important; }
html[data-theme="light"] .text-amber-400 { color: #92400e !important; }
html[data-theme="light"] .text-orange-400 { color: #c2410c !important; }
html[data-theme="light"] .text-orange-300\/80 { color: rgba(194,65,12,0.8) !important; }
html[data-theme="light"] .text-sky-400 { color: #4338ca !important; }
html[data-theme="light"] .text-blue-400 { color: #3730a3 !important; }
html[data-theme="light"] .text-purple-400 { color: #6d28d9 !important; }

html[data-theme="light"] .bg-emerald-500\/10 { background: rgba(4,120,87,0.06) !important; }
html[data-theme="light"] .bg-amber-500\/10 { background: rgba(146,64,14,0.06) !important; }
html[data-theme="light"] .bg-blue-500\/10 { background: rgba(49,46,129,0.05) !important; }
html[data-theme="light"] .bg-purple-500\/10 { background: rgba(109,40,217,0.05) !important; }
html[data-theme="light"] .bg-orange-500\/10 { background: rgba(194,65,12,0.05) !important; }

html[data-theme="light"] .card-glass {
  background: rgba(255,255,255,0.92) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}

html[data-theme="light"] .border-emerald-500\/20 { border-color: rgba(4,120,87,0.15) !important; }
html[data-theme="light"] .bg-emerald-500\/5 { background: rgba(4,120,87,0.04) !important; }
html[data-theme="light"] .border-orange-500\/10 { border-color: rgba(194,65,12,0.10) !important; }
html[data-theme="light"] .border-orange-500\/20 { border-color: rgba(194,65,12,0.15) !important; }

html[data-theme="light"] .hover\:text-white:hover { color: var(--text-h) !important; }
html[data-theme="light"] .hover\:text-blue-300:hover { color: #4338ca !important; }
html[data-theme="light"] .group-hover\:text-white:hover { color: var(--text-h) !important; }

html[data-theme="light"] .progress-dot { background: #d6d3d1; }
html[data-theme="light"] .progress-dot.active { background: var(--accent); box-shadow: 0 0 10px rgba(161,98,7,0.25); }
html[data-theme="light"] .progress-dot.passed { background: var(--accent); opacity: 0.35; }
html[data-theme="light"] .progress-dots::before { background: #e7e5e4; }

html[data-theme="light"] .sidebar-tip {
  background: linear-gradient(135deg, rgba(161,98,7,0.04), rgba(146,64,14,0.02));
  border-color: rgba(161,98,7,0.10);
}

html[data-theme="light"] .badge-nuevo { color: #7e22ce; background: rgba(126,34,206,0.07); border-color: rgba(126,34,206,0.18); }

html[data-theme="light"] text[fill="#64748b"] { fill: var(--text-soft) !important; }
html[data-theme="light"] .distribution-bar .text-white\/90 { color: rgba(255,255,255,0.9) !important; }

html[data-theme="light"] .data-table td.text-white,
html[data-theme="light"] .data-table td .text-white,
html[data-theme="light"] td.font-bold.text-white { color: var(--text-h) !important; }

html[data-theme="light"] .paso-subtitle { color: var(--text-soft); }

/* ═══════════════════════════════════════════════════════════════════════
   TYPOGRAPHY
   ═══════════════════════════════════════════════════════════════════════ */
.font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; font-feature-settings: 'zero', 'ss01'; }
.font-display {
  font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif !important;
  font-optical-sizing: auto;
  letter-spacing: -0.03em;
  font-feature-settings: 'pnum', 'lnum', 'dlig';
}
.font-serif {
  font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif !important;
  font-optical-sizing: auto;
  letter-spacing: -0.01em;
}

.text-gradient {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 50%, var(--accent-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

#root { min-height: 100vh; }

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT FRAME
   ═══════════════════════════════════════════════════════════════════════ */
:root {
  --content-max: 52rem;
  --sidebar-w:   16rem;
  --layout-gap:  3rem;
  --page-pad-x:  1.25rem;
}
@media (min-width: 640px)  { :root { --page-pad-x: 1.5rem; } }
@media (min-width: 1024px) { :root { --page-pad-x: 2rem;  --layout-gap: 4rem; } }

.centered-col {
  max-width: var(--content-max);
  margin-inline: auto;
  padding-inline: var(--page-pad-x);
  width: 100%;
}

.layout-frame {
  display: grid;
  grid-template-columns: minmax(0, var(--content-max));
  justify-content: center;
  column-gap: var(--layout-gap);
  padding-inline: var(--page-pad-x);
  width: 100%;
}
@media (min-width: 1280px) {
  .layout-frame {
    grid-template-columns: var(--sidebar-w) minmax(0, var(--content-max));
  }
}
@media (min-width: 1536px) {
  .layout-frame {
    grid-template-columns: var(--sidebar-w) minmax(0, var(--content-max)) var(--sidebar-w);
  }
}

.layout-sidebar { grid-column: 1; min-width: 0; }
.layout-main    { grid-column: 1; min-width: 0; }
@media (min-width: 1280px) {
  .layout-sidebar { grid-column: 1; }
  .layout-main    { grid-column: 2; }
}

.sidebar-widget { display: none; }

@media (min-width: 1280px) {
  .sidebar-widget {
    display: block;
    position: fixed;
    top: 88px;
    left: max(var(--page-pad-x),
              calc((100vw - var(--content-max) - var(--sidebar-w) - var(--layout-gap)) / 2));
    width: var(--sidebar-w);
    max-height: calc(100vh - 104px);
    overflow-y: auto;
    scrollbar-width: none;
    z-index: 20;
    opacity: 1;
    transform: none;
    filter: none;
    animation: sidebar-enter 800ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
}

@keyframes sidebar-enter {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@media (min-width: 1536px) {
  .sidebar-widget {
    left: max(var(--page-pad-x),
              calc((100vw - var(--content-max) - 2 * var(--sidebar-w) - 2 * var(--layout-gap)) / 2));
  }
}

.sidebar-widget::-webkit-scrollbar { display: none; }

/* ── TOC navigation ── */
.toc-nav {
  position: relative;
  padding-left: 4px;
}
.toc-progress-track {
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: var(--border);
  border-radius: 1px;
  overflow: hidden;
}
.toc-progress-fill {
  width: 100%;
  background: linear-gradient(to bottom, var(--accent), var(--accent2));
  border-radius: 1px;
  transition: height 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.toc-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  letter-spacing: -0.01em;
}
.toc-link:hover {
  background: var(--surface2);
  color: var(--text-h);
}
.toc-link.active {
  background: var(--surface2);
  color: var(--accent);
}
.toc-link.passed {
  color: var(--text);
  opacity: 0.6;
}
.toc-num {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--surface3);
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  font-family: 'JetBrains Mono', monospace;
}
.toc-num.active {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: var(--accent-on);
  box-shadow: 0 2px 12px var(--glow-accent);
  transform: scale(1.1);
}
.toc-num.passed {
  background: rgba(212,168,83,0.12);
  color: var(--accent);
}

/* ── Sidebar contextual tip ── */
.sidebar-tip {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(212,168,83,0.04), rgba(201,149,107,0.02));
  border: 1px solid rgba(212,168,83,0.10);
  animation: tip-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes tip-enter {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sidebar-tip-icon {
  font-size: 16px;
  flex-shrink: 0;
  line-height: 1.4;
}
.sidebar-tip-text {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--text);
  margin: 0;
}

/* ── Config pill ── */
.config-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface2);
  cursor: pointer;
  transition: all 0.25s ease;
}
.config-pill:hover {
  border-color: var(--accent-dim);
  background: var(--surface3);
}
.config-pill[aria-expanded="true"] {
  border-color: var(--accent);
  background: linear-gradient(135deg, rgba(212,168,83,0.04), rgba(201,149,107,0.02));
}
.config-pill-values {
  display: flex;
  align-items: center;
  gap: 8px;
}
.config-pill-bruto {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.02em;
}
.config-pill-sep {
  font-size: 12px;
  color: var(--text-soft);
  opacity: 0.4;
}
.config-pill-anio {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h);
  font-family: 'JetBrains Mono', monospace;
}
.config-pill-action {
  color: var(--text-soft);
  transition: color 0.2s;
}
.config-pill:hover .config-pill-action { color: var(--accent); }

/* Collapsible panel */
.config-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.35s ease;
  opacity: 0;
  overflow: hidden;
}
.config-panel.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
}
.config-panel > * {
  overflow: hidden;
  padding-top: 12px;
}

/* ─── Metric mini card (sidebar) ─── */
.metric-mini {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface2);
}
.metric-mini-label {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text);
  opacity: 0.45;
  margin-bottom: 4px;
}
.metric-mini-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 17px;
  font-weight: 800;
  color: var(--text-h);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* ─── Smooth scroll ─── */
html { scroll-behavior: smooth; }

/* ─── Selection ─── */
::selection {
  background: var(--accent-dim);
  color: var(--text-h);
}

/* ─── Range slider ─── */
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--border);
  outline: none;
  cursor: pointer;
  transition: background 0.3s;
}
input[type=range]:hover {
  background: var(--border-light);
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 4px solid var(--bg);
  box-shadow: 0 0 0 3px var(--accent-dim), 0 2px 12px var(--glow-accent);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
input[type=range]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 6px var(--accent-dim), 0 6px 20px var(--glow-accent);
  transform: scale(1.12);
}
input[type=range]:active::-webkit-slider-thumb {
  transform: scale(0.95);
}

/* ─── Card ─── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: border-color 0.5s ease, box-shadow 0.5s ease, transform 0.5s ease,
              background-color 0.6s ease;
}
.card:hover {
  border-color: var(--border-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

/* ─── Glassmorphism card variant ─── */
.card-glass {
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  backdrop-filter: blur(32px) saturate(120%);
  -webkit-backdrop-filter: blur(32px) saturate(120%);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}
.card-glass:hover {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--surface) 75%, transparent);
}

/* ─── Info card ─── */
.info-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}
.info-card strong { color: var(--text-h); font-weight: 600; }
.info-card em { color: var(--accent); font-style: italic; }
.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(to bottom, var(--accent), var(--accent2));
  border-radius: 0 3px 3px 0;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.info-card:hover {
  border-color: var(--border-light);
  box-shadow: var(--shadow-sm);
}
.info-card:hover::before {
  opacity: 1;
}

/* ─── Hecho Destacado card ─── */
.hecho-card {
  border-radius: var(--radius);
  padding: 1.75rem;
  border: 1px solid;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.hecho-card:hover {
  transform: translateY(-5px) scale(1.01);
}
.hecho-card .hecho-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 1.25rem;
  transition: transform 0.4s ease;
}
.hecho-card:hover .hecho-icon {
  transform: scale(1.1) rotate(-5deg);
}

/* ─── Section number badge ─── */
.section-badge {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 17px;
  color: white;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.02em;
}
.section-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  border-radius: inherit;
}

/* ─── Metric card ─── */
.metric-card {
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  border: 1px solid;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}
.metric-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.35s;
}
.metric-card:hover {
  transform: translateY(-3px);
}
.metric-card:hover::before {
  opacity: 1;
}

/* ─── Button styles ─── */
.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: var(--accent-on);
  border: none;
  border-radius: var(--radius-xs);
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 16px rgba(212,168,83,0.15);
  position: relative;
  overflow: hidden;
  letter-spacing: -0.01em;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.btn-primary:hover {
  box-shadow: 0 6px 28px rgba(212,168,83,0.22);
  transform: translateY(-2px);
}
.btn-primary:hover::before { opacity: 1; }
.btn-primary:active { transform: translateY(0); }

.btn-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  padding: 0.5rem 0.875rem;
  font-weight: 500;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent-light);
  background: rgba(212,168,83,0.04);
}

/* ─── Tag / Badge ─── */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.875rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid;
  transition: all 0.2s ease;
}

/* ─── Divider with glow ─── */
.divider-glow {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-light), transparent);
  margin: 0.75rem 0;
}

/* ─── Year button active ─── */
.year-btn {
  padding: 0.4rem 0.7rem;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.02em;
}
.year-btn.active {
  color: var(--accent-on);
  box-shadow: var(--shadow-sm);
}
.year-btn:not(.active) {
  border-color: var(--border);
  color: var(--text);
  opacity: 0.45;
}
.year-btn:not(.active):hover {
  opacity: 0.8;
  border-color: var(--border-light);
}

/* ─── Tooltip override for Recharts ─── */
.recharts-tooltip-wrapper {
  filter: drop-shadow(var(--shadow-md));
}

/* ─── Brush styling ─── */
.recharts-brush > rect:first-of-type {
  rx: 8;
  ry: 8;
}
.recharts-brush-slide {
  fill: var(--accent);
  fill-opacity: 0.12 !important;
}
.recharts-brush-texts {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.recharts-brush > rect:not(.recharts-brush-slide) {
  stroke: var(--border);
  stroke-width: 1px;
}

/* ─── FAQ accordion ─── */
.faq-item {
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: all 0.35s ease;
}
.faq-item:hover {
  transform: translateX(4px);
}
.faq-toggle {
  transition: background 0.25s ease;
}
.faq-toggle:hover {
  background: var(--surface2);
}

/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--border), var(--border-light));
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

/* ─── Animated pulse dot ─── */
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 currentColor; }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.pulse-dot {
  animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ─── Shimmer effect ─── */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.shimmer-line {
  position: relative;
  overflow: hidden;
}
.shimmer-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
  animation: shimmer 4s ease-in-out infinite;
}

/* ─── Entrance animations ─── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.animate-in-delay-1 { animation-delay: 0.12s; opacity: 0; }
.animate-in-delay-2 { animation-delay: 0.24s; opacity: 0; }
.animate-in-delay-3 { animation-delay: 0.36s; opacity: 0; }

/* ── Scroll reveal ── */
.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.scroll-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Section transition (narrative bridge) ── */
.section-transition {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}
.section-transition-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-light), transparent);
}
.section-transition-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 400;
  font-style: italic;
  color: var(--text-h);
  text-align: center;
  max-width: 48ch;
  line-height: 1.5;
  letter-spacing: -0.01em;
  margin: 0;
  white-space: normal;
  opacity: 0.85;
}
.section-transition-text em {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  color: var(--accent);
}

/* ── Progress dots (right-edge tracker) ── */
.progress-dots {
  position: fixed;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  z-index: 25;
  padding: 16px 0;
}
.progress-dots::before {
  content: '';
  position: absolute;
  top: 16px;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  background: var(--border);
  z-index: -1;
  border-radius: 1px;
}
@media (min-width: 1024px) {
  .progress-dots { display: flex; }
}
.progress-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border-light);
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 0;
  position: relative;
  z-index: 1;
}
.progress-dot:hover {
  background: var(--accent-light);
  transform: scale(1.6);
}
.progress-dot.active {
  width: 9px;
  height: 9px;
  background: var(--accent);
  box-shadow: 0 0 12px var(--glow-accent);
}
.progress-dot.passed {
  background: var(--accent);
  opacity: 0.3;
}

/* ─── Floating gradient orbs (decorative) ─── */
@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}
.float-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  animation: float 28s ease-in-out infinite;
  opacity: var(--orb-opacity);
}

/* ─── Stacked bar visual distribution ─── */
.distribution-bar {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  gap: 2px;
  background: var(--border);
}
.distribution-bar > div {
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 999px;
}

/* ─── Table styles ─── */
.data-table th {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
}
.data-table tr {
  transition: background 0.2s ease;
}
.data-table tr:hover {
  background: var(--surface2);
}

/* ─── Number input style ─── */
.input-field {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  padding: 0.4rem 0.75rem;
  color: var(--text-h);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.25s ease;
  text-align: right;
}
.input-field:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.input-field:hover:not(:focus) {
  border-color: var(--border-light);
}

/* ─── Progress bar (tramos) ─── */
.tramo-bar {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--border);
}
.tramo-bar > div {
  height: 100%;
  border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.tramo-bar > div::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08));
  border-radius: inherit;
}

/* ─── Mobile menu (hamburger + dropdown) ─── */
.mobile-menu-btn {
  width: 36px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  padding: 0;
  flex-shrink: 0;
}
.mobile-menu-btn:hover {
  background: var(--surface2);
  border-color: var(--border-light);
}
@media (min-width: 1280px) {
  .mobile-menu-btn { display: none; }
}
.mobile-menu-btn[data-open="true"] {
  background: var(--accent-soft);
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 3px var(--glow-accent);
}
.mobile-menu-icon {
  width: 16px;
  height: 12px;
  position: relative;
  display: inline-block;
}
.mobile-menu-icon span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1.5px;
  background: var(--text-h);
  border-radius: 2px;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.25s ease,
              top 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.mobile-menu-icon span:nth-child(1) { top: 0; }
.mobile-menu-icon span:nth-child(2) { top: 5px; }
.mobile-menu-icon span:nth-child(3) { top: 10px; }
.mobile-menu-btn[data-open="true"] .mobile-menu-icon span:nth-child(1) {
  top: 5px; transform: rotate(45deg);
}
.mobile-menu-btn[data-open="true"] .mobile-menu-icon span:nth-child(2) {
  opacity: 0;
}
.mobile-menu-btn[data-open="true"] .mobile-menu-icon span:nth-child(3) {
  top: 5px; transform: rotate(-45deg);
}

.mobile-menu-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: min(320px, 88vw);
  height: 100dvh;
  background: var(--surface);
  border-right: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  z-index: 35;
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  overflow-y: auto;
  overflow-x: hidden;
}
.mobile-menu-panel[data-open="true"] {
  transform: translateX(0);
}
.mobile-menu-inner {
  padding: 1.25rem 1.25rem 2rem;
}

.mobile-menu-backdrop {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--bg) 50%, transparent);
  backdrop-filter: blur(4px);
  z-index: 30;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}
.mobile-menu-backdrop[data-open="true"] {
  opacity: 1;
  pointer-events: auto;
}

/* ─── Theme toggle (sun/moon switch) ─── */
.theme-toggle {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
.theme-toggle-track {
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--surface2);
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  transition: background-color 0.35s ease, border-color 0.35s ease;
}
.theme-toggle-thumb {
  position: absolute;
  top: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
              background-color 0.35s ease,
              color 0.35s ease;
}
.theme-toggle-thumb[data-pos="left"]  { transform: translateX(2px); }
.theme-toggle-thumb[data-pos="right"] { transform: translateX(24px); }
.theme-toggle:hover .theme-toggle-track { border-color: var(--border-light); }
.theme-toggle:hover .theme-toggle-thumb { color: var(--accent-light); }

/* ─── Header blur ─── */
.header-blur {
  background: color-mix(in srgb, var(--bg) 72%, transparent);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border-bottom: 1px solid var(--border);
  transition: background-color 0.5s ease, border-color 0.5s ease;
}

/* ─── Separator between sections ─── */
.section-separator {
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, var(--border) 30%, var(--border-light) 50%, var(--border) 70%, transparent 95%);
  margin: 3rem 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   DESGLOSE EDUCATIVO
   ═══════════════════════════════════════════════════════════════════════ */

.desglose-edu-card {
  position: relative;
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
}
.desglose-edu-card::after {
  content: '';
  position: absolute;
  top: -1px; left: 24px; right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,168,83,0.30) 20%, rgba(201,149,107,0.30) 50%, rgba(212,168,83,0.30) 80%, transparent);
  pointer-events: none;
}
.desglose-edu-card.is-open {
  border-color: var(--accent-dim);
  box-shadow: var(--shadow-md), 0 0 0 1px var(--accent-soft) inset;
}

.desglose-edu-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: var(--radius);
  text-align: left;
  cursor: pointer;
  transition: background 0.3s ease;
  position: relative;
  z-index: 2;
}
.desglose-edu-toggle:hover {
  background: linear-gradient(90deg, rgba(212,168,83,0.03), transparent 85%);
}
.desglose-edu-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.desglose-edu-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  background: rgba(212,168,83,0.07);
  border: 1px solid rgba(212,168,83,0.15);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.desglose-edu-card.is-open .desglose-edu-icon {
  background: linear-gradient(135deg, rgba(212,168,83,0.15), rgba(201,149,107,0.10));
  border-color: rgba(212,168,83,0.30);
  box-shadow: 0 0 28px rgba(212,168,83,0.15);
  color: #e8c87a;
}

.desglose-edu-hint {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.55;
}
.desglose-edu-chevron {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  background: var(--surface2);
  border: 1px solid var(--border);
}
.desglose-edu-chevron[data-open="true"] {
  transform: rotate(180deg);
  color: var(--accent-light);
  background: rgba(212,168,83,0.08);
  border-color: rgba(212,168,83,0.22);
}

.desglose-edu-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.6s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.45s ease;
  opacity: 0;
}
.desglose-edu-body[data-open="true"] {
  grid-template-rows: 1fr;
  opacity: 1;
}
.desglose-edu-body > div {
  overflow: hidden;
  min-height: 0;
}
.desglose-edu-body[data-open="true"] > div {
  border-top: 1px solid var(--border);
}

.intro-desglose-text {
  margin: 0 0 1.5rem 0;
  max-width: 70ch;
  color: var(--text);
}

.desglose-edu strong { color: var(--text-h); font-weight: 600; }
.desglose-edu-toggle h3 { color: var(--text-h); }
.desglose-edu-toggle p  { color: var(--text); }

.paso-timeline {
  position: relative;
  padding-left: 0;
}
.paso-timeline > .paso-edu {
  position: relative;
  margin-bottom: 1.6rem;
}
.paso-timeline > .paso-edu:last-of-type { margin-bottom: 0; }

.paso-timeline > .paso-edu:not(:last-of-type)::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 38px;
  bottom: -1.6rem;
  width: 1.5px;
  background: linear-gradient(to bottom,
    rgba(212,168,83,0.18) 0%,
    rgba(212,168,83,0.05) 50%,
    rgba(212,168,83,0.18) 100%);
  z-index: 0;
  pointer-events: none;
}

.paso-edu {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  position: relative;
  overflow: visible;
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.paso-edu.is-revealed {
  opacity: 1;
  transform: translateY(0);
}
.paso-edu:hover {
  border-color: transparent;
}

.paso-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.paso-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: white;
  font-family: 'Playfair Display', Georgia, serif;
  flex-shrink: 0;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 2;
}
.paso-badge::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 13px;
  border: 1px solid rgba(212,168,83,0.07);
  pointer-events: none;
}

.paso-header-text {
  flex: 1;
  min-width: 0;
}
.paso-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-h);
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.paso-subtitle {
  font-size: 12px;
  color: #7a8baa;
  margin-top: 2px;
  line-height: 1.4;
}

.paso-resultado-chip {
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
}

.paso-content {
  padding-left: 48px;
  position: relative;
  z-index: 1;
}

.paso-prosa {
  font-size: 13.5px;
  color: var(--text);
  line-height: 1.7;
  margin-bottom: 0.85rem;
}

.formula-box {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-size: 12.5px;
  color: var(--text-h);
  line-height: 1.75;
  margin: 0.75rem 0;
  overflow-x: auto;
  white-space: nowrap;
}

.fuente-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--accent-light);
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(212,168,83,0.18);
  background: rgba(212,168,83,0.04);
  font-weight: 600;
  margin-top: 0.4rem;
  transition: all 0.2s ease;
}
.fuente-link:hover {
  background: rgba(212,168,83,0.09);
  border-color: rgba(212,168,83,0.30);
  color: #e8c87a;
  transform: translateY(-1px);
}

.paso-tabla {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  font-size: 12px;
  margin: 0.5rem 0 0.75rem;
}
.paso-tabla thead th {
  background: var(--surface3);
  padding: 8px 12px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.paso-tabla tbody td {
  padding: 7px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}
.paso-tabla tbody tr:last-child td { border-bottom: none; }
.paso-tabla .row-total td {
  background: rgba(212,168,83,0.05);
  font-weight: 800;
  color: var(--text-h);
  border-top: 1px solid rgba(212,168,83,0.18);
}
.badge-nuevo {
  margin-left: 8px;
  font-size: 9px;
  font-weight: 700;
  color: #a78bfa;
  background: rgba(167,139,250,0.08);
  border: 1px solid rgba(167,139,250,0.20);
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  vertical-align: middle;
}

.paso-ratio {
  font-size: 12px;
  color: var(--text-soft);
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--border);
  line-height: 1.5;
}

.callout-info {
  margin-top: 0.65rem;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(212,168,83,0.22);
  background: rgba(212,168,83,0.04);
  font-size: 11.5px;
  color: var(--accent-light);
  line-height: 1.5;
}

.paso-umbrales {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0.6rem 0;
}
.paso-umbrales > div {
  padding: 8px 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
}
.paso-umbrales span {
  display: block;
  font-size: 9px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 3px;
  opacity: 0.7;
}
.paso-umbrales strong {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-h);
}

.paso-zona {
  font-size: 12px;
  color: var(--accent-light);
  margin: 0.6rem 0 0.4rem;
  padding: 8px 12px;
  background: rgba(52,211,153,0.04);
  border: 1px dashed rgba(52,211,153,0.20);
  border-radius: 8px;
  line-height: 1.5;
}
.paso-zona strong {
  color: var(--green);
  text-transform: lowercase;
}

.tramos-intro-note {
  font-size: 12px;
  color: var(--text);
  line-height: 1.55;
  margin-bottom: 0.9rem;
  padding: 0.55rem 0.75rem;
  border-left: 3px solid var(--accent-dim);
  background: var(--accent-soft);
  border-radius: 0 6px 6px 0;
}
.tramos-intro-note strong {
  color: var(--text-h);
}
.tramos-scale {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  color: var(--text-soft);
  margin-top: -0.4rem;
  margin-bottom: 0.75rem;
}
.tramos-scale-end {
  font-size: 9.5px;
}
.tramo-partial-badge {
  font-size: 11px;
  line-height: 1.5;
  color: var(--text);
  border: 1px solid;
  border-radius: 6px;
  padding: 0.45rem 0.7rem;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-left: 22px;
}
.tramo-partial-badge strong {
  font-size: 11px;
}

.tramos-visual {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  margin: 0.8rem 0;
}
.tramos-visual-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}
.tramos-visual-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text);
}
.tramos-visual-base {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-h);
}

.tramos-stacked {
  display: flex;
  width: 100%;
  height: 30px;
  border-radius: 8px;
  overflow: hidden;
  gap: 2px;
  background: var(--border);
  margin-bottom: 0.85rem;
}
.tramos-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.tramos-segment-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.25);
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  white-space: nowrap;
  padding: 0 6px;
}
.tramos-segment-label small {
  font-size: 9.5px;
  font-weight: 600;
  opacity: 0.85;
}

.tramos-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tramo-row-v2 {
  display: grid;
  grid-template-columns: 10px minmax(110px, auto) 50px 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 7px 4px;
  border-radius: 6px;
  font-size: 12px;
  transition: background 0.2s ease;
}
.tramo-row-v2:hover {
  background: color-mix(in srgb, var(--surface3) 60%, transparent);
}
.tramo-row-v2.is-empty {
  opacity: 0.45;
}
.tramo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tramo-range {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text);
  font-size: 11.5px;
}
.tramo-rate {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  text-align: right;
  font-size: 12.5px;
}
.tramo-fill-track {
  height: 6px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
  display: block;
  min-width: 50px;
}
.tramo-fill-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}
.tramo-eur, .tramo-cuota-v2 {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
}
.tramo-eur strong, .tramo-cuota-v2 strong {
  font-size: 12.5px;
  color: var(--text-h);
  font-weight: 700;
}
.tramo-eur small, .tramo-cuota-v2 small {
  font-size: 9px;
  color: var(--text-soft);
  letter-spacing: 0.03em;
  margin-top: 1px;
}
.tramo-empty-label {
  grid-column: 5 / span 2;
  text-align: right;
  font-size: 11px;
  font-style: italic;
  color: var(--text-soft);
}

@media (max-width: 640px) {
  .tramo-row-v2 {
    grid-template-columns: 10px 1fr 44px;
    grid-auto-rows: auto;
    row-gap: 4px;
    padding: 9px 6px;
  }
  .tramo-range { grid-column: 2; font-size: 11px; }
  .tramo-rate  { grid-column: 3; }
  .tramo-fill-track {
    grid-column: 2 / span 2;
    min-width: 0;
  }
  .tramo-eur, .tramo-cuota-v2 {
    grid-column: 2 / span 2;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
  }
  .tramo-eur small, .tramo-cuota-v2 small {
    margin-top: 0;
  }
  .tramo-empty-label { grid-column: 2 / span 2; text-align: left; }
}

.tramos-aplicados {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin: 0.6rem 0;
}
.tramos-aplicados-header {
  font-size: 10px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}
.tramo-row {
  display: grid;
  grid-template-columns: 1fr auto 80px;
  gap: 12px;
  padding: 5px 0;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  border-bottom: 1px dashed var(--border);
  align-items: center;
}
.tramo-row:last-child { border-bottom: none; }
.tramo-rango { color: var(--text); }
.tramo-tipo { font-weight: 700; }
.tramo-cuota { text-align: right; color: var(--text-h); font-weight: 700; }

.paso-final {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(52,211,153,0.07), rgba(52,211,153,0.02));
  border: 1.5px solid rgba(52,211,153,0.20);
  border-radius: var(--radius);
  margin-top: 0.75rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(52,211,153,0.06);
}
.paso-final::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #34d399, #10b981);
}
.paso-final-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 900;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(52,211,153,0.30);
}
.paso-final-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 2px;
}
.paso-final-formula {
  font-size: 11.5px;
  color: var(--text-soft);
  margin-bottom: 4px;
}
.paso-final-valor {
  font-size: 30px;
  font-weight: 700;
  color: var(--green);
  letter-spacing: -0.02em;
  line-height: 1.15;
  font-family: 'Playfair Display', 'Georgia', serif;
}
.paso-final-mes {
  font-size: 11px;
  color: var(--text-soft);
  margin-top: 2px;
}

@media (max-width: 560px) {
  .paso-content { padding-left: 0; }
  .paso-header { margin-bottom: 0.75rem; }
  .tramo-row { grid-template-columns: 1fr auto 70px; gap: 8px; font-size: 11px; }
  .paso-umbrales { grid-template-columns: 1fr; }
}

/* ─── Footer ─── */
.footer-grid {
  position: relative;
}
.footer-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-light), transparent);
}

/* ─── Hero badge animation ─── */
@keyframes heroBadgeEnter {
  from { opacity: 0; transform: translateY(10px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.hero-badge-enter {
  animation: heroBadgeEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s backwards;
}

/* ─── Nav label pill ─── */
.nav-section-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

/* ─── Elegant header logo text ─── */
.logo-mark {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1;
}
.logo-mark-accent {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.03em;
  line-height: 1;
}

/* ─── Kicker / overline ─── */
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

/* ─── Elegant section titles ─── */
.section-title-main {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

/* ─── Text balance ─── */
h1, h2, h3 {
  text-wrap: balance;
}
p {
  text-wrap: pretty;
}
'''
with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('CSS written successfully')
"
os.system('python write_css.py')
"