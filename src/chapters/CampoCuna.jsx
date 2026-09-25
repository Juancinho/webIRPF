import { useMemo, useRef } from 'react';
import { useSteps } from '../hooks/useChapters';
import Figure, { FiguraPie } from '../figures/Figure';
import { Label } from '../figures/marks';
import { round } from '../figures/scale';
import { eur } from '../utils/format';
import { ANCHO_MOVIL, useNarrow } from '../hooks/useNarrow';

const CELDA = 14;
const HUECO = 4;
const S = CELDA + HUECO;
const X0 = 10;
const Y0 = 46;
const SEP = 26;          // aire entre bandas cuando el campo se abre
const H = 300;

const ORDEN = ['ssEmp', 'ssTra', 'irpf', 'neto'];

/** Lo que hay que decir de cada destino, con su cifra dentro. */
const TEXTO = {
  ssEmp: (n, e) =>
    `${n} € de cada cien corresponden a la cotización de la empresa a la Seguridad Social. No forman parte del salario bruto ni aparecen como descuento del trabajador. En este supuesto son ${e} al año.`,
  ssTra: (n, e) =>
    `${n} € corresponden a la cotización del trabajador. Figuran en la nómina como descuento y, en este supuesto, suman ${e} al año.`,
  irpf: (n, e) =>
    `${n} € corresponden a la retención estimada de IRPF. Su importe depende de la renta y de las circunstancias incluidas en el cálculo; la liquidación definitiva se regulariza en la declaración. Aquí son ${e} al año.`,
  neto: (n, e) =>
    `${n} € de cada cien constituyen la renta neta estimada: ${e} al año. La diferencia entre el coste laboral y esta cuantía es la cuña fiscal.`,
};

/**
 * FIG. 19 — CIEN EUROS DE COSTE LABORAL, AL DESPLAZARSE.
 *
 * El mismo campo de cien bloques del que parte el capítulo, pero leído en el
 * tiempo: primero son cien bloques iguales —cien euros que cuesta tu puesto—,
 * después se abren en las cuatro bandas de su reparto y por último se va
 * señalando una a una, con su cifra.
 *
 * La transformación es lo que aporta: no hay cambio de gráfico ni de unidad,
 * son exactamente los mismos cien bloques moviéndose, así que el lector puede
 * seguir cada euro desde el montón inicial hasta su destino. Si el sistema
 * pide menos animación, los bloques saltan a su sitio sin recorrido.
 */
