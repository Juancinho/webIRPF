import { useState } from 'react';
import { obtenerParametros, ANIOS, SMI_ANUAL, INFLACION_A_2026 } from '../engine/irpf';
import { eur, pct } from '../utils/format';
import { YEAR_COLORS } from './GraficoComparativo';

const HITOS = [
  { anios:[2012,2013,2014], color:'#f87171', titulo:'2012–2014 · Crisis y tipos máximos',
    texto:'Respuesta a la crisis de deuda soberana. Tipo marginal máximo: 52% (desde 300.000€), 7 tramos. Sin gastos deducibles fijos (Art.19) ni deducción SMI. Mínimo personal: 5.151€. La reducción Art.20 tiene umbrales muy inferiores a los actuales.',
    fuente:'LIRPF redacción RDL 20/2011 y Ley 16/2012' },
  { anios:[2015], color:'#facc15', titulo:'2015 · Gran reforma fiscal — Ley 26/2014',
    texto:'La mayor reforma del período: de 7 a 5 tramos, tipo máximo al 46%, mínimo al 19.5%. Se introducen los 2.000€ de gastos deducibles (Art.19.2.f LIRPF). Se amplían los umbrales del Art.20. Mínimo personal sube a 5.550€. Reforma que beneficia especialmente a rentas medias.',
    fuente:'Ley 26/2014, de 27 de noviembre (BOE 28/11/2014)' },
  { anios:[2016,2017], color:'#a3e635', titulo:'2016–2017 · Consolidación de la reforma',
    texto:'Se completa la rebaja: primer tramo baja al 19%, máximo al 45%. La estructura de 5 tramos se consolida. La reducción Art.20 se estabiliza con los nuevos parámetros.',
    fuente:'Ley 48/2015 (PGE 2016); art. único Ley 26/2014' },
  { anios:[2018], color:'#34d399', titulo:'2018 · Régimen transitorio Art.20',
    texto:'Año singular: la reducción por rendimientos del trabajo se calcula como la media aritmética entre la normativa de 2017 y la de 2019 (disposición transitoria trigésimo primera LIRPF). Transición hacia la ampliación para rentas bajas aprobada en PGE 2018.',
    fuente:'Ley 6/2018 PGE 2018; DT 31ª LIRPF' },
  { anios:[2019,2020,2021,2022], color:'#38bdf8', titulo:'2019–2022 · Ampliación rentas bajas + SMI histórico',
    texto:'Art.20: umbral inferior sube a 13.115€, reducción máxima a 5.565€ (RDL 28/2018). Mínimo exento de retención: 14.000€. El SMI da un salto histórico en 2019 (+22,3%) llegando a 900€/mes. COVID-19 (2020) provoca caída puntual del IPC. En 2021 se inicia el ciclo inflacionario (+6,5% IPC dic.).',
    fuente:'RDL 28/2018 (SMI 2019); Ley 6/2018 (IRPF); RD 231/2020 (SMI 2020)' },
  { anios:[2023], color:'#a78bfa', titulo:'2023 · MEI + nuevo tramo 47%',
    texto:'Se amplía el Art.20: umbral 14.047,50€, reducción 6.498€. Mínimo exento: 15.000€. Nace el MEI (Mecanismo de Equidad Intergeneracional, art. 127 bis LGSS): 0,6% sobre base de contingencias comunes (5/6 empresa, 1/6 trabajador). Se crea el 6º tramo del 47% para bases superiores a 300.000€.',
    fuente:'RDL 2/2023 (MEI y solidaridad); Orden HFP/1172/2022 (retenciones 2023)' },
  { anios:[2024,2025,2026], color:'#e879f9', titulo:'2024–2026 · Máxima protección rentas bajas + cotización solidaridad',
    texto:'Art.20 alcanza su máximo: umbral 14.852€, reducción 7.302€ con doble pendiente (1,75€ y 1,14€ por €). Se introduce deducción directa en cuota para rentas próximas al SMI (340€ en 2025, 590,89€ en 2026 con phaseout hasta ~20.000€). Desde 2025: cotización de solidaridad sobre el exceso de la base máxima. MEI crece hasta 0,9% en 2026.',
    fuente:'RDL 2/2023; Orden HFP/1/2024; Orden cotización SS 2025-2026' },
];

