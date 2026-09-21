import { useCallback, useId, useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import {
  ANIOS,
  DATOS_CHART,
  DATOS_CHART_NOMINAL,
  INFLACION_A_2026,
  calcularNomina,
} from '../engine/irpf';
import Figure from '../figures/Figure';
import Epocas from './Epocas';
import ProgresividadFria from './ProgresividadFria';
import Art20Historia from './Art20Historia';
import ChartFrame from '../figures/ChartFrame';
import { useDomainZoom } from '../figures/useDomainZoom';
import { Label, Series } from '../figures/marks';
import { linear, polyline, round, ticks } from '../figures/scale';
import { eur, pct, sign } from '../utils/format';

/**
 * 04 · QUINCE AÑOS DE FISCALIDAD
 * FIG. 10 the same real salary year by year · FIG. 11 the ranking of eras ·
 * FIG. 12 the two-year comparator · FIG. 13 the atlas · FIG. 14 cold
 * progressivity · FIG. 15 the art. 20 rewritten six times.
 */
export default function Historia() {
  const { bruto, anio, opts, setAnio } = useFiscal();

  const bruto2026 = useMemo(
    () => Math.round(bruto * (INFLACION_A_2026[anio] || 1)),
    [bruto, anio]
  );

  const serie = useMemo(
    () =>
      ANIOS.map(a => {
        const inf = INFLACION_A_2026[a];
        const nominal = bruto2026 / inf;
        const n = calcularNomina(nominal, a, opts);
        return {
          anio: a,
          nominal,
          neto: n.salarioNeto * inf,
          efectivo: n.tipoEfectivoIRPF * 100,
          cuna: n.cunaFiscal * 100,
        };
      }),
    [bruto2026, opts]
  );

  const mejor = serie.reduce((a, c) => (c.neto > a.neto ? c : a), serie[0]);
  const hoy = serie[serie.length - 1];
  const dif = hoy.neto - mejor.neto;

  return (
    <section id="historia" className="fs-chapter" aria-labelledby="historia-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">04</span>

        <div className="fs-spread">
          <aside className="fs-rail">
            <div className="fs-rail-item">
              <span className="fs-stamp">Nota 03</span>
              <p className="fs-note">
                Comparar euros de 2012 con euros de 2026 sin corregir la inflación no dice nada.
                Aquí se fija el poder adquisitivo: {eur(bruto2026)} de 2026 equivalen a{' '}
                {eur(serie[0].nominal)} de 2012.
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Reformas</span>
              <p className="fs-note">
                2015 · nueva escala y mínimos
                <br />
                2019 · ampliación del art. 20
                <br />
                2023 · MEI y tramo del 47 %
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Fuente</span>
              <p className="fs-note">
                IPC de diciembre, INE. El dato de 2026 es una estimación hasta que el INE publique
                el cierre del año.
              </p>
              <p className="fs-source">
                <a href="https://www.ine.es/varipc/" target="_blank" rel="noreferrer noopener">
                  INE — Variación del IPC
                </a>
              </p>
            </div>
          </aside>

          <div className="fs-field">
            <div className="fs-chapter-head">
              <span className="fs-stamp">04 / 07 · Quince años de fiscalidad</span>
              <h2 id="historia-t" className="fs-title">
                El mismo sueldo,
                <br />
                quince años
              </h2>
              <p className="fs-kicker">
                Las reglas que acabas de ver no son eternas: se han reescrito quince veces desde
                2012. Esta es la misma capacidad de compra —{eur(bruto2026)} de hoy— pasada por la
                fiscalidad de cada año.
              </p>
            </div>

            {Math.abs(dif) > 1 && (
              <>
                <p className="fs-statement" style={{ maxWidth: '12ch' }}>{sign(dif)}</p>
                <p className="fs-body" style={{ marginTop: 14, marginBottom: 40 }}>
                  Con el mismo poder adquisitivo, {mejor.anio} dejaba{' '}
                  <strong>{eur(mejor.neto)}</strong> netos reales y {hoy.anio} deja{' '}
                  <strong>{eur(hoy.neto)}</strong>. La diferencia no viene de ganar menos, sino de
                  cómo han cambiado la escala, las cotizaciones y las reducciones.
                </p>
              </>
            )}

            <Dumbbells serie={serie} anio={anio} mejor={mejor} setAnio={setAnio} bruto2026={bruto2026} />

            <Epocas bruto2026={bruto2026} />

            <Atlas anio={anio} bruto2026={bruto2026} setAnio={setAnio} />

            <ProgresividadFria />

            <Art20Historia />

          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FIG. 08 ─────────────────────────────────────────────────────────────── */
function Dumbbells({ serie, anio, mejor, setAnio, bruto2026 }) {
  const W = 860;
  const rowH = 26;
  const H = serie.length * rowH + 52;
  const X0 = 64;
  const X1 = W - 150;

  const lo = Math.min(...serie.map(s => s.neto));
  const hi = Math.max(...serie.map(s => s.neto));
  const pad = Math.max(200, (hi - lo) * 0.18);
  const x = linear([lo - pad, hi + pad], [X0, X1]);
  const ref = serie[serie.length - 1].neto;
  const BEAD = 25; // one bead = 25 € of real difference

  return (
    <Figure
      id="10"
      title={`Mismo poder adquisitivo, ${serie.length} fiscalidades distintas`}
      sub={`${eur(bruto2026)} constantes de 2026 · neto real de cada año · perfil seleccionado`}
      legend={`Una cuenta = ${eur(BEAD)} reales de diferencia frente a ${serie[serie.length - 1].anio} · círculo hueco = ese año · círculo lleno = hoy`}
      source="Fuente · cálculo propio · IPC INE"
      summary={serie.map(s => `${s.anio}: ${eur(s.neto)}`).join('; ')}
    >
      <ChartFrame viewBox={`0 0 ${W} ${H}`} scroll>
        {serie.map((s, i) => {
          const y = 18 + i * rowH;
          const xs = x(s.neto);
          const xr = x(ref);
          const esSel = s.anio === anio;
          const esMejor = s.anio === mejor.anio;
          const nBeads = Math.min(26, Math.round(Math.abs(s.neto - ref) / BEAD));
          return (
            <g key={s.anio} onMouseEnter={() => undefined}>
              <line x1={X0 - 8} y1={y} x2={X1 + 8} y2={y} stroke="var(--ink-7)" strokeWidth={0.7} />
              <text
                x={X0 - 16}
                y={y + 3.5}
                fontSize={10}
                fontWeight={esSel ? 800 : 600}
                textAnchor="end"
                fill={esSel ? 'var(--signal)' : 'var(--ink-4)'}
                className="fs-t-stamp"
              >
                {s.anio}
              </text>

              {Array.from({ length: nBeads }, (_, k) => {
                const t = (k + 0.5) / nBeads;
                return (
                  <circle
                    key={k}
                    cx={round(xr + t * (xs - xr))}
                    cy={y}
                    r={1.5}
                    fill="var(--ink-5)"
                    opacity={0.8}
                  />
                );
              })}

              <circle
                cx={round(xs)}
                cy={y}
                r={esSel ? 5 : 4}
                fill={s.anio === 2026 ? 'var(--ink)' : esSel ? 'var(--signal)' : 'var(--bone)'}
                stroke={esSel ? 'var(--signal)' : 'var(--ink)'}
                strokeWidth={1.2}
              />

              <text
                x={X1 + 20}
                y={y + 3.5}
                fontSize={11}
                fontWeight={esSel || esMejor ? 800 : 500}
                fill={esSel ? 'var(--signal)' : 'var(--ink-2)'}
                className="num"
              >
                {eur(s.neto)}
              </text>
              {esMejor && (
                <text x={X1 + 96} y={y + 3.5} fontSize={8.5} fill="var(--ink-4)" className="fs-t-stamp">
                  MÁXIMO
                </text>
              )}

              <rect
                className="fs-hit"
                x={0}
                y={y - rowH / 2}
                width={W}
                height={rowH}
                onClick={() => setAnio(s.anio)}
              >
                <title>{`${s.anio} — ${eur(s.neto)} netos reales`}</title>
              </rect>
            </g>
          );
        })}

        <Label x={X0 - 16} y={H - 14} size={9} color="var(--ink-5)" anchor="end" mono>
          MENOS
        </Label>
        <Label x={X1 + 8} y={H - 14} size={9} color="var(--ink-5)" anchor="end" mono>
          MÁS NETO REAL →
        </Label>
      </ChartFrame>
    </Figure>
  );
}

/* ── FIG. 09 ─────────────────────────────────────────────────────────────── */
function Atlas({ anio, bruto2026, setAnio }) {
  const [activos, setActivos] = useState(() => new Set([2012, 2015, 2019, 2023, 2026]));
  const [modo, setModo] = useState('real');
  const [medida, setMedida] = useState('neto');
  const [tip, setTip] = useState(null);

  const toggle = useCallback(
    a =>
      setActivos(prev => {
        const next = new Set(prev);
        if (next.has(a)) {
          if (next.size > 1) next.delete(a);
        } else next.add(a);
        return next;
      }),
    []
  );

  const datos = medida === 'neto' || modo === 'real' ? DATOS_CHART : DATOS_CHART_NOMINAL;
  const key = medida === 'neto' ? 'neto' : 'irpf';

  const W = 880;
  const H = 400;
  const X0 = 20;
  const X1 = W - 92;
  const Y0 = 20;
  const Y1 = H - 46;

  const xs = datos.map(d => d.bruto);
  const zoom = useDomainZoom([xs[0], xs[xs.length - 1]], { pxRange: [X0, X1], vbWidth: W, maxZoom: 16 });
  const x = linear(zoom.domain, [X0, X1]);
  const clip = useId().replace(/:/g, '');

  const todos = ANIOS.flatMap(a => datos.map(d => d[`${key}_${a}`]));
  const lo = medida === 'neto' ? Math.min(...todos) : 0;
  const hi = Math.max(...todos);
  const y = linear([lo, hi], [Y1, Y0]);

  const path = a => polyline(datos.map(d => [x(d.bruto), y(d[`${key}_${a}`])]));
  const ultimo = a => datos[datos.length - 1][`${key}_${a}`];

  const exportCSV = () => {
    const aniosArr = ANIOS.filter(a => activos.has(a));
    const header = [
      'Bruto_EUR2026',
      ...aniosArr.map(a => `neto_${a}`),
      ...aniosArr.map(a => `tipoIRPF_${a}`),
      ...aniosArr.map(a => `cargaTotal_${a}`),
    ];
    const rows = DATOS_CHART.map(d => [
      d.bruto,
      ...aniosArr.map(a => d[`neto_${a}`]),
      ...aniosArr.map(a => d[`irpf_${a}`]),
      ...aniosArr.map(a => d[`total_${a}`]),
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'irpf_comparativa.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const marcado = Math.min(Math.max(bruto2026, xs[0]), xs[xs.length - 1]);

  const onMove = e => {
    const svg = e.currentTarget.ownerSVGElement;
    const r = svg.getBoundingClientRect();
    const v = x.invert(((e.clientX - r.left) / r.width) * W);
    const d = datos.reduce((best, c) => (Math.abs(c.bruto - v) < Math.abs(best.bruto - v) ? c : best), datos[0]);
    const vistos = ANIOS.filter(a => activos.has(a) || a === anio);
    setTip({
      vx: x(d.bruto),
      vy: y(d[`${key}_${anio}`]),
      title: eur(d.bruto),
      sub: medida === 'neto' ? 'Salario neto por bruto' : 'Tipo efectivo de IRPF',
      rows: vistos.map(a => [
        String(a),
        medida === 'neto' ? eur(d[`neto_${a}`]) : pct(d[`irpf_${a}`]),
        a === anio ? 'var(--signal)' : 'var(--ink-4)',
      ]),
    });
  };

  return (
    <Figure
      id="13"
      title={
        medida === 'neto'
          ? 'El neto real por nivel de renta, año a año'
          : 'La carga real del IRPF por nivel de renta, año a año'
      }
      sub={`${medida === 'neto' ? 'Euros constantes de 2026' : modo === 'real' ? 'Euros constantes de 2026' : 'Euros nominales de cada año'} · perfil estándar: individual, sin hijos, escala estatal`}
      legend="Año en curso en negro · año seleccionado en petróleo · resto en gris · sin leyenda: cada línea se nombra en su propio extremo"
      source="Fuente · cálculo propio sobre parámetros BOE · IPC INE"
      summary={`Curvas de ${medida === 'neto' ? 'salario neto' : 'tipo efectivo de IRPF'} para ${ANIOS.length} años entre ${eur(xs[0])} y ${eur(xs[xs.length - 1])} de bruto.`}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <span className="fs-seg">
          <button type="button" aria-pressed={medida === 'neto'} onClick={() => setMedida('neto')}>
            Neto
          </button>
          <button type="button" aria-pressed={medida === 'efectivo'} onClick={() => setMedida('efectivo')}>
            Tipo efectivo
          </button>
        </span>

        {medida === 'efectivo' && (
          <span className="fs-seg">
            <button type="button" aria-pressed={modo === 'real'} onClick={() => setModo('real')}>
              Real (€2026)
            </button>
            <button type="button" aria-pressed={modo === 'nominal'} onClick={() => setModo('nominal')}>
              Nominal
            </button>
          </span>
        )}

        <button type="button" className="fs-btn fs-btn-quiet" onClick={exportCSV}>
          Descargar CSV
        </button>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} zoom={zoom} tip={tip} label="El atlas de la renta">
        <defs>
          <clipPath id={clip}>
            <rect x={X0} y={Y0 - 12} width={X1 - X0} height={Y1 - Y0 + 14} />
          </clipPath>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const v = lo + (hi - lo) * t;
          return (
            <g key={t}>
              <line x1={X0} y1={y(v)} x2={X1} y2={y(v)} stroke="var(--ink-7)" strokeWidth={0.6} />
              <Label x={X0} y={y(v) - 5} size={9} color="var(--ink-5)" mono>
                {medida === 'neto' ? eur(v) : pct(v, 0)}
              </Label>
            </g>
          );
        })}

        <g clipPath={`url(#${clip})`}>
          {ANIOS.map(a => {
            const esActual = a === anio;
            const on = activos.has(a);
            if (!on && !esActual) {
              return <Series key={a} d={path(a)} color="var(--ink-7)" width={0.6} dim />;
            }
            return (
              <Series
                key={a}
                d={path(a)}
                color={esActual ? 'var(--signal)' : 'var(--ink-4)'}
                width={esActual ? 1.8 : 0.9}
              />
            );
          })}

          <line x1={round(x(marcado))} y1={Y0 - 4} x2={round(x(marcado))} y2={Y1} stroke="var(--counter)" strokeWidth={1} strokeDasharray="3 3" />

          {tip && <line className="fs-crosshair" x1={round(tip.vx)} y1={Y0 - 4} x2={round(tip.vx)} y2={Y1} />}
        </g>

        {/* etiquetas directas al margen, fuera del recorte */}
        {ANIOS.filter(a => activos.has(a) || a === anio).map(a => (
          <Label key={a} x={X1 + 8} y={round(y(ultimo(a))) + 3.5} size={10} weight={a === anio ? 800 : 700} color={a === anio ? 'var(--signal)' : 'var(--ink-4)'} mono>
            {a}
          </Label>
        ))}

        <Label x={round(x(marcado))} y={Y0 - 8} size={9} color="var(--counter)" anchor="middle" mono>
          TU SALARIO
        </Label>

        {ticks(zoom.domain[0], zoom.domain[1], 5).map(v => (
          <g key={v}>
            <line x1={round(x(v))} y1={Y1} x2={round(x(v))} y2={Y1 + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label x={round(x(v))} y={Y1 + 20} size={9.5} color="var(--ink-4)" anchor="middle" mono>
              {eur(v)}
            </Label>
          </g>
        ))}
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />

        <rect
          className="fs-hit"
          x={X0}
          y={Y0 - 12}
          width={X1 - X0}
          height={Y1 - Y0 + 14}
          onMouseMove={onMove}
          onMouseLeave={() => setTip(null)}
        />
      </ChartFrame>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
        {ANIOS.map(a => (
          <button
            key={a}
            type="button"
            className="fs-btn"
            style={{ padding: '5px 9px', minHeight: 30, fontSize: 10.5 }}
            aria-pressed={activos.has(a)}
            onClick={() => toggle(a)}
            onDoubleClick={() => setAnio(a)}
          >
            {a}
          </button>
        ))}
      </div>
      <p className="fs-note" style={{ marginTop: 8 }}>
        Selecciona los años que quieres destacar; el año en curso ({anio}) se dibuja siempre. El
        botón de descarga exporta los años seleccionados.
      </p>
    </Figure>
  );
}
