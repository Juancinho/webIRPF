import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, DEUDA_ESPANA, INFLACION_A_2026 } from '../engine/irpf';
import GuiaRail from '../figures/GuiaRail';
import Figure from '../figures/Figure';
import Puente from '../figures/Puente';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { linear, polyline, round } from '../figures/scale';
import { dec, eur, pct } from '../utils/format';

const SERIE = ANIOS.map(anio => {
  const d = DEUDA_ESPANA[anio];
  const factor = INFLACION_A_2026[anio];
  return {
    anio,
    ...d,
    factor,
    totalRealMM: d.totalMM * factor,
    perCapitaReal: d.perCapita * factor,
    pibMM: d.totalMM / (d.pctPIB / 100),
  };
});

const ULTIMO_ANIO_DEUDA_OBSERVADO = 2025;

function FuenteDeuda({ ipc = false, poblacion = false }) {
  return (
    <>
      Fuente ·{' '}
      <a href="https://datos.bde.es/datos/es/datasets/000/033.html" target="_blank" rel="noreferrer noopener">
        Banco de España · deuda de las AAPP según el PDE
      </a>
      {ipc && (
        <>
          {' · '}
          <a href="https://www.ine.es/varipc/" target="_blank" rel="noreferrer noopener">INE · IPC</a>
        </>
      )}
      {poblacion && (
        <>
          {' · '}
          <a href="https://www.ine.es/dyngs/INEbase/es/categoria.htm?c=Estadistica_P&cid=1254734710984" target="_blank" rel="noreferrer noopener">INE · población</a>
        </>
      )}
      {' · 2026 es una estimación incorporada al modelo'}
    </>
  );
}

const COLOR_METRICA = {
  total: 'var(--signal)',
  perCapita: 'var(--counter)',
  pctPIB: 'var(--series-violet)',
};

const valorSerie = (d, metrica, modo) => {
  if (metrica === 'pctPIB') return d.pctPIB;
  if (metrica === 'perCapita') return modo === 'real' ? d.perCapitaReal : d.perCapita;
  return modo === 'real' ? d.totalRealMM : d.totalMM;
};

const formatoMetrica = (v, metrica) => {
  if (metrica === 'pctPIB') return pct(v);
  if (metrica === 'perCapita') return eur(v);
  return `${Math.round(v).toLocaleString('es-ES')} mM €`;
};

const conSigno = (v, decimales = 0) => `${v >= 0 ? '+' : '−'}${dec(Math.abs(v), decimales)}`;

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
            en varias escalas
          </h2>
          <p className="fs-kicker">
            El saldo puede expresarse en euros corrientes, en euros de poder adquisitivo comparable,
            por habitante o como proporción del PIB. Son lecturas complementarias de una misma serie;
            ninguna determina por sí sola su sostenibilidad.
          </p>
        </div>

        <div className="fs-explica" style={{ borderTop: 0, paddingTop: 0, marginBottom: 32 }}>
          <h3 className="fs-title-sm">Saldo, escala y capacidad de pago</h3>
          <p className="fs-body" style={{ marginTop: 14 }}>
            La deuda pública registra obligaciones acumuladas de las administraciones. Su variación
            anual está relacionada con el déficit, pero no coincide necesariamente con él: también
            intervienen ajustes de valoración y operaciones financieras.
          </p>
          <p className="fs-body">
            Los euros nominales describen el saldo publicado en cada año. Los euros reales de 2026
            corrigen esos importes por inflación para hacerlos comparables en poder adquisitivo. La
            ratio sobre el PIB añade una referencia al tamaño de la economía; la cifra por habitante
            sólo cambia la escala y no constituye una obligación personal.
          </p>
          <p className="fs-body">
            La serie observada llega hasta {ULTIMO_ANIO_DEUDA_OBSERVADO}. El valor de 2026 que mantiene
            la continuidad temporal de la publicación es una estimación incluida en FiscalScope y se
            identifica como tal; no debe citarse como cierre anual publicado por el Banco de España.
          </p>
        </div>

        <div className="fs-spread">
          <aside className="fs-rail">
            <GuiaRail seccion="deuda" />
            <div className="fs-rail-item">
              <span className="fs-stamp">Saldo y déficit</span>
              <p className="fs-note">
                El déficit es la diferencia entre ingresos y gastos de un ejercicio; la deuda es el
                saldo acumulado. No coinciden: también intervienen ajustes de valoración y
                operaciones financieras.
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Fuente</span>
              <p className="fs-note">
                Banco de España, deuda de las AAPP según el Protocolo de Déficit Excesivo · INE para
                IPC y población. El dato de 2026 es una estimación de la publicación.
              </p>
            </div>
          </aside>

          <div className="fs-field">
            <Serie anioActual={anio} />
            <Cascada />
            <TuParte anio={anio} irpf={nomina.irpfFinal} />
          </div>
        </div>

        <Puente rotulo="Cierre del recorrido">
          La deuda cierra la ampliación desde el caso individual hasta las cuentas públicas. La
          comparación por habitante sirve únicamente para expresar escala: no asigna una fracción de
          deuda a cada persona. El resumen siguiente vuelve al perfil seleccionado y reúne sólo las
          magnitudes que proceden de su cálculo fiscal.
        </Puente>
      </div>
    </section>
  );
}

