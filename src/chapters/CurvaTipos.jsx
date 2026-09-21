import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { calcularNomina, calcularTipoMarginal } from '../engine/irpf';
import Figure from '../figures/Figure';
import ZoomSvg from '../figures/ZoomSvg';
import { Label } from '../figures/marks';
import { linear, polyline, round } from '../figures/scale';
import { eur, pct } from '../utils/format';

const W = 880;
const H = 400;
const X0 = 24;
const X1 = W - 108;
const Y0 = 26;
const Y1 = H - 52;
const MAXB = 80000;
const STEP = 500;

/**
 * FIG. 06 — LA CURVA DE TIPOS.
 * The lesson that no single number can carry: how the marginal rate and the
 * effective rate diverge across the whole income range. Sweep the figure and
 * the readout follows your cursor; your own salary stays marked in petrol.
 */
export default function CurvaTipos() {
  const { bruto, anio, opts, nomina, marginal } = useFiscal();
  const [hoverB, setHoverB] = useState(null);

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
        neto: n.salarioNeto,
      });
    }
    return out;
  }, [anio, opts]);

  const maxY = Math.min(100, Math.max(60, Math.ceil(Math.max(...serie.map(p => p.marg)) / 10) * 10));
  const x = linear([0, MAXB], [X0, X1]);
  const y = linear([0, maxY], [Y1, Y0]);

  const activo = hoverB !== null
    ? serie.reduce((a, c) => (Math.abs(c.b - hoverB) < Math.abs(a.b - hoverB) ? c : a), serie[0])
    : null;

  const lineas = [
    { k: 'marg', label: 'Marginal total', color: 'var(--counter)', width: 1.6,
      nota: 'lo que se lleva el siguiente euro' },
    { k: 'efTotal', label: 'Efectivo total', color: 'var(--ink)', width: 1.4,
      nota: 'IRPF + cotizaciones sobre el bruto' },
    { k: 'efIrpf', label: 'Efectivo IRPF', color: 'var(--ink-4)', width: 1.2,
      nota: 'sólo IRPF sobre el bruto' },
  ];

  const onMove = e => {
    const svg = e.currentTarget.ownerSVGElement || e.currentTarget;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHoverB(Math.max(0, Math.min(MAXB, x.invert(px))));
  };

  const ref = activo || { b: bruto, efIrpf: nomina.tipoEfectivoIRPF * 100, efTotal: nomina.tipoEfectivoTotal * 100, marg: marginal.tipoMarginalTotal * 100 };

  return (
    <Figure
      id="07"
      title="El marginal y el efectivo se separan: por eso un tipo alto no significa pagar ese tipo"
      sub={`${anio} · salario bruto de 0 a ${eur(MAXB)} · perfil seleccionado · pasa el cursor por la figura`}
      legend="Cada línea se nombra en su propio extremo · la línea vertical de puntos es tu salario"
      source="Fuente · cálculo propio sobre la escala vigente"
      summary={`A ${eur(bruto)}, tipo efectivo IRPF ${pct(nomina.tipoEfectivoIRPF * 100)}, efectivo total ${pct(nomina.tipoEfectivoTotal * 100)}, marginal total ${pct(marginal.tipoMarginalTotal * 100)}.`}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">{activo ? 'Bruto señalado' : 'Tu bruto'}</span>
          <span className="fs-readout-v">{eur(ref.b)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Marginal total</span>
          <span className="fs-readout-v fs-counter">{pct(ref.marg)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Efectivo total</span>
          <span className="fs-readout-v">{pct(ref.efTotal)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Efectivo IRPF</span>
          <span className="fs-readout-v fs-muted">{pct(ref.efIrpf)}</span>
        </span>
      </div>

      <ZoomSvg viewBox={`0 0 ${W} ${H}`} label="Curva de tipos efectivo y marginal">
        {/* horizontal grid every 10 points */}
        {Array.from({ length: maxY / 10 + 1 }, (_, i) => i * 10).map(v => (
          <g key={v}>
            <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
            <Label x={X0 - 4} y={round(y(v)) + 3} size={9} color="var(--ink-5)" anchor="end" mono>
              {pct(v, 0)}
            </Label>
          </g>
        ))}

        {lineas.map(l => {
          const last = serie[serie.length - 1][l.k];
          return (
            <g key={l.k}>
              <path d={polyline(serie.map(p => [x(p.b), y(p[l.k])]))} fill="none" stroke={l.color} strokeWidth={l.width} strokeLinejoin="round" />
              <Label x={X1 + 8} y={round(y(last)) - 3} size={9.5} weight={700} color={l.color} mono>
                {l.label.toUpperCase()}
              </Label>
              <Label x={X1 + 8} y={round(y(last)) + 9} size={8.5} color="var(--ink-5)">
                {l.nota}
              </Label>
            </g>
          );
        })}

        {/* the reader's own salary */}
        {bruto <= MAXB && (
          <g>
            <line x1={round(x(bruto))} y1={Y0 - 6} x2={round(x(bruto))} y2={Y1} stroke="var(--signal)" strokeWidth={1.2} strokeDasharray="3 3" />
            <Label x={round(x(bruto))} y={Y0 - 10} size={9} color="var(--signal)" anchor="middle" mono>
              TU SALARIO
            </Label>
          </g>
        )}

        {/* crosshair follows the cursor */}
        {activo && (
          <g>
            <line className="fs-crosshair" x1={round(x(activo.b))} y1={Y0 - 6} x2={round(x(activo.b))} y2={Y1} />
            {lineas.map(l => (
              <circle key={l.k} cx={round(x(activo.b))} cy={round(y(activo[l.k]))} r={3.4} fill={l.color} />
            ))}
          </g>
        )}

        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />
        {[0, 20000, 40000, 60000, 80000].map(v => (
          <Label key={v} x={round(x(v))} y={Y1 + 22} size={9.5} color="var(--ink-4)" anchor="middle" mono>
            {v === 0 ? '0 €' : eur(v)}
          </Label>
        ))}
        <Label x={X1} y={Y1 + 40} size={9} color="var(--ink-5)" anchor="end" mono>
          SALARIO BRUTO ANUAL →
        </Label>

        <rect
          className="fs-hit"
          x={X0}
          y={Y0 - 10}
          width={X1 - X0}
          height={Y1 - Y0 + 12}
          onMouseMove={onMove}
          onMouseLeave={() => setHoverB(null)}
        />
      </ZoomSvg>

      <p className="fs-note" style={{ marginTop: 12, maxWidth: '72ch' }}>
        La distancia vertical entre la línea azul y la negra es exactamente la confusión que
        genera hablar de «estar en el tramo del {pct(nomina.tipoMargIRPF * 100, 0)}»: ese tipo
        se aplica sólo al último euro, mientras que sobre el conjunto de tu sueldo pagas{' '}
        <strong>{pct(nomina.tipoEfectivoIRPF * 100)}</strong> de IRPF.
      </p>
    </Figure>
  );
}
