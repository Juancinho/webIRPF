import { useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import Figure from '../figures/Figure';
import Desglose from './Desglose';
import { TickStrip } from '../figures/marks';
import { dec, eur, pct } from '../utils/format';

const UNIT = 250; // one mark = 250 €
const SVG_W = 600;

/**
 * 01 · TU NÓMINA — FIG. 02, the payroll ledger.
 * Quiet reading chapter: an editorial ledger where every line is a strip of
 * countable marks. Solid marks add, dashed marks take away (F9 grammar).
 */
export default function Nomina() {
  const { bruto, anio, pagas, nomina, marginal, params, smi, vecesSMI, focus, setFocus } = useFiscal();
  const [pinned, setPinned] = useState(null);

  const esAutonomo = nomina.regimen === 'autonomo';
  const base = Math.max(bruto, 1);

  const filas = [
    {
      key: 'bruto',
      label: 'Bruto anual',
      value: bruto,
      sign: 1,
      sub: esAutonomo ? 'Rendimiento íntegro de tu actividad' : 'La cifra que aparece en tu contrato',
      detalle: {
        titulo: 'Salario bruto',
        texto: `Es la cantidad pactada antes de cualquier descuento. En 12 pagas equivale a ${eur(bruto / 12)} al mes; en 14 pagas, ${eur(bruto / 14)}.`,
        formula: `${eur(bruto)} ÷ ${pagas} pagas = ${eur(bruto / pagas)}`,
        fuente: null,
      },
    },
    {
      key: 'ssTra',
      label: esAutonomo ? 'Cotización RETA' : 'SS trabajador',
      value: nomina.cotTra,
      sign: -1,
      sub: esAutonomo
        ? 'Tu cuota de autónomos según el tramo de rendimientos'
        : `${pct(params.tipoTra * 100, 2)} sobre la base de cotización`,
      detalle: {
        titulo: esAutonomo ? 'Cotización de autónomos' : 'Cotización a la Seguridad Social',
        texto: esAutonomo
          ? 'Desde 2023 la cuota depende del tramo de rendimientos netos previstos (RDL 13/2022). Antes de 2023 se aplica la base mínima habitual del régimen.'
          : `El tipo ${pct(params.tipoTra * 100, 2)} suma contingencias comunes (4,70 %), desempleo (1,55 %), formación profesional (0,10 %)${params.mei[1] > 0 ? ` y MEI (${pct(params.mei[1] * 100, 2)})` : ''}. Se aplica sobre la base de cotización, topada en ${eur(params.baseMax)} en ${anio}.`,
        formula: esAutonomo
          ? `Cuota anual = base del tramo × 12 × tipo combinado = ${eur(nomina.cotTra)}`
          : `mín(${eur(bruto)}, ${eur(params.baseMax)}) × ${pct(params.tipoTra * 100, 2)} = ${eur(nomina.cotTra)}`,
        fuente: {
          label: 'TGSS — Bases y tipos de cotización',
          url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537',
        },
      },
    },
    {
      key: 'irpf',
      label: 'IRPF retenido',
      value: nomina.irpfFinal,
      sign: -1,
      sub: `Tipo efectivo ${pct(nomina.tipoEfectivoIRPF * 100)} sobre el bruto`,
      detalle: {
        titulo: 'IRPF final',
        texto:
          'Es la cuota que resulta de aplicar la escala progresiva a tu base imponible, restar la cuota del mínimo personal y familiar y, si procede, la deducción por rendimientos del trabajo. El capítulo 03 desmonta este cálculo tramo a tramo.',
        formula: `Cuota íntegra ${eur(nomina.cuotaIntegra)} − mínimo ${eur(nomina.cuotaMinimo)}${nomina.deduccionSMI > 0 ? ` − deducción ${eur(nomina.deduccionSMI)}` : ''} = ${eur(nomina.irpfFinal)}`,
        fuente: {
          label: 'BOE — LIRPF Ley 35/2006',
          url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a63',
        },
      },
    },
    {
      key: 'neto',
      label: 'Neto anual',
      value: nomina.salarioNeto,
      sign: 0,
      total: true,
      sub: `${eur(nomina.salarioNeto / pagas)} al mes en ${pagas} pagas`,
      detalle: {
        titulo: 'Salario neto',
        texto: 'Lo que efectivamente ingresa en tu cuenta a lo largo del año, antes de la declaración anual de la renta.',
        formula: `${eur(bruto)} − ${eur(nomina.cotTra)} − ${eur(nomina.irpfFinal)} = ${eur(nomina.salarioNeto)}`,
        fuente: null,
      },
    },
  ];

  const activa = filas.find(f => f.key === (pinned || focus)) || null;
  const limiteActivo = nomina.limiteRetencion < nomina.cuotaSMI && nomina.cuotaSMI > 0;

  return (
    <section id="nomina" className="fs-chapter" aria-labelledby="nomina-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">01</span>

        <div className="fs-spread">
          <aside className="fs-rail">
            {activa ? (
              <div className="fs-rail-item">
                <span className="fs-stamp">{activa.detalle.titulo}</span>
                <p className="fs-note">{activa.detalle.texto}</p>
                <p className="fs-formula">{activa.detalle.formula}</p>
                {activa.detalle.fuente && (
                  <p className="fs-source">
                    Fuente ·{' '}
                    <a href={activa.detalle.fuente.url} target="_blank" rel="noreferrer noopener">
                      {activa.detalle.fuente.label}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <div className="fs-rail-item">
                <span className="fs-stamp">Nota 01</span>
                <p className="fs-note">
                  Pasa el cursor —o el foco del teclado— por cualquier línea del libro para ver su
                  fórmula, su artículo y su fuente.
                </p>
              </div>
            )}

            <div className="fs-rail-item">
              <span className="fs-stamp">Referencias {anio}</span>
              <p className="fs-note">
                SMI {eur(smi)} · tu salario es {dec(vecesSMI, 2)} × SMI
                <br />
                Base máxima de cotización {eur(params.baseMax)}
                <br />
                Tipo marginal total {pct(marginal.tipoMarginalTotal * 100)}
              </p>
            </div>

            {(nomina.irpfFinal === 0 && bruto > 0) && (
              <div className="fs-rail-item">
                <span className="fs-stamp">Sin IRPF</span>
                <p className="fs-note">
                  A este nivel de renta la cuota resultante es cero: el mínimo personal y familiar
                  absorbe la cuota íntegra.
                </p>
              </div>
            )}

            {limiteActivo && (
              <div className="fs-rail-item">
                <span className="fs-stamp">Límite del 43 %</span>
                <p className="fs-note">
                  La retención está limitada al 43 % de la diferencia entre el bruto y el mínimo
                  exento de retención ({eur(params.minimoExento)}).
                  <br />
                  <a
                    className="fs-source"
                    href="https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    BOE — RIRPF art. 85.3
                  </a>
                </p>
              </div>
            )}
          </aside>

          <div className="fs-field">
            <div className="fs-chapter-head">
              <span className="fs-stamp">01 / 07 · Tu nómina</span>
              <h2 id="nomina-t" className="fs-title">
                Lo que ves
                <br />
                en la nómina
              </h2>
              <p className="fs-kicker">
                Empecemos por lo visible: la cifra del contrato, los dos descuentos que aparecen en
                tu recibo y lo que queda. El capítulo siguiente mostrará que la nómina no empieza
                donde tú crees.
              </p>
            </div>

            <Figure
              id="02"
              title="El libro de la nómina"
              sub={`${anio} · ${esAutonomo ? 'régimen de autónomos' : 'asalariado'} · euros anuales · una marca = ${UNIT} €`}
              legend={`Una marca = ${UNIT} € · marcas llenas suman · marcas discontinuas restan`}
              source="Fuente · TGSS · AEAT · BOE"
              summary={`Bruto ${eur(bruto)}, cotización ${eur(nomina.cotTra)}, IRPF ${eur(nomina.irpfFinal)}, neto ${eur(nomina.salarioNeto)}.`}
            >
              <div className="fs-ledger">
                {filas.map(f => {
                  const w = Math.max(0, (Math.abs(f.value) / base) * (SVG_W - 20));
                  const marks = Math.round(Math.abs(f.value) / UNIT);
                  const dim = focus && focus !== f.key && !pinned;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      className={`fs-ledger-row ${f.total ? 'is-total' : ''} ${dim ? 'is-dim' : ''}`}
                      aria-pressed={pinned === f.key}
                      onMouseEnter={() => setFocus(f.key)}
                      onMouseLeave={() => setFocus(null)}
                      onFocus={() => setFocus(f.key)}
                      onBlur={() => setFocus(null)}
                      onClick={() => setPinned(p => (p === f.key ? null : f.key))}
                    >
                      <span>
                        <span className="fs-ledger-k">{f.label}</span>
                      </span>

                      <span className="fs-svg-wrap">
                        <svg className="fs-svg" viewBox={`0 0 ${SVG_W} 26`} aria-hidden="true">
                          <TickStrip
                            x={0}
                            y={13}
                            width={w}
                            count={marks}
                            height={f.total || f.key === 'bruto' ? 18 : 13}
                            seed={f.key.length + 3}
                            subtract={f.sign < 0}
                            color={f.sign < 0 ? 'var(--ink-3)' : 'var(--ink)'}
                          />
                        </svg>
                      </span>

                      <span className={`fs-ledger-v ${f.sign < 0 ? 'is-neg' : ''}`}>
                        {f.sign < 0 ? `−${eur(Math.abs(f.value))}` : eur(f.value)}
                      </span>

                      <span className="fs-ledger-sub fs-note">{f.sub}</span>
                    </button>
                  );
                })}
              </div>
            </Figure>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 56px', marginTop: 4 }}>
              <div>
                <span className="fs-label">Por paga · 12</span>
                <p className="fs-data-md num" style={{ margin: '4px 0 0' }}>{eur(nomina.salarioNeto / 12)}</p>
              </div>
              <div>
                <span className="fs-label">Por paga · 14</span>
                <p className="fs-data-md num" style={{ margin: '4px 0 0' }}>{eur(nomina.salarioNeto / 14)}</p>
              </div>
              <div>
                <span className="fs-label">Tipo efectivo IRPF</span>
                <p className="fs-data-md num" style={{ margin: '4px 0 0' }}>{pct(nomina.tipoEfectivoIRPF * 100)}</p>
              </div>
            </div>

            <p className="fs-body" style={{ marginTop: 36, marginBottom: 48 }}>
              El recibo de la nómina enseña dos descuentos. Pero tu trabajo no le cuesta a la empresa{' '}
              <strong>{eur(bruto)}</strong>: le cuesta <strong>{eur(nomina.costeLab)}</strong>. La
              diferencia nunca aparece en ningún papel que tú firmes. Y entre el bruto y lo que
              Hacienda grava hay otra docena de pasos, cada uno con su artículo:
            </p>

            <Desglose />
          </div>
        </div>
      </div>
    </section>
  );
}