function Serie({ anioActual }) {
  const [metrica, setMetrica] = useState('total');
  const [modo, setModo] = useState('nominal');
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const W = 880;
  const H = 390;
  const X0 = 54;
  const X1 = W - 128;
  const Y0 = 48;
  const Y1 = H - 58;
  const x = linear([2012, 2026], [X0, X1]);
  const valores = SERIE.map(d => valorSerie(d, metrica, modo));
  const max = Math.max(...valores) * 1.08;
  const y = linear([0, max], [Y1, Y0]);
  const color = COLOR_METRICA[metrica];
  const act = SERIE.find(d => d.anio === (hover ?? anioActual)) || SERIE[SERIE.length - 1];
  const indice = SERIE.findIndex(d => d.anio === act.anio);
  const anterior = indice > 0 ? SERIE[indice - 1] : null;
  const valorAct = valorSerie(act, metrica, modo);
  const variacion = anterior ? valorAct - valorSerie(anterior, metrica, modo) : null;
  const modoEfectivo = metrica === 'pctPIB' ? 'ratio' : modo;
  const ultimo = SERIE[SERIE.length - 1];
  const nombre = metrica === 'total' ? 'saldo total' : metrica === 'perCapita' ? 'deuda por habitante' : 'deuda sobre PIB';
  const unidad = metrica === 'pctPIB' ? '% del PIB' : modo === 'real' ? 'euros constantes de 2026' : 'euros corrientes';

  return (
    <Figure
      id="28"
      title={`${nombre[0].toUpperCase()}${nombre.slice(1)}: ${formatoMetrica(valorSerie(ultimo, metrica, modo), metrica)} en 2026 (estimación)`}
      sub={`España · 2012—2025 observado · 2026 estimado · ${unidad} · selecciona una magnitud para evitar superponer unidades distintas`}
      legend="Una marca por año · líneas verticales = distancia al cero · verde = año seleccionado · pasa el cursor para inspeccionar"
      source={<FuenteDeuda ipc poblacion />}
      note="La serie real multiplica cada importe nominal por el factor de IPC que lo expresa en euros de 2026. La ratio deuda/PIB no se deflacta: ya relaciona dos magnitudes nominales del mismo ejercicio. El PIB mostrado se infiere del saldo y de la ratio. El punto de 2026 es una estimación, no un cierre anual observado."
      summary={SERIE.map(d => `${d.anio}: ${formatoMetrica(valorSerie(d, metrica, modo), metrica)}`).join('; ')}
    >
      <div className="fs-chart-controls">
        <span className="fs-seg" aria-label="Magnitud de deuda">
          <button type="button" aria-pressed={metrica === 'total'} onClick={() => setMetrica('total')}>Total</button>
          <button type="button" aria-pressed={metrica === 'perCapita'} onClick={() => setMetrica('perCapita')}>Por habitante</button>
          <button type="button" aria-pressed={metrica === 'pctPIB'} onClick={() => setMetrica('pctPIB')}>% del PIB</button>
        </span>
        {metrica !== 'pctPIB' && (
          <span className="fs-seg" aria-label="Unidad monetaria">
            <button type="button" aria-pressed={modo === 'nominal'} onClick={() => setModo('nominal')}>Nominal</button>
            <button type="button" aria-pressed={modo === 'real'} onClick={() => setModo('real')}>Real · € 2026</button>
          </span>
        )}
      </div>

      <div className="fs-readout fs-readout-wide">
        <span><span className="fs-readout-k">Año {act.anio}</span><span className="fs-readout-v" style={{ color }}>{formatoMetrica(valorAct, metrica)}</span></span>
        <span><span className="fs-readout-k">Total nominal</span><span className="fs-readout-v">{formatoMetrica(act.totalMM, 'total')}</span></span>
        <span><span className="fs-readout-k">Total real · € 2026</span><span className="fs-readout-v">{formatoMetrica(act.totalRealMM, 'total')}</span></span>
        <span><span className="fs-readout-k">Sobre el PIB</span><span className="fs-readout-v">{pct(act.pctPIB)}</span></span>
        <span><span className="fs-readout-k">Por habitante · nominal</span><span className="fs-readout-v">{eur(act.perCapita)}</span></span>
        <span><span className="fs-readout-k">PIB implícito</span><span className="fs-readout-v">{Math.round(act.pibMM).toLocaleString('es-ES')} mM €</span></span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll label={`${nombre}, ${unidad}`}>
        {[0, 0.25, 0.5, 0.75, 1].map(fr => {
          const v = max * fr;
          return (
            <g key={fr}>
              <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
              <Label x={X0 - 8} y={round(y(v)) + 3} size={8.5} color="var(--ink-5)" anchor="end" mono>
                {metrica === 'total' ? `${Math.round(v / 100) * 100}` : metrica === 'perCapita' ? `${Math.round(v / 1000)}k` : `${Math.round(v)} %`}
              </Label>
            </g>
          );
        })}

        {SERIE.map((d, i) => {
          const v = valores[i];
          const activa = d.anio === act.anio;
          return (
            <g key={d.anio}>
              <line x1={round(x(d.anio))} y1={Y1} x2={round(x(d.anio))} y2={round(y(v))} stroke={color} strokeWidth={activa ? 1.2 : 0.65} opacity={activa ? 0.72 : 0.25} />
              <circle cx={round(x(d.anio))} cy={round(y(v))} r={activa ? 5 : 2.7} fill={activa ? 'var(--signal)' : color} />
              <rect
                className="fs-hit"
                x={round(x(d.anio)) - 14}
                y={Y0 - 16}
                width={28}
                height={Y1 - Y0 + 30}
                onMouseEnter={() => {
                  setHover(d.anio);
                  setTip({
                    vx: x(d.anio),
                    vy: y(v),
                    title: `${d.anio} · ${formatoMetrica(v, metrica)}`,
                    sub: `${nombre} · ${modoEfectivo === 'real' ? 'euros de 2026' : modoEfectivo === 'nominal' ? 'euros corrientes' : '% del PIB'}`,
                    rows: [
                      ['Total nominal', formatoMetrica(d.totalMM, 'total')],
                      ['Total real', formatoMetrica(d.totalRealMM, 'total'), 'var(--series-cyan)'],
                      ['Sobre el PIB', pct(d.pctPIB), 'var(--series-violet)'],
                      ['Por habitante', eur(d.perCapita), 'var(--counter)'],
                      ['Población', `${dec(d.poblacion, 2)} M`],
                    ],
                  });
                }}
                onMouseLeave={() => { setHover(null); setTip(null); }}
              >
                <title>{`${d.anio} — ${formatoMetrica(v, metrica)}`}</title>
              </rect>
            </g>
          );
        })}

        <path d={polyline(SERIE.map((d, i) => [x(d.anio), y(valores[i])]))} fill="none" stroke={color} strokeWidth={2.2} />
        <line x1={round(x(2020))} y1={Y0 - 12} x2={round(x(2020))} y2={Y1} stroke="var(--ink-5)" strokeWidth={0.7} strokeDasharray="2 4" />
        <Label x={round(x(2020))} y={Y0 - 17} size={8.5} color="var(--ink-4)" anchor="middle" mono>2020</Label>
        <Label x={X1 + 10} y={round(y(valorSerie(ultimo, metrica, modo))) - 4} size={9} color={color} mono>2026 · EST.</Label>
        <Label x={X1 + 10} y={round(y(valorSerie(ultimo, metrica, modo))) + 13} size={12} weight={800} color={color}>{formatoMetrica(valorSerie(ultimo, metrica, modo), metrica)}</Label>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--ink)" strokeWidth={0.9} />
        {[2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026].map(a => (
          <Label key={a} x={round(x(a))} y={Y1 + 22} size={9} color="var(--ink-4)" anchor="middle" mono>{a}</Label>
        ))}
        {variacion !== null && (
          <Label x={X0} y={H - 10} size={9} color="var(--ink-4)" mono>
            VARIACIÓN {act.anio - 1}—{act.anio} · {variacion >= 0 ? '+' : '−'}{formatoMetrica(Math.abs(variacion), metrica)}
          </Label>
        )}
      </ChartFrame>
    </Figure>
  );
}

