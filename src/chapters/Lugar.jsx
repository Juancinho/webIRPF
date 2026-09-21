import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import {
  ANIOS,
  DEUDA_ESPANA,
  DISTRIBUCION_SALARIAL,
  ULTIMO_ANIO_SALARIAL_OFICIAL,
  CRECIMIENTO_PROYECCION_SALARIAL,
  inflacionAcumulada,
  percentilDe,
} from '../engine/irpf';
import Figure from '../figures/Figure';
import { CurvaDistribucion, Percentiles, EvolucionDistribucion } from './Distribucion';
import ZoomSvg from '../figures/ZoomSvg';
import { Label, TickStrip, YouMark } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { dec, eur, pct } from '../utils/format';

/**
 * 06 · TU LUGAR Y TU PARTE
 * FIG. 13 a hundred workers · FIG. 14 the median, year by year ·
 * FIG. 15 your share of the public debt.
 */
export default function Lugar() {
  const { bruto, anio, percentil, nomina } = useFiscal();
  const dist = DISTRIBUCION_SALARIAL[anio];

  return (
    <section id="lugar" className="fs-chapter" aria-labelledby="lugar-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">06</span>

        <div className="fs-spread">
          <aside className="fs-rail">
            <div className="fs-rail-item">
              <span className="fs-stamp">Nota 04</span>
              <p className="fs-note">
                El percentil no mide riqueza: mide salario bruto anual entre los asalariados que
                cubre la Encuesta Anual de Estructura Salarial del INE.
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Progresividad en frío</span>
              <p className="fs-note">
                Si tu salario sube exactamente con el IPC, tu poder adquisitivo no mejora — y aun
                así puedes caer en la escala relativa si el resto sube más.
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Fuente</span>
              <p className="fs-note">
                INE · EAES, tabla 28191, ambos sexos, total nacional.
                {anio > ULTIMO_ANIO_SALARIAL_OFICIAL && (
                  <>
                    {' '}
                    Los años posteriores a {ULTIMO_ANIO_SALARIAL_OFICIAL} son proyección propia
                    (+{pct(CRECIMIENTO_PROYECCION_SALARIAL * 100, 1)} anual), no dato publicado.
                  </>
                )}
              </p>
              <p className="fs-source">
                <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=28191" target="_blank" rel="noreferrer noopener">
                  INE — Tabla 28191
                </a>
              </p>
            </div>
          </aside>

          <div className="fs-field">
            <div className="fs-chapter-head">
              <span className="fs-stamp">06 / 07 · Tu lugar y tu parte</span>
              <h2 id="lugar-t" className="fs-title">
                Dónde te coloca
                <br />
                el sistema
              </h2>
              <p className="fs-kicker">
                Hasta aquí, tu dinero. Queda situarte: entre los demás asalariados y frente a la
                deuda que el Estado ya ha contraído en tu nombre.
              </p>
            </div>

            <p className="fs-statement" style={{ maxWidth: '10ch' }}>{Math.round(percentil)}</p>
            <p className="fs-body" style={{ marginTop: 12, marginBottom: 36 }}>
              Es tu percentil en {anio}: ganas más que {Math.round(percentil)} de cada 100
              asalariados. La mediana está en <strong>{eur(dist.p50)}</strong> — la mitad de los
              asalariados cobra menos que eso.
            </p>

            <CurvaDistribucion />

            <Percentiles />

            <CienTrabajadores bruto={bruto} anio={anio} dist={dist} percentil={percentil} />

            <EvolucionDistribucion />

            {anio > 2012 && <Escenario bruto={bruto} anio={anio} />}

            <Deuda anio={anio} irpf={nomina.irpfFinal} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Display-only inverse of the engine's published percentile curve. */
function salarioEnPercentil(p, dist) {
  const pts = [
    [10, dist.p10],
    [25, dist.p25],
    [50, dist.p50],
    [75, dist.p75],
    [90, dist.p90],
  ];
  if (p <= 10) return dist.p10 * Math.pow(p / 10, 1 / 0.7);
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, s0] = pts[i];
    const [p1, s1] = pts[i + 1];
    if (p >= p0 && p <= p1) return s0 + ((p - p0) / (p1 - p0)) * (s1 - s0);
  }
  const q = Math.min(p, 99.4);
  return dist.p90 * (1 - Math.log(Math.max(1e-3, 1 - (q - 90) / 10)));
}

