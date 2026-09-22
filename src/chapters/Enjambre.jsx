import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { DISTRIBUCION_SALARIAL } from '../engine/irpf';
import { salarioEnPercentil } from './distribucionUtil';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { eur, pct } from '../utils/format';

const W = 880;
const X0 = 22;
const X1 = W - 20;
const CIELO = 74;          // sitio para los rótulos de arriba
const SUELO = 62;          // sitio para el eje y su pie
const N = 1000;
const UMBRAL_ALTO = 100000;
const D = 6.2;             // diámetro del punto = ancho de columna

/**
 * FIG. 22 — MIL ASALARIADOS.
 *
 * Mil puntos, uno por milésima de los asalariados, colocados por su sueldo y
 * apilados cuando coinciden. No hay eje vertical que leer: la altura del
 * montón *es* cuánta gente cobra eso, y la forma del montón es la
 * distribución entera sin curva que interpretar.
 *
 * El apilado es una columna por diámetro de punto —un dot plot de Wilkinson,
 * no un enjambre aleatorio— así que la figura sale idéntica en cada carga y
 * puede compararse de un año a otro.
 *
 * La cola alta ocupa su posición salarial real. El dominio se amplía en
 * bloques de 50.000 € hasta incluir el último punto estimado y el salario del
 * lector; no hay un cajón “más de 100.000” que borre las diferencias internas.
 */
