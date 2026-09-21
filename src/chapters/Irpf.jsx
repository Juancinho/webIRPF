import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import Figure from '../figures/Figure';
import ZoomSvg from '../figures/ZoomSvg';
import { Label, Rule, TickStrip } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { eur, pct } from '../utils/format';
import CurvaTipos from './CurvaTipos';
import Acantilado from './Acantilado';

const W = 880;
const H = 330;
const X0 = 18;
const X1 = W - 18;
const BASE_Y = 250;
const UNIT = 250;

/**
 * 03 · CÓMO FUNCIONA EL IRPF
 * FIG. 04 the bracket ladder · FIG. 05 the marginal/effective poster ·
 * FIG. 06 the Art. 20 cliff · FIG. 07 a hundred euros of raise.
 */
export default function Irpf() {
  const { anio, nomina, marginal } = useFiscal();
  const [hover, setHover] = useState(null);

  const tramos = nomina.tramos;
  const base = nomina.baseImponible;

  const bandas = useMemo(() => {
    let prev = 0;
    const out = [];
    for (const [lim, tipo] of tramos) {
      out.push({ desde: prev, hasta: lim, tipo });
      prev = lim;
    }
    return out;
  }, [tramos]);

  // show the reader's bracket plus the next one, so the ladder always has headroom
  const maxShown = useMemo(() => {
    const idx = bandas.findIndex(b => base <= b.hasta);
    const next = bandas[Math.min(idx + 1, bandas.length - 1)];
    const cand = Number.isFinite(next?.hasta) ? next.hasta : bandas[idx]?.hasta;
    const lim = Number.isFinite(cand) ? cand : base * 1.4;
    return Math.max(25000, Math.min(lim, 90000), base * 1.08);
  }, [bandas, base]);

  const x = linear([0, maxShown], [X0, X1]);
  const maxTipo = Math.max(...bandas.map(b => b.tipo));
  const alto = linear([0, maxTipo], [0, 150]);

  const conDatos = bandas
    .filter(b => b.desde < maxShown)
    .map((b, i) => {
      const hasta = Math.min(b.hasta, maxShown);
      const dentro = Math.max(0, Math.min(base, b.hasta) - b.desde);
      return { ...b, hastaVis: hasta, dentro, cuota: dentro * b.tipo, i };
    });

  const activa = conDatos.find(b => b.i === hover) || conDatos.find(b => base > b.desde && base <= b.hasta);

  return (
    <section id="irpf" className="fs-chapter" aria-labelledby="irpf-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">03</span>

        <div className="fs-spread">
          <aside className="fs-rail">
            <div className="fs-rail-item">
              <span className="fs-stamp">Nota 02</span>
              <p className="fs-note">
                El tipo marginal y el tipo efectivo miden cosas distintas. El marginal se aplica al
                siguiente euro que ganas; el efectivo es el resultado sobre el total.
              </p>
            </div>
            {activa && (
              <div className="fs-rail-item">
                <span className="fs-stamp">Tramo al {pct(activa.tipo * 100)}</span>
                <p className="fs-note">
                  De {eur(activa.desde)} a {Number.isFinite(activa.hasta) ? eur(activa.hasta) : '∞'}
                  <br />
                  Tu base dentro de este tramo: <strong>{eur(activa.dentro)}</strong>
                  <br />
                  Cuota que genera: <strong>{eur(activa.cuota)}</strong>
                </p>
              </div>
            )}
            <div className="fs-rail-item">
              <span className="fs-stamp">Escala aplicada</span>
              <p className="fs-note">
                {anio >= 2024
                  ? 'Escala combinada estatal + autonómica del perfil seleccionado.'
                  : 'Escala estatal estándar; antes de 2024 las divergencias autonómicas eran menores.'}
              </p>
              <p className="fs-source">
                Fuente ·{' '}
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a63"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  BOE — LIRPF art. 63
                </a>
              </p>
            </div>
          </aside>

          <div className="fs-field">
            <div className="fs-chapter-head">
              <span className="fs-stamp">03 / 07 · Cómo funciona el IRPF</span>
              <h2 id="irpf-t" className="fs-title">
                La escalera
                <br />
                y el acantilado
              </h2>
              <p className="fs-kicker">
                El IRPF no es un porcentaje: es una escalera. Cada tramo grava sólo la parte de
                renta que cae dentro de él. Y, en un punto concreto de la escala española, la
                escalera tiene un escalón que sube mucho más de lo que parece.
              </p>
            </div>

            <Figure
              id="05"
              title="Tu base imponible termina dentro de un tramo, no en la cima de la escala"
              sub={`${anio} · base imponible ${eur(base)} · la altura de cada columna es su tipo, el ancho su tramo de renta`}
              legend={`Una marca = ${UNIT} € de base imponible · marcas llenas = renta tuya dentro del tramo · marcas huecas = capacidad del tramo que no alcanzas`}
              source="Fuente · BOE · LIRPF art. 63 · escala combinada"
              summary={conDatos
                .map(b => `Tramo ${pct(b.tipo * 100)}: ${eur(b.dentro)} dentro, cuota ${eur(b.cuota)}`)
                .join('. ')}
            >
              <ZoomSvg viewBox={`0 0 ${W} ${H}`}>
                <Rule x1={X0} y1={BASE_Y} x2={X1} y2={BASE_Y} />

                {conDatos.map(b => {
                  const bx0 = x(b.desde);
                  const bx1 = x(b.hastaVis);
                  const bw = Math.max(0, bx1 - bx0 - 6);
                  const h = alto(b.tipo);
                  const nTotal = Math.round((b.hastaVis - b.desde) / UNIT);
                  const nLleno = Math.round(b.dentro / UNIT);
                  const dim = hover !== null && hover !== b.i;
                  return (
                    <g key={b.desde} className="fs-group" opacity={dim ? 0.3 : 1}>
                      {/* unused capacity: hollow marks */}
                      <TickStrip
                        x={bx0 + 3}
                        y={BASE_Y - h / 2}
                        width={bw}
                        count={nTotal}
                        height={h}
                        seed={b.i + 11}
                        color="var(--ink-6)"
                        dot={false}
                      />
                      {/* the reader's euros inside this bracket */}
                      {nLleno > 0 && (
                        <TickStrip
                          x={bx0 + 3}
                          y={BASE_Y - h / 2}
                          width={(bw * b.dentro) / Math.max(1, b.hastaVis - b.desde)}
                          count={nLleno}
                          height={h}
                          seed={b.i + 3}
                          color="var(--ink)"
                          dot={false}
                        />
                      )}

                      <Label x={bx0 + 3} y={BASE_Y - h - 10} size={12} weight={800} color="var(--ink)">
                        {pct(b.tipo * 100)}
                      </Label>
                      {b.cuota > 0 && (
                        <Label x={bx0 + 3} y={BASE_Y - h - 24} size={9.5} color="var(--ink-4)" mono>
                          {eur(b.cuota)}
                        </Label>
                      )}
                      <Label x={bx0 + 3} y={BASE_Y + 18} size={9.5} color="var(--ink-4)" mono>
                        {b.desde === 0 ? '0' : eur(b.desde)}
                      </Label>

                      <rect
                        className="fs-hit"
                        x={bx0}
                        y={BASE_Y - 170}
                        width={Math.max(6, bx1 - bx0)}
                        height={200}
                        onMouseEnter={() => setHover(b.i)}
                        onMouseLeave={() => setHover(null)}
                      >
                        <title>{`Tramo al ${pct(b.tipo * 100)} — ${eur(b.dentro)} de tu base, ${eur(b.cuota)} de cuota`}</title>
                      </rect>
                    </g>
                  );
                })}

                {/* where the reader's income actually ends */}
                <line
                  x1={round(x(Math.min(base, maxShown)))}
                  y1={BASE_Y - 186}
                  x2={round(x(Math.min(base, maxShown)))}
                  y2={BASE_Y + 6}
                  stroke="var(--signal)"
                  strokeWidth={1.4}
                />
                <Label
                  x={x(Math.min(base, maxShown))}
                  y={BASE_Y - 194}
                  size={10}
                  color="var(--signal)"
                  anchor={x(base) > X1 - 150 ? 'end' : 'middle'}
                  mono
                >
                  TU BASE TERMINA AQUÍ · {eur(base)}
                </Label>

                <Label x={X1} y={BASE_Y + 18} size={9.5} color="var(--ink-4)" anchor="end" mono>
                  {eur(maxShown)}
                </Label>
              </ZoomSvg>

              <p className="fs-note" style={{ marginTop: 14 }}>
                Cuota íntegra <strong>{eur(nomina.cuotaIntegra)}</strong> − cuota del mínimo personal
                y familiar <strong>{eur(nomina.cuotaMinimo)}</strong>
                {nomina.deduccionSMI > 0 && (
                  <> − deducción por rendimientos del trabajo <strong>{eur(nomina.deduccionSMI)}</strong></>
                )}{' '}
                = IRPF <strong>{eur(nomina.irpfFinal)}</strong>
              </p>
            </Figure>

            <Poster marginal={marginal} nomina={nomina} />

            <CurvaTipos />

            <Acantilado />
          </div>
        </div>
      </div>
    </section>
  );
}

