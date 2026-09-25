import { useMemo } from 'react';
import { useFiscal } from '../state/fiscalContext';
import {
  ANIOS, obtenerParametros, INFLACION_A_2026, ULTIMO_ANIO_SALARIAL_OFICIAL,
  CRECIMIENTO_PROYECCION_SALARIAL, DISTRIBUCION_SALARIAL, GASTO_COFOG,
  calcularNomina,
} from '../engine/irpf';
import { salarioEnPercentil } from './distribucionUtil';
import { CRONOLOGIA, PREGUNTAS, FUENTES } from './appendixData';
import { dec, eur, pct } from '../utils/format';
import Fuente from '../figures/Fuente';

/**
 * 07 · APÉNDICE — a research appendix, not a marketing footer.
 * A methodology · B parameters · C law · D questions · E sources · F limits.
 */
export default function Apendice() {
  const { anio, bruto, nomina, marginal, params, opts } = useFiscal();

  const dist = DISTRIBUCION_SALARIAL[anio];
  const bandasMosaico = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => {
      const salario = salarioEnPercentil(i * 5 + 2.5, dist);
      const calculo = calcularNomina(salario, anio, opts);
      return { salario, carga: calculo.irpfFinal + calculo.cotTra };
    }), [anio, dist, opts]);
  const bandaEjemplo = bandasMosaico[10];
  const sumaSalarios = bandasMosaico.reduce((total, banda) => total + banda.salario, 0);
  const sumaCargas = bandasMosaico.reduce((total, banda) => total + banda.carga, 0);
  const parteMasaEjemplo = bandaEjemplo.salario / sumaSalarios;
  const parteCargaEjemplo = bandaEjemplo.carga / sumaCargas;
  const cuna = Math.max(0, nomina.costeLab - nomina.salarioNeto);
  const parteCuna = nomina.costeLab > 0 ? cuna / nomina.costeLab : 0;
  const totalDias = new Date(anio, 1, 29).getMonth() === 1 ? 366 : 365;
  const diasCuna = Math.round(parteCuna * totalDias);
  const gastoSocial = GASTO_COFOG.grupos[0].partidas.reduce((total, partida) => total + partida.valor, 0);
  const parteSocial = gastoSocial / GASTO_COFOG.total;

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
            Cómo está{' '}
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
        <Seccion letra="A" titulo="Metodología y trazabilidad" id="metodo-calculos">
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

          <div className="fs-method-ledger" aria-labelledby="metodo-actual-t">
            <div className="fs-method-head">
              <span className="fs-stamp">Cálculo reproducible · estado actual</span>
              <h4 id="metodo-actual-t" className="fs-title-sm">
                De {eur(bruto)} brutos a {eur(nomina.salarioNeto)} netos, paso a paso
              </h4>
              <p className="fs-note">
                Año {anio} · {nomina.regimen === 'autonomo' ? 'régimen de autónomos' : 'régimen general'} ·
                cada cifra procede del estado que estás viendo en la publicación.
              </p>
            </div>
            <ol className="fs-method-steps">
              <PasoMetodo n="01" titulo="Base y cotización" formula={`${eur(bruto)} de bruto → ${eur(nomina.cotTra)} de cotización del trabajador`}>
                En régimen general se toma como base hasta {eur(params.baseMax)}; por encima se aplica,
                cuando corresponde, la cotización adicional de solidaridad. Los tipos y topes salen de la{' '}
                <a href="https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537" target="_blank" rel="noreferrer noopener">TGSS</a>
                {' '}y de las órdenes anuales de cotización.
              </PasoMetodo>
              <PasoMetodo n="02" titulo="Rendimiento previo" formula={`${eur(bruto)} − ${eur(nomina.cotTra)} = ${eur(nomina.rnPrevio)}`}>
                La cotización del trabajador reduce el rendimiento íntegro antes de aplicar los gastos y
                reducciones del trabajo.
              </PasoMetodo>
              <PasoMetodo n="03" titulo="Gastos y reducciones" formula={`${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)} − ${eur(nomina.redTrabajo)}${nomina.reduccionConjunta > 0 ? ` − ${eur(nomina.reduccionConjunta)}` : ''} = ${eur(nomina.baseImponible)}`}>
                Se aplican los gastos deducibles del{' '}
                <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a19" target="_blank" rel="noreferrer noopener">art. 19 LIRPF</a>
                {' '}y, si procede, la reducción del{' '}
                <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a20" target="_blank" rel="noreferrer noopener">art. 20 LIRPF</a>.
              </PasoMetodo>
              <PasoMetodo n="04" titulo="Cuota por tramos" formula={`${eur(nomina.cuotaIntegra)} − ${eur(nomina.cuotaMinimo)} = ${eur(nomina.cuotaTeorica)}`}>
                La escala progresiva se aplica a la base y, por separado, al mínimo personal y familiar.
                La diferencia es la cuota teórica. Consulta la{' '}
                <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a63" target="_blank" rel="noreferrer noopener">escala del art. 63 LIRPF</a>
                {' '}y los <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a56" target="_blank" rel="noreferrer noopener">arts. 56–61</a>.
              </PasoMetodo>
              <PasoMetodo n="05" titulo="Deducciones y límite" formula={`${eur(nomina.cuotaTeorica)} − ${eur(nomina.deduccionSMI)} → ${eur(nomina.irpfFinal)} de IRPF`}>
                Se resta la deducción por rendimientos del trabajo cuando existe y se aplica el límite de
                retención modelizado. El resultado nunca baja de cero.
              </PasoMetodo>
              <PasoMetodo n="06" titulo="Neto disponible" formula={`${eur(bruto)} − ${eur(nomina.cotTra)} − ${eur(nomina.irpfFinal)} = ${eur(nomina.salarioNeto)}`}>
                El neto anual se divide entre 12 o 14 pagas sólo para mostrar la periodicidad; la suma anual
                no cambia.
              </PasoMetodo>
            </ol>
          </div>

          <div className="fs-method-families">
            <article id="metodo-marginal">
              <span className="fs-stamp">Método M1 · marginal</span>
              <h4>Dos cálculos separados por 100 €</h4>
              <p>
                Se calcula la nómina con {eur(bruto)} y con {eur(bruto + 100)}. El marginal total es
                1 − (Δ neto / 100), hoy {pct(marginal.tipoMarginalTotal * 100)}; el marginal de IRPF es
                Δ IRPF / 100, hoy {pct(marginal.tipoMarginalIRPF * 100)}.
              </p>
            </article>
            <article id="metodo-historico">
              <span className="fs-stamp">Método M2 · historia</span>
              <h4>Mismo poder adquisitivo, reglas de cada año</h4>
              <p>
                Se reexpresa el salario de referencia con el IPC acumulado de diciembre del INE y se vuelve
                a ejecutar toda la cadena fiscal con los parámetros del año comparado. El contrafactual
                indexado mueve también los umbrales monetarios con ese mismo factor.
              </p>
            </article>
            <article id="metodo-distribucion">
              <span className="fs-stamp">Método M3 · distribución</span>
              <h4>Del dato del INE a veinte grupos estimados</h4>
              <p>
                La tabla 28191 del INE publica P10, P25, P50, P75 y P90, además de la media. La media
                es un promedio, no un punto de la escala de percentiles. El mosaico usa los cinco
                percentiles como anclas; el resto de salarios y toda la carga fiscal son cálculos propios.
              </p>
            </article>
            <article id="metodo-equivalencias">
              <span className="fs-stamp">Método M4 · equivalencias</span>
              <h4>De la cuña a un reparto y a casillas de calendario</h4>
              <p>
                El río combina una cifra calculada para tu perfil con porcentajes del gasto público
                español de 2023. El calendario dibuja esa proporción en casillas fechadas.
                Ambas transformaciones se detallan a continuación.
              </p>
            </article>
          </div>

          <div className="fs-method-ledger" aria-labelledby="metodo-mosaico-t">
            <div className="fs-method-head">
              <span className="fs-stamp">Cálculo propio · figura 25 · {anio}</span>
              <h4 id="metodo-mosaico-t" className="fs-title-sm">Cómo se calcula el mosaico salarial</h4>
              <p className="fs-note">
                Ejemplo con el grupo de percentiles 50 a 55 y el perfil fiscal que tienes seleccionado.
                Las otras diecinueve columnas siguen exactamente las mismas operaciones.
              </p>
            </div>
            <ol className="fs-method-steps">
              <PasoMetodo n="01" titulo="Cinco anclas salariales publicadas por el INE" formula={`P50 = ${eur(dist.p50, 2)}; P75 = ${eur(dist.p75, 2)}`}>
                La tabla 28191 ofrece P10, P25, mediana o P50, P75 y P90 para el total nacional.
                También ofrece el salario medio, que no entra en la interpolación.{' '}
                {anio > ULTIMO_ANIO_SALARIAL_OFICIAL
                  ? `Las referencias de ${anio} se proyectan a partir de ${ULTIMO_ANIO_SALARIAL_OFICIAL}: cada cifra se multiplica por (1 + ${pct(CRECIMIENTO_PROYECCION_SALARIAL * 100)}) elevado a ${anio - ULTIMO_ANIO_SALARIAL_OFICIAL}. Ese crecimiento es un supuesto propio, no un dato del INE de ${anio}.`
                  : `Las referencias de ${anio} son datos publicados del INE.`}
              </PasoMetodo>
              <PasoMetodo n="02" titulo="Un salario para cada grupo de cinco percentiles" formula={`P52,5 = P50 + (2,5 / 25) × (P75 − P50) ≈ ${eur(bandaEjemplo.salario, 2)}`}>
                El grupo 50 a 55 se representa por su punto medio, P52,5. Entre dos percentiles
                conocidos usamos una recta. Por debajo de P10 se usa una curva de potencia; por
                encima de P90, una curva logarítmica limitada cerca de P100. Las fórmulas propias
                son: bajo P10, salario = P10 × (percentil / 10)^(1 / 0,7); sobre P90, salario = P90
                × [1 − ln(1 − (percentil − 90) / 10)], con el percentil limitado a 99,4. Así, el
                último grupo, centrado en P97,5, recibe {eur(salarioEnPercentil(97.5, dist), 2)}.
                Esa extrapolación es especialmente incierta; ninguna banda es un registro observado
                de salarios individuales.
              </PasoMetodo>
              <PasoMetodo n="03" titulo="Carga de ese salario representativo" formula={`IRPF + cotización del trabajador = ${eur(bandaEjemplo.carga, 2)}`}>
                Se ejecuta el mismo cálculo fiscal para cada uno de los veinte salarios con el perfil
                seleccionado. La cotización empresarial queda fuera de esta figura. La altura del
                bloque es {eur(bandaEjemplo.carga, 2)} / {eur(bandaEjemplo.salario, 2)} ≈{' '}
                {pct((bandaEjemplo.carga / bandaEjemplo.salario) * 100)} del salario bruto.
              </PasoMetodo>
              <PasoMetodo n="04" titulo="Ancho y área del bloque" formula={`Ancho: ${eur(bandaEjemplo.salario, 2)} / ${eur(sumaSalarios, 2)} ≈ ${pct(parteMasaEjemplo * 100)}; área relativa: ${eur(bandaEjemplo.carga, 2)} / ${eur(sumaCargas, 2)} ≈ ${pct(parteCargaEjemplo * 100)}`}>
                Cada grupo representa al 5 % de los asalariados del modelo, así que el factor de
                población es igual para todos y se cancela al comparar. El ancho es su parte de la
                masa salarial estimada. Como altura = carga / salario, el área es proporcional a la
                carga calculada. Dividir entre la suma de las veinte cargas da su participación
                estimada. Es una identidad del modelo, no una medición de recaudación de la AEAT.
              </PasoMetodo>
            </ol>
          </div>

          <div className="fs-method-ledger" aria-labelledby="metodo-gasto-t">
            <div className="fs-method-head">
              <span className="fs-stamp">Cálculo propio · figuras 26 y 27 · {anio}</span>
              <h4 id="metodo-gasto-t" className="fs-title-sm">Cómo se calculan el río y el calendario</h4>
              <p className="fs-note">
                COFOG significa «Clasificación de las Funciones del Gobierno». Ordena el gasto de las
                administraciones por finalidad, como protección social, sanidad o educación. Usamos
                los importes provisionales de España de {GASTO_COFOG.anio}, publicados por la IGAE.
              </p>
            </div>
            <ol className="fs-method-steps">
              <PasoMetodo n="01" titulo="Importe que entra en el río" formula={`${eur(nomina.cotEmp, 2)} + ${eur(nomina.cotTra, 2)} + ${eur(nomina.irpfFinal, 2)} = ${eur(cuna, 2)}`}>
                Se suman la cotización de la empresa, la del trabajador y el IRPF estimado. La misma
                cifra se obtiene restando al coste laboral, {eur(nomina.costeLab, 2)}, el salario neto,
                {eur(nomina.salarioNeto, 2)}. La cotización empresarial forma parte del coste laboral;
                no es un descuento adicional de tu salario bruto. El neto queda fuera del río.
              </PasoMetodo>
              <PasoMetodo n="02" titulo="Porcentaje COFOG y equivalencia en euros" formula={`${dec(gastoSocial, 0)} M€ / ${dec(GASTO_COFOG.total, 0)} M€ ≈ ${pct(parteSocial * 100, 2)}; ${eur(cuna, 2)} × ${pct(parteSocial * 100, 2)} ≈ ${eur(cuna * parteSocial, 2)}`}>
                Protección social representa {gastoSocial.toLocaleString('es-ES')} de los{' '}
                {GASTO_COFOG.total.toLocaleString('es-ES')} millones de euros del gasto COFOG de
                {GASTO_COFOG.anio}. Para cada otra función se hace la misma división y se multiplica
                por tu cuña. El porcentaje procede del gasto agregado; el importe en euros del río
                es una proyección propia. No identifica el destino efectivo de tus pagos.
              </PasoMetodo>
              <PasoMetodo n="03" titulo="Proporción del coste laboral" formula={`${eur(cuna, 2)} / ${eur(nomina.costeLab, 2)} ≈ ${pct(parteCuna * 100, 2)}`}>
                Dividir responde a una pregunta concreta: de todo lo que cuesta este puesto de
                trabajo, ¿qué parte corresponde al IRPF y a las dos cotizaciones? El resto corresponde
                al salario neto estimado.
              </PasoMetodo>
              <PasoMetodo n="04" titulo="Esa proporción, dibujada en casillas" formula={`${pct(parteCuna * 100, 2)} × ${totalDias} casillas ≈ ${diasCuna} casillas coloreadas`}>
                El calendario se usa como una barra de {totalDias} partes iguales: cada casilla
                representa 1/{totalDias} del coste laboral anual, aunque lleve una fecha. Se redondea
                al entero más cercano. Las {diasCuna} coloreadas representan la parte de cuña y las{' '}
                {totalDias - diasCuna} sin relleno, la parte del neto. Los tres colores de las casillas
                pintadas vuelven a usar las proporciones COFOG; colocarlas desde enero sólo ayuda a
                contarlas y no marca fechas de pago.
              </PasoMetodo>
            </ol>
          </div>
        </Seccion>

        {/* ── B ─────────────────────────────────────────────────────────── */}
        <Seccion letra="B" titulo="Parámetros, 2012—2026">
          <div className="fs-table-scroll">
            <table className="fs-table is-fija">
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
            <Fuente>Fuente · BOE · TGSS · órdenes anuales de cotización · INE (IPC)</Fuente>
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
                    <p className="fs-stamp" style={{ marginTop: 4 }}>
                      {e.urls ? e.urls.map((f, j) => (
                        <span key={f.url}>
                          {j > 0 && ' · '}
                          <a href={f.url} target="_blank" rel="noreferrer noopener">{f.label}</a>
                        </span>
                      )) : e.url ? (
                        <a href={e.url} target="_blank" rel="noreferrer noopener">{e.subtitulo}</a>
                      ) : e.subtitulo}
                    </p>
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
            <table className="fs-table is-texto is-apilable">
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
                    <td data-label="Norma o publicación">
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
                  <th scope="row">Gasto público por funciones</th>
                  <td>
                    <a href="https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/paginas/iacogof.aspx" target="_blank" rel="noreferrer noopener">
                      IGAE — Clasificación funcional del gasto de las AAPP (COFOG)
                    </a>
                    {' · '}
                    <a href="https://ec.europa.eu/eurostat/en/web/products-manuals-and-guidelines/-/ks-gq-19-010" target="_blank" rel="noreferrer noopener">
                      Eurostat — Manual COFOG 2019
                    </a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Deuda pública</th>
                  <td>
                    <a href="https://datos.bde.es/datos/es/datasets/000/033.html" target="_blank" rel="noreferrer noopener">
                      Banco de España — Deuda de las AAPP según el PDE
                    </a>
                    {' · INE (población e IPC)'}
                  </td>
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
            <li>
              Las figuras de gasto aplican el reparto agregado COFOG a la cuña estimada. No existe
              trazabilidad entre el IRPF de una persona y una función concreta del gasto público.
            </li>
            <li>
              El calendario convierte una proporción en días consecutivos desde el 1 de enero. Su
              fecha de corte es una convención visual, no una fecha oficial ni un calendario de devengo.
            </li>
          </ul>
        </Seccion>
      </div>
    </section>
  );
}

function PasoMetodo({ n, titulo, formula, children }) {
  return (
    <li>
      <span className="fs-method-n">{n}</span>
      <div>
        <h5>{titulo}</h5>
        <p className="fs-method-formula">{formula}</p>
        <p>{children}</p>
      </div>
    </li>
  );
}

function Seccion({ letra, titulo, children, id }) {
  return (
    <section id={id} style={{ marginBottom: 'clamp(48px, 8vh, 96px)', scrollMarginTop: 72 }} aria-labelledby={`ap-${letra}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: '1px solid var(--ink)', paddingBottom: 8, marginBottom: 24 }}>
        <span className="fs-stamp" style={{ fontSize: 13 }}>{letra}</span>
        <h3 id={`ap-${letra}`} className="fs-title-sm">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}
