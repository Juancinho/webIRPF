import { REGIONES, ANIOS } from '../engine/irpf';

function PillGroup({ options, value, onChange }) {
  return (
    <div className="config-pill-group">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`config-pill-btn ${value === opt.value ? 'active' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Stepper({ label, value, onChange, min = 0, max = 6 }) {
  return (
    <div className="config-stepper-wrap">
      {label && <span className="config-label">{label}</span>}
      <div className="config-stepper">
        <button
          className="config-stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Restar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
        </button>
        <span className="config-stepper-val">{value}</span>
        <button
          className="config-stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Sumar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function ConfigPanel({ opts, onChange, anio, compact = false }) {
  const set = (key, val) => onChange({ ...opts, [key]: val });
  const isForal = REGIONES[opts.ccaa]?.foral;

  return (
    <div className={`config-panel-root ${compact ? 'compact' : ''}`}>

      {/* Régimen */}
      <div className="config-section">
        <span className="config-label">Régimen</span>
        <PillGroup
          options={[
            { value: 'asalariado', label: 'Asalariado' },
            { value: 'autonomo',   label: 'Autónomo' },
          ]}
          value={opts.regimen}
          onChange={v => set('regimen', v)}
        />
        {opts.regimen === 'autonomo' && (
          <p className="config-note">
            Cotización por ingresos reales (2023+). IRPF por tramos, sin reducción Art.20.
          </p>
        )}
      </div>

      {/* CCAA */}
      <div className="config-section">
        <span className="config-label">Comunidad autónoma</span>
        <select
          className="config-select"
          value={opts.ccaa}
          onChange={e => set('ccaa', e.target.value)}
        >
          {Object.entries(REGIONES).map(([k, r]) => (
            <option key={k} value={k}>{r.name}</option>
          ))}
        </select>
        {isForal && (
          <p className="config-note config-note--warn">
            Régimen foral: se aplica escala estándar como aproximación.
          </p>
        )}
        {anio < 2024 && opts.ccaa !== 'default' && !isForal && (
          <p className="config-note">
            Divergencias autonómicas no modeladas antes de 2024. Se aplica escala estándar para {anio}.
          </p>
        )}
      </div>

      {/* Tributación */}
      <div className="config-section">
        <span className="config-label">Tributación</span>
        <PillGroup
          options={[
            { value: 'individual', label: 'Individual' },
            { value: 'conjunta',   label: 'Conjunta' },
          ]}
          value={opts.tributacion}
          onChange={v => set('tributacion', v)}
        />
        {opts.tributacion === 'conjunta' && (
          <p className="config-note">Cónyuge sin renta. Reducción base: 3.400 €.</p>
        )}
      </div>

      {/* Cargas familiares */}
      <div className="config-section">
        <span className="config-label">Cargas familiares</span>
        <div className="config-steppers-grid">
          <Stepper
            label="Hijos"
            value={opts.nHijos}
            onChange={v => onChange({ ...opts, nHijos: v, nHijosMenores3: Math.min(opts.nHijosMenores3, v) })}
            max={6}
          />
          <Stepper
            label="< 3 años"
            value={opts.nHijosMenores3}
            onChange={v => set('nHijosMenores3', v)}
            max={Math.max(0, opts.nHijos)}
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <Stepper
            label="Ascendientes a cargo (>65 años)"
            value={opts.nAscendientes}
            onChange={v => set('nAscendientes', v)}
            max={2}
          />
        </div>
        {(opts.nHijos > 0 || opts.nAscendientes > 0) && (
          <p className="config-note" style={{ color: 'var(--green)', opacity: 0.9 }}>
            Mínimo familiar añadido: reduce tu cuota IRPF.
          </p>
        )}
      </div>
    </div>
  );
}