function Cascada() {
  const [modo, setModo] = useState('nominal');
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const pasos = useMemo(() => {
    const valor = d => modo === 'real' ? d.totalRealMM : d.totalMM;
    return SERIE.slice(1).map((d, i) => ({
      anio: d.anio,
      inc: valor(d) - valor(SERIE[i]),
      desde: valor(SERIE[i]),
      hasta: valor(d),
    }));
  }, [modo]);

  const inicial = modo === 'real' ? SERIE[0].totalRealMM : SERIE[0].totalMM;
  const final = modo === 'real' ? SERIE.at(-1).totalRealMM : SERIE.at(-1).totalMM;
  const total = final - inicial;
  const mayor = pasos.reduce((a, c) => (Math.abs(c.inc) > Math.abs(a.inc) ? c : a), pasos[0]);
  const act = hover ? pasos.find(p => p.anio === hover) : mayor;
  const W = 880;
  const H = 370;
  const X0 = 42;
  const X1 = W - 34;
  const BASE = 220;
  const pasoX = (X1 - X0) / pasos.length;
  const hiInc = Math.max(...pasos.map(p => Math.abs(p.inc)));
  const alto = linear([0, hiInc], [0, 162]);

  return (
    <Figure
      id="29"
      title={`El saldo varió ${conSigno(total)} mM € entre 2012 y 2026 (estimación) en términos ${modo === 'real' ? 'reales' : 'nominales'}`}
      sub={`Cambio respecto al cierre anterior · 2013—2025 observado, 2026 estimado · miles de millones de ${modo === 'real' ? 'euros constantes de 2026' : 'euros corrientes'}`}
      legend="Cada columna parte de cero · arriba = aumento · abajo = reducción · las pequeñas marcas permiten comparar magnitudes sin rellenar el área"
      source={<FuenteDeuda ipc />}
      note="La variación del saldo no equivale exactamente al déficit del ejercicio. En la vista real, un descenso puede indicar que el saldo nominal creció menos que los precios; no significa necesariamente que se amortizara deuda en euros corrientes. La variación de 2026 usa el punto estimado de la serie."
      summary={pasos.map(p => `${p.anio}: ${conSigno(p.inc)} mM € ${modo === 'real' ? 'de 2026' : 'corrientes'}`).join('; ')}
    >
      <div className="fs-chart-controls">
        <span className="fs-seg" aria-label="Variación nominal o real">
          <button type="button" aria-pressed={modo === 'nominal'} onClick={() => setModo('nominal')}>Nominal</button>
          <button type="button" aria-pressed={modo === 'real'} onClick={() => setModo('real')}>Real · € 2026</button>
        </span>
      </div>

      <div className="fs-readout">
        <span><span className="fs-readout-k">Año {act.anio}</span><span className="fs-readout-v">{conSigno(act.inc)} mM €</span></span>
        <span><span className="fs-readout-k">Variación anual</span><span className="fs-readout-v">{conSigno((act.inc / act.desde) * 100, 1)} %</span></span>
        <span><span className="fs-readout-k">Saldo al cierre</span><span className="fs-readout-v">{Math.round(act.hasta).toLocaleString('es-ES')} mM €</span></span>
        <span><span className="fs-readout-k">Cambio desde 2012</span><span className="fs-readout-v fs-signal">{conSigno(total)} mM €</span></span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll label={`Variación anual ${modo === 'real' ? 'real' : 'nominal'} de la deuda`}>
        <line x1={X0 - 10} y1={BASE} x2={X1 + 8} y2={BASE} stroke="var(--ink)" strokeWidth={0.9} />
        {pasos.map((p, i) => {
          const cx = X0 + pasoX * (i + 0.5);
          const h = alto(Math.abs(p.inc));
          const sube = p.inc >= 0;
          const fin = BASE + (sube ? -h : h);
          const activa = p.anio === act.anio;
          const color = sube ? 'var(--signal)' : 'var(--counter)';
          const marcas = Math.min(24, Math.max(2, Math.round(Math.abs(p.inc) / 8)));
          return (
            <g key={p.anio} opacity={hover && !activa ? 0.35 : 1}>
              <line x1={cx} y1={BASE} x2={cx} y2={fin} stroke={color} strokeWidth={activa ? 2.4 : 1.45} />
              {Array.from({ length: marcas }, (_, j) => {
                const yy = BASE + (fin - BASE) * ((j + 1) / marcas);
                return <line key={j} x1={cx - (activa ? 7 : 5)} y1={yy} x2={cx + (activa ? 7 : 5)} y2={yy} stroke={color} strokeWidth={activa ? 1.5 : 0.9} />;
              })}
              <Label x={cx} y={fin + (sube ? -10 : 17)} size={activa ? 11 : 9.5} weight={800} color={color} anchor="middle">{conSigno(p.inc)}</Label>
              <Label x={cx} y={BASE + 18} size={8.7} color="var(--ink-4)" anchor="middle" mono>{String(p.anio).slice(2)}</Label>
              <rect
                className="fs-hit"
                x={cx - pasoX / 2}
                y={38}
                width={pasoX}
                height={H - 70}
                onMouseEnter={() => {
                  setHover(p.anio);
                  setTip({
                    vx: cx,
                    vy: fin,
                    title: `${p.anio} · ${conSigno(p.inc)} mM €`,
                    sub: `Variación ${modo === 'real' ? 'real' : 'nominal'} del saldo`,
                    rows: [
                      ['Variación anual', `${conSigno((p.inc / p.desde) * 100, 1)} %`, color],
                      ['Saldo anterior', `${Math.round(p.desde).toLocaleString('es-ES')} mM €`],
                      ['Saldo al cierre', `${Math.round(p.hasta).toLocaleString('es-ES')} mM €`],
                    ],
                  });
                }}
                onMouseLeave={() => { setHover(null); setTip(null); }}
              />
            </g>
          );
        })}
        <Label x={X0} y={H - 14} size={9} color="var(--ink-5)" mono>
          12—26 · CAMBIO ANUAL DEL SALDO · {modo === 'real' ? 'EUROS DE 2026' : 'EUROS CORRIENTES'}
        </Label>
      </ChartFrame>
    </Figure>
  );
}

