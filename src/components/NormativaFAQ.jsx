import { useState } from 'react';
import { obtenerParametros, ANIOS, SMI_ANUAL, INFLACION_A_2026 } from '../engine/irpf';
import { eur, pct } from '../utils/format';
import { YEAR_COLORS } from './GraficoComparativo';

const HITOS = [
  {
    anios: [2012, 2013, 2014], color: '#ef4444', titulo: '2012–2014 · Crisis y tipos máximos',
    texto: 'Respuesta a la crisis de deuda soberana. Tipo marginal máximo: 52% (desde 300.000€), 7 tramos. Sin gastos deducibles fijos (Art.19) ni deducción SMI. Mínimo personal: 5.151€. La reducción Art.20 tiene umbrales muy inferiores a los actuales.',
    fuente: 'LIRPF redacción RDL 20/2011 y Ley 16/2012'
  },
  {
    anios: [2015], color: '#eab308', titulo: '2015 · Gran reforma fiscal — Ley 26/2014',
    texto: 'La mayor reforma del período: de 7 a 5 tramos, tipo máximo al 46%, mínimo al 19.5%. Se introducen los 2.000€ de gastos deducibles (Art.19.2.f LIRPF). Se amplían los umbrales del Art.20. Mínimo personal sube a 5.550€. Reforma que beneficia especialmente a rentas medias.',
    fuente: 'Ley 26/2014, de 27 de noviembre (BOE 28/11/2014)'
  },
  {
    anios: [2016, 2017], color: '#22c55e', titulo: '2016–2017 · Consolidación de la reforma',
    texto: 'Se completa la rebaja: primer tramo baja al 19%, máximo al 45%. La estructura de 5 tramos se consolida. La reducción Art.20 se estabiliza con los nuevos parámetros.',
    fuente: 'Ley 48/2015 (PGE 2016); art. único Ley 26/2014'
  },
  {
    anios: [2018], color: '#10b981', titulo: '2018 · Régimen transitorio Art.20',
    texto: 'Año singular: la reducción por rendimientos del trabajo se calcula como la media aritmética entre la normativa de 2017 y la de 2019 (disposición transitoria trigésimo primera LIRPF). Transición hacia la ampliación para rentas bajas aprobada en PGE 2018.',
    fuente: 'Ley 6/2018 PGE 2018; DT 31ª LIRPF'
  },
  {
    anios: [2019, 2020, 2021, 2022], color: '#06b6d4', titulo: '2019–2022 · Ampliación rentas bajas + SMI histórico',
    texto: 'Art.20: umbral inferior sube a 13.115€, reducción máxima a 5.565€ (RDL 28/2018). Mínimo exento de retención: 14.000€. El SMI da un salto histórico en 2019 (+22,3%) llegando a 900€/mes. COVID-19 (2020) provoca caída puntual del IPC. En 2021 se inicia el ciclo inflacionario (+6,5% IPC dic.).',
    fuente: 'RDL 28/2018 (SMI 2019); Ley 6/2018 (IRPF); RD 231/2020 (SMI 2020)'
  },
  {
    anios: [2023], color: '#6366f1', titulo: '2023 · MEI + nuevo tramo 47%',
    texto: 'Se amplía el Art.20: umbral 14.047,50€, reducción 6.498€. Mínimo exento: 15.000€. Nace el MEI (Mecanismo de Equidad Intergeneracional, art. 127 bis LGSS): 0,6% sobre base de contingencias comunes (5/6 empresa, 1/6 trabajador). Se crea el 6º tramo del 47% para bases superiores a 300.000€.',
    fuente: 'RDL 2/2023 (MEI y solidaridad); Orden HFP/1172/2022 (retenciones 2023)'
  },
  {
    anios: [2024, 2025, 2026], color: '#d946ef', titulo: '2024–2026 · Máxima protección rentas bajas + cotización solidaridad',
    texto: 'Art.20 alcanza su máximo: umbral 14.852€, reducción 7.302€ con doble pendiente (1,75€ y 1,14€ por €). Se introduce deducción directa en cuota para rentas próximas al SMI (340€ en 2025, 590,89€ en 2026 con phaseout hasta ~20.000€). Desde 2025: cotización de solidaridad sobre el exceso de la base máxima. MEI crece hasta 0,9% en 2026.',
    fuente: 'RDL 2/2023; Orden HFP/1/2024; Orden cotización SS 2025-2026'
  },
];

