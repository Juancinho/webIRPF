import { useMemo } from 'react';
import { calcularNomina, calcularTipoMarginal, obtenerParametros, REGIONES } from '../engine/irpf';
import { eur, pct } from '../utils/format';

const SOURCES = [
  ['LIRPF · Ley 35/2006', 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764'],
  ['RIRPF · RD 439/2007', 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820'],
  ['TGSS · Cotización', 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537'],
];

function FiscalBook({ code, title, intro, entries, scaleMax }) {
  return (
    <section className="fiscal-book" role="rowgroup" aria-labelledby={`fiscal-book-${code}`}>
      <header className="fiscal-book__header">
        <span>{code}</span>
        <div><h3 id={`fiscal-book-${code}`}>{title}</h3><p>{intro}</p></div>
      </header>
      <ol className="fiscal-book__entries">
        {entries.filter(Boolean).map((entry) => {
          const measure = entry.amount == null ? 0 : Math.max(1.2, Math.min(100, (Math.abs(entry.amount) / Math.max(1, scaleMax)) * 100));
          return (
            <li key={entry.ref} className={`fiscal-entry ${entry.tone ? `is-${entry.tone}` : ''}`} style={{ '--measure': `${measure}%` }} role="row">
              <span className="fiscal-entry__ref" role="cell">{entry.ref}</span>
              <div className="fiscal-entry__concept" role="cell">
                <strong>{entry.label}</strong><span>{entry.rule}</span>{entry.note && <small>{entry.note}</small>}
              </div>
              <div className="fiscal-entry__rungs" aria-hidden="true"><i /></div>
              <strong className="fiscal-entry__annual" role="cell">{entry.value}</strong>
              <span className="fiscal-entry__monthly" role="cell"><small>{entry.monthlyLabel || '12 meses'}</small>{entry.monthly}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function BracketRung({ item, maxUsed }) {
  const measure = item.used > 0 ? Math.max(1.5, (item.used / Math.max(1, maxUsed)) * 100) : 0;
  const interval = item.limit === Infinity ? `Más de ${eur(item.start)}` : `${eur(item.start)} — ${eur(item.limit)}`;
  return (
    <li className={item.used > 0 ? 'is-used' : ''} style={{ '--measure': `${measure}%` }}>
      <div><strong>{interval}</strong><span>{item.used > 0 ? `${eur(item.used)} de base utilizada` : 'Tramo no alcanzado'}</span></div>
      <div className="bracket-rung__track" aria-hidden="true"><i /></div><b>{pct(item.rate * 100)}</b><em>{eur(item.tax)}</em>
    </li>
  );
}

export default function PayrollStudy({ bruto, anio, opts }) {
  const result = useMemo(() => calcularNomina(bruto, anio, opts), [bruto, anio, opts]);
  const marginal = useMemo(() => calcularTipoMarginal(bruto, anio, opts), [bruto, anio, opts]);
  const params = useMemo(() => obtenerParametros(anio), [anio]);
  const region = REGIONES[opts?.ccaa] || REGIONES.default;
  const isAutonomo = result.regimen === 'autonomo';
  const totalWorker = result.cotTra + result.irpfFinal;
  const totalGap = result.costeLab - result.salarioNeto;
  const protectedBase = Math.max(0, bruto - result.baseImponible);
  const limitActive = Number.isFinite(result.limiteRetencion) && result.irpfFinal === result.limiteRetencion && result.cuotaSMI > result.limiteRetencion;
  const brackets = result.tramos.map(([limit, rate], index) => {
    const start = index === 0 ? 0 : result.tramos[index - 1][0];
    const end = limit === Infinity ? Math.max(result.baseImponible, start) : limit;
    const used = Math.max(0, Math.min(result.baseImponible, end) - start);
    return { start, limit, rate, used, tax: used * rate };
  });
  const maxUsed = Math.max(1, ...brackets.map((item) => item.used));

  const books = [
    {
      code: 'A', title: 'Coste y contrato', intro: 'La cuenta de empresa reconstruye el bruto desde el coste total.', scaleMax: result.costeLab,
      entries: [
        { ref: 'A.1', label: 'Coste laboral total', rule: 'Bruto + cotización empresarial', amount: result.costeLab, value: eur(result.costeLab), monthly: eur(result.costeLab / 12), tone: 'opening' },
        { ref: 'A.2', label: isAutonomo ? 'Cotización empresarial' : 'SS a cargo de la empresa', rule: isAutonomo ? 'No aplica en este modelo' : `Base cotizable × ${pct(params.tipoEmp * 100, 2)}`, amount: isAutonomo ? null : -result.cotEmp, value: isAutonomo ? '—' : `− ${eur(result.cotEmp)}`, monthly: isAutonomo ? '—' : `− ${eur(result.cotEmp / 12)}`, note: !isAutonomo && bruto > params.baseMax ? `Base máxima ${eur(params.baseMax)}; solidaridad incluida cuando procede` : undefined, tone: 'deduction' },
        { ref: 'A.3', label: 'Salario bruto anual', rule: 'Coste − SS empresa', amount: bruto, value: eur(bruto), monthly: eur(bruto / 12), tone: 'result' },
      ],
    },
    {
      code: 'B', title: 'Base imponible', intro: 'No todo el bruto entra en la escala: estas son las restas legales previas.', scaleMax: bruto,
      entries: [
        { ref: 'B.1', label: isAutonomo ? 'Cuota de autónomo' : 'SS del trabajador', rule: isAutonomo ? 'Base del tramo RETA × tipo del ejercicio' : `Base cotizable × ${pct(params.tipoTra * 100, 2)}`, amount: -result.cotTra, value: `− ${eur(result.cotTra)}`, monthly: `− ${eur(result.cotTra / 12)}`, tone: 'deduction' },
        { ref: 'B.2', label: 'Rendimiento previo', rule: 'Bruto − cotización propia', amount: result.rnPrevio, value: eur(result.rnPrevio), monthly: eur(result.rnPrevio / 12) },
        { ref: 'B.3', label: isAutonomo ? 'Gastos de difícil justificación' : 'Gastos deducibles · Art. 19', rule: isAutonomo ? '5% con el límite legal aplicado' : anio >= 2015 ? 'Cantidad general del ejercicio' : 'No existía en este ejercicio', amount: -result.gastosFijos, value: `− ${eur(result.gastosFijos)}`, monthly: `− ${eur(result.gastosFijos / 12)}`, tone: 'deduction' },
        !isAutonomo && { ref: 'B.4', label: 'Reducción por rendimientos · Art. 20', rule: 'Según rendimiento neto y umbrales del ejercicio', amount: -result.redTrabajo, value: `− ${eur(result.redTrabajo)}`, monthly: `− ${eur(result.redTrabajo / 12)}`, tone: 'deduction' },
        result.reduccionConjunta > 0 && { ref: 'B.5', label: 'Reducción por tributación conjunta', rule: 'Perfil fiscal seleccionado', amount: -result.reduccionConjunta, value: `− ${eur(result.reduccionConjunta)}`, monthly: `− ${eur(result.reduccionConjunta / 12)}`, tone: 'deduction' },
        { ref: 'B.6', label: 'Base imponible', rule: 'Rendimiento − gastos − reducciones', amount: result.baseImponible, value: eur(result.baseImponible), monthly: eur(result.baseImponible / 12), tone: 'result' },
      ],
    },
    {
      code: 'C', title: 'Liquidación del IRPF', intro: 'La cuota se calcula por tramos; después actúan mínimos, deducciones y límites.', scaleMax: Math.max(1, result.cuotaIntegra),
      entries: [
        { ref: 'C.1', label: 'Cuota por aplicación de tramos', rule: `Escala ${anio}${anio >= 2024 ? ` · ${region.name}` : ''}`, amount: result.cuotaIntegra, value: eur(result.cuotaIntegra), monthly: eur(result.cuotaIntegra / 12), tone: 'opening' },
        { ref: 'C.2', label: 'Cuota del mínimo personal y familiar', rule: `Mínimo protegido: ${eur(result.minimoPersonalYFamiliar)}`, amount: -result.cuotaMinimo, value: `− ${eur(result.cuotaMinimo)}`, monthly: `− ${eur(result.cuotaMinimo / 12)}`, note: result.minimoFamiliar > 0 ? `Incluye ${eur(result.minimoFamiliar)} de mínimo familiar` : 'Mínimo personal general', tone: 'deduction' },
        { ref: 'C.3', label: 'Cuota teórica', rule: 'Cuota de tramos − cuota del mínimo', amount: result.cuotaTeorica, value: eur(result.cuotaTeorica), monthly: eur(result.cuotaTeorica / 12) },
        { ref: 'C.4', label: 'Deducción por rendimientos próximos al SMI', rule: anio >= 2025 ? 'Deducción en cuota del ejercicio' : 'No disponible en este ejercicio', amount: -result.deduccionSMI, value: `− ${eur(result.deduccionSMI)}`, monthly: `− ${eur(result.deduccionSMI / 12)}`, tone: 'deduction' },
        { ref: 'C.5', label: 'Cuota después de deducciones', rule: 'Cuota teórica − deducciones', amount: result.cuotaSMI, value: eur(result.cuotaSMI), monthly: eur(result.cuotaSMI / 12) },
        !isAutonomo && { ref: 'C.6', label: 'Límite protector · Art. 85.3', rule: limitActive ? 'El límite reduce la cuota final' : 'Comprobado; no limita la cuota', amount: result.limiteRetencion, value: eur(result.limiteRetencion), monthly: eur(result.limiteRetencion / 12), note: limitActive ? 'Límite activo en este caso' : undefined },
        { ref: 'C.7', label: 'IRPF final estimado', rule: limitActive ? 'Mínimo entre cuota y límite protector' : 'Cuota resultante aplicable', amount: -result.irpfFinal, value: `− ${eur(result.irpfFinal)}`, monthly: `− ${eur(result.irpfFinal / 12)}`, tone: 'tax' },
      ],
    },
    {
      code: 'D', title: 'Conciliación de nómina', intro: 'La última cuenta comprueba que las salidas conducen exactamente al neto.', scaleMax: bruto,
      entries: [
        { ref: 'D.1', label: 'Carga directa del trabajador', rule: 'SS trabajador + IRPF', amount: -totalWorker, value: `− ${eur(totalWorker)}`, monthly: `− ${eur(totalWorker / 12)}`, note: `${pct((totalWorker / bruto) * 100)} del salario bruto`, tone: 'deduction' },
        { ref: 'D.2', label: 'Salario neto anual', rule: 'Bruto − SS trabajador − IRPF', amount: result.salarioNeto, value: eur(result.salarioNeto), monthly: eur(result.salarioNeto / 12), tone: 'net' },
        { ref: 'D.3', label: 'Neto por paga · 14 pagas', rule: 'Neto anual ÷ 14', amount: result.salarioNeto / 14, value: '—', monthly: eur(result.salarioNeto / 14), monthlyLabel: '14 pagas' },
      ],
    },
  ];

  if (bruto <= 0) return null;
  return (
    <section className="payroll-study" aria-labelledby="payroll-study-title">
      <header className="payroll-study__header">
        <div><p className="figure-kicker">ESTUDIO 01 · TU NÓMINA, LÍNEA A LÍNEA</p><h2 id="payroll-study-title">La cifra neta no aparece de golpe.</h2></div>
        <div className="payroll-study__standfirst"><p>Entre el coste de tu trabajo y el ingreso en cuenta hay tres cuentas distintas: cotización, construcción de la base y liquidación del IRPF. Este libro mayor conserva el orden legal del cálculo.</p><p className="payroll-study__profile">PERFIL · {isAutonomo ? 'AUTÓNOMO' : 'ASALARIADO'} · {region.name.toUpperCase()} · {anio}</p></div>
      </header>
      <div className="payroll-study__reading">
        <div className="payroll-study__statement"><span>DE CADA 100 € QUE CUESTA TU TRABAJO</span><strong>{eur((result.salarioNeto / result.costeLab) * 100, 1)}</strong><p>terminan como renta neta. El resto se reparte entre cotizaciones empresariales, cotizaciones propias e IRPF.</p></div>
        <div className="payroll-study__essay"><p>Tu salario contractual es <strong>{eur(bruto)}</strong>, pero Hacienda no aplica la escala directamente sobre esa cifra. Tras cotizaciones, gastos y reducciones, la base queda en <strong>{eur(result.baseImponible)}</strong>: {pct((result.baseImponible / bruto) * 100)} del bruto.</p><p>La distancia entre bruto y base —<strong>{eur(protectedBase)}</strong>— no es dinero desaparecido: es renta que no entra en la base por las reglas vigentes. El mínimo personal tampoco se resta del salario; anula la cuota fiscal que le corresponde.</p></div>
        <aside className="payroll-study__margin-note"><span>NOTA 01</span><strong>{pct(result.tipoMargIRPF * 100)}</strong><p>es el tipo del último tramo ocupado. No se aplica a todo el salario.</p></aside>
      </div>
      <div className="fiscal-books-wrap" role="region" aria-label="Libro mayor detallado del cálculo de la nómina" tabIndex="0">
        <div className="fiscal-books__legend" aria-hidden="true"><span>REF. / CONCEPTO Y REGLA</span><span>ESCALA RELATIVA</span><span>ANUAL</span><span>MENSUAL</span></div>
        <div className="fiscal-books" role="table">{books.map((book) => <FiscalBook key={book.code} {...book} />)}</div>
        <p className="fiscal-books__key"><i /> Peldaño sólido = saldo o resultado · <i className="is-deduction" /> peldaño discontinuo = resta legal. La longitud se escala dentro de cada cuenta; el importe escrito es la medida exacta.</p>
      </div>
      <div className="payroll-study__after-ledger"><div><p className="figure-kicker">LECTURA</p><h3>El IRPF se construye por capas.</h3><p>Primero se calcula la cuota de toda la base y después se anula la cuota atribuible al mínimo. Por eso <strong>{eur(result.minimoPersonalYFamiliar)}</strong> de mínimo vital producen una rebaja de <strong>{eur(result.cuotaMinimo)}</strong>, no una resta idéntica sobre el impuesto.</p></div><aside><span>SIGUIENTES 100 € BRUTOS</span><strong>{eur(marginal.netoMarginal * 100, 1)}</strong><p>llegarían aproximadamente a tu bolsillo con las reglas activas en este punto.</p></aside></div>
      <div className="payroll-brackets" role="region" aria-label="Detalle de los tramos de IRPF aplicados" tabIndex="0">
        <div className="payroll-brackets__heading"><p className="figure-kicker">FIGURA 02 · TRAMOS APLICADOS</p><h3>Cada tramo es una pequeña escalera.</h3><p>La longitud muestra base utilizada; cada marca repite una misma unidad visual. Tipo y cuota quedan unidos al tramo, sin leyenda separada.</p></div>
        <div className="payroll-brackets__columns" aria-hidden="true"><span>INTERVALO / BASE UTILIZADA</span><span>TIPO</span><span>CUOTA</span></div>
        <ol className="payroll-brackets__rungs">{brackets.map((item) => <BracketRung key={`${item.start}-${item.limit}`} item={item} maxUsed={maxUsed} />)}</ol>
        <div className="payroll-brackets__sum"><span>TOTAL CUOTA ÍNTEGRA</span><strong>{eur(result.cuotaIntegra)}</strong></div>
      </div>
      <footer className="payroll-study__footer"><div><span>FUENTES PRIMARIAS</span>{SOURCES.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{label}</a>)}</div><p>El salto completo entre coste laboral y neto es <strong>{eur(totalGap)}</strong>. Estimación anual orientativa: la retención mensual es un pago a cuenta y puede diferir de la cuota final de la declaración.</p></footer>
    </section>
  );
}
