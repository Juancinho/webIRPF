import { useMemo, useState } from 'react';
import { useNumeroAnimado } from '../hooks/useNumeroAnimado';
import { useFiscal } from '../state/fiscalContext';
import GuiaRail from '../figures/GuiaRail';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label, Rule, TickStrip } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { eur, pct } from '../utils/format';
import CurvaTipos from './CurvaTipos';
import Acantilado from './Acantilado';
import Puente from '../figures/Puente';

const W = 880;
const H = 330;
const X0 = 18;
const X1 = W - 18;
const BASE_Y = 250;
const UNIT = 250;

/**
 * 03 · CÓMO FUNCIONA EL IRPF
 * FIG. 05 la escalera de tramos · FIG. 06 marginal y efectivo contados en
 * euros · FIG. 07 la curva de tipos · FIG. 08 el acantilado del art. 20 ·
 * FIG. 09 el simulador de subida.
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
    <section id="irpf" className="fs-chapter fs-open-steps" aria-labelledby="irpf-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">03</span>

        <div className="fs-spread">
          <aside className="fs-rail">
            <GuiaRail seccion="irpf" />
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
            <div className="fs-chapter-head" data-gesture="CADA TIPO SE APLICA SÓLO A SU TRAMO">
              <span className="fs-stamp">03 / 09 · Cómo funciona el IRPF</span>
              <h2 id="irpf-t" className="fs-title">
                La escalera
                <br />
                y el acantilado
              </h2>
              <p className="fs-kicker">
                El IRPF combina varios tipos, no uno solo. Cada tipo se aplica únicamente a la
                porción de base comprendida en su tramo. Por eso el tipo marginal —el del siguiente
                euro— y el tipo efectivo —la cuota total dividida por el bruto— responden a preguntas
                distintas.
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
              <ChartFrame viewBox={`0 0 ${W} ${H}`} scroll>
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
              </ChartFrame>

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

            <Puente rotulo="De un sueldo a todos los sueldos">
              En un salario concreto, marginal y efectivo son dos cifras. Al recorrer toda la escala
              se convierten en dos curvas: su separación muestra cuánto difiere el gravamen aplicado
              al siguiente euro de la carga media soportada hasta ese punto.
            </Puente>

            <CurvaTipos />

            <Puente rotulo="Donde la escalera se rompe">
              En determinados niveles de renta, el marginal puede superar los tipos nominales de
              la escala. La causa no es un tramo adicional: al aumentar el rendimiento se reduce
              simultáneamente el beneficio del artículo 20. El siguiente bloque separa ambos efectos.
            </Puente>

            <Acantilado />

            <Puente rotulo="De las reglas de un año a su evolución">
              Los tramos, mínimos, gastos deducibles y reducciones explican el resultado del ejercicio
              seleccionado, pero esos parámetros han cambiado con sucesivas reformas. Para compararlos
              sin mezclar fiscalidad e inflación, el capítulo siguiente mantiene constante el poder
              adquisitivo del salario y aplica a cada año sus reglas correspondientes.
            </Puente>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * FIG. 06 — LA LECCIÓN, EN EUROS CONTABLES.
 *
 * El tipo marginal y el efectivo no se entienden como dos barras de longitud
 * distinta: se entienden contando euros. Dos campos de cien cuadrados —uno por
 * los cien euros que ya ganas, otro por los cien siguientes— con los euros que
 * se lleva el IRPF rellenos y los que te quedas huecos. La diferencia deja de
 * ser una distancia en un eje y pasa a ser un puñado de cuadrados más.
 */
function CampoCien({ x, y, llenos, color, cols = 25, size = 12, gap = 4 }) {
  const paso = size + gap;
  return (
    <g>
      {Array.from({ length: 100 }, (_, i) => {
        const cx = x + (i % cols) * paso;
        const cy = y + Math.floor(i / cols) * paso;
        const on = i < llenos;
        return (
          <rect
            key={i}
            x={round(cx)}
            y={round(cy)}
            width={size}
            height={size}
            rx={1}
            fill={on ? color : 'none'}
            stroke={on ? 'none' : 'var(--ink-6)'}
            strokeWidth={0.8}
          />
        );
      })}
    </g>
  );
}

