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
 * FIG. 10 los quince años, en serie o en clasificación · FIG. 11 el comparador
 * de dos años · FIG. 12 el atlas · FIG. 13 la progresividad fría ·
 * FIG. 14 el art. 20 reescrito seis veces.
 */
export default function Historia() {
  const { bruto, anio, opts, setAnio, setBruto } = useFiscal();

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

  /* Elegir un año en la FIG. 10 cambiaba el ancla de la comparación: el bruto
     se interpreta en euros del año seleccionado, así que al cambiar de año
     cambiaba el poder adquisitivo y con él TODAS las cifras de la figura. Aquí
     el año se elige conservando el poder adquisitivo: el bruto nominal se
     reexpresa en euros de ese año, y la figura se queda quieta. */
  const elegirAnio = useCallback(
    a => {
      const inf = INFLACION_A_2026[a] || 1;
      setBruto(Math.round(bruto2026 / inf));
      setAnio(a);
    },
    [bruto2026, setAnio, setBruto]
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
                <p className="fs-statement fs-statement-rule fs-signal" style={{ maxWidth: '12ch' }}>
                  {sign(dif)}
                </p>
                <p className="fs-body" style={{ marginTop: 14, marginBottom: 40 }}>
                  Con el mismo poder adquisitivo, {mejor.anio} dejaba{' '}
                  <strong>{eur(mejor.neto)}</strong> netos reales y {hoy.anio} deja{' '}
                  <strong>{eur(hoy.neto)}</strong>. La diferencia no viene de ganar menos, sino de
                  cómo han cambiado la escala, las cotizaciones y las reducciones.
                </p>
              </>
            )}

            <Dumbbells serie={serie} anio={anio} mejor={mejor} elegirAnio={elegirAnio} bruto2026={bruto2026} />

            <Epocas bruto2026={bruto2026} />

            <Atlas anio={anio} bruto2026={bruto2026} elegirAnio={elegirAnio} />

            <ProgresividadFria />

            <Art20Historia />

          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FIG. 10 ─────────────────────────────────────────────────────────────── */
/**
 * La misma capacidad de compra, pasada por quince fiscalidades.
 *
 * Antes esto eran dos figuras con los mismos datos —una en orden cronológico y
 * otra ordenada por neto— y nadie sabía en qué se diferenciaban. Es una sola,
 * con un interruptor de orden: la serie responde «¿cómo ha ido cambiando?» y la
 * clasificación «¿cuál fue el mejor año?», que son dos preguntas, no dos
 * gráficos.
 *
 * Lo que se mide es la **distancia a hoy**: todas las barras salen de la misma
 * vertical, el neto del último año. Elegir un año conserva el poder adquisitivo
 * (`elegirAnio`), así que las cifras no se mueven al cambiar de año.
 */
