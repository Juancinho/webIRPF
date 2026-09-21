import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, DEUDA_ESPANA } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label, TickStrip } from '../figures/marks';
import { linear, polyline, round } from '../figures/scale';
import { dec, eur, pct, sign } from '../utils/format';

const SERIE = ANIOS.map(a => ({ anio: a, ...DEUDA_ESPANA[a] }));

/**
 * La deuda pública, explicada antes que dibujada.
 * FIG. 22 la serie: cuánto se debe, sobre qué PIB y por habitante.
 * FIG. 23 de dónde salió: el incremento de cada año, en cascada.
 * FIG. 24 tu parte: tu IRPF anual frente a tu parte, a escala.
 */
export default function Deuda() {
  const { anio, nomina } = useFiscal();

  return (
    <section id="deuda" className="fs-chapter fs-open-debt" aria-labelledby="deuda-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">08</span>

        <div className="fs-chapter-head" data-gesture="SALDO ACUMULADO · EUROS · POR HABITANTE · % DEL PIB">
          <span className="fs-stamp">08 / 09 · La deuda</span>
          <h2 id="deuda-t" className="fs-title">
            La deuda pública,
            <br />
            en tres escalas
          </h2>
          <p className="fs-kicker">
            La deuda es un saldo acumulado, no una factura individual. La leeremos en euros totales,
            por habitante y como porcentaje del PIB; cada escala responde a una pregunta distinta y
            ninguna, por sí sola, describe la sostenibilidad fiscal completa.
          </p>
        </div>

      <div className="fs-explica" style={{ borderTop: 0, paddingTop: 0, marginBottom: 32 }}>
        <h3 className="fs-title-sm">Qué es —y qué no es— la deuda pública</h3>
        <p className="fs-body" style={{ marginTop: 14 }}>
          Cada año en que el Estado gasta más de lo que ingresa, la diferencia se financia
          emitiendo deuda. La deuda pública es la suma acumulada de todos esos déficits, menos lo
          amortizado. No es una factura individual: es un pasivo del conjunto de las
          administraciones que genera intereses y vencimientos, y que habitualmente se refinancia.
        </p>
        <p className="fs-body">
          Para analizar su sostenibilidad no basta con una sola cifra: importan su proporción
          sobre el <strong>PIB</strong>, el coste de financiación, los vencimientos, el crecimiento
          y el saldo presupuestario. Por eso la
          deuda <em>por habitante</em> que verás más abajo es una <strong>escala de magnitud</strong>,
          no una obligación personal. Sirve para responder a «¿de qué tamaño estamos hablando?»,
          no para decir cuánto debes tú.
        </p>
      </div>

        <Serie anioActual={anio} />
        <Cascada />
        <TuParte anio={anio} irpf={nomina.irpfFinal} />
      </div>
    </section>
  );
}

