import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useURLState } from './hooks/useURLState';
import { useTheme } from './hooks/useTheme';
import CalculadoraCard from './components/CalculadoraCard';
import ThemeToggle from './components/ThemeToggle';
import ScrollReveal from './components/ScrollReveal';
import SalaryJourney from './components/SalaryJourney';
import PayrollStudy from './components/PayrollStudy';
import './index.css';
import './styles/redesign.css';

const SimuladorSubida = lazy(() => import('./components/SimuladorSubida'));
const GraficoComparativo = lazy(() => import('./components/GraficoComparativo'));
const GraficoMecanismos = lazy(() => import('./components/GraficoMecanismos'));
const CuñaFiscal = lazy(() => import('./components/CuñaFiscal'));
const DesgloseEducativo = lazy(() => import('./components/DesgloseEducativo'));
const NormativaFAQ = lazy(() => import('./components/NormativaFAQ'));
const DistribucionSalarial = lazy(() => import('./components/DistribucionSalarial'));
const OCDEComparativa = lazy(() => import('./components/OCDEComparativa'));
const DeudaPublica = lazy(() => import('./components/DeudaPublica'));
const CronologiaTimeline = lazy(() => import('./components/CronologiaTimeline'));

const SECCIONES = [
  {
    id: 'calc',
    n: '1',
    label: 'Tu nómina',
    desc: 'Calculadora IRPF + SS',
    tagline: 'Calcula tu salario neto paso a paso',
  },
  {
    id: 'comparativa',
    n: '2',
    label: 'Histórico',
    desc: '2012–2026 comparado',
    tagline: 'Cómo han cambiado los tipos en 15 años',
  },
  {
    id: 'distribucion',
    n: '3',
    label: 'Distribución',
    desc: 'Tu posición en España',
    tagline: '¿En qué percentil estás dentro de la escala salarial?',
  },
  {
    id: 'internacional',
    n: '4',
    label: 'OCDE',
    desc: 'Cuña fiscal mundial',
    tagline: 'España frente a los demás países de la OCDE',
  },
  {
    id: 'sistema',
    n: '5',
    label: 'El sistema',
    desc: 'Cuña, mecanismos, deuda',
    tagline: 'Los mecanismos ocultos que deciden lo que pagas',
  },
  {
    id: 'normativa',
    n: '6',
    label: 'Normativa',
    desc: 'Reformas y ley',
    tagline: 'Cronología de reformas y fuentes legales',
  },
];

function InfoCard({ children }) {
  return (
    <div className="info-card text-[13.5px] leading-relaxed" style={{ color: 'var(--text)' }}>
      {children}
    </div>
  );
}

