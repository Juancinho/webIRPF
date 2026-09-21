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
const XE = W - 152;        // donde termina el eje de sueldos
const GX0 = W - 128;       // el apartado de la cola alta
const GX1 = W - 20;
const CIELO = 74;          // sitio para los rótulos de arriba
const SUELO = 62;          // sitio para el eje y su pie
const N = 1000;
const TOPE = 100000;
const D = 8.5;             // diámetro del punto = ancho de columna

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
 * La cola alta no se aplasta contra el borde: los que se salen del eje van a
 * un bloque aparte, contados, para no fingir que ganan todos lo mismo.
 */
export default function Enjambre() {
  const { anio, bruto, percentil } = useFiscal();
  const [tip, setTip] = useState(null);

  const dist = DISTRIBUCION_SALARIAL[anio];
  const x = linear([0, TOPE], [X0, XE]);

  const { puntos, columnas, cola, maxFila } = useMemo(() => {
    const crudos = Array.from({ length: N }, (_, i) => {
      const p = ((i + 0.5) / N) * 100;
      return { p, s: salarioEnPercentil(p, dist) };
    });

    const dentro = crudos.filter(c => c.s <= TOPE);
    const cuenta = new Map();
    const colocados = dentro.map(pt => {
      const col = Math.round(x(pt.s) / D);
      const fila = cuenta.get(col) || 0;
      cuenta.set(col, fila + 1);
      return { ...pt, col, cx: col * D, fila };
    });

    const columnas = [...cuenta.entries()].map(([col, n]) => {
      const dellos = colocados.filter(p => p.col === col);
      return {
        col,
        cx: col * D,
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
      cola: crudos.length - dentro.length,
      maxFila: Math.max(...cuenta.values()),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dist]);

  /* El lienzo se ajusta al montón: ni hueco muerto arriba ni puntos
     aplastados. Los puntos son cuadrados —una columna de ancho D, una fila de
     alto D— porque sólo así cada punto ocupa lo mismo que cualquier otro. */
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
  const fueraDeEje = bruto > TOPE;

  const hitos = [
    { p: 10, label: 'P10' },
    { p: 50, label: 'MEDIANA' },
    { p: 90, label: 'P90' },
  ].map(h => ({ ...h, s: salarioEnPercentil(h.p, dist) }));

  /* La cola: un bloque contado, no una columna aplastada contra el margen. */
  const PASO_COLA = D * 0.72;
  const porFila = Math.max(1, Math.floor((GX1 - GX0) / PASO_COLA));
  const colaPuntos = Array.from({ length: cola }, (_, i) => ({
    cx: GX0 + (i % porFila) * PASO_COLA + PASO_COLA / 2,
    cy: BASE - 5 - (Math.floor(i / porFila) + 0.5) * PASO_COLA,
  }));

  return (
    <Figure
      id="23"
      title={`Mil asalariados, uno por punto: por delante de ${Math.round(percentil)} de cada cien`}
      sub={`${anio} · cada punto es una milésima de los asalariados · cuanto más alto el montón, más gente cobra ese sueldo`}
      legend="Los puntos se apilan cuando coinciden: la altura del montón es cuánta gente cobra ese sueldo · el punto verde eres tú · los escalones son de la interpolación entre los cinco percentiles publicados, no de la realidad"
      source="Fuente · INE — Encuesta Anual de Estructura Salarial, tabla 28191"
      note={`El eje llega hasta ${eur(TOPE)}; los ${cola} de cada mil que cobran más van contados aparte, a la derecha, para no aplastarlos contra el margen. El INE no publica P95 ni P99 en esta tabla, así que por encima del percentil 90 la curva es una extrapolación suave, no dato censal.`}
      summary={hitos.map(h => `${h.label}: ${eur(h.s)}`).concat(`Por encima de ${eur(TOPE)}: ${cola} de cada 1.000`).join('; ')}
    >
      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={700} label="Mil asalariados colocados por su sueldo">
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
          const esMio = !fueraDeEje && p === miPunto;
          return (
            <circle
              key={i}
              cx={round(p.cx)}
              cy={round(cy(p.fila))}
              r={esMio ? r + 1.4 : r}
              fill={esMio ? 'var(--signal)' : 'var(--ink-4)'}
              opacity={esMio ? 1 : 0.6}
            />
          );
        })}

        {/* tú, señalado desde arriba del montón para no perderte entre mil */}
        {!fueraDeEje && (
          <>
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
              anchor={miPunto.cx > XE - 130 ? 'end' : miPunto.cx < 130 ? 'start' : 'middle'}
              mono
            >
              TÚ · {eur(bruto)} · P{Math.round(percentil)}
            </Label>
          </>
        )}

        {/* la cola alta, contada */}
        <line x1={round((XE + GX0) / 2)} y1={BASE - 4} x2={round((XE + GX0) / 2)} y2={BASE - 44} stroke="var(--ink-6)" strokeWidth={0.8} strokeDasharray="2 3" />
        {colaPuntos.map((c, i) => (
          <circle key={`c${i}`} cx={round(c.cx)} cy={round(c.cy)} r={PASO_COLA / 2 - 0.7} fill={fueraDeEje ? 'var(--signal)' : 'var(--ink-4)'} opacity={0.6} />
        ))}
        <Label x={GX0} y={BASE - 24 - Math.ceil(cola / porFila) * PASO_COLA} size={9.5} weight={800} color="var(--ink-2)" mono>
          {cola} DE CADA 1.000
        </Label>
        <Label x={GX0} y={BASE - 13 - Math.ceil(cola / porFila) * PASO_COLA} size={9} color="var(--ink-4)" mono>
          MÁS DE {eur(TOPE)}
        </Label>

        {/* el eje */}
        <line x1={X0} y1={BASE} x2={XE} y2={BASE} stroke="var(--rule)" strokeWidth={0.8} />
        {[0, 20000, 40000, 60000, 80000, 100000].map(v => (
          <g key={v}>
            <line x1={round(x(v))} y1={BASE} x2={round(x(v))} y2={BASE + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label
              x={round(x(v))}
              y={BASE + 19}
              size={9.5}
              color="var(--ink-4)"
              anchor={v === 0 ? 'start' : v === TOPE ? 'end' : 'middle'}
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
          width={XE - X0}
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
