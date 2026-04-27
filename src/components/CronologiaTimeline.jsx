import { useState } from 'react';

const EVENTOS = [
  {
    anio: 2012,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Tipos adicionales temporales IRPF',
    subtitulo: 'RDL 20/2011 — Plan de estabilidad',
    descripcion: 'Se añaden tipos adicionales "temporales" de 0,75% a 7% sobre los tramos ordinarios. El tipo marginal máximo sube hasta el 52%. Tenía que durar dos años; duró cuatro.',
    metricas: [
      { label: 'Tipo marginal máximo', valor: '52%', color: 'var(--red)' },
      { label: 'SMI anual', valor: '8.980 €', color: 'var(--text-soft)' },
    ],
  },
  {
    anio: 2012,
    mes: 'Jul',
    tipo: 'ss',
    titulo: 'Subida cotizaciones SS',
    subtitulo: 'RDL 20/2012 — Medidas de ajuste',
    descripcion: 'Se suben las bases máximas de cotización y se incrementan los tipos de SS en varios epígrafes. Congelación del SMI.',
    metricas: [
      { label: 'SS trabajador', valor: '6,35%', color: 'var(--yellow)' },
    ],
  },
  {
    anio: 2015,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Gran reforma Montoro II — Fase 1',
    subtitulo: 'Ley 26/2014 — Reforma LIRPF',
    descripcion: 'La mayor reforma del IRPF desde 2007. Reduce los tramos de 7 a 5, baja tipos, amplía el Art.20 (reducción por rendimientos del trabajo) y crea los gastos fijos de 2.000 € (Art.19). El mínimo personal sube a 5.550 €.',
    metricas: [
      { label: 'Tramos IRPF', valor: '5 tramos', color: 'var(--accent)' },
      { label: 'Tipo mínimo', valor: '19,5%', color: 'var(--green)' },
      { label: 'Tipo máximo', valor: '47%', color: 'var(--yellow)' },
      { label: 'Gastos Art.19', valor: '2.000 €', color: 'var(--accent)' },
    ],
  },
  {
    anio: 2016,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Gran reforma Montoro II — Fase 2',
    subtitulo: 'Segunda parte de la Ley 26/2014',
    descripcion: 'La reforma se diseñó en dos etapas. En 2016, los tipos bajan de nuevo: el mínimo pasa a 19% y el máximo a 45%. Se consolida el nuevo Art.20 con umbrales más generosos. Es el IRPF más bajo de la serie.',
    metricas: [
      { label: 'Tipo mínimo', valor: '19%', color: 'var(--green)' },
      { label: 'Tipo máximo', valor: '45%', color: 'var(--yellow)' },
      { label: 'Art.20 umbral inf.', valor: '11.250 €', color: 'var(--accent)' },
    ],
  },
  {
    anio: 2019,
    mes: 'Ene',
    tipo: 'mixto',
    titulo: 'Gobierno PSOE: SMI histórico + Art.20',
    subtitulo: 'RDL 28/2018 — Revalorización SMI',
    descripcion: 'El SMI sube un 22% de golpe, el mayor aumento en décadas. Para compensar el efecto fiscal en rentas bajas, el Art.20 también se amplía: el umbral inferior sube a 16.825 €. Los que ganan menos de ese umbral pagan menos IRPF.',
    metricas: [
      { label: 'SMI anual', valor: '12.600 €', color: 'var(--green)' },
      { label: 'Subida SMI', valor: '+22,3%', color: 'var(--green)' },
      { label: 'Art.20 umbral inf.', valor: '16.825 €', color: 'var(--accent)' },
    ],
  },
  {
    anio: 2020,
    mes: 'Jun',
    tipo: 'irpf',
    titulo: 'Nuevo tramo 47% para rentas muy altas',
    subtitulo: 'PGE 2021 / Ley 11/2020',
    descripcion: 'Se crea un tipo marginal del 47% para bases liquidables superiores a 300.000 €. Afecta a muy pocos contribuyentes pero tiene alto impacto simbólico. El SMI sube a 13.300 €.',
    metricas: [
      { label: 'Nuevo tramo', valor: '>300k€ → 47%', color: 'var(--red)' },
      { label: 'SMI anual', valor: '13.300 €', color: 'var(--green)' },
    ],
  },
  {
    anio: 2023,
    mes: 'Ene',
    tipo: 'ss',
    titulo: 'MEI + cuotas autónomos por ingresos reales',
    subtitulo: 'Ley 21/2021 — Sistema de cuotas progresivo autónomos',
    descripcion: 'El mayor cambio para autónomos en décadas: sus cuotas SS ya no son una cantidad fija sino que dependen de sus rendimientos netos reales, con 15 tramos. Además, el MEI (Mecanismo de Equidad Intergeneracional) añade +0,6% de cotización a todos los trabajadores para reforzar el sistema de pensiones.',
    metricas: [
      { label: 'MEI', valor: '+0,6% SS', color: 'var(--yellow)' },
      { label: 'Tramos autónomos', valor: '15 tramos', color: 'var(--accent)' },
      { label: 'SMI anual', valor: '15.120 €', color: 'var(--green)' },
    ],
  },
  {
    anio: 2023,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Tramo 47% baja a 200.000 €',
    subtitulo: 'Ley de PGE 2023',
    descripcion: 'El umbral del tramo marginal del 47% desciende de 300.000 € a 200.000 €, ampliando su aplicación. El Art.20 se amplía nuevamente: el umbral inferior sube a 19.747,50 €, el más alto de la serie.',
    metricas: [
      { label: 'Tramo 47%', valor: 'desde 200k€', color: 'var(--red)' },
      { label: 'Art.20 umbral inf.', valor: '19.747,50 €', color: 'var(--green)' },
    ],
  },
  {
    anio: 2024,
    mes: 'Ene',
    tipo: 'ccaa',
    titulo: 'Reformas autonómicas: Madrid, Andalucía, Cataluña',
    subtitulo: 'Divergencia fiscal territorial',
    descripcion: 'Las CCAA aceleran su diferenciación fiscal. Madrid consolida los tipos más bajos del régimen común (mínimo 18%, máximo 45,5%), mientras Cataluña mantiene los más altos (hasta 50%). Andalucía también baja tipos tras su reforma 2022. La diferencia entre CCAA puede superar los 3.000 € anuales para el mismo salario.',
    metricas: [
      { label: 'Madrid máx.', valor: '45,5%', color: 'var(--green)' },
      { label: 'Cataluña máx.', valor: '50%', color: 'var(--red)' },
      { label: 'SMI anual', valor: '15.876 €', color: 'var(--text-soft)' },
    ],
  },
  {
    anio: 2025,
    mes: 'Ene',
    tipo: 'smi',
    titulo: 'SMI 16.576 € — continuidad ascendente',
    subtitulo: 'Real Decreto SMI 2025',
    descripcion: 'El SMI continúa su senda alcista. Desde 2018, el SMI ha aumentado un 65% en términos nominales. En términos reales (ajustados por IPC), el aumento es del 35%. El efecto sobre el IRPF es notable: más trabajadores superan el umbral de retención y la reducción Art.20 se vuelve menos valiosa.',
    metricas: [
      { label: 'SMI anual', valor: '16.576 €', color: 'var(--green)' },
      { label: 'Variación 2018→2025', valor: '+60,9%', color: 'var(--green)' },
    ],
  },
  {
    anio: 2026,
    mes: 'Ene',
    tipo: 'smi',
    titulo: 'SMI proyectado: 17.094 € (estimación)',
    subtitulo: 'Proyección basada en acuerdos de diálogo social',
    descripcion: 'Proyección orientativa. Si se mantiene el patrón de negociación del período 2019-2025, el SMI continuará por encima del IPC. Los parámetros del IRPF (tramos, Art.20) siguen sin indexarse automáticamente a la inflación — lo que garantiza que la "progresividad en frío" sigue erosionando el poder adquisitivo neto de las rentas medias.',
    metricas: [
      { label: 'SMI proyectado', valor: '17.094 €', color: 'var(--text-soft)' },
      { label: 'Art.20 umbral inf.', valor: '19.747,50 €', color: 'var(--text-soft)' },
    ],
  },
];