function Poster({ marginal, nomina }) {
  const marg = marginal.tipoMarginalIRPF * 100;
  const efe = nomina.tipoEfectivoIRPF * 100;
  const margAnimado = useNumeroAnimado(marg);
  const nEfe = Math.max(0, Math.min(100, Math.round(efe)));
  const nMarg = Math.max(0, Math.min(100, Math.round(marg)));

  const COLS = 25;
  const SIZE = 14;
  const GAP = 4.5;
  const PASO = SIZE + GAP;
  const ANCHO = COLS * PASO - GAP;
  const ALTO = 4 * PASO - GAP;
  const XG = 2;
  const YA = 32;
  const YB = YA + ALTO + 66;
  const XT = XG + ANCHO + 46;
  const W6 = 880;
  const H6 = YB + ALTO + 26;

  return (
    <div style={{ margin: '0 0 clamp(40px, 6vh, 72px)' }}>
      <div className="fs-hr" />
      <div style={{ display: 'grid', gap: 28, gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div>
          <p className="fs-statement fs-statement-rule fs-statement-neg fs-counter" style={{ maxWidth: '14ch' }}>
            {pct(margAnimado)}
          </p>
          <p className="fs-title-sm" style={{ marginTop: 14, maxWidth: '18ch' }}>
            no es lo que pagas
            <br />
            sobre todo tu sueldo.
          </p>
        </div>

        <Figure
          id="06"
          title="Cuenta los euros: el marginal sólo manda sobre los que aún no has ganado"
          sub="Dos veces cien euros, mismo tamaño de cuadro: arriba los cien que ya cobras, abajo los cien siguientes"
          legend="Cada cuadrado = 1 € · cuadrado lleno = IRPF · cuadrado hueco = renta después del IRPF"
          source="Fuente · cálculo propio sobre la escala vigente"
          summary={`Tipo marginal del IRPF ${pct(marg)}; tipo efectivo ${pct(efe)}.`}
        >
          <ChartFrame viewBox={`0 0 ${W6} ${H6}`} scroll minWidth={620} label="Marginal y efectivo, contados en euros">
            {/* ── los cien euros que ya ganas ──────────────────────────── */}
            <Label x={XG} y={YA - 12} size={9.5} color="var(--ink-4)" mono>
              DE CADA 100 € QUE YA GANAS
            </Label>
            <CampoCien x={XG} y={YA} llenos={nEfe} color="var(--signal)" cols={COLS} size={SIZE} gap={GAP} />
            <Label x={XT} y={YA + 20} size={10} color="var(--ink-3)" mono>
              TIPO EFECTIVO
            </Label>
            <Label x={XT} y={YA + 46} size={26} weight={800} color="var(--signal)">
              {pct(efe)}
            </Label>
            <Label x={XT} y={YA + 62} size={10.5} color="var(--ink-4)">
              {nEfe} € de IRPF · {100 - nEfe} € de renta tras IRPF
            </Label>

            {/* ── los cien euros siguientes ────────────────────────────── */}
            <Label x={XG} y={YB - 12} size={9.5} color="var(--ink-4)" mono>
              DE LOS PRÓXIMOS 100 € DE SUBIDA
            </Label>
            <CampoCien x={XG} y={YB} llenos={nMarg} color="var(--counter)" cols={COLS} size={SIZE} gap={GAP} />
            <Label x={XT} y={YB + 20} size={10} color="var(--ink-3)" mono>
              TIPO MARGINAL
            </Label>
            <Label x={XT} y={YB + 46} size={26} weight={800} color="var(--counter)">
              {pct(marg)}
            </Label>
            <Label x={XT} y={YB + 62} size={10.5} color="var(--ink-4)">
              {nMarg} € de IRPF · {100 - nMarg} € de renta tras IRPF
            </Label>

            {/* ── la diferencia, dicha una sola vez ────────────────────── */}
            <line x1={XG} y1={YB - 32} x2={XG + ANCHO} y2={YB - 32} stroke="var(--rule)" strokeWidth={0.8} />
            <Label x={XG} y={YB - 40} size={10.5} weight={700} color="var(--counter)">
              {nMarg - nEfe > 0
                ? `Son ${nMarg - nEfe} cuadrados más — y sólo en esta segunda fila`
                : 'A tu nivel de renta las dos filas coinciden'}
            </Label>
          </ChartFrame>

          <p className="fs-note" style={{ marginTop: 14 }}>
            Sobre tu bruto, el IRPF asciende a <strong>{eur(nomina.irpfFinal)}</strong>. Si te subieran
            el sueldo, el siguiente euro tributaría al {pct(marg)} — sólo ese euro.{' '}
            <a className="fs-enlace" href="#fig-09">
              Calcula tu subida real en la FIG. 09 ↓
            </a>
          </p>
        </Figure>
      </div>
    </div>
  );
}