export default function CampoCuna({ grupos, anio, bruto, nomina, vista, setVista, total }) {
  const refs = useRef([]);
  const orden = useMemo(
    () => ORDEN.filter(k => grupos.some(g => g.key === k)).map(k => grupos.find(g => g.key === k)),
    [grupos]
  );
  const paso = useSteps(refs, orden.length + 2);
  // Móvil: diez filas de diez, con los rótulos a la derecha (STORYBOARD_V2).
  const narrow = useNarrow();
  const COLS = narrow ? 10 : 20;
  const W = narrow ? ANCHO_MOVIL : 880;
  const XL = X0 + COLS * S + (narrow ? 14 : 18);

  const abierto = paso >= 1;
  const foco = paso >= 2 ? orden[Math.min(paso - 2, orden.length - 1)] : null;

  /* Cada bloque conoce sus dos sitios: el del montón y el de su banda. */
  const { celdas, bandas, alto } = useMemo(() => {
    const bandas = orden.reduce((acc, g) => {
      const filas = Math.max(1, Math.ceil(g.value / COLS));
      const yTop = acc.length ? acc[acc.length - 1].yTop + Math.max(acc[acc.length - 1].filas * S, narrow ? 34 : 0) + SEP : Y0;
      acc.push({ ...g, filas, yTop });
      return acc;
    }, []);

    const celdas = bandas.flatMap(b =>
      Array.from({ length: b.value }, (_, k) => ({
        key: `${b.key}-${k}`,
        grupo: b.key,
        color: b.color,
        bx: X0 + (k % COLS) * S,
        by: b.yTop + Math.floor(k / COLS) * S,
      }))
    );

    /* El montón inicial: los mismos bloques, uno detrás de otro y centrados
       en el lienzo, para que al abrirse se vea crecer hacia los dos lados. */
    const ultima = bandas[bandas.length - 1];
    const alto = ultima.yTop + ultima.filas * S;
    const filasMonton = Math.ceil(celdas.length / COLS);
    const centro = Math.max(0, (alto - Y0 - filasMonton * S) / 2);
    celdas.forEach((c, i) => {
      c.mx = X0 + (i % COLS) * S;
      c.my = Y0 + centro + Math.floor(i / COLS) * S;
    });

    return { celdas, bandas, alto };
  }, [orden, COLS, narrow]);

  const euros = g => (g.key === 'neto' ? nomina.salarioNeto : g.key === 'irpf' ? nomina.irpfFinal : g.key === 'ssTra' ? nomina.cotTra : nomina.cotEmp);
  const suma = grupos.reduce((a, g) => a + g.value, 0);
  const leyenda19 = `Un bloque = 1 € de cada 100 · ${grupos.map(g => `${g.label} ${g.value}`).join(' + ')} = ${suma}${suma < 100 ? ` · ${100 - suma} € se reparten en el redondeo` : ''}`;
  const fuente19 = 'Fuente · TGSS · AEAT · cálculo propio';

  const titulo = foco
    ? `${foco.value} € de cada 100 · ${foco.label.toLowerCase()}`
    : abierto
      ? 'Los mismos cien euros, repartidos'
      : `Cien euros de ${vista === 'empresa' ? 'coste laboral' : 'salario bruto'}`;

  return (
    <div className="fs-sticky">
      <div className="fs-sticky-fig">
        <Figure
          id="19"
          title={titulo}
          sub={`${anio} · ${vista === 'empresa' ? `sobre el coste laboral total (${eur(nomina.costeLab)})` : `sobre el salario bruto (${eur(bruto)})`} · un bloque = 1 €`}
          legend={leyenda19}
          source={fuente19}
          sinPie={narrow}
          summary={grupos.map(g => `${g.label}: ${g.value} de cada 100`).join('; ')}
        >
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span className="fs-seg">
              <button type="button" aria-pressed={vista === 'trabajador'} onClick={() => setVista('trabajador')}>
                Trabajador
              </button>
              <button type="button" aria-pressed={vista === 'empresa'} onClick={() => setVista('empresa')}>
                Coste empresarial
              </button>
            </span>
          </div>

          <div className="fs-keys fs-keys-night" style={{ marginBottom: 16 }} aria-label="Leyenda de componentes">
            {orden.map(g => (
              <span className="fs-key" key={g.key} style={{ cursor: 'default' }}>
                <span className="fs-key-swatch" style={{ background: g.color }} />
                {g.label}
                <span className="fs-key-v">{g.value} / 100</span>
              </span>
            ))}
          </div>

          <svg className="fs-svg" role="img" aria-label="Cien euros de coste laboral, repartidos por destino" viewBox={`0 0 ${W} ${Math.max(H, alto + 26)}`} style={{ maxHeight: '58vh' }}>
            <Label x={X0} y={26} size={10} weight={800} color="var(--night-ink)" mono>
              {abierto ? 'CADA BLOQUE, EN SU DESTINO' : `100 BLOQUES · 100 € · ${eur(total)}`}
            </Label>

            {celdas.map(c => {
              const apagado = foco && foco.key !== c.grupo;
              return (
                <rect
                  key={c.key}
                  className="fs-celda"
                  width={CELDA}
                  height={CELDA}
                  fill={abierto ? c.color : 'var(--series-steel)'}
                  opacity={apagado ? 0.16 : 1}
                  style={{ transform: `translate(${round(abierto ? c.bx : c.mx)}px, ${round(abierto ? c.by : c.my)}px)` }}
                />
              );
            })}

            {bandas.map(b => {
              const apagado = foco && foco.key !== b.key;
              return (
                <g key={b.key} opacity={abierto ? (apagado ? 0.25 : 1) : 0} style={{ transition: 'opacity .45s ease' }}>
                  <Label x={XL} y={round(b.yTop + 11)} size={11.5} weight={800} color={b.key === 'neto' ? 'var(--night-ink)' : b.color}>
                    {b.label}
                  </Label>
                  {narrow ? (
                    <>
                      <Label x={XL} y={round(b.yTop + 27)} size={10.5} weight={700} color="var(--night-ink)" mono>
                        {b.value} € de cada 100
                      </Label>
                      <Label x={XL} y={round(b.yTop + 42)} size={10.5} color="var(--night-ink)" mono>
                        {eur(euros(b))} al año
                      </Label>
                    </>
                  ) : (
                    <Label x={XL} y={round(b.yTop + 27)} size={11} weight={700} color="var(--night-ink)" mono>
                      {b.value} € de cada 100 · {eur(euros(b))}
                    </Label>
                  )}
                </g>
              );
            })}
          </svg>
        </Figure>
      </div>

      <div>
        <div className="fs-step" ref={el => { refs.current[0] = el; }}>
          <p className="fs-body">
            Cien bloques. Cada uno es <strong>un euro</strong> de los cien que cuesta tu puesto de
            trabajo: no lo que cobras, lo que cuestas. Es la única unidad de este capítulo.
          </p>
        </div>
        <div className="fs-step" ref={el => { refs.current[1] = el; }}>
          <p className="fs-body">
            No todos van al mismo sitio. Los mismos cien bloques, separados por destino: lo que
            llega a tu cuenta y las tres cosas que se quedan por el camino.
          </p>
        </div>
        {orden.map((g, i) => (
          <div key={g.key} className="fs-step" ref={el => { refs.current[i + 2] = el; }}>
            <p className="fs-body">{TEXTO[g.key](g.value, eur(euros(g)))}</p>
          </div>
        ))}
        {narrow && (
          <div className="fs-pie-aparte">
            <FiguraPie legend={leyenda19} source={fuente19} />
          </div>
        )}
      </div>
    </div>
  );
}
