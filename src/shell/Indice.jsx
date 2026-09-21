import { useEffect, useRef } from 'react';
import { CAPITULOS } from './chapters';
import { useFiscal } from '../state/fiscalContext';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function Miniatura({ kind, nomina, bruto, percentil }) {
  const coste = Math.max(nomina.costeLab, 1);
  const brutoSeguro = Math.max(bruto, 1);
  const netoBruto = clamp(nomina.salarioNeto / brutoSeguro, 0, 1);
  const ssBruto = clamp(nomina.cotTra / brutoSeguro, 0, 1);
  const netoCoste = clamp(nomina.salarioNeto / coste, 0, 1);
  const px = 12 + clamp(percentil, 0, 100) * 1.92;
  const ink = 'var(--ink)';
  const muted = 'var(--ink-6)';
  const signal = 'var(--signal)';
  const counter = 'var(--counter)';

  let dibujo;
  if (kind === 'ruler') dibujo = <>
    <line x1="12" y1="61" x2="208" y2="61" stroke={ink} />
    {Array.from({ length: 17 }, (_, i) => <line key={i} x1={12 + i * 12.25} y1="57" x2={12 + i * 12.25} y2={i % 4 ? 64 : 68} stroke={muted} />)}
    <line x1="12" y1="61" x2={12 + clamp(bruto / 150000, 0, 1) * 196} y2="61" stroke={signal} strokeWidth="3" />
    <circle cx={12 + clamp(bruto / 150000, 0, 1) * 196} cy="61" r="7" fill="var(--bone)" stroke={signal} strokeWidth="2" />
  </>;
  else if (kind === 'split') dibujo = <>
    <rect x="12" y="40" width={196 * netoBruto} height="28" fill={signal} />
    <rect x={12 + 196 * netoBruto} y="40" width={196 * ssBruto} height="28" fill={muted} />
    <rect x={12 + 196 * (netoBruto + ssBruto)} y="40" width={Math.max(0, 196 * (1 - netoBruto - ssBruto))} height="28" fill={ink} />
  </>;
  else if (kind === 'flow') dibujo = <>
    {[0, 1, 2, 3].map((i) => {
      const ratios = [1, bruto / coste, nomina.rnPrevio / coste, nomina.salarioNeto / coste];
      const w = 150 * clamp(ratios[i], 0, 1);
      return <g key={i}><line x1={34} y1={20 + i * 23} x2={34 + w} y2={20 + i * 23} stroke={i === 3 ? signal : ink} strokeWidth={i === 3 ? 7 : 5} /><line x1={34 + w} y1={23 + i * 23} x2={34 + w} y2={38 + i * 23} stroke={muted} /></g>;
    })}
  </>;
  else if (kind === 'steps') dibujo = <>
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={18 + i * 38} y={70 - i * 10} width="31" height={20 + i * 10} fill={i === 2 ? counter : i === 4 ? ink : muted} opacity={0.45 + i * 0.12} />)}
    <line x1="12" y1="90" x2="208" y2="90" stroke={ink} />
  </>;
  else if (kind === 'history') dibujo = <>
    {[0, 1, 2, 3, 4].map((i) => <polyline key={i} points={`12,${78-i*3} 55,${62-i*2} 103,${51+i} 154,${35+i*2} 208,${20+i*3}`} fill="none" stroke={[signal,counter,'var(--series-jade)','var(--series-violet)','var(--series-steel)'][i]} strokeWidth={i === 0 ? 2.4 : 1.5} />)}
  </>;
  else if (kind === 'hundred') dibujo = <>
    {Array.from({ length: 50 }, (_, i) => <rect key={i} x={29 + (i % 10) * 17} y={14 + Math.floor(i / 10) * 17} width="10" height="10" rx="1" fill={i < Math.round(netoCoste * 50) ? 'var(--night-ink)' : i % 3 ? '#5f686b' : 'var(--night-signal)'} />)}
  </>;
  else if (kind === 'distribution') dibujo = <>
    <path d="M12 88 C32 86 46 54 72 38 C99 22 126 29 146 49 C166 67 186 79 208 84" fill="none" stroke={ink} strokeWidth="2" />
    <line x1={px} y1="14" x2={px} y2="91" stroke={signal} strokeWidth="2" />
    <circle cx={px} cy="84" r="4" fill={signal} />
  </>;
  else if (kind === 'allocation') dibujo = <>
    <path d="M15 35 C65 35 62 52 108 52 C153 52 151 18 207 18" fill="none" stroke={ink} strokeWidth="9" />
    <path d="M15 67 C65 67 62 52 108 52 C153 52 151 52 207 52" fill="none" stroke={counter} strokeWidth="6" />
    <path d="M108 52 C153 52 151 84 207 84" fill="none" stroke={signal} strokeWidth="4" />
  </>;
  else if (kind === 'debt') dibujo = <>
    <path d="M12 88 L12 76 L42 72 L72 67 L102 63 L132 31 L162 24 L208 16 L208 88 Z" fill={counter} opacity=".14" />
    <polyline points="12,76 42,72 72,67 102,63 132,31 162,24 208,16" fill="none" stroke={counter} strokeWidth="2" />
    <polyline points="12,70 42,56 72,51 102,48 132,20 162,30 208,46" fill="none" stroke={signal} strokeWidth="1.5" />
  </>;
  else if (kind === 'summary') dibujo = <>
    <text x="12" y="42" fill="var(--night-ink)" fontSize="26" fontWeight="800">{Math.round(nomina.salarioNeto).toLocaleString('es-ES')} €</text>
    <line x1="12" y1="56" x2="208" y2="56" stroke="var(--night-rule)" />
    <text x="12" y="78" fill="var(--night-signal)" fontSize="12" fontWeight="700">NETO ANUAL</text>
  </>;
  else dibujo = <>
    {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="16" y1={20+i*16} x2="204" y2={20+i*16} stroke={i === 0 ? ink : muted} /><rect x="20" y={15+i*16} width={22+i*11} height="5" fill={i === 0 ? counter : muted} /></g>)}
  </>;

  return <svg className="fs-index-thumb" viewBox="0 0 220 104" aria-hidden="true">{dibujo}</svg>;
}

/** A full-screen index sheet — document navigation, opened on demand. */
export default function Indice({ onClose }) {
  const ref = useRef(null);
  const { nomina, bruto, percentil } = useFiscal();

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector('a')?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fs-indice" role="dialog" aria-modal="true" aria-label="Índice" ref={ref}>
      <div className="fs-page">
        <div className="fs-indice-head">
          <div>
            <span className="fs-masthead-name">FiscalScope</span>
            <p className="fs-masthead-sub" style={{ marginBottom: 0 }}>
              Papel fiscal interactivo · España · 2012—2026
            </p>
          </div>
          <button type="button" className="fs-btn fs-btn-quiet" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <p className="fs-indice-intro">
          Hoja de contactos · cada miniatura anticipa la figura que organiza el capítulo.
        </p>

        <nav className="fs-index-grid" aria-label="Capítulos de la publicación">
          {CAPITULOS.map(c => (
            <a key={c.id} href={`#${c.id}`} onClick={onClose} className={c.noche ? 'is-night' : ''}>
              <span className="fs-indice-n">{c.n}</span>
              <Miniatura kind={c.preview} nomina={nomina} bruto={bruto} percentil={percentil} />
              <span className="fs-indice-t">{c.titulo}</span>
              <span className="fs-indice-d">{c.desc}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
