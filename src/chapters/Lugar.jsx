import { useMemo, useState } from 'react';
import { useNumeroAnimado } from '../hooks/useNumeroAnimado';
import Puente from '../figures/Puente';
import { useFiscal } from '../state/fiscalContext';
import {
  ANIOS,
  DISTRIBUCION_SALARIAL,
  ULTIMO_ANIO_SALARIAL_OFICIAL,
  CRECIMIENTO_PROYECCION_SALARIAL,
  inflacionAcumulada,
  percentilDe,
} from '../engine/irpf';
import { CurvaDistribucion, Percentiles, EvolucionDistribucion } from './Distribucion';
import Enjambre from './Enjambre';
import Mosaico from './Mosaico';
import { dec, eur, pct } from '../utils/format';

/**
 * 06 · TU LUGAR Y TU PARTE
 * FIG. 20 la curva de la distribución · FIG. 21 los percentiles · FIG. 22 mil
 * asalariados punto a punto · FIG. 23 la distribución en el tiempo ·
 * FIG. 24 quién sostiene la recaudación.
 */
export default function Lugar() {
  const { bruto, anio, percentil } = useFiscal();
  const dist = DISTRIBUCION_SALARIAL[anio];

  const percentilAnimado = useNumeroAnimado(percentil);

  return (
    <section id="lugar" className="fs-chapter fs-open-percentile" aria-labelledby="lugar-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">06</span>

        <div className="fs-spread">
          <aside className="fs-rail">
            <div className="fs-rail-item">
              <span className="fs-stamp">Nota 04</span>
              <p className="fs-note">
                El percentil no mide riqueza: mide salario bruto anual entre los asalariados que
                cubre la Encuesta Anual de Estructura Salarial del INE.
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Progresividad en frío</span>
              <p className="fs-note">
                Si tu salario sube exactamente con el IPC, tu poder adquisitivo no mejora — y aun
                así puedes caer en la escala relativa si el resto sube más.
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Fuente</span>
              <p className="fs-note">
                INE · EAES, tabla 28191, ambos sexos, total nacional.
                {anio > ULTIMO_ANIO_SALARIAL_OFICIAL && (
                  <>
                    {' '}
                    Los años posteriores a {ULTIMO_ANIO_SALARIAL_OFICIAL} son proyección propia
                    (+{pct(CRECIMIENTO_PROYECCION_SALARIAL * 100, 1)} anual), no dato publicado.
                  </>
                )}
              </p>
              <p className="fs-source">
                <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=28191" target="_blank" rel="noreferrer noopener">
                  INE — Tabla 28191
                </a>
              </p>
            </div>
          </aside>

          <div className="fs-field">
            <div className="fs-chapter-head" data-gesture={`PERCENTIL ${Math.round(percentil)} · POSICIÓN, NO RIQUEZA`}>
              <span className="fs-stamp">06 / 09 · Tu lugar</span>
              <h2 id="lugar-t" className="fs-title">
                Dónde te coloca
                <br />
                el sistema
              </h2>
              <p className="fs-kicker">
                Dejamos el cálculo fiscal y pasamos a la distribución salarial. El percentil sitúa
                tu bruto entre los asalariados: indica qué proporción cobra menos, pero no mide
                patrimonio, renta del hogar ni bienestar económico.
              </p>
            </div>

            <p className="fs-statement fs-statement-rule fs-signal" style={{ maxWidth: '10ch' }}>
              {Math.round(percentilAnimado)}
              <span className="fs-u fs-u-muted" style={{ fontSize: '0.3em', letterSpacing: '0.1em' }}> DE 100</span>
            </p>
            <p className="fs-body" style={{ marginTop: 12, marginBottom: 36 }}>
              Es tu percentil en {anio}: ganas más que {Math.round(percentil)} de cada 100
              asalariados. La mediana está en <strong>{eur(dist.p50)}</strong> — la mitad de los
              asalariados cobra menos que eso.
            </p>

            <CurvaDistribucion />

            <Puente rotulo="De la curva a tu casilla">
              La curva dice cuánta gente hay en cada altura de la escala. No dice dónde estás tú,
              y ese es el dato que convierte una estadística en algo personal: un número entre uno
              y cien.
            </Puente>

            <Percentiles />

            <Enjambre />

            <Puente rotulo="La escalera también se mueve">
              Una foto de un solo año no dice si la escalera sube contigo o sin ti. Esta es la
              misma distribución repetida quince veces: no sólo cambia tu sueldo,{' '}
              <strong>cambia la fila en la que te deja</strong>.
            </Puente>

            <EvolucionDistribucion />

            {anio > 2012 && <Escenario bruto={bruto} anio={anio} />}

            <Puente rotulo="De dónde sale el dinero">
              Ya sabes dónde cae tu sueldo. Queda la pregunta que se discute todos los días sin
              mirar los números: <strong>de qué parte de la escala sale lo que se recauda</strong>.
              La figura siguiente la responde con una regla sencilla —cuánto cobra cada tramo por
              cuánto paga— de manera que la superficie de cada bloque sea su aportación.
            </Puente>

            <Mosaico />

            <Puente rotulo="Cambio de pregunta">
              La distribución termina aquí: responde <strong>dónde está tu salario</strong>. El
              capítulo siguiente no continúa esta escala ni describe tu percentil; cambia de objeto
              y estudia, de forma agregada, <strong>cómo se distribuye el gasto público por funciones</strong>.
            </Puente>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── the inflation scenario, preserved from the original distribution view ── */
function Escenario({ bruto, anio }) {
  const destino = anio;
  const [origenSel, setOrigen] = useState(2018);
  const origen = Math.min(origenSel, destino - 1);

  const e = useMemo(() => {
    const factor = inflacionAcumulada(origen, destino);
    const equivalente = bruto * factor;
    return {
      factor,
      equivalente,
      pOrigen: percentilDe(bruto, origen),
      pDestino: percentilDe(equivalente, destino),
    };
  }, [origen, destino, bruto]);

  const salto = e.pDestino - e.pOrigen;

  return (
    <div style={{ margin: '0 0 clamp(40px, 6vh, 72px)' }}>
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">En {origen}</span>
          <span className="fs-readout-v">Percentil {Math.round(e.pOrigen)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Mismo sueldo actualizado al IPC en {destino}</span>
          <span className="fs-readout-v">{eur(e.equivalente)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Percentil resultante</span>
          <span className="fs-readout-v fs-signal">
            {Math.round(e.pDestino)} <span style={{ fontSize: 13, fontWeight: 600 }}>({salto >= 0 ? '+' : '−'}{dec(Math.abs(salto))})</span>
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label className="fs-label" htmlFor="esc-origen">
          Año de partida
        </label>
        <select id="esc-origen" className="fs-select" value={origen} onChange={ev => setOrigen(+ev.target.value)}>
          {ANIOS.filter(a => a < destino).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <p className="fs-note" style={{ marginTop: 12, maxWidth: '68ch' }}>
        {salto < -3
          ? `Aunque tu sueldo hubiera seguido exactamente al IPC desde ${origen}, hoy ocuparías una posición relativa más baja: el resto de salarios ha crecido por encima de la inflación.`
          : salto > 3
            ? `Siguiendo sólo al IPC desde ${origen} tu posición relativa habría mejorado: el conjunto de los salarios creció por debajo de la inflación.`
            : `Siguiendo el IPC desde ${origen}, tu posición relativa se mantendría prácticamente igual.`}
      </p>
    </div>
  );
}