function Dumbbells({ serie, anio, mejor, elegirAnio, bruto2026 }) {
  const [orden, setOrden] = useState('cronologico');
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const W = 880;
  const rowH = 30;
  const H = serie.length * rowH + 76;
  const X0 = 78;
  const X1 = W - 366;

  const ref = serie[serie.length - 1].neto;
  const difs = serie.map(s => s.neto - ref);
  const lo = Math.min(0, ...difs);
  const hiDif = Math.max(0, ...difs);
  const aire = Math.max(hiDif - lo, 1) * 0.12;
  const x = linear([lo - aire, hiDif + aire], [X0, X1]);
  const cero = x(0);

  const filas = orden === 'ranking' ? [...serie].sort((p, q) => q.neto - p.neto) : serie;
  const peor = [...serie].sort((p, q) => p.neto - q.neto)[0];
  const activo = serie.find(s => s.anio === (hover ?? anio)) || serie[serie.length - 1];

  const COL_NETO = W - 300;
  const COL_DIF = W - 208;
  const COL_IRPF = W - 104;
  const COL_CUNA = W - 2;

  return (
    <Figure
      id="10"
      title={
        orden === 'ranking'
          ? `Con este poder adquisitivo, tu mejor año fue ${mejor.anio} y el peor ${peor.anio}`
          : `Mismo poder adquisitivo, ${serie.length} fiscalidades distintas`
      }
      sub={`${eur(bruto2026)} constantes de 2026 · cada barra mide lo que ese año dejaba de más o de menos que ${serie[serie.length - 1].anio} · pulsa un año para llevar la publicación a él`}
      legend={`La vertical es el neto de ${serie[serie.length - 1].anio} · a la derecha, años que dejaban más · a la izquierda, años que dejaban menos · las dos últimas columnas son el tipo efectivo de IRPF y la cuña fiscal`}
      source="Fuente · cálculo propio · IPC INE"
      note="Al elegir un año se mantiene tu poder adquisitivo: el bruto se reexpresa en euros de ese año, por eso las cifras de esta figura no se mueven al cambiar de año."
      summary={serie.map(s => `${s.anio}: ${eur(s.neto)}`).join('; ')}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <span className="fs-seg">
          <button type="button" aria-pressed={orden === 'cronologico'} onClick={() => setOrden('cronologico')}>
            Cronológico
          </button>
          <button type="button" aria-pressed={orden === 'ranking'} onClick={() => setOrden('ranking')}>
            Por neto real
          </button>
        </span>
        <span className="fs-note" style={{ margin: 0 }}>
          {orden === 'ranking' ? '¿Cuál fue el mejor año?' : '¿Cómo ha ido cambiando?'}
        </span>
      </div>

      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Año {activo.anio}</span>
          <span className="fs-readout-v">{eur(activo.neto)} netos reales</span>
        </span>
        <span>
          <span className="fs-readout-k">IRPF efectivo</span>
          <span className="fs-readout-v">{pct(activo.efectivo)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Cuña fiscal</span>
          <span className="fs-readout-v">{pct(activo.cuna)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Frente a {mejor.anio}</span>
          <span className="fs-readout-v fs-signal">{sign(activo.neto - mejor.neto)}</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll>
        {/* cabeceras de las columnas numéricas */}
        <Label x={COL_NETO} y={20} size={8.5} color="var(--ink-5)" anchor="end" mono>NETO REAL</Label>
        <Label x={COL_DIF} y={20} size={8.5} color="var(--ink-5)" anchor="end" mono>VS. HOY</Label>
        <Label x={COL_IRPF} y={20} size={8.5} color="var(--ink-5)" anchor="end" mono>IRPF EF.</Label>
        <Label x={COL_CUNA} y={20} size={8.5} color="var(--ink-5)" anchor="end" mono>CUÑA</Label>

        {/* la vertical de referencia: el neto de hoy */}
        <line x1={round(cero)} y1={34} x2={round(cero)} y2={H - 40} stroke="var(--ink)" strokeWidth={1} />
        <Label x={round(cero)} y={28} size={9} color="var(--ink-4)" anchor="middle" mono>
          NETO DE {serie[serie.length - 1].anio}
        </Label>

        {filas.map((s, i) => {
          const y = 50 + i * rowH;
          const dif = s.neto - ref;
          const xs = x(dif);
          const esSel = s.anio === anio;
          const esHover = hover === s.anio;
          const esMejor = s.anio === mejor.anio;
          const esHoy = s.anio === serie[serie.length - 1].anio;
          const apagado = hover && !esHover && !esSel;
          const color = esSel ? 'var(--signal)' : esHover ? 'var(--ink)' : dif >= 0 ? 'var(--ink-2)' : 'var(--ink-4)';
          return (
            <g key={s.anio} className="fs-group" opacity={apagado ? 0.45 : 1}>
              <line x1={X0} y1={y + 11} x2={COL_CUNA} y2={y + 11} stroke="var(--ink-7)" strokeWidth={0.6} />

              {orden === 'ranking' && (
                <Label x={X0 - 42} y={y + 4} size={8.5} color="var(--ink-5)" anchor="end" mono>
                  {i + 1}.º
                </Label>
              )}
              <text
                x={X0 - 12}
                y={y + 4}
                fontSize={10.5}
                fontWeight={esSel ? 800 : 600}
                textAnchor="end"
                fill={esSel ? 'var(--signal)' : 'var(--ink-4)'}
                className="fs-t-stamp"
              >
                {s.anio}
              </text>

              {!esHoy && (
                <rect
                  x={round(Math.min(cero, xs))}
                  y={y - 5}
                  width={round(Math.max(1.5, Math.abs(xs - cero)))}
                  height={11}
                  fill={color}
                  rx={1}
                />
              )}
              {esHoy && <circle cx={round(cero)} cy={y} r={4} fill="var(--signal)" />}

              <text x={COL_NETO} y={y + 4} fontSize={12} fontWeight={esSel || esMejor ? 800 : 500}
                textAnchor="end" fill={esSel ? 'var(--signal)' : 'var(--ink-2)'} className="num">
                {eur(s.neto)}
              </text>
              {!esHoy && (
                <text x={COL_DIF} y={y + 4} fontSize={10.5} fontWeight={600} textAnchor="end"
                  fill={dif >= 0 ? 'var(--ink-3)' : 'var(--counter)'} className="num">
                  {sign(dif)}
                </text>
              )}
              <text x={COL_IRPF} y={y + 4} fontSize={10} textAnchor="end" fill="var(--ink-4)" className="num">
                {pct(s.efectivo)}
              </text>
              <text x={COL_CUNA} y={y + 4} fontSize={10} textAnchor="end" fill="var(--ink-4)" className="num">
                {pct(s.cuna)}
              </text>
              {esMejor && (
                <text x={COL_DIF} y={y - 8} fontSize={8} textAnchor="end" fill="var(--ink-4)" className="fs-t-stamp">
                  MÁXIMO
                </text>
              )}

              <rect
                className="fs-hit"
                x={0}
                y={y - rowH / 2}
                width={W}
                height={rowH}
                onMouseEnter={() => {
                  setHover(s.anio);
                  setTip({
                    vx: Math.max(cero, xs),
                    vy: y,
                    title: String(s.anio),
                    sub: `${eur(s.neto)} netos reales`,
                    rows: [
                      ['Frente a hoy', sign(dif), dif >= 0 ? 'var(--ink)' : 'var(--counter)'],
                      ['Bruto equivalente', eur(s.nominal)],
                      ['IRPF efectivo', pct(s.efectivo)],
                      ['Cuña fiscal', pct(s.cuna)],
                    ],
                  });
                }}
                onMouseLeave={() => { setHover(null); setTip(null); }}
                onClick={() => elegirAnio(s.anio)}
                style={{ cursor: 'pointer' }}
              >
                <title>{`${s.anio} — ${eur(s.neto)} netos reales (${sign(dif)} frente a hoy). Pulsa para leer el informe con la fiscalidad de ${s.anio}.`}</title>
              </rect>
            </g>
          );
        })}

        {lo < 0 && (
          <Label x={X0} y={H - 16} size={9} color="var(--ink-5)" mono>
            ← MENOS NETO REAL QUE HOY
          </Label>
        )}
        <Label x={X1} y={H - 16} size={9} color="var(--ink-5)" anchor="end" mono>
          MÁS NETO REAL QUE HOY →
        </Label>
      </ChartFrame>

      <p className="fs-note" style={{ marginTop: 12, maxWidth: '72ch' }}>
        Pulsa cualquier año para leer el resto del informe con su fiscalidad. Tu poder adquisitivo
        se mantiene: {eur(bruto2026)} de 2026 equivalen a {eur(serie[0].nominal)} de {serie[0].anio}.
      </p>
    </Figure>
  );
}

/* ── FIG. 12 · el atlas ─────────────────────────────────────────────────────────────── */
function Atlas({ anio, bruto2026, elegirAnio }) {
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
  const X0 = 62;
  const X1 = W - 92;
  const Y0 = 20;
  const Y1 = H - 46;

  const xs = datos.map(d => d.bruto);
  const zoom = useDomainZoom([xs[0], xs[xs.length - 1]], { pxRange: [X0, X1], vbWidth: W, maxZoom: 16 });
  const x = linear(zoom.domain, [X0, X1]);
  const clip = useId().replace(/:/g, '');

  // el eje de valores arranca siempre en cero: recortarlo exagera las
  // diferencias entre años. Y se le deja aire arriba, para que la marca
  // superior no quede pegada al borde ni encima de las curvas.
  const todos = ANIOS.flatMap(a => datos.map(d => d[`${key}_${a}`]));
  const hi = Math.max(...todos) * 1.16;
  const y = linear([0, hi], [Y1, Y0]);

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

  /* Los años visibles terminan casi a la misma altura, así que sus rótulos se
     pisaban. Se ordenan por valor y se separan un mínimo de píxeles, con un
     hilo que devuelve cada rótulo a su curva. */
  const etiquetas = ANIOS.filter(a => activos.has(a) || a === anio)
    .map(a => ({ a, v: ultimo(a), y: y(ultimo(a)) + 3.5 }))
    .sort((p, q) => p.y - q.y)
    .reduce((acc, e) => {
      const prev = acc[acc.length - 1];
      const min = prev ? prev.y + 13 : Y0 + 4;
      acc.push({ ...e, y: Math.max(e.y, min) });
      return acc;
    }, []);

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
      id="12"
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
        {ticks(0, hi, 5).map(v => (
          <g key={v}>
            <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
            <Label x={X0 - 8} y={round(y(v)) + 3} size={9} color="var(--ink-5)" anchor="end" mono>
              {medida === 'neto' ? eur(v) : pct(v, 0)}
            </Label>
          </g>
        ))}

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

        {/* etiquetas directas al margen, separadas para que no se pisen */}
        {etiquetas.map(e => (
          <g key={e.a}>
            {Math.abs(e.y - 3.5 - y(e.v)) > 2 && (
              <line
                x1={X1 + 1}
                y1={round(y(e.v))}
                x2={X1 + 6}
                y2={round(e.y - 3.5)}
                stroke="var(--ink-6)"
                strokeWidth={0.6}
                strokeDasharray="1.5 2"
              />
            )}
            <Label x={X1 + 9} y={round(e.y)} size={10} weight={e.a === anio ? 800 : 700} color={e.a === anio ? 'var(--signal)' : 'var(--ink-4)'} mono>
              {e.a}
            </Label>
          </g>
        ))}

        <Label x={round(x(marcado))} y={Y0 - 8} size={9} color="var(--counter)" anchor="middle" mono>
          TU SALARIO
        </Label>

        {ticks(zoom.domain[0], zoom.domain[1], 6).map(v => (
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
            onDoubleClick={() => elegirAnio(a)}
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
