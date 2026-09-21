import { useEffect, useRef, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { REGIONES } from '../engine/irpf';
import { dec, eur, num } from '../utils/format';

/**
 * LA CINTA — the persistent instrument (VISUAL_PLAN_V4 §6).
 * There is no calculator card and no navbar: the reader's fiscal state lives
 * in a tape docked to the foot of the page, and every figure reads from it.
 */
export default function Cinta({ visible }) {
  const {
    bruto, anio, pagas, opts, nomina, porPaga, region,
    setBruto, setAnio, setPagas, setOpts,
  } = useFiscal();

  const [perfilOpen, setPerfilOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const ref = useRef(null);

  // keep the page bottom clear of the tape
  useEffect(() => {
    const el = ref.current;
    const apply = () => {
      const h = visible && el ? el.offsetHeight : 0;
      document.documentElement.style.setProperty('--cinta-h', `${h}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [visible, perfilOpen]);

  useEffect(() => {
    if (!perfilOpen) return undefined;
    const onKey = e => e.key === 'Escape' && setPerfilOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [perfilOpen]);

  const pctCoste = nomina.costeLab > 0 ? (nomina.salarioNeto / nomina.costeLab) * 100 : 0;
  const setOpt = (k, v) => setOpts({ ...opts, [k]: v });

  return (
    <>
      {perfilOpen && (
        <PerfilSheet opts={opts} anio={anio} setOpt={setOpt} setOpts={setOpts} onClose={() => setPerfilOpen(false)} />
      )}

      <div className={`fs-cinta ${visible ? 'is-on' : ''}`} ref={ref}>
        <div className="fs-cinta-inner">
          <div>
            <div className="fs-cinta-pair">
              <span className="fs-cinta-k">Bruto</span>
              <label className="fs-sr" htmlFor="cinta-bruto">Salario bruto anual en euros</label>
              <input
                id="cinta-bruto"
                className="fs-input"
                inputMode="numeric"
                value={draft ?? num(bruto)}
                onChange={e => {
                  setDraft(e.target.value);
                  const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  if (Number.isFinite(v)) setBruto(v);
                }}
                onBlur={() => setDraft(null)}
              />
              <span className="fs-cinta-k">€</span>
            </div>
            <div className="fs-cinta-pair" style={{ marginTop: 2 }}>
              <span className="fs-cinta-k">Neto</span>
              <span className="fs-cinta-v is-net">{eur(nomina.salarioNeto)}</span>
              <span className="fs-cinta-note">
                {eur(porPaga)}/mes · {dec(pctCoste)} € de cada 100 € de coste
              </span>
            </div>
          </div>

          <input
            className="fs-cinta-range"
            type="range"
            min="0"
            max="150000"
            step="500"
            value={Math.min(bruto, 150000)}
            onChange={e => setBruto(+e.target.value)}
            aria-label="Salario bruto anual"
            aria-valuetext={`${num(bruto)} euros`}
          />

          <div className="fs-cinta-controls">
            <span className="fs-year">
              <button type="button" onClick={() => setAnio(anio - 1)} disabled={anio <= 2012} aria-label="Año anterior">−</button>
              <span className="fs-year-v" aria-live="polite">{anio}</span>
              <button type="button" onClick={() => setAnio(anio + 1)} disabled={anio >= 2026} aria-label="Año siguiente">+</button>
            </span>

            <span className="fs-seg">
              {[12, 14].map(n => (
                <button key={n} type="button" aria-pressed={pagas === n} onClick={() => setPagas(n)}>
                  {n} pagas
                </button>
              ))}
            </span>

            <button
              type="button"
            className="fs-btn"
            aria-expanded={perfilOpen}
            onClick={() => setPerfilOpen(o => !o)}
          >
              Perfil<span className="fs-profile-label"> · {region.name}</span>
          </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Stepper({ label, value, min = 0, max = 6, onChange, hint }) {
  return (
    <div className="fs-field-row">
      <span className="fs-label">{label}</span>
      <span className="fs-stepper">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Menos ${label}`}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Más ${label}`}>+</button>
      </span>
      {hint && <span className="fs-field-hint">{hint}</span>}
    </div>
  );
}

function PerfilSheet({ opts, anio, setOpt, setOpts, onClose }) {
  const region = REGIONES[opts.ccaa] || REGIONES.default;

  return (
    <div className="fs-perfil" role="dialog" aria-modal="false" aria-label="Perfil fiscal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3>Perfil fiscal</h3>
        <button type="button" className="fs-btn fs-btn-quiet" onClick={onClose}>Cerrar</button>
      </div>

      <div className="fs-field-row">
        <span className="fs-label">Régimen</span>
        <span className="fs-seg">
          {[['asalariado', 'Asalariado'], ['autonomo', 'Autónomo']].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={opts.regimen === v} onClick={() => setOpt('regimen', v)}>{l}</button>
          ))}
        </span>
      </div>

      <div className="fs-field-row">
        <label className="fs-label" htmlFor="perfil-ccaa">Comunidad autónoma</label>
        <select
          id="perfil-ccaa"
          className="fs-select"
          value={opts.ccaa}
          onChange={e => setOpt('ccaa', e.target.value)}
        >
          {Object.entries(REGIONES).map(([k, r]) => (
            <option key={k} value={k}>{r.name}</option>
          ))}
        </select>
        <span className="fs-field-hint">
          {region.desc}
          {anio < 2024 && ' Antes de 2024 se aplica la escala estándar.'}
        </span>
      </div>

      <div className="fs-field-row">
        <span className="fs-label">Tributación</span>
        <span className="fs-seg">
          {[['individual', 'Individual'], ['conjunta', 'Conjunta']].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={opts.tributacion === v} onClick={() => setOpt('tributacion', v)}>{l}</button>
          ))}
        </span>
      </div>

      <Stepper
        label="Hijos a cargo"
        value={opts.nHijos}
        max={6}
        onChange={v => setOpts({ ...opts, nHijos: v, nHijosMenores3: Math.min(opts.nHijosMenores3, v) })}
      />
      <Stepper
        label="De ellos, menores de 3"
        value={opts.nHijosMenores3}
        max={opts.nHijos}
        onChange={v => setOpt('nHijosMenores3', v)}
      />
      <Stepper
        label="Ascendientes a cargo"
        value={opts.nAscendientes}
        max={2}
        onChange={v => setOpt('nAscendientes', v)}
        hint="Mayores de 65 años o con discapacidad que convivan contigo."
      />

      <p className="fs-source" style={{ marginTop: 14 }}>
        Fuente · BOE · LIRPF arts. 56–61 · Leyes autonómicas de medidas tributarias
      </p>
    </div>
  );
}
