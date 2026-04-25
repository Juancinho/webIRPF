import { useCallback, useState, useEffect } from 'react';
import { useURLState } from './hooks/useURLState';
import { useTheme } from './hooks/useTheme';
import CalculadoraCard from './components/CalculadoraCard';
import SimuladorSubida from './components/SimuladorSubida';
import GraficoComparativo from './components/GraficoComparativo';
import GraficoMecanismos from './components/GraficoMecanismos';
import CuñaFiscal from './components/CuñaFiscal';
import DesgloseEducativo from './components/DesgloseEducativo';
import NormativaFAQ from './components/NormativaFAQ';
import SidebarWidget from './components/SidebarWidget';
import ThemeToggle from './components/ThemeToggle';
import ScrollReveal from './components/ScrollReveal';
import SectionTransition from './components/SectionTransition';
import ProgressDots from './components/ProgressDots';
import './index.css';

function SectionTitle({ n, title, sub }) {
  return (
    <div className="flex items-start gap-4 sm:gap-5 mb-6 sm:mb-8">
      <div className="section-badge mt-0.5 shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          boxShadow: '0 4px 24px var(--glow-accent), 0 0 0 1px var(--accent-soft) inset',
          color: 'var(--accent-on)',
          fontFamily: "'Fraunces', 'DM Serif Display', Georgia, serif",
          fontSize: 19,
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
        {n}
      </div>
      <div className="min-w-0">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium leading-tight tracking-tight"
          style={{ color: 'var(--text-h)' }}>
          {title}
        </h2>
        {sub && <p className="text-[13.5px] sm:text-[14.5px] mt-2 leading-relaxed max-w-[62ch]"
          style={{ color: 'var(--text)' }}>{sub}</p>}
      </div>
    </div>
  );
}

function ShareButton({ getShareURL }) {
  const handleShare = async () => {
    const url = getShareURL();
    try {
      if (navigator.share) await navigator.share({ title: 'IRPF 2012–2026', url });
      else await navigator.clipboard.writeText(url);
    } catch {}
  };
  return (
    <button onClick={handleShare} className="btn-ghost flex items-center gap-1.5">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      Compartir
    </button>
  );
}

function InfoCard({ children, accent }) {
  return (
    <div className="info-card text-[13.5px] leading-relaxed"
      style={{ color: 'var(--text)', ...(accent ? { '--accent-bar': accent } : {}) }}>
      {children}
    </div>
  );
}

