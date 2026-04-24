import { useState } from 'react';
import { obtenerParametros } from '../engine/irpf';
import { eur, pct, num } from '../utils/format';

const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);

const HITOS = [
  {
    anios: [2012, 2013, 2014],
    titulo: 'Era de las subidas — La Gran Recesión',
    color: '#ef4444',
    texto: `Durante estos años se aplican los tipos más altos de IRPF del período analizado, como respuesta a la crisis de deuda soberana y los rescates bancarios. El tipo marginal máximo llega al 52% (desde 300.000€). Se mantienen 7 tramos. No existen gastos deducibles fijos (Art.19) y la reducción por rendimientos del trabajo (Art.20) es más limitada. El mínimo personal y familiar es de 5.151€.`,
  },
  {
    anios: [2015],
    titulo: 'La gran reforma fiscal',
    color: '#f59e0b',
    texto: `La Ley 26/2014 reforma profundamente el IRPF. Se reduce el número de tramos de 7 a 5. Los tipos bajan significativamente: el marginal máximo pasa al 46% y el mínimo al 19.5%. Se introducen los gastos deducibles fijos de 2.000€ (Art.19) y se amplían los umbrales de la reducción por rendimientos del trabajo (Art.20). El mínimo personal sube a 5.550€. Una reforma que beneficia especialmente a rentas medias.`,
  },
  {
    anios: [2016, 2017],
    titulo: 'Consolidación de la reforma',
    color: '#f59e0b',
    texto: `Se completa la reforma de 2015: el tipo del primer tramo baja al 19% (desde 19.5%) y el máximo al 45%. La estructura de 5 tramos se consolida. La reducción Art.20 se estabiliza con los parámetros reformados.`,
  },
  {
    anios: [2018],
    titulo: 'Año de transición (régimen transitorio Art.20)',
    color: '#8b5cf6',
    texto: `2018 es un año singular: la reducción por rendimientos del trabajo (Art.20) se calcula como la media aritmética entre la normativa de 2017 y la de 2019. Esto supone una transición suave hacia la ampliación de los beneficios para rentas bajas.`,
  },
  {
    anios: [2019, 2020, 2021, 2022],
    titulo: 'Ampliación de la reducción para rentas bajas',
    color: '#3b82f6',
    texto: `La reducción Art.20 se amplía notablemente: el umbral inferior sube a 13.115€ y la reducción máxima a 5.565€. Se introduce el mínimo exento de retención en 14.000€ (2019). La pandemia de COVID-19 (2020) no provoca cambios sustanciales en la tarifa general, aunque el IPC cae ligeramente. En 2021 comienza la presión inflacionaria con el IPC subiendo un 6.5%.`,
  },
  {
    anios: [2023],
    titulo: 'Respuesta a la inflación — Ampliación SMI y Art.20',
    color: '#10b981',
    texto: `Se vuelve a ampliar el Art.20: umbral inferior a 14.047,50€ y reducción máxima a 6.498€. Se aumenta el mínimo exento de retención a 15.000€. Se introduce el MEI (Mecanismo de Equidad Intergeneracional) para financiar las pensiones: 0,5% empleador + 0,1% trabajador. Se añade un tipo marginal del 47% a partir de 300.000€, creando 6 tramos.`,
  },
  {
    anios: [2024, 2025],
    titulo: 'Nuevo impulso a las rentas bajas',
    color: '#10b981',
    texto: `Nueva expansión del Art.20: umbral inferior a 14.852€ y reducción máxima a 7.302€, con una fórmula en dos tramos con pendientes diferentes. Se introduce una deducción directa en cuota para los trabajadores próximos al SMI (desde 2025). El MEI sube progresivamente. En 2025 aparece la cotización de solidaridad: un recargo sobre la parte del salario que excede la base máxima de cotización, de aplicación progresiva.`,
  },
  {
    anios: [2026],
    titulo: 'Estado actual — Mayor protección a rentas bajas',
    color: '#6366f1',
    texto: `La deducción para rentas próximas al SMI alcanza 590,89€, con fase-out progresivo hasta los 17.094€ brutos. El MEI sube al 0,75% (empresa) + 0,15% (trabajador). La cotización de solidaridad se intensifica. La base máxima de cotización alcanza 61.214,40€. Los parámetros del Art.20 no varían respecto a 2024.`,
  },
];

