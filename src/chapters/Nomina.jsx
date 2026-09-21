import { useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import Desglose from './Desglose';
import { Label } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { dec, eur, pct } from '../utils/format';

const W = 880;
const H = 186;
const X0 = 0;
const X1 = W;
const BAR_Y = 86;
const BAR_H = 54;
const HUECO = 2;

/**
 * 01 · TU NÓMINA — FIG. 02, el reparto del bruto.
 * Una sola barra: tu salario bruto partido en lo que te queda y lo que se va
 * antes de que lo veas. Un único denominador, tres piezas y las etiquetas
 * fuera de la barra, para que se lea de un vistazo y sin descifrar tramas.
 */
export default function Nomina() {
  const { bruto, anio, pagas, nomina, marginal, params, smi, vecesSMI, focus, setFocus } = useFiscal();
  const [pinned, setPinned] = useState(null);
  const [tip, setTip] = useState(null);

  const esAutonomo = nomina.regimen === 'autonomo';
  const base = Math.max(bruto, 1);

  const partes = [
    {
      key: 'neto',
      label: 'Renta neta',
      valor: nomina.salarioNeto,
      color: 'var(--signal)',
      sub: `${eur(nomina.salarioNeto / pagas)} al mes en ${pagas} pagas`,
      detalle: {
        titulo: 'Salario neto',
        texto: 'Lo que efectivamente ingresa en tu cuenta a lo largo del año, antes de la declaración anual de la renta.',
        formula: `${eur(bruto)} − ${eur(nomina.cotTra)} − ${eur(nomina.irpfFinal)} = ${eur(nomina.salarioNeto)}`,
        fuente: null,
      },
    },
    {
      key: 'ssTra',
      label: esAutonomo ? 'Cotización RETA' : 'SS trabajador',
      valor: nomina.cotTra,
      color: 'var(--ink-4)',
      colorNum: 'var(--ink-2)',
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
      valor: nomina.irpfFinal,
      color: 'var(--ink)',
      sub: `Tipo efectivo ${pct(nomina.tipoEfectivoIRPF * 100)} sobre el bruto`,
      detalle: {
        titulo: 'IRPF final',
        texto:
          'Es la cuota que resulta de aplicar la escala progresiva a tu base imponible, restar la cuota del mínimo personal y familiar y, si procede, la deducción por rendimientos del trabajo. El desglose de abajo lo abre paso a paso.',
        formula: `Cuota íntegra ${eur(nomina.cuotaIntegra)} − mínimo ${eur(nomina.cuotaMinimo)}${nomina.deduccionSMI > 0 ? ` − deducción ${eur(nomina.deduccionSMI)}` : ''} = ${eur(nomina.irpfFinal)}`,
        fuente: {
          label: 'BOE — LIRPF Ley 35/2006',
          url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a63',
        },
      },
    },
  ];

  // anchos acumulados de la barra, en coordenadas del lienzo
  let acumulado = X0;
  const segmentos = partes.map(p => {
    const ancho = Math.max(0, (p.valor / base) * (X1 - X0) - HUECO);
    const seg = { ...p, x: acumulado, ancho, pctBruto: (p.valor / base) * 100 };
    acumulado += ancho + HUECO;
    return seg;
  });

  const activa = partes.find(p => p.key === (pinned || focus)) || null;
  const limiteActivo = nomina.limiteRetencion < nomina.cuotaSMI && nomina.cuotaSMI > 0;
  const x = linear([0, 100], [X0, X1]);

  const mostrar = seg =>
    setTip({
      vx: seg.x + seg.ancho / 2,
      vy: BAR_Y + BAR_H / 2,
      title: eur(seg.valor),
      sub: seg.label,
      rows: [
        ['De tu bruto', pct(seg.pctBruto), seg.color],
        ['Al mes', `${eur(seg.valor / pagas)} · ${pagas} pagas`],
      ],
    });

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
                  Pasa el cursor por cualquier tramo de la barra —o pulsa su nombre— para ver su
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

            {nomina.irpfFinal === 0 && bruto > 0 && (
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
              title={`De tus ${eur(bruto)} brutos, te quedan ${eur(nomina.salarioNeto)}`}
              sub={`${anio} · ${esAutonomo ? 'régimen de autónomos' : 'asalariado'} · la barra entera es tu salario bruto, partido en sus tres destinos`}
              legend="La barra completa = 100 % de tu bruto · cada tramo es proporcional a su importe"
              source="Fuente · TGSS · AEAT · BOE"
              summary={`Bruto ${eur(bruto)}: neto ${eur(nomina.salarioNeto)}, cotización ${eur(nomina.cotTra)}, IRPF ${eur(nomina.irpfFinal)}.`}
            >
              <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} label="Reparto del salario bruto">
                {/* la llave superior: toda la barra es el bruto */}
                <Label x={X0} y={14} size={9.5} color="var(--ink-4)" mono>
                  SALARIO BRUTO ANUAL · {eur(bruto)}
                </Label>
                <line x1={X0} y1={26} x2={X1} y2={26} stroke="var(--ink)" strokeWidth={1} />
                <line x1={X0} y1={26} x2={X0} y2={33} stroke="var(--ink)" strokeWidth={1} />
                <line x1={X1} y1={26} x2={X1} y2={33} stroke="var(--ink)" strokeWidth={1} />

                {segmentos.map(seg => {
                  const dim = focus && focus !== seg.key && !pinned;
                  const centro = seg.x + seg.ancho / 2;
                  const cabe = seg.ancho > 118;
                  const cabeImporte = seg.ancho > 44;
                  return (
                    <g
                      key={seg.key}
                      opacity={dim ? 0.32 : 1}
                      onMouseEnter={() => {
                        setFocus(seg.key);
                        mostrar(seg);
                      }}
                      onMouseLeave={() => {
                        setFocus(null);
                        setTip(null);
                      }}
                      onClick={() => setPinned(p => (p === seg.key ? null : seg.key))}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* rótulo directo: nombre e importe encima de su propio tramo */}
                      {cabe && (
                        <Label x={round(centro)} y={52} size={9.5} color="var(--ink-4)" anchor="middle" mono>
                          {seg.label.toUpperCase()}
                        </Label>
                      )}
                      {cabeImporte && (
                        <Label
                          x={round(centro)}
                          y={70}
                          size={seg.ancho > 90 ? 15 : 12}
                          weight={800}
                          color={seg.colorNum || seg.color}
                          anchor="middle"
                        >
                          {eur(seg.valor)}
                        </Label>
                      )}
                      {cabeImporte && (
                        <line
                          x1={round(centro)}
                          y1={75}
                          x2={round(centro)}
                          y2={BAR_Y - 4}
                          stroke={seg.colorNum || seg.color}
                          strokeWidth={0.8}
                        />
                      )}

                      <rect className="fs-anim-rect" x={round(seg.x)} y={BAR_Y} width={round(seg.ancho)} height={BAR_H} fill={seg.color} rx={2} />
                      {seg.ancho > 44 && (
                        <text
                          className="fs-anim-text"
                          x={round(centro)}
                          y={BAR_Y + BAR_H / 2 + 5}
                          fontSize={14}
                          fontWeight={800}
                          textAnchor="middle"
                          fill={seg.key === 'ssTra' ? 'var(--ink)' : 'var(--bone)'}
                        >
                          {pct(seg.pctBruto, 0)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* eje del 0 al 100 % del bruto */}
                <line x1={X0} y1={BAR_Y + BAR_H + 8} x2={X1} y2={BAR_Y + BAR_H + 8} stroke="var(--rule)" strokeWidth={0.8} />
                {[0, 25, 50, 75, 100].map(v => (
                  <g key={v}>
                    <line
                      x1={round(x(v))}
                      y1={BAR_Y + BAR_H + 8}
                      x2={round(x(v))}
                      y2={BAR_Y + BAR_H + 13}
                      stroke="var(--ink-5)"
                      strokeWidth={0.7}
                    />
                    <Label
                      x={round(x(v))}
                      y={BAR_Y + BAR_H + 26}
                      size={9.5}
                      color="var(--ink-4)"
                      anchor={v === 0 ? 'start' : v === 100 ? 'end' : 'middle'}
                      mono
                    >
                      {pct(v, 0)}
                    </Label>
                  </g>
                ))}
                <Label x={X0} y={BAR_Y + BAR_H + 44} size={9} color="var(--ink-5)" mono>
                  PORCENTAJE DE TU SALARIO BRUTO
                </Label>
              </ChartFrame>

              <div className="fs-keys fs-keys-grid">
                {segmentos.map(seg => (
                  <button
                    key={seg.key}
                    type="button"
                    className={`fs-key fs-key-lg ${focus && focus !== seg.key && !pinned ? 'is-dim' : ''}`}
                    aria-pressed={pinned === seg.key}
                    onMouseEnter={() => {
                      setFocus(seg.key);
                      mostrar(seg);
                    }}
                    onMouseLeave={() => {
                      setFocus(null);
                      setTip(null);
                    }}
                    onFocus={() => setFocus(seg.key)}
                    onBlur={() => setFocus(null)}
                    onClick={() => setPinned(p => (p === seg.key ? null : seg.key))}
                  >
                    <span className="fs-key-swatch" style={{ background: seg.color }} />
                    <span>
                      <span className="fs-key-label">{seg.label}</span>
                      <span className="fs-key-big" style={{ color: seg.colorNum || seg.color }}>{eur(seg.valor)}</span>
                      <span className="fs-key-sub">
                        {pct(seg.pctBruto)} de tu bruto · {seg.sub}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Figure>

            <p className="fs-body" style={{ marginTop: 36, marginBottom: 48 }}>
              El recibo de la nómina enseña esos dos descuentos. Pero tu trabajo no le cuesta a la
              empresa <strong>{eur(bruto)}</strong>: le cuesta{' '}
              <strong>{eur(nomina.costeLab)}</strong>. La diferencia nunca aparece en ningún papel
              que tú firmes. Y entre el bruto y lo que Hacienda grava hay otra docena de pasos,
              cada uno con su artículo:
            </p>

            <Desglose />
          </div>
        </div>
      </div>
    </section>
  );
}