const FAQS = [
  { q:'¿Qué es el IRPF y cómo funciona?',
    a:'El Impuesto sobre la Renta de las Personas Físicas es un impuesto personal, progresivo y directo sobre la renta obtenida en España (arts. 1-14 LIRPF). "Progresivo" significa que a mayor renta, mayor tipo aplicable. Para trabajadores por cuenta ajena, el empleador actúa como retenedor: calcula y retiene mensualmente el IRPF e ingresa en Hacienda.\n\nEl cálculo parte del bruto anual, se restan las cotizaciones SS, los gastos deducibles del Art.19 y la reducción Art.20, para obtener la base imponible. A ésta se aplica la tarifa por tramos (arts. 63-64 LIRPF), se resta la cuota del mínimo personal (art. 57), y el resultado es el IRPF a pagar.' },
  { q:'¿Qué es la reducción Art.20 y por qué es tan importante?',
    a:'Es el Art. 20 de la LIRPF ("Reducción por obtención de rendimientos del trabajo") y ha sido la palanca principal para proteger rentas bajas sin modificar la tarifa general.\n\nFunciona con dos umbrales: por debajo del inferior, la reducción es máxima (puede hacer la base imponible = 0). Entre ambos umbrales cae linealmente. Por encima del superior es cero. Desde 2012 a 2026 los umbrales casi se han doblado y la reducción máxima pasó de 4.080€ a 7.302€.\n\nImportante: en la zona entre umbrales se crean tipos marginales efectivos muy elevados (la "zona cliff"), porque ganar 1€ más de bruto puede reducir la reducción en 1,14–1,75€, haciendo que la base imponible crezca más que el ingreso bruto.' },
  { q:'¿Qué son los 2.000€ de gastos deducibles (Art.19.2.f)?',
    a:'Son gastos "de difícil justificación" introducidos en la reforma de 2015 (Ley 26/2014): desplazamientos, vestuario laboral, formación no reembolsada, etc. Se restan del rendimiento bruto ANTES de calcular el Art.20. Fuente: Art. 19.2.f) LIRPF.\n\nAntes de 2015 no existían. Para rentas bajas, 2.000€ menos de base imponible al 19% equivalen a 380€ menos de IRPF, lo que puede significar pasar de pagar IRPF a no pagar nada.' },
  { q:'¿Qué es el tipo marginal y por qué puede ser engañosamente alto?',
    a:'El tipo marginal es el porcentaje que pagas sobre el siguiente euro que ganas. En teoría sigue los tramos de la tarifa (19%, 24%, 30%...). En la práctica, el tipo marginal efectivo puede ser mucho más alto en la zona del Art.20 porque al subir el sueldo pierdes parte de la reducción.\n\nEjemplo (2026): si tu rendimiento neto previo está entre 14.852€ y 17.673€, por cada €100 extra de bruto tu reducción Art.20 cae 1,75€, haciendo que la base imponible crezca 101,75€ por cada €100 de bruto. Si tributan al 19%: IRPF marginal = 19,3% + 6,35% SS = ~25,6% total. En el tramo de pendiente 1,14 puede alcanzar el 40% y más.' },
  { q:'¿Por qué el gráfico usa "euros constantes de 2026"?',
    a:'Para comparar poder adquisitivo real entre años hay que descontar la inflación. 30.000€ en 2012 no compran lo mismo que en 2026: los precios han subido aproximadamente un 25% entre esas fechas.\n\nUsamos el IPC diciembre a diciembre (INE) para calcular la inflación acumulada. Fuente: INE — Variaciones del IPC. Al mostrar todo en €2026 se puede comparar directamente: "¿cobré más en términos reales en 2015 que en 2023?".' },
  { q:'¿Qué son el MEI y la cotización de solidaridad?',
    a:'El MEI (Mecanismo de Equidad Intergeneracional, art. 127 bis LGSS, desde 2023) es una cotización adicional sobre la base de contingencias comunes destinada a reponer el Fondo de Reserva de Pensiones. Lo pagan empresa (5/6) y trabajador (1/6). Va subiendo: 0,6% en 2023, 0,7% en 2024, 0,8% en 2025, 0,9% en 2026. Fuente: RDL 2/2023.\n\nLa cotización de solidaridad (desde 2025, art. 19 bis LGSS) grava el exceso del salario sobre la base máxima de cotización con tipos progresivos: ~1,15% hasta +10% de la base máx., ~1,25% hasta +50%, ~1,46% en adelante. El reparto empresa/trabajador es 5/6 - 1/6. Fuente: RDL 2/2023.' },
  { q:'¿Qué no incluye esta herramienta?',
    a:'Esta herramienta calcula exclusivamente la tarifa estatal del IRPF (50% del impuesto). No incluye:\n\n• Deducciones autonómicas: cada Comunidad Autónoma tiene su propio tramo (el otro 50%) con tipos y deducciones propias — en algunas CC.AA. la diferencia es sustancial.\n• Situaciones especiales: discapacidad, familias numerosas, pensiones compensatorias, movilidad geográfica (arts. 20 bis y 26 LIRPF), planes de pensiones.\n• Rendimientos no laborales: capital mobiliario, inmobiliario, actividades económicas, ganancias patrimoniales.\n• ATEP variable: el tipo de contingencias profesionales se fija al 1,5% general (Anexo IV Orden cotización); varía por actividad económica.' },
];