/** FIG. 05 — the typographic lesson, with two gauges on one shared axis. */
function Poster({ marginal, nomina }) {
  const marg = marginal.tipoMarginalIRPF * 100;
  const efe = nomina.tipoEfectivoIRPF * 100;
  const max = Math.max(50, Math.ceil(marg / 10) * 10);
  const gw = 680;
  const x = linear([0, max], [0, gw]);

  return (
    <div style={{ margin: '0 0 clamp(40px, 6vh, 72px)' }}>
      <div className="fs-hr" />
      <div style={{ display: 'grid', gap: 28, gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div>
          <p className="fs-statement" style={{ maxWidth: '14ch' }}>{pct(marg)}</p>
          <p className="fs-title-sm" style={{ marginTop: 14, maxWidth: '18ch' }}>
            no es lo que pagas
            <br />
            sobre todo tu sueldo.
          </p>
        </div>

        <Figure
          id="06"
          title="Marginal y efectivo miden cosas distintas"
          sub="Mismo eje, misma escala: el marginal se aplica al siguiente euro; el efectivo, al total del bruto"
          legend="Ambas barras comparten el eje 0 % — la diferencia de longitud es la diferencia real"
          source="Fuente · cálculo propio sobre la escala vigente"
          summary={`Tipo marginal del IRPF ${pct(marg)}; tipo efectivo ${pct(efe)}.`}
        >
          <ZoomSvg viewBox={`0 0 ${gw + 180} 130`}>
            {[0, max / 2, max].map(v => (
              <g key={v}>
                <line x1={x(v)} y1={18} x2={x(v)} y2={104} stroke="var(--ink-7)" strokeWidth={0.7} />
                <Label x={x(v)} y={120} size={9.5} color="var(--ink-5)" anchor="middle" mono>
                  {pct(v, 0)}
                </Label>
              </g>
            ))}

            <TickStrip x={0} y={40} width={x(marg)} count={Math.round(marg)} height={22} seed={7} color="var(--ink)" />
            <Label x={x(marg) + 10} y={38} size={10} color="var(--ink-3)" mono>MARGINAL</Label>
            <Label x={x(marg) + 10} y={52} size={13} weight={800} color="var(--ink)">{pct(marg)}</Label>

            <TickStrip x={0} y={88} width={x(efe)} count={Math.round(efe)} height={18} seed={9} color="var(--signal)" />
            <Label x={x(efe) + 10} y={86} size={10} color="var(--ink-3)" mono>EFECTIVO</Label>
            <Label x={x(efe) + 10} y={100} size={13} weight={800} color="var(--signal)">{pct(efe)}</Label>
          </ZoomSvg>

          <p className="fs-note" style={{ marginTop: 12 }}>
            Sobre tu bruto, el IRPF se lleva <strong>{eur(nomina.irpfFinal)}</strong>. Si te subieran
            el sueldo, el siguiente euro tributaría al {pct(marg)} — sólo ese euro.
          </p>
        </Figure>
      </div>
    </div>
  );
}
