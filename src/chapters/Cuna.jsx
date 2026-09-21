import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { CUNA_OCDE_2025 } from '../engine/irpf';
import Figure from '../figures/Figure';
import Ocde from './Ocde';
import { HundredField } from '../figures/marks';
import { eur, pct } from '../utils/format';

const MEDIA = CUNA_OCDE_2025.find(p => p.code === 'OECD');
const ESPANA = CUNA_OCDE_2025.find(p => p.code === 'ES');

/**
 * 05 · LA CUÑA FISCAL — the inverted chapter.
 * FIG. 15 cien bloques contables que se reagrupan entre la perspectiva del
 * trabajador y la de la empresa (continuidad del objeto, nunca un cambio de
 * gráfico). FIG. 16 los mismos cien euros, país a país, en la OCDE.
 */
export default function Cuna() {
  const { bruto, anio, nomina, focus, setFocus } = useFiscal();
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

  const suma = grupos.reduce((a, g) => a + g.value, 0);
  const netoPct = p(nomina.salarioNeto);

  return (
    <section id="cuna" className="fs-chapter fs-night" aria-labelledby="cuna-t">
      <div className="fs-page">
        <span className="fs-chapter-numeral" aria-hidden="true">05</span>

        <div className="fs-chapter-head">
          <span className="fs-stamp">05 / 07 · La cuña fiscal</span>
          <h2 id="cuna-t" className="fs-title">
            De cada 100 €
            <br />
            de coste laboral
          </h2>
          <p className="fs-kicker">
            Esta es la pregunta que el capítulo 02 dejó abierta. Cien bloques, uno por euro, y la
            misma figura vista desde los dos lados del contrato.
          </p>
        </div>

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
            <Figure
              id="15"
              title={`${Math.round(netoPct)} € de cada 100 llegan como renta neta`}
              sub={`${anio} · ${vista === 'empresa' ? `sobre el coste laboral total (${eur(nomina.costeLab)})` : `sobre el salario bruto (${eur(bruto)})`} · un bloque = 1 €`}
              legend={`Un bloque = 1 € de cada 100 · ${grupos.map(g => `${g.label} ${g.value}`).join(' + ')} = ${suma}${suma < 100 ? ` · ${100 - suma} € se reparten en el redondeo` : ''}`}
              source={`Fuente · TGSS · AEAT · cálculo propio`}
              summary={grupos.map(g => `${g.label}: ${g.value} de cada 100`).join('; ')}
            >
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className="fs-seg">
                  <button type="button" aria-pressed={vista === 'trabajador'} onClick={() => setVista('trabajador')}>
                    Trabajador
                  </button>
                  <button type="button" aria-pressed={vista === 'empresa'} onClick={() => setVista('empresa')}>
                    Coste empresarial
                  </button>
                </span>
              </div>

              <svg className="fs-svg" viewBox="0 0 440 240" style={{ maxWidth: 520 }}>
                <HundredField
                  groups={grupos}
                  columns={20}
                  size={16}
                  gap={5}
                  x={2}
                  y={6}
                  focus={focus}
                  onFocus={setFocus}
                />
              </svg>

              <div className="fs-keys">
                {grupos.map(g => (
                  <button
                    key={g.key}
                    type="button"
                    className={`fs-key ${focus && focus !== g.key ? 'is-dim' : ''}`}
                    onMouseEnter={() => setFocus(g.key)}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={() => setFocus(g.key)}
                    onBlur={() => setFocus(null)}
                  >
                    <span className="fs-key-swatch" style={{ background: g.color }} />
                    {g.label}
                    <span className="fs-key-v">{g.value} €</span>
                  </button>
                ))}
              </div>
            </Figure>

            <p className="fs-data fs-data-rule" style={{ color: 'var(--night-signal)', marginTop: 8 }}>
              {pct(nomina.cunaFiscal * 100)}
            </p>
            <p className="fs-body" style={{ marginTop: 10 }}>
              Es tu cuña fiscal sobre el coste laboral total: la parte del precio de tu trabajo que
              no llega a tu cuenta. En la misma medida estandarizada, España se sitúa en el{' '}
              {pct(ESPANA.total)} y la media de la OCDE en el {pct(MEDIA.total)}.
            </p>

            <Ocde />
          </div>
        </div>
      </div>
    </section>
  );
}