const FUENTES = [
  { concepto:'Escalas IRPF (tarifa)',
    fuente:'Art. 63-64 LIRPF (BOE-A-2006-20764)',
    url:'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a63' },
  { concepto:'Reducción Art.20 — redacción 2026',
    fuente:'Art. 20 LIRPF (BOE)',
    url:'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a20' },
  { concepto:'Reducción Art.20 — redacción 2019',
    fuente:'RDL 28/2018, art. 59 (BOE-A-2018-9268)',
    url:'https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268#ar-59' },
  { concepto:'Gastos deducibles Art.19.2.f',
    fuente:'Art. 19 LIRPF (BOE)',
    url:'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a19' },
  { concepto:'Mínimo del contribuyente Art.57',
    fuente:'Art. 57 LIRPF (BOE)',
    url:'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a57' },
  { concepto:'Deducción por obtención de rentas del trabajo (SMI)',
    fuente:'AEAT — Manual IRPF 2025',
    url:'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html' },
  { concepto:'Cotizaciones SS trabajadores 2026 (TGSS)',
    fuente:'Seguridad Social — Trabajadores',
    url:'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
  { concepto:'Cotizaciones SS 2019 (archivado)',
    fuente:'Wayback Machine — TGSS 2019',
    url:'https://web.archive.org/web/20190223131030/https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
  { concepto:'IPC acumulado dic.2019 / dic.2025 (INE)',
    fuente:'INE — Variaciones del IPC',
    url:'https://www.ine.es/varipc/verVariaciones.do?idmesini=12&anyoini=2019&idmesfin=12&anyofin=2025&ntipo=1&enviar=Calcular' },
  { concepto:'MEI y cotización de solidaridad',
    fuente:'RDL 2/2023, art. 127 bis y 19 bis LGSS',
    url:null },
  { concepto:'SMI histórico',
    fuente:'RD aprobado cada año (BOE oficial de cada ejercicio)',
    url:null },
];

export default function NormativaFAQ({ anioRef }) {
  const [anioSel, setAnioSel] = useState(anioRef || 2026);
  const [faqAbierta, setFaqAbierta] = useState(null);
  const [mostrarFuentes, setMostrarFuentes] = useState(false);
  const params = obtenerParametros(anioSel);
  const hito = HITOS.find(h => h.anios.includes(anioSel));

  return (
    <div className="space-y-8">
      {/* Línea temporal */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Historia normativa año a año</h3>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {ANIOS.map(a => (
            <button key={a} onClick={() => setAnioSel(a)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border-2 ${anioSel === a
                ? 'text-[#0f1117] border-transparent' : 'border-[#272b40] text-[#94a3b8] opacity-50 hover:opacity-80'}`}
              style={anioSel === a ? { background:YEAR_COLORS[a], borderColor:YEAR_COLORS[a] } : {}}>
              {a}
            </button>
          ))}
        </div>
        {hito && (
          <div className="rounded-xl p-4 border-l-4 mb-4" style={{ borderColor:hito.color, background:`${hito.color}12` }}>
            <h4 className="font-bold text-sm mb-1.5" style={{ color:hito.color }}>{hito.titulo}</h4>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-2">{hito.texto}</p>
            <p className="text-xs text-[#64748b] italic">Fuente: {hito.fuente}</p>
          </div>
        )}

        {/* Ficha técnica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h4 className="text-sm font-bold text-white mb-3">Parámetros — {anioSel}</h4>
            {[
              ['Base máx. cotización', eur(params.baseMax)],
              ['SMI anual', eur(SMI_ANUAL[anioSel])],
              ['SS empresa (total)', pct(params.tipoEmp * 100)],
              ['SS trabajador (total)', pct(params.tipoTra * 100)],
              params.mei[1] > 0 && ['  del que MEI trabajador', pct(params.mei[1]*100, 3)],
              ['Gastos deducibles Art.19', params.gastosFijos > 0 ? eur(params.gastosFijos) : 'No aplica (pre-2015)'],
              ['Mínimo personal Art.57', eur(params.irpfMinimo)],
              ['Mínimo exento retención', eur(params.minimoExento)],
              typeof params.art20Meta.uInf === 'number' && ['Art.20 — Umbral inferior', eur(params.art20Meta.uInf)],
              typeof params.art20Meta.rMax === 'number' && ['Art.20 — Reducción máxima', eur(params.art20Meta.rMax)],
              typeof params.art20Meta.uSup === 'number' && ['Art.20 — Umbral superior', eur(params.art20Meta.uSup)],
              params.art20Meta.label && ['Art.20', params.art20Meta.label],
              params.hasSolidaridad && ['Cotización solidaridad', 'Sí (sobre exceso base máx.)'],
            ].filter(Boolean).map(([l, v]) => (
              <div key={l} className="flex justify-between py-1.5 border-b border-[#272b40] last:border-0">
                <span className="text-xs text-[#94a3b8]">{l}</span>
                <span className="text-xs font-mono font-semibold text-white">{v}</span>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h4 className="text-sm font-bold text-white mb-3">Tramos IRPF — {anioSel}</h4>
            <div className="space-y-2.5">
              {params.tramos.map(([lim, tipo], i) => {
                const prev = i === 0 ? 0 : params.tramos[i-1][0];
                const label = lim === Infinity ? `Desde ${eur(prev)}` : `${eur(prev)} – ${eur(lim)}`;
                const maxTipo = Math.max(...params.tramos.map(([,t]) => t));
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-[#94a3b8] w-32 shrink-0">{label}</span>
                    <div className="flex-1 bg-[#272b40] rounded-full h-2.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${tipo/maxTipo*100}%`, background:YEAR_COLORS[anioSel] }} />
                    </div>
                    <span className="text-xs font-mono font-bold w-10 text-right" style={{ color:YEAR_COLORS[anioSel] }}>
                      {(tipo*100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[#272b40]">
              <p className="text-xs text-[#64748b] mb-1">Inflación acumulada {anioSel}→2026 (INE, dic.→dic.)</p>
              <p className="text-sm font-mono font-bold text-white">
                ×{INFLACION_A_2026[anioSel].toFixed(4)}
                <span className="text-[#94a3b8] font-normal ml-2">(+{((INFLACION_A_2026[anioSel]-1)*100).toFixed(1)}%)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Conceptos clave</h3>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-[#21253a] transition-colors">
                <span className="text-sm font-medium text-white pr-4">{f.q}</span>
                <span className="text-[var(--accent)] text-xl shrink-0 font-light">{faqAbierta === i ? '−' : '+'}</span>
              </button>
              {faqAbierta === i && (
                <div className="px-4 pb-4 border-t border-[#272b40]">
                  {f.a.split('\n\n').map((par, j) => (
                    <p key={j} className="text-sm text-[#94a3b8] leading-relaxed mt-3">{par}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fuentes con URLs */}
      <div>
        <button onClick={() => setMostrarFuentes(v => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-[#94a3b8] hover:text-white transition-colors mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          {mostrarFuentes ? 'Ocultar' : 'Ver'} fuentes y referencias normativas
        </button>
        {mostrarFuentes && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#272b40] bg-[#21253a]">
              <p className="text-xs text-[#94a3b8]">
                El motor de cálculo es una traducción directa a JavaScript del código Python original del autor,
                que implementa la normativa estatal (LIRPF + LGSS) año a año. Los parámetros provienen de las siguientes fuentes:
              </p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#272b40]">
                  <th className="py-2 px-4 text-left text-[#64748b] font-medium w-48">Concepto</th>
                  <th className="py-2 px-4 text-left text-[#64748b] font-medium">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {FUENTES.map(f => (
                  <tr key={f.concepto} className="border-b border-[#272b40] last:border-0 hover:bg-[#21253a]">
                    <td className="py-2 px-4 font-semibold text-white align-top">{f.concepto}</td>
                    <td className="py-2 px-4 text-[#94a3b8] leading-relaxed">
                      {f.url
                        ? <a href={f.url} target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                            {f.fuente} ↗
                          </a>
                        : f.fuente}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
