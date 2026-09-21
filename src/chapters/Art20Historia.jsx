import { useId, useState } from 'react';
import { CURVA_ART20, CURVA_ART20_REAL, ANIOS_ART20_MUESTRA } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { useDomainZoom } from '../figures/useDomainZoom';
import { Label } from '../figures/marks';
import { linear, polyline, round, ticks } from '../figures/scale';
import { eur } from '../utils/format';

const W = 880;
const H = 360;
const X0 = 26;
const X1 = W - 116;
const Y0 = 26;
const Y1 = H - 52;

/**
 * FIG. 14 — LA REDUCCIÓN QUE SE MUEVE.
 * The art. 20 reduction redrawn for six reference years: how far it reaches,
 * how much it is worth and where it dies. In constant euros the story changes
 * completely, which is the point of the toggle.
 */
export default function Art20Historia() {
  const [real, setReal] = useState(false);
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);
  const [activos, setActivos] = useState(() => new Set(ANIOS_ART20_MUESTRA));

  const datos = real ? CURVA_ART20_REAL : CURVA_ART20;
  const zoom = useDomainZoom([0, datos[datos.length - 1].rn], { pxRange: [X0, X1], vbWidth: W, maxZoom: 14 });
  const x = linear(zoom.domain, [X0, X1]);
  const clip = useId().replace(/:/g, '');
  const maxY = Math.max(...datos.flatMap(d => ANIOS_ART20_MUESTRA.map(a => d[`red_${a}`])));
  const y = linear([0, maxY], [Y1, Y0]);

  const toggle = a =>
    setActivos(prev => {
      const next = new Set(prev);
      if (next.has(a)) {
        if (next.size > 1) next.delete(a);
      } else next.add(a);
      return next;
    });

  const onMove = e => {
    const svg = e.currentTarget.ownerSVGElement;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const rn = x.invert(px);
    const p = datos.reduce((best, d) => (Math.abs(d.rn - rn) < Math.abs(best.rn - rn) ? d : best), datos[0]);
    setHover(p);
    const ordenados = ANIOS_ART20_MUESTRA.filter(a => activos.has(a))
      .map(a => ({ a, value: p[`red_${a}`], color: tono(ANIOS_ART20_MUESTRA.indexOf(a)) }))
      .sort((a, b) => b.value - a.value || b.a - a.a);
    setTip({
      vx: x(p.rn),
      vy: y(ordenados[0]?.value ?? 0),
      title: eur(p.rn),
      sub: 'Rendimiento neto previo · mayor a menor',
      rows: ordenados.map(({ a, value, color }, rank) => [
        `${rank + 1} · ${a}`,
        eur(value),
        color,
      ]),
    });
  };

  const tono = i => [
    'var(--counter)',
    'var(--series-cyan)',
    'var(--series-indigo)',
    'var(--series-jade)',
    'var(--series-violet)',
    'var(--series-steel)',
  ][i % 6];

  return (
    <Figure
      id="15"
      title="La reducción del art. 20, redibujada seis veces en quince años"
      sub={`${real ? 'Euros constantes de 2026' : 'Euros nominales de cada año'} · eje horizontal: rendimiento neto previo · eje vertical: reducción aplicable`}
      legend="Cada curva se nombra en su propio extremo · la caída de cada una es el tramo donde aparece el acantilado de ese año"
      source="Fuente · BOE — LIRPF art. 20, redacciones sucesivas"
      note={
        real
          ? 'En euros constantes se compara el poder adquisitivo cubierto por cada versión: una reducción nominalmente mayor puede equivaler a una cuantía real menor si los precios han crecido más.'
          : 'En euros nominales se observan las cuantías y umbrales legales de cada ejercicio, sin corregir el nivel de precios.'
      }
      summary={ANIOS_ART20_MUESTRA.map(a => `${a}: máximo ${eur(datos[0][`red_${a}`])}`).join('; ')}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Rendimiento neto</span>
          <span className="fs-readout-v">{hover ? eur(hover.rn) : '—'}</span>
        </span>
        {ANIOS_ART20_MUESTRA.filter(a => activos.has(a)).map(a => (
          <span key={a}>
            <span className="fs-readout-k">{a}</span>
            <span className="fs-readout-v" style={{ color: tono(ANIOS_ART20_MUESTRA.indexOf(a)) }}>{hover ? eur(hover[`red_${a}`]) : '—'}</span>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <span className="fs-seg">
          <button type="button" aria-pressed={!real} onClick={() => setReal(false)}>Nominal</button>
          <button type="button" aria-pressed={real} onClick={() => setReal(true)}>Real (€2026)</button>
        </span>
        {ANIOS_ART20_MUESTRA.map(a => (
          <button
            key={a}
            type="button"
            className="fs-btn"
            style={{ '--year-color': tono(ANIOS_ART20_MUESTRA.indexOf(a)), padding: '5px 10px', minHeight: 30, fontSize: 10.5 }}
            aria-pressed={activos.has(a)}
            onClick={() => toggle(a)}
          >
            {a}
          </button>
        ))}
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} zoom={zoom} tip={tip} label="Reducción del artículo 20 por años">
        <defs>
          <clipPath id={clip}>
            <rect x={X0} y={Y0 - 10} width={X1 - X0} height={Y1 - Y0 + 12} />
          </clipPath>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const v = maxY * t;
          return (
            <g key={t}>
              <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
              <Label x={X0} y={round(y(v)) - 4} size={9} color="var(--ink-5)" mono>
                {eur(v)}
              </Label>
            </g>
          );
        })}

        <g clipPath={`url(#${clip})`}>
        {ANIOS_ART20_MUESTRA.map((a, i) => {
          const on = activos.has(a);
          const pts = datos.map(d => [x(d.rn), y(d[`red_${a}`])]);
          const last = datos.findLast ? datos.findLast(d => d[`red_${a}`] > 0) : [...datos].reverse().find(d => d[`red_${a}`] > 0);
          return (
            <g key={a} opacity={on ? 1 : 0.18}>
              <path d={polyline(pts)} fill="none" stroke={tono(i)} strokeWidth={on ? 1.5 : 0.7} strokeLinejoin="round" />
              {on && last && (
                <>
                  <Label x={round(x(last.rn)) + 6} y={round(y(last[`red_${a}`])) + 3} size={9.5} weight={700} color={tono(i)} mono>
                    {a}
                  </Label>
                  <circle cx={round(x(last.rn))} cy={round(y(last[`red_${a}`]))} r={2.6} fill={tono(i)} />
                </>
              )}
            </g>
          );
        })}

        {hover && (
          <g>
            <line className="fs-crosshair" x1={round(x(hover.rn))} y1={Y0 - 6} x2={round(x(hover.rn))} y2={Y1} />
            {ANIOS_ART20_MUESTRA.filter(a => activos.has(a)).map(a => (
              <circle key={a} cx={round(x(hover.rn))} cy={round(y(hover[`red_${a}`]))} r={3.2} fill={tono(ANIOS_ART20_MUESTRA.indexOf(a))} />
            ))}
          </g>
        )}

        </g>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />
        {ticks(zoom.domain[0], zoom.domain[1], 5).map(v => (
          <g key={v}>
            <line x1={round(x(v))} y1={Y1} x2={round(x(v))} y2={Y1 + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label x={round(x(v))} y={Y1 + 20} size={9.5} color="var(--ink-4)" anchor="middle" mono>
              {v === 0 ? '0 €' : eur(v)}
            </Label>
          </g>
        ))}
        <Label x={X1} y={Y1 + 40} size={9} color="var(--ink-5)" anchor="end" mono>
          RENDIMIENTO NETO PREVIO →
        </Label>

        <rect
          className="fs-hit"
          x={X0}
          y={Y0 - 8}
          width={X1 - X0}
          height={Y1 - Y0 + 10}
          onMouseMove={onMove}
          onMouseLeave={() => { setHover(null); setTip(null); }}
        />
      </ChartFrame>
    </Figure>
  );
}
