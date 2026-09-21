import { useId, useMemo, useState } from 'react';
import { useNarrow } from '../hooks/useNarrow';
import { useFiscal } from '../state/fiscalContext';
import { GASTO_COFOG } from '../engine/irpf';
import Figure from '../figures/Figure';
import Puente from '../figures/Puente';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { round } from '../figures/scale';
import { dec, eur, pct } from '../utils/format';

const W = 880;
const TOP = 40;
const FH = 640;          // altura del caudal completo
const LG = 5;            // hueco entre partidas
const GG = 18;           // hueco extra entre grupos
const SG = 20;           // hueco entre los dos afluentes

const XS0 = 4, XS1 = 18;        // afluentes: cotizaciones e IRPF
const XT0 = 152, XT1 = 166;     // el tronco
const XG0 = 300, XG1 = 314;     // los tres destinos grandes
const XP0 = 440, XP1 = 454;     // las dieciséis partidas
const XL = 470;                 // rótulos de las partidas
const DIAS_LABORABLES = 220;    // jornadas de un año en España, descontando fines de semana, festivos y vacaciones
const H = TOP + FH + 34;

/** Una cinta de Sankey: dos bordes en curva entre dos tramos verticales. */
function cinta(x0, a0, a1, x1, b0, b1) {
  const m = (x0 + x1) / 2;
  return (
    `M${round(x0)} ${round(a0)} C${round(m)} ${round(a0)} ${round(m)} ${round(b0)} ${round(x1)} ${round(b0)}` +
    ` L${round(x1)} ${round(b1)} C${round(m)} ${round(b1)} ${round(m)} ${round(a1)} ${round(x0)} ${round(a1)} Z`
  );
}

/**
 * FIG. 21 — EL RÍO DE LOS EUROS.
 *
 * La pregunta que el capítulo de la cuña deja abierta: los euros que no llegan
 * a tu cuenta, ¿dónde acaban? Dos afluentes —cotizaciones e IRPF— desembocan en
 * una caja común y esa caja se abre en el reparto real del gasto público, con
 * *tus* euros como unidad.
 *
 * La honestidad de la figura está en la nota: el presupuesto no está afectado.
 * Nadie marca tu IRPF con un destino. Lo que se dibuja es el reparto que le
 * correspondería a tu aportación si se repartiera como se reparte el gasto.
 */
/** El capítulo: la figura del río con su cabecera y su margen. */
export default function Destino() {
  return (
    <section id="destino" className="fs-chapter" aria-labelledby="destino-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">07</span>

        <div className="fs-chapter-head">
          <span className="fs-stamp">07 / 09 · A dónde va</span>
          <h2 id="destino-t" className="fs-title">
            A dónde va
            <br />
            lo que no ves
          </h2>
          <p className="fs-kicker">
            El capítulo 05 midió el tamaño del hueco entre lo que cuesta tu puesto y lo que
            cobras. Queda la pregunta incómoda: ese dinero no desaparece, va a alguna parte. Esta
            es esa parte, con tus euros y con tus jornadas de trabajo como unidad.
          </p>
        </div>

        <RioDeLosEuros />

        <Puente rotulo="Lo que todavía no se ha pagado">
          Este reparto sólo cuenta el dinero que existe: lo que se recauda un año y se gasta ese
          mismo año. Falta la otra mitad de la contabilidad — los ejercicios en que el gasto fue
          mayor que el ingreso y la diferencia se financió pidiéndola prestada.
        </Puente>
      </div>
    </section>
  );
}

