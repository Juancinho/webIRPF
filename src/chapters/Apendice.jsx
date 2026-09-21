import { useMemo } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, obtenerParametros, INFLACION_A_2026, ULTIMO_ANIO_SALARIAL_OFICIAL } from '../engine/irpf';
import { CRONOLOGIA, PREGUNTAS, FUENTES } from './appendixData';
import { dec, eur, pct } from '../utils/format';

/**
 * 07 · APÉNDICE — a research appendix, not a marketing footer.
 * A methodology · B parameters · C law · D questions · E sources · F limits.
 */
export default function Apendice() {
  const { anio } = useFiscal();

  const parametros = useMemo(
    () =>
      ANIOS.map(a => {
        const p = obtenerParametros(a);
        const tramos = p.tramos;
        return {
          anio: a,
          min: tramos[0][1],
          max: tramos[tramos.length - 1][1],
          nTramos: tramos.length,
          baseMax: p.baseMax,
          tipoEmp: p.tipoEmp,
          tipoTra: p.tipoTra,
          mei: p.mei[0] + p.mei[1],
          minimoExento: p.minimoExento,
          gastosFijos: p.gastosFijos,
          art20: p.art20Meta,
          smi: p.smi,
          irpfMinimo: p.irpfMinimo,
          inf: INFLACION_A_2026[a],
        };
      }),
    []
  );

  return (
    <section id="apendice" className="fs-chapter fs-open-method" aria-labelledby="apendice-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">09</span>

        <div className="fs-chapter-head" data-gesture="SUPUESTOS · PARÁMETROS · NORMAS · FUENTES · LÍMITES">
          <span className="fs-stamp">09 / 09 · Apéndice</span>
          <h2 id="apendice-t" className="fs-title">
            Cómo está
            <br />
            calculado
          </h2>
          <p className="fs-kicker">
            Todo lo anterior sale de parámetros publicados. Aquí están: el método, las cifras año a
            año, las normas que las fijaron, las preguntas frecuentes, las fuentes y lo que esta
            herramienta no puede decirte.
          </p>
        </div>

        {/* ── A ─────────────────────────────────────────────────────────── */}
        <Seccion letra="A" titulo="Metodología">
          <p className="fs-body">
            El motor calcula, para cada año entre 2012 y 2026, la secuencia completa: coste laboral,
            cotizaciones de empresa y trabajador, rendimiento íntegro, gastos deducibles del art.
            19.2.f, reducción por rendimientos del trabajo del art. 20, base imponible, cuota
            íntegra por tramos, cuota del mínimo personal y familiar, deducción por obtención de
            rendimientos del trabajo y límite del 43 % de retención.
          </p>
          <p className="fs-body">
            Las comparaciones históricas se expresan en <strong>euros constantes de 2026</strong>{' '}
            usando el IPC de diciembre publicado por el INE. Los euros nominales de años distintos
            no son directamente comparables porque representan niveles de precios diferentes; por
            eso se ofrece también la lectura en euros constantes.
          </p>
          <p className="fs-body">
            El perfil por defecto es asalariado, tributación individual, sin hijos ni ascendientes a
            cargo y escala estándar. Las figuras que usan series precalculadas para los quince años
            lo indican en su subtítulo.
          </p>
        </Seccion>

        {/* ── B ─────────────────────────────────────────────────────────── */}
        <Seccion letra="B" titulo="Parámetros, 2012—2026">
          <div className="fs-table-scroll">
            <table className="fs-table">
              <caption>
                Escala, cotización y umbrales de cada ejercicio · euros nominales del año
              </caption>
              <thead>
                <tr>
                  <th scope="col">Año</th>
                  <th scope="col">Tramos</th>
                  <th scope="col">Tipo mín.</th>
                  <th scope="col">Tipo máx.</th>
                  <th scope="col">Base máx. cotiz.</th>
                  <th scope="col">Tipo empresa</th>
                  <th scope="col">Tipo trabajador</th>
                  <th scope="col">MEI</th>
                  <th scope="col">Gastos art. 19</th>
                  <th scope="col">Art. 20 · umbral inf.</th>
                  <th scope="col">Art. 20 · reducción máx.</th>
                  <th scope="col">Mín. exento retención</th>
                  <th scope="col">Mín. personal</th>
                  <th scope="col">SMI</th>
                  <th scope="col">× a €2026</th>
                </tr>
              </thead>
              <tbody>
                {parametros.map(p => (
                  <tr key={p.anio} className={p.anio === anio ? 'is-current' : undefined}>
                    <th scope="row">{p.anio}</th>
                    <td>{p.nTramos}</td>
                    <td>{pct(p.min * 100, 1)}</td>
                    <td>{pct(p.max * 100, 1)}</td>
                    <td>{eur(p.baseMax)}</td>
                    <td>{pct(p.tipoEmp * 100, 2)}</td>
                    <td>{pct(p.tipoTra * 100, 2)}</td>
                    <td>{p.mei > 0 ? pct(p.mei * 100, 2) : '—'}</td>
                    <td>{p.gastosFijos > 0 ? eur(p.gastosFijos) : '—'}</td>
                    <td>{typeof p.art20.uInf === 'number' ? eur(p.art20.uInf) : '—'}</td>
                    <td>{typeof p.art20.rMax === 'number' ? eur(p.art20.rMax) : '—'}</td>
                    <td>{eur(p.minimoExento)}</td>
                    <td>{eur(p.irpfMinimo)}</td>
                    <td>{eur(p.smi)}</td>
                    <td>{dec(p.inf, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fs-source" style={{ marginTop: 10 }}>
            Fuente · BOE · TGSS · órdenes anuales de cotización · INE (IPC)
          </p>
          <p className="fs-note" style={{ marginTop: 8 }}>
            2018 aplica el régimen transitorio del art. 20 (media aritmética entre la redacción de
            2017 y la de 2019, DT 31.ª LIRPF), por lo que no tiene umbrales propios.
          </p>
        </Seccion>

        {/* ── C ─────────────────────────────────────────────────────────── */}
        <Seccion letra="C" titulo="Normativa, año a año">
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {CRONOLOGIA.map((e, i) => (
              <li key={`${e.anio}-${i}`} className="fs-q" style={{ padding: '18px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '64px minmax(0, 1fr)', gap: 18 }}>
                  <span className="fs-stamp">
                    {e.anio}
                    <br />
                    {e.mes}
                  </span>
                  <div>
                    <h4 className="fs-title-sm" style={{ fontSize: 'clamp(18px, 1.6vw, 23px)' }}>
                      {e.titulo}
                    </h4>
                    <p className="fs-stamp" style={{ marginTop: 4 }}>{e.subtitulo}</p>
                    <p className="fs-note" style={{ marginTop: 8, maxWidth: '72ch' }}>{e.descripcion}</p>
                    {e.metricas?.length > 0 && (
                      <p className="fs-note" style={{ marginTop: 8, color: 'var(--ink-4)' }}>
                        {e.metricas.map(m => `${m.label}: ${m.valor}`).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Seccion>

        {/* ── D ─────────────────────────────────────────────────────────── */}
        <Seccion letra="D" titulo="Preguntas">
          {PREGUNTAS.map((f, i) => (
            <details key={f.q} className="fs-q" open={i === 0}>
              <summary>{f.q}</summary>
              <div className="fs-q-body">{f.a}</div>
            </details>
          ))}
        </Seccion>

        {/* ── E ─────────────────────────────────────────────────────────── */}
        <Seccion letra="E" titulo="Fuentes">
          <div className="fs-table-scroll">
            <table className="fs-table">
              <caption>Cada parámetro del motor, con su norma de origen</caption>
              <thead>
                <tr>
                  <th scope="col">Concepto</th>
                  <th scope="col">Norma o publicación</th>
                </tr>
              </thead>
              <tbody>
                {FUENTES.map(f => (
                  <tr key={f.concepto}>
                    <th scope="row">{f.concepto}</th>
                    <td>
                      {f.url ? (
                        <a href={f.url} target="_blank" rel="noreferrer noopener">
                          {f.fuente}
                        </a>
                      ) : (
                        f.fuente
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">Distribución salarial</th>
                  <td>
                    <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=28191" target="_blank" rel="noreferrer noopener">
                      INE — EAES, tabla 28191
                    </a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Cuña fiscal internacional</th>
                  <td>
                    <a href="https://doi.org/10.1787/3a5169ef-en" target="_blank" rel="noreferrer noopener">
                      OCDE — Taxing Wages 2026, tabla 1.2
                    </a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Deuda pública</th>
                  <td>Banco de España (Protocolo de Déficit Excesivo) · INE (población)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Seccion>

        {/* ── F ─────────────────────────────────────────────────────────── */}
        <Seccion letra="F" titulo="Limitaciones">
          <ul className="fs-body fs-cols-2" style={{ paddingLeft: '1.1em', maxWidth: 'none' }}>
            <li>
              Es una herramienta orientativa de divulgación, no asesoramiento fiscal ni un
              simulador oficial. No sustituye al borrador de la AEAT.
            </li>
            <li>
              El IPC de 2026 es una estimación hasta que el INE publique el dato de diciembre, de
              modo que las cifras en euros constantes de 2026 pueden variar ligeramente.
            </li>
            <li>
              País Vasco y Navarra tienen régimen foral propio (Concierto Económico y Convenio):
              aquí se aproximan con la escala estándar, no con sus escalas reales.
            </li>
            <li>
              Los percentiles salariales de {ULTIMO_ANIO_SALARIAL_OFICIAL + 1} en adelante son
              proyección propia sobre el último dato publicado; el INE tampoco publica P95 ni P99 en
              esta tabla, así que la cola alta es una extrapolación suave.
            </li>
            <li>
              No se modelizan deducciones autonómicas, rendimientos distintos del trabajo,
              reducciones por discapacidad, planes de pensiones ni situaciones familiares
              particulares más allá de las opciones del perfil.
            </li>
            <li>
              La cuña fiscal de la OCDE responde a un supuesto estandarizado (persona soltera sin
              hijos al 100 % del salario medio) y no es directamente comparable con tu caso.
            </li>
          </ul>
        </Seccion>
      </div>
    </section>
  );
}

function Seccion({ letra, titulo, children }) {
  return (
    <section style={{ marginBottom: 'clamp(48px, 8vh, 96px)' }} aria-labelledby={`ap-${letra}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: '1px solid var(--ink)', paddingBottom: 8, marginBottom: 24 }}>
        <span className="fs-stamp" style={{ fontSize: 13 }}>{letra}</span>
        <h3 id={`ap-${letra}`} className="fs-title-sm">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}
