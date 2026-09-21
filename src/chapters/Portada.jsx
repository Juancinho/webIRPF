import { useRef, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { useNarrow } from '../hooks/useNarrow';
import { useNumeroAnimado } from '../hooks/useNumeroAnimado';
import { linear, clamp, round } from '../figures/scale';
import { TickFloor, Label, HundredField } from '../figures/marks';
import { dec, eur, num } from '../utils/format';

const MAX = 150000;

/**
 * 00 · PORTADA — the cover of the paper.
 * The calculator is not below the hero: the calculator IS the hero
 * (DESIGN.md §9). Masthead, salary, ruler, net and source metadata coexist in
 * one composition. On phones the ruler rotates instead of shrinking.
 */
export default function Portada() {
  const { bruto, anio, pagas, nomina, porPaga, smi, vecesSMI, percentil, setBruto } = useFiscal();
  const narrow = useNarrow();

  const pctCoste = nomina.costeLab > 0 ? (nomina.salarioNeto / nomina.costeLab) * 100 : 0;

  const bloques = [
    { key: 'neto', label: 'Llega como renta neta', value: Math.round(pctCoste), color: 'var(--ink)' },
    { key: 'resto', label: 'IRPF y cotizaciones', value: 100 - Math.round(pctCoste), color: 'var(--ink-6)' },
  ];

  const netoAnimado = useNumeroAnimado(nomina.salarioNeto);

  return (
    <section id="portada" className="fs-chapter fs-cover" aria-labelledby="portada-t">
      <div className="fs-page" style={{ width: '100%' }}>
        <div className="fs-masthead">
          <div>
            <p className="fs-masthead-name">FiscalScope</p>
            <p className="fs-masthead-sub">
              Informe fiscal interactivo
              <br />
              España · 2012—2026
            </p>
          </div>
          <p className="fs-masthead-meta">
            Nº 01
            <br />
            {anio}
          </p>
        </div>

        <div className="fs-cover-main">
          <h1 id="portada-t" className="fs-title">
            Tu sueldo{' '}
            <br />
            bajo el{' '}
            <br />
            microscopio{' '}
            <br />
            fiscal
          </h1>

          <div>
            <p className="fs-label" style={{ marginBottom: 6 }}>Salario bruto anual</p>
            <p className="fs-data" style={{ margin: 0 }}>
              {num(bruto)} <span className="fs-u">€</span>
            </p>

            <Regla
              bruto={bruto}
              setBruto={setBruto}
              narrow={narrow}
              nota={smi > 0 ? `${dec(vecesSMI, 2)} × SMI · PERCENTIL ${Math.round(percentil)}` : 'SIN SALARIO'}
            />

            <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: '24px 44px', alignItems: 'flex-end' }}>
              <div>
                <p className="fs-label" style={{ marginBottom: 4 }}>Neto anual</p>
                <p className="fs-data-md fs-signal num" style={{ margin: 0 }}>{eur(netoAnimado)}</p>
                <p className="fs-note" style={{ marginTop: 6 }}>
                  {eur(porPaga)} al mes · {pagas} pagas
                </p>
              </div>

              <div>
                <p className="fs-label" style={{ marginBottom: 8 }}>De cada 100 € de coste laboral</p>
                <svg className="fs-svg" viewBox="0 0 250 34" style={{ maxWidth: 250 }} aria-hidden="true">
                  <HundredField groups={bloques} columns={25} size={7} gap={2.6} y={2} />
                </svg>
                <p className="fs-note" style={{ marginTop: 8 }}>
                  <strong>{dec(pctCoste)} €</strong> llegan a tu cuenta
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="fs-cover-foot">
          <p className="fs-source" style={{ margin: 0 }}>
            Fuente · BOE · AEAT · TGSS · INE
          </p>
          <a className="fs-cover-scroll" href="#prologo">
            Sigue leyendo ↓
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * FIG. 01 — LA REGLA. A measured instrument: axis, tick floor, the reader's
 * mark. Horizontal on the page, vertical in portrait — the scroll direction
 * carries the axis rather than the type shrinking.
 */
function Regla({ bruto, setBruto, narrow, nota }) {
  const svgRef = useRef(null);
  // La regla es el mando de toda la publicación y no lo parecía: hasta que se
  // toca, el tirador respira y una pista dice qué hacer con él.
  const [tocada, setTocada] = useState(false);

  const W = narrow ? 300 : 720;
  const H = narrow ? 360 : 132;
  const A0 = narrow ? 18 : 8;
  const A1 = (narrow ? H : W) - (narrow ? 26 : 8);
  const AXIS = narrow ? 58 : 84;

  const pos = linear([0, MAX], [A0, A1]);
  const marca = pos(Math.min(bruto, MAX));

  const fromPointer = e => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const p = narrow
      ? ((e.clientY - r.top) / r.height) * H
      : ((e.clientX - r.left) / r.width) * W;
    const v = pos.invert(clamp(p, A0, A1));
    setBruto(Math.round(v / 500) * 500);
  };

  const onKeyDown = e => {
    const step = e.shiftKey ? 5000 : 500;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setBruto(bruto + step); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setBruto(bruto - step); e.preventDefault(); }
    if (e.key === 'Home') { setBruto(0); e.preventDefault(); }
    if (e.key === 'End') { setBruto(MAX); e.preventDefault(); }
  };

  const hitos = [0, 50000, 100000, 150000];

  return (
    <svg
      ref={svgRef}
      className="fs-svg fs-regla"
      viewBox={`0 0 ${W} ${H}`}
      role="slider"
      tabIndex={0}
      aria-label="Salario bruto anual"
      aria-valuemin={0}
      aria-valuemax={MAX}
      aria-valuenow={Math.min(bruto, MAX)}
      aria-valuetext={`${num(bruto)} euros brutos anuales`}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setTocada(true);
        fromPointer(e);
      }}
      onPointerMove={e => {
        if (e.buttons === 1) fromPointer(e);
      }}
      onKeyDown={e => { setTocada(true); onKeyDown(e); }}
      style={{
        marginTop: 18,
        cursor: narrow ? 'ns-resize' : 'ew-resize',
        touchAction: 'none',
        maxWidth: narrow ? 320 : undefined,
      }}
    >
      {narrow ? (
        <>
          <line x1={AXIS} y1={A0} x2={AXIS} y2={A1} stroke="var(--ink)" strokeWidth={1} />
          {Array.from({ length: 31 }, (_, i) => {
            const y = A0 + ((A1 - A0) * i) / 30;
            return (
              <line
                key={i}
                x1={AXIS}
                y1={round(y)}
                x2={AXIS + (i % 5 === 0 ? 9 : 5)}
                y2={round(y)}
                stroke="var(--ink-6)"
                strokeWidth={0.6}
              />
            );
          })}
          {hitos.map(v => (
            <Label key={v} x={AXIS - 12} y={round(pos(v)) + 3.5} size={9.5} color="var(--ink-4)" anchor="end" mono>
              {v === 0 ? '0 €' : `${v / 1000}.000`}
            </Label>
          ))}

          <line x1={AXIS} y1={A0} x2={AXIS} y2={round(marca)} stroke="var(--signal)" strokeWidth={2.5} />

          <line x1={AXIS - 16} y1={round(marca)} x2={AXIS + 46} y2={round(marca)} stroke="var(--signal)" strokeWidth={1.5} />
          <g className={`fs-regla-tirador ${tocada ? 'is-tocada' : ''}`}>
            <circle cx={AXIS} cy={round(marca)} r={11} fill="var(--bone)" stroke="var(--signal)" strokeWidth={1.5} />
            {[-3, 0, 3].map(d => (
              <line
                key={d}
                x1={AXIS - 4}
                y1={round(marca) + d}
                x2={AXIS + 4}
                y2={round(marca) + d}
                stroke="var(--signal)"
                strokeWidth={1}
              />
            ))}
          </g>
          <Label x={AXIS + 52} y={round(marca) + 3.5} size={10} color="var(--signal)" mono>
            {nota}
          </Label>
        </>
      ) : (
        <>
          <line x1={A0} y1={AXIS} x2={A1} y2={AXIS} stroke="var(--ink)" strokeWidth={1} />
          <TickFloor x0={A0} x1={A1} y={AXIS} count={61} height={5} />
          {hitos.map(v => (
            <Label
              key={v}
              x={pos(v)}
              y={AXIS + 26}
              size={9.5}
              color="var(--ink-4)"
              anchor={v === 0 ? 'start' : v === MAX ? 'end' : 'middle'}
              mono
            >
              {v === 0 ? '0 €' : `${v / 1000}.000`}
            </Label>
          ))}

          {/* el rastro: cuánto de la escala llevas recorrido */}
          <line x1={A0} y1={AXIS} x2={round(marca)} y2={AXIS} stroke="var(--signal)" strokeWidth={2.5} />

          <line x1={round(marca)} y1={AXIS - 42} x2={round(marca)} y2={AXIS + 8} stroke="var(--signal)" strokeWidth={1.5} />
          <g className={`fs-regla-tirador ${tocada ? 'is-tocada' : ''}`}>
            <circle cx={round(marca)} cy={AXIS} r={11} fill="var(--bone)" stroke="var(--signal)" strokeWidth={1.5} />
            {[-3, 0, 3].map(d => (
              <line
                key={d}
                x1={round(marca) + d}
                y1={AXIS - 4}
                x2={round(marca) + d}
                y2={AXIS + 4}
                stroke="var(--signal)"
                strokeWidth={1}
              />
            ))}
          </g>
          {!tocada && (
            <Label x={marca} y={AXIS + 42} size={9.5} color="var(--signal)" anchor="middle" mono>
              ← ARRASTRA PARA CAMBIAR TU SUELDO →
            </Label>
          )}
          <Label
            x={marca}
            y={AXIS - 50}
            size={10}
            color="var(--signal)"
            anchor={marca > A1 - 140 ? 'end' : marca < 140 ? 'start' : 'middle'}
            mono
          >
            {nota}
          </Label>
        </>
      )}
    </svg>
  );
}
