import { useRef } from 'react';
import { useNumeroAnimado } from '../hooks/useNumeroAnimado';
import { useFiscal } from '../state/fiscalContext';
import { useSteps } from '../hooks/useChapters';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { TickStrip, Label, Leader } from '../figures/marks';
import { rnd, round } from '../figures/scale';
import { eur, num, pct } from '../utils/format';

const W = 900;
const H = 470;
const CX = 366;
const MAXW = 600;
const UNIT = 500; // one mark = 500 € of labour cost

/**
 * 02 · EL VIAJE DE CADA EURO — FIG. 03, the descent.
 * One sticky graphic transforming through six states (DESIGN.md §33), in the
 * L13 Hourglass Stream grammar: proportional strips of countable marks,
 * hairline threads trickling between stages, survival rate parked in the margin.
 */
export default function Viaje() {
  const { bruto, anio, nomina, params, focus, setFocus } = useFiscal();
  const stepRefs = useRef([]);
  const step = useSteps(stepRefs, 6);

  const esAutonomo = nomina.regimen === 'autonomo';
  const total = Math.max(nomina.costeLab, 1);
  const cotEmpAnimada = useNumeroAnimado(nomina.cotEmp);
  const w = v => Math.max(0, (v / total) * MAXW);

  // the cash spine: every drop below is money that actually leaves
  const spine = [
    { key: 'coste', y: 40, label: 'Coste laboral total', v: nomina.costeLab, h: 22 },
    { key: 'bruto', y: 156, label: 'Salario bruto', v: bruto, h: 20 },
    { key: 'rn', y: 272, label: 'Rendimiento íntegro', v: nomina.rnPrevio, h: 18 },
    { key: 'neto', y: 424, label: 'Renta neta', v: nomina.salarioNeto, h: 22 },
  ];

  const drops = [
    { from: 0, to: 1, key: 'ssEmp', label: esAutonomo ? 'Sin cotización patronal' : 'SS empresa', v: nomina.cotEmp },
    { from: 1, to: 2, key: 'ssTra', label: esAutonomo ? 'Cotización RETA' : 'SS trabajador', v: nomina.cotTra },
    { from: 2, to: 3, key: 'irpf', label: 'IRPF', v: nomina.irpfFinal },
  ];

  const stageOn = i => i <= (step >= 5 ? 3 : step >= 4 ? 2 : step >= 3 ? 2 : step >= 2 ? 1 : step >= 1 ? 1 : 0);
  const dropOn = i => (i === 0 ? step >= 1 : i === 1 ? step >= 3 : step >= 5);

  const pctNeto = (nomina.salarioNeto / total) * 100;

  return (
    <section id="viaje" className="fs-chapter" aria-labelledby="viaje-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">02</span>

        <div className="fs-chapter-head">
          <span className="fs-stamp">02 / 09 · El viaje de cada euro</span>
          <h2 id="viaje-t" className="fs-title">
            Lo que cuestas
            <br />
            y lo que te llega
          </h2>
          <p className="fs-kicker">
            Tu nómina no empieza en el bruto. Empieza más arriba, en lo que tu trabajo le cuesta a
            quien te contrata, y desciende por cuatro escalones hasta tu cuenta corriente.
          </p>
        </div>
      </div>

      <div className="fs-bleed">
        <div className="fs-page" style={{ padding: 0 }}>
          <div className="fs-sticky">
            <div className="fs-sticky-fig">
              <Figure
                id="04"
                title={`De ${eur(nomina.costeLab)} de coste laboral a ${eur(nomina.salarioNeto)} de renta neta`}
                sub={`${anio} · euros anuales · el ancho de cada banda es proporcional al importe`}
                legend={`Una marca = ${UNIT} € de coste laboral · marcas discontinuas = importe que se desprende`}
                source="Fuente · TGSS · BOE LIRPF · AEAT"
                summary={`De ${eur(nomina.costeLab)} de coste laboral, ${eur(nomina.cotEmp)} son cotización de la empresa, ${eur(nomina.cotTra)} cotización del trabajador y ${eur(nomina.irpfFinal)} IRPF; llegan ${eur(nomina.salarioNeto)} netos.`}
              >
                <ChartFrame viewBox={`0 0 ${W} ${H}`} scroll style={{ maxHeight: '64vh' }}>
                  {/* guide rail: the full width of the labour cost, always present */}
                  <Rule x={CX} y0={34} y1={H - 10} />

                  {spine.map((s, i) => {
                    const sw = w(s.v);
                    const on = stageOn(i);
                    const dim = focus && focus !== s.key;
                    return (
                      <g key={s.key} className="fs-group" opacity={on ? (dim ? 0.3 : 1) : 0.16}>
                        <TickStrip
                          x={CX - sw / 2}
                          y={s.y}
                          width={sw}
                          count={Math.round(s.v / UNIT)}
                          height={s.h}
                          seed={i + 2}
                          color="var(--ink)"
                        />
                        <Leader x1={CX + sw / 2 + 8} y1={s.y} x2={W - 216} y2={s.y} />
                        <Label x={W - 210} y={s.y - 3} size={10} weight={700} color="var(--ink-2)" mono>
                          {s.label.toUpperCase()}
                        </Label>
                        <Label x={W - 210} y={s.y + 13} size={14} weight={800} color="var(--ink)">
                          {eur(s.v)}
                        </Label>
                      </g>
                    );
                  })}

                  {/* threads: what detaches between one stage and the next */}
                  {drops.map((d, i) => {
                    const a = spine[d.from];
                    const b = spine[d.to];
                    const wa = w(a.v) / 2;
                    const wb = w(b.v) / 2;
                    const on = dropOn(i);
                    const dim = focus && focus !== d.key;
                    return (
                      <g
                        key={d.key}
                        className="fs-group"
                        opacity={on ? (dim ? 0.25 : 1) : 0.08}
                        onMouseEnter={() => setFocus(d.key)}
                        onMouseLeave={() => setFocus(null)}
                      >
                        {Array.from({ length: 26 }, (_, t) => {
                          const xt = CX + (rnd(t + 1, i * 7 + 1) - 0.5) * 2 * wa * 0.94;
                          const xb = CX + (rnd(t + 3, i * 7 + 5) - 0.5) * 2 * wb * 0.94;
                          const y1 = a.y + a.h / 2 + 6;
                          const y2 = b.y - b.h / 2 - 6;
                          return (
                            <path
                              key={t}
                              d={`M${round(xt)} ${y1} C${round(xt)} ${round(y1 + 34)} ${round(xb)} ${round(y2 - 34)} ${round(xb)} ${y2}`}
                              fill="none"
                              stroke="var(--ink-5)"
                              strokeWidth={0.55}
                              opacity={0.42}
                            />
                          );
                        })}

                        {d.v > 0 && (
                          <>
                            <Label x={26} y={(a.y + b.y) / 2 - 4} size={13} weight={800} color="var(--ink-2)">
                              −{pct((d.v / total) * 100)}
                            </Label>
                            <Label x={26} y={(a.y + b.y) / 2 + 10} size={8.5} color="var(--ink-5)" mono>
                              {d.label.toUpperCase()}
                            </Label>
                            <Label x={26} y={(a.y + b.y) / 2 + 24} size={11} weight={700} color="var(--ink-3)">
                              −{eur(d.v)}
                            </Label>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* editorial aside: the base that is actually taxed is not a cash step */}
                  <g opacity={step >= 4 ? 1 : 0.12} className="fs-group">
                    <rect
                      x={round(CX - w(nomina.baseImponible) / 2)}
                      y={318}
                      width={round(w(nomina.baseImponible))}
                      height={13}
                      fill="none"
                      stroke="var(--counter)"
                      strokeWidth={0.9}
                      strokeDasharray="3 2.5"
                    />
                    <Leader x1={CX - w(nomina.baseImponible) / 2 - 8} y1={324} x2={196} y2={324} dashed />
                    <Label x={188} y={321} size={9} color="var(--counter)" anchor="end" mono>
                      BASE IMPONIBLE
                    </Label>
                    <Label x={188} y={334} size={11} weight={700} color="var(--counter)" anchor="end">
                      {eur(nomina.baseImponible)}
                    </Label>
                  </g>

                  {/* survival rate: the sentence the whole figure exists to make */}
                  <Label x={26} y={H - 14} size={9} color="var(--ink-5)" mono>
                    LLEGA A TU CUENTA
                  </Label>
                  <Label x={26} y={H - 30} size={22} weight={800} color="var(--signal)">
                    {pct(pctNeto)}
                  </Label>
                </ChartFrame>

                <div className="fs-dots" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i} className={`fs-dot ${i === step ? 'is-on' : ''}`} />
                  ))}
                </div>
              </Figure>
            </div>

            <div>
              {pasos({ bruto, anio, nomina, params, esAutonomo }).map((p, i) => (
                <div
                  key={p.id}
                  ref={el => (stepRefs.current[i] = el)}
                  className={`fs-step ${i === step ? '' : 'is-off'}`}
                >
                  <span className="fs-step-id">{p.id}</span>
                  <h3>{p.titulo}</h3>
                  {p.cuerpo.map((t, k) => (
                    <p key={k}>{t}</p>
                  ))}
                  {p.formula && <p className="fs-formula">{p.formula}</p>}
                  {p.fuente && (
                    <p className="fs-source">
                      Fuente ·{' '}
                      <a href={p.fuente.url} target="_blank" rel="noreferrer noopener">
                        {p.fuente.label}
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fs-page">
        <p className="fs-statement fs-statement-rule fs-statement-neg" style={{ marginTop: 40, maxWidth: '16ch' }}>
          {num(cotEmpAnimada)} <span className="fs-u fs-u-neg">€</span>
        </p>
        <p className="fs-title-sm" style={{ marginTop: 16, maxWidth: '22ch' }}>
          nunca aparecen
          <br />
          en tu nómina.
        </p>
        <p className="fs-body" style={{ marginTop: 18 }}>
          Es la cotización que paga la empresa por ti. No la ves, no la firmas y no consta en tu
          recibo — pero forma parte del precio de tu trabajo y se calcula sobre tu base de
          cotización, topada en {eur(params.baseMax)} en {anio}.
        </p>
      </div>
    </section>
  );
}

function Rule({ x, y0, y1 }) {
  return <line x1={x} y1={y0} x2={x} y2={y1} stroke="var(--ink-7)" strokeWidth={0.7} strokeDasharray="2 4" />;
}

/** Protected explanatory content: steps A–L of the original fiscal breakdown. */
function pasos({ bruto, anio, nomina, params, esAutonomo }) {
  const art20 = nomina.redTrabajo;
  return [
    {
      id: 'A · Coste laboral',
      titulo: 'Lo que tu trabajo cuesta de verdad',
      cuerpo: [
        `Antes de tu bruto existe una cifra mayor: ${eur(nomina.costeLab)}. Es lo que tu empresa desembolsa por tenerte contratado en ${anio}.`,
        esAutonomo
          ? 'En el régimen de autónomos no hay cotización patronal: el coste de tu actividad coincide con tu rendimiento íntegro.'
          : 'Se compone de tu salario bruto más la cotización empresarial a la Seguridad Social.',
      ],
      formula: `${eur(bruto)} + ${eur(nomina.cotEmp)} = ${eur(nomina.costeLab)}`,
      fuente: { label: 'TGSS — Bases y tipos de cotización', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
    },
    {
      id: 'B · Cotización de la empresa',
      titulo: esAutonomo ? 'Sin cotización patronal' : 'El descuento que no ves',
      cuerpo: esAutonomo
        ? ['Como autónomo asumes íntegramente tu cotización: no existe una parte empresarial equivalente.']
        : [
            `La empresa aporta ${pct(params.tipoEmp * 100, 2)} de tu base de cotización: contingencias comunes, desempleo, FOGASA, formación profesional, accidentes de trabajo${params.mei[0] > 0 ? ' y MEI' : ''}.`,
            `Son ${eur(nomina.cotEmp)} al año que financian pensiones y prestaciones, y que jamás figuran en tu recibo de nómina.`,
          ],
      formula: esAutonomo ? null : `mín(${eur(bruto)}, ${eur(params.baseMax)}) × ${pct(params.tipoEmp * 100, 2)} = ${eur(nomina.cotEmp)}`,
      fuente: { label: 'TGSS — Cotización', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
    },
    {
      id: 'C · Salario bruto',
      titulo: 'La cifra del contrato',
      cuerpo: [
        `${eur(bruto)} es lo que tú llamas «tu sueldo» y lo único que negocias. Equivale a ${eur(bruto / 12)} al mes en 12 pagas o ${eur(bruto / 14)} en 14.`,
        'A partir de aquí empiezan los descuentos que sí aparecen en la nómina.',
      ],
      formula: null,
      fuente: null,
    },
    {
      id: 'D · Cotización del trabajador',
      titulo: 'Tu parte de la Seguridad Social',
      cuerpo: [
        esAutonomo
          ? `Tu cuota de autónomos asciende a ${eur(nomina.cotTra)} en ${anio}, según el tramo de rendimientos netos previstos.`
          : `Se te descuenta ${pct(params.tipoTra * 100, 2)} de la base: ${eur(nomina.cotTra)} al año. Es el primer recorte visible.`,
        `Lo que queda, ${eur(nomina.rnPrevio)}, es tu rendimiento íntegro del trabajo: el punto de partida del IRPF.`,
      ],
      formula: `${eur(bruto)} − ${eur(nomina.cotTra)} = ${eur(nomina.rnPrevio)}`,
      fuente: { label: 'BOE — LIRPF art. 19', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a19' },
    },
    {
      id: 'E · De rendimiento a base imponible',
      titulo: 'La cifra que realmente se grava',
      cuerpo: [
        anio >= 2015
          ? `Sobre el rendimiento íntegro se restan ${eur(nomina.gastosFijos)} de gastos deducibles (art. 19.2.f)${art20 > 0 ? ` y ${eur(art20)} de reducción por rendimientos del trabajo (art. 20)` : ', sin reducción del art. 20 a tu nivel de renta'}.`
          : `Antes de 2015 no existían los 2.000 € de gastos deducibles del art. 19.2.f${art20 > 0 ? `; sí se aplica la reducción del art. 20, de ${eur(art20)}` : ''}.`,
        `El resultado, ${eur(nomina.baseImponible)}, es la base imponible: no es dinero que se te descuente, sino la cifra sobre la que se aplica la escala progresiva.`,
        `Además, la cuota correspondiente al mínimo personal y familiar (${eur(nomina.minimoPersonalYFamiliar)}) se resta después: esa renta vital no tributa.`,
      ],
      formula: `${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)} − ${eur(art20)} = ${eur(nomina.baseImponible)}`,
      fuente: { label: 'BOE — LIRPF arts. 19, 20 y 56-61', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a20' },
    },
    {
      id: 'F · IRPF y renta neta',
      titulo: 'Lo que queda',
      cuerpo: [
        `Aplicada la escala y restado el mínimo${nomina.deduccionSMI > 0 ? ` y la deducción por rendimientos del trabajo (${eur(nomina.deduccionSMI)})` : ''}, el IRPF final es ${eur(nomina.irpfFinal)}: un ${pct(nomina.tipoEfectivoIRPF * 100)} de tu bruto.`,
        `De los ${eur(nomina.costeLab)} que costó tu trabajo, llegan ${eur(nomina.salarioNeto)}: ${pct((nomina.salarioNeto / Math.max(nomina.costeLab, 1)) * 100)} del total.`,
      ],
      formula: `${eur(bruto)} − ${eur(nomina.cotTra)} − ${eur(nomina.irpfFinal)} = ${eur(nomina.salarioNeto)}`,
      fuente: { label: 'BOE — LIRPF art. 63 (escala)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a63' },
    },
  ];
}
