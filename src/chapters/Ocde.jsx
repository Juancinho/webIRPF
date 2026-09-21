import { useMemo, useState } from 'react';
import { CUNA_OCDE_2025, CUNA_OCDE_META, CARGA_PERSONAL_OCDE_2025 } from '../engine/irpf';
import Figure from '../figures/Figure';
import ZoomSvg from '../figures/ZoomSvg';
import { Label } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { pct } from '../utils/format';

const PAISES = CUNA_OCDE_2025.filter(p => !p.media);
const MEDIA = CUNA_OCDE_2025.find(p => p.code === 'OECD');
const ESPANA = CUNA_OCDE_2025.find(p => p.code === 'ES');

const SEGMENTOS = [
  ['neto', 'Llega al trabajador', 'var(--night-ink)'],
  ['irpf', 'IRPF', '#9aa0a2'],
  ['cotTrab', 'SS trabajador', '#6b7477'],
  ['cotEmp', 'SS empresa', 'var(--night-signal)'],
];

/**
 * FIG. 17 — ESPAÑA EN LA OCDE.
 * Every country is one row of a hundred euros of labour cost, split into what
 * reaches the worker and what does not — the same unit as FIG. 16, so the two
 * figures can be read against each other. Sorting by what arrives turns the
 * ranking and the composition into a single reading.
 */
