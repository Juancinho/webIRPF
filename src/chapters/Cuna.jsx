import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { CUNA_OCDE_2025 } from '../engine/irpf';
import Ocde from './Ocde';
import CampoCuna from './CampoCuna';
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
      { key: 'irpf', label: 'IRPF', value: p(nomina.irpfFinal), color: '#9aa0a2' },
      { key: 'ssTra', label: 'SS trabajador', value: p(nomina.cotTra), color: '#5f686b' },
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
            De cada 100 €
            <br />
            de coste laboral
          </h2>
          <p className="fs-kicker">
            La cuña fiscal mide la diferencia entre el coste laboral total y la renta neta. La
            expresamos sobre cien euros para separar sus componentes y para comparar el mismo
            indicador, con una metodología homogénea, entre países.
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
                Sobre el bruto, la cuña de tu nómina es {pct(((bruto - nomina.salarioNeto) / Math.max(bruto, 1)) * 100)}.
                Sobre el coste laboral total, {pct(nomina.cunaFiscal * 100)}. Misma realidad, dos
                denominadores.
              </p>
            </div>
          </aside>

          <div className="fs-field">
            <p className="fs-data fs-data-rule" style={{ color: 'var(--night-signal)', marginTop: 8 }}>
              {pct(nomina.cunaFiscal * 100)}
            </p>
            <p className="fs-body" style={{ marginTop: 10 }}>
              Es tu cuña fiscal sobre el coste laboral total: la suma de IRPF y cotizaciones en este
              supuesto. En la medida estandarizada de la OCDE, España se sitúa en el{' '}
              {pct(ESPANA.total)} y la media de la OCDE en el {pct(MEDIA.total)}.
            </p>

            <Puente rotulo="¿Mucho comparado con qué?">
              Un {pct(nomina.cunaFiscal * 100)} no significa nada por sí solo: hace falta un patrón
              de medida. La OCDE publica exactamente esta cifra, calculada igual para treinta y
              ocho países, con el mismo supuesto estandarizado para todos.
            </Puente>

            <Ocde />
          </div>
        </div>
      </div>
    </section>
  );
}