const FAQS = [
  {
    q: '¿Por qué el gráfico usa "euros constantes de 2026"?',
    a: 'Comparar 30.000€ de 2012 con 30.000€ de 2026 es un error financiero: debido a la inflación (aprox. +25% en este periodo), el dinero de 2012 tenía mucho más poder de compra. Si comparásemos euros nominales, parecería que hoy pagamos menos impuestos simplemente porque los números son más grandes.\n\nAl convertir todo a "Euros de 2026", eliminamos el ruido de los precios. Si una línea de 2015 está por encima de la de 2026 en el gráfico de salario neto, significa que en 2015 tenías más capacidad de compra real, independientemente de lo que pusiera en tu nómina. Es la única forma de ver si las reformas fiscales te han beneficiado o si la inflación se ha "comido" tus subidas.'
  },
  {
    q: '¿Qué es la "trampa de la inflación" en el IRPF?',
    a: 'Es lo que los economistas llaman "progresividad fría" o "bracket creep". El IRPF es un impuesto progresivo (paga más quien más gana), pero los tramos (19%, 24%, etc.) se definen en euros nominales. Si tu sueldo sube un 5% para igualar la inflación, tu poder adquisitivo es el mismo, pero Hacienda puede pasarte al siguiente tramo de impuestos.\n\nResultado: ganas lo mismo en términos reales, pero pagas un porcentaje mayor de IRPF. Esta herramienta permite visualizar este efecto: verás que en muchos años, aunque el neto nominal subía, el neto real (en euros de 2026) bajaba o se estancaba.'
  },
  {
    q: '¿Qué es el IRPF y cómo funciona?',
    a: 'El Impuesto sobre la Renta de las Personas Físicas es un impuesto personal, progresivo y directo sobre la renta obtenida en España (arts. 1-14 LIRPF). \"Progresivo\" significa que a mayor renta, mayor tipo aplicable. Para trabajadores por cuenta ajena, el empleador actúa como retenedor: calcula y retiene mensualmente el IRPF e ingresa en Hacienda.\n\nEl cálculo sigue este orden crítico: del Salario Bruto se restan las Cotizaciones SS (Paso 1), el resultado es el Rendimiento Neto. A este se le restan los Gastos Deducibles (Art. 19) y la Reducción por Trabajo (Art. 20) para obtener la Base Imponible. Solo sobre esta última se aplica la tarifa por tramos.'
  },
  {
    q: '¿Qué es la reducción Art.20 y por qué es tan importante?',
    a: 'Es el Art. 20 de la LIRPF (\"Reducción por obtención de rendimientos del trabajo\") y es la herramienta que usa el Estado para que las rentas bajas no paguen (o paguen muy poco) IRPF sin tener que bajar los impuestos a todo el mundo.\n\nFunciona con dos umbrales: por debajo del inferior (aprox. el SMI), la reducción es máxima y suele anular el impuesto. Entre ambos umbrales, la reducción desaparece progresivamente. El problema es que en esa zona de desaparición se crea el \"efecto cliff\": cada euro extra que ganas te quita parte de la reducción, por lo que tu base imponible sube más de un euro por cada euro ganado. Esto explica por qué el tipo marginal efectivo es tan alto para salarios entre 15.000€ y 20.000€.'
  },
  {
    q: 'Diferencia entre Mínimo Personal y Mínimo Exento',
    a: 'Es la confusión más común. El Mínimo Personal (Art. 57, aprox. 5.550€) es una cantidad que no tributa para nadie; se resta al final del cálculo. El Mínimo Exento de Retención (aprox. 15.876€ en 2026), sin embargo, es el umbral por debajo del cual la ley prohíbe a tu empresa retenerte nada de IRPF.\n\nSi ganas 15.000€, tu mínimo exento es mayor que tu sueldo, así que tu retención es 0%. Pero si ganas 16.000€, ya superas el mínimo exento y empiezas a pagar IRPF sobre todo lo que exceda del mínimo personal y las reducciones. Por eso, al pasar el mínimo exento, el neto puede no subir tanto como el bruto.'
  },
  {
    q: '¿Qué son los 2.000€ de gastos deducibles (Art.19.2.f)?',
    a: 'Introducidos en 2015, son una cantidad fija que se resta de tu sueldo bruto para compensar los gastos que conlleva trabajar (ropa, transporte, etc.). No necesitas facturas para justificarlos; se aplican por defecto a todos los trabajadores.\n\nEs importante porque reduce la Base Imponible directamente. Para una persona en el tramo del 19%, estos 2.000€ suponen un ahorro real de 380€ al año en impuestos.'
  },
  {
    q: '¿Qué es el tipo marginal y por qué puede superar el 40% en rentas medias?',
    a: 'El tipo marginal es el impuesto que pagas por el \"siguiente euro\" que ganas. Si te suben el sueldo 1.000€ y Hacienda se queda con 400€, tu marginal es del 40%.\n\nEn España, el tipo marginal efectivo es engañoso: aunque los tramos oficiales dicen 19% o 24%, en las rentas entre 15k y 20k el marginal real se dispara. ¿Por qué? Porque al ganar más sueldo, pierdes la reducción del Art. 20. Esa pérdida de un beneficio actúa como un impuesto invisible adicional.'
  },

];