const TIPO_STYLES = {
  irpf:   { color: 'var(--red)',    bg: 'var(--glow-red)',    label: 'IRPF',        dot: '#fb7185' },
  ss:     { color: 'var(--yellow)', bg: 'rgba(251,191,36,0.07)', label: 'SS',       dot: '#fbbf24' },
  mixto:  { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'IRPF + SS',   dot: '#818cf8' },
  ccaa:   { color: '#a78bfa',       bg: 'rgba(167,139,250,0.06)', label: 'CCAA',   dot: '#a78bfa' },
  smi:    { color: 'var(--green)',  bg: 'var(--glow-green)',   label: 'SMI',         dot: '#34d399' },
};

const TIPOS_FILTRO = [
  { id: 'todos', label: 'Todos' },
  { id: 'irpf',  label: 'IRPF' },
  { id: 'ss',    label: 'SS' },
  { id: 'ccaa',  label: 'CCAA' },
  { id: 'smi',   label: 'SMI' },
];

export default function CronologiaTimeline() {
  const [filtro, setFiltro] = useState('todos');
  const [expandido, setExpandido] = useState(null);

  const eventos = filtro === 'todos'
    ? EVENTOS
    : EVENTOS.filter(e => e.tipo === filtro || (filtro === 'irpf' && e.tipo === 'mixto'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-h)] mb-1">Cronología de reformas fiscales 2012–2026</h2>
        <p className="text-[13px] text-[var(--text)] leading-relaxed max-w-3xl">
          15 años de cambios en IRPF, Seguridad Social y SMI. Cada reforma tiene ganadores y perdedores silenciosos.
          Las reformas <span style={{ color: 'var(--red)' }}>IRPF</span> cambian cuánto pagas; las de{' '}
          <span style={{ color: 'var(--yellow)' }}>SS</span> cambian cuánto ve la empresa; las del{' '}
          <span style={{ color: 'var(--green)' }}>SMI</span> mueven el suelo salarial.
        </p>
      </div>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2">
        {TIPOS_FILTRO.map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)}
            className="timeline-filter-btn"
            style={filtro === f.id ? {
              background: f.id === 'todos' ? 'var(--accent)' : (TIPO_STYLES[f.id]?.dot || 'var(--accent)'),
              color: '#fff',
              borderColor: 'transparent',
            } : {}}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="timeline-wrap">
        <div className="timeline-track" />
        <div className="space-y-0">
          {eventos.map((ev, idx) => {
            const s = TIPO_STYLES[ev.tipo] || TIPO_STYLES.irpf;
            const isOpen = expandido === idx;
            return (
              <div key={idx} className="timeline-row">
                {/* Dot */}
                <div className="timeline-dot-col">
                  <div className="timeline-dot" style={{ background: s.dot, boxShadow: `0 0 0 4px var(--bg), 0 0 0 6px ${s.dot}44` }} />
                </div>

                {/* Year tag */}
                <div className="timeline-year">
                  <span className="timeline-year-badge" style={{ color: s.color }}>
                    {ev.anio}
                  </span>
                  <span className="timeline-mes">{ev.mes}</span>
                </div>

                {/* Card */}
                <div className="timeline-card-wrap">
                  <button
                    className="timeline-card"
                    style={isOpen ? { borderColor: s.dot + '55', background: s.bg } : {}}
                    onClick={() => setExpandido(isOpen ? null : idx)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="timeline-tipo-badge" style={{ color: s.color, background: s.bg, border: `1px solid ${s.dot}33` }}>
                            {s.label}
                          </span>
                          <span className="text-[10px] text-[var(--text-soft)] font-mono">{ev.mes} {ev.anio}</span>
                        </div>
                        <p className="text-[13px] font-bold text-[var(--text-h)] leading-snug mb-0.5">{ev.titulo}</p>
                        <p className="text-[11px] text-[var(--text-soft)]">{ev.subtitulo}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        className="shrink-0 mt-1 transition-transform duration-300 text-[var(--text-soft)]"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>

                    {/* Métricas */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ev.metricas.map((m, i) => (
                        <div key={i} className="timeline-metric">
                          <span className="timeline-metric-label">{m.label}</span>
                          <span className="timeline-metric-value" style={{ color: m.color }}>{m.valor}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expandible */}
                    <div className="timeline-expand" style={{ maxHeight: isOpen ? '200px' : '0' }}>
                      <p className="text-[12.5px] text-[var(--text)] leading-relaxed pt-3 border-t border-[var(--border)] mt-3">
                        {ev.descripcion}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="card p-4 flex flex-wrap gap-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)] mr-2 self-center">Tipo de reforma</p>
        {Object.entries(TIPO_STYLES).map(([k, s]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.dot }} />
            <span className="text-[11px] text-[var(--text)]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Nota metodológica */}
      <div className="card p-4 text-[12px] text-[var(--text)] leading-relaxed">
        <strong className="text-[var(--text-h)]">Fuentes.</strong> LIRPF (Ley 35/2006 y modificaciones), Real Decreto-Ley 20/2011,
        Ley 26/2014, Ley 6/2018 (PGE 2018), Ley 6/2020 (PGE 2021 prórrogado), Ley 21/2021 (reforma autónomos),
        RD del SMI de cada año (BOE). Las fechas de entrada en vigor son las del ejercicio fiscal completo.
        Los datos autonómicos provienen de las leyes de presupuestos y medidas tributarias de cada CCAA.
      </div>
    </div>
  );
}
