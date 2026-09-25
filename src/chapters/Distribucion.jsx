import { useId, useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import {
  ANIOS,
  DISTRIBUCION_SALARIAL,
  INFLACION_A_2026,
  ULTIMO_ANIO_SALARIAL_OFICIAL,
  densidadLogNormal,
  percentilDe,
} from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { useDomainZoom } from '../figures/useDomainZoom';
import { Label, TickStrip, YouMark } from '../figures/marks';
import { linear, polyline, round, ticks } from '../figures/scale';
import { eur, sign } from '../utils/format';
import { ANCHO_MOVIL, useNarrow } from '../hooks/useNarrow';

const MAX_S = 90000;

/* ═══════════════════════════════════════════════════════════════════════════
   FIG. 17 — LA CURVA DE LA DISTRIBUCIÓN
   Where everyone is, and where you are inside that. Two years can be laid on
   top of each other so the whole shape can be compared, not just the median.
   ═══════════════════════════════════════════════════════════════════════════ */
export function CurvaDistribucion() {
  const { bruto, anio, percentil } = useFiscal();
  const [comparar, setComparar] = useState(2012);
  const [hoverS, setHoverS] = useState(null);
  const [tip, setTip] = useState(null);

  const narrow = useNarrow();
  const W = narrow ? ANCHO_MOVIL : 880;
  const H = 410;
  const X0 = narrow ? 6 : 26;
  const X1 = W - (narrow ? 40 : 120);
  const Y1 = H - 66;
  // en móvil los hitos van en dos alturas: la marca «TÚ» baja para no pisarlos
  const Y0 = narrow ? 76 : 54;

  const curva = useMemo(() => {
    const pts = [];
    for (let s = 600; s <= MAX_S; s += 300) {
      pts.push({ s, a: densidadLogNormal(s, anio), b: densidadLogNormal(s, comparar) });
    }
    return pts;
  }, [anio, comparar]);

  const maxD = Math.max(...curva.flatMap(p => [p.a, p.b]));
  const zoom = useDomainZoom([0, MAX_S], { pxRange: [X0, X1], vbWidth: W, maxZoom: 18 });
  const x = linear(zoom.domain, [X0, X1]);
  const y = linear([0, maxD], [Y1, Y0]);
  const clip = useId().replace(/:/g, '');

  const dist = DISTRIBUCION_SALARIAL[anio];
  const distB = DISTRIBUCION_SALARIAL[comparar];

  const hitos = [
    ['P10', dist.p10],
    ['P25', dist.p25],
    ['MEDIANA', dist.p50],
    ['P75', dist.p75],
    ['P90', dist.p90],
  ];

  const activo = hoverS !== null
    ? curva.reduce((best, p) => (Math.abs(p.s - hoverS) < Math.abs(best.s - hoverS) ? p : best), curva[0])
    : null;

  const onMove = e => {
    const svg = e.currentTarget.ownerSVGElement;
    const r = svg.getBoundingClientRect();
    const v = x.invert(((e.clientX - r.left) / r.width) * W);
    setHoverS(v);
    const p = curva.reduce((best, c) => (Math.abs(c.s - v) < Math.abs(best.s - v) ? c : best), curva[0]);
    setTip({
      vx: x(p.s),
      vy: y(p.a),
      title: eur(p.s),
      sub: 'Salario bruto anual',
      rows: [
        [`Percentil en ${anio}`, String(Math.round(percentilDe(p.s, anio))), 'var(--ink)'],
        [`Percentil en ${comparar}`, String(Math.round(percentilDe(p.s, comparar))), 'var(--counter)'],
      ],
    });
  };

  return (
    <Figure
      id="21"
      title={`La mitad de los asalariados cobra menos de ${eur(dist.p50)}`}
      sub={`${anio} frente a ${comparar} · distribución estimada de la ganancia bruta anual · euros corrientes de cada año`}
      legend="El área es la densidad de trabajadores en cada nivel de salario · la marca verde eres tú"
      source="Fuente · INE · EAES tabla 28191 · ajuste log-normal propio"
      note="La curva es un ajuste log-normal calibrado con los percentiles publicados: reproduce la forma del reparto, no el censo exacto de cada tramo."
      summary={`Mediana ${eur(dist.p50)}, media ${eur(dist.media)}, P10 ${eur(dist.p10)}, P90 ${eur(dist.p90)} en ${anio}.`}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Tu salario</span>
          <span className="fs-readout-v fs-signal">{eur(bruto)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Tu percentil en {anio}</span>
          <span className="fs-readout-v">{Math.round(percentil)}</span>
        </span>
        <span>
          <span className="fs-readout-k">{activo ? 'Salario señalado' : 'Mediana'}</span>
          <span className="fs-readout-v">{eur(activo ? activo.s : dist.p50)}</span>
        </span>
        <span>
          <span className="fs-readout-k">{activo ? `Percentil en ${anio}` : `Media ${anio}`}</span>
          <span className="fs-readout-v">{activo ? Math.round(percentilDe(activo.s, anio)) : eur(dist.media)}</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <label className="fs-label" htmlFor="cd-cmp">Comparar con</label>
        <select id="cd-cmp" className="fs-select" value={comparar} onChange={e => setComparar(+e.target.value)}>
          {ANIOS.filter(a => a !== anio).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <span className="fs-note">
          Mediana {comparar}: {eur(distB.p50)} · {sign(dist.p50 - distB.p50)} en euros corrientes
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} zoom={zoom} tip={tip} label="Curva de distribución salarial">
        <defs>
          <clipPath id={clip}>
            <rect x={X0} y={Y0 - 5} width={X1 - X0} height={Y1 - Y0 + 10} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
        <path
          d={polyline([[X0, Y1], ...curva.map(p => [x(p.s), y(p.a)]), [x(MAX_S), Y1]]) + ' Z'}
          fill="var(--ink)"
          opacity={0.1}
        />
        <path d={polyline(curva.map(p => [x(p.s), y(p.a)]))} fill="none" stroke="var(--ink)" strokeWidth={1.6} />
        <path
          d={polyline(curva.map(p => [x(p.s), y(p.b)]))}
          fill="none"
          stroke="var(--counter)"
          strokeWidth={1.2}
          strokeDasharray="4 3"
        />

        {hitos.filter(([, v]) => v >= zoom.domain[0] && v <= zoom.domain[1]).map(([k, v]) => (
          <g key={k}>
            <line x1={round(x(v))} y1={Y0 - 4} x2={round(x(v))} y2={Y1} stroke="var(--ink-6)" strokeWidth={0.7} strokeDasharray="2 4" />
          </g>
        ))}

        {activo && (
          <g>
            <line className="fs-crosshair" x1={round(x(activo.s))} y1={Y0 - 4} x2={round(x(activo.s))} y2={Y1} />
            <circle cx={round(x(activo.s))} cy={round(y(activo.a))} r={3.4} fill="var(--ink)" />
            <circle cx={round(x(activo.s))} cy={round(y(activo.b))} r={3} fill="var(--counter)" />
          </g>
        )}

        </g>

        {/* Labels live outside the clipping window: the former implementation
            cut their ascenders at the top and their values at the baseline. */}
        {/* En móvil los cinco hitos caen muy juntos: se escalonan en dos alturas. */}
        {hitos.filter(([, v]) => v >= zoom.domain[0] && v <= zoom.domain[1]).map(([k, v], i) => (
          <g key={`label-${k}`}>
            <Label x={round(x(v))} y={narrow ? 24 + (i % 2) * 14 : 28} size={narrow ? 8.5 : 9.5} weight={700} color="var(--ink-3)" anchor="middle" mono>
              {k}
            </Label>
            <Label x={round(x(v))} y={narrow ? Y1 + 15 + (i % 2) * 12 : Y1 + 19} size={narrow ? 8.5 : 9} color="var(--ink-4)" anchor="middle">
              {eur(v)}
            </Label>
          </g>
        ))}

        {bruto > 0 && bruto <= MAX_S && (
          <YouMark x={x(bruto)} y={Y1} height={Y1 - Y0 + 8} label={`TÚ · PERCENTIL ${Math.round(percentil)}`} />
        )}
        <Label x={X1 + 8} y={round(y(curva[Math.round(curva.length * 0.28)].a))} size={9.5} weight={700} color="var(--ink)" mono>
          {anio}
        </Label>
        <Label x={X1 + 8} y={round(y(curva[Math.round(curva.length * 0.28)].b)) + 14} size={9.5} weight={700} color="var(--counter)" mono>
          {comparar}
        </Label>

        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />
        {ticks(zoom.domain[0], zoom.domain[1], narrow ? 4 : 5).map(v => (
          <g key={v}>
            <line x1={round(x(v))} y1={Y1} x2={round(x(v))} y2={Y1 + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label
              x={round(x(v))}
              y={Y1 + (narrow ? 44 : 34)}
              size={narrow ? 8.5 : 9}
              color="var(--ink-5)"
              anchor={narrow && x(v) < X0 + 20 ? 'start' : narrow && x(v) > X1 - 24 ? 'end' : 'middle'}
              mono
            >
              {v === 0 ? '0 €' : eur(v)}
            </Label>
          </g>
        ))}
        <Label x={X1} y={Y1 + (narrow ? 58 : 50)} size={narrow ? 8.5 : 9} color="var(--ink-5)" anchor="end" mono>
          SALARIO BRUTO ANUAL
        </Label>

        <rect className="fs-hit" x={X0} y={Y0 - 6} width={X1 - X0} height={Y1 - Y0 + 8} onMouseMove={onMove} onMouseLeave={() => { setHoverS(null); setTip(null); }} />
      </ChartFrame>
    </Figure>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FIG. 18 — LOS PERCENTILES
   The published numbers themselves, countable, with your salary cutting across.
   ═══════════════════════════════════════════════════════════════════════════ */
export function Percentiles() {
  const { bruto, anio, percentil } = useFiscal();
  const dist = DISTRIBUCION_SALARIAL[anio];

  const filas = [
    ['P10', dist.p10, 'el 10 % gana menos'],
    ['P25', dist.p25, 'un cuarto gana menos'],
    ['Mediana', dist.p50, 'la mitad gana menos'],
    ['Media', dist.media, 'el promedio, tirado por los salarios altos'],
    ['P75', dist.p75, 'tres cuartos ganan menos'],
    ['P90', dist.p90, 'el 90 % gana menos'],
  ];

  const narrow = useNarrow();
  const W = narrow ? ANCHO_MOVIL : 880;
  const rowH = 44;
  const H = filas.length * rowH + 60;
  const X0 = narrow ? 66 : 128;
  const X1 = W - (narrow ? 64 : 150);
  const hi = Math.max(dist.p90, bruto) * 1.06;
  const x = linear([0, hi], [X0, X1]);
  const UNIT = narrow ? 1000 : 500;

  return (
    <Figure
      id="22"
      title={`Tu salario supera al ${Math.round(percentil)} % de los asalariados`}
      sub={`${anio} · percentiles publicados de la ganancia bruta anual · una marca = ${eur(UNIT)}`}
      legend={`Una marca = ${eur(UNIT)} · la línea vertical verde es tu salario`}
      source="Fuente · INE · EAES tabla 28191"
      note={
        anio > ULTIMO_ANIO_SALARIAL_OFICIAL
          ? `Los valores de ${anio} son proyección propia sobre el último dato publicado (${ULTIMO_ANIO_SALARIAL_OFICIAL}).`
          : undefined
      }
      summary={filas.map(([k, v]) => `${k}: ${eur(v)}`).join('; ')}
    >
      <ChartFrame viewBox={`0 0 ${W} ${H}`} label="Percentiles salariales">
        {filas.map(([k, v, nota], i) => {
          const y = 26 + i * rowH;
          const encima = bruto >= v;
          return (
            <g key={k}>
              <Label x={X0 - (narrow ? 8 : 14)} y={y + 4} size={narrow ? 10 : 11} weight={700} color="var(--ink-2)" anchor="end" mono>
                {k.toUpperCase()}
              </Label>
              <TickStrip
                x={X0}
                y={y}
                width={Math.max(0, x(v) - X0)}
                count={Math.round(v / UNIT)}
                height={17}
                seed={i + 6}
                color={encima ? 'var(--ink-4)' : 'var(--ink)'}
                dot={false}
              />
              <Label x={x(v) + (narrow ? 6 : 10)} y={y + 4} size={narrow ? 11 : 12} weight={700} color="var(--ink)">
                {eur(v)}
              </Label>
              <Label x={X0} y={y + 22} size={9.5} color="var(--ink-5)">
                {nota}
              </Label>
              <title>{`${k} — ${eur(v)}`}</title>
            </g>
          );
        })}

        {bruto > 0 && (
          <g>
            <line x1={round(x(bruto))} y1={8} x2={round(x(bruto))} y2={H - 40} stroke="var(--signal)" strokeWidth={1.5} />
            <Label
              x={round(x(bruto))}
              y={H - 26}
              size={narrow ? 9 : 10}
              weight={700}
              color="var(--signal)"
              anchor={x(bruto) > W - 70 ? 'end' : x(bruto) < 70 ? 'start' : 'middle'}
              mono
            >
              TU SALARIO · {eur(bruto)}
            </Label>
          </g>
        )}
      </ChartFrame>
    </Figure>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FIG. 20 — LA DISTRIBUCIÓN A LO LARGO DEL TIEMPO
   The whole spread moving year by year, not just the median: the band between
   P10 and P90, the quartiles inside it, and where you sit in each year.
   ═══════════════════════════════════════════════════════════════════════════ */
export function EvolucionDistribucion() {
  const { bruto, anio, setAnio } = useFiscal();
  const [real, setReal] = useState(true);
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  // tu salario, llevado a cada año con el IPC: en euros corrientes sube como
  // todo lo demás; en euros constantes es plano, porque tu poder adquisitivo
  // es el que se mantiene fijo por construcción.
  const bruto2026 = bruto * (INFLACION_A_2026[anio] || 1);

  const datos = useMemo(
    () =>
      ANIOS.map(a => {
        const f = real ? INFLACION_A_2026[a] : 1;
        const d = DISTRIBUCION_SALARIAL[a];
        const tuNominal = bruto2026 / INFLACION_A_2026[a];
        return {
          anio: a,
          p10: d.p10 * f,
          p25: d.p25 * f,
          p50: d.p50 * f,
          p75: d.p75 * f,
          p90: d.p90 * f,
          media: d.media * f,
          tuyo: tuNominal * f,
          tuPercentil: percentilDe(tuNominal, a),
        };
      }),
    [real, bruto2026]
  );

  const narrow = useNarrow();
  const W = narrow ? ANCHO_MOVIL : 880;
  const H = 400;
  const X0 = narrow ? 8 : 30;
  const X1 = W - (narrow ? 62 : 130);
  const Y0 = 28;
  const Y1 = H - 52;
  const hitW = narrow ? 20 : 26;

  const hi = Math.max(...datos.flatMap(d => [d.p90, d.tuyo])) * 1.04;
  const x = linear([2012, 2026], [X0, X1]);
  const y = linear([0, hi], [Y1, Y0]);

  const banda = (lo, up) =>
    polyline([...datos.map(d => [x(d.anio), y(d[up])]), ...[...datos].reverse().map(d => [x(d.anio), y(d[lo])])]) + ' Z';

  const act = datos.find(d => d.anio === (hover ?? anio)) || datos[datos.length - 1];
  const primero = datos[0];
  const ultimo = datos[datos.length - 1];

  return (
    <Figure
      id="24"
      title={
        real
          ? `En euros de hoy, la mediana salarial ha pasado de ${eur(primero.p50)} a ${eur(ultimo.p50)}`
          : `En euros corrientes, la mediana salarial ha pasado de ${eur(primero.p50)} a ${eur(ultimo.p50)}`
      }
      sub={`${real ? 'Euros constantes de 2026' : 'Euros nominales de cada año'} · banda P10–P90, cuartiles y mediana · pulsa un año para llevar la publicación a él`}
      legend="Banda clara = del percentil 10 al 90 · banda oscura = del 25 al 75 · línea continua = mediana · línea de puntos azul = media · puntos verdes = tu salario llevado a cada año con el IPC"
      source="Fuente · INE · EAES tabla 28191"
      note={`Los años posteriores a ${ULTIMO_ANIO_SALARIAL_OFICIAL} son proyección propia, no dato publicado.`}
      summary={datos.map(d => `${d.anio}: mediana ${eur(d.p50)}`).join('; ')}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Año {act.anio}</span>
          <span className="fs-readout-v">Mediana {eur(act.p50)}</span>
        </span>
        <span>
          <span className="fs-readout-k">P10 — P90</span>
          <span className="fs-readout-v">{eur(act.p10)} — {eur(act.p90)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Media</span>
          <span className="fs-readout-v">{eur(act.media)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Tu salario en {act.anio}</span>
          <span className="fs-readout-v fs-signal">{eur(act.tuyo)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Tu percentil ese año</span>
          <span className="fs-readout-v fs-signal">{Math.round(act.tuPercentil)}</span>
        </span>
      </div>

      <span className="fs-seg" style={{ marginBottom: 14 }}>
        <button type="button" aria-pressed={!real} onClick={() => setReal(false)}>Nominal</button>
        <button type="button" aria-pressed={real} onClick={() => setReal(true)}>Real (€2026)</button>
      </span>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} label="Evolución de la distribución salarial">
        <path d={banda('p10', 'p90')} fill="var(--ink)" opacity={0.08} />
        <path d={banda('p25', 'p75')} fill="var(--ink)" opacity={0.14} />

        <path d={polyline(datos.map(d => [x(d.anio), y(d.p50)]))} fill="none" stroke="var(--ink)" strokeWidth={1.8} />
        <path
          d={polyline(datos.map(d => [x(d.anio), y(d.media)]))}
          fill="none"
          stroke="var(--counter)"
          strokeWidth={1.1}
          strokeDasharray="4 3"
        />
        <path
          d={polyline(datos.map(d => [x(d.anio), y(d.tuyo)]))}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={1.3}
        />
        {datos.map(d => (
          <g key={d.anio}>
            <circle cx={round(x(d.anio))} cy={round(y(d.media))} r={2.4} fill="var(--counter)" />
            <circle cx={round(x(d.anio))} cy={round(y(d.p50))} r={d.anio === act.anio ? 4.2 : 2.4} fill="var(--ink)" />
            {bruto > 0 && (
              <circle
                cx={round(x(d.anio))}
                cy={round(y(d.tuyo))}
                r={d.anio === act.anio ? 5 : 3.2}
                fill="var(--signal)"
                stroke={d.anio === act.anio ? 'var(--bone)' : 'none'}
                strokeWidth={1.2}
              />
            )}
            <rect
              className="fs-hit"
              x={round(x(d.anio)) - hitW / 2}
              y={Y0 - 10}
              width={hitW}
              height={Y1 - Y0 + 16}
              onMouseEnter={() => {
                setHover(d.anio);
                setTip({
                  vx: x(d.anio),
                  vy: y(d.p50),
                  title: String(d.anio),
                  sub: real ? 'Euros constantes de 2026' : 'Euros corrientes',
                  rows: [
                    ['P90', eur(d.p90), 'var(--ink-4)'],
                    ['Media', eur(d.media), 'var(--counter)'],
                    ['Mediana', eur(d.p50), 'var(--ink)'],
                    ['P10', eur(d.p10), 'var(--ink-4)'],
                    ...(bruto > 0
                      ? [['Tu salario', eur(d.tuyo) + ' - p' + Math.round(d.tuPercentil), 'var(--signal)']]
                      : []),
                  ],
                });
              }}
              onMouseLeave={() => { setHover(null); setTip(null); }}
              onClick={() => setAnio(d.anio)}
            >
              <title>{`${d.anio} — mediana ${eur(d.p50)}, media ${eur(d.media)}, tu salario ${eur(d.tuyo)} (percentil ${Math.round(d.tuPercentil)})`}</title>
            </rect>
          </g>
        ))}

        {[['p90', 'P90', 'var(--ink-4)'], ['p75', 'P75', 'var(--ink-4)'], ['p50', 'MEDIANA', 'var(--ink)'],
          ['media', 'MEDIA', 'var(--counter)'], ['p25', 'P25', 'var(--ink-4)'], ['p10', 'P10', 'var(--ink-4)']].map(([k, l, c]) => (
          <Label key={k} x={X1 + (narrow ? 6 : 8)} y={round(y(ultimo[k])) + 3} size={narrow ? 8.5 : 9} weight={k === 'p50' || k === 'media' ? 700 : 500} color={c} mono>
            {l}
          </Label>
        ))}

        {bruto > 0 && (
          <Label x={X1 + (narrow ? 6 : 8)} y={round(y(ultimo.tuyo)) + 3} size={narrow ? 9 : 9.5} weight={800} color="var(--signal)" mono>
            {narrow ? 'TÚ' : 'TU SALARIO'}
          </Label>
        )}

        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />
        {(narrow ? [2012, 2016, 2020, 2024] : [2012, 2016, 2020, 2024, 2026]).map(a => (
          <Label key={a} x={round(x(a))} y={Y1 + 22} size={narrow ? 8.5 : 9.5} color="var(--ink-4)" anchor={narrow && a === 2012 ? 'start' : 'middle'} mono>
            {a}
          </Label>
        ))}
        {[0, 0.25, 0.5, 0.75].map(t => (
          <Label key={t} x={X0 - 4} y={round(y(hi * t)) - 4} size={9} color="var(--ink-5)" anchor="start" mono>
            {eur(hi * t)}
          </Label>
        ))}
      </ChartFrame>

      <p className="fs-note" style={{ marginTop: 12, maxWidth: '72ch' }}>
        La <strong style={{ color: 'var(--counter)' }}>media</strong> —los puntos azules— va
        siempre por encima de la mediana porque los salarios más altos tiran de ella hacia
        arriba; la mediana, en cambio, parte la población exactamente por la mitad. Los puntos
        verdes son <strong style={{ color: 'var(--signal)' }}>tu salario llevado a cada
        año con el IPC</strong>: el mismo poder adquisitivo que tienes hoy, expresado en los
        euros de aquel año. Sirve para situar un mismo poder adquisitivo dentro de la distribución
        observada en cada ejercicio.
      </p>
      <p className="fs-note" style={{ marginTop: 10, maxWidth: '72ch' }}>
        {real
          ? 'En euros constantes tu línea es plana por construcción: mantiene el mismo poder adquisitivo. Los cambios de las bandas describen la evolución de la distribución. El desplazamiento de su parte baja coincide con las revisiones del SMI, aunque esta figura por sí sola no identifica causalidad.'
          : 'En euros corrientes aumentan tanto los salarios observados como tu salario equivalente. Cambia a euros constantes para separar la variación de precios del cambio en poder adquisitivo.'}
      </p>
    </Figure>
  );
}
