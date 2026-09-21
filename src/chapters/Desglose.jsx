import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import Figure from '../figures/Figure';
import { eur, pct } from '../utils/format';

const BOE = 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1';
const TGSS = 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537';

/**
 * FIG. 03 — EL DESGLOSE COMPLETO.
 * Every legal step from labour cost to net pay, with its formula, its article
 * and its source. Each row is a switch: open it and the rail-style detail
 * unfolds in place, with the running figure always on the right.
 */
export default function Desglose() {
  const { bruto, anio, pagas, nomina, params, opts } = useFiscal();
  const [abierto, setAbierto] = useState('J');

  const esAutonomo = nomina.regimen === 'autonomo';

  const tramos = useMemo(() => {
    let prev = 0;
    const out = [];
    for (const [lim, tipo] of nomina.tramos) {
      const dentro = Math.max(0, Math.min(nomina.baseImponible, lim) - prev);
      if (dentro > 0 || prev < nomina.baseImponible) {
        out.push({ desde: prev, hasta: lim, tipo, dentro, cuota: dentro * tipo });
      }
      prev = lim;
      if (prev >= nomina.baseImponible) break;
    }
    return out;
  }, [nomina.tramos, nomina.baseImponible]);

  const limiteActivo = nomina.limiteRetencion < nomina.cuotaSMI && nomina.cuotaSMI > 0;

  const pasos = [
    {
      k: 'A',
      titulo: 'Coste laboral total',
      sub: 'Lo que tu empresa desembolsa por ti',
      valor: nomina.costeLab,
      formula: `${eur(bruto)} + ${eur(nomina.cotEmp)} = ${eur(nomina.costeLab)}`,
      texto: esAutonomo
        ? 'En el régimen de autónomos no existe una parte empresarial: el coste de tu actividad coincide con tu rendimiento íntegro.'
        : 'Tu salario bruto más la cotización que la empresa ingresa a la Seguridad Social por tenerte contratado. Es el precio real de tu puesto de trabajo.',
      fuente: ['TGSS — Bases y tipos de cotización', TGSS],
    },
    {
      k: 'B',
      titulo: esAutonomo ? 'Sin cotización patronal' : 'Cotización de la empresa',
      sub: esAutonomo ? 'No aplica en el RETA' : `${pct(params.tipoEmp * 100, 2)} de la base de cotización`,
      valor: -nomina.cotEmp,
      formula: esAutonomo
        ? '—'
        : `mín(${eur(bruto)}, ${eur(params.baseMax)}) × ${pct(params.tipoEmp * 100, 2)} = ${eur(nomina.cotEmp)}`,
      texto: esAutonomo
        ? 'Como autónomo asumes íntegramente tu cotización; no hay contraparte empresarial.'
        : `Contingencias comunes (23,60 %), desempleo (5,50 %), FOGASA (0,20 %), formación profesional (0,60 %) y accidentes de trabajo (1,50 %)${params.mei[0] > 0 ? `, más el MEI (${pct(params.mei[0] * 100, 2)})` : ''}. Nunca aparece en tu recibo de nómina.`,
      fuente: ['TGSS — Cotización', TGSS],
    },
    {
      k: 'C',
      titulo: 'Salario bruto anual',
      sub: 'La cifra de tu contrato',
      valor: bruto,
      formula: `${eur(bruto)} ÷ 12 = ${eur(bruto / 12)} · ÷ 14 = ${eur(bruto / 14)}`,
      texto: 'Lo único que negocias y lo único que la mayoría de la gente llama «su sueldo». Todo lo que viene a continuación se descuenta de aquí.',
    },
    {
      k: 'D',
      titulo: esAutonomo ? 'Cuota de autónomos' : 'Cotización del trabajador',
      sub: esAutonomo ? 'Según el tramo de rendimientos netos' : `${pct(params.tipoTra * 100, 2)} de la base de cotización`,
      valor: -nomina.cotTra,
      formula: esAutonomo
        ? `Base del tramo × 12 × tipo combinado = ${eur(nomina.cotTra)}`
        : `mín(${eur(bruto)}, ${eur(params.baseMax)}) × ${pct(params.tipoTra * 100, 2)} = ${eur(nomina.cotTra)}`,
      texto: esAutonomo
        ? 'Desde 2023 la cuota depende de los rendimientos netos previstos, repartidos en quince tramos (RDL 13/2022). Antes se aplicaba una base mínima prácticamente fija.'
        : `Contingencias comunes (4,70 %), desempleo (1,55 %), formación profesional (0,10 %)${params.mei[1] > 0 ? ` y MEI (${pct(params.mei[1] * 100, 2)})` : ''}. La base está topada en ${eur(params.baseMax)} en ${anio}: por encima de ese salario, la cotización deja de crecer.`,
      fuente: ['TGSS — Bases y tipos de cotización', TGSS],
    },
    {
      k: 'E',
      titulo: 'Rendimiento íntegro del trabajo',
      sub: 'El punto de partida del IRPF',
      valor: nomina.rnPrevio,
      formula: `${eur(bruto)} − ${eur(nomina.cotTra)} = ${eur(nomina.rnPrevio)}`,
      texto: 'La Seguridad Social se descuenta antes que el IRPF: Hacienda no grava lo que ya se ha ido en cotizaciones.',
      fuente: ['BOE — LIRPF art. 19', `${BOE}#a19`],
    },
    {
      k: 'F',
      titulo: 'Gastos deducibles del art. 19.2.f',
      sub: anio >= 2015 ? 'Los 2.000 € de «otros gastos»' : 'No existían antes de 2015',
      valor: -nomina.gastosFijos,
      formula: anio >= 2015 ? `${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)}` : '—',
      texto:
        anio >= 2015
          ? 'Una cantidad fija que se resta sin necesidad de justificarla, para compensar los gastos que conlleva trabajar. Se introdujo con la reforma de 2015.'
          : 'Esta deducción no existía: la reforma de la Ley 26/2014 la creó con efectos desde 2015.',
      fuente: ['BOE — LIRPF art. 19.2.f', `${BOE}#a19`],
    },
    {
      k: 'G',
      titulo: 'Reducción por rendimientos del trabajo',
      sub: 'Art. 20 — la palanca que protege a las rentas bajas',
      valor: -nomina.redTrabajo,
      formula:
        typeof params.art20Meta.uInf === 'number'
          ? `Máxima ${eur(params.art20Meta.rMax)} hasta ${eur(params.art20Meta.uInf)} · cero desde ${eur(params.art20Meta.uSup)}`
          : 'Régimen transitorio: media entre la redacción de 2017 y la de 2019',
      texto:
        nomina.redTrabajo > 0
          ? `A tu nivel de renta la reducción es de ${eur(nomina.redTrabajo)}. Se retira progresivamente al subir el rendimiento, y esa retirada es la causa del acantilado que verás en el capítulo 03.`
          : 'A tu nivel de renta esta reducción ya se ha agotado por completo. Sólo actúa por debajo del umbral superior del art. 20.',
      fuente: ['BOE — LIRPF art. 20', `${BOE}#a20`],
    },
    {
      k: 'H',
      titulo: 'Base imponible',
      sub: 'La cifra que realmente se grava',
      valor: nomina.baseImponible,
      formula: `${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)} − ${eur(nomina.redTrabajo)}${nomina.reduccionConjunta > 0 ? ` − ${eur(nomina.reduccionConjunta)}` : ''} = ${eur(nomina.baseImponible)}`,
      texto: `No es dinero que se te descuente: es la cantidad sobre la que se aplica la escala progresiva. Está ${eur(bruto - nomina.baseImponible)} por debajo de tu bruto.${nomina.reduccionConjunta > 0 ? ` Incluye la reducción por tributación conjunta (${eur(nomina.reduccionConjunta)}).` : ''}`,
    },
    {
      k: 'I',
      titulo: 'Mínimo personal y familiar',
      sub: 'La renta vital que no tributa',
      valor: nomina.minimoPersonalYFamiliar,
      formula: `${eur(nomina.minimoPersonal)} personal${nomina.minimoFamiliar > 0 ? ` + ${eur(nomina.minimoFamiliar)} familiar` : ''} = ${eur(nomina.minimoPersonalYFamiliar)}`,
      texto: `No se resta de la base: se calcula su cuota con la misma escala y esa cuota se descuenta al final. Por eso todo el mundo se beneficia de la misma cantidad, gane lo que gane.${opts.nHijos > 0 ? ` Tus ${opts.nHijos} hijo${opts.nHijos > 1 ? 's' : ''} a cargo aportan ${eur(nomina.minimoFamiliar)}.` : ''}`,
      fuente: ['BOE — LIRPF arts. 56-61', `${BOE}#a57`],
      tabla:
        nomina.minimoFamiliar > 0
          ? {
              cabeceras: ['Concepto', 'Importe'],
              filas: [
                ['Mínimo del contribuyente', eur(nomina.minimoPersonal)],
                ['Mínimo por descendientes y ascendientes', eur(nomina.minimoFamiliar)],
                ['Total', eur(nomina.minimoPersonalYFamiliar)],
              ],
            }
          : null,
    },
    {
      k: 'J',
      titulo: 'Cuota íntegra por tramos',
      sub: 'Aquí está la progresividad, tramo a tramo',
      valor: nomina.cuotaIntegra,
      formula: tramos.map(t => `${eur(t.dentro)} × ${pct(t.tipo * 100)}`).join('  +  ') + ` = ${eur(nomina.cuotaIntegra)}`,
      texto: 'Cada tramo grava sólo la parte de tu base que cae dentro de él. Ningún tipo se aplica nunca a todo tu sueldo.',
      fuente: ['BOE — LIRPF art. 63', `${BOE}#a63`],
      tabla: {
        cabeceras: ['Tramo', 'Tu base dentro', 'Tipo', 'Cuota que genera'],
        filas: tramos.map(t => [
          `${eur(t.desde)} — ${Number.isFinite(t.hasta) ? eur(t.hasta) : '∞'}`,
          eur(t.dentro),
          pct(t.tipo * 100),
          eur(t.cuota),
        ]),
        total: ['Cuota íntegra', '', '', eur(nomina.cuotaIntegra)],
      },
    },
    {
      k: 'K',
      titulo: 'Cuota del mínimo personal y familiar',
      sub: 'Se resta de la cuota, no de la base',
      valor: -nomina.cuotaMinimo,
      formula: `${eur(nomina.cuotaIntegra)} − ${eur(nomina.cuotaMinimo)} = ${eur(nomina.cuotaTeorica)}`,
      texto: `La misma escala aplicada a ${eur(nomina.minimoPersonalYFamiliar)} produce ${eur(nomina.cuotaMinimo)}, que se descuentan de la cuota íntegra.`,
      fuente: ['BOE — LIRPF art. 63', `${BOE}#a63`],
    },
    ...(nomina.deduccionSMI > 0
      ? [
          {
            k: 'L',
            titulo: 'Deducción por obtención de rendimientos del trabajo',
            sub: 'El descuento extra para salarios próximos al SMI',
            valor: -nomina.deduccionSMI,
            formula: `${eur(nomina.cuotaTeorica)} − ${eur(nomina.deduccionSMI)} = ${eur(nomina.cuotaSMI)}`,
            texto: 'Una deducción directa en cuota que se retira progresivamente a medida que el salario se aleja del mínimo interprofesional.',
            fuente: [
              'AEAT — Deducción por obtención de rendimientos del trabajo',
              'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html',
            ],
          },
        ]
      : []),
    ...(limiteActivo
      ? [
          {
            k: 'M',
            titulo: 'Límite del 43 % de retención',
            sub: 'Un tope reglamentario que te afecta',
            valor: nomina.limiteRetencion,
            formula: `(${eur(bruto)} − ${eur(params.minimoExento)}) × 43 % = ${eur(nomina.limiteRetencion)}`,
            texto: 'La retención no puede superar el 43 % de la diferencia entre el bruto y el mínimo exento de retención. En tu caso ese tope es menor que la cuota calculada, así que es el que se aplica.',
            fuente: ['BOE — RIRPF art. 85.3', 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820'],
          },
        ]
      : []),
    {
      k: 'N',
      titulo: 'IRPF final',
      sub: `Tipo efectivo ${pct(nomina.tipoEfectivoIRPF * 100)} sobre el bruto`,
      valor: -nomina.irpfFinal,
      formula: `${eur(nomina.irpfFinal)} ÷ ${eur(bruto)} = ${pct(nomina.tipoEfectivoIRPF * 100)}`,
      texto: 'Lo que Hacienda retiene a lo largo del año. La declaración de la renta ajusta después esta cifra con el resto de tu situación fiscal.',
    },
    {
      k: 'O',
      titulo: 'Salario neto',
      sub: `${eur(nomina.salarioNeto / pagas)} al mes en ${pagas} pagas`,
      valor: nomina.salarioNeto,
      total: true,
      formula: `${eur(bruto)} − ${eur(nomina.cotTra)} − ${eur(nomina.irpfFinal)} = ${eur(nomina.salarioNeto)}`,
      texto: `De los ${eur(nomina.costeLab)} que costó tu trabajo llegan ${eur(nomina.salarioNeto)}: ${pct((nomina.salarioNeto / Math.max(nomina.costeLab, 1)) * 100)} del total.`,
    },
  ];

  return (
    <Figure
      id="03"
      title="El desglose completo, paso a paso"
      sub={`${anio} · ${esAutonomo ? 'régimen de autónomos' : 'asalariado'} · cada paso con su fórmula, su artículo y su fuente`}
      legend="Abre cualquier paso para ver el cálculo · los importes en negativo se restan"
      source="Fuente · BOE (LIRPF y RIRPF) · TGSS · AEAT"
      summary={pasos.map(p => `${p.k}: ${p.titulo} ${eur(p.valor)}`).join('. ')}
    >
      <ol className="fs-steps">
        {pasos.map(p => {
          const open = abierto === p.k;
          return (
            <li key={p.k} className={`fs-stepline ${p.total ? 'is-total' : ''} ${open ? 'is-open' : ''}`}>
              <button
                type="button"
                className="fs-stepline-head"
                aria-expanded={open}
                onClick={() => setAbierto(open ? null : p.k)}
              >
                <span className="fs-stepline-k">{p.k}</span>
                <span className="fs-stepline-t">
                  {p.titulo}
                  <span className="fs-stepline-s">{p.sub}</span>
                </span>
                <span className={`fs-stepline-v ${p.valor < 0 ? 'is-neg' : ''}`}>
                  {p.valor < 0 ? `−${eur(Math.abs(p.valor))}` : eur(p.valor)}
                </span>
              </button>

              {open && (
                <div className="fs-stepline-body">
                  <p className="fs-note" style={{ maxWidth: '72ch' }}>{p.texto}</p>
                  {p.formula && p.formula !== '—' && <p className="fs-formula">{p.formula}</p>}

                  {p.tabla && (
                    <div className="fs-table-scroll" style={{ marginTop: 12 }}>
                      <table className="fs-table">
                        <thead>
                          <tr>
                            {p.tabla.cabeceras.map(c => (
                              <th key={c} scope="col">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {p.tabla.filas.map((f, i) => (
                            <tr key={i}>
                              {f.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                            </tr>
                          ))}
                          {p.tabla.total && (
                            <tr className="is-current">
                              {p.tabla.total.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {p.fuente && (
                    <p className="fs-source">
                      Fuente ·{' '}
                      <a href={p.fuente[1]} target="_blank" rel="noreferrer noopener">
                        {p.fuente[0]}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Figure>
  );
}
