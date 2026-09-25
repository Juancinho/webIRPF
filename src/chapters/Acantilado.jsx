import { useId, useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { calcularNomina, calcularTipoMarginal } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { useDomainZoom } from '../figures/useDomainZoom';
import { Label, HundredField, YouMark } from '../figures/marks';
import { clamp, linear, polyline, round, ticks } from '../figures/scale';
import Puente from '../figures/Puente';
import { eur, pct } from '../utils/format';
import { ANCHO_MOVIL, useNarrow } from '../hooks/useNarrow';

/* En móvil desaparece la columna de rótulos de la derecha: la reducción
   máxima ya la dice la zona «plana», y el nombre del eje inferior baja al pie. */
const GEO = {
  ancho: { W: 880, X0: 20, X1: 880 - 130, marcas: 6 },
  movil: { W: ANCHO_MOVIL, X0: 4, X1: ANCHO_MOVIL - 8, marcas: 4 },
};
const H = 400;
const CURVA_Y0 = 30;
const CURVA_Y1 = 210;
const BAR_Y = 340;
const BAR_H = 96;
const MAXB = 30000;
const STEP = 200;

/**
 * FIG. 08 — EL ACANTILADO.
 * The Art. 20 reduction and the total marginal rate share one axis (gross
 * salary), so the cliff and the rate spike line up vertically and the reader
 * can see the cause above the effect. L3 Barcode Lollipop grammar below,
 * bespoke threshold diagram above.
 */
export default function Acantilado() {
  const { bruto, anio, opts, marginal, nomina } = useFiscal();
  const [tip, setTip] = useState(null);
  const narrow = useNarrow();
  const { W, X0, X1, marcas } = narrow ? GEO.movil : GEO.ancho;

  const serie = useMemo(() => {
    const out = [];
    for (let b = 0; b <= MAXB; b += STEP) {
      const n = calcularNomina(b, anio, opts);
      const m = calcularTipoMarginal(b, anio, opts);
      out.push({ b, red: n.redTrabajo, marg: m.tipoMarginalTotal * 100 });
    }
    return out;
  }, [anio, opts]);

  const redMax = Math.max(...serie.map(p => p.red), 1);
  const margMax = Math.max(...serie.map(p => p.marg), 1);

  const zoom = useDomainZoom([0, MAXB], { pxRange: [X0, X1], vbWidth: W, maxZoom: 24 });
  const x = linear(zoom.domain, [X0, X1]);
  const yRed = linear([0, redMax], [CURVA_Y1, CURVA_Y0]);
  const clip = useId().replace(/:/g, '');

  // thresholds read off the series, so they always match what is drawn
  const iPlana = serie.findIndex(p => p.red < redMax - 0.5);
  const iCero = serie.findIndex(p => p.red <= 0.5 && p.b > 0);
  const bPlana = iPlana > 0 ? serie[iPlana - 1].b : null;
  const bCero = iCero > 0 ? serie[iCero].b : null;
  const pico = serie.reduce((a, c) => (c.marg > a.marg ? c : a), serie[0]);

  const dentro = bruto >= zoom.domain[0] && bruto <= zoom.domain[1];
  const cx = v => clamp(x(v), X0, X1);

  const onMove = e => {
    const svg = e.currentTarget.ownerSVGElement;
    const r = svg.getBoundingClientRect();
    const b = x.invert(((e.clientX - r.left) / r.width) * W);
    const p = serie.reduce((best, c) => (Math.abs(c.b - b) < Math.abs(best.b - b) ? c : best), serie[0]);
    setTip({
      vx: x(p.b),
      vy: BAR_Y - (p.marg / margMax) * BAR_H,
      title: eur(p.b),
      sub: `Bruto anual · ${anio}`,
      rows: [
        ['Reducción art. 20', eur(p.red), 'var(--ink)'],
        ['Marginal total', pct(p.marg), 'var(--counter)'],
      ],
    });
  };

  return (
    <>
      <Figure
        id="08"
        title={
          redMax > 0
            ? `Al retirarse la reducción del art. 20, el tipo marginal combinado alcanza el ${pct(pico.marg, 0)}`
            : 'En este año la reducción del art. 20 no llega a tu nivel de renta'
        }
        sub={`${anio} · eje común: salario bruto anual de 0 a ${eur(MAXB)} · arriba la reducción en euros, abajo el tipo marginal total (IRPF + SS)`}
        legend={`Una marca = ${eur(STEP)} de bruto · la altura de cada marca es el tipo marginal total en ese punto`}
        source="Fuente · BOE — LIRPF art. 20 · cálculo propio"
        note={
          redMax > 0
            ? `La reducción se mantiene hasta ${eur(bPlana ?? 0)} de bruto y se agota a partir de ${eur(bCero ?? 0)}. Entre ambos puntos, cada euro adicional aumenta el rendimiento y reduce simultáneamente el beneficio fiscal, por lo que la base imponible crece más de un euro.`
            : undefined
        }
        summary={`Tipo marginal máximo ${pct(pico.marg)} en ${eur(pico.b)} de bruto. Reducción máxima ${eur(redMax)}.`}
      >
        <ChartFrame viewBox={`0 0 ${W} ${H}`} zoom={zoom} tip={tip} label="El acantilado del artículo 20">
          <defs>
            <clipPath id={clip}>
              <rect x={X0} y={CURVA_Y0 - 30} width={X1 - X0} height={BAR_Y - CURVA_Y0 + 44} />
            </clipPath>
          </defs>
          {/* ── zones ─────────────────────────────────────────────────── */}
          {bPlana !== null && bCero !== null && redMax > 0 && (
            <g>
              {[
                { x0: X0, x1: cx(bPlana), t: 'PLANA', d: `reducción máxima ${eur(redMax)}` },
                { x0: cx(bPlana), x1: cx(bCero), t: 'CAÍDA', d: 'la reducción se retira' },
                { x0: cx(bCero), x1: X1, t: 'CERO', d: 'sin reducción' },
              ].map(z => (
                <g key={z.t}>
                  <line x1={z.x0} y1={CURVA_Y0 - 16} x2={z.x1} y2={CURVA_Y0 - 16} stroke="var(--rule)" strokeWidth={0.8} />
                  {z.x1 - z.x0 > 46 && (
                    <>
                      <Label x={z.x0 + 4} y={CURVA_Y0 - 22} size={9.5} color="var(--ink-3)" mono>
                        {z.t}
                      </Label>
                      {(!narrow || z.x1 - z.x0 > z.d.length * 5.2) && (
                        <Label x={z.x0 + 4} y={CURVA_Y0 - 6} size={9.5} color="var(--ink-5)">
                          {z.d}
                        </Label>
                      )}
                    </>
                  )}
                </g>
              ))}
              {[bPlana, bCero].filter(b => b >= zoom.domain[0] && b <= zoom.domain[1]).map(b => (
                <line
                  key={b}
                  x1={round(x(b))}
                  y1={CURVA_Y0 - 16}
                  x2={round(x(b))}
                  y2={BAR_Y + 6}
                  stroke="var(--ink-6)"
                  strokeWidth={0.7}
                  strokeDasharray="2 4"
                />
              ))}
            </g>
          )}

          {/* ── art. 20 curve ─────────────────────────────────────────── */}
          <line x1={X0} y1={CURVA_Y1} x2={X1} y2={CURVA_Y1} stroke="var(--rule)" strokeWidth={0.8} />
          <g clipPath={`url(#${clip})`}>
          <path
            d={polyline(serie.map(p => [x(p.b), yRed(p.red)]))}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
          {!narrow && (
            <>
              <Label x={X1 + 8} y={yRed(redMax) + 4} size={10} weight={700} color="var(--ink)">
                {eur(redMax)}
              </Label>
              <Label x={X1 + 8} y={yRed(redMax) + 18} size={9} color="var(--ink-4)" mono>
                REDUCCIÓN MÁX.
              </Label>
              <Label x={X1 + 8} y={CURVA_Y1 + 4} size={9} color="var(--ink-4)" mono>
                0 €
              </Label>
            </>
          )}

          {/* ── marginal barcode ──────────────────────────────────────── */}
          {serie.map(p => {
            const h = (p.marg / margMax) * BAR_H;
            const esPico = p.b === pico.b;
            return (
              <line
                key={p.b}
                x1={round(x(p.b))}
                y1={BAR_Y}
                x2={round(x(p.b))}
                y2={round(BAR_Y - h)}
                stroke={esPico ? 'var(--counter)' : 'var(--ink-3)'}
                strokeWidth={esPico ? 1.6 : 1}
                opacity={esPico ? 1 : 0.75}
              >
                <title>{`${eur(p.b)} de bruto — tipo marginal total ${pct(p.marg)}`}</title>
              </line>
            );
          })}

          {/* ── el punto que estás leyendo ─────────────────────────────
              El recuadro decía la cifra pero no señalaba de dónde salía:
              sin marca sobre la curva y sobre la barra, el lector tiene que
              adivinar qué punto está mirando. */}
          {tip && (() => {
            const p = serie.reduce(
              (best, c) => (Math.abs(x(c.b) - tip.vx) < Math.abs(x(best.b) - tip.vx) ? c : best),
              serie[0]
            );
            const h = (p.marg / margMax) * BAR_H;
            return (
              <g pointerEvents="none">
                <line className="fs-crosshair" x1={round(x(p.b))} y1={CURVA_Y0 - 16} x2={round(x(p.b))} y2={BAR_Y} />
                <circle cx={round(x(p.b))} cy={round(yRed(p.red))} r={3.8} fill="var(--ink)" stroke="var(--bone)" strokeWidth={1.2} />
                <line
                  x1={round(x(p.b))}
                  y1={BAR_Y}
                  x2={round(x(p.b))}
                  y2={round(BAR_Y - h)}
                  stroke="var(--counter)"
                  strokeWidth={2.2}
                />
                <circle cx={round(x(p.b))} cy={round(BAR_Y - h)} r={3.8} fill="var(--counter)" stroke="var(--bone)" strokeWidth={1.2} />
              </g>
            );
          })()}
          </g>
          <line x1={X0} y1={BAR_Y} x2={X1} y2={BAR_Y} stroke="var(--ink)" strokeWidth={0.9} />

          <Label x={round(x(pico.b))} y={round(BAR_Y - BAR_H - 10)} size={12} weight={800} color="var(--counter)" anchor="middle">
            {pct(pico.marg, 0)}
          </Label>
          <Label x={round(x(pico.b))} y={round(BAR_Y - BAR_H - 24)} size={9} color="var(--counter)" anchor="middle" mono>
            MARGINAL MÁXIMO
          </Label>
          {narrow ? (
            <>
              <Label x={X0} y={CURVA_Y1 + 14} size={8.5} color="var(--ink-4)" mono>
                ↑ REDUCCIÓN ART. 20 · €
              </Label>
              <Label x={X0} y={BAR_Y + 44} size={8.5} color="var(--ink-4)" mono>
                ↑ MARGINAL TOTAL · → BRUTO ANUAL
              </Label>
            </>
          ) : (
            <>
              <Label x={X1 + 8} y={BAR_Y - 2} size={9} color="var(--ink-4)" mono>
                MARGINAL
              </Label>
              <Label x={X1 + 8} y={BAR_Y + 12} size={9} color="var(--ink-4)" mono>
                TOTAL
              </Label>
            </>
          )}

          {/* ── axis ─────────────────────────────────────────────────── */}
          {ticks(zoom.domain[0], zoom.domain[1], marcas).map(v => (
            <g key={v}>
              <line x1={round(x(v))} y1={BAR_Y} x2={round(x(v))} y2={BAR_Y + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
              <Label
                x={round(x(v))}
                y={BAR_Y + 22}
                size={narrow ? 8.5 : 9.5}
                color="var(--ink-4)"
                anchor={narrow && x(v) > X1 - 26 ? 'end' : narrow && x(v) < X0 + 20 ? 'start' : 'middle'}
                mono
              >
                {v === 0 ? '0 €' : eur(v)}
              </Label>
            </g>
          ))}

          <rect
            className="fs-hit"
            x={X0}
            y={CURVA_Y0 - 30}
            width={X1 - X0}
            height={BAR_Y - CURVA_Y0 + 40}
            onMouseMove={onMove}
            onMouseLeave={() => setTip(null)}
          />

          {/* ── the reader ───────────────────────────────────────────── */}
          {dentro && (
            <YouMark x={x(bruto)} y={BAR_Y} height={BAR_H + 34} label={`TÚ · ${pct(marginal.tipoMarginalTotal * 100, 0)}`} />
          )}
        </ChartFrame>

        {!dentro && (
          <p className="fs-note" style={{ marginTop: 12 }}>
            Tu salario ({eur(bruto)}) queda por encima de este tramo de la escala: la reducción del
            art. 20 ya no te afecta y tu tipo marginal total es {pct(marginal.tipoMarginalTotal * 100)}.
          </p>
        )}
      </Figure>

      <ComoFunciona />

      <Puente rotulo="La pregunta práctica">
        Hasta aquí, la mecánica: de dónde sale la cuota, qué tipo se aplica a cada parte de la base
        y cómo la retirada de una reducción eleva temporalmente el marginal efectivo. Ahora podemos
        medir una cuestión práctica: <strong>qué parte de una subida bruta se convierte en renta neta.</strong>
      </Puente>

      <CienEuros />
      <p className="fs-body" style={{ marginTop: 8 }}>
        Este efecto no es un error del cálculo ni una opinión: es la consecuencia aritmética de
        retirar una reducción al mismo tiempo que sube la renta. Afecta sólo a los euros que caen
        dentro de la zona de caída, no a todo el salario. Tu tipo efectivo sigue siendo{' '}
        <strong>{pct(nomina.tipoEfectivoIRPF * 100)}</strong>.
      </p>
    </>
  );
}

/**
 * FIG. 09 — EL SIMULADOR DE SUBIDA.
 * La pregunta práctica que cierra el capítulo: si te suben el sueldo, ¿cuánto
 * llega? El tipo marginal deja de ser un concepto y pasa a ser el resultado de
 * una resta que se puede seguir línea a línea.
 */
function CienEuros() {
  const { bruto, anio, opts } = useFiscal();
  const [incremento, setIncremento] = useState(3000);
  const [focus, setFocus] = useState(null);

  const d = useMemo(() => {
    const a = calcularNomina(bruto, anio, opts);
    const b = calcularNomina(bruto + incremento, anio, opts);
    const difNeto = b.salarioNeto - a.salarioNeto;
    const difIRPF = b.irpfFinal - a.irpfFinal;
    const difSS = b.cotTra - a.cotTra;
    return {
      difNeto,
      difIRPF,
      difSS,
      marginal: incremento > 0 ? (1 - difNeto / incremento) * 100 : 0,
      antes: a,
      despues: b,
    };
  }, [bruto, anio, opts, incremento]);

  const p = v => (incremento > 0 ? (v / incremento) * 100 : 0);
  const pNeto = Math.max(0, Math.round(p(d.difNeto)));
  const pIRPF = Math.max(0, Math.round(p(d.difIRPF)));
  const pSS = Math.max(0, Math.min(100 - pNeto - pIRPF, Math.round(p(d.difSS))));

  const grupos = [
    { key: 'llega', label: 'Llega a tu cuenta', value: pNeto, color: 'var(--signal)' },
    { key: 'irpf', label: 'IRPF', value: pIRPF, color: 'var(--ink)' },
    { key: 'ss', label: 'Seguridad Social', value: pSS, color: 'var(--ink-4)' },
  ];
  const suma = pNeto + pIRPF + pSS;

  return (
    <Figure
      id="09"
      title={`Si te suben ${eur(incremento)} brutos, te llegan ${eur(d.difNeto)}: un tipo marginal del ${pct(d.marginal)}`}
      sub={`${anio} · sobre un bruto de ${eur(bruto)} · mueve la subida y mira cómo cambia el reparto`}
      legend={`Un bloque = 1 € de cada 100 € de subida bruta${suma < 100 ? ` · ${100 - suma} € se reparten en el redondeo` : ''}`}
      source="Fuente · cálculo propio sobre la escala vigente"
      summary={`Una subida bruta de ${eur(incremento)} deja ${eur(d.difNeto)} netos: ${eur(d.difIRPF)} van a IRPF y ${eur(d.difSS)} a cotizaciones.`}
    >
      <div className="fs-sim">
        <div className="fs-sim-control">
          <span className="fs-label">Incremento bruto anual</span>
          <div className="fs-sim-presets">
            {[1000, 3000, 6000, 12000].map(n => (
              <button
                key={n}
                type="button"
                className="fs-btn"
                aria-pressed={incremento === n}
                onClick={() => setIncremento(n)}
              >
                {eur(n)}
              </button>
            ))}
          </div>
          <div className="fs-scrub">
            <label className="fs-sr" htmlFor="sim-inc">
              Importe de la subida bruta anual
            </label>
            <input
              id="sim-inc"
              type="range"
              min="500"
              max="20000"
              step="500"
              value={incremento}
              onChange={e => setIncremento(+e.target.value)}
              aria-valuetext={`${eur(incremento)} de subida bruta`}
            />
            <div className="fs-scrub-ticks">
              <span>500 €</span>
              <span>10.000 €</span>
              <span>20.000 €</span>
            </div>
          </div>
        </div>

        <div className="fs-sim-resultado">
          <span className="fs-label">Tipo marginal de esta subida</span>
          <p className="fs-data-md fs-counter fs-data-rule fs-data-neg num" style={{ margin: '4px 0 0' }}>
            {pct(d.marginal)}
          </p>
          <p className="fs-note" style={{ marginTop: 10 }}>
            De cada 100 € brutos de más, <strong>{pNeto} €</strong> llegan a tu cuenta.
          </p>
        </div>
      </div>

      <div className="fs-table-scroll" style={{ marginTop: 22 }}>
        <table className="fs-table">
          <caption>La resta completa, paso a paso</caption>
          <tbody>
            <tr>
              <th scope="row">Tu bruto sube</th>
              <td>{eur(incremento)}</td>
              <td>{eur(bruto)} → {eur(bruto + incremento)}</td>
            </tr>
            <tr>
              <th scope="row">Cotizaciones de más</th>
              <td>− {eur(d.difSS)}</td>
              <td>{pct(p(d.difSS))} de la subida</td>
            </tr>
            <tr>
              <th scope="row">IRPF de más</th>
              <td>− {eur(d.difIRPF)}</td>
              <td>{pct(p(d.difIRPF))} de la subida</td>
            </tr>
            <tr className="is-current">
              <th scope="row">Te llega</th>
              <td>{eur(d.difNeto)}</td>
              <td>{eur(d.difNeto / 12)} al mes en 12 pagas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <svg className="fs-svg" role="img" aria-label="Reparto de cien euros de subida bruta" viewBox="0 0 430 130" style={{ maxWidth: 430, marginTop: 22 }}>
        <HundredField groups={grupos} columns={20} size={14} gap={5} x={2} y={6} focus={focus} onFocus={setFocus} />
      </svg>

      <div className="fs-keys">
        {grupos.map(g => (
          <button
            key={g.key}
            type="button"
            className={`fs-key ${focus && focus !== g.key ? 'is-dim' : ''}`}
            onMouseEnter={() => setFocus(g.key)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(g.key)}
            onBlur={() => setFocus(null)}
          >
            <span className="fs-key-swatch" style={{ background: g.color }} />
            {g.label}
            <span className="fs-key-v">{g.value} €</span>
          </button>
        ))}
      </div>

      <p className="fs-note" style={{ marginTop: 14, maxWidth: '72ch' }}>
        Ese {pct(d.marginal)} es el <strong>tipo marginal combinado</strong> para esta subida
        concreta. Integra el incremento de IRPF, las cotizaciones y —cuando corresponde— la
        reducción del art. 20 que deja de aplicarse. No debe confundirse con el tipo efectivo
        calculado sobre el salario completo.
      </p>
    </Figure>
  );
}

/**
 * The cliff, in words and in arithmetic. The mechanism is counter-intuitive
 * enough that the figure alone does not carry it: this works the example out
 * at the exact income where the spike peaks, with live engine numbers.
 */
function ComoFunciona() {
  const { anio, opts, params } = useFiscal();

  const caso = useMemo(() => {
    let peor = null;
    for (let b = 12000; b <= 26000; b += 250) {
      const m = calcularTipoMarginal(b, anio, opts, 1000);
      if (!peor || m.tipoMarginalTotal > peor.marg) peor = { b, marg: m.tipoMarginalTotal };
    }
    if (!peor) return null;
    const a = calcularNomina(peor.b, anio, opts);
    const d = calcularNomina(peor.b + 1000, anio, opts);
    return {
      b: peor.b,
      antes: a,
      despues: d,
      dBase: d.baseImponible - a.baseImponible,
      dRed: a.redTrabajo - d.redTrabajo,
      dIrpf: d.irpfFinal - a.irpfFinal,
      dSS: d.cotTra - a.cotTra,
      dNeto: d.salarioNeto - a.salarioNeto,
    };
  }, [anio, opts]);

  if (!caso || caso.dRed <= 0) return null;

  return (
    <div className="fs-explica">
      <h3 className="fs-title-sm">Por qué existe el acantilado</h3>

      <ol className="fs-explica-pasos">
        <li>
          <span className="fs-stamp">01 · La zona plana</span>
          <p className="fs-note">
            Por debajo de {eur(params.art20Meta.uInf ?? 0)} de rendimiento neto, la reducción del
            art. 20 está al máximo ({eur(params.art20Meta.rMax ?? 0)}) y permanece constante dentro
            de ese intervalo. Cada euro adicional tributa al tipo ordinario del tramo.
          </p>
        </li>
        <li>
          <span className="fs-stamp">02 · La retirada</span>
          <p className="fs-note">
            A partir de ese umbral la reducción empieza a disminuir. Por cada euro adicional de
            rendimiento se reduce una fracción del beneficio, así que la base imponible sube{' '}
            <strong>más de un euro por cada euro adicional de rendimiento</strong>. El tipo marginal
            efectivo combina el tipo del tramo con el efecto de la reducción que deja de aplicarse.
          </p>
        </li>
        <li>
          <span className="fs-stamp">03 · El suelo</span>
          <p className="fs-note">
            Cuando la reducción llega a cero ({eur(params.art20Meta.uSup ?? 0)} de rendimiento neto)
            ya no queda nada que retirar y el tipo marginal vuelve a caer al del tramo ordinario.
            Por eso el pico tiene forma de escalón y no de rampa.
          </p>
        </li>
      </ol>

      <div className="fs-caso">
        <p className="fs-label" style={{ marginBottom: 10 }}>
          El caso más extremo de {anio}: una subida de 1.000 € sobre {eur(caso.b)}
        </p>
        <div className="fs-table-scroll">
          <table className="fs-table">
          <tbody>
            <tr>
              <th scope="row">Aumento del bruto</th>
              <td>{eur(1000)}</td>
            </tr>
            <tr>
              <th scope="row">Disminución de la reducción del art. 20</th>
              <td>−{eur(caso.dRed)}</td>
            </tr>
            <tr>
              <th scope="row">Aumento de la base imponible</th>
              <td>{eur(caso.dBase)}</td>
            </tr>
            <tr>
              <th scope="row">Aumento del IRPF</th>
              <td>−{eur(caso.dIrpf)}</td>
            </tr>
            <tr>
              <th scope="row">Aumento de cotizaciones</th>
              <td>−{eur(caso.dSS)}</td>
            </tr>
            <tr className="is-current">
              <th scope="row">Aumento de renta neta</th>
              <td>{eur(caso.dNeto)}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <p className="fs-note" style={{ marginTop: 10, maxWidth: '68ch' }}>
          Mil euros brutos más dejan {eur(caso.dNeto)} netos: un tipo marginal del{' '}
          <strong>{pct((1 - caso.dNeto / 1000) * 100)}</strong>. La base sube {eur(caso.dBase)} —{' '}
          {eur(caso.dBase - 1000)} más que el propio aumento— porque la reducción que se retira
          también se grava. Afecta sólo a los euros dentro de esta franja, no a todo el salario.
        </p>
      </div>
    </div>
  );
}