const FUENTES = [
  {
    concepto: 'Escalas IRPF (tarifa)',
    fuente: 'Art. 63-64 LIRPF (BOE-A-2006-20764)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a63'
  },
  {
    concepto: 'Reducción Art.20 — redacción 2026',
    fuente: 'Art. 20 LIRPF (BOE)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a20'
  },
  {
    concepto: 'Reducción Art.20 — redacción 2019',
    fuente: 'RDL 28/2018, art. 59 (BOE-A-2018-9268)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268#ar-59'
  },
  {
    concepto: 'Gastos deducibles Art.19.2.f',
    fuente: 'Art. 19 LIRPF (BOE)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a19'
  },
  {
    concepto: 'Mínimo del contribuyente Art.57',
    fuente: 'Art. 57 LIRPF (BOE)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a57'
  },
  {
    concepto: 'Deducción por obtención de rentas del trabajo (SMI)',
    fuente: 'AEAT — Manual IRPF 2025',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html'
  },
  {
    concepto: 'Cotizaciones SS trabajadores 2026 (TGSS)',
    fuente: 'Seguridad Social — Trabajadores',
    url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537'
  },
  {
    concepto: 'Cotizaciones SS 2019 (archivado)',
    fuente: 'Wayback Machine — TGSS 2019',
    url: 'https://web.archive.org/web/20190223131030/https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537'
  },
  {
    concepto: 'IPC acumulado dic.2019 / dic.2025 (INE)',
    fuente: 'INE — Variaciones del IPC',
    url: 'https://www.ine.es/varipc/verVariaciones.do?idmesini=12&anyoini=2019&idmesfin=12&anyofin=2025&ntipo=1&enviar=Calcular'
  },
  {
    concepto: 'MEI y cotización de solidaridad',
    fuente: 'RDL 2/2023, art. 127 bis y 19 bis LGSS',
    url: null
  },
  {
    concepto: 'SMI histórico',
    fuente: 'RD aprobado cada año (BOE oficial de cada ejercicio)',
    url: null
  },
];