export default function Ocde() {
  const [ref, setRef] = useState('DE');
  const [hover, setHover] = useState(null);
  const [orden, setOrden] = useState('neto');

  const filas = useMemo(() => {
    const arr = PAISES.map(p => ({ ...p, neto: Math.max(0, 100 - p.total) }));
    arr.sort((a, b) => (orden === 'neto' ? b.neto - a.neto : a.pais.localeCompare(b.pais, 'es')));
    return arr;
  }, [orden]);

  const W = 880;
  const rowH = 17;
  const H = filas.length * rowH + 96;
  const X0 = 152;
  const X1 = W - 108;
  const x = linear([0, 100], [X0, X1]);

  const activo = filas.find(p => p.code === (hover || ref)) || filas[0];
  const posicion = [...filas].sort((a, b) => b.neto - a.neto).findIndex(p => p.code === 'ES') + 1;

  return (
    <Figure
      id="18"
      title={`De cada 100 € de coste laboral, en España llegan ${Math.round(100 - ESPANA.total)} € al trabajador: el puesto ${posicion} de ${filas.length} de la OCDE`}
      sub={`${CUNA_OCDE_META.informe} · datos ${CUNA_OCDE_META.ejercicio} · ${CUNA_OCDE_META.supuesto} · cada fila son 100 € de coste laboral`}
      legend="Cada barra suma 100 € · la parte clara es lo que llega al trabajador · las tres oscuras son IRPF, cotización del trabajador y cotización de la empresa"
      source={`Fuente · OCDE ${CUNA_OCDE_META.informe}, tabla ${CUNA_OCDE_META.tabla}`}
      note="Supuesto estandarizado —persona soltera, sin hijos, con el salario medio de su país— que no incluye IVA ni otros impuestos indirectos. Sirve para situar a España, no para calcular tu nómina."
      summary={filas.map(p => `${p.pais}: llegan ${Math.round(p.neto)} de cada 100`).join('; ')}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">{activo.pais}</span>
          <span className="fs-readout-v">{pct(activo.neto)} llega</span>
        </span>
        <span>
          <span className="fs-readout-k">IRPF</span>
          <span className="fs-readout-v">{pct(activo.irpf)}</span>
        </span>
        <span>
          <span className="fs-readout-k">SS trabajador</span>
          <span className="fs-readout-v">{pct(activo.cotTrab)}</span>
        </span>
        <span>
          <span className="fs-readout-k">SS empresa</span>
          <span className="fs-readout-v">{pct(activo.cotEmp)}</span>
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <span className="fs-seg">
          <button type="button" aria-pressed={orden === 'neto'} onClick={() => setOrden('neto')}>
            Por lo que llega
          </button>
          <button type="button" aria-pressed={orden === 'alfa'} onClick={() => setOrden('alfa')}>
            Alfabético
          </button>
        </span>
        <label className="fs-label" htmlFor="ocde-ref">
          País de referencia
        </label>
        <select id="ocde-ref" className="fs-select" value={ref} onChange={e => setRef(e.target.value)}>
          {[...PAISES]
            .sort((a, b) => a.pais.localeCompare(b.pais, 'es'))
            .map(p => (
              <option key={p.code} value={p.code}>
                {p.pais}
              </option>
            ))}
        </select>
      </div>

      <div className="fs-keys" style={{ marginBottom: 12 }}>
        {SEGMENTOS.map(([k, label, color]) => (
          <span key={k} className="fs-key" style={{ cursor: 'default' }}>
            <span className="fs-key-swatch" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      <ZoomSvg viewBox={`0 0 ${W} ${H}`} label="Cuña fiscal de los países de la OCDE">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
          <g key={v}>
            <line x1={round(x(v))} y1={26} x2={round(x(v))} y2={H - 54} stroke="#252c2f" strokeWidth={0.6} />
            <Label x={round(x(v))} y={20} size={8.5} color="#6d7679" anchor="middle" mono halo={false}>
              {v}
            </Label>
          </g>
        ))}

        {filas.map((p, i) => {
          const y = 34 + i * rowH;
          const esES = p.code === 'ES';
          const esRef = p.code === ref;
          const esHover = hover === p.code;
          const destacada = esES || esRef || esHover;
          const color = esES ? 'var(--night-signal)' : esRef ? 'var(--night-counter)' : '#a8adae';
          let cx = X0;
          return (
            <g key={p.code} opacity={hover && !esHover && !esES ? 0.55 : 1}>
              <Label
                x={X0 - 12}
                y={y + 8}
                size={esES ? 10 : 9}
                weight={destacada ? 800 : 500}
                color={color}
                anchor="end"
                halo={false}
              >
                {p.pais}
              </Label>

              {SEGMENTOS.map(([k, label, fill]) => {
                const w = (p[k] / 100) * (X1 - X0);
                const rect = (
                  <rect
                    key={k}
                    x={round(cx)}
                    y={y}
                    width={round(Math.max(0, w))}
                    height={11}
                    fill={fill}
                    opacity={k === 'neto' && !destacada ? 0.58 : 1}
                  >
                    <title>{`${p.pais} · ${label} — ${pct(p[k])} del coste laboral`}</title>
                  </rect>
                );
                cx += w;
                return rect;
              })}

              <Label
                x={X1 + 10}
                y={y + 8}
                size={esES ? 10.5 : 9.5}
                weight={destacada ? 800 : 500}
                color={color}
                halo={false}
              >
                {pct(p.neto, 0)}
              </Label>

              <rect
                className="fs-hit"
                x={0}
                y={y - 3}
                width={W}
                height={rowH}
                onMouseEnter={() => setHover(p.code)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}

        <line
          x1={round(x(100 - MEDIA.total))}
          y1={26}
          x2={round(x(100 - MEDIA.total))}
          y2={H - 54}
          stroke="#e8e6df"
          strokeWidth={1.1}
          strokeDasharray="4 3"
        />
        <Label x={round(x(100 - MEDIA.total))} y={H - 40} size={9} color="#c9c7c0" anchor="middle" mono halo={false}>
          MEDIA OCDE · LLEGAN {pct(100 - MEDIA.total, 0)}
        </Label>
        <Label x={X0} y={H - 18} size={9} color="#6d7679" mono halo={false}>
          € DE CADA 100 € DE COSTE LABORAL
        </Label>
      </ZoomSvg>

      <p className="fs-note" style={{ marginTop: 14, maxWidth: '74ch' }}>
        España reparte su cuña de una forma muy característica: un IRPF comparativamente bajo
        ({pct(ESPANA.irpf)} frente al {pct(MEDIA.irpf)} de media) y una cotización del trabajador
        más baja todavía ({pct(ESPANA.cotTrab)} frente al {pct(MEDIA.cotTrab)}), compensadas por
        una cotización empresarial muy alta ({pct(ESPANA.cotEmp)} frente al {pct(MEDIA.cotEmp)}).
        Por eso la nómina española parece menos gravada de lo que en realidad está el puesto de
        trabajo. En la carga que soporta directamente el trabajador sobre su bruto (tabla 1.3),
        España marca {pct(CARGA_PERSONAL_OCDE_2025.espana.total)} frente al{' '}
        {pct(CARGA_PERSONAL_OCDE_2025.mediaOCDE.total)} de media.
      </p>
    </Figure>
  );
}
