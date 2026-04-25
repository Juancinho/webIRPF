import { useMemo } from 'react';
import { calcularNomina, obtenerParametros, getArt20Meta, SMI_ANUAL } from '../engine/irpf';
import { eur, num } from '../utils/format';
import { useScrollReveal } from '../hooks/useScrollReveal';

/* ── Fuentes legales ────────────────────────────────────────────────── */
const FUENTES = {
  tgss:      { label: 'TGSS — Bases y tipos de cotización', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
  tgss2019:  { label: 'TGSS — Cotización 2019 (Wayback Machine)', url: 'https://web.archive.org/web/20190223131030/https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
  art19:     { label: 'BOE — LIRPF Art.19.2.f', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a19' },
  art20:     { label: 'BOE — LIRPF Art.20 (redacción vigente)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a20' },
  art20_2019:{ label: 'BOE — Art.20 redacción 2019 (Ley 26/2014)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268#ar-59' },
  art57:     { label: 'BOE — LIRPF Art.57 (mínimo contribuyente)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a57' },
  art85:     { label: 'BOE — RIRPF Art.85.3 (límite 43%)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820' },
  deduSMI:   { label: 'AEAT — Deducción por obtención de rendimientos del trabajo', url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html' },
  ine:       { label: 'INE — Variación del IPC', url: 'https://www.ine.es/varipc/' },
};

/* ── Subcomponentes visuales ──────────────────────────────────────── */
function Paso({ letra, titulo, subtitulo, color, resultado, children }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.12 });
  return (
    <div ref={ref} className={`paso-edu ${isVisible ? 'is-revealed' : ''}`}>
      <div className="paso-header">
        <div className="paso-badge" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 20px ${color}30` }}>
          {letra}
        </div>
        <div className="paso-header-text">
          <h4 className="paso-title">{titulo}</h4>
          {subtitulo && <p className="paso-subtitle">{subtitulo}</p>}
        </div>
        {resultado != null && (
          <div className="paso-resultado-chip" style={{ color, borderColor: `${color}40`, background: `${color}14` }}>
            <span className="font-mono font-extrabold">{eur(resultado)}</span>
          </div>
        )}
      </div>
      <div className="paso-content">{children}</div>
    </div>
  );
}

function Formula({ children }) {
  return <div className="formula-box font-mono">{children}</div>;
}

function Fuente({ f }) {
  return (
    <a href={f.url} target="_blank" rel="noopener noreferrer" className="fuente-link">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
      {f.label}
    </a>
  );
}

function TablaConceptos({ conceptos, total }) {
  return (
    <table className="paso-tabla">
      <thead>
        <tr>
          <th>Concepto</th>
          <th className="text-right">Tipo</th>
        </tr>
      </thead>
      <tbody>
        {conceptos.map(({ c, t, nuevo }) => (
          <tr key={c}>
            <td>
              {c}
              {nuevo && <span className="badge-nuevo">Introducido en 2023</span>}
            </td>
            <td className="font-mono text-right">{t.toFixed(2)} %</td>
          </tr>
        ))}
        <tr className="row-total">
          <td>Total</td>
          <td className="font-mono text-right">{total.toFixed(2)} %</td>
        </tr>
      </tbody>
    </table>
  );
}

/* ── Helpers: conceptos de SS por año ─────────────────────────────── */
function conceptosSSEmpresa(anio, mei) {
  const base = [
    { c: 'Contingencias Comunes', t: 23.60 },
    { c: 'Desempleo',             t: 5.50  },
    { c: 'FOGASA',                t: 0.20  },
    { c: 'Formación Profesional', t: 0.60  },
    { c: 'Accidentes y EP',       t: 1.50  },
  ];
  if (anio >= 2023) base.push({ c: 'MEI (Mec. Equidad Intergeneracional)', t: mei[0] * 100, nuevo: true });
  return base;
}

function conceptosSSTrabajador(anio, mei) {
  const base = [
    { c: 'Contingencias Comunes', t: 4.70 },
    { c: 'Desempleo',             t: 1.55 },
    { c: 'Formación Profesional', t: 0.10 },
  ];
  if (anio >= 2023) base.push({ c: 'MEI (Mec. Equidad Intergeneracional)', t: mei[1] * 100, nuevo: true });
  return base;
}

/* ── Fórmulas Art.20 por año (texto y explicación) ────────────────── */
function formulaArt20(anio, rn, redActual) {
  const formato = (n) => num(Math.round(n));

  if (anio <= 2014) {
    if (rn <= 9180) return { formula: 'G = 4.080 € (reducción máxima)', zona: 'zona plana' };
    if (rn <= 13260) return { formula: `G = 4.080 − 0,35 × (${formato(rn)} − 9.180) = ${eur(redActual)}`, zona: 'zona de caída' };
    return { formula: 'G = 2.652 € (reducción mínima)', zona: 'zona suelo' };
  }
  if (anio <= 2017) {
    if (rn <= 11250) return { formula: 'G = 3.700 € (reducción máxima)', zona: 'zona plana' };
    if (rn <= 14450) return { formula: `G = 3.700 − 1,15625 × (${formato(rn)} − 11.250) = ${eur(redActual)}`, zona: 'zona de caída' };
    return { formula: 'G = 0 € (sin reducción)', zona: 'zona superior' };
  }
  if (anio === 2018) {
    return { formula: 'Régimen transitorio: media aritmética de la fórmula 2017 y 2019', zona: 'transición' };
  }
  if (anio <= 2022) {
    if (rn <= 13115) return { formula: 'G = 5.565 € (reducción máxima)', zona: 'zona plana' };
    if (rn <= 16825) return { formula: `G = 5.565 − 1,5 × (${formato(rn)} − 13.115) = ${eur(redActual)}`, zona: 'zona de caída' };
    return { formula: 'G = 0 € (sin reducción)', zona: 'zona superior' };
  }
  if (anio === 2023) {
    if (rn <= 14047.5) return { formula: 'G = 6.498 € (reducción máxima)', zona: 'zona plana' };
    if (rn <= 19747.5) return { formula: `G = 6.498 − 1,14 × (${formato(rn)} − 14.047,5) = ${eur(redActual)}`, zona: 'zona de caída' };
    return { formula: 'G = 0 € (sin reducción)', zona: 'zona superior' };
  }
  // 2024+
  if (rn <= 14852) return { formula: 'G = 7.302 € (reducción máxima)', zona: 'zona plana' };
  if (rn <= 17673.52) return { formula: `G = 7.302 − 1,75 × (${formato(rn)} − 14.852) = ${eur(redActual)}`, zona: 'zona de caída (pendiente alta)' };
  if (rn <= 19747.5) return { formula: `G = 2.364,34 − 1,14 × (${formato(rn)} − 17.673,52) = ${eur(redActual)}`, zona: 'zona de caída (pendiente suave)' };
  return { formula: 'G = 0 € (sin reducción)', zona: 'zona superior' };
}

function formulaDeduccionSMI(anio, bruto, deduccion) {
  if (anio === 2026) {
    if (bruto <= 17094) return { formula: 'K = 590,89 € (deducción máxima)', activo: true };
    return { formula: `K = 590,89 − 0,20 × (${num(bruto)} − 17.094) = ${eur(deduccion)}`, activo: deduccion > 0 };
  }
  if (anio === 2025) {
    if (bruto <= 16576) return { formula: 'K = 340 € (deducción máxima)', activo: true };
    if (bruto <= 18276) return { formula: `K = 340 − 0,20 × (${num(bruto)} − 16.576) = ${eur(deduccion)}`, activo: deduccion > 0 };
    return { formula: 'K = 0 € (fuera del rango)', activo: false };
  }
  return { formula: 'No aplicable — esta deducción se introdujo en 2025', activo: false };
}

/* ── Componente principal ─────────────────────────────────────────── */
export default function DesgloseEducativo({ bruto, anio }) {

  const r = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);
  const p = useMemo(() => obtenerParametros(anio), [anio]);
  const meta20 = getArt20Meta(anio);

  if (bruto <= 0) return null;

  const conceptosEmp = conceptosSSEmpresa(anio, p.mei);
  const totalEmp     = conceptosEmp.reduce((s, x) => s + x.t, 0);
  const conceptosTra = conceptosSSTrabajador(anio, p.mei);
  const totalTra     = conceptosTra.reduce((s, x) => s + x.t, 0);

  const art20info = formulaArt20(anio, r.rnPrevio, r.redTrabajo);
  const deduSMIinfo = formulaDeduccionSMI(anio, bruto, r.deduccionSMI);
  const aplicaDeduSMI = anio >= 2025 && r.deduccionSMI > 0;
  const aplicaF       = anio >= 2015;
  const aplicaLimite  = r.limiteRetencion < r.cuotaSMI && r.cuotaSMI > 0;

  // Primer tramo, para la explicación J
  const firstTipo = p.tramos[0][1];
  const baseGravada = Math.max(0, r.baseImponible - 5550);
  const irpfMinimoAnio = anio <= 2014 ? 5151 : 5550;

  return (
    <div className="desglose-edu">
      {/* Intro */}
      <p className="intro-desglose-text text-[13px] leading-relaxed" style={{ color: 'var(--text)' }}>
        El camino completo que recorre cada euro: desde lo que le cuestas a la empresa hasta lo que acaba en tu cuenta.
        Cada paso lleva fórmula, explicación y fuente legal — normativa real de {anio}.
      </p>

      <div className="paso-timeline">


          {/* A — Coste laboral */}
          <Paso letra="A" titulo="Coste laboral total" subtitulo="Lo que tu empresa paga de verdad por ti"
            color="#22d3ee" resultado={r.costeLab}>
            <p className="paso-prosa">
              Es el desembolso total de la empresa para tenerte contratado. Suma tu salario bruto (C) y las cotizaciones
              sociales que la empresa paga por encima de tu sueldo (B). Tú nunca ves este dinero en tu cuenta,
              pero forma parte del coste real de tu trabajo.
            </p>
            <Formula>
              A = C + B = {eur(bruto)} + {eur(r.cotEmp)} = <strong style={{ color: '#22d3ee' }}>{eur(r.costeLab)}</strong>
            </Formula>
            <p className="paso-ratio">
              De cada 100 € que le cuestas a tu empresa, tú ves {((r.salarioNeto / r.costeLab) * 100).toFixed(1)} € netos.
            </p>
          </Paso>

          {/* B — SS Empresa */}
          <Paso letra="B" titulo="Cotización SS Empresa" subtitulo="Lo que tu empresa paga a la Seguridad Social"
            color="#f59e0b" resultado={r.cotEmp}>
            <p className="paso-prosa">
              La empresa cotiza por ti a la Seguridad Social sumando varios conceptos (contingencias comunes, desempleo,
              FOGASA, formación, accidentes de trabajo…). Desde 2023 se añade el <strong className="text-white">MEI</strong>
              {' '}(Mecanismo de Equidad Intergeneracional) como refuerzo del sistema de pensiones.
            </p>
            <TablaConceptos conceptos={conceptosEmp} total={totalEmp} />
            <Formula>
              B = {eur(Math.min(bruto, p.baseMax))} × {(totalEmp / 100).toFixed(4)} = <strong style={{ color: '#f59e0b' }}>{eur(r.cotEmp)}</strong>
            </Formula>
            {bruto > p.baseMax && (
              <div className="callout-info">
                ⓘ Tu salario supera la base máxima de cotización ({eur(p.baseMax)}). A partir de ese punto,
                la SS se cotiza sobre el tope, no sobre todo el bruto.
              </div>
            )}
            <Fuente f={anio === 2019 ? FUENTES.tgss2019 : FUENTES.tgss} />
          </Paso>

          {/* C — Salario bruto */}
          <Paso letra="C" titulo="Salario bruto anual" subtitulo="La cifra que aparece en tu contrato"
            color="#38bdf8" resultado={bruto}>
            <p className="paso-prosa">
              Es la cantidad pactada en tu contrato antes de cualquier descuento. En 14 pagas equivale a{' '}
              <strong className="text-white">{eur(bruto / 14)}/mes</strong>; en 12 pagas, <strong className="text-white">{eur(bruto / 12)}/mes</strong>.
              Todo lo que viene a continuación son ajustes sobre esta cantidad.
            </p>
            <Formula>C = {eur(bruto)}</Formula>
            <p className="paso-ratio">
              Relación con el SMI {anio} ({eur(SMI_ANUAL[anio])}): <strong className="text-white">{(bruto / SMI_ANUAL[anio]).toFixed(2)} × SMI</strong>.
            </p>
          </Paso>

          {/* D — SS Trabajador */}
          <Paso letra="D" titulo="Cotización SS Trabajador" subtitulo="El descuento directo sobre tu bruto"
            color="#f59e0b" resultado={r.cotTra}>
            <p className="paso-prosa">
              Es la parte que la SS te descuenta a ti directamente. Aparece en tu nómina como «Cotización a la Seguridad Social».
              Financia tus futuras prestaciones (paro, pensión, baja por enfermedad...). En 2023 se añadió el MEI trabajador.
            </p>
            <TablaConceptos conceptos={conceptosTra} total={totalTra} />
            <Formula>
              D = {eur(Math.min(bruto, p.baseMax))} × {(totalTra / 100).toFixed(4)} = <strong style={{ color: '#f59e0b' }}>{eur(r.cotTra)}</strong>
            </Formula>
            <Fuente f={anio === 2019 ? FUENTES.tgss2019 : FUENTES.tgss} />
          </Paso>

          {/* E — Rendimiento del trabajo */}
          <Paso letra="E" titulo="Rendimiento íntegro del trabajo" subtitulo="Tu bruto después de la SS trabajador"
            color="#38bdf8" resultado={r.rnPrevio}>
            <p className="paso-prosa">
              Es la base a partir de la cual se aplican las deducciones del IRPF. Es tu salario bruto menos
              únicamente las cotizaciones a la Seguridad Social que pagas tú.
            </p>
            <Formula>
              E = C − D = {eur(bruto)} − {eur(r.cotTra)} = <strong style={{ color: '#38bdf8' }}>{eur(r.rnPrevio)}</strong>
            </Formula>
          </Paso>

          {/* F — Deducción general Art.19 */}
          {aplicaF ? (
            <Paso letra="F" titulo="Deducción general Art. 19.2.f" subtitulo="Gastos fijos deducibles — 2.000 €"
              color="#10b981" resultado={2000}>
              <p className="paso-prosa">
                Es una cantidad <strong className="text-white">fija de 2.000 €</strong> que todos los asalariados pueden restar
                de su rendimiento del trabajo para cubrir los gastos implícitos de ir a trabajar (transporte, ropa, herramientas…).
                Se introdujo con la reforma de 2015 y <strong className="text-white">lleva congelada desde entonces</strong>,
                por lo que pierde valor real cada año por la inflación.
              </p>
              <Formula>F = 2.000 € (cantidad fija por ley)</Formula>
              <Fuente f={FUENTES.art19} />
            </Paso>
          ) : (
            <Paso letra="F" titulo="Deducción general Art. 19.2.f" subtitulo="No aplicable antes de 2015"
              color="#4b5563">
              <p className="paso-prosa">
                La deducción fija de 2.000 € por gastos profesionales se introdujo con la reforma fiscal de 2015
                (Ley 26/2014). En <strong className="text-white">{anio}</strong> aún no existía.
              </p>
            </Paso>
          )}

          {/* G — Reducción Art.20 */}
          <Paso letra="G" titulo="Reducción por rendimientos del trabajo Art. 20"
            subtitulo="El descuento decreciente — la palanca protectora para rentas bajas"
            color="#10b981" resultado={r.redTrabajo}>
            <p className="paso-prosa">
              Esta es la <strong className="text-white">pieza clave del sistema</strong>: un descuento que reduce tu base imponible.
              Si ganas poco, el descuento es alto (incluso puedes quedar exento de IRPF). A medida que sube el salario,
              el descuento va cayendo hasta anularse.
            </p>
            {meta20.uInf != null && (
              <div className="paso-umbrales">
                <div><span>Umbral inferior</span><strong>{eur(meta20.uInf)}</strong></div>
                <div><span>Reducción máxima</span><strong>{eur(meta20.rMax)}</strong></div>
                <div><span>Umbral superior</span><strong>{eur(meta20.uSup)}</strong></div>
              </div>
            )}
            <div className="paso-zona">
              Tu rendimiento (E = {eur(r.rnPrevio)}) está en la <strong>{art20info.zona}</strong> del Art.20 para {anio}.
            </div>
            <Formula>{art20info.formula}</Formula>
            <Fuente f={anio <= 2019 ? FUENTES.art20_2019 : FUENTES.art20} />
          </Paso>

          {/* H — Base imponible */}
          <Paso letra="H" titulo="Base imponible" subtitulo="La cifra sobre la que Hacienda calcula el IRPF"
            color="#38bdf8" resultado={r.baseImponible}>
            <p className="paso-prosa">
              Es la cifra que realmente tributa. Se obtiene restando al bruto todas las deducciones previas:
              la SS trabajador, los 2.000 € de gastos fijos {aplicaF ? '' : '(no aplicable en este año)'} y la reducción del Art.20.
            </p>
            <Formula>
              H = C − D {aplicaF ? `− F` : ''} − G
              <br />
              H = {eur(bruto)} − {eur(r.cotTra)} {aplicaF ? `− ${eur(2000)} ` : ''}− {eur(r.redTrabajo)} = <strong style={{ color: '#38bdf8' }}>{eur(r.baseImponible)}</strong>
            </Formula>
            <p className="paso-ratio">
              Eso significa que tributas sobre <strong className="text-white">{((r.baseImponible / bruto) * 100).toFixed(1)} %</strong> de tu bruto.
              El resto queda «protegido» por las deducciones.
            </p>
          </Paso>

          {/* I — Mínimo contribuyente */}
          <Paso letra="I" titulo="Mínimo del contribuyente Art. 57" subtitulo="La renta vital que no tributa"
            color="#10b981" resultado={irpfMinimoAnio}>
            <p className="paso-prosa">
              La ley considera que <strong className="text-white">{eur(irpfMinimoAnio)}</strong> son la renta mínima
              necesaria para vivir, y por tanto no tributan. Para un contribuyente sin circunstancias especiales
              (sin discapacidad, sin descendientes, sin edad avanzada) es una cantidad fija.
            </p>
            <Formula>I = {eur(irpfMinimoAnio)} (persona sin circunstancias especiales)</Formula>
            <Fuente f={FUENTES.art57} />
          </Paso>

          {/* J — Cuota íntegra */}
          <Paso letra="J" titulo="Cuota íntegra por tramos" subtitulo="Aplicación de la tarifa progresiva estatal"
            color="#f43f5e" resultado={r.cuotaTeorica}>
            <p className="paso-prosa">
              Se aplica la tarifa progresiva del IRPF <strong className="text-white">solo a la parte de la base que supera el mínimo</strong> del
              contribuyente. Los primeros {eur(irpfMinimoAnio)} no generan cuota.
            </p>

            <div className="tramos-aplicados">
              <div className="tramos-aplicados-header">Tramos que se te aplican en {anio}</div>
              {(() => {
                let prev = 0;
                return p.tramos.map(([lim, tipo], i) => {
                  const desde = prev;
                  const limReal = lim === Infinity ? r.baseImponible : lim;
                  const enRango = r.baseImponible > desde;
                  const lleno = r.baseImponible >= limReal;
                  if (!enRango) { prev = limReal; return null; }
                  const tramoIRPFbase = lleno ? (limReal - desde) : (r.baseImponible - desde);
                  const cuota = tramoIRPFbase * tipo;
                  prev = limReal;
                  return (
                    <div key={i} className="tramo-row">
                      <div className="tramo-rango">
                        {lim === Infinity ? `desde ${eur(desde)}` : `${eur(desde)} – ${eur(lim)}`}
                      </div>
                      <div className="tramo-tipo" style={{ color: '#f43f5e' }}>{(tipo * 100).toFixed(1)} %</div>
                      <div className="tramo-cuota">{eur(cuota)}</div>
                    </div>
                  );
                });
              })()}
            </div>

            <Formula>
              J = {eur(r.cuotaIntegra)} − {eur(r.cuotaMinimo)} (mínimo × primer tramo) = <strong style={{ color: '#f43f5e' }}>{eur(r.cuotaTeorica)}</strong>
            </Formula>
            <p className="paso-ratio">
              Aquí solo está la <strong className="text-white">parte estatal</strong> (50% del IRPF total). La parte autonómica varía por
              comunidad y no se incluye en este cálculo.
            </p>
          </Paso>

          {/* K — Deducción SMI (solo 2025+) */}
          {deduSMIinfo.activo ? (
            <Paso letra="K" titulo="Deducción por obtención de rendimientos del trabajo"
              subtitulo="La «deducción SMI» — un descuento extra para salarios cercanos al mínimo"
              color="#10b981" resultado={r.deduccionSMI}>
              <p className="paso-prosa">
                Desde 2025 existe una <strong className="text-white">deducción adicional</strong> sobre la cuota del IRPF
                para salarios en el entorno del SMI. Se resta directamente del impuesto, no de la base. Es una
                «rebaja» de última hora para no penalizar a los que ganan poco.
              </p>
              <Formula>{deduSMIinfo.formula}</Formula>
              <Fuente f={FUENTES.deduSMI} />
            </Paso>
          ) : (
            anio >= 2025 && (
              <Paso letra="K" titulo="Deducción por obtención de rendimientos del trabajo"
                subtitulo="No aplicable a tu nivel de salario"
                color="#4b5563">
                <p className="paso-prosa">
                  Tu rendimiento ({eur(r.rnPrevio)}) está fuera del rango que permite esta deducción
                  ({anio === 2026 ? 'tramo decreciente desde 17.094 €' : 'entre 16.576 € y 18.276 €'}). Solo se aplica a salarios muy cercanos al SMI.
                </p>
              </Paso>
            )
          )}

          {/* L — IRPF final */}
          <Paso letra="L" titulo="IRPF final" subtitulo="Lo que realmente te retiene Hacienda"
            color="#f43f5e" resultado={r.irpfFinal}>
            <p className="paso-prosa">
              Es el IRPF efectivo que se retiene en tu nómina. Resulta de restar la deducción K (si aplica) a la
              cuota teórica J, y aplicar el <strong className="text-white">límite del 43%</strong> que protege los salarios
              bajos (Art. 85.3 RIRPF): la retención nunca puede superar el 43% del exceso sobre el mínimo exento de retención.
            </p>
            <Formula>
              L = J − K = {eur(r.cuotaTeorica)} − {eur(r.deduccionSMI)} = <strong style={{ color: '#f43f5e' }}>{eur(r.cuotaSMI)}</strong>
              {aplicaLimite && <>
                <br />↓ Límite 43% activo: L = {eur(r.limiteRetencion)}
              </>}
            </Formula>
            {aplicaLimite && (
              <div className="callout-info" style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.07)' }}>
                ⚠️ Se activa el límite protector del Art. 85.3. Sin él tu retención sería más alta.
              </div>
            )}
            <Fuente f={FUENTES.art85} />
          </Paso>

      </div>{/* end paso-timeline */}

      {/* Neto — Resultado final */}
      <div className="paso-final">
        <div className="paso-final-badge" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="paso-final-label">Salario neto anual</div>
          <div className="paso-final-formula font-mono">
            C − D − L = {eur(bruto)} − {eur(r.cotTra)} − {eur(r.irpfFinal)}
          </div>
          <div className="paso-final-valor font-mono">{eur(r.salarioNeto)}</div>
          <div className="paso-final-mes">
            {eur(r.salarioNeto / 12)}/mes (12 pagas) · {eur(r.salarioNeto / 14)}/mes (14 pagas)
          </div>
        </div>
      </div>
    </div>
  );
}
