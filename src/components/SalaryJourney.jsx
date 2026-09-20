import { useMemo, useState } from 'react';
import { calcularNomina } from '../engine/irpf';
import { eur, pct } from '../utils/format';
import FigureZoom from './FigureZoom';

const STAGE_KEYS = ['coste', 'bruto', 'trasSS', 'neto'];

export default function SalaryJourney({ bruto, anio, opts }) {
  const [active, setActive] = useState(null);
  const resultado = useMemo(() => calcularNomina(bruto, anio, opts), [bruto, anio, opts]);
  const total = Math.max(resultado.costeLab || bruto || 1, 1);
  const afterWorkerSS = Math.max(0, bruto - resultado.cotTra);

  const stages = [
    { key: 'coste', label: 'Coste laboral', value: resultado.costeLab, y: 54 },
    { key: 'bruto', label: 'Salario bruto', value: bruto, y: 174 },
    { key: 'trasSS', label: 'Tras SS trabajador', value: afterWorkerSS, y: 294 },
    { key: 'neto', label: 'Renta neta', value: resultado.salarioNeto, y: 414 },
  ];

  const deductions = [
    { key: 'ssEmp', label: 'SS empresa', value: resultado.cotEmp, from: 'coste', to: 'bruto', y: 130 },
    { key: 'ssTra', label: 'SS trabajador', value: resultado.cotTra, from: 'bruto', to: 'trasSS', y: 250 },
    { key: 'irpf', label: 'IRPF', value: resultado.irpfFinal, from: 'trasSS', to: 'neto', y: 370 },
  ];

  const x = 74;
  const maxWidth = 720;
  const widthFor = value => Math.max(10, (value / total) * maxWidth);
  const activeIsStage = STAGE_KEYS.includes(active);
  const activeDeduction = deductions.find(item => item.key === active);
  const netShare = total > 0 ? resultado.salarioNeto / total : 0;

  return (
    <section className="salary-journey" aria-labelledby="salary-journey-title">
      <div className="salary-journey__intro">
        <div>
          <p className="figure-kicker">FIG. 02 · FLUJO FISCAL</p>
          <h3 id="salary-journey-title">El viaje de un salario</h3>
        </div>
        <p>
          La misma corriente se estrecha. Cada ancho representa el dinero que aún queda
          después de la siguiente resta.
        </p>
      </div>

      <div className="salary-journey__statement">
        <strong>{eur(resultado.costeLab)}</strong>
        <span>cuesta tu trabajo</span>
        <i aria-hidden="true">→</i>
        <strong>{eur(resultado.salarioNeto)}</strong>
        <span>llegan a tu cuenta</span>
      </div>

      <FigureZoom label="Flujo proporcional del coste laboral" minWidth={820}>
        <svg className="salary-journey__svg" viewBox="0 0 920 535" role="img" aria-labelledby="journey-svg-title journey-svg-desc">
          <title id="journey-svg-title">Flujo proporcional desde el coste laboral hasta la renta neta</title>
          <desc id="journey-svg-desc">El ancho se reduce al separar cotización empresarial, cotización del trabajador e IRPF.</desc>

          {stages.map((stage, index) => {
            const width = widthFor(stage.value);
            const related = activeDeduction && [activeDeduction.from, activeDeduction.to].includes(stage.key);
            const dimmed = active && (activeIsStage ? active !== stage.key : !related);
            return (
              <g
                key={stage.key}
                className={`salary-journey__stage ${stage.key === 'neto' ? 'is-net-stage' : ''} ${active === stage.key ? 'is-active' : ''} ${related ? 'is-related' : ''} ${dimmed ? 'is-dimmed' : ''}`}
                tabIndex="0"
                role="button"
                aria-pressed={active === stage.key}
                aria-label={`${stage.label}: ${eur(stage.value)}, ${pct((stage.value / total) * 100)} del coste laboral`}
                onMouseEnter={() => setActive(stage.key)}
                onFocus={() => setActive(stage.key)}
                onClick={() => setActive(stage.key)}
              >
                {index > 0 && (
                  <polygon
                    points={`${x},${stage.y - 36} ${x + widthFor(stages[index - 1].value)},${stage.y - 36} ${x + width},${stage.y - 8} ${x},${stage.y - 8}`}
                    className="salary-journey__neck"
                  />
                )}
                <rect x={x} y={stage.y} width={width} height="54" rx="2" className={stage.key === 'neto' ? 'is-net' : ''} />
                <text x={x} y={stage.y - 12} className="salary-journey__label">{stage.label.toUpperCase()}</text>
                <text x={x + 16} y={stage.y + 35} className="salary-journey__value">{eur(stage.value)}</text>
                <text x={x + width + 16} y={stage.y + 33} className="salary-journey__pct">{pct((stage.value / total) * 100)}</text>
              </g>
            );
          })}

          {deductions.map(item => {
            const from = stages.find(stage => stage.key === item.from);
            const to = stages.find(stage => stage.key === item.to);
            const start = x + widthFor(to.value);
            const end = x + widthFor(from.value);
            const related = activeIsStage && [item.from, item.to].includes(active);
            const dimmed = active && (activeIsStage ? !related : active !== item.key);
            return (
              <g
                key={item.key}
                className={`salary-journey__deduction ${active === item.key ? 'is-active' : ''} ${related ? 'is-related' : ''} ${dimmed ? 'is-dimmed' : ''}`}
                tabIndex="0"
                role="button"
                aria-pressed={active === item.key}
                aria-label={`${item.label}: ${eur(item.value)}`}
                onMouseEnter={() => setActive(item.key)}
                onFocus={() => setActive(item.key)}
                onClick={() => setActive(item.key)}
              >
                <line x1={start} x2={end} y1={item.y} y2={item.y} />
                <circle cx={end} cy={item.y} r="4" />
                <text x={end + 10} y={item.y - 8}>{item.label.toUpperCase()}</text>
                <text x={end + 10} y={item.y + 15} className="salary-journey__deduction-value">− {eur(item.value)}</text>
              </g>
            );
          })}
        </svg>
      </FigureZoom>

      <div className="salary-journey__footer">
        <p><b>{pct(netShare * 100)}</b> del coste laboral termina como renta neta.</p>
        <p className="source-line">FUENTE · CÁLCULO FISCALSCOPE · PARÁMETROS LIRPF Y LGSS {anio}</p>
      </div>
    </section>
  );
}
