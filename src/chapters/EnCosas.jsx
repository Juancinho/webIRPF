import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, INFLACION_A_2026, PRECIOS_REFERENCIA, SMI_ANUAL, calcularNomina } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import YearComparator from '../figures/YearComparator';
import { Label } from '../figures/marks';
import { dec, eur } from '../utils/format';
import { round } from '../figures/scale';

const W = 880;
const X0 = 62;
const XG = 84;
const PASO = 17;
const GRUPO = 5;
const HUECO = 8;
const PORFILA = 30;      // glifos por línea antes de saltar: 30 × 17 px cabe de sobra
const LINEA = 17;        // separación entre líneas de glifos de un mismo año
const AIRE = 11;         // aire entre el bloque de un año y el del siguiente

const AÑOS = ANIOS.filter(a => a <= PRECIOS_REFERENCIA.ultimoAnio);

/* Tres unidades concretas. Cada una con su glifo: se cuentan objetos, que es
   la forma más directa que existe de comparar dos años. */
const UNIDADES = {
  vivienda: {
    k: 'Metros de vivienda',
    glifo: 'cuadrado',
    singular: 'm² comprado',
    enTitulo: 'm² de vivienda',
    plural: 'm² de vivienda que compra tu neto de un año',
    precio: a => PRECIOS_REFERENCIA.venta[a],
    precioLabel: a => `${eur(PRECIOS_REFERENCIA.venta[a])}/m²`,
    nota: 'precio medio del metro cuadrado en venta, diciembre de cada año',
  },
  alquiler: {
    k: 'Meses de alquiler',
    glifo: 'casa',
    singular: 'mes de alquiler',
    enTitulo: 'meses de alquiler',
    plural: `meses de alquiler de un piso de ${PRECIOS_REFERENCIA.pisoM2} m² que paga tu neto de un año`,
    precio: a => PRECIOS_REFERENCIA.alquiler[a] * PRECIOS_REFERENCIA.pisoM2,
    precioLabel: a => `${eur(PRECIOS_REFERENCIA.alquiler[a] * PRECIOS_REFERENCIA.pisoM2)}/mes`,
    nota: `alquiler medio por metro cuadrado, diciembre de cada año, sobre un piso de ${PRECIOS_REFERENCIA.pisoM2} m²`,
  },
  smi: {
    k: 'Meses de salario mínimo',
    glifo: 'moneda',
    singular: 'mes de SMI',
    enTitulo: 'mensualidades del salario mínimo',
    plural: 'mensualidades del salario mínimo que cabe en tu neto de un año',
    precio: a => SMI_ANUAL[a] / 12,
    precioLabel: a => `${eur(SMI_ANUAL[a] / 12)}/mes`,
    nota: 'salario mínimo interprofesional del año, dividido en doce mensualidades',
  },
};

function Glifo({ tipo, x, y, lleno = 1, color = 'var(--ink)' }) {
  const s = 11;
  const id = `${tipo}-${x}-${y}`;
  if (tipo === 'cuadrado') {
    return (
      <g>
        <rect x={round(x)} y={round(y - s / 2)} width={s} height={s} rx={1} fill="none" stroke={color} strokeWidth={0.9} />
        <rect x={round(x)} y={round(y - s / 2)} width={round(s * lleno)} height={s} rx={1} fill={color} />
      </g>
    );
  }
  if (tipo === 'casa') {
    return (
      <g>
        <path
          d={`M${round(x)} ${round(y + 5)} L${round(x)} ${round(y - 1)} L${round(x + 5.5)} ${round(y - 6)} L${round(x + 11)} ${round(y - 1)} L${round(x + 11)} ${round(y + 5)} Z`}
          fill={lleno >= 0.5 ? color : 'none'}
          stroke={color}
          strokeWidth={0.9}
          strokeLinejoin="round"
        />
      </g>
    );
  }
  return (
    <g>
      <circle cx={round(x + 5.5)} cy={round(y)} r={5} fill={lleno >= 0.5 ? color : 'none'} stroke={color} strokeWidth={0.9} />
      <title>{id}</title>
    </g>
  );
}

/**
 * FIG. 17 — TU SUELDO, MEDIDO EN COSAS.
 *
 * El neto real ya está en euros constantes, pero un euro constante sigue
 * siendo una abstracción: el IPC general mezcla la vivienda con los
 * electrodomésticos. Esta figura cambia el denominador por algo que se puede
 * señalar con el dedo —metros cuadrados, mensualidades de alquiler, salarios
 * mínimos— y cuenta cuántos caben en el mismo sueldo, año por año.
 *
 * Lo que mueve cada fila son dos fuerzas a la vez: lo que cambió la fiscalidad
 * (el neto) y lo que cambió el precio de esa cosa. La nota lo dice, porque
 * atribuirlo todo a los impuestos sería mentir.
 */
