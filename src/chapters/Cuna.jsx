import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { CUNA_OCDE_2025 } from '../engine/irpf';
import Ocde from './Ocde';
import CampoCuna from './CampoCuna';
import GuiaRail from '../figures/GuiaRail';
import Puente from '../figures/Puente';
import { pct } from '../utils/format';

const MEDIA = CUNA_OCDE_2025.find(p => p.code === 'OECD');
const ESPANA = CUNA_OCDE_2025.find(p => p.code === 'ES');

/**
 * 05 · LA CUÑA FISCAL — the inverted chapter.
 * FIG. 15 cien bloques contables que se reagrupan entre la perspectiva del
 * trabajador y la de la empresa (continuidad del objeto, nunca un cambio de
 * gráfico). FIG. 16 los mismos cien euros, país a país, en la OCDE.
 */
export default function Cuna() {
  const { bruto, anio, nomina } = useFiscal();
  const [vista, setVista] = useState('empresa');

  const total = vista === 'empresa' ? nomina.costeLab : bruto;
  const p = v => (total > 0 ? (v / total) * 100 : 0);

  const grupos = useMemo(() => {
    const base = [
      { key: 'neto', label: 'Renta neta', value: p(nomina.salarioNeto), color: 'var(--night-ink)' },
      { key: 'irpf', label: 'IRPF', value: p(nomina.irpfFinal), color: 'var(--night-counter)' },
      { key: 'ssTra', label: 'SS trabajador', value: p(nomina.cotTra), color: 'var(--series-violet)' },
    ];
    if (vista === 'empresa') {
      base.push({ key: 'ssEmp', label: 'SS empresa', value: p(nomina.cotEmp), color: 'var(--night-signal)' });
    }
    return base.map(g => ({ ...g, value: Math.round(g.value) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista, nomina, total]);


  return (
    <section id="cuna" className="fs-chapter fs-night fs-open-wedge" aria-labelledby="cuna-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">05</span>

        <div className="fs-chapter-head" data-gesture="COSTE LABORAL = NETO + IRPF + COTIZACIONES">
          <span className="fs-stamp">05 / 09 · La cuña fiscal</span>
          <h2 id="cuna-t" className="fs-title">
            De cada 100 €{' '}
            <br />
            de coste laboral
          </h2>
          <p className="fs-kicker">
            La cuña fiscal es la parte del coste de tu puesto que no llega a tu cuenta. Incluye el
            IRPF estimado y {nomina.regimen === 'autonomo' ? 'tu cuota de autónomos' : 'las cotizaciones que pagáis tú y la empresa'}. Aquí dividimos el coste
            laboral en cien partes para ver cuánto representa cada concepto.
          </p>
        </div>

        <CampoCuna
          grupos={grupos}
          anio={anio}
          bruto={bruto}
          nomina={nomina}
          vista={vista}
          setVista={setVista}
          total={total}
        />

        <div className="fs-spread">
          <aside className="fs-rail">
            <GuiaRail seccion="cuna" />
            <div className="fs-rail-item">
              <span className="fs-stamp">Qué mide</span>
              <p className="fs-note">
                La cuña fiscal es la distancia entre lo que cuesta un puesto de trabajo y lo que
                recibe quien lo ocupa. No mide la calidad ni el retorno de los servicios públicos
                que financia.
              </p>
            </div>
            <div className="fs-rail-item">
              <span className="fs-stamp">Dos perspectivas</span>
              <p className="fs-note">
                De tu salario bruto se descuentan el{' '}
                {pct(((bruto - nomina.salarioNeto) / Math.max(bruto, 1)) * 100)} entre IRPF estimado y
                tu cotización. {nomina.regimen === 'autonomo' ? 'En este perfil no hay cotización empresarial adicional.' : 'La cuña fiscal incluye además la cotización de la empresa.'} Supone el{' '}
                {pct(nomina.cunaFiscal * 100)} del coste laboral completo.
              </p>
            </div>
          </aside>

          <div className="fs-field">
            <p className="fs-data fs-data-rule" style={{ color: 'var(--night-signal)', marginTop: 8 }}>
              {pct(nomina.cunaFiscal * 100)}
            </p>
            <p className="fs-body" style={{ marginTop: 10 }}>
              Es la parte de tu coste laboral que corresponde a IRPF estimado y cotizaciones en este
              modelo. Para un caso estándar distinto del tuyo, la OCDE calcula para España el{' '}
              {pct(ESPANA.total)} y la media de la OCDE en el {pct(MEDIA.total)}.
            </p>

            <Puente rotulo="¿Mucho comparado con qué?">
              Una proporción del {pct(nomina.cunaFiscal * 100)} necesita una referencia para
              interpretarse. La OCDE publica una cuña calculada con un supuesto estandarizado común
              para sus países miembros. Ese dato permite comparación internacional, pero no sustituye
              al resultado personalizado de esta página, cuyo salario y perfil pueden ser distintos.
            </Puente>

            <Ocde />

            <Puente rotulo="De un caso fiscal a la población asalariada">
              La comparación internacional mantiene fijo un hogar tipo; no indica en qué parte de la
              distribución salarial se encuentra el sueldo seleccionado. El capítulo siguiente cambia
              de fuente y de pregunta: utiliza la Encuesta Anual de Estructura Salarial del INE para
              situar el bruto entre los salarios observados en España.
            </Puente>
          </div>
        </div>
      </div>
    </section>
  );
}
