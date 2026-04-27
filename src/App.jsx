import { useCallback, useState } from 'react';
import { useURLState } from './hooks/useURLState';
import { useTheme } from './hooks/useTheme';
import { DEFAULT_OPTS } from './engine/irpf';
import CalculadoraCard from './components/CalculadoraCard';
import SimuladorSubida from './components/SimuladorSubida';
import GraficoComparativo from './components/GraficoComparativo';
import GraficoMecanismos from './components/GraficoMecanismos';
import CuñaFiscal from './components/CuñaFiscal';
import DesgloseEducativo from './components/DesgloseEducativo';
import NormativaFAQ from './components/NormativaFAQ';
import CurvaIRPF from './components/CurvaIRPF';
import DistribucionSalarial from './components/DistribucionSalarial';
import OCDEComparativa from './components/OCDEComparativa';
import DeudaPublica from './components/DeudaPublica';
import CronologiaTimeline from './components/CronologiaTimeline';
import ThemeToggle from './components/ThemeToggle';
import ScrollReveal from './components/ScrollReveal';
import './index.css';

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
    } catch { }
  };
  return (
    <button onClick={handleShare} className="btn-ghost flex items-center gap-1.5 text-[12px]">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
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

export default function App() {
  const { bruto, anio, set, getShareURL } = useURLState();
  const onChange = useCallback((campo, valor) => set(campo, valor), [set]);
  const { theme, toggle: toggleTheme } = useTheme();

  const [activeId, setActiveId] = useState('calc');
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const seccion = SECCIONES.find(s => s.id === activeId);

  const navTo = id => {
    setActiveId(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-root">

      {/* ═══════════════ FIXED HEADER ═══════════════ */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* Logo */}
          <div className="flex items-baseline gap-1">
            <span className="logo-mark" style={{ color: 'var(--text-h)', fontSize: 22 }}>Fiscal</span>
            <span className="logo-mark-accent" style={{ color: 'var(--accent)', fontSize: 22 }}>scope</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[11px] text-[var(--text-soft)]">Solo tarifa estatal · Orientativo</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <ShareButton getShareURL={getShareURL} />
            {/* Mobile nav trigger */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] ml-1"
              style={{ background: 'var(--surface2)', color: 'var(--text)' }}
              onClick={() => setMobileNavOpen(o => !o)}
              aria-label="Secciones"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile section pills — visible below header on small screens */}
        <div className={`mobile-sec-pills lg:hidden ${mobileNavOpen ? 'open' : ''}`}>
          {SECCIONES.map(s => (
            <button key={s.id} onClick={() => navTo(s.id)}
              className={`mobile-sec-pill ${activeId === s.id ? 'active' : ''}`}>
              <span className="mobile-sec-num">{s.n}</span>
              {s.label}
            </button>
          ))}
        </div>
      </header>

      {/* ═══════════════ SIDEBAR NAV ═══════════════ */}
      <nav className="side-nav" aria-label="Secciones">
        <div className="side-nav-inner">
          {/* Brief intro above nav */}
          <div className="px-4 pt-5 pb-3 mb-1 border-b border-[var(--border)]" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-soft)] mb-0.5">Radiografía fiscal</p>
            <p className="text-[10.5px] text-[var(--text-soft)] leading-snug opacity-70">España 2012–2026</p>
          </div>

          <div className="px-2 py-3 space-y-0.5">
            {SECCIONES.map(s => (
              <button key={s.id} onClick={() => navTo(s.id)}
                className={`side-nav-item ${activeId === s.id ? 'active' : ''}`}>
                <span className="side-nav-num">{s.n}</span>
                <div className="min-w-0">
                  <p className="side-nav-title">{s.label}</p>
                  <p className="side-nav-desc">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="app-main">
        <div className="app-content">

          {/* ═══ Calculadora ═══ */}
          {activeId === 'calc' && (
            <div className="space-y-10">
              {/* Intro hero — only on first section */}
              <div className="pt-2 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] mb-3">Radiografía interactiva</p>
                <h1 className="font-display text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem] leading-[1.08] tracking-tight mb-4"
                  style={{ color: 'var(--text-h)', fontWeight: 600 }}>
                  Tu sueldo bajo el{' '}
                  <em style={{ color: 'var(--accent)', fontWeight: 400 }}>microscopio fiscal</em>
                </h1>
                <p className="text-[14.5px] sm:text-[15.5px] leading-relaxed max-w-[52ch] text-[var(--text)]">
                  IRPF + SS calculados con la normativa real de cada año desde 2012.
                  Datos del <strong className="text-[var(--text-h)]">BOE, INE y TGSS</strong>.
                </p>
              </div>

              <div className="liquid-glass overflow-hidden">
                <CalculadoraCard
                  bruto={bruto} anio={anio} onChange={onChange}
                  onShare={() => navigator.clipboard?.writeText(getShareURL())}
                  shareLabel="Compartir"
                  opts={opts}
                  onOptsChange={setOpts}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ScrollReveal delay={0}><InfoCard>
                  <strong className="text-[var(--text-h)] block mb-1 text-[13px]">Tipo efectivo</strong>
                  El porcentaje <em>real</em> de tu sueldo que va al IRPF. Si ganas 30.000€ y pagas 3.600€ de IRPF, tu tipo efectivo es 12% — no el tipo del tramo más alto.
                </InfoCard></ScrollReveal>
                <ScrollReveal delay={80}><InfoCard>
                  <strong className="text-[var(--text-h)] block mb-1 text-[13px]">Tipo marginal</strong>
                  Lo que pagas por el <em>siguiente</em> euro. Si te suben 100€ y llegan 58€, tu tipo marginal efectivo es 42%. Siempre mayor que el tipo efectivo.
                </InfoCard></ScrollReveal>
                <ScrollReveal delay={160}><InfoCard>
                  <strong className="text-[var(--text-h)] block mb-1 text-[13px]">Base imponible</strong>
                  Lo que tributa: bruto − SS − 2.000€ gastos Art.19 − reducción Art.20. La tarifa progresiva se aplica sobre esta cifra, no sobre el bruto.
                </InfoCard></ScrollReveal>
                <ScrollReveal delay={240}><InfoCard>
                  <strong className="text-[var(--text-h)] block mb-1 text-[13px]">Coste laboral</strong>
                  La empresa paga ~31,5% extra en SS patronal que tú nunca ves. Un bruto de 35.000€ cuesta más de 46.000€ a la empresa.
                </InfoCard></ScrollReveal>
              </div>

              <div>
                <SectionHeading tagline="Paso a paso">El viaje de tu <em className="text-[var(--accent)]">sueldo</em></SectionHeading>
                <div className="liquid-glass p-5 sm:p-6 overflow-hidden">
                  <DesgloseEducativo bruto={bruto} anio={anio} />
                </div>
              </div>

              <div>
                <SectionHeading tagline="Simulador de subida">¿Cuánto ves de cada <em className="text-[var(--accent)]">100€</em> de aumento?</SectionHeading>
                <div className="liquid-glass overflow-hidden">
                  <SimuladorSubida bruto={bruto} anio={anio} />
                </div>
                <div className="mt-5">
                  <ScrollReveal><InfoCard>
                    <strong className="text-[var(--text-h)] text-[13px]">El efecto «cliff» del Art.20</strong>{' '}
                    En ciertos tramos, ganar un euro extra puede disparar el IRPF más que proporcionalmente porque también reduce la deducción Art.20. El tipo marginal puede superar el 50% en rentas medias — una <em>trampa de actividad</em>.
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
            <div>
              <SectionHeading tagline="Distribución salarial">¿Dónde estás en la <em className="text-[var(--accent)]">escala social</em>?</SectionHeading>
              <DistribucionSalarial bruto={bruto} anio={anio} />
            </div>
          )}

          {/* ═══ OCDE ═══ */}
          {activeId === 'internacional' && (
            <div>
              <SectionHeading tagline="Comparativa OCDE">España frente al mundo</SectionHeading>
              <OCDEComparativa bruto={bruto} anio={anio} />
            </div>
          )}

          {/* ═══ Sistema ═══ */}
          {activeId === 'sistema' && (
            <div className="space-y-12">
              <div>
                <SectionHeading tagline="Cuña fiscal">Cuánto de tu sueldo <em className="text-[var(--accent)]">nunca llega</em> a tu cuenta</SectionHeading>
                <div className="liquid-glass p-5 sm:p-6">
                  <CuñaFiscal bruto={bruto} anio={anio} />
                </div>
              </div>

              <div>
                <SectionHeading tagline="Mecanismos ocultos">Art.20, umbrales y las <em className="text-[var(--accent)]">trampas</em> del sistema</SectionHeading>
                <div className="liquid-glass p-5 sm:p-6">
                  <GraficoMecanismos />
                </div>
              </div>

              <DeudaPublica bruto={bruto} anio={anio} />
            </div>
          )}

          {/* ═══ Normativa ═══ */}
          {activeId === 'normativa' && (
            <div className="space-y-12">
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

          {/* Siguiente sección */}
          {(() => {
            const idx = SECCIONES.findIndex(s => s.id === activeId);
            const next = SECCIONES[idx + 1];
            if (!next) return null;
            return (
              <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-soft)] mb-3">Siguiente</p>
                <button onClick={() => navTo(next.id)} className="group flex items-center gap-4 text-left">
                  <span className="side-nav-num" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 14 }}>{next.n}</span>
                  <div>
                    <p className="font-display text-[1.1rem] text-[var(--text-h)] group-hover:text-[var(--accent)] transition-colors">{next.label}</p>
                    <p className="text-[12px] text-[var(--text-soft)]">{next.tagline}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    className="ml-2 text-[var(--text-soft)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            );
          })()}

        </div>{/* end app-content */}

        {/* Footer */}
        <footer className="border-t mt-16 py-10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="app-content">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="logo-mark" style={{ color: 'var(--text-h)', fontSize: 18 }}>Fiscal</span>
                  <span className="logo-mark-accent" style={{ color: 'var(--accent)', fontSize: 18 }}>scope</span>
                </div>
                <p className="text-[11px] text-[var(--text-soft)] max-w-[28ch] leading-relaxed">
                  Herramienta independiente · Sin afiliación política
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-[var(--text-soft)] opacity-70">IPC: INE · Parámetros: LIRPF, LGSS, BOE · Cuña: OCDE Taxing Wages 2026</p>
                <p className="text-[10px] text-[var(--text-soft)] opacity-45">FiscalScope · 2012–2026</p>
              </div>
            </div>
          </div>
        </footer>

      </main>{/* end app-main */}

    </div>
  );
}