export default function EnCosas({ bruto2026, anios, anioA, anioB, onAnioA, onAnioB }) {
  const { opts } = useFiscal();
  const [unidad, setUnidad] = useState('vivienda');
  const [tip, setTip] = useState(null);

  const u = UNIDADES[unidad];

  const serie = useMemo(
    () =>
      AÑOS.map(a => {
        const inf = INFLACION_A_2026[a];
        const n = calcularNomina(bruto2026 / inf, a, opts);
        const netoNominal = n.salarioNeto;      // euros de ese año
        const precio = u.precio(a);             // euros de ese año
        return { anio: a, netoNominal, precio, unidades: netoNominal / precio };
      }),
    [bruto2026, opts, u]
  );

  const primero = serie[0];
  const ultimo = serie[serie.length - 1];
  const filaA = serie.find(s => s.anio === anioA) || primero;
  const filaB = serie.find(s => s.anio === anioB) || ultimo;
  const diferencia = filaB.unidades - filaA.unidades;
  /* La serie entera, no dos filas sueltas: el par elegido va en color y el
     resto de ejercicios queda en gris como contexto. Ver sólo dos años
     obligaba a fiar de la memoria lo que pasó entre medias. */
  const comparadas = serie;
  const cambio = `${diferencia > 0.04 ? '+' : diferencia < -0.04 ? '−' : ''}${dec(Math.abs(diferencia), 1)}`;

  /* Los glifos se cuentan, así que no se encogen: cuando no caben en una
     línea saltan a la siguiente. Un año con muchas unidades ocupa un bloque
     más alto, y el lienzo crece con él en vez de salirse por el margen. */
  const bloques = comparadas.reduce((acc, s2) => {
    const total = Math.ceil(s2.unidades - 0.08);
    const lineas = Math.max(1, Math.ceil(total / PORFILA));
    const y = acc.length ? acc[acc.length - 1].y + acc[acc.length - 1].lineas * LINEA + AIRE : 48;
    acc.push({ s: s2, lineas, y });
    return acc;
  }, []);
  const ultimoBloque = bloques[bloques.length - 1];
  const H = ultimoBloque.y + ultimoBloque.lineas * LINEA + 52;
  const col = i => i % PORFILA;
  const px = i => XG + col(i) * PASO + Math.floor(col(i) / GRUPO) * HUECO;
  const py = (i, y0) => y0 + Math.floor(i / PORFILA) * LINEA;

  return (
    <Figure
      id="18"
      title={`El mismo sueldo daba para ${dec(filaA.unidades, 1)} ${u.enTitulo} en ${filaA.anio} y para ${dec(filaB.unidades, 1)} en ${filaB.anio}`}
      sub={`${eur(bruto2026)} constantes de 2026 · ${u.plural} · ${u.nota}`}
      legend={`Están los ${AÑOS.length} ejercicios · azul = año A, petróleo = año B, gris = el resto · cada figura es ${u.singular === 'm² comprado' ? 'un metro cuadrado' : `${u.singular}`} · van de cinco en cinco para poder contarlas`}
      source={`Fuente · ${unidad === 'smi' ? 'BOE — SMI de cada ejercicio' : PRECIOS_REFERENCIA.fuente} · cálculo propio`}
      note="Cada fila se mueve por dos motivos a la vez: lo que la fiscalidad dejó en tu bolsillo ese año y lo que costaba esa cosa ese año. El sueldo de partida es siempre el mismo en poder adquisitivo general; lo que cambia es el precio relativo de lo que compras. La serie llega hasta 2025 porque es el último ejercicio cerrado con precios publicados."
      summary={`${filaA.anio}: ${dec(filaA.unidades, 1)}; ${filaB.anio}: ${dec(filaB.unidades, 1)}; diferencia: ${dec(diferencia, 1)}.`}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <span className="fs-seg">
          {Object.entries(UNIDADES).map(([k, v]) => (
            <button key={k} type="button" aria-pressed={unidad === k} onClick={() => setUnidad(k)}>
              {v.k}
            </button>
          ))}
        </span>
        <span className="fs-note" style={{ margin: 0 }}>
          ¿Cuántos caben en tu sueldo neto de un año?
        </span>
      </div>

      <YearComparator
        years={anios}
        yearA={anioA}
        yearB={anioB}
        onYearA={onAnioA}
        onYearB={onAnioB}
        note={`Se dibujan todos los años; el par elegido es el que se resalta y se mide arriba. Serie cerrada hasta ${PRECIOS_REFERENCIA.ultimoAnio}.`}
      />

      <div className="fs-readout">
        <span>
          <span className="fs-readout-k" style={{ color: 'var(--counter)' }}>Año A · {filaA.anio}</span>
          <span className="fs-readout-v">{dec(filaA.unidades, 1)} {u.enTitulo}</span>
        </span>
        <span>
          <span className="fs-readout-k" style={{ color: 'var(--signal)' }}>Año B · {filaB.anio}</span>
          <span className="fs-readout-v">{dec(filaB.unidades, 1)} {u.enTitulo}</span>
        </span>
        <span>
          <span className="fs-readout-k">Cambio B − A</span>
          <span className="fs-readout-v fs-signal">{cambio} {u.enTitulo}</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={720} label="El sueldo medido en cosas">
        <Label x={XG} y={22} size={9} color="var(--ink-5)" mono>
          CADA FIGURA = 1 {u.singular.toUpperCase()}
        </Label>
        <Label x={W - 104} y={22} size={8.5} color="var(--ink-5)" anchor="end" mono>
          CUÁNTOS
        </Label>
        <Label x={W - 2} y={22} size={8.5} color="var(--ink-5)" anchor="end" mono>
          PRECIO
        </Label>

        {bloques.map(({ s, y, lineas }) => {
          const enteros = Math.floor(s.unidades);
          const resto = s.unidades - enteros;
          const esA = s.anio === anioA;
          const esB = s.anio === anioB;
          const elegido = esA || esB;
          const colorFila = esA ? 'var(--counter)' : esB ? 'var(--signal)' : 'var(--ink-4)';

          return (
            <g key={s.anio} className="fs-group" opacity={elegido ? 1 : 0.5}>
              <text
                x={X0}
                y={y + 3.5}
                fontSize={10.5}
                fontWeight={elegido ? 800 : 600}
                textAnchor="end"
                fill={colorFila}
                className="fs-t-stamp"
              >
                {s.anio}
              </text>

              {Array.from({ length: enteros }, (_, i) => (
                <Glifo key={i} tipo={u.glifo} x={px(i)} y={py(i, y)} color={colorFila} />
              ))}
              {resto > 0.08 && (
                <Glifo tipo={u.glifo} x={px(enteros)} y={py(enteros, y)} lleno={resto} color={colorFila} />
              )}

              <text
                x={W - 104}
                y={y + 3.5}
                fontSize={elegido ? 12 : 11}
                fontWeight={elegido ? 800 : 600}
                textAnchor="end"
                fill={colorFila}
                className="num"
              >
                {dec(s.unidades, 1)}
              </text>
              <text
                x={W - 2}
                y={y + 3.5}
                fontSize={10}
                textAnchor="end"
                fill="var(--ink-4)"
                className="num"
              >
                {u.precioLabel(s.anio)}
              </text>

              <rect
                className="fs-hit"
                x={0}
                y={y - LINEA / 2}
                width={W}
                height={lineas * LINEA}
                onMouseEnter={() =>
                  setTip({
                    vx: px(Math.max(1, enteros - 1)),
                    vy: py(Math.max(1, enteros - 1), y),
                    title: `${dec(s.unidades, 1)} ${u.singular}s`,
                    sub: `${s.anio} · con tu neto de ese año`,
                    rows: [
                      ['Neto de ese año', eur(s.netoNominal), colorFila],
                      ['Precio', u.precioLabel(s.anio)],
                      [`Frente a ${filaA.anio}`, `${s.unidades >= filaA.unidades ? '+' : '−'}${dec(Math.abs(s.unidades - filaA.unidades), 1)}`],
                    ],
                  })
                }
                onMouseLeave={() => setTip(null)}
              >
                <title>{`${s.anio} — ${dec(s.unidades, 1)} ${u.singular}s`}</title>
              </rect>
            </g>
          );
        })}

        <Label x={XG} y={H - 22} size={9} color="var(--ink-5)" mono>
          ← CADA HUECO SEPARA CINCO · LAS FILAS SALTAN CADA {PORFILA}
        </Label>
      </ChartFrame>
    </Figure>
  );
}