export default function App() {
  const { bruto, anio, set, getShareURL } = useURLState();
  const onChange = useCallback((campo, valor) => set(campo, valor), [set]);
  const { theme, toggle: toggleTheme } = useTheme();

  /* ── Active section tracking ── */
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const SECTIONS = ['calc','desglose','simulador','comparativa','cuña','mecanismos','normativa'];
    const LABELS = { calc:'Calculadora', desglose:'Viaje paso a paso', simulador:'Simulador', comparativa:'Comparativa histórica', 'cuña':'Cuña fiscal', mecanismos:'Mecanismos', normativa:'Normativa' };

    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActiveSection(LABELS[visible[0].target.id] || '');
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );
    SECTIONS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });

    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Decorative floating orbs (clipped so they never cause horizontal scroll) */}
      <div className="orbs-clip">
        <div className="float-orb" style={{ width: '400px', height: '400px', background: 'var(--accent-soft)', top: '10%', left: '-5%' }} />
        <div className="float-orb" style={{ width: '300px', height: '300px', background: 'var(--accent-dim)', top: '45%', right: '-3%', animationDelay: '-7s' }} />
        <div className="float-orb" style={{ width: '350px', height: '350px', background: 'var(--accent-soft)', top: '75%', left: '10%', animationDelay: '-14s' }} />
      </div>

      {/* ── HEADER ── */}
      <header className="header-blur sticky top-0 z-30">
        <div className="centered-col py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-[22px] font-medium tracking-tight" style={{ color: 'var(--text-h)' }}>Fiscal</span>
              <span className="font-serif text-[22px] italic font-normal tracking-tight" style={{ color: 'var(--accent)' }}>
                scope
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] hidden lg:block font-medium" style={{ color: 'var(--text-soft)' }}>Solo tarifa estatal · Cálculos orientativos</p>
            {/* Active section pill — hidden on xl where sidebar shows it */}
            {activeSection && (
              <span className="hidden sm:inline-flex xl:hidden items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all duration-300"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-dim)' }}>
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
                {activeSection}
              </span>
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <ShareButton getShareURL={getShareURL} />
          </div>
        </div>
      </header>

      {/* ── Progress dots (right edge) ── */}
      <ProgressDots />

      {/* ── CENTERED LAYOUT WITH PERSISTENT SIDEBAR ── */}
      <div className="layout-frame pt-8 sm:pt-10 pb-16 relative z-10">

        {/* Sidebar — always visible on xl+ screens */}
        <aside className="layout-sidebar sidebar-widget hidden xl:block">
          <SidebarWidget bruto={bruto} anio={anio} onChange={onChange} />
        </aside>

        {/* Main content — intro + sections */}
        <main className="layout-main space-y-14 sm:space-y-16 lg:space-y-20">

          {/* ── INTRO ── */}
          <section className="text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border mb-5 sm:mb-6 text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--accent)', borderColor: 'var(--accent-dim)', background: 'var(--accent-soft)' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--accent)' }} />
              <span className="hidden sm:inline">Radiografía interactiva del sistema fiscal español</span>
              <span className="sm:hidden">Radiografía fiscal interactiva</span>
            </div>
            <h1 className="font-display text-[2.25rem] sm:text-[3.25rem] lg:text-[4rem] mb-5 sm:mb-6 leading-[1.05] px-2"
              style={{ color: 'var(--text-h)', fontWeight: 500 }}>
              Tu sueldo bajo el<br className="hidden sm:block" />{' '}
              <span className="italic" style={{ color: 'var(--accent)', fontWeight: 400 }}>microscopio fiscal</span>
            </h1>
            <p className="text-[15px] sm:text-[16.5px] lg:text-[17.5px] leading-relaxed max-w-[58ch] mx-auto"
              style={{ color: 'var(--text)' }}>
              Calcula tu nómina real, compara 15 años de reformas fiscales con la inflación descontada,
              y descubre cómo los mecanismos ocultos del IRPF afectan a tu bolsillo.
              Todo con datos oficiales del <strong style={{ color: 'var(--text-h)', fontWeight: 600 }}>BOE, INE y TGSS</strong>.
            </p>

            <p className="mt-7 sm:mt-9 text-[12.5px] sm:text-[13px] leading-relaxed max-w-[55ch] mx-auto border-t pt-6 sm:pt-8"
              style={{ borderColor: 'var(--border)', color: 'var(--text-soft)' }}>
              Esta herramienta calcula tu nómina con la normativa real de cada año desde 2012.
              Todos los importes comparativos están en <strong style={{ color: 'var(--text)' }}>euros constantes de 2026</strong> —
              es decir, con la inflación ya descontada — para que puedas comparar directamente sin que los números te engañen.
              Los datos provienen del BOE, el INE y la TGSS. Los cálculos son orientativos y solo incluyen la tarifa estatal del IRPF.
            </p>
          </section>

          {/* ── 1. CALCULADORA ── */}
          <section id="calc">
          <SectionTitle n="1" title="Calcula tu nómina"
            sub="Elige salario y año — verás el desglose completo paso a paso: cotizaciones, reducciones, tramos IRPF y cuánto queda." />
          <div className="card overflow-hidden">
            <CalculadoraCard bruto={bruto} anio={anio} onChange={onChange}
              onShare={() => navigator.clipboard?.writeText(getShareURL())}
              shareLabel="Compartir" />
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScrollReveal delay={0}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> ¿Qué es el tipo efectivo?</strong>
                Es el porcentaje <em>real</em> de tu sueldo que va al IRPF. Si ganas 30.000€ y pagas 3.600€ de IRPF,
                tu tipo efectivo es el 12%. No confundir con el tramo: aunque tu último euro tribute al 30%,
                la media de todos los euros es mucho menor. Pasa el ratón sobre la tarjeta para verlo.
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> ¿Y el tipo marginal?</strong>
                Es lo que pagas por el <em>siguiente</em> euro que ganes. Si te suben 100€ el sueldo y solo te
                llegan 58€, tu tipo marginal efectivo es 42%. Incluye IRPF + SS. Es más alto que el tipo
                efectivo porque a tu último euro le toca el tramo más alto, no la media.
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> ¿Qué es la base imponible?</strong>
                Es lo que realmente tributa. Se calcula restando al bruto: las cotizaciones SS del trabajador,
                los 2.000€ de gastos deducibles (desde 2015, Art.19 LIRPF) y la reducción por rendimientos
                del trabajo (Art.20). A esa cifra se aplica la tarifa progresiva.
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> ¿Por qué hay dos columnas?</strong>
                El coste real para la empresa (coste laboral) incluye la SS patronal (~31,5%), que el trabajador
                normalmente no ve. Por eso un bruto de 35.000€ puede costar a la empresa más de 46.000€ y
                producir solo ~28.000€ netos.
              </InfoCard>
            </ScrollReveal>
          </div>
          </section>

          {/* ── Transition 1→2 ── */}
          <SectionTransition text="Ya conoces el resultado. Ahora, descubre el viaje que recorre cada euro." />

          {/* ── 2. DESGLOSE EDUCATIVO (paso a paso) ── */}
          <section id="desglose">
          <SectionTitle n="2" title="El viaje de tu sueldo"
            sub={`De los ${new Intl.NumberFormat('es-ES').format(bruto)} € brutos que pone tu contrato, cada euro pasa por 12 pasos con fórmula y fuente legal hasta convertirse en neto.`} />
          <div className="card p-5 sm:p-6 lg:p-7 overflow-hidden">
            <DesgloseEducativo bruto={bruto} anio={anio} />
          </div>
          </section>

          {/* ── Transition 2→3 ── */}
          <SectionTransition text="Entendido el sistema, veamos qué pasa cuando te suben el sueldo." />

          {/* ── 3. SIMULADOR ── */}
          <section id="simulador">
          <SectionTitle n="3" title="Simula una subida salarial"
            sub="De cada 100€ de aumento, ¿cuánto ves realmente en neto? El tipo marginal real puede sorprenderte." />
          <div className="card overflow-hidden">
            <SimuladorSubida bruto={bruto} anio={anio} />
          </div>
          <div className="mt-5">
            <ScrollReveal>
              <InfoCard>
                <strong className="text-white text-[13px]">El efecto «cliff» del Art.20.</strong>{' '}
                En ciertos tramos de salario (alrededor del umbral inferior del Art.20), ganar un euro más de bruto puede
                aumentar tu IRPF más que proporcionalmente, porque cada euro extra también reduce la deducción Art.20.
                El tipo marginal efectivo puede superar el 50% incluso en rentas bajas. Esto es lo que economistas
                llaman una <em>trampa de actividad</em>: el sistema puede desincentivartrabajarhoras extra o cambiar de empleo.
              </InfoCard>
            </ScrollReveal>
          </div>
          </section>

          {/* ── Transition 3→4 ── */}
          <SectionTransition text="¿Era mejor antes? Compara 15 años de reformas fiscales." />

          {/* ── 4. COMPARATIVA ── */}
          <section id="comparativa">
          <SectionTitle n="4" title="Compara todos los años (2012–2026)"
            sub="Tres vistas: neto por nivel salarial, tipo efectivo IRPF, y evolución temporal de tu sueldo. Todo en €2026 (inflación descontada)." />
          <div className="card p-5 sm:p-6 lg:p-7">
            <GraficoComparativo brutoRef={bruto} anioRef={anio} />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScrollReveal delay={0}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> Vista «Neto por salario»</strong>
                Cada línea es un año. El eje X es tu salario bruto y el eje Y muestra cuánto neto cobrarías.
                Con el mismo poder adquisitivo, ¿cuánto neto habrías cobrado en 2012 vs. hoy?
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> Vista «Tipo efectivo»</strong>
                Muestra el porcentaje real de tu salario que va al IRPF, para cada nivel de renta y año.
                Las líneas más bajas = menos presión fiscal. Se ve claramente el efecto de cada reforma.
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> Vista «Evolución por año»</strong>
                Fija tu salario en la calculadora de arriba y ve cómo ha evolucionado tu neto real (€2026) y el
                tipo efectivo de IRPF a lo largo del tiempo. Las bandas señalan años de reforma fiscal.
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <InfoCard>
                <strong className="text-white block mb-1.5 text-[13px]"> Botón «Umbrales {anio}»</strong>
                Activa las líneas de referencia: SMI, umbral inferior del Art.20 (donde la reducción empieza
                a caer), umbral superior (donde se anula) y base máxima de cotización.
              </InfoCard>
            </ScrollReveal>
          </div>
          </section>

          {/* ── Transition 4→5 ── */}
          <SectionTransition text="De cada euro que le cuestas a tu empresa, ¿cuánto llega a tu bolsillo?" />

          {/* ── 5. CUÑA FISCAL ── */}
          <section id="cuña">
          <SectionTitle n="5" title="Cuña fiscal"
            sub="Cómo se distribuye cada euro de tu sueldo entre tú, Hacienda y la Seguridad Social. Cambia entre la perspectiva del trabajador y el coste real para la empresa." />
          <div className="card p-5 sm:p-6 lg:p-7">
            <CuñaFiscal bruto={bruto} anio={anio} />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScrollReveal delay={0}>
              <InfoCard>
                <strong className="text-white text-[13px]"> Perspectiva trabajador</strong>{' '}
                Muestra tu bruto dividido en tres: el neto que recibes, el IRPF retenido y tu cuota
                de Seguridad Social. La suma de los tres siempre es exactamente tu salario bruto.
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <InfoCard>
                <strong className="text-white text-[13px]"> Perspectiva empresa</strong>{' '}
                Añade la SS patronal (~31,5%), que la empresa paga encima de tu bruto y que tú nunca
                ves. Revela el coste laboral real y cuánto de ese total llega efectivamente a tu cuenta.
              </InfoCard>
            </ScrollReveal>
          </div>
          </section>

          {/* ── Transition 5→6 ── */}
          <SectionTransition text="Bajo el capó: los mecanismos ocultos que deciden cuánto pagas." />

          {/* ── 6. MECANISMOS ── */}
          <section id="mecanismos">
          <SectionTitle n="6" title="Mecanismos del sistema fiscal"
            sub="Dos gráficos interactivos: cómo funciona el descuento del Art.20 y cómo han cambiado los umbrales clave desde 2012. Todo explicado paso a paso." />
          <div className="card p-5 sm:p-6 lg:p-7">
            <GraficoMecanismos />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScrollReveal delay={0}>
              <InfoCard>
                <strong className="text-white text-[13px]"> ¿Qué es la curva Art.20?</strong>{' '}
                El Art.20 es un «descuento» que reduce tu base imponible. Si ganas poco, el descuento es alto
                (pagas poco IRPF). A medida que ganas más, el descuento baja hasta desaparecer.
                El gráfico muestra exactamente cuántos euros de descuento tienes para cada nivel de sueldo.
              </InfoCard>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <InfoCard>
                <strong className="text-white text-[13px]"> ¿Qué son los umbrales?</strong>{' '}
                Son las «líneas invisibles» del sistema fiscal: el salario mínimo, el nivel a partir del cual
                te retienen IRPF, y los dos umbrales del Art.20. Cuando se mueven, millones de nóminas cambian.
                El gráfico muestra cómo han ido subiendo (o no) estos umbrales frente al SMI.
              </InfoCard>
            </ScrollReveal>
          </div>
          </section>

          {/* ── Transition 6→7 ── */}
          <SectionTransition text="El contexto completo: normativa, historia y fuentes legales." />

          {/* ── 7. NORMATIVA ── */}
          <section id="normativa">
          <SectionTitle n="7" title="Normativa y contexto"
            sub="Historia de cada reforma, parámetros técnicos, conceptos clave y fuentes legales verificables." />
          <NormativaFAQ anioRef={anio} />
          </section>

        </main>{/* end main */}
      </div>{/* end layout-frame */}

      <footer className="relative mt-10 sm:mt-12">
        <div className="footer-grid centered-col py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs mb-5 sm:mb-6 pt-5 sm:pt-6"
            style={{ color: 'var(--text-soft)' }}>
            <div>
              <p className="font-bold mb-2 uppercase tracking-wider text-[10px]" style={{ color: 'var(--text)' }}>Metodología</p>
              <p className="leading-relaxed">El motor de cálculo es una traducción a JavaScript del código Python original del autor,
              que implementa la normativa estatal (LIRPF + LGSS) año a año. Solo incluye la tarifa estatal
              (50% del IRPF) sin deducciones autonómicas ni circunstancias personales.</p>
            </div>
            <div>
              <p className="font-bold mb-2 uppercase tracking-wider text-[10px]" style={{ color: 'var(--text)' }}>Limitaciones</p>
              <p className="leading-relaxed">Los cálculos son orientativos y no tienen valor legal. No incluyen deducciones autonómicas,
              situaciones personales (discapacidad, familia numerosa, planes de pensiones), ni rendimientos
              no laborales. Consulta siempre a un profesional fiscal.</p>
            </div>
          </div>
          <div className="section-separator" />
          <p className="text-center text-[10px] mt-4" style={{ color: 'var(--text-soft)', opacity: 0.7 }}>
            FiscalScope · Datos IPC: INE (dic.→dic.) · Parámetros: LIRPF, LGSS, Órdenes anuales SS · BOE
          </p>
        </div>
      </footer>
    </div>
  );
}
