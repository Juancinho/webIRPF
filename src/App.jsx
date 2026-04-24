import { useCallback } from 'react';
import { useURLState } from './hooks/useURLState';
import CalculadoraCard from './components/CalculadoraCard';
import SimuladorSubida from './components/SimuladorSubida';
import GraficoComparativo from './components/GraficoComparativo';
import GraficoMecanismos from './components/GraficoMecanismos';
import NormativaFAQ from './components/NormativaFAQ';
import './index.css';

function SectionTitle({ n, title, sub }) {
  return (
    <div className="flex items-start gap-5 mb-8">
      <div className="section-badge mt-0.5"
        style={{
          background: 'linear-gradient(135deg,#818cf8,#a78bfa,#c084fc)',
          boxShadow: '0 4px 24px rgba(129,140,248,0.3), 0 0 0 1px rgba(129,140,248,0.15) inset',
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

function HechoDestacado({ color, icono, titulo, texto }) {
  return (
    <div className="hecho-card animate-in"
      style={{
        borderColor: `${color}22`,
        background: `linear-gradient(155deg, ${color}0a 0%, ${color}04 40%, transparent 70%)`,
        boxShadow: `0 4px 30px ${color}08, inset 0 1px 0 ${color}10`,
      }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, ${color}60, ${color}20, transparent)` }} />

      <div className="hecho-icon" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        {icono}
      </div>
      <p className="text-[10px] font-extrabold mb-2 uppercase tracking-[0.12em]" style={{ color }}>{titulo}</p>
      <p className="text-[13px] text-[#8899b4] leading-relaxed">{texto}</p>

      {/* Corner glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${color}15, transparent 70%)` }} />
    </div>
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

  return (
    <div className="min-h-screen relative">
      {/* Decorative floating orbs */}
      <div className="float-orb" style={{ width: '400px', height: '400px', background: 'rgba(129,140,248,0.06)', top: '10%', left: '-5%' }} />
      <div className="float-orb" style={{ width: '300px', height: '300px', background: 'rgba(168,85,247,0.05)', top: '45%', right: '-3%', animationDelay: '-7s' }} />
      <div className="float-orb" style={{ width: '350px', height: '350px', background: 'rgba(99,102,241,0.04)', top: '75%', left: '10%', animationDelay: '-14s' }} />

      {/* ── HEADER ── */}
      <header className="header-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white tracking-tight">IRPF</span>
              <span className="text-lg font-black tracking-tight"
                style={{ background: 'linear-gradient(90deg,#818cf8,#a78bfa,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                2012–2026
              </span>
            </div>
            <span className="hidden sm:inline-flex tag"
              style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.06)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
              Divulgación fiscal · Open data
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-[#4b5563] hidden lg:block font-medium">Solo tarifa estatal · Cálculos orientativos</p>
            <ShareButton getShareURL={getShareURL} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-12 space-y-20 relative z-10">

        {/* ── INTRO ── */}
        <section className="text-center pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.06)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
            Herramienta interactiva de análisis fiscal
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-5 leading-[1.1]"
            style={{ background: 'linear-gradient(135deg,#e0e7ff 0%,#c7d2fe 20%,#a5b4fc 40%,#c084fc 65%,#f0abfc 85%,#fca5e4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            La subida de impuestos<br className="hidden sm:block" /> que no ves en tu nómina
          </h1>
          <p className="text-base sm:text-lg text-[#7a8baa] leading-relaxed max-w-2xl mx-auto">
            Cuando el salario sube lo mismo que la inflación pero los tramos del IRPF no se actualizan,
            pagas más impuestos sin que nadie lo haya decidido. Se llama <strong className="text-[var(--accent-light)] font-semibold">ilusión fiscal</strong> o
            «subida de impuestos en frío» y lleva ocurriendo en España desde 2012.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10 text-left">
            <HechoDestacado color="#f43f5e" icono="📊"
              titulo="Tramos IRPF sin actualizar por inflación"
              texto="Los umbrales de los tramos del IRPF no se actualizan automáticamente con el IPC. Si tu salario sube un 3% y la inflación también sube un 3%, en términos reales ganas lo mismo — pero tributas más." />
            <HechoDestacado color="#f59e0b" icono="💰"
              titulo="SMI +90% nominal desde 2012"
              texto="El Salario Mínimo Interprofesional ha pasado de ~8.980€ a 17.094€ anuales. En términos reales (€2026) ha ganado aproximadamente un 52% de poder adquisitivo en 14 años." />
            <HechoDestacado color="#10b981" icono="📋"
              titulo="Art.20: la palanca menos conocida"
              texto="La reducción por rendimientos del trabajo ha crecido de 4.080€ (2012) a 7.302€ (2026). Es el mecanismo que más ha protegido a las rentas bajas, pero pocos saben que existe." />
          </div>
        </section>

        {/* ── 1. CALCULADORA ── */}
        <section>
          <SectionTitle n="1" title="Calcula tu nómina"
            sub="Elige salario y año — verás el desglose completo paso a paso: cotizaciones, reducciones, tramos IRPF y cuánto queda." />
          <div className="card overflow-hidden">
            <CalculadoraCard bruto={bruto} anio={anio} onChange={onChange}
              onShare={() => navigator.clipboard?.writeText(getShareURL())}
              shareLabel="Compartir" />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]">¿Qué es la base imponible?</strong>
              Es lo que realmente tributa. Se calcula restando al bruto: las cotizaciones SS del trabajador,
              los 2.000€ de gastos deducibles (desde 2015, Art.19 LIRPF) y la reducción por rendimientos
              del trabajo (Art.20). A esa cifra se aplica la tarifa progresiva.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]">¿Por qué hay dos columnas?</strong>
              El coste real para la empresa (coste laboral) incluye la SS patronal (~31,5%), que el trabajador
              normalmente no ve. Por eso un bruto de 35.000€ puede costar a la empresa más de 46.000€ y
              producir solo ~28.000€ netos.
            </InfoCard>
          </div>
        </section>

        {/* ── 2. SIMULADOR ── */}
        <section>
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
        <section>
          <SectionTitle n="3" title="Compara todos los años (2012–2026)"
            sub="Activa/desactiva años. Cambia entre vista por nivel salarial y evolución temporal. Todo en €2026 (inflación descontada). Zoom con el selector inferior." />
          <div className="card p-6 lg:p-7">
            <GraficoComparativo brutoRef={bruto} anioRef={anio} />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]">Vista «Por nivel salarial»</strong>
              Cada línea es un año. Con el mismo poder adquisitivo, ¿cuánto neto habrías cobrado en 2012 vs. hoy?
              La reforma de 2015 (salto amarillo) y la ampliación Art.20 de 2019 (salto azul) son visibles a ojo.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]">Vista «Evolución por año»</strong>
              Fija tu salario en la calculadora de arriba y ve cómo ha evolucionado tu neto real (€2026) y el
              tipo efectivo de IRPF a lo largo del tiempo. Las bandas señalan años de reforma fiscal.
            </InfoCard>
            <InfoCard>
              <strong className="text-white block mb-1.5 text-[13px]">Botón «Umbrales {anio}»</strong>
              Activa las líneas de referencia: SMI, umbral inferior del Art.20 (donde la reducción empieza
              a caer), umbral superior (donde se anula) y base máxima de cotización.
            </InfoCard>
          </div>
        </section>

        {/* ── 4. MECANISMOS ── */}
        <section>
          <SectionTitle n="4" title="Mecanismos del sistema fiscal"
            sub="Cómo funciona el Art.20 y cómo han evolucionado los umbrales clave desde 2012." />
          <div className="card p-6 lg:p-7">
            <GraficoMecanismos />
          </div>
          <div className="mt-5">
            <InfoCard>
              <strong className="text-white text-[13px]">Por qué esto importa.</strong>{' '}
              La curva de la reducción Art.20 explica visualmente por qué hay trabajadores que prefieren no pedir
              una subida: en la zona de caída (entre los dos umbrales) el tipo marginal efectivo puede ser tan alto
              que un aumento de 1.000€ brutos produce apenas 500€ netos — o incluso menos, si otros beneficios
              desaparecen. El gráfico de evolución de umbrales muestra hasta qué punto la política fiscal ha
              ido ajustando (o no) estos parámetros al ritmo del SMI y de la inflación.
            </InfoCard>
          </div>
        </section>

        {/* ── 5. NORMATIVA ── */}
        <section>
          <SectionTitle n="5" title="Normativa y contexto"
            sub="Historia de cada reforma, parámetros técnicos, conceptos clave y fuentes legales verificables." />
          <NormativaFAQ anioRef={anio} />
        </section>

      </main>

      <footer className="relative mt-12">
        <div className="footer-grid max-w-5xl mx-auto px-5 py-10">
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
            Herramienta de divulgación · Datos IPC: INE (dic.→dic.) · Parámetros: LIRPF, LGSS, Órdenes anuales SS · BOE
          </p>
        </div>
      </footer>
    </div>
  );
}