/* ── FIG. 13 ─────────────────────────────────────────────────────────────── */
function CienTrabajadores({ bruto, anio, dist, percentil }) {
  const W = 880;
  const H = 300;
  const X0 = 20;
  const X1 = W - 130;
  const BASE = 236;

  const marcas = useMemo(
    () => Array.from({ length: 100 }, (_, i) => ({ p: i + 1, s: salarioEnPercentil(i + 1, dist) })),
    [dist]
  );

  const hi = Math.max(...marcas.map(m => m.s));
  const x = linear([0, 100], [X0, X1]);
  const y = linear([0, hi], [BASE, 30]);

  const hitos = [
    ['P10', 10, dist.p10],
    ['P25', 25, dist.p25],
    ['P50', 50, dist.p50],
    ['P75', 75, dist.p75],
    ['P90', 90, dist.p90],
  ];

  return (
    <Figure
      id="21"
      title="Cien asalariados de España, puestos en fila por salario"
      sub={`${anio} · una marca = un trabajador de cada cien · altura = su salario bruto anual`}
      legend="Una marca = un asalariado de cada cien · las líneas verticales son los percentiles publicados por el INE"
      source="Fuente · INE · EAES tabla 28191"
      note={
        anio > ULTIMO_ANIO_SALARIAL_OFICIAL
          ? `Los percentiles de ${anio} son proyección propia a partir de ${ULTIMO_ANIO_SALARIAL_OFICIAL}; el INE tampoco publica P95 ni P99, así que la cola se dibuja como extrapolación suave.`
          : 'El INE no publica P95 ni P99 en esta tabla: la cola alta se dibuja como una extrapolación suave, no como dato censal.'
      }
      summary={hitos.map(([l, , v]) => `${l}: ${eur(v)}`).join('; ')}
    >
      <ZoomSvg viewBox={`0 0 ${W} ${H}`}>
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke="var(--rule)" strokeWidth={0.8} />

        {marcas.map(m => {
          const mio = Math.abs(m.p - Math.round(percentil)) < 0.5;
          return (
            <line
              key={m.p}
              x1={round(x(m.p))}
              y1={BASE}
              x2={round(x(m.p))}
              y2={round(y(m.s))}
              stroke={mio ? 'var(--signal)' : 'var(--ink-3)'}
              strokeWidth={mio ? 2 : 1}
              opacity={mio ? 1 : 0.62}
            >
              <title>{`Percentil ${m.p} — ${eur(m.s)}`}</title>
            </line>
          );
        })}

        {hitos.map(([label, p, v]) => (
          <g key={label}>
            <line x1={round(x(p))} y1={22} x2={round(x(p))} y2={BASE + 6} stroke="var(--ink-6)" strokeWidth={0.7} strokeDasharray="2 4" />
            <Label x={x(p)} y={18} size={9} color="var(--ink-4)" anchor="middle" mono>
              {label}
            </Label>
            <Label x={x(p)} y={BASE + 20} size={9.5} color="var(--ink-4)" anchor="middle">
              {eur(v)}
            </Label>
          </g>
        ))}

        <YouMark
        x={x(Math.min(99.5, Math.max(1, percentil)))}
        y={Math.max(48, y(Math.min(bruto, hi)) - 4)}
        height={26}
        label={`TÚ · ${eur(bruto)}`}
      />

        <Label x={X1 + 10} y={y(hi) + 4} size={9.5} color="var(--ink-4)" mono>
          {eur(hi)}
        </Label>
        <Label x={X1 + 10} y={BASE + 4} size={9.5} color="var(--ink-4)" mono>
          0 €
        </Label>
        <Label x={X0} y={H - 6} size={9} color="var(--ink-5)" mono>
          MENOS SALARIO
        </Label>
        <Label x={X1} y={H - 6} size={9} color="var(--ink-5)" anchor="end" mono>
          MÁS SALARIO →
        </Label>
      </ZoomSvg>
    </Figure>
  );
}