/* ── FIG. 22 · la serie ───────────────────────────────────────────────────── */
function Serie({ anioActual }) {
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const W = 880;
  const H = 430;
  const X0 = 30;
  const X1 = W - 128;
  const A0 = 34;
  const A1 = 232;
  const B0 = 296;
  const B1 = 386;

  const x = linear([2012, 2026], [X0, X1]);
  const hiPC = Math.max(...SERIE.map(d => d.perCapita)) * 1.06;
  const y = linear([0, hiPC], [A1, A0]);
  const loPib = Math.min(...SERIE.map(d => d.pctPIB)) - 6;
  const hiPib = Math.max(...SERIE.map(d => d.pctPIB)) + 4;
  const yp = linear([loPib, hiPib], [B1, B0]);

  const act = SERIE.find(d => d.anio === (hover ?? anioActual)) || SERIE[SERIE.length - 1];

  return (
    <Figure
      id="28"
      title={`España debe ${dec(SERIE[SERIE.length - 1].totalMM / 1000, 2)} billones de euros, el ${pct(SERIE[SERIE.length - 1].pctPIB)} de su PIB`}
      sub="2012—2026 · arriba, deuda por habitante en euros · abajo, la misma deuda como porcentaje del PIB · dos escalas separadas, nunca superpuestas"
      legend="Área = deuda por habitante · línea inferior = deuda sobre PIB · el año en curso va en petróleo"
      source="Fuente · Banco de España (Protocolo de Déficit Excesivo) · INE (población)"
      note="Las dos lecturas cuentan cosas distintas: por habitante crece casi siempre, porque la deuda sube más deprisa que la población; sobre el PIB baja cuando la economía crece más deprisa que la deuda. Desde 2020 ocurren las dos cosas a la vez."
      summary={SERIE.map(d => `${d.anio}: ${eur(d.perCapita)} por habitante, ${pct(d.pctPIB)} del PIB`).join('; ')}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Año {act.anio}</span>
          <span className="fs-readout-v">{act.totalMM.toLocaleString('es-ES')} mM €</span>
        </span>
        <span>
          <span className="fs-readout-k">Sobre el PIB</span>
          <span className="fs-readout-v">{pct(act.pctPIB)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Por habitante</span>
          <span className="fs-readout-v fs-signal">{eur(act.perCapita)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Población</span>
          <span className="fs-readout-v">{dec(act.poblacion, 2)} M</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll label="Deuda pública española por habitante y sobre PIB">
        {/* ── track 1: euros per inhabitant ───────────────────────────────── */}
        <path
          d={polyline([[X0, A1], ...SERIE.map(d => [x(d.anio), y(d.perCapita)]), [X1, A1]]) + ' Z'}
          fill="var(--ink)"
          opacity={0.12}
        />
        <path d={polyline(SERIE.map(d => [x(d.anio), y(d.perCapita)]))} fill="none" stroke="var(--ink)" strokeWidth={1.8} />

        {[0, 10000, 20000, 30000].map(v => (
          <g key={v}>
            <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
            <Label x={X0} y={round(y(v)) - 5} size={9} color="var(--ink-5)" mono>
              {eur(v)}
            </Label>
          </g>
        ))}
        <Label x={X1 + 8} y={round(y(SERIE[SERIE.length - 1].perCapita)) + 3} size={9} color="var(--ink)" mono>
          POR HABITANTE
        </Label>
        <Label x={X1 + 8} y={round(y(SERIE[SERIE.length - 1].perCapita)) + 16} size={12} weight={800} color="var(--ink)">
          {eur(SERIE[SERIE.length - 1].perCapita)}
        </Label>

        {/* ── track 2: share of GDP ───────────────────────────────────────── */}
        <path d={polyline(SERIE.map(d => [x(d.anio), yp(d.pctPIB)]))} fill="none" stroke="var(--counter)" strokeWidth={1.6} />
        <line x1={X0} y1={round(yp(100))} x2={X1} y2={round(yp(100))} stroke="var(--ink-6)" strokeWidth={0.8} strokeDasharray="3 3" />
        <Label x={X0} y={round(yp(100)) - 5} size={9} color="var(--ink-5)" mono>
          100 % DEL PIB
        </Label>
        <Label x={X1 + 8} y={round(yp(SERIE[SERIE.length - 1].pctPIB)) + 3} size={9} color="var(--counter)" mono>
          SOBRE EL PIB
        </Label>
        <Label x={X1 + 8} y={round(yp(SERIE[SERIE.length - 1].pctPIB)) + 16} size={12} weight={800} color="var(--counter)">
          {pct(SERIE[SERIE.length - 1].pctPIB)}
        </Label>

        {SERIE.map(d => (
          <g key={d.anio}>
            <circle cx={round(x(d.anio))} cy={round(y(d.perCapita))} r={d.anio === act.anio ? 4.6 : 2.4} fill={d.anio === act.anio ? 'var(--signal)' : 'var(--ink)'} />
            <circle cx={round(x(d.anio))} cy={round(yp(d.pctPIB))} r={d.anio === act.anio ? 4.2 : 2.2} fill={d.anio === act.anio ? 'var(--signal)' : 'var(--counter)'} />
            <rect
              className="fs-hit"
              x={round(x(d.anio)) - 13}
              y={A0 - 14}
              width={26}
              height={B1 - A0 + 22}
              onMouseEnter={() => {
                setHover(d.anio);
                setTip({
                  vx: x(d.anio),
                  vy: y(d.perCapita),
                  title: String(d.anio),
                  sub: 'Deuda pública española',
                  rows: [
                    ['Total', d.totalMM.toLocaleString('es-ES') + ' mM €'],
                    ['Sobre el PIB', pct(d.pctPIB), 'var(--counter)'],
                    ['Por habitante', eur(d.perCapita), 'var(--ink)'],
                    ['Población', dec(d.poblacion, 2) + ' M'],
                  ],
                });
              }}
              onMouseLeave={() => { setHover(null); setTip(null); }}
            >
              <title>{`${d.anio} — ${d.totalMM.toLocaleString('es-ES')} mM €, ${pct(d.pctPIB)} del PIB, ${eur(d.perCapita)} por habitante`}</title>
            </rect>
          </g>
        ))}

        {/* the pandemic is the one annotation this series needs */}
        <line x1={round(x(2020))} y1={A0 - 12} x2={round(x(2020))} y2={B1} stroke="var(--ink-6)" strokeWidth={0.7} strokeDasharray="2 4" />
        <Label x={round(x(2020))} y={A0 - 16} size={9} color="var(--ink-4)" anchor="middle" mono>
          2020 · PANDEMIA
        </Label>

        <line x1={X0} y1={A1} x2={X1} y2={A1} stroke="var(--rule)" strokeWidth={0.8} />
        <line x1={X0} y1={B1} x2={X1} y2={B1} stroke="var(--rule)" strokeWidth={0.8} />
        {[2012, 2016, 2020, 2024, 2026].map(a => (
          <Label key={a} x={round(x(a))} y={B1 + 22} size={9.5} color="var(--ink-4)" anchor="middle" mono>
            {a}
          </Label>
        ))}
      </ChartFrame>
    </Figure>
  );
}

/* ── FIG. 23 · de dónde salió ─────────────────────────────────────────────── */
function Cascada() {
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const pasos = useMemo(() => {
    const out = [];
    for (let i = 1; i < SERIE.length; i++) {
      out.push({
        anio: SERIE[i].anio,
        inc: SERIE[i].totalMM - SERIE[i - 1].totalMM,
        desde: SERIE[i - 1].totalMM,
        hasta: SERIE[i].totalMM,
      });
    }
    return out;
  }, []);

  const total = SERIE[SERIE.length - 1].totalMM - SERIE[0].totalMM;
  const mayor = pasos.reduce((a, c) => (c.inc > a.inc ? c : a), pasos[0]);

  const W = 880;
  const H = 360;
  const X0 = 40;
  const X1 = W - 40;
  const BASE = 276;
  const UNIT = 5; // one rung = 5.000 M €
  const paso = (X1 - X0) / pasos.length;
  const hiInc = Math.max(...pasos.map(p => Math.abs(p.inc)));
  const alto = linear([0, hiInc], [0, 200]);

  const act = hover ? pasos.find(p => p.anio === hover) : mayor;

  return (
    <Figure
      id="29"
      title={`De dónde salió: la deuda creció ${total.toLocaleString('es-ES')} mM € desde 2012, y ${mayor.inc.toLocaleString('es-ES')} de ellos en un solo año`}
      sub={`Aumento de la deuda total en cada ejercicio · miles de millones de euros · una marca = ${UNIT}.000 millones`}
      legend={`Una marca = ${UNIT}.000 M € · marcas llenas = la deuda sube · marcas discontinuas = la deuda baja`}
      source="Fuente · Banco de España (Protocolo de Déficit Excesivo)"
      note="Cada columna muestra la variación del saldo de deuda respecto al cierre anterior. No coincide necesariamente con el déficit del ejercicio por ajustes de valoración y otras operaciones financieras; 2020 registra el mayor aumento de la serie."
      summary={pasos.map(p => `${p.anio}: ${sign(p.inc)} mM €`).join('; ')}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Año {act.anio}</span>
          <span className="fs-readout-v">{act.inc >= 0 ? '+' : '−'}{Math.abs(act.inc).toLocaleString('es-ES')} mM €</span>
        </span>
        <span>
          <span className="fs-readout-k">Deuda total ese año</span>
          <span className="fs-readout-v">{act.hasta.toLocaleString('es-ES')} mM €</span>
        </span>
        <span>
          <span className="fs-readout-k">Parte del aumento total</span>
          <span className="fs-readout-v fs-signal">{pct((act.inc / total) * 100)}</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll label="Aumento anual de la deuda pública">
        <line x1={X0 - 10} y1={BASE} x2={X1 + 10} y2={BASE} stroke="var(--ink)" strokeWidth={0.9} />

        {pasos.map((p, i) => {
          const cx = X0 + paso * (i + 0.5);
          const h = alto(Math.abs(p.inc));
          const sube = p.inc >= 0;
          const esAct = p.anio === act.anio;
          const marcas = Math.max(1, Math.round(Math.abs(p.inc) / UNIT));
          return (
            <g key={p.anio} opacity={hover && !esAct ? 0.5 : 1}>
              <g transform={`rotate(-90 ${round(cx)} ${round(BASE - h / 2)})`}>
                <TickStrip
                  x={round(cx - h / 2)}
                  y={round(BASE - h / 2)}
                  width={h}
                  count={marcas}
                  height={paso * 0.62}
                  seed={i + 9}
                  color={esAct ? 'var(--signal)' : 'var(--ink)'}
                  subtract={!sube}
                  dot={false}
                />
              </g>

              <Label x={cx} y={round(BASE - h - 10)} size={esAct ? 12 : 10} weight={800} color={esAct ? 'var(--signal)' : 'var(--ink)'} anchor="middle">
                {sube ? '+' : '−'}{Math.abs(p.inc)}
              </Label>
              <Label x={cx} y={BASE + 18} size={9} color="var(--ink-4)" anchor="middle" mono>
                {String(p.anio).slice(2)}
              </Label>

              <rect
                className="fs-hit"
                x={round(cx - paso / 2)}
                y={40}
                width={round(paso)}
                height={BASE - 20}
                onMouseEnter={() => {
                  setHover(p.anio);
                  setTip({
                    vx: cx,
                    vy: BASE - h,
                    title: String(p.anio),
                    sub: 'Aumento de la deuda',
                    rows: [
                      ['Ese ejercicio', (sube ? '+' : '−') + Math.abs(p.inc).toLocaleString('es-ES') + ' mM €', 'var(--signal)'],
                      ['Deuda al cierre', p.hasta.toLocaleString('es-ES') + ' mM €'],
                      ['Del aumento total', pct((p.inc / total) * 100)],
                    ],
                  });
                }}
                onMouseLeave={() => { setHover(null); setTip(null); }}
              >
                <title>{`${p.anio} — la deuda sube ${p.inc} mM € hasta ${p.hasta} mM €`}</title>
              </rect>
            </g>
          );
        })}

        <Label x={X0 - 10} y={BASE + 40} size={9} color="var(--ink-5)" mono>
          AUMENTO DE LA DEUDA EN CADA EJERCICIO · MILES DE MILLONES DE EUROS
        </Label>
      </ChartFrame>
    </Figure>
  );
}

/* ── FIG. 25 · comparación por habitante ──────────────────────────────────── */
function TuParte({ anio, irpf }) {
  const [horizonte, setHorizonte] = useState(20);
  const d = DEUDA_ESPANA[anio];
  const anios = irpf > 0 ? d.perCapita / irpf : null;

  const UNIT = 500; // one block = 500 €
  const W = 880;
  const H = 300;
  const COLS = 24;
  const SIZE = 13;
  const GAP = 4;

  const bloquesDeuda = Math.round(d.perCapita / UNIT);
  const bloquesIrpf = Math.round(irpf / UNIT);
  const cubiertos = Math.min(bloquesDeuda, Math.round((irpf * horizonte) / UNIT));
  const restante = Math.max(0, d.perCapita - irpf * horizonte);

  const cell = (i, x0, y0) => [x0 + (i % COLS) * (SIZE + GAP), y0 + Math.floor(i / COLS) * (SIZE + GAP)];

  return (
    <Figure
      id="30"
      title={
        anios
          ? `La deuda por habitante equivale a ${dec(anios)} años de tu IRPF anual`
          : 'A tu nivel de renta no pagas IRPF, así que esta comparación no aplica'
      }
      sub={`${anio} · deuda por habitante ${eur(d.perCapita)} frente a tu IRPF anual ${eur(irpf)} · un bloque = ${eur(UNIT)}, ambas cifras a la misma escala`}
      legend={`Un bloque = ${eur(UNIT)} · arriba, deuda por habitante · abajo, tu IRPF anual`}
      source="Fuente · Banco de España · INE · cálculo propio"
      note="Es una escala de magnitud, no una deuda personal ni una previsión: la deuda pública no se amortiza con el IRPF de una persona, se refinancia y se sostiene con el conjunto de la economía."
      summary={`Deuda por habitante ${eur(d.perCapita)}; IRPF anual ${eur(irpf)}.`}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Deuda por habitante</span>
          <span className="fs-readout-v">{eur(d.perCapita)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Tu IRPF de un año</span>
          <span className="fs-readout-v fs-signal">{eur(irpf)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Años equivalentes</span>
          <span className="fs-readout-v">{anios ? dec(anios) : '—'}</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} scroll label="Deuda por habitante frente a tu IRPF anual">
        <Label x={0} y={14} size={10} color="var(--ink-3)" mono>
          DEUDA POR HABITANTE · {eur(d.perCapita)}
        </Label>
        {Array.from({ length: bloquesDeuda }, (_, i) => {
          const [cx, cy] = cell(i, 0, 26);
          const dentro = i < cubiertos;
          return (
            <rect
              key={i}
              x={round(cx)}
              y={round(cy)}
              width={SIZE}
              height={SIZE}
              fill={dentro ? 'var(--signal)' : 'var(--ink-6)'}
              opacity={dentro ? 1 : 0.85}
            >
              <title>{`${eur(UNIT)} de deuda por habitante`}</title>
            </rect>
          );
        })}

        {(() => {
          const filas = Math.ceil(bloquesDeuda / COLS);
          const y0 = 26 + filas * (SIZE + GAP) + 34;
          return (
            <g>
              <Label x={0} y={y0 - 12} size={10} color="var(--ink-3)" mono>
                TU IRPF DE UN AÑO · {eur(irpf)}
              </Label>
              {Array.from({ length: bloquesIrpf }, (_, i) => {
                const [cx, cy] = cell(i, 0, y0);
                return (
                  <rect key={i} x={round(cx)} y={round(cy)} width={SIZE} height={SIZE} fill="var(--ink)">
                    <title>{`${eur(UNIT)} de IRPF`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })()}
      </ChartFrame>

      <div style={{ marginTop: 18 }}>
        <span className="fs-label">Si destinaras el 100 % de tu IRPF durante</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
          <span className="fs-seg">
            {[10, 20, 30].map(n => (
              <button key={n} type="button" aria-pressed={horizonte === n} onClick={() => setHorizonte(n)}>
                {n} años
              </button>
            ))}
          </span>
          <span className="fs-note">
            Cubrirías {eur(Math.min(d.perCapita, irpf * horizonte))} —los bloques en petróleo— y
            quedarían <strong>{eur(restante)}</strong> {restante === 0 ? 'nada pendiente' : 'por cubrir'}.
          </span>
        </div>
      </div>
    </Figure>
  );
}
