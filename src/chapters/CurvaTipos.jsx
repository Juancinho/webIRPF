import { useId, useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { calcularNomina, calcularTipoMarginal } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { useDomainZoom } from '../figures/useDomainZoom';
import { Label } from '../figures/marks';
import { linear, polyline, round, ticks } from '../figures/scale';
import { eur, pct } from '../utils/format';

const W = 880;
const H = 400;
const X0 = 46;
const X1 = W - 116;
const Y0 = 26;
const Y1 = H - 52;
const MAXB = 80000;
const STEP = 250;

const LINEAS = [
  { k: 'marg', label: 'Marginal total', color: 'var(--counter)', width: 1.6, nota: 'lo que se lleva el siguiente euro' },
  { k: 'efTotal', label: 'Efectivo total', color: 'var(--ink)', width: 1.4, nota: 'IRPF + cotizaciones sobre el bruto' },
  { k: 'efIrpf', label: 'Efectivo IRPF', color: 'var(--ink-4)', width: 1.2, nota: 'sólo IRPF sobre el bruto' },
];

/**
 * FIG. 07 — LA CURVA DE TIPOS.
 * La lección que ningún número suelto puede dar: cómo se separan el tipo
 * marginal y el efectivo a lo largo de toda la escala de renta. Al ampliar,
 * el eje se reescala y aparecen más divisiones: no se agranda el dibujo.
 */
export default function CurvaTipos() {
  const { bruto, anio, opts, nomina, marginal } = useFiscal();
  const [tip, setTip] = useState(null);
  const clip = useId().replace(/:/g, '');

  const serie = useMemo(() => {
    const out = [];
    for (let b = 0; b <= MAXB; b += STEP) {
      const n = calcularNomina(b, anio, opts);
      const m = calcularTipoMarginal(b, anio, opts);
      out.push({
        b,
        efIrpf: n.tipoEfectivoIRPF * 100,
        efTotal: n.tipoEfectivoTotal * 100,
        marg: m.tipoMarginalTotal * 100,
      });
    }
    return out;
  }, [anio, opts]);

  const zoom = useDomainZoom([0, MAXB], { pxRange: [X0, X1], vbWidth: W, maxZoom: 32 });
  const x = linear(zoom.domain, [X0, X1]);

  const maxY = Math.min(100, Math.max(60, Math.ceil(Math.max(...serie.map(p => p.marg)) / 10) * 10));
  const y = linear([0, maxY], [Y1, Y0]);

  const onMove = e => {
    const svg = e.currentTarget.ownerSVGElement;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const b = x.invert(px);
    const p = serie.reduce((best, c) => (Math.abs(c.b - b) < Math.abs(best.b - b) ? c : best), serie[0]);
    setTip({
      vx: x(p.b),
      vy: y(p.marg),
      title: eur(p.b),
      sub: `Bruto anual · ${anio}`,
      rows: LINEAS.map(l => [l.label, pct(p[l.k]), l.color]),
    });
  };

  const marcasX = ticks(zoom.domain[0], zoom.domain[1], 6);

  return (
    <Figure
      id="07"
      title="El marginal y el efectivo se separan: por eso un tipo alto no significa pagar ese tipo"
      sub={`${anio} · salario bruto anual · perfil seleccionado · pasa el cursor por la figura para leer cualquier punto`}
      legend="Cada línea se nombra en su propio extremo · la vertical de puntos es tu salario"
      source="Fuente · cálculo propio sobre la escala vigente"
      summary={`A ${eur(bruto)}, tipo efectivo IRPF ${pct(nomina.tipoEfectivoIRPF * 100)}, efectivo total ${pct(nomina.tipoEfectivoTotal * 100)}, marginal total ${pct(marginal.tipoMarginalTotal * 100)}.`}
    >
      <ChartFrame viewBox={`0 0 ${W} ${H}`} zoom={zoom} tip={tip} label="Curva de tipos efectivo y marginal">
        <defs>
          <clipPath id={clip}>
            <rect x={X0} y={Y0 - 10} width={X1 - X0} height={Y1 - Y0 + 12} />
          </clipPath>
        </defs>

        {Array.from({ length: maxY / 10 + 1 }, (_, i) => i * 10).map(v => (
          <g key={v}>
            <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
            <Label x={X0 - 8} y={round(y(v)) + 3} size={9} color="var(--ink-5)" anchor="end" mono>
              {pct(v, 0)}
            </Label>
          </g>
        ))}

        <g clipPath={`url(#${clip})`}>
          {LINEAS.map(l => (
            <path
              key={l.k}
              d={polyline(serie.map(p => [x(p.b), y(p[l.k])]))}
              fill="none"
              stroke={l.color}
              strokeWidth={l.width}
              strokeLinejoin="round"
            />
          ))}

          {bruto >= zoom.domain[0] && bruto <= zoom.domain[1] && (
            <line x1={round(x(bruto))} y1={Y0 - 10} x2={round(x(bruto))} y2={Y1} stroke="var(--signal)" strokeWidth={1.2} strokeDasharray="3 3" />
          )}

          {tip && (
            <g>
              <line className="fs-crosshair" x1={round(tip.vx)} y1={Y0 - 10} x2={round(tip.vx)} y2={Y1} />
              {LINEAS.map(l => {
                const p = serie.reduce((best, c) => (Math.abs(x(c.b) - tip.vx) < Math.abs(x(best.b) - tip.vx) ? c : best), serie[0]);
                return <circle key={l.k} cx={round(tip.vx)} cy={round(y(p[l.k]))} r={3.6} fill={l.color} stroke="var(--bone)" strokeWidth={1} />;
              })}
            </g>
          )}
        </g>

        {/* etiquetas directas, siempre fuera del área recortada */}
        {LINEAS.map(l => {
          const ultimo = serie[serie.length - 1][l.k];
          return (
            <g key={l.k}>
              <Label x={X1 + 8} y={round(y(ultimo)) - 3} size={9.5} weight={700} color={l.color} mono>
                {l.label.toUpperCase()}
              </Label>
              <Label x={X1 + 8} y={round(y(ultimo)) + 9} size={8.5} color="var(--ink-5)">
                {l.nota}
              </Label>
            </g>
          );
        })}

        {bruto >= zoom.domain[0] && bruto <= zoom.domain[1] && (
          <Label x={round(x(bruto))} y={Y0 - 14} size={9} color="var(--signal)" anchor="middle" mono>
            TU SALARIO
          </Label>
        )}

        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />
        {marcasX.map(v => (
          <g key={v}>
            <line x1={round(x(v))} y1={Y1} x2={round(x(v))} y2={Y1 + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label x={round(x(v))} y={Y1 + 20} size={9.5} color="var(--ink-4)" anchor="middle" mono>
              {v === 0 ? '0 €' : eur(v)}
            </Label>
          </g>
        ))}
        <Label x={X1} y={Y1 + 38} size={9} color="var(--ink-5)" anchor="end" mono>
          SALARIO BRUTO ANUAL
        </Label>

        <rect
          className="fs-hit"
          x={X0}
          y={Y0 - 10}
          width={X1 - X0}
          height={Y1 - Y0 + 12}
          onMouseMove={onMove}
          onMouseLeave={() => setTip(null)}
        />
      </ChartFrame>

      <p className="fs-note" style={{ marginTop: 12, maxWidth: '72ch' }}>
        La distancia vertical entre la línea azul y la negra es exactamente la confusión que
        genera hablar de «estar en el tramo del {pct(nomina.tipoMargIRPF * 100, 0)}»: ese tipo
        se aplica sólo al último euro, mientras que sobre el conjunto de tu sueldo pagas{' '}
        <strong>{pct(nomina.tipoEfectivoIRPF * 100)}</strong> de IRPF.
      </p>
    </Figure>
  );
}