/* ── the inflation scenario, preserved from the original distribution view ── */
function Escenario({ bruto, anio }) {
  const destino = anio;
  const [origenSel, setOrigen] = useState(2018);
  const origen = Math.min(origenSel, destino - 1);

  const e = useMemo(() => {
    const factor = inflacionAcumulada(origen, destino);
    const equivalente = bruto * factor;
    return {
      factor,
      equivalente,
      pOrigen: percentilDe(bruto, origen),
      pDestino: percentilDe(equivalente, destino),
    };
  }, [origen, destino, bruto]);

  const salto = e.pDestino - e.pOrigen;

  return (
    <div style={{ margin: '0 0 clamp(40px, 6vh, 72px)' }}>
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">En {origen}</span>
          <span className="fs-readout-v">Percentil {Math.round(e.pOrigen)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Mismo sueldo actualizado al IPC en {destino}</span>
          <span className="fs-readout-v">{eur(e.equivalente)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Percentil resultante</span>
          <span className="fs-readout-v fs-signal">
            {Math.round(e.pDestino)} <span style={{ fontSize: 13, fontWeight: 600 }}>({salto >= 0 ? '+' : '−'}{dec(Math.abs(salto))})</span>
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label className="fs-label" htmlFor="esc-origen">
          Año de partida
        </label>
        <select id="esc-origen" className="fs-select" value={origen} onChange={ev => setOrigen(+ev.target.value)}>
          {ANIOS.filter(a => a < destino).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <p className="fs-note" style={{ marginTop: 12, maxWidth: '68ch' }}>
        {salto < -3
          ? `Aunque tu sueldo hubiera seguido exactamente al IPC desde ${origen}, hoy ocuparías una posición relativa más baja: el resto de salarios ha crecido por encima de la inflación.`
          : salto > 3
            ? `Siguiendo sólo al IPC desde ${origen} tu posición relativa habría mejorado: el conjunto de los salarios creció por debajo de la inflación.`
            : `Siguiendo el IPC desde ${origen}, tu posición relativa se mantendría prácticamente igual.`}
      </p>
    </div>
  );
}

/* ── FIG. 15 ─────────────────────────────────────────────────────────────── */
function Deuda({ anio, irpf }) {
  const [horizonte, setHorizonte] = useState(20);
  const d = DEUDA_ESPANA[anio];
  const anios = irpf > 0 ? d.perCapita / irpf : Infinity;

  const W = 860;
  const H = 150;

  const serie = ANIOS.map(a => DEUDA_ESPANA[a]);
  const hi = Math.max(...serie.map(s => s.perCapita));
  const x = linear([2012, 2026], [24, W - 150]);
  const y = linear([0, hi], [110, 24]);

  const restante = Math.max(0, d.perCapita - irpf * horizonte);

  return (
    <Figure
      id="23"
      title={`Tu parte de la deuda pública son ${eur(d.perCapita)}`}
      sub={`${anio} · deuda per cápita · ${Number.isFinite(anios) ? `equivale a ${dec(anios)} años de tu IRPF íntegro` : 'sin IRPF a este nivel de renta'}`}
      legend={`Una marca = un año de tu IRPF completo (${eur(irpf)})`}
      source="Fuente · Banco de España (PDE) · INE"
      note="La deuda no se amortiza con el IRPF de una sola persona: esta lectura es una escala de magnitud, no una previsión."
      summary={`Deuda per cápita ${eur(d.perCapita)}, ${pct(d.pctPIB)} del PIB en ${anio}.`}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Deuda per cápita</span>
          <span className="fs-readout-v">{eur(d.perCapita)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Sobre el PIB</span>
          <span className="fs-readout-v">{pct(d.pctPIB)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Total</span>
          <span className="fs-readout-v">{d.totalMM.toLocaleString('es-ES')} mM €</span>
        </span>
      </div>

      <ZoomSvg viewBox={`0 0 ${W} ${H}`}>
        <line x1={24} y1={110} x2={W - 150} y2={110} stroke="var(--rule)" strokeWidth={0.8} />
        {ANIOS.map(a => (
          <g key={a}>
            <line
              x1={round(x(a))}
              y1={110}
              x2={round(x(a))}
              y2={round(y(DEUDA_ESPANA[a].perCapita))}
              stroke={a === anio ? 'var(--signal)' : 'var(--ink-4)'}
              strokeWidth={a === anio ? 2.4 : 1.4}
              opacity={a === anio ? 1 : 0.7}
            >
              <title>{`${a} — ${eur(DEUDA_ESPANA[a].perCapita)} por habitante, ${pct(DEUDA_ESPANA[a].pctPIB)} del PIB`}</title>
            </line>
          </g>
        ))}
        <Label x={W - 142} y={y(DEUDA_ESPANA[2026].perCapita) + 4} size={10} weight={700} color="var(--ink-2)">
          {eur(DEUDA_ESPANA[2026].perCapita)}
        </Label>
        <Label x={W - 142} y={y(DEUDA_ESPANA[2026].perCapita) + 18} size={9} color="var(--ink-4)" mono>
          POR HABITANTE
        </Label>
        {[2012, 2020, 2026].map(a => (
          <Label key={a} x={x(a)} y={130} size={9.5} color="var(--ink-4)" anchor="middle" mono>
            {a}
          </Label>
        ))}
      </ZoomSvg>

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
            Pagarías {eur(Math.min(d.perCapita, irpf * horizonte))} y te quedarían{' '}
            <strong>{eur(restante)}</strong> {restante === 0 ? '— la habrías cubierto' : 'por cubrir'}.
          </span>
        </div>
        <ZoomSvg viewBox="0 0 860 40" style={{ marginTop: 10 }}>
          <TickStrip
            x={0}
            y={20}
            width={820 * Math.min(1, (irpf * horizonte) / Math.max(d.perCapita, 1))}
            count={horizonte}
            height={22}
            seed={5}
            color="var(--ink)"
          />
          <TickStrip
            x={820 * Math.min(1, (irpf * horizonte) / Math.max(d.perCapita, 1)) + 6}
            y={20}
            width={Math.max(0, 820 * (restante / Math.max(d.perCapita, 1)))}
            count={Math.max(0, Math.round(restante / Math.max(irpf, 1)))}
            height={16}
            seed={6}
            color="var(--ink-5)"
            subtract
          />
        </ZoomSvg>
        <p className="fs-figure-legend">
          Marcas llenas = años de IRPF aportados · marcas discontinuas = lo que seguiría pendiente
        </p>
      </div>
    </Figure>
  );
}