export default function NormativaFAQ({ anioRef }) {
  const [anioSel, setAnioSel] = useState(anioRef || 2026);
  const [faqAbierta, setFaqAbierta] = useState(null);
  const [mostrarFuentes, setMostrarFuentes] = useState(false);
  const params = obtenerParametros(anioSel);
  const hito = HITOS.find(h => h.anios.includes(anioSel));

  return (
    <div className="space-y-12">
      {/* Línea temporal */}
      <section>
        <h3 className="text-lg font-serif font-extrabold text-[var(--text-h)] mb-6 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
          Historia normativa año a año
        </h3>
        <div className="flex gap-1.5 flex-wrap mb-6">
          {ANIOS.map(a => (
            <button key={a} onClick={() => setAnioSel(a)}
              className={`year-btn ${anioSel === a ? 'active' : ''}`}
              style={anioSel === a ? { background: YEAR_COLORS[a], borderColor: YEAR_COLORS[a] } : {}}>
              {a}
            </button>
          ))}
        </div>
        {hito && (
          <div className="rounded-3xl p-6 relative overflow-hidden mb-8 transition-all duration-500 border border-[var(--border)]"
            style={{
              borderLeft: `4px solid ${hito.color}`,
              background: 'var(--surface2)',
            }}>
            <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.03]" style={{ background: `radial-gradient(circle, ${hito.color}, transparent 70%)` }} />
            <h4 className="font-extrabold text-sm mb-3 uppercase tracking-wider" style={{ color: hito.color }}>{hito.titulo}</h4>
            <p className="text-[14px] text-[var(--text)] leading-relaxed mb-4">{hito.texto}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--text-soft)] font-medium flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
                Fuente:
              </span>
              <span className="text-[11px] text-[var(--text-soft)] italic">{hito.fuente}</span>
            </div>
          </div>
        )}

        {/* Ficha técnica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-7">
            <h4 className="text-xs font-bold text-[var(--text-soft)] mb-6 uppercase tracking-[0.15em]">Parámetros técnicos — {anioSel}</h4>
            <div className="space-y-1">
              {[
                ['Base máx. cotización', eur(params.baseMax)],
                ['SMI anual', eur(SMI_ANUAL[anioSel])],
                ['SS empresa (total)', pct(params.tipoEmp * 100)],
                ['SS trabajador (total)', pct(params.tipoTra * 100)],
                params.mei[1] > 0 && ['  del que MEI trabajador', pct(params.mei[1] * 100, 3)],
                ['Gastos deducibles Art.19', params.gastosFijos > 0 ? eur(params.gastosFijos) : 'No aplica (pre-2015)'],
                ['Mínimo personal Art.57', eur(params.irpfMinimo)],
                ['Mínimo exento retención', eur(params.minimoExento)],
                typeof params.art20Meta.uInf === 'number' && ['Art.20 — Umbral inferior', eur(params.art20Meta.uInf)],
                typeof params.art20Meta.rMax === 'number' && ['Art.20 — Reducción máxima', eur(params.art20Meta.rMax)],
                typeof params.art20Meta.uSup === 'number' && ['Art.20 — Umbral superior', eur(params.art20Meta.uSup)],
                params.art20Meta.label && ['Art.20', params.art20Meta.label],
                params.hasSolidaridad && ['Cotización solidaridad', 'Sí (sobre exceso base máx.)'],
              ].filter(Boolean).map(([l, v]) => (
                <div key={l} className="flex justify-between py-2.5 border-b border-[var(--border)] last:border-0 group hover:bg-[var(--surface2)]/50 -mx-2 px-2 rounded-xl transition-all">
                  <span className="text-[12px] text-[var(--text)] group-hover:text-[var(--text-h)] transition-colors">{l}</span>
                  <span className="text-[12px] font-mono font-bold text-[var(--text-h)]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-7">
            <h4 className="text-xs font-bold text-[var(--text-soft)] mb-6 uppercase tracking-[0.15em]">Escala de gravamen — {anioSel}</h4>
            <div className="space-y-4">
              {params.tramos.map(([lim, tipo], i) => {
                const prev = i === 0 ? 0 : params.tramos[i - 1][0];
                const label = lim === Infinity ? `Desde ${eur(prev)}` : `${eur(prev)} – ${eur(lim)}`;
                const maxTipo = Math.max(...params.tramos.map(([, t]) => t));
                return (
                  <div key={i} className="flex flex-col gap-1.5 group">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] text-[var(--text-soft)] group-hover:text-[var(--text)] transition-colors">{label}</span>
                      <span className="text-[12px] font-mono font-black" style={{ color: YEAR_COLORS[anioSel] }}>
                        {(tipo * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${tipo / maxTipo * 100}%`, background: `linear-gradient(90deg, ${YEAR_COLORS[anioSel]}, ${YEAR_COLORS[anioSel]}aa)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="divider-glow my-6" />
            <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-soft)] mb-1.5 font-bold uppercase tracking-wider">Inflación acumulada {anioSel}→2026</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-[var(--text-h)]">×{INFLACION_A_2026[anioSel].toFixed(4)}</span>
                <span className="text-emerald-500 font-bold text-sm">+{((INFLACION_A_2026[anioSel] - 1) * 100).toFixed(1)}%</span>
              </div>
              <p className="text-[10px] text-[var(--text-soft)] mt-2 leading-relaxed">Multiplicador aplicado para calcular el valor real de los euros de {anioSel} en la actualidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h3 className="text-lg font-serif font-extrabold text-[var(--text-h)] mb-6 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
          Preguntas frecuentes
        </h3>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="card faq-item border border-[var(--border)]">
              <button onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                className="faq-toggle w-full flex justify-between items-center p-5 text-left transition-all">
                <span className="text-[14px] font-bold text-[var(--text-h)] pr-4 leading-snug">{f.q}</span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 border border-[var(--border)] transition-all duration-300 ${faqAbierta === i ? 'bg-[var(--accent)] text-white border-[var(--accent)] rotate-45' : 'text-[var(--accent)]'}`}>
                  +
                </span>
              </button>
              {faqAbierta === i && (
                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="h-px bg-[var(--border)] mb-4" />
                  {f.a.split('\n\n').map((par, j) => (
                    <p key={j} className="text-[13.5px] text-[var(--text)] leading-relaxed mt-3">{par}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Fuentes con URLs */}
      <section>
        <button onClick={() => setMostrarFuentes(v => !v)}
          className="flex items-center gap-3 text-[13px] font-bold text-[var(--text-soft)] hover:text-[var(--text-h)] transition-colors mb-6 group">
          <span className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-dim)] transition-all">
            <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          </span>
          {mostrarFuentes ? 'Ocultar' : 'Ver'} todas las fuentes y referencias legales
        </button>
        {mostrarFuentes && (
          <div className="card overflow-hidden border border-[var(--border)] animate-in fade-in duration-500">
            <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface2)]">
              <p className="text-[12px] text-[var(--text-soft)] leading-relaxed">
                Este simulador implementa la normativa estatal de la <strong className="text-[var(--text-h)]">LIRPF</strong> (Ley del IRPF) y la <strong className="text-[var(--text-h)]">LGSS</strong> (Ley General de la Seguridad Social).
                Los datos históricos y multiplicadores de inflación se basan en el <strong className="text-[var(--text-h)]">INE</strong> y el <strong className="text-[var(--text-h)]">BOE</strong>.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left w-64 px-6 py-4 text-[11px] uppercase tracking-wider text-[var(--text-soft)]">Concepto legal</th>
                    <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-[var(--text-soft)]">Referencia oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {FUENTES.map(f => (
                    <tr key={f.concepto} className="hover:bg-[var(--surface2)]/30 transition-colors">
                      <td className="font-bold text-[var(--text-h)] px-6 py-4 align-top text-[13px]">{f.concepto}</td>
                      <td className="px-6 py-4 align-top">
                        {f.url
                          ? <a href={f.url} target="_blank" rel="noopener noreferrer"
                            className="text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors inline-flex items-center gap-1.5 font-medium text-[13px]">
                            {f.fuente}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                          </a>
                          : <span className="text-[var(--text-soft)] text-[13px]">{f.fuente}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