function TuParte({ anio, irpf }) {
  const [horizonte, setHorizonte] = useState(3);
  const [modo, setModo] = useState('nominal');
  const d = SERIE.find(item => item.anio === anio);
  const deuda = modo === 'real' ? d.perCapitaReal : d.perCapita;
  const irpfComparable = modo === 'real' ? irpf * d.factor : irpf;
  const anios = irpfComparable > 0 ? deuda / irpfComparable : null;
  const previo = SERIE.find(item => item.anio === anio - 1);
  const UNIT = 500;
  const W = 880;
  const COLS = 24;
  const SIZE = 13;
  const GAP = 4;
  const bloquesDeuda = Math.round(deuda / UNIT);
  const bloquesIrpf = Math.round(irpfComparable / UNIT);
  /* El lienzo se ajusta a los bloques que hay: con una altura fija sobraba
     media figura en blanco debajo del IRPF. */
  const filasDeuda = Math.max(1, Math.ceil(bloquesDeuda / COLS));
  const filasIrpf = Math.max(1, Math.ceil(bloquesIrpf / COLS));
  const yIrpf = 26 + filasDeuda * (SIZE + GAP) + 34;
  const H = yIrpf + filasIrpf * (SIZE + GAP) + 10;
  /* El control antiguo ofrecía 10, 20 y 30 años: como la deuda por habitante
     se cubre mucho antes, las tres opciones daban exactamente el mismo dibujo
     y la misma cifra. El recorrido se ajusta ahora al caso: llega justo por
     encima de los años que de verdad hacen falta, de modo que cada paso pinta
     un trozo distinto del bloque. */
  const topeAnios = Math.max(4, Math.min(60, Math.ceil(anios ?? 10) + 2));
  const anioSel = Math.min(horizonte, topeAnios);
  const cubierto = Math.min(deuda, irpfComparable * anioSel);
  const cubiertos = Math.min(bloquesDeuda, Math.round(cubierto / UNIT));
  const restante = Math.max(0, deuda - irpfComparable * anioSel);
  const parteCubierta = deuda > 0 ? cubierto / deuda : 0;
  const cell = (i, x0, y0) => [x0 + (i % COLS) * (SIZE + GAP), y0 + Math.floor(i / COLS) * (SIZE + GAP)];

  return (
    <Figure
      id="30"
      title={anios ? `La deuda por habitante equivale a ${dec(anios)} años de tu IRPF anual` : 'Sin IRPF positivo no existe una equivalencia anual comparable'}
      sub={`${anio}${anio === 2026 ? ' · estimación' : ''} · ${modo === 'real' ? 'euros constantes de 2026' : 'euros corrientes'} · deuda por habitante ${eur(deuda)} frente a IRPF anual ${eur(irpfComparable)}`}
      legend={`Un bloque = ${eur(UNIT)} · arriba, deuda por habitante; abajo, tu IRPF de un año · los bloques verdes son la parte que cubrirían los ${anioSel} ${anioSel === 1 ? 'año' : 'años'} elegidos abajo`}
      source={<FuenteDeuda ipc poblacion />}
      note={`Es una comparación de escala, no una asignación individual de deuda ni una previsión de amortización. La deuda se sostiene y refinancia con el conjunto de ingresos y activos de la economía; el IRPF de una persona es sólo una referencia cuantitativa.${anio === 2026 ? ' Para 2026, la deuda y la población proceden de la estimación incorporada al modelo.' : ''}`}
      summary={`Deuda por habitante ${eur(deuda)}; IRPF anual comparable ${eur(irpfComparable)}.`}
    >
      <div className="fs-chart-controls">
        <span className="fs-seg" aria-label="Importes nominales o reales">
          <button type="button" aria-pressed={modo === 'nominal'} onClick={() => setModo('nominal')}>Nominal</button>
          <button type="button" aria-pressed={modo === 'real'} onClick={() => setModo('real')}>Real · € 2026</button>
        </span>
      </div>

      <div className="fs-readout fs-readout-wide">
        <span><span className="fs-readout-k">Deuda por habitante</span><span className="fs-readout-v">{eur(deuda)}</span></span>
        <span><span className="fs-readout-k">IRPF anual comparable</span><span className="fs-readout-v fs-signal">{eur(irpfComparable)}</span></span>
        <span><span className="fs-readout-k">Años equivalentes</span><span className="fs-readout-v">{anios ? dec(anios) : '—'}</span></span>
        <span><span className="fs-readout-k">Sobre el PIB</span><span className="fs-readout-v">{pct(d.pctPIB)}</span></span>
        <span><span className="fs-readout-k">Población</span><span className="fs-readout-v">{dec(d.poblacion, 2)} M</span></span>
        <span><span className="fs-readout-k">Cambio anual por habitante</span><span className="fs-readout-v">{previo ? `${conSigno(deuda - (modo === 'real' ? previo.perCapitaReal : previo.perCapita))} €` : '—'}</span></span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} scroll label="Deuda por habitante frente a IRPF anual">
        <Label x={0} y={14} size={10} color="var(--ink-3)" mono>DEUDA POR HABITANTE · {eur(deuda)}</Label>
        {Array.from({ length: bloquesDeuda }, (_, i) => {
          const [cx, cy] = cell(i, 0, 26);
          return <rect key={i} x={round(cx)} y={round(cy)} width={SIZE} height={SIZE} fill={i < cubiertos ? 'var(--signal)' : 'var(--ink-6)'} opacity={i < cubiertos ? 1 : 0.85} />;
        })}
        {(() => {
          const y0 = yIrpf;
          return (
            <g>
              <Label x={0} y={y0 - 12} size={10} color="var(--ink-3)" mono>IRPF DE UN AÑO · {eur(irpfComparable)}</Label>
              {Array.from({ length: bloquesIrpf }, (_, i) => {
                const [cx, cy] = cell(i, 0, y0);
                return <rect key={i} x={round(cx)} y={round(cy)} width={SIZE} height={SIZE} fill="var(--counter)" />;
              })}
            </g>
          );
        })()}
      </ChartFrame>

      <div style={{ marginTop: 20 }}>
        <span className="fs-label">
          Comparación hipotética: {anioSel} {anioSel === 1 ? 'año' : 'años'} de IRPF íntegro
        </span>
        <div className="fs-scrub">
          <label className="fs-sr" htmlFor="deuda-horizonte">
            Años de IRPF íntegro con los que comparar la deuda por habitante
          </label>
          <input
            id="deuda-horizonte"
            type="range"
            min="1"
            max={topeAnios}
            step="1"
            value={anioSel}
            onChange={e => setHorizonte(+e.target.value)}
            aria-valuetext={`${anioSel} años de IRPF íntegro`}
          />
          <div className="fs-scrub-ticks">
            <span>1 año</span>
            <span>{anios ? `${dec(anios)} años · lo cubren entero` : '—'}</span>
            <span>{topeAnios} años</span>
          </div>
        </div>
        <div className="fs-readout" style={{ marginTop: 6 }}>
          <span>
            <span className="fs-readout-k">Cubriría</span>
            <span className="fs-readout-v fs-signal">{eur(cubierto)}</span>
          </span>
          <span>
            <span className="fs-readout-k">De la deuda por habitante</span>
            <span className="fs-readout-v">{pct(parteCubierta * 100, 0)}</span>
          </span>
          <span>
            <span className="fs-readout-k">Quedaría por comparar</span>
            <span className="fs-readout-v">{eur(restante)}</span>
          </span>
        </div>
        <p className="fs-note" style={{ marginTop: 10, maxWidth: '70ch' }}>
          {restante > 0
            ? `Los bloques verdes de la fila de arriba son la parte que quedaría cubierta: ${anioSel} ${anioSel === 1 ? 'año entero' : 'años enteros'} de tu IRPF ${anioSel === 1 ? 'llega' : 'llegan'} hasta ahí. Harían falta ${anios ? dec(anios) : '—'} años para llegar al final.`
            : `Con ${anioSel} ${anioSel === 1 ? 'año' : 'años'} ya está cubierta entera: bastaban ${anios ? dec(anios) : '—'}. Sigue siendo una comparación de escala, no una deuda que te corresponda pagar.`}
        </p>
      </div>
    </Figure>
  );
}
