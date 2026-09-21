import { rnd, round, spread } from './scale';

/* ═══════════════════════════════════════════════════════════════════════════
   MARK PRIMITIVES
   Hairline strokes, countable units, deterministic texture, direct labels.
   Grammar ported from lieflat-charts (F1 Rung Bars, L13 Hourglass Stream,
   L3 Barcode Lollipop, L14 Hundred Field); no Lieflat code or data ships.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A countable strip: one hairline per unit, deterministic jitter on length and
 * opacity, a counting dot every fifth mark. Solid marks add, dashed marks
 * subtract — geometry carries the sign, never colour.
 */
export function TickStrip({
  x = 0,
  y = 0,
  width,
  count,
  height = 16,
  seed = 1,
  color = 'var(--ink)',
  subtract = false,
  minGap = 2.4,
  dot = true,
}) {
  const n = Math.max(0, Math.round(count));
  if (n === 0 || width <= 0) return null;

  // Never draw marks closer than minGap: below that the strip reads as a solid
  // block and the unit stops being countable, so we thin honestly and say so.
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(width / minGap))));
  const drawn = [];
  for (let i = 0; i < n; i += every) drawn.push(i);

  const xs = spread(drawn.length, x, x + width, Math.min(2, width / 8));
  const half = height / 2;

  return (
    <g>
      {drawn.map((i, k) => {
        const jitter = (rnd(i + 1, seed) - 0.5) * height * 0.18;
        const op = subtract ? 0.55 : 0.55 + rnd(i + 2, seed + 4) * 0.45;
        return (
          <line
            key={i}
            x1={round(xs[k])}
            y1={round(y - half + jitter)}
            x2={round(xs[k])}
            y2={round(y + half + jitter)}
            stroke={color}
            strokeWidth={subtract ? 0.9 : 1}
            strokeDasharray={subtract ? '2 2.2' : undefined}
            opacity={op}
          />
        );
      })}
      {dot && every === 1 &&
        drawn
          .filter(i => i % 5 === 4)
          .map(i => (
            <circle
              key={`d${i}`}
              cx={round(xs[drawn.indexOf(i)])}
              cy={round(y + half + 4)}
              r={0.8}
              fill="var(--ink-6)"
            />
          ))}
    </g>
  );
}

/** A thin leader line from a mark to its label (never a detached legend). */
export function Leader({ x1, y1, x2, y2, dashed = false }) {
  return (
    <line
      className="fs-annot-lead"
      x1={round(x1)}
      y1={round(y1)}
      x2={round(x2)}
      y2={round(y2)}
      strokeDasharray={dashed ? '2 3' : undefined}
    />
  );
}

/** Baseline / structural hairline. */
export function Rule({ x1, y1, x2, y2, soft = false, dashed = false }) {
  return (
    <line
      x1={round(x1)}
      y1={round(y1)}
      x2={round(x2)}
      y2={round(y2)}
      stroke={soft ? 'var(--ink-7)' : 'var(--rule)'}
      strokeWidth={0.8}
      strokeDasharray={dashed ? '2 3' : undefined}
    />
  );
}

/**
 * Environment furniture: the rim of hairline ticks under an axis that makes a
 * sparse figure feel like a measured instrument (Lieflat "calendar floor").
 */
export function TickFloor({ x0, x1, y, count = 60, height = 5, every5 = true }) {
  const xs = spread(count, x0, x1);
  return (
    <g>
      {xs.map((x, i) => (
        <line
          key={i}
          x1={round(x)}
          y1={y}
          x2={round(x)}
          y2={round(y - (every5 && i % 5 === 0 ? height * 1.8 : height))}
          stroke="var(--ink-6)"
          strokeWidth={0.6}
        />
      ))}
    </g>
  );
}

/** Text with a paper-coloured halo so it survives over dense mark fields. */
export function Label({ x, y, children, size = 11, weight = 600, color = 'var(--ink)', anchor = 'start', mono = false, halo = true, ...rest }) {
  return (
    <text
      x={round(x)}
      y={round(y)}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      textAnchor={anchor}
      className={`${halo ? 'fs-halo' : ''} ${mono ? 'fs-t-stamp' : ''}`.trim()}
      {...rest}
    >
      {children}
    </text>
  );
}

/**
 * The reader's position: a petrol mark that appears in every figure where the
 * reader has a position. One signal per figure, always this shape.
 */
export function YouMark({ x, y, height = 22, label = 'TÚ', night = false, anchor = 'middle' }) {
  const c = night ? 'var(--night-signal)' : 'var(--signal)';
  return (
    <g>
      <line x1={round(x)} y1={round(y - height)} x2={round(x)} y2={round(y)} stroke={c} strokeWidth={1.4} />
      <circle cx={round(x)} cy={round(y - height)} r={3.4} fill={c} />
      {label && (
        <Label x={x} y={y - height - 9} size={9.5} color={c} anchor={anchor} mono>
          {label}
        </Label>
      )}
    </g>
  );
}

/**
 * A field of countable blocks — one block = one honest unit (1 € of 100,
 * one worker in a hundred). Replaces every pie and donut in the publication.
 */
export function HundredField({
  groups,          // [{ key, label, value, color }] — values sum to `total`
  total = 100,
  columns = 20,
  size = 9,
  gap = 3,
  x = 0,
  y = 0,
  focus = null,
  onFocus,
}) {
  const cells = [];
  let i = 0;
  for (const g of groups) {
    const n = Math.round(g.value);
    for (let k = 0; k < n && i < total; k++, i++) {
      cells.push({ g, i });
    }
  }
  const step = size + gap;

  return (
    <g>
      {cells.map(({ g, i }) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const dim = focus && focus !== g.key;
        return (
          <rect
            key={i}
            className="fs-mark"
            x={round(x + col * step)}
            y={round(y + row * step)}
            width={size}
            height={size}
            fill={g.color}
            opacity={dim ? 0.22 : 1}
            onMouseEnter={onFocus ? () => onFocus(g.key) : undefined}
            onMouseLeave={onFocus ? () => onFocus(null) : undefined}
          >
            <title>{`${g.label} — ${Math.round(g.value)} de cada ${total}`}</title>
          </rect>
        );
      })}
    </g>
  );
}

/**
 * Direct-labelled hairline series. The line is named at its own end point with
 * a leader — no legend, ever (DESIGN.md §49).
 */
export function Series({ d, color, width = 0.9, label, labelX, labelY, dim = false, dash }) {
  return (
    <g className="fs-group" opacity={dim ? 0.32 : 1}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinejoin="round" />
      {label && (
        <Label x={labelX} y={labelY} size={10} weight={700} color={color}>
          {label}
        </Label>
      )}
    </g>
  );
}