function RioDeLosEuros() {
  const { bruto, anio, nomina, pagas } = useFiscal();
  const estrecho = useNarrow();
  const [unidad, setUnidad] = useState('anual');
  const grad = useId().replace(/:/g, '');
  const [activa, setActiva] = useState(null);
  const [tip, setTip] = useState(null);

  const cuna = Math.max(0, nomina.costeLab - nomina.salarioNeto);
  const cot = nomina.cotEmp + nomina.cotTra;
  const irpf = nomina.irpfFinal;
  const totalCofog = GASTO_COFOG.total;

  /* ── la geometría del río ────────────────────────────────────────────── */
  const { partidas, grupos, yCorte } = useMemo(() => {
    const planas = GASTO_COFOG.grupos.flatMap(g =>
      g.partidas.map(p => ({ ...p, grupo: g.key }))
    );
    const nGr = GASTO_COFOG.grupos.length;
    const S = FH - (planas.length - nGr) * LG - (nGr - 1) * GG;

    const hojas = planas.reduce((acc, p) => {
      const previa = acc[acc.length - 1];
      const inicio = previa ? previa.y1 + (p.grupo === previa.grupo ? LG : GG) : TOP;
      const h = (p.valor / totalCofog) * S;
      acc.push({ ...p, y0: inicio, y1: inicio + h, cy: inicio + h / 2, parte: p.valor / totalCofog });
      return acc;
    }, []);

    const gr = GASTO_COFOG.grupos.map(g => {
      const suyas = hojas.filter(h => h.grupo === g.key);
      const valor = suyas.reduce((a, h) => a + h.valor, 0);
      return {
        ...g,
        valor,
        parte: valor / totalCofog,
        y0: suyas[0].y0,
        y1: suyas[suyas.length - 1].y1,
        hojas: suyas,
      };
    });

    return { partidas: hojas, grupos: gr, yCorte: TOP + (cot / Math.max(cuna, 1)) * FH };
  }, [cot, cuna, totalCofog]);

  /* Los rótulos se colocan en la altura de su partida y luego se separan: con
     dieciséis filas y caudales tan desiguales, si no, se pisan. */
  const rotulos = useMemo(() => {
    const MIN = 21;
    const out = [];
    for (const p of partidas) {
      const previo = out[out.length - 1];
      const y = previo ? Math.max(p.cy, previo.y + MIN) : Math.max(p.cy, TOP + 8);
      out.push({ key: p.key, y });
    }
    // si se han desbordado por abajo, se empujan hacia arriba
    const exceso = out[out.length - 1].y - (TOP + FH);
    if (exceso > 0) {
      for (let i = out.length - 1; i >= 0; i--) {
        const sig = out[i + 1];
        out[i].y = sig ? Math.min(out[i].y, sig.y - MIN) : out[i].y - exceso;
      }
    }
    return Object.fromEntries(out.map(o => [o.key, o.y]));
  }, [partidas]);

  const euros = parte => cuna * parte;

  /* Tres unidades para la misma cifra. Los euros al año dicen el tamaño; los
     euros al mes lo hacen comparable con una nómina; los días de trabajo lo
     sacan del dinero y lo ponen en tiempo, que es lo que de verdad cuesta. */
  const UNIDADES = {
    anual: { k: 'Al año', f: parte => eur(euros(parte)) },
    mensual: { k: 'Al mes', f: parte => eur(euros(parte) / 12) },
    dias: {
      k: 'En días de trabajo',
      f: parte => {
        const d = parte * (cuna / Math.max(nomina.costeLab, 1)) * DIAS_LABORABLES;
        return d >= 1 ? `${dec(d, 1)} d` : `${dec(d * 8, 1)} h`;
      },
    },
  };
  const medir = UNIDADES[unidad].f;
  const diasTotales = (cuna / Math.max(nomina.costeLab, 1)) * DIAS_LABORABLES;

  const mostrar = (p, vy) =>
    setTip({
      vx: XP1,
      vy,
      title: eur(euros(p.parte)),
      sub: p.label,
      rows: [
        ['De tu aportación', pct(p.parte * 100), 'var(--signal)'],
        ['Al mes', eur(euros(p.parte) / 12)],
        ['Días de tu trabajo', UNIDADES.dias.f(p.parte)],
        ['Gasto real ' + GASTO_COFOG.anio, `${Math.round(p.valor / 1000)} mil M€`],
      ],
    });

  const social = grupos[0];

  return (
    <Figure
      id="22"
      title={`De los ${eur(cuna)} que tu puesto aporta al sistema, ${eur(euros(social.parte))} vuelven como protección social`}
      sub={`${anio} · tu cuña fiscal repartida como se reparte el gasto público real · clasificación funcional COFOG de ${GASTO_COFOG.anio}`}
      legend={`Dos afluentes —cotizaciones e IRPF— desembocan en una caja común · el ancho de cada cinta es su parte del gasto · los días se cuentan sobre ${DIAS_LABORABLES} jornadas laborables`}
      source={`Fuente · ${GASTO_COFOG.fuente}`}
      note="El presupuesto español no está afectado: ningún impuesto concreto financia una función concreta, y las cotizaciones sostienen sobre todo las prestaciones contributivas. Esta figura no dice a dónde fue tu dinero, sino cómo se repartiría tu aportación si siguiera el reparto del gasto público total."
      summary={partidas
        .map(p => `${p.label}: ${eur(euros(p.parte))} (${pct(p.parte * 100)})`)
        .join('. ')}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <span className="fs-seg">
          {Object.entries(UNIDADES).map(([k, u]) => (
            <button key={k} type="button" aria-pressed={unidad === k} onClick={() => setUnidad(k)}>
              {u.k}
            </button>
          ))}
        </span>
        <span className="fs-note" style={{ margin: 0 }}>
          {unidad === 'dias'
            ? `De tus ${DIAS_LABORABLES} jornadas anuales, ${dec(diasTotales, 0)} las trabajas para el sistema`
            : 'La misma cifra, en tres unidades'}
        </span>
      </div>

      <div className="fs-readout" style={{ marginBottom: 18 }}>
        {grupos.map(g => (
          <span key={g.key}>
            <span className="fs-readout-k">{g.label}</span>
            <span className="fs-readout-v" style={{ color: g.key === 'social' ? 'var(--signal)' : undefined }}>
              {medir(g.parte)} · {pct(g.parte * 100, 0)}
            </span>
          </span>
        ))}
      </div>

      {estrecho ? (
        <div className="fs-rio">
          <p className="fs-rio-origen">
            <span style={{ color: 'var(--signal)' }}>Cotizaciones {eur(cot)}</span>
            {' + '}
            <span style={{ color: 'var(--counter)' }}>IRPF {eur(irpf)}</span>
            {' = '}
            <strong>{eur(cuna)}</strong> a la caja común
          </p>
          {grupos.map(g => (
            <section key={g.key} className="fs-rio-grupo">
              <header className="fs-rio-head">
                <h4>{g.label}</h4>
                <span className={g.key === 'social' ? 'fs-signal' : undefined}>
                  {medir(g.parte)} · {pct(g.parte * 100, 0)}
                </span>
              </header>
              <ol className="fs-rio-lista">
                {g.hojas.map(p => (
                  <li key={p.key}>
                    <span className="fs-rio-k">{p.label}</span>
                    <span className="fs-rio-v">{medir(p.parte)}</span>
                    <span
                      className="fs-rio-bar"
                      style={{ '--w': `${(p.parte / partidas[0].parte) * 100}%` }}
                      aria-hidden="true"
                    />
                    <span className="fs-rio-p">{pct(p.parte * 100)}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} label="El destino de tu aportación">
        <defs>
          {[
            ['cot', 'var(--signal)', 'var(--ink-4)'],
            ['irpf', 'var(--counter)', 'var(--ink-4)'],
            ['tronco', 'var(--ink-4)', 'var(--ink-5)'],
            ['hoja', 'var(--ink-5)', 'var(--ink-3)'],
            ['viva', 'var(--signal)', 'var(--signal)'],
          ].map(([k, a, b]) => (
            <linearGradient key={k} id={`${grad}-${k}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={a} />
              <stop offset="100%" stopColor={b} />
            </linearGradient>
          ))}
        </defs>
        {/* ── los dos afluentes ──────────────────────────────────────────── */}
        {[
          { key: 'cot', label: 'COTIZACIONES', valor: cot, color: 'var(--signal)', y0: TOP },
          { key: 'irpf', label: 'IRPF', valor: irpf, color: 'var(--counter)', y0: 0 },
        ].map((f, i) => {
          const hCot = ((cot / Math.max(cuna, 1)) * (FH - SG));
          const hIrpf = ((irpf / Math.max(cuna, 1)) * (FH - SG));
          const y0 = i === 0 ? TOP : TOP + hCot + SG;
          const y1 = i === 0 ? TOP + hCot : TOP + hCot + SG + hIrpf;
          const t0 = i === 0 ? TOP : yCorte;
          const t1 = i === 0 ? yCorte : TOP + FH;
          return (
            <g key={f.key}>
              <path
                d={cinta(XS1, y0, y1, XT0, t0, t1)}
                fill={`url(#${grad}-${f.key})`}
                opacity={activa ? 0.2 : 0.4}
              />
              <rect x={XS0} y={round(y0)} width={XS1 - XS0} height={round(y1 - y0)} fill={f.color} />
              <Label x={XS0} y={round(y0) - 8} size={9.5} weight={700} color={f.color} mono>
                {f.label} · {eur(f.valor)}
              </Label>
            </g>
          );
        })}

        {/* ── el tronco ──────────────────────────────────────────────────── */}
        <rect x={XT0} y={TOP} width={XT1 - XT0} height={FH} fill="var(--ink)" />
        <Label x={XS0} y={TOP - 26} size={9.5} weight={700} color="var(--ink)" mono>
          LA CAJA COMÚN · {eur(cuna)}
        </Label>

        {/* ── tronco → los tres destinos grandes ─────────────────────────── */}
        {grupos.map((g, i) => {
          const prev = grupos[i - 1];
          const next = grupos[i + 1];
          const a0 = prev ? (prev.y1 + g.y0) / 2 : TOP;
          const a1 = next ? (g.y1 + next.y0) / 2 : TOP + FH;
          const dim = activa && !g.hojas.some(h => h.key === activa);
          return (
            <g key={g.key}>
              <path
                d={cinta(XT1, a0, a1, XG0, g.y0, g.y1)}
                fill={`url(#${grad}-${dim ? 'tronco' : activa ? 'viva' : 'tronco'})`}
                opacity={dim ? 0.12 : activa ? 0.3 : 0.42}
              />
              <rect x={XG0} y={round(g.y0)} width={XG1 - XG0} height={round(g.y1 - g.y0)} fill="var(--ink-3)" opacity={dim ? 0.4 : 1} />
              <g transform={`translate(${XG0 - 8} ${round((g.y0 + g.y1) / 2)}) rotate(-90)`}>
                <Label x={0} y={0} size={9.5} weight={700} color="var(--ink-3)" anchor="middle" mono>
                  {g.label.toUpperCase()}
                </Label>
              </g>
              <Label
                x={XG0}
                y={round(g.y0) - 6}
                size={11.5}
                weight={800}
                color={g.key === 'social' ? 'var(--signal)' : 'var(--ink)'}
              >
                {medir(g.parte)}
              </Label>
            </g>
          );
        })}

        {/* ── cada destino grande → sus partidas ─────────────────────────── */}
        {grupos.map(g =>
          g.hojas.map((p, i) => {
            const prev = g.hojas[i - 1];
            const next = g.hojas[i + 1];
            const a0 = prev ? (prev.y1 + p.y0) / 2 : g.y0;
            const a1 = next ? (p.y1 + next.y0) / 2 : g.y1;
            const on = activa === p.key;
            const dim = activa && !on;
            const yR = rotulos[p.key];
            return (
              <g
                key={p.key}
                onMouseEnter={() => { setActiva(p.key); mostrar(p, p.cy); }}
                onMouseLeave={() => { setActiva(null); setTip(null); }}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={cinta(XG1, a0, a1, XP0, p.y0, p.y1)}
                  fill={on ? `url(#${grad}-viva)` : `url(#${grad}-hoja)`}
                  opacity={on ? 0.62 : dim ? 0.1 : 0.38}
                />
                <rect
                  x={XP0}
                  y={round(p.y0)}
                  width={XP1 - XP0}
                  height={round(Math.max(1.2, p.y1 - p.y0))}
                  fill={on ? 'var(--signal)' : 'var(--ink)'}
                  opacity={dim ? 0.35 : 1}
                />

                {/* guía del caudal a su rótulo */}
                <line
                  x1={XP1 + 2}
                  y1={round(p.cy)}
                  x2={XL - 6}
                  y2={round(yR - 3.5)}
                  stroke={on ? 'var(--signal)' : 'var(--ink-6)'}
                  strokeWidth={0.6}
                  strokeDasharray="1.5 2"
                />

                <Label x={XL} y={round(yR)} size={10} weight={on ? 800 : 500} color={on ? 'var(--signal)' : 'var(--ink-2)'}>
                  {p.label}
                </Label>
                {/* una barra fina bajo cada nombre: la columna deja de ser una
                    lista y vuelve a ser una medida */}
                <rect
                  x={XL}
                  y={round(yR) + 4}
                  width={round((p.parte / partidas[0].parte) * 150)}
                  height={2}
                  fill={on ? 'var(--signal)' : 'var(--ink-6)'}
                />
                <text
                  x={W - 52}
                  y={round(yR)}
                  fontSize={11}
                  fontWeight={on ? 800 : 700}
                  textAnchor="end"
                  fill={on ? 'var(--signal)' : 'var(--ink)'}
                  className="num"
                >
                  {medir(p.parte)}
                </text>
                <text
                  x={W - 2}
                  y={round(yR)}
                  fontSize={9.5}
                  textAnchor="end"
                  fill="var(--ink-4)"
                  className="fs-t-stamp"
                >
                  {pct(p.parte * 100)}
                </text>

                <rect
                  className="fs-hit"
                  x={XG1}
                  y={round(yR) - 11}
                  width={W - XG1}
                  height={21}
                >
                  <title>{`${p.label} — ${eur(euros(p.parte))} de tu aportación, ${pct(p.parte * 100)} del gasto público`}</title>
                </rect>
              </g>
            );
          })
        )}

        <Label x={XS0} y={TOP + FH + 24} size={9} color="var(--ink-5)" mono>
          TU APORTACIÓN ANUAL · {eur(cuna)} · {eur(cuna / pagas)} POR PAGA · {pct((cuna / Math.max(nomina.costeLab, 1)) * 100)} DE LO QUE CUESTA TU PUESTO
        </Label>
      </ChartFrame>
      )}

      <p className="fs-note" style={{ marginTop: 16, maxWidth: '72ch' }}>
        Tu sueldo bruto de <strong>{eur(bruto)}</strong> le cuesta a tu empresa{' '}
        <strong>{eur(nomina.costeLab)}</strong>, y <strong>{eur(cuna)}</strong> de esa cifra no
        llegan a tu cuenta. Repartidos como se reparte el gasto público, la partida más grande con
        diferencia son las <strong>pensiones de jubilación</strong>:{' '}
        <strong>{eur(euros(partidas[0].parte))}</strong> al año, {eur(euros(partidas[0].parte) / 12)} al
        mes. La sanidad se lleva {eur(euros(partidas.find(p => p.key === 'salud').parte))} y la
        educación {eur(euros(partidas.find(p => p.key === 'educacion').parte))}.
      </p>
    </Figure>
  );
}
