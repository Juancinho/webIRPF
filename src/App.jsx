import { useCallback, useState, useEffect } from 'react';
import { useURLState } from './hooks/useURLState';
import CalculadoraCard from './components/CalculadoraCard';
import SimuladorSubida from './components/SimuladorSubida';
import GraficoComparativo from './components/GraficoComparativo';
import GraficoMecanismos from './components/GraficoMecanismos';
import CuñaFiscal from './components/CuñaFiscal';
import DesgloseEducativo from './components/DesgloseEducativo';
import NormativaFAQ from './components/NormativaFAQ';
import SidebarWidget from './components/SidebarWidget';
import './index.css';

function SectionTitle({ n, title, sub }) {
  return (
    <div className="flex items-start gap-5 mb-8">
      <div className="section-badge mt-0.5"
        style={{
          background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
          boxShadow: '0 4px 24px rgba(56,189,248,0.2), 0 0 0 1px rgba(56,189,248,0.12) inset',
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: '-0.01em',
        }}>
        {n}
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-[#7a8baa] mt-1.5 leading-relaxed max-w-xl">{sub}</p>}
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
    <div className="info-card text-sm text-[#8899b4] leading-relaxed"
      style={accent ? { '--accent-bar': accent } : {}}>
      {children}
    </div>
  );
}

export default function App() {
  const { bruto, anio, set, getShareURL } = useURLState();
  const onChange = useCallback((campo, valor) => set(campo, valor), [set]);

  /* ── Active section tracking ── */
  const [activeSection, setActiveSection] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const SECTIONS = ['calc','simulador','comparativa','cuña','mecanismos','normativa'];
    const LABELS = { calc:'Calculadora', simulador:'Simulador', comparativa:'Comparativa histórica', 'cuña':'Cuña fiscal', mecanismos:'Mecanismos', normativa:'Normativa' };

    // Sections TOC observer
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActiveSection(LABELS[visible[0].target.id] || '');
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );

    // Intro visibility observer — sidebar appears when intro leaves
    const introObs = new IntersectionObserver(
      ([entry]) => setSidebarVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    const introEl = document.getElementById('intro');
    if (introEl) introObs.observe(introEl);

    SECTIONS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => { obs.disconnect(); introObs.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Decorative floating orbs */}
      <div className="float-orb" style={{ width: '400px', height: '400px', background: 'rgba(56,189,248,0.05)', top: '10%', left: '-5%' }} />
      <div className="float-orb" style={{ width: '300px', height: '300px', background: 'rgba(14,165,233,0.04)', top: '45%', right: '-3%', animationDelay: '-7s' }} />
      <div className="float-orb" style={{ width: '350px', height: '350px', background: 'rgba(34,211,238,0.03)', top: '75%', left: '10%', animationDelay: '-14s' }} />

      {/* ── HEADER ── */}
      <header className="header-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white tracking-tight">Fiscal</span>
              <span className="text-lg font-black tracking-tight"
                style={{ background: 'linear-gradient(90deg,#38bdf8,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Scope
              </span>
            </div>
            <span className="hidden sm:inline-flex tag"
              style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.15)', background: 'rgba(56,189,248,0.06)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 pulse-dot" />
              España · 2012–2026
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-[#4b5563] hidden lg:block font-medium">Solo tarifa estatal · Cálculos orientativos</p>
            {/* Active section pill — hidden on xl where sidebar shows it */}
            {activeSection && (
              <span className="hidden sm:inline-flex xl:hidden items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all duration-300"
                style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.15)' }}>
                <span className="w-1 h-1 rounded-full bg-sky-400" />
                {activeSection}
              </span>
            )}
            <ShareButton getShareURL={getShareURL} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-12 relative z-10">

        {/* ── INTRO ── */}
        <section className="text-center pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.15)', background: 'rgba(56,189,248,0.06)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 pulse-dot" />
            Radiografía interactiva del sistema fiscal español
          </div>
          <h1 className="font-display text-4xl sm:text-6xl mb-5 leading-[1.1]"
            style={{ background: 'linear-gradient(135deg,#f0f4f8 0%,#e2e8f0 30%,#bae6fd 60%,#7dd3fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Tu sueldo bajo el<br className="hidden sm:block" /> microscopio fiscal
          </h1>
          <p className="text-base sm:text-lg text-[#7a8baa] leading-relaxed max-w-2xl mx-auto">
            Calcula tu nómina real, compara 15 años de reformas fiscales con la inflación descontada,
            y descubre cómo los mecanismos ocultos del IRPF afectan a tu bolsillo.
            Todo con datos oficiales del <strong className="text-[var(--accent-light)] font-semibold">BOE, INE y TGSS</strong>.
          </p>

          {/* Intro editorial */}
          <p className="mt-8 text-[13px] text-[#4b5563] leading-relaxed max-w-xl mx-auto border-t pt-8"
            style={{ borderColor: 'var(--border)' }}>
            Esta herramienta calcula tu nómina con la normativa real de cada año desde 2012.
            Todos los importes comparativos están en <strong className="text-[#64748b]">euros constantes de 2026</strong> —
            es decir, con la inflación ya descontada — para que puedas comparar directamente sin que los números te engañen.
            Los datos provienen del BOE, el INE y la TGSS. Los cálculos son orientativos y solo incluyen la tarifa estatal del IRPF.
          </p>
        </section>

        {/* Sentinel — sidebar appears when this leaves viewport */}
        <div id="intro" style={{ height: 1 }} />

      </div>{/* end intro wrapper */}

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-5 pb-16 relative z-10">
        <div className="flex gap-8 items-start">

          {/* Sidebar — fades in from left when intro scrolls out */}
          <aside className="sidebar-widget hidden xl:block w-56 shrink-0"
            data-visible={sidebarVisible}
            style={{ pointerEvents: sidebarVisible ? 'auto' : 'none' }}>
            <SidebarWidget bruto={bruto} anio={anio} onChange={onChange} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-20">
          <section id="calc">
          <SectionTitle n="1" title="Calcula tu nómina"
            sub="Elige salario y año — verás el desglose completo paso a paso: cotizaciones, reducciones, tramos IRPF y cuánto queda." />
          <div className="card overflow-hidden">
            <CalculadoraCard bruto={bruto} anio={anio} onChange={onChange}
              onShare={() => navigator.clipboard?.writeText(getShareURL())}
              shareLabel="Compartir" />
          </div>

          {/* ── Desglose educativo paso a paso ── */}
          <div className="mt-5">
            <DesgloseEducativo bruto={bruto} anio={anio} />
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> ¿Qué es el tipo efectivo?</strong>
              Es el porcentaje <em>real</em> de tu sueldo que va al IRPF. Si ganas 30.000€ y pagas 3.600€ de IRPF,
              tu tipo efectivo es el 12%. No confundir con el tramo: aunque tu último euro tribute al 30%,
              la media de todos los euros es mucho menor. Pasa el ratón sobre la tarjeta para verlo.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> ¿Y el tipo marginal?</strong>
              Es lo que pagas por el <em>siguiente</em> euro que ganes. Si te suben 100€ el sueldo y solo te
              llegan 58€, tu tipo marginal efectivo es 42%. Incluye IRPF + SS. Es más alto que el tipo
              efectivo porque a tu último euro le toca el tramo más alto, no la media.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> ¿Qué es la base imponible?</strong>
              Es lo que realmente tributa. Se calcula restando al bruto: las cotizaciones SS del trabajador,
              los 2.000€ de gastos deducibles (desde 2015, Art.19 LIRPF) y la reducción por rendimientos
              del trabajo (Art.20). A esa cifra se aplica la tarifa progresiva.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> ¿Por qué hay dos columnas?</strong>
              El coste real para la empresa (coste laboral) incluye la SS patronal (~31,5%), que el trabajador
              normalmente no ve. Por eso un bruto de 35.000€ puede costar a la empresa más de 46.000€ y
              producir solo ~28.000€ netos.
            </InfoCard>
          </div>
          </section>

          {/* ── 2. SIMULADOR ── */}
          <section id="simulador">
          <SectionTitle n="2" title="Simula una subida salarial"
            sub="De cada 100€ de aumento, ¿cuánto ves realmente en neto? El tipo marginal real puede sorprenderte." />
          <div className="card overflow-hidden">
            <SimuladorSubida bruto={bruto} anio={anio} />
          </div>
          <div className="mt-5">
            <InfoCard>
              <strong className="text-white text-[13px]">El efecto «cliff» del Art.20.</strong>{' '}
              En ciertos tramos de salario (alrededor del umbral inferior del Art.20), ganar un euro más de bruto puede
              aumentar tu IRPF más que proporcionalmente, porque cada euro extra también reduce la deducción Art.20.
              El tipo marginal efectivo puede superar el 50% incluso en rentas bajas. Esto es lo que economistas
              llaman una <em>trampa de actividad</em>: el sistema puede desincentivartrabajarhoras extra o cambiar de empleo.
            </InfoCard>
          </div>
          </section>

          {/* ── 3. COMPARATIVA ── */}
          <section id="comparativa">
          <SectionTitle n="3" title="Compara todos los años (2012–2026)"
            sub="Tres vistas: neto por nivel salarial, tipo efectivo IRPF, y evolución temporal de tu sueldo. Todo en €2026 (inflación descontada)." />
          <div className="card p-6 lg:p-7">
            <GraficoComparativo brutoRef={bruto} anioRef={anio} />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> Vista «Neto por salario»</strong>
              Cada línea es un año. El eje X es tu salario bruto y el eje Y muestra cuánto neto cobrarías.
              Con el mismo poder adquisitivo, ¿cuánto neto habrías cobrado en 2012 vs. hoy?
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> Vista «Tipo efectivo»</strong>
              Muestra el porcentaje real de tu salario que va al IRPF, para cada nivel de renta y año.
              Las líneas más bajas = menos presión fiscal. Se ve claramente el efecto de cada reforma.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> Vista «Evolución por año»</strong>
              Fija tu salario en la calculadora de arriba y ve cómo ha evolucionado tu neto real (€2026) y el
              tipo efectivo de IRPF a lo largo del tiempo. Las bandas señalan años de reforma fiscal.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]"> Botón «Umbrales {anio}»</strong>
              Activa las líneas de referencia: SMI, umbral inferior del Art.20 (donde la reducción empieza
              a caer), umbral superior (donde se anula) y base máxima de cotización.
            </InfoCard>
          </div>
          </section>

          {/* ── 4. CUÑA FISCAL ── */}
          <section id="cuña">
          <SectionTitle n="4" title="Cuña fiscal"
            sub="Cómo se distribuye cada euro de tu sueldo entre tú, Hacienda y la Seguridad Social. Cambia entre la perspectiva del trabajador y el coste real para la empresa." />
          <div className="card p-6 lg:p-7">
            <CuñaFiscal bruto={bruto} anio={anio} />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard>
              <strong className="text-white text-[13px]"> Perspectiva trabajador</strong>{' '}
              Muestra tu bruto dividido en tres: el neto que recibes, el IRPF retenido y tu cuota
              de Seguridad Social. La suma de los tres siempre es exactamente tu salario bruto.
            </InfoCard>
            <InfoCard>
              <strong className="text-white text-[13px]"> Perspectiva empresa</strong>{' '}
              Añade la SS patronal (~31,5%), que la empresa paga encima de tu bruto y que tú nunca
              ves. Revela el coste laboral real y cuánto de ese total llega efectivamente a tu cuenta.
            </InfoCard>
          </div>
          </section>

          {/* ── 5. MECANISMOS ── */}
          <section id="mecanismos">
          <SectionTitle n="5" title="Mecanismos del sistema fiscal"
            sub="Dos gráficos interactivos: cómo funciona el descuento del Art.20 y cómo han cambiado los umbrales clave desde 2012. Todo explicado paso a paso." />
          <div className="card p-6 lg:p-7">
            <GraficoMecanismos />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard>
              <strong className="text-white text-[13px]"> ¿Qué es la curva Art.20?</strong>{' '}
              El Art.20 es un «descuento» que reduce tu base imponible. Si ganas poco, el descuento es alto
              (pagas poco IRPF). A medida que ganas más, el descuento baja hasta desaparecer.
              El gráfico muestra exactamente cuántos euros de descuento tienes para cada nivel de sueldo.
            </InfoCard>
            <InfoCard>
              <strong className="text-white text-[13px]"> ¿Qué son los umbrales?</strong>{' '}
              Son las «líneas invisibles» del sistema fiscal: el salario mínimo, el nivel a partir del cual
              te retienen IRPF, y los dos umbrales del Art.20. Cuando se mueven, millones de nóminas cambian.
              El gráfico muestra cómo han ido subiendo (o no) estos umbrales frente al SMI.
            </InfoCard>
          </div>
          </section>

          {/* ── 6. NORMATIVA ── */}
          <section id="normativa">
          <SectionTitle n="6" title="Normativa y contexto"
            sub="Historia de cada reforma, parámetros técnicos, conceptos clave y fuentes legales verificables." />
          <NormativaFAQ anioRef={anio} />
          </section>

          </main>{/* end main */}
        </div>{/* end flex */}
      </div>{/* end two-col wrapper */}

      <footer className="relative mt-12">
        <div className="footer-grid max-w-7xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-[#5a6b82] mb-6 pt-6">
            <div>
              <p className="font-bold text-[#8899b4] mb-2 uppercase tracking-wider text-[10px]">Metodología</p>
              <p className="leading-relaxed">El motor de cálculo es una traducción a JavaScript del código Python original del autor,
              que implementa la normativa estatal (LIRPF + LGSS) año a año. Solo incluye la tarifa estatal
              (50% del IRPF) sin deducciones autonómicas ni circunstancias personales.</p>
            </div>
            <div>
              <p className="font-bold text-[#8899b4] mb-2 uppercase tracking-wider text-[10px]">Limitaciones</p>
              <p className="leading-relaxed">Los cálculos son orientativos y no tienen valor legal. No incluyen deducciones autonómicas,
              situaciones personales (discapacidad, familia numerosa, planes de pensiones), ni rendimientos
              no laborales. Consulta siempre a un profesional fiscal.</p>
            </div>
          </div>
          <div className="section-separator" />
          <p className="text-center text-[10px] text-[#374151] mt-4">
            FiscalScope · Datos IPC: INE (dic.→dic.) · Parámetros: LIRPF, LGSS, Órdenes anuales SS · BOE
          </p>
        </div>
      </footer>
    </div>
  );
}