function FilaParam({ label, valor }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-[var(--text)]">{label}</span>
      <span className="text-xs font-mono text-[var(--text-h)] font-medium">{valor}</span>
    </div>
  );
}

function TarjetaAnio({ anio }) {
  const p = obtenerParametros(anio);
  const tipoEmp = (p.tipoEmp * 100).toFixed(2);
  const tipoTra = (p.tipoTra * 100).toFixed(2);
  const mei = p.mei;

  return (
    <div className="card p-4 space-y-3">
      <h4 className="text-sm font-bold text-[var(--text-h)]">Parámetros {anio}</h4>
      <FilaParam label="Base máx. cotización" valor={eur(p.baseMax)} />
      <FilaParam label="Tipo SS empresa" valor={`${tipoEmp}%`} />
      <FilaParam label="Tipo SS trabajador" valor={`${tipoTra}%`} />
      {(mei[0] > 0) && <FilaParam label="MEI (emp. / tra.)" valor={`${(mei[0]*100).toFixed(3)}% / ${(mei[1]*100).toFixed(3)}%`} />}
      <FilaParam label="Gastos deducibles (Art.19)" valor={eur(p.gastosFijos)} />
      <FilaParam label="Mín. contribuyente (Art.57)" valor={eur(p.irpfMinimo)} />
      <FilaParam label="Mín. exento retención" valor={eur(p.minimoExento)} />
      {typeof p.art20Meta.uInf === 'number' && (
        <>
          <FilaParam label="Art.20 — Umbral inf." valor={eur(p.art20Meta.uInf)} />
          <FilaParam label="Art.20 — Red. máx." valor={eur(p.art20Meta.rMax)} />
          <FilaParam label="Art.20 — Umbral sup." valor={typeof p.art20Meta.uSup === 'number' ? eur(p.art20Meta.uSup) : p.art20Meta.uSup} />
        </>
      )}
      {typeof p.art20Meta.uInf === 'string' && (
        <FilaParam label="Art.20" valor="Régimen transitorio" />
      )}
      {p.hasSolidaridad && <FilaParam label="Cotización solidaridad" valor="Sí (desde 2025)" />}

      <div className="border-t border-[var(--border)] pt-2">
        <p className="text-xs text-[var(--text)] font-medium mb-1">Tramos IRPF</p>
        {p.tramos.map(([lim, tipo], i) => (
          <div key={i} className="flex justify-between text-xs py-0.5">
            <span className="text-[var(--text)]">
              {i === 0 ? `Hasta ${eur(lim)}` : lim === Infinity ? `Desde ${eur(p.tramos[i-1][0])}` : `${eur(p.tramos[i-1][0])}–${eur(lim)}`}
            </span>
            <span className="font-mono text-[var(--accent-light)] font-semibold">{(tipo * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREGUNTAS = [
  {
    q: '¿Qué es el IRPF y cómo funciona?',
    a: `El Impuesto sobre la Renta de las Personas Físicas (IRPF) es un impuesto personal, progresivo y directo que grava la renta obtenida por las personas físicas residentes en España. "Progresivo" significa que a mayor renta, mayor tipo impositivo.

Para los trabajadores por cuenta ajena, el IRPF se retiene directamente de la nómina mensual (se paga "a cuenta"). El empleador actúa como retenedor y lo ingresa a Hacienda.

El cálculo parte del salario bruto, al que se restan las deducciones (cotizaciones, gastos, reducciones) hasta obtener la Base Imponible. Sobre ésta se aplica la tarifa progresiva por tramos, se resta el mínimo personal y familiar, y se obtiene la cuota a pagar.`
  },
  {
    q: '¿Qué es la reducción por rendimientos del trabajo (Art. 20 LIRPF)?',
    a: `Es una reducción que se aplica sobre los rendimientos del trabajo para las rentas más bajas. Su objetivo es reducir la carga fiscal de los trabajadores con menores ingresos.

Funciona con un umbral inferior (por debajo del cual la reducción es máxima), un umbral superior (por encima del cual la reducción es cero) y un intervalo de reducción progresiva entre ambos. Ha sido una de las palancas más utilizadas en los últimos años para beneficiar a rentas bajas sin modificar la tarifa general.`
  },
  {
    q: '¿Qué son los gastos deducibles del Art. 19?',
    a: `Son 2.000€ anuales deducibles del rendimiento del trabajo que se introdujeron con la reforma fiscal de 2015 como "gastos de difícil justificación" (desplazamientos, vestuario laboral, etc.). Antes de 2015 no existían. Para rentas bajas, este importe puede marcar la diferencia entre pagar o no pagar IRPF.`
  },
  {
    q: '¿Qué es el límite del 43% (Art. 85.3 LIRPF)?',
    a: `Este artículo establece que el tipo de retención no puede ser superior al 43% de la diferencia entre el salario bruto y el mínimo exento de retención. Es un tope de seguridad: aunque el cálculo teórico arrojase más, el trabajador nunca pagará más de ese límite como retención. Es relevante para salarios muy bajos (próximos al mínimo exento) donde el cálculo podría distorsionarse.`
  },
  {
    q: '¿Qué es el MEI (Mecanismo de Equidad Intergeneracional)?',
    a: `Introducido en 2023, es una cuota adicional a la Seguridad Social destinada a financiar el Fondo de Reserva de las Pensiones ("hucha de las pensiones"). Lo pagan empresas y trabajadores sobre la misma base que las contingencias comunes. Va aumentando progresivamente: 0,6% en 2023, 0,7% en 2024, 0,8% en 2025, 0,9% en 2026 (del cual 3/4 paga la empresa).`
  },
  {
    q: '¿Qué es la cotización de solidaridad?',
    a: `Desde 2025, los salarios que superen la base máxima de cotización soportan una cuota adicional ("de solidaridad") sobre ese exceso, con tipos progresivos. Hasta 2024, ese exceso quedaba exento de cotización SS. Esta medida busca aumentar los ingresos del sistema de pensiones ampliando la base efectiva de cotización para rentas muy altas.`
  },
  {
    q: '¿Cómo afecta la inflación al poder adquisitivo del salario neto?',
    a: `La "ilusión monetaria" hace que un salario mayor en euros nominales pueda ser menor en términos reales si la inflación ha subido más. Para comparar salarios de distintos años hay que ajustarlos por el IPC (Índice de Precios al Consumo). Si tu salario sube un 3% pero la inflación es del 7%, pierdes poder adquisitivo. La herramienta "Evolución histórica" de esta web hace exactamente ese ajuste, mostrando todo en euros constantes de 2026.`
  },
];

export default function Normativa() {
  const [anioSel, setAnioSel] = useState(2026);
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);

  const hitoActual = HITOS.find(h => h.anios.includes(anioSel));

  return (
    <div className="space-y-6">
      {/* Manual conceptual */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-[var(--text-h)] mb-4">Manual: Conceptos clave del IRPF y la nómina</h3>
        <div className="space-y-3">
          {PREGUNTAS.map((p, i) => (
            <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setPreguntaAbierta(preguntaAbierta === i ? null : i)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-[var(--surface2)] transition-colors">
                <span className="text-sm font-medium text-[var(--text-h)]">{p.q}</span>
                <span className="text-[var(--accent)] text-lg ml-3 shrink-0">{preguntaAbierta === i ? '−' : '+'}</span>
              </button>
              {preguntaAbierta === i && (
                <div className="px-4 pb-4 pt-0">
                  {p.a.split('\n\n').map((par, j) => (
                    <p key={j} className="text-sm text-[var(--text)] leading-relaxed mb-2 last:mb-0">{par}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hitos normativos */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-[var(--text-h)] mb-4">Línea temporal: cambios normativos 2012–2026</h3>
        <div className="flex gap-2 flex-wrap mb-5">
          {ANIOS.map(a => {
            const hito = HITOS.find(h => h.anios.includes(a));
            return (
              <button key={a} onClick={() => setAnioSel(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${anioSel === a ? 'border-transparent text-white' : 'border-[var(--border)] text-[var(--text)]'}`}
                style={anioSel === a ? { background: hito?.color || 'var(--accent)' } : {}}>
                {a}
              </button>
            );
          })}
        </div>

        {hitoActual && (
          <div className="rounded-xl p-5 border-l-4" style={{ borderColor: hitoActual.color, background: `${hitoActual.color}15` }}>
            <h4 className="font-bold text-[var(--text-h)] mb-2" style={{ color: hitoActual.color }}>{hitoActual.titulo}</h4>
            {hitoActual.texto.split('\n').map((p, i) => (
              <p key={i} className="text-sm text-[var(--text)] leading-relaxed">{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Ficha técnica del año seleccionado */}
      <div>
        <h3 className="text-base font-bold text-[var(--text-h)] mb-3">Ficha técnica — {anioSel}</h3>
        <TarjetaAnio anio={anioSel} />
      </div>

      {/* Tabla comparativa de todos los años */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-[var(--text-h)] mb-4">Tabla comparativa de parámetros 2012–2026</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Año', 'Base máx. (€)', 'SS Emp.%', 'SS Tra.%', 'MEI Tra.%', 'G. fijos', 'Mín. pers.', 'Mín. exento', 'Tramos', 'Tipo máx.'].map(h => (
                  <th key={h} className="py-2 px-2 text-left text-[var(--text)] font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ANIOS.map(a => {
                const p = obtenerParametros(a);
                const tipoMax = p.tramos[p.tramos.length - 1][1] * 100;
                return (
                  <tr key={a} className={`border-b border-[var(--border)] cursor-pointer transition-colors ${anioSel === a ? 'bg-[var(--accent-dim)]' : 'hover:bg-[var(--surface2)]'}`}
                    onClick={() => setAnioSel(a)}>
                    <td className="py-1.5 px-2 font-semibold text-[var(--text-h)]">{a}</td>
                    <td className="py-1.5 px-2 font-mono">{num(p.baseMax)}</td>
                    <td className="py-1.5 px-2 font-mono">{(p.tipoEmp * 100 - p.mei[0] * 100).toFixed(2)}%</td>
                    <td className="py-1.5 px-2 font-mono">{(p.tipoTra * 100 - p.mei[1] * 100).toFixed(2)}%</td>
                    <td className="py-1.5 px-2 font-mono">{p.mei[1] > 0 ? `${(p.mei[1]*100).toFixed(3)}%` : '—'}</td>
                    <td className="py-1.5 px-2 font-mono">{p.gastosFijos > 0 ? eur(p.gastosFijos) : '—'}</td>
                    <td className="py-1.5 px-2 font-mono">{eur(p.irpfMinimo)}</td>
                    <td className="py-1.5 px-2 font-mono">{eur(p.minimoExento)}</td>
                    <td className="py-1.5 px-2 font-mono">{p.tramos.length}</td>
                    <td className="py-1.5 px-2 font-mono font-semibold" style={{ color: tipoMax > 47 ? 'var(--red)' : tipoMax < 46 ? 'var(--green)' : 'var(--yellow)' }}>
                      {tipoMax.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
