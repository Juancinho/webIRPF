import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, DATOS_CHART } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { dec, eur, pct } from '../utils/format';

/* Rampa secuencial de un solo tono: del papel al petróleo de la publicación.
   Un solo tono porque lo que se compara es intensidad, no categorías. */
const RAMPA = ['#eae8e1', '#d3dad8', '#b4c4c4', '#93aeb0', '#70979b', '#4d7f85', '#2c666e', '#0b5560'];

const MEDIDAS = {
  irpf: { k: 'Tipo efectivo IRPF', campo: 'irpf', nota: 'sólo IRPF sobre el bruto' },
  total: { k: 'Carga total', campo: 'total', nota: 'IRPF + cotización del trabajador sobre el bruto' },
};

/* Las reformas que dejan huella visible en el mapa. */
const HITOS = {
  2015: 'Nueva escala',
  2019: 'Art. 20 ampliado',
  2023: 'MEI · tramo 47 %',
};

const W = 1180;
const H = 470;
const X0 = 74;
const X1 = W - 158;
const Y0 = 52;
const FILA = 24;

/**
 * FIG. 15 — QUINCE AÑOS EN UNA SOLA IMAGEN.
 *
 * Todas las demás figuras históricas fijan un sueldo y recorren los años, o
 * fijan un año y recorren los sueldos. Esta no fija nada: cada celda es un
 * nivel de renta en un ejercicio, y el color es lo que se llevaba el impuesto.
 *
 * Leída en horizontal cuenta la progresividad de cada año; leída en vertical
 * —una columna es el mismo poder adquisitivo— cuenta lo que ninguna ley
 * anunció nunca: cómo cambió la carga de un sueldo que no se movió.
 */