function ShareButton({ getShareURL }) {
  const handleShare = async () => {
    const url = getShareURL();
    try {
      if (navigator.share) await navigator.share({ title: 'FiscalScope', url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // Compartir puede cancelarse o no estar permitido; no requiere bloquear la interfaz.
    }
  };
  return (
    <button onClick={handleShare} className="btn-ghost flex items-center gap-1.5 text-[12px]">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Compartir
    </button>
  );
}

function SectionHeading({ tagline, children }) {
  return (
    <div className="mb-8 sm:mb-10">
      {tagline && (
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] mb-2">{tagline}</p>
      )}
      <h2 className="font-display text-[1.8rem] sm:text-[2.4rem] lg:text-[3rem] leading-[1.06] tracking-tight text-[var(--text-h)]">
        {children}
      </h2>
    </div>
  );
}

function SectionLoading() {
  return (
    <div className="liquid-glass p-6 text-sm text-[var(--text-soft)]" role="status" aria-live="polite">
      Cargando sección…
    </div>
  );
}

export default function App() {
  const { bruto, anio, opts, set, setOpts, getShareURL } = useURLState();
  const onChange = useCallback((campo, valor) => set(campo, valor), [set]);
  const { theme, toggle: toggleTheme } = useTheme();

  const [activeId, setActiveId] = useState(() => {
    const hash = typeof window === 'undefined' ? '' : window.location.hash.slice(1);
    return SECCIONES.some(section => section.id === hash) ? hash : 'calc';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeSection = SECCIONES.find(section => section.id === activeId) || SECCIONES[0];

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.slice(1);
      if (SECCIONES.some(section => section.id === hash)) setActiveId(hash);
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const navTo = id => {
    setActiveId(id);
    setMobileNavOpen(false);
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-root">

      {/* ═══════════════ RUNNING PUBLICATION HEADER ═══════════════ */}
      <header className="app-header">
        <div className="app-header-inner">
          <button className="publication-masthead" onClick={() => navTo('calc')} aria-label="Ir a la portada de FiscalScope">
            <strong>FISCALSCOPE</strong>
            <span>INTERACTIVE FISCAL PAPER</span>
          </button>

          <div className="running-chapter" aria-live="polite">
            <span>0{activeSection.n} / 06</span>
            <strong>{activeSection.label}</strong>
          </div>

          <div className="publication-actions">
            <span className="header-note hidden sm:block">ES · {anio}</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <ShareButton getShareURL={getShareURL} />
            <button
              className="index-trigger"
              onClick={() => setMobileNavOpen(o => !o)}
              aria-label="Abrir índice de capítulos"
              aria-expanded={mobileNavOpen}
            >
              ÍNDICE
            </button>
          </div>
        </div>

        <nav className={`publication-index ${mobileNavOpen ? 'open' : ''}`} aria-label="Índice de capítulos">
          <div className="publication-index__heading">
            <span>ÍNDICE</span>
            <button onClick={() => setMobileNavOpen(false)} aria-label="Cerrar índice">Cerrar</button>
          </div>
          {SECCIONES.map(s => (
            <button key={s.id} onClick={() => navTo(s.id)}
              className={activeId === s.id ? 'active' : ''} aria-current={activeId === s.id ? 'page' : undefined}>
              <span>0{s.n}</span>
              <strong>{s.label}</strong>
              <small>{s.desc}</small>
            </button>
          ))}
        </nav>
      </header>

      <nav className="chapter-rail" aria-label="Navegación por capítulos">
        {SECCIONES.map(section => (
          <button
            key={section.id}
            onClick={() => navTo(section.id)}
            className={activeId === section.id ? 'active' : ''}
            aria-label={`${section.n}. ${section.label}`}
            aria-current={activeId === section.id ? 'page' : undefined}
            title={section.label}
          >
            0{section.n}
          </button>
        ))}
      </nav>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="app-main">
        <div className="app-content">

          <Suspense fallback={<SectionLoading />}>
          {/* ═══ Calculadora ═══ */}
          {activeId === 'calc' && (
            <div className="space-y-16">
              <section className="publication-cover" aria-labelledby="cover-title">
                <div className="publication-cover__folio">
                  <span>VOL. 01</span><span>ESPAÑA</span><span>2012—2026</span>
                </div>
                <div className="publication-cover__title">
                  <p>CUADERNO FISCAL INTERACTIVO</p>
                  <h1 id="cover-title">Lo que tu sueldo<br />dice de <em>España.</em></h1>
                  <span>El cálculo es la portada. Mueve tu salario, elige un año y sigue cada euro.</span>
                </div>

                <div className="calculator-shell">
                  <CalculadoraCard
                    bruto={bruto} anio={anio} onChange={onChange}
                    onShare={() => navigator.clipboard?.writeText(getShareURL())}
                    shareLabel="Compartir"
                    opts={opts}
                    onOptsChange={setOpts}
                  />
                </div>
                <p className="publication-cover__source">FUENTE · BOE · INE · TGSS · CÁLCULO ORIENTATIVO</p>
              </section>

              <PayrollStudy bruto={bruto} anio={anio} opts={opts} />

              <SalaryJourney bruto={bruto} anio={anio} opts={opts} />

              <details className="technical-disclosure" open>
                <summary>Apéndice técnico · fórmulas, artículos y fuentes paso a paso</summary>
                <div className="technical-disclosure__body">
                  <DesgloseEducativo bruto={bruto} anio={anio} opts={opts} />
                </div>
              </details>

              <div>
                <SectionHeading tagline="Simulador de subida">¿Cuánto ves de cada <em className="text-[var(--accent)]">100€</em> de aumento?</SectionHeading>
                <div className="liquid-glass overflow-hidden">
                  <SimuladorSubida bruto={bruto} anio={anio} opts={opts} />
                </div>
                <div className="mt-5">
                  <ScrollReveal><InfoCard>
                    <strong className="text-[var(--text-h)] text-[13px]">El efecto «cliff» del Art.20</strong>{' '}
                    La reducción por rendimientos del trabajo disminuye gradualmente al aumentar la renta. Mientras se retira, una subida puede aumentar la base sometida a IRPF en más que el propio incremento bruto, elevando temporalmente el tipo marginal efectivo. Ese porcentaje afecta a los euros adicionales dentro de esa zona, no a todo el salario.
                  </InfoCard></ScrollReveal>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Histórico ═══ */}
          {activeId === 'comparativa' && (
            <div className="space-y-10">
              <SectionHeading tagline="Comparativa 2012–2026">15 años de <em className="text-[var(--accent)]">reformas fiscales</em></SectionHeading>

              <GraficoComparativo brutoRef={bruto} anioRef={anio} />
            </div>
          )}

          {/* ═══ Distribución ═══ */}
          {activeId === 'distribucion' && (
            <div className="chapter-distribution">
              <SectionHeading tagline="Distribución salarial">¿Dónde estás en la <em className="text-[var(--accent)]">escala social</em>?</SectionHeading>
              <div className="chapter-deck chapter-deck--distribution">
                <p className="chapter-deck__lead">Un salario sólo adquiere escala cuando se coloca junto a los demás.</p>
                <div className="chapter-deck__copy">
                  <p>Esta lectura no mide riqueza, patrimonio ni bienestar familiar. Sitúa el salario bruto dentro de la distribución observada por el INE y muestra cómo cambia la posición relativa entre ejercicios.</p>
                  <p>El percentil responde a una pregunta concreta: qué proporción de asalariados queda por debajo de esta retribución. No convierte esa posición en una clase social automática.</p>
                </div>
                <aside><span>NOTA DE LECTURA</span>Salario, renta disponible y patrimonio son magnitudes distintas.</aside>
              </div>
              <DistribucionSalarial bruto={bruto} anio={anio} />
            </div>
          )}

          {/* ═══ OCDE ═══ */}
          {activeId === 'internacional' && (
            <div className="chapter-international">
              <SectionHeading tagline="Comparativa OCDE">España frente al mundo</SectionHeading>
              <div className="chapter-deck chapter-deck--international">
                <p className="chapter-deck__lead">Comparar países exige mantener fijo el denominador.</p>
                <div className="chapter-deck__copy">
                  <p>La cuña fiscal de la OCDE se expresa sobre el coste laboral total: impuesto personal, cotización del trabajador y cotización del empleador. No es lo mismo que dividir únicamente las retenciones entre el salario bruto.</p>
                  <p>La figura utiliza el supuesto comparable de trabajador soltero sin hijos. Tu resultado personal aparece aparte, porque incorpora el salario y el perfil fiscal seleccionados en esta publicación.</p>
                </div>
                <aside><span>UNIDAD COMÚN</span>% del coste laboral · Taxing Wages 2026</aside>
              </div>
                  <OCDEComparativa bruto={bruto} anio={anio} opts={opts} />
            </div>
          )}

          {/* ═══ Sistema ═══ */}
          {activeId === 'sistema' && (
            <div className="chapter-system space-y-12">
              <div className="system-thesis">
                <span>CAPÍTULO 05 · LOS MECANISMOS</span>
                <strong>EL COSTE<br />NO ES<br /><em>EL BRUTO.</em></strong>
                <p>Y el bruto tampoco es la base. Este capítulo separa las magnitudes que una nómina suele mezclar: quién paga, sobre qué cantidad se aplica cada regla y en qué punto una reducción desaparece.</p>
              </div>
              <div>
                <SectionHeading tagline="Cuña fiscal">Cuánto de tu sueldo <em className="text-[var(--accent)]">nunca llega</em> a tu cuenta</SectionHeading>
                <div className="figure-sheet">
                  <CuñaFiscal bruto={bruto} anio={anio} />
                </div>
              </div>

              <div>
                <SectionHeading tagline="Mecanismos ocultos">Art.20, umbrales y las <em className="text-[var(--accent)]">trampas</em> del sistema</SectionHeading>
                <div className="figure-sheet">
                  <GraficoMecanismos />
                </div>
              </div>

              <DeudaPublica bruto={bruto} anio={anio} />
            </div>
          )}

          {/* ═══ Normativa ═══ */}
          {activeId === 'normativa' && (
            <div className="chapter-appendix space-y-12">
              <div className="appendix-opening">
                <p>APPENDIX / DOCUMENTACIÓN</p>
                <h2>El estudio termina donde empiezan las fuentes.</h2>
                <div>
                  <span>A · METODOLOGÍA</span><span>B · FUENTES</span><span>C · PARÁMETROS</span><span>D · NORMATIVA</span>
                </div>
                <p>Esta cronología permite reconstruir por qué una cifra cambia entre ejercicios. Cada reforma se presenta como evidencia fechada, no como decoración narrativa.</p>
              </div>
              <SectionHeading tagline="Cronología de reformas">15 años de cambios fiscales</SectionHeading>
              <CronologiaTimeline />

              <div>
                <h3 className="font-display text-[1.4rem] sm:text-[1.7rem] leading-tight tracking-tight text-[var(--text-h)] mb-6">
                  Parámetros y conceptos legales
                </h3>
                <NormativaFAQ anioRef={anio} />
              </div>
            </div>
          )}
          </Suspense>

          {/* Siguiente sección */}
          {(() => {
            const idx = SECCIONES.findIndex(s => s.id === activeId);
            const next = SECCIONES[idx + 1];
            if (!next) return null;
            return (
              <div className="next-chapter">
                <p>SIGUIENTE CAPÍTULO</p>
                <button onClick={() => navTo(next.id)} className="group">
                  <span>0{next.n}</span>
                  <div>
                    <strong>{next.label}</strong>
                    <small>{next.tagline}</small>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    className="ml-2 text-[var(--text-soft)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            );
          })()}

        </div>{/* end app-content */}

        {/* Footer */}
        <footer className="publication-footer">
          <div className="app-content">
            <div className="publication-footer__grid">
              <strong>FISCALSCOPE</strong>
              <div><span>DATOS</span><p>BOE · INE · TGSS · OCDE</p></div>
              <div><span>PERIODO</span><p>ESPAÑA · 2012—2026</p></div>
              <div><span>CARÁCTER</span><p>Estudio independiente · cálculo orientativo</p></div>
            </div>
            <p className="publication-footer__end">END OF REPORT</p>
          </div>
        </footer>

      </main>{/* end app-main */}

    </div>
  );
}