export default function Enjambre() {
  const { anio, bruto, percentil } = useFiscal();
  const [tip, setTip] = useState(null);

  const dist = DISTRIBUCION_SALARIAL[anio];
  const crudos = useMemo(
    () => Array.from({ length: N }, (_, i) => {
      const p = ((i + 0.5) / N) * 100;
      return { p, s: salarioEnPercentil(p, dist) };
    }),
    [dist]
  );
  const salarioMaximo = Math.max(bruto, crudos[crudos.length - 1]?.s || 0);
  const tope = Math.max(150000, Math.ceil(salarioMaximo / 50000) * 50000);
  const x = linear([0, tope], [X0, X1]);

  const { puntos, columnas, maxFila } = useMemo(() => {
    const cuenta = new Map();
    const colocados = crudos.map(pt => {
      const col = Math.round((x(pt.s) - X0) / D);
      const fila = cuenta.get(col) || 0;
      cuenta.set(col, fila + 1);
      return { ...pt, col, cx: X0 + col * D, fila };
    });

    const columnas = [...cuenta.entries()].map(([col, n]) => {
      const dellos = colocados.filter(p => p.col === col);
      return {
        col,
        cx: X0 + col * D,
        n,
        sMin: dellos[0].s,
        sMax: dellos[dellos.length - 1].s,
        pMin: dellos[0].p,
        pMax: dellos[dellos.length - 1].p,
      };
    });

    return {
      puntos: colocados,
      columnas,
      maxFila: Math.max(...cuenta.values()),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crudos, tope]);

  /* El lienzo se ajusta al montón: ni hueco muerto arriba ni puntos
     aplastados. Cada punto ocupa una celda de ancho y alto D. */
  const ALTO_MONTON = maxFila * D;
  const BASE = CIELO + ALTO_MONTON + 5;
  const H = BASE + SUELO;
  const r = D / 2 - 0.7;
  const cy = fila => BASE - 5 - (fila + 0.5) * D;

  const miPunto = puntos.reduce(
    (best, p) => (Math.abs(p.p - percentil) < Math.abs(best.p - percentil) ? p : best),
    puntos[0]
  );
  const miColumna = columnas.find(c => c.col === miPunto.col);
  const salariosAltos = puntos.filter(p => p.s > UMBRAL_ALTO).length;

  const hitos = [
    { p: 10, label: 'P10' },
    { p: 50, label: 'MEDIANA' },
    { p: 90, label: 'P90' },
  ].map(h => ({ ...h, s: salarioEnPercentil(h.p, dist) }));

  const pasoEje = tope <= 150000 ? 25000 : 50000;
  const marcasEje = Array.from({ length: Math.floor(tope / pasoEje) + 1 }, (_, i) => i * pasoEje);

  return (
    <Figure
      id="23"
      title={`Mil asalariados, uno por punto: por delante de ${Math.round(percentil)} de cada cien`}
      sub={`${anio} · eje lineal completo de 0 a ${eur(tope)} · cada punto es una milésima de los asalariados`}
      legend="Los puntos se apilan cuando coinciden: la altura del montón es cuánta gente cobra ese sueldo · el punto verde eres tú · la línea de 100.000 € abre la cola alta sin agruparla"
      source="Fuente · INE — Encuesta Anual de Estructura Salarial, tabla 28191"
      note={`Los ${salariosAltos} puntos estimados por encima de ${eur(UMBRAL_ALTO)} conservan ahora su posición salarial. El INE no publica P95 ni P99 en esta tabla: toda la cola por encima del percentil 90 es una extrapolación suave y debe leerse como estimación, no como dato censal.`}
      summary={hitos.map(h => `${h.label}: ${eur(h.s)}`).concat(`Por encima de ${eur(UMBRAL_ALTO)}: ${salariosAltos} de cada 1.000`).join('; ')}
    >
      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={760} label={`Mil asalariados colocados por su sueldo, de cero a ${eur(tope)}`}>
        {/* los percentiles publicados, detrás del montón */}
        {hitos.map((h, i) => {
          const yr = i === 1 ? 18 : 32;
          return (
            <g key={h.label}>
              <line
                x1={round(x(h.s))}
                y1={yr + 6}
                x2={round(x(h.s))}
                y2={BASE}
                stroke="var(--ink-7)"
                strokeWidth={1}
                strokeDasharray="2 4"
              />
              <Label x={round(x(h.s))} y={yr} size={9} color="var(--ink-4)" anchor="middle" mono>
                {h.label} · {eur(h.s)}
              </Label>
            </g>
          );
        })}

        {puntos.map((p, i) => {
          const esMio = p === miPunto;
          return (
            <circle
              key={i}
              cx={round(p.cx)}
              cy={round(cy(p.fila))}
              r={esMio ? r + 1.4 : r}
              fill={esMio ? 'var(--signal)' : p.s > UMBRAL_ALTO ? 'var(--ink-2)' : 'var(--ink-4)'}
              opacity={esMio ? 1 : p.s > UMBRAL_ALTO ? 0.82 : 0.58}
            />
          );
        })}

        {/* tú, señalado desde arriba del montón para no perderte entre mil */}
        <line
          x1={round(miPunto.cx)}
          y1={round(cy(miColumna.n - 1)) - 9}
          x2={round(miPunto.cx)}
          y2={CIELO - 20}
          stroke="var(--signal)"
          strokeWidth={1.2}
        />
        <Label
          x={round(miPunto.cx)}
          y={CIELO - 25}
          size={10.5}
          weight={800}
          color="var(--signal)"
          anchor={miPunto.cx > X1 - 130 ? 'end' : miPunto.cx < 130 ? 'start' : 'middle'}
          mono
        >
          TÚ · {eur(bruto)} · P{Math.round(percentil)}
        </Label>

        {/* la cola alta no se resume: una regla marca dónde empieza */}
        <line
          x1={round(x(UMBRAL_ALTO))}
          y1={CIELO - 6}
          x2={round(x(UMBRAL_ALTO))}
          y2={BASE}
          stroke="var(--ink-5)"
          strokeWidth={0.9}
          strokeDasharray="3 4"
        />
        <Label x={round(x(UMBRAL_ALTO)) + 5} y={CIELO + 6} size={9} weight={800} color="var(--ink-3)" mono>
          COLA &gt; 100.000 € · {salariosAltos}/1.000
        </Label>

        {/* el eje */}
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke="var(--rule)" strokeWidth={0.8} />
        {marcasEje.map(v => (
          <g key={v}>
            <line x1={round(x(v))} y1={BASE} x2={round(x(v))} y2={BASE + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label
              x={round(x(v))}
              y={BASE + 19}
              size={9.5}
              color="var(--ink-4)"
              anchor={v === 0 ? 'start' : v === tope ? 'end' : 'middle'}
              mono
            >
              {eur(v)}
            </Label>
          </g>
        ))}
        <Label x={X0} y={BASE + 38} size={9} color="var(--ink-5)" mono>
          SALARIO BRUTO ANUAL · UN PUNTO = UNA MILÉSIMA DE LOS ASALARIADOS
        </Label>

        <rect
          className="fs-hit"
          x={X0}
          y={CIELO - 16}
          width={X1 - X0}
          height={BASE - CIELO + 16}
          onMouseMove={e => {
            const svg = e.currentTarget.ownerSVGElement;
            const caja = svg.getBoundingClientRect();
            const px = ((e.clientX - caja.left) / caja.width) * W;
            const c = columnas.reduce(
              (best, k) => (Math.abs(k.cx - px) < Math.abs(best.cx - px) ? k : best),
              columnas[0]
            );
            setTip({
              vx: c.cx,
              vy: cy(c.n - 1),
              title: c.sMax - c.sMin < 400 ? eur(c.sMin) : `${eur(c.sMin)} – ${eur(c.sMax)}`,
              sub: `Percentil ${c.pMin.toFixed(1)} – ${c.pMax.toFixed(1)}`,
              rows: [
                ['En esta columna', `${c.n} de cada 1.000`, 'var(--signal)'],
                ['Cobran menos', pct(c.pMin, 1)],
              ],
            });
          }}
          onMouseLeave={() => setTip(null)}
        />
      </ChartFrame>
    </Figure>
  );
}