export default function MapaCalor() {
  const { anio, bruto } = useFiscal();
  const [medida, setMedida] = useState('irpf');
  const [tip, setTip] = useState(null);

  const campo = MEDIDAS[medida].campo;

  // una celda cada 1.000 € de bruto: densa pero legible, y sin inventar datos
  const columnas = useMemo(() => DATOS_CHART.filter((_, i) => i % 2 === 0), []);

  const { lo, hi } = useMemo(() => {
    const vals = ANIOS.flatMap(a => columnas.map(d => d[`${campo}_${a}`]));
    return { lo: Math.min(...vals), hi: Math.max(...vals) };
  }, [columnas, campo]);

  const color = v => {
    const t = (v - lo) / Math.max(1e-6, hi - lo);
    return RAMPA[Math.min(RAMPA.length - 1, Math.max(0, Math.round(t * (RAMPA.length - 1))))];
  };

  const xs = columnas.map(d => d.bruto);
  const x = linear([xs[0], xs[xs.length - 1]], [X0, X1]);
  const ancho = (X1 - X0) / columnas.length;
  const alto = FILA - 3;

  const marcado = Math.min(Math.max(bruto, xs[0]), xs[xs.length - 1]);
  const yDe = a => Y0 + ANIOS.indexOf(a) * FILA;

  const fin = columnas[columnas.length - 1];
  const primero = ANIOS[0];
  const ultimo = ANIOS[ANIOS.length - 1];
  const celdaTuya = columnas.reduce(
    (best, d) => (Math.abs(d.bruto - marcado) < Math.abs(best.bruto - marcado) ? d : best),
    columnas[0]
  );
  const deltaTuyo = celdaTuya[`${campo}_${ultimo}`] - celdaTuya[`${campo}_${primero}`];

  return (
    <Figure
      id="15"
      title={`Para un sueldo real constante, la carga de ${ultimo} difiere en ${dec(Math.abs(deltaTuyo))} puntos respecto a ${primero}`}
      sub={`${ANIOS.length} ejercicios × ${columnas.length} niveles de renta · euros constantes de 2026 · cada celda es ${MEDIDAS[medida].nota}`}
      legend="Una fila es un año · cada columna mantiene el mismo poder adquisitivo · una celda más oscura indica una carga efectiva mayor"
      source="Fuente · cálculo propio sobre parámetros BOE · IPC INE"
      note="Leer una columna de arriba abajo mantiene constante el salario real y cambia únicamente el ejercicio fiscal. Las discontinuidades suelen coincidir con reformas; los cambios graduales entre ellas pueden reflejar inflación e indexación parcial de parámetros."
      summary={ANIOS.map(a => `${a}: de ${pct(columnas[0][`${campo}_${a}`])} a ${pct(fin[`${campo}_${a}`])}`).join('; ')}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <span className="fs-seg">
          {Object.entries(MEDIDAS).map(([k, m]) => (
            <button key={k} type="button" aria-pressed={medida === k} onClick={() => setMedida(k)}>
              {m.k}
            </button>
          ))}
        </span>

        {/* la rampa, con sus extremos: sin esto el color no es un dato */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span className="fs-stamp">{pct(lo, 0)}</span>
          <span style={{ display: 'inline-flex' }}>
            {RAMPA.map(c => (
              <span key={c} style={{ width: 22, height: 10, background: c }} />
            ))}
          </span>
          <span className="fs-stamp">{pct(hi, 0)}</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={900} label="Quince años de carga fiscal por nivel de renta">
        {/* ── las celdas ──────────────────────────────────────────────── */}
        {ANIOS.map(a => (
          <g key={a}>
            {columnas.map((d, i) => (
              <rect
                key={d.bruto}
                x={round(X0 + i * ancho)}
                y={yDe(a)}
                width={Math.ceil(ancho) + 0.5}
                height={alto}
                fill={color(d[`${campo}_${a}`])}
              />
            ))}
            <text
              x={X0 - 12}
              y={yDe(a) + alto / 2 + 3.5}
              fontSize={10}
              fontWeight={a === anio ? 800 : 500}
              textAnchor="end"
              fill={a === anio ? 'var(--signal)' : 'var(--ink-4)'}
              className="fs-t-stamp"
            >
              {a}
            </text>
            {HITOS[a] && (
              <Label x={X1 + 10} y={yDe(a) + alto / 2 + 3.5} size={8.5} color="var(--ink-4)" mono>
                {HITOS[a]}
              </Label>
            )}
          </g>
        ))}

        {/* ── tu salario: la columna que puedes leer de arriba abajo ──── */}
        <line
          x1={round(x(marcado))}
          y1={Y0 - 10}
          x2={round(x(marcado))}
          y2={Y0 + ANIOS.length * FILA - 1}
          stroke="var(--signal)"
          strokeWidth={1.4}
        />
        <Label
          x={round(x(marcado))}
          y={Y0 - 16}
          size={9.5}
          color="var(--signal)"
          anchor={x(marcado) > X1 - 120 ? 'end' : 'middle'}
          mono
        >
          TU SALARIO · {eur(marcado)}
        </Label>

        {/* ── el eje de renta ─────────────────────────────────────────── */}
        {[0, 20000, 40000, 60000, 80000, 100000].map(v => (
          <g key={v}>
            <line
              x1={round(x(v))}
              y1={Y0 + ANIOS.length * FILA}
              x2={round(x(v))}
              y2={Y0 + ANIOS.length * FILA + 5}
              stroke="var(--ink-5)"
              strokeWidth={0.7}
            />
            <Label
              x={round(x(v))}
              y={Y0 + ANIOS.length * FILA + 20}
              size={9.5}
              color="var(--ink-4)"
              anchor={v === 0 ? 'start' : v === 100000 ? 'end' : 'middle'}
              mono
            >
              {v === 0 ? '0 €' : eur(v)}
            </Label>
          </g>
        ))}
        <Label x={X0} y={Y0 + ANIOS.length * FILA + 38} size={9} color="var(--ink-5)" mono>
          SALARIO BRUTO ANUAL · EUROS CONSTANTES DE 2026
        </Label>

        <rect
          className="fs-hit"
          x={X0}
          y={Y0}
          width={X1 - X0}
          height={ANIOS.length * FILA}
          onMouseMove={e => {
            const svg = e.currentTarget.ownerSVGElement;
            const r = svg.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const py = ((e.clientY - r.top) / r.height) * H;
            const i = Math.min(columnas.length - 1, Math.max(0, Math.floor((px - X0) / ancho)));
            const fila = Math.min(ANIOS.length - 1, Math.max(0, Math.floor((py - Y0) / FILA)));
            const d = columnas[i];
            const a = ANIOS[fila];
            setTip({
              vx: X0 + i * ancho,
              vy: yDe(a) + alto,
              title: pct(d[`${campo}_${a}`]),
              sub: `${eur(d.bruto)} en ${a}`,
              rows: [
                ['Tipo efectivo IRPF', pct(d[`irpf_${a}`]), 'var(--signal)'],
                ['Carga total', pct(d[`total_${a}`])],
                [`Frente a ${primero}`, `${d[`${campo}_${a}`] >= d[`${campo}_${primero}`] ? '+' : '−'}${dec(Math.abs(d[`${campo}_${a}`] - d[`${campo}_${primero}`]))} p.p.`],
              ],
            });
          }}
          onMouseLeave={() => setTip(null)}
        />
      </ChartFrame>
    </Figure>
  );
}
