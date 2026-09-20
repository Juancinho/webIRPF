import { useMemo, useState } from 'react';
import { calcularNomina } from '../engine/irpf';
import { eur } from '../utils/format';
import FiscalBreakdown from './FiscalBreakdown';
import FigureZoom from './FigureZoom';

const META = {
  neto: { label: 'Salario neto', desc: 'Lo que llega a tu cuenta.' },
  irpf: { label: 'IRPF', desc: 'Cuota estimada del impuesto sobre la renta.' },
  ssTra: { label: 'SS trabajador', desc: 'Tu cotización a la Seguridad Social.' },
  ssEmp: { label: 'SS empresa', desc: 'Cotización patronal añadida al bruto.' },
};

export default function CuñaFiscal({ bruto, anio }) {
  const [vista, setVista] = useState('trabajador');
  const result = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);
  const total = vista === 'trabajador' ? result.bruto : result.costeLab;
  const segments = [
    { key: 'neto', value: result.salarioNeto },
    { key: 'irpf', value: result.irpfFinal },
    { key: 'ssTra', value: result.cotTra },
    ...(vista === 'empresa' ? [{ key: 'ssEmp', value: result.cotEmp }] : []),
  ];

  return (
    <div className="wedge-editorial">
      <div className="chart-heading-row">
        <div>
          <p className="chart-kicker">100 EUROS · DOS PERSPECTIVAS</p>
          <h3>De todo el coste de tu trabajo, esto es lo que llega a ti</h3>
          <p className="chart-subtitle">
            {vista === 'trabajador'
              ? `El bruto contractual de ${eur(result.bruto)} se divide entre neto, IRPF y tu cotización.`
              : `El coste laboral de ${eur(result.costeLab)} añade la cotización que paga la empresa.`}
          </p>
        </div>
        <div className="segmented-control" role="group" aria-label="Perspectiva de la cuña fiscal">
          <button onClick={() => setVista('trabajador')} aria-pressed={vista === 'trabajador'}
            className={`segmented-control__button ${vista === 'trabajador' ? 'is-active' : ''}`}>
            Trabajador
          </button>
          <button onClick={() => setVista('empresa')} aria-pressed={vista === 'empresa'}
            className={`segmented-control__button ${vista === 'empresa' ? 'is-active' : ''}`}>
            Coste empresa
          </button>
        </div>
      </div>

      <FigureZoom label="Campo de 100 unidades del coste laboral" minWidth={620}>
        <FiscalBreakdown segments={segments} total={total} title="Un bloque = 1% del total" />
      </FigureZoom>

      <div className="wedge-ledger">
        {segments.map(segment => (
          <div key={segment.key}>
            <span className={`fiscal-legend-item__mark fiscal-block--${segment.key}`} />
            <div><strong>{META[segment.key].label}</strong><small>{META[segment.key].desc}</small></div>
            <b>{eur(segment.value)}</b>
            <em>{total > 0 ? (segment.value / total * 100).toFixed(1) : 0}%</em>
          </div>
        ))}
      </div>
      <p className="source-line">FUENTE · CÁLCULO FISCALSCOPE CON PARÁMETROS LIRPF Y LGSS DEL AÑO SELECCIONADO</p>
    </div>
  );
}
