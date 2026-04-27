import React, { useState, useMemo, useDeferredValue } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, ComposedChart, Cell
} from 'recharts';
import {
  ArrowRight, ChevronRight, AlertTriangle, Plus, Minus, Info, Briefcase, User
} from 'lucide-react';

/* =========================================================================
   1. MOTOR FISCAL — DATOS BASE
   ========================================================================= */

const IPC_ANUAL_DIC = {
  2013: 0.003, 2014: -0.010, 2015: 0.000, 2016: 0.016, 2017: 0.011,
  2018: 0.012, 2019: 0.008, 2020: -0.005, 2021: 0.065, 2022: 0.057,
  2023: 0.031, 2024: 0.028, 2025: 0.029, 2026: 0.030,
};

const inflacionAcumulada = (anioBase, anioDestino = 2026) => {
  if (anioBase === anioDestino) return 1.0;
  let m = 1.0;
  for (let a = anioBase + 1; a <= anioDestino; a++) m *= (1 + IPC_ANUAL_DIC[a]);
  return m;
};

const BASES_MAX = {
  2012: 39150.0, 2013: 41108.4, 2014: 43164.0, 2015: 43272.0, 2016: 43704.0,
  2017: 45014.4, 2018: 45014.4, 2019: 48841.2, 2020: 48841.2, 2021: 48841.2,
  2022: 49672.8, 2023: 53946.0, 2024: 56646.0, 2025: 58914.0, 2026: 61214.4,
};

const MIN_EXENTO = {
  2012: 11162, 2013: 11162, 2014: 11162, 2015: 12000, 2016: 12000, 2017: 12000,
  2018: 12643, 2019: 14000, 2020: 14000, 2021: 14000, 2022: 14000, 2023: 15000,
  2024: 15876, 2025: 15876, 2026: 15876,
};

const SS_TIPOS = {
  comunes: [0.236, 0.047],
  desempleo: [0.055, 0.0155],
  fogasa: [0.002, 0.0],
  fp: [0.006, 0.001],
  atep: [0.015, 0.0],
};

const getMEI = (anio) => {
  if (anio === 2023) return [0.005, 0.001];
  if (anio === 2024) return [0.0058, 0.0012];
  if (anio === 2025) return [0.0067, 0.0013];
  if (anio >= 2026) return [0.0075, 0.0015];
  return [0, 0];
};

const getSolidaridad = (anio) => {
  if (anio === 2025) return [[1.10, 0.0092], [1.50, 0.0100], [Infinity, 0.0117]];
  if (anio >= 2026) return [[1.10, 0.0115], [1.50, 0.0125], [Infinity, 0.0146]];
  return [];
};

/* =========================================================================
   2. ESCALAS IRPF: ESTATAL (HISTÓRICA) + AUTONÓMICA (DESDE 2024)
   ========================================================================= */

// Para cada CCAA con régimen común damos la ESCALA COMBINADA (estatal + autonómica)
// vigente para 2024+. Pre-2024: se usa la escala estándar histórica.
// Datos: BOE, leyes autonómicas de medidas tributarias, ejercicios 2024-2026.
const REGIONES = {
  default: {
    name: 'Estándar / Resto',
    desc: 'Aragón, Asturias, Baleares, Cantabria, Castilla-La Mancha, Castilla y León, Extremadura, Galicia, La Rioja, Murcia, Canarias, Ceuta y Melilla. Diferencias menores entre ellas; aquí se usa la escala promedio.',
    tramos2024: null, // usa la base histórica
  },
  madrid: {
    name: 'C. de Madrid',
    desc: 'Tras la rebaja de 2023-2024 (Ley 4/2024), Madrid es la CCAA con la fiscalidad más baja del régimen común.',
    // Combinado aprox. Madrid 2024+
    tramos2024: [[12450, 0.18], [17707, 0.215], [33007, 0.27], [53407, 0.355], [60000, 0.405], [300000, 0.435], [Infinity, 0.455]],
  },
  cataluna: {
    name: 'Cataluña',
    desc: 'Cataluña tiene el tipo marginal máximo más alto (50%) y más tramos que cualquier otra CCAA.',
    tramos2024: [[12450, 0.215], [17707, 0.24], [21000, 0.265], [33007, 0.295], [53407, 0.35], [90000, 0.415], [120000, 0.45], [175000, 0.47], [Infinity, 0.50]],
  },
  valencia: {
    name: 'C. Valenciana',
    desc: 'Tipos elevados en tramos altos (hasta 54%). Pequeñas rebajas en tramos bajos desde 2023.',
    tramos2024: [[12450, 0.195], [20200, 0.24], [35200, 0.30], [60000, 0.37], [120000, 0.455], [175000, 0.475], [Infinity, 0.54]],
  },
  andalucia: {
    name: 'Andalucía',
    desc: 'Tras la rebaja de 2023, Andalucía bajó significativamente sus tipos hasta situarse entre las más competitivas.',
    tramos2024: [[12450, 0.185], [20200, 0.235], [28000, 0.295], [35200, 0.305], [60000, 0.365], [300000, 0.435], [Infinity, 0.455]],
  },
  foral: {
    name: 'País Vasco / Navarra',
    desc: 'Régimen foral propio (Concierto Económico/Convenio). Sus IRPF se calculan con escalas y deducciones distintas no modeladas aquí.',
    tramos2024: null,
    foral: true,
  },
};

const getTramosBase = (anio) => {
  if (anio <= 2014) return [[17707, 0.2475], [33007, 0.30], [53407, 0.40], [120000, 0.47], [175000, 0.49], [300000, 0.51], [Infinity, 0.52]];
  if (anio === 2015) return [[12450, 0.195], [20200, 0.245], [34000, 0.305], [60000, 0.38], [Infinity, 0.46]];
  if (anio >= 2016 && anio <= 2020) return [[12450, 0.19], [20200, 0.24], [35200, 0.30], [60000, 0.37], [Infinity, 0.45]];
  return [[12450, 0.19], [20200, 0.24], [35200, 0.30], [60000, 0.37], [300000, 0.45], [Infinity, 0.47]];
};

const getTramos = (anio, ccaa = 'default') => {
  // Pre-2024: no se modela diferencia regional (la divergencia era menor)
  if (anio < 2024) return getTramosBase(anio);
  const reg = REGIONES[ccaa];
  if (reg && reg.tramos2024) return reg.tramos2024;
  return getTramosBase(anio);
};

/* =========================================================================
   3. REDUCCIÓN ART. 20 Y DEDUCCIÓN SMI
   ========================================================================= */

const reduccionTrabajo = (anio, rn) => {
  if (anio <= 2014) {
    if (rn <= 9180) return 4080;
    if (rn <= 13260) return 4080 - 0.35 * (rn - 9180);
    return 2652;
  }
  if (anio >= 2015 && anio <= 2017) {
    if (rn <= 11250) return 3700;
    if (rn <= 14450) return 3700 - 1.15625 * (rn - 11250);
    return 0;
  }
  // 2018: Ley 6/2018 (PGE) amplió la reducción art. 20 con efecto retroactivo
  // a 1 de enero de 2018. El "régimen transitorio" solo afectó al sistema
  // de retenciones (no podían recalcularse las nóminas ya emitidas), pero la
  // declaración anual del IRPF 2018 se hizo con el régimen post completo.
  // Por eso 2018 usa los mismos umbrales que 2019-2022.
  if (anio >= 2018 && anio <= 2022) {
    if (rn <= 13115) return 5565;
    if (rn <= 16825) return Math.max(0, 5565 - 1.5 * (rn - 13115));
    return 0;
  }
  if (anio === 2023) {
    if (rn <= 14047.5) return 6498;
    if (rn <= 19747.5) return Math.max(0, 6498 - 1.14 * (rn - 14047.5));
    return 0;
  }
  if (rn <= 14852) return 7302;
  if (rn <= 17673.52) return 7302 - 1.75 * (rn - 14852);
  if (rn <= 19747.5) return 2364.34 - 1.14 * (rn - 17673.52);
  return 0;
};

const deduccionSMI = (anio, bruto) => {
  if (anio === 2026) {
    if (bruto <= 17094) return 590.89;
    return Math.max(0, 590.89 - 0.20 * (bruto - 17094));
  }
  if (anio === 2025) {
    if (bruto <= 16576) return 340;
    if (bruto <= 18276) return Math.max(0, 340 - 0.20 * (bruto - 16576));
  }
  return 0;
};

/* =========================================================================
   4. MÍNIMOS PERSONALES Y FAMILIARES (LIRPF arts. 56-61)
   Aplicables desde 2015. Para 2012-2014 los importes eran ligeramente menores
   pero se aplica esta misma tabla (simplificación).
   ========================================================================= */

// Por descendientes: 1º, 2º, 3º, 4º, 5º+
const VALORES_HIJOS = [2400, 2700, 4000, 4500, 4500];
const BONO_HIJO_MENOR_3 = 2800;
// Por ascendientes (>65 con renta <8.000€)
const VALOR_ASCENDIENTE = 1150;
// Reducción base imponible por tributación conjunta (cónyuge sin renta)
const REDUCCION_CONJUNTA = 3400;

const calcularMinimoFamiliar = (opts) => {
  const { nHijos = 0, nHijosMenores3 = 0, nAscendientes = 0 } = opts;
  let m = 0;
  for (let i = 0; i < nHijos; i++) {
    m += VALORES_HIJOS[Math.min(i, VALORES_HIJOS.length - 1)];
  }
  m += Math.min(nHijosMenores3, nHijos) * BONO_HIJO_MENOR_3;
  m += nAscendientes * VALOR_ASCENDIENTE;
  return m;
};

const aplicarEscala = (base, tramos) => {
  let cuota = 0;
  let limAnt = 0;
  for (const [lim, tipo] of tramos) {
    if (base > lim) {
      cuota += (lim - limAnt) * tipo;
      limAnt = lim;
    } else {
      cuota += (base - limAnt) * tipo;
      return cuota;
    }
  }
  return cuota;
};

/* =========================================================================
   5. RÉGIMEN AUTÓNOMO: COTIZACIÓN POR TRAMOS DE INGRESO (2023+)
   Anteriormente cotización a base elegida. Aquí simplificamos al mínimo.
   Tabla aproximada del nuevo sistema (RD-ley 13/2022 y RD 322/2024).
   ========================================================================= */

// [tope rendimiento mensual, base mínima cotización mensual]
const SS_AUTONOMO_TABLA_2023 = [
  [670, 735.29], [900, 816.99], [1166.7, 872.55], [1300, 950.98],
  [1500, 960.78], [1700, 960.78], [1850, 1143.79], [2030, 1209.15],
  [2330, 1274.51], [2760, 1356.21], [3190, 1437.91], [3620, 1519.61],
  [4050, 1601.31], [6000, 1732.03], [Infinity, 1928.10],
];

const tipoAutonomoCombinado = (anio) => {
  // Contingencias comunes + profesionales + cese + FP + MEI (autónomo paga el total)
  if (anio >= 2026) return 0.315;
  if (anio === 2025) return 0.313;
  if (anio === 2024) return 0.3118;
  if (anio === 2023) return 0.3110;
  return 0.298; // pre-2023: aprox. 29,8% (régimen viejo, base mínima)
};

const calcularSSAutonomo = (rendimientoNetoAnual, anio) => {
  const tipo = tipoAutonomoCombinado(anio);
  if (anio < 2023) {
    // Sistema antiguo: cuota fija a base mínima (lo que elegía el 80% de autónomos)
    const baseMensual = anio <= 2014 ? 858.6 : (anio <= 2017 ? 893.10 : (anio <= 2020 ? 944.40 : 960.60));
    return baseMensual * 12 * tipo;
  }
  // 2023+: por tramos según rendimiento neto real
  const monthly = Math.max(0, rendimientoNetoAnual) / 12;
  let baseMin = SS_AUTONOMO_TABLA_2023[SS_AUTONOMO_TABLA_2023.length - 1][1];
  for (const [topeMensual, base] of SS_AUTONOMO_TABLA_2023) {
    if (monthly < topeMensual) { baseMin = base; break; }
  }
  return baseMin * 12 * tipo;
};

/* =========================================================================
   6. CALCULADORA PRINCIPAL — Con régimen, CCAA, familia, tributación
   ========================================================================= */

const DEFAULT_OPTS = {
  regimen: 'asalariado',         // 'asalariado' | 'autonomo'
  ccaa: 'default',               // ver REGIONES
  tributacion: 'individual',     // 'individual' | 'conjunta'
  nHijos: 0,
  nHijosMenores3: 0,
  nAscendientes: 0,
};

const calcularNomina = (bruto, anio, opts = {}) => {
  const o = { ...DEFAULT_OPTS, ...opts };
  const tramos = getTramos(anio, o.ccaa);
  const minExento = MIN_EXENTO[anio];
  const minFamiliar = calcularMinimoFamiliar(o);
  const minPersonal = anio <= 2014 ? 5151 : 5550;
  const minPersonalYFamiliar = minPersonal + minFamiliar;

  // === RAMA: AUTÓNOMO ===
  if (o.regimen === 'autonomo') {
    const cotTra = calcularSSAutonomo(bruto, anio);
    const cotEmp = 0; // No hay empresa
    const costeLab = bruto;
    const rnPrevio = bruto - cotTra;
    // Gastos de difícil justificación (estimación directa simplificada): 5% del rend. neto previo, máx 2.000€
    const gastos = anio >= 2018 ? Math.min(rnPrevio * 0.05, 2000) : 0;
    const red20 = 0; // No aplica art. 20 a autónomos
    let baseImp = Math.max(0, rnPrevio - gastos - red20);
    if (o.tributacion === 'conjunta') baseImp = Math.max(0, baseImp - REDUCCION_CONJUNTA);

    const qIntegra = aplicarEscala(baseImp, tramos);
    const cuotaMinPyF = aplicarEscala(minPersonalYFamiliar, tramos);
    const qLiquida = Math.max(0, qIntegra - cuotaMinPyF);
    const irpf = qLiquida; // Sin retención mensual (pagos fraccionados modelo 130)
    const neto = bruto - cotTra - irpf;

    // Detalle de tramos para visualización
    let limAnt = 0;
    const tramosDet = [];
    for (const [lim, tipo] of tramos) {
      if (baseImp > lim) {
        tramosDet.push({ desde: limAnt, hasta: lim, tipo, base: lim - limAnt, cuota: (lim - limAnt) * tipo });
        limAnt = lim;
      } else {
        if (baseImp - limAnt > 0) tramosDet.push({ desde: limAnt, hasta: baseImp, tipo, base: baseImp - limAnt, cuota: (baseImp - limAnt) * tipo });
        break;
      }
    }
    let tipoMarg = tramos[0][1];
    for (const [lim, tipo] of tramos) { if (baseImp <= lim) { tipoMarg = tipo; break; } tipoMarg = tipo; }

    return {
      bruto, baseCot: 0, excBase: 0, cotEmp, cotTra, costeLab,
      rnPrevio, gastos, red20, baseImp, reduccionConjunta: o.tributacion === 'conjunta' ? REDUCCION_CONJUNTA : 0,
      tramos: tramosDet, qIntegra, qMin: cuotaMinPyF, minPersonalYFamiliar, qTeorica: qLiquida,
      dSMI: 0, qSMI: qLiquida, limRet: Infinity, irpf, neto,
      tTra: tipoAutonomoCombinado(anio), tEmp: 0, baseMax: BASES_MAX[anio],
      gastosFijos: gastos, irpfMin: minPersonal, minExento, regimen: 'autonomo',
      tipoMargIRPF: tipoMarg,
      tipoEfIRPF: bruto > 0 ? (irpf / bruto) * 100 : 0,
      tipoEfSS: bruto > 0 ? (cotTra / bruto) * 100 : 0,
      cunaFiscal: bruto > 0 ? ((bruto - neto) / bruto) * 100 : 0,
    };
  }

  // === RAMA: ASALARIADO ===
  const baseMax = BASES_MAX[anio];
  const baseCot = Math.min(bruto, baseMax);
  const excBase = Math.max(0, bruto - baseMax);
  const mei = getMEI(anio);
  const sol = getSolidaridad(anio);
  const gastos = anio <= 2014 ? 0 : 2000;
  const irpfMinTope = anio <= 2014 ? 5151 : 5550;

  const tEmp = Object.values(SS_TIPOS).reduce((s, x) => s + x[0], 0) + mei[0];
  const tTra = Object.values(SS_TIPOS).reduce((s, x) => s + x[1], 0) + mei[1];

  let cotEmp = baseCot * tEmp;
  let cotTra = baseCot * tTra;

  if (sol.length > 0 && excBase > 0) {
    const l1 = baseMax * 0.10;
    const l2 = baseMax * 0.50;
    const e1 = Math.min(excBase, l1);
    const e2 = Math.min(Math.max(0, excBase - l1), l2 - l1);
    const e3 = Math.max(0, excBase - l2);
    const qSol = e1 * sol[0][1] + e2 * sol[1][1] + e3 * sol[2][1];
    cotEmp += qSol * (5 / 6);
    cotTra += qSol * (1 / 6);
  }

  const costeLab = bruto + cotEmp;
  const rnPrevio = bruto - cotTra;
  const red20 = reduccionTrabajo(anio, rnPrevio);
  let baseImp = Math.max(0, rnPrevio - gastos - red20);
  const reduccionConjunta = o.tributacion === 'conjunta' ? Math.min(REDUCCION_CONJUNTA, baseImp) : 0;
  baseImp = baseImp - reduccionConjunta;

  // Cuota íntegra sobre la base liquidable
  const qIntegra = aplicarEscala(baseImp, tramos);

  // Cuota correspondiente al mínimo personal y familiar (escalado)
  const cuotaMinPyF = aplicarEscala(minPersonalYFamiliar, tramos);

  // Detalle de tramos
  let limAnt = 0;
  const tramosDet = [];
  for (const [lim, tipo] of tramos) {
    if (baseImp > lim) {
      tramosDet.push({ desde: limAnt, hasta: lim, tipo, base: lim - limAnt, cuota: (lim - limAnt) * tipo });
      limAnt = lim;
    } else {
      if (baseImp - limAnt > 0) tramosDet.push({ desde: limAnt, hasta: baseImp, tipo, base: baseImp - limAnt, cuota: (baseImp - limAnt) * tipo });
      break;
    }
  }

  const qTeorica = Math.max(0, qIntegra - cuotaMinPyF);
  const dSMI = deduccionSMI(anio, bruto);
  const qSMI = Math.max(0, qTeorica - dSMI);
  const limRet = Math.max(0, (bruto - minExento) * 0.43);
  const irpf = Math.min(qSMI, limRet);
  const neto = bruto - cotTra - irpf;

  let tipoMarg = tramos[0][1];
  for (const [lim, tipo] of tramos) { if (baseImp <= lim) { tipoMarg = tipo; break; } tipoMarg = tipo; }

  return {
    bruto, baseCot, excBase, cotEmp, cotTra, costeLab,
    rnPrevio, gastos, red20, baseImp, reduccionConjunta,
    tramos: tramosDet, qIntegra, qMin: cuotaMinPyF, minPersonalYFamiliar, qTeorica,
    dSMI, qSMI, limRet, irpf, neto,
    tTra, tEmp, baseMax, gastosFijos: gastos, irpfMin: irpfMinTope, minExento,
    regimen: 'asalariado',
    tipoMargIRPF: tipoMarg,
    tipoEfIRPF: bruto > 0 ? (irpf / bruto) * 100 : 0,
    tipoEfSS: bruto > 0 ? (cotTra / bruto) * 100 : 0,
    cunaFiscal: costeLab > 0 ? ((costeLab - neto) / costeLab) * 100 : 0,
  };
};

const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);

/* =========================================================================
   DISTRIBUCIÓN SALARIAL DE ESPAÑA — Percentiles anuales
   --------------------------------------------------------------------------
   Fuentes: INE Encuesta Anual de Estructura Salarial (EAES) y Encuesta de
   Estructura Salarial cuatrienal (EES, años 2014, 2018 y 2022). Los valores
   son ganancia bruta anual de asalariados a tiempo completo, en € corrientes
   de cada ejercicio.

   Los años 2024-2026 son ESTIMACIONES proyectadas a partir de la EAES 2023
   aplicando IPC + crecimiento real estimado (~1% sobre IPC).

   ⚠ DATOS DE TRABAJO. Para una versión definitiva conviene contrastar con la
   serie completa publicada en INE → Mercado laboral → Salarios → EAES.
   ========================================================================= */
const DISTRIBUCION_SALARIAL = {
  // Año:  P10,    P25,    P50 (mediana), P75,   P90,   media,  fuente
  2012: { p10: 8390,  p25: 13420, p50: 19041, p75: 27780, p90: 41420, media: 22726, src: 'INE EAES 2012' },
  2013: { p10: 8451,  p25: 13491, p50: 19029, p75: 27520, p90: 41450, media: 22697, src: 'INE EAES 2013' },
  2014: { p10: 8530,  p25: 13578, p50: 19263, p75: 28012, p90: 42180, media: 22858, src: 'INE EES 2014 (cuatrienal)' },
  2015: { p10: 8740,  p25: 13743, p50: 19467, p75: 28266, p90: 42420, media: 23106, src: 'INE EAES 2015' },
  2016: { p10: 8843,  p25: 13750, p50: 19432, p75: 28419, p90: 42760, media: 23156, src: 'INE EAES 2016' },
  2017: { p10: 8980,  p25: 13988, p50: 19830, p75: 29020, p90: 43500, media: 23646, src: 'INE EAES 2017' },
  2018: { p10: 8890,  p25: 14114, p50: 19469, p75: 28659, p90: 42659, media: 24009, src: 'INE EES 2018 (cuatrienal)' },
  2019: { p10: 10250, p25: 14710, p50: 20680, p75: 30450, p90: 45800, media: 24395, src: 'INE EAES 2019' },
  2020: { p10: 10510, p25: 14750, p50: 20920, p75: 30650, p90: 46100, media: 25165, src: 'INE EAES 2020' },
  2021: { p10: 10920, p25: 15240, p50: 21500, p75: 31500, p90: 47000, media: 25896, src: 'INE EAES 2021' },
  2022: { p10: 11345, p25: 15876, p50: 22166, p75: 32622, p90: 48575, media: 26948, src: 'INE EES 2022 (cuatrienal)' },
  2023: { p10: 12060, p25: 16908, p50: 23349, p75: 34236, p90: 51030, media: 28050, src: 'INE EAES 2023 (definitivo)' },
  // Estimaciones proyectadas con IPC + ~0.5% crecimiento real (la realidad reciente)
  2024: { p10: 12500, p25: 17480, p50: 24130, p75: 35400, p90: 52800, media: 29010, src: 'Proyección IPC + 0.5% real' },
  2025: { p10: 12890, p25: 18030, p50: 24890, p75: 36510, p90: 54470, media: 29920, src: 'Proyección IPC + 0.5% real' },
  2026: { p10: 13290, p25: 18590, p50: 25670, p75: 37650, p90: 56170, media: 30850, src: 'Proyección IPC + 0.5% real' },
};

// Percentil al que corresponde un salario dado en un año concreto.
// Interpolación lineal entre los puntos conocidos de la EAES.
const percentilDe = (salario, anio) => {
  const d = DISTRIBUCION_SALARIAL[anio];
  if (!d || salario <= 0) return 0;
  // Tabla [salario, percentil] - extendemos los extremos linealmente
  const puntos = [
    [0, 0],
    [d.p10, 10],
    [d.p25, 25],
    [d.p50, 50],
    [d.p75, 75],
    [d.p90, 90],
    [d.p90 * 1.7, 95],
    [d.p90 * 3.0, 99],
    [d.p90 * 6.0, 99.9],
  ];
  for (let i = 0; i < puntos.length - 1; i++) {
    const [s0, p0] = puntos[i];
    const [s1, p1] = puntos[i + 1];
    if (salario >= s0 && salario <= s1) {
      return p0 + ((salario - s0) / (s1 - s0)) * (p1 - p0);
    }
  }
  return 99.9;
};

// Densidad log-normal calibrada con mediana y media reales — para dibujar la
// "campana" de la distribución salarial. La distribución salarial española
// no es exactamente log-normal (cola superior más gruesa), pero sirve como
// aproximación divulgativa del bulto principal (P10-P90).
const densidadLogNormal = (salario, anio) => {
  const d = DISTRIBUCION_SALARIAL[anio];
  if (!d || salario <= 0) return 0;
  const mu = Math.log(d.p50);
  const ratio = d.media / d.p50;
  if (ratio <= 1) return 0;
  const sigma = Math.sqrt(2 * Math.log(ratio));
  const x = Math.log(salario);
  return (1 / (salario * sigma * Math.sqrt(2 * Math.PI))) *
         Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
};

const fmtEUR = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

/* =========================================================================
   CUÑA FISCAL OCDE — Taxing Wages 2026 (datos referidos a 2025)
   --------------------------------------------------------------------------
   Trabajador soltero sin hijos al salario medio nacional. Desglose:
   IRPF + cot. trabajador + cot. empresa = cuña fiscal total.
   Fuente: OCDE, "Taxing Wages 2026", abril 2026.
   ========================================================================= */
const CUNA_OCDE_2025 = [
  // pais, codigo, total, irpf, cot_trab, cot_emp, neto_pct, color, esp?
  { pais: 'Bélgica',    code: 'BE', total: 52.5, irpf: 21.0, cotTrab: 11.0, cotEmp: 20.5, color: '#5c0f1c' },
  { pais: 'Alemania',   code: 'DE', total: 49.3, irpf: 16.0, cotTrab: 17.7, cotEmp: 15.6, color: '#73182a' },
  { pais: 'Francia',    code: 'FR', total: 47.2, irpf: 13.2, cotTrab:  9.2, cotEmp: 24.8, color: '#8b1e2c' },
  { pais: 'Austria',    code: 'AT', total: 47.1, irpf: 12.8, cotTrab: 14.0, cotEmp: 20.3, color: '#a52030' },
  { pais: 'Italia',     code: 'IT', total: 45.8, irpf: 16.7, cotTrab:  7.2, cotEmp: 21.9, color: '#b8891f' },
  { pais: 'España',     code: 'ES', total: 41.4, irpf: 13.1, cotTrab:  4.9, cotEmp: 23.4, color: '#8b1e2c', esp: true },
  { pais: 'Grecia',     code: 'GR', total: 38.0, irpf: 10.2, cotTrab: 13.7, cotEmp: 14.1, color: '#5c6b3e' },
  { pais: 'Portugal',   code: 'PT', total: 36.8, irpf: 14.6, cotTrab: 11.0, cotEmp: 11.2, color: '#7a8753' },
  { pais: 'Media OCDE', code: 'OECD', total: 35.1, irpf: 13.4, cotTrab:  8.2, cotEmp: 13.5, color: '#3d4a5c', media: true },
  { pais: 'Países Bajos', code: 'NL', total: 35.0, irpf: 18.4, cotTrab:  9.7, cotEmp:  6.9, color: '#557090' },
  { pais: 'Reino Unido', code: 'UK', total: 33.7, irpf: 14.2, cotTrab:  7.6, cotEmp: 11.9, color: '#2d6e4a' },
  { pais: 'Estados Unidos', code: 'US', total: 30.0, irpf: 14.4, cotTrab:  7.7, cotEmp:  7.9, color: '#1f6e6e' },
  { pais: 'Irlanda',    code: 'IE', total: 29.9, irpf: 17.7, cotTrab:  4.0, cotEmp:  8.2, color: '#286b80' },
  { pais: 'Suiza',      code: 'CH', total: 22.9, irpf: 11.1, cotTrab:  6.3, cotEmp:  5.5, color: '#3a5d8c' },
  { pais: 'Nueva Zelanda', code: 'NZ', total: 20.8, irpf: 20.8, cotTrab:  0.0, cotEmp:  0.0, color: '#5240a0' },
  { pais: 'México',     code: 'MX', total: 21.7, irpf:  4.7, cotTrab:  1.3, cotEmp: 15.7, color: '#7a3a8e' },
  { pais: 'Chile',      code: 'CL', total:  7.5, irpf:  0.0, cotTrab:  7.0, cotEmp:  0.5, color: '#9c2d7e' },
];

/* =========================================================================
   DEUDA PÚBLICA DE ESPAÑA — Banco de España (PDE) y proyecciones
   --------------------------------------------------------------------------
   Cifras en € totales (no per cápita), % PIB. Población residente del INE.
   ========================================================================= */
const DEUDA_ESPANA = {
  // año: { totalMM (miles de millones €), pctPIB, poblacion (millones), perCapita }
  2012: { totalMM:  890, pctPIB:  85.7, poblacion: 46.82, perCapita: 19012 },
  2013: { totalMM:  979, pctPIB:  95.5, poblacion: 46.62, perCapita: 21001 },
  2014: { totalMM: 1041, pctPIB: 100.4, poblacion: 46.46, perCapita: 22408 },
  2015: { totalMM: 1073, pctPIB:  99.3, poblacion: 46.45, perCapita: 23101 },
  2016: { totalMM: 1107, pctPIB:  99.2, poblacion: 46.44, perCapita: 23838 },
  2017: { totalMM: 1145, pctPIB:  98.6, poblacion: 46.53, perCapita: 24607 },
  2018: { totalMM: 1173, pctPIB:  97.6, poblacion: 46.66, perCapita: 25140 },
  2019: { totalMM: 1188, pctPIB:  98.2, poblacion: 47.13, perCapita: 25207 },
  2020: { totalMM: 1346, pctPIB: 120.4, poblacion: 47.45, perCapita: 28367 },
  2021: { totalMM: 1428, pctPIB: 116.8, poblacion: 47.42, perCapita: 30115 },
  2022: { totalMM: 1505, pctPIB: 111.6, poblacion: 47.61, perCapita: 31618 },
  2023: { totalMM: 1574, pctPIB: 105.1, poblacion: 48.09, perCapita: 32731 },
  2024: { totalMM: 1622, pctPIB: 102.3, poblacion: 48.85, perCapita: 33203 },
  2025: { totalMM: 1698, pctPIB: 100.7, poblacion: 49.57, perCapita: 34259 },
  2026: { totalMM: 1735, pctPIB:  99.7, poblacion: 50.05, perCapita: 34664 },
};

const fmtEUR2 = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtPct = (n) => `${n.toFixed(2)}%`;
const fmtPct1 = (n) => `${n.toFixed(1)}%`;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

/* =========================================================================
   ESTILOS GLOBALES
   ========================================================================= */

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
      --paper: #f5f1e8; --paper-dark: #ebe5d6; --ink: #1a1613;
      --ink-soft: #4a4038; --ink-faded: #8a7d70; --rule: #2a211a;
      --crimson: #8b1e2c; --crimson-deep: #5c0f1c; --ochre: #b8891f;
      --olive: #5c6b3e; --slate: #3d4a5c; --success: #2d5a3d;
    }
    * { box-sizing: border-box; min-width: 0; }
    html, body { margin: 0; padding: 0; max-width: 100%; overflow-x: hidden; }
    .app-root {
      background: var(--paper); color: var(--ink);
      font-family: 'Inter Tight', system-ui, sans-serif;
      min-height: 100vh; -webkit-font-smoothing: antialiased;
      width: 100%; max-width: 100vw; overflow-x: hidden;
    }
    img, svg, video { max-width: 100%; height: auto; }
    .serif { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    .num { font-variant-numeric: tabular-nums; }

    .display-xl { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(2rem, 7vw, 6.5rem); line-height: 0.96; letter-spacing: -0.03em; word-wrap: break-word; }
    .display-lg { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.7rem, 4.5vw, 3.8rem); line-height: 1.05; letter-spacing: -0.02em; word-wrap: break-word; }
    .display-md { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.25rem, 2.6vw, 2.4rem); line-height: 1.15; letter-spacing: -0.02em; }
    .eyebrow { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--crimson); }
    .rule-thick { border-top: 3px solid var(--rule); }
    .rule-thin { border-top: 1px solid var(--rule); }

    .tab-nav { position: sticky; top: 0; z-index: 50; background: var(--paper); border-bottom: 2px solid var(--rule); }
    .tab-nav-inner { max-width: 1400px; margin: 0 auto; padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
    .brand-block { display: flex; align-items: center; gap: 0.7rem; padding: 0.7rem 0; flex-shrink: 0; }
    .tabs-wrapper { display: flex; overflow-x: auto; scrollbar-width: none; flex: 1; justify-content: flex-end; }
    .tabs-wrapper::-webkit-scrollbar { display: none; }
    .tab-btn { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; padding: 1rem 0.7rem; border: none; background: transparent; color: var(--ink-soft); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; white-space: nowrap; flex-shrink: 0; }
    .tab-btn:hover { color: var(--ink); }
    .tab-btn.active { color: var(--crimson); border-bottom-color: var(--crimson); }

    .section-wrap { max-width: 1400px; margin: 0 auto; padding: 2rem 1rem 3rem; width: 100%; }
    .section-wrap-narrow { max-width: 900px; margin: 0 auto; padding: 2rem 1rem 3rem; width: 100%; }

    .grid-auto-fit { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 1rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .grid-calc { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
    .grid-control { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; align-items: center; }

    .card { background: var(--paper); border: 1.5px solid var(--rule); padding: 1.25rem; max-width: 100%; overflow: hidden; }
    .card-deep { background: var(--ink); color: var(--paper); padding: 1.5rem; border: none; max-width: 100%; overflow: hidden; }
    .card-deep .eyebrow { color: var(--ochre); }

    .metric-value { font-family: 'Fraunces', Georgia, serif; font-variant-numeric: tabular-nums; font-weight: 500; font-size: clamp(1.4rem, 3vw, 2.2rem); line-height: 1.05; letter-spacing: -0.02em; }
    .metric-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faded); margin-bottom: 0.3rem; }

    .input-big { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.6rem, 5vw, 2.6rem); font-weight: 500; padding: 0.4rem 0.6rem 0.4rem 0; background: var(--paper); border: none; border-bottom: 2px solid var(--rule); width: 100%; color: var(--ink); -webkit-appearance: none; -moz-appearance: textfield; }
    .input-big::-webkit-outer-spin-button, .input-big::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .input-big:focus { outline: none; border-bottom-color: var(--crimson); }

    input[type="range"].slider-ink { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: var(--ink); outline: none; touch-action: pan-x; }
    input[type="range"].slider-ink::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: var(--crimson); border: 3px solid var(--paper); border-radius: 50%; cursor: pointer; box-shadow: 0 0 0 1px var(--ink); }
    input[type="range"].slider-ink::-moz-range-thumb { width: 24px; height: 24px; background: var(--crimson); border: 3px solid var(--paper); border-radius: 50%; cursor: pointer; box-shadow: 0 0 0 1px var(--ink); }

    .chip { display: inline-block; padding: 0.3rem 0.65rem; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 500; background: var(--paper-dark); border: 1px solid var(--rule); white-space: nowrap; }
    .chip-crimson { background: var(--crimson); color: var(--paper); border-color: var(--crimson); }

    .table-scroll { width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .tbl { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: max-content; }
    .tbl th { text-align: left; font-weight: 600; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faded); padding: 0.6rem 0.5rem; border-bottom: 2px solid var(--rule); white-space: nowrap; }
    .tbl td { padding: 0.6rem 0.5rem; border-bottom: 1px solid var(--paper-dark); font-variant-numeric: tabular-nums; white-space: nowrap; }

    .drop-cap::first-letter { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 4em; float: left; line-height: 0.85; padding: 0.08em 0.1em 0 0; color: var(--crimson); }

    .divider-fancy { display: flex; align-items: center; gap: 1rem; color: var(--ink-faded); margin: 2rem 0; }
    .divider-fancy::before, .divider-fancy::after { content: ''; flex: 1; height: 1px; background: var(--rule); }

    .bar-stack { display: flex; height: 38px; width: 100%; border: 1.5px solid var(--rule); font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 600; overflow: hidden; }
    .bar-stack > div { display: flex; align-items: center; justify-content: center; color: var(--paper); padding: 0 0.25rem; white-space: nowrap; overflow: hidden; min-width: 0; }

    .flag-warn { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 600; color: var(--crimson); padding: 0.35rem 0.7rem; background: rgba(139,30,44,0.08); border-left: 3px solid var(--crimson); }
    .flag-info { display: inline-flex; align-items: flex-start; gap: 0.4rem; font-size: 0.78rem; color: var(--ink-soft); padding: 0.5rem 0.7rem; background: var(--paper-dark); border-left: 3px solid var(--slate); line-height: 1.4; }

    .year-grid-15 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; max-width: 100%; }
    .year-btn { padding: 0.55rem 0; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 500; background: transparent; color: var(--ink); border: 1px solid var(--rule); cursor: pointer; }
    .year-btn.active { background: var(--ink); color: var(--paper); }
    .year-btn.active-crimson { background: var(--crimson); color: var(--paper); border-color: var(--crimson); }

    /* ===== CONFIG PANEL ===== */
    .config-block { padding: 1rem 0; border-top: 1px solid var(--rule); }
    .config-block:first-of-type { border-top: none; padding-top: 0.5rem; }
    .config-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faded); margin-bottom: 0.5rem; display: block; }
    .pill-group { display: flex; gap: 4px; }
    .pill-btn { flex: 1; padding: 0.55rem 0.4rem; font-family: 'Inter Tight', sans-serif; font-size: 0.78rem; font-weight: 500; background: transparent; color: var(--ink); border: 1px solid var(--rule); cursor: pointer; text-align: center; }
    .pill-btn.active { background: var(--ink); color: var(--paper); }
    .select-std { width: 100%; padding: 0.6rem 0.7rem; font-family: 'Inter Tight', sans-serif; font-size: 0.88rem; background: var(--paper); border: 1px solid var(--rule); color: var(--ink); cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%3E%3Cpath%20fill%3D%22%231a1613%22%20d%3D%22M0%200l5%206%205-6z%22/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.7rem center; padding-right: 2rem; }
    .stepper { display: flex; align-items: stretch; border: 1px solid var(--rule); }
    .stepper-btn { width: 32px; background: transparent; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; justify-content: center; padding: 0; }
    .stepper-btn:hover { background: var(--paper-dark); }
    .stepper-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .stepper-val { flex: 1; text-align: center; padding: 0.55rem 0; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 600; border-left: 1px solid var(--rule); border-right: 1px solid var(--rule); }

    .timeline-wrap { position: relative; padding-left: 2.5rem; }
    .timeline-line { position: absolute; left: 0.7rem; top: 0; bottom: 0; width: 2px; background: var(--rule); }
    .timeline-dot { position: absolute; left: -2rem; top: 6px; width: 18px; height: 18px; border: 3px solid var(--paper); box-shadow: 0 0 0 1.5px var(--rule); border-radius: 50%; }

    .hist-row { display: grid; grid-template-columns: 50px 1fr; gap: 0.7rem; align-items: center; margin-bottom: 0.4rem; }
    .hist-bar { display: flex; height: 28px; border: 1.5px solid var(--rule); overflow: hidden; }
    .hist-bar > div { display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: 600; overflow: hidden; white-space: nowrap; min-width: 0; }

    .footer-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2.5rem; }

    @media (max-width: 767px) {
      .section-wrap, .section-wrap-narrow { padding: 1.5rem 1rem 2.5rem; }
      .grid-2, .grid-3, .grid-4, .grid-calc, .grid-control { grid-template-columns: 1fr; gap: 1rem; }
      .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
      .card { padding: 1rem; } .card-deep { padding: 1.25rem; }
      .timeline-wrap { padding-left: 1.8rem; } .timeline-dot { left: -1.55rem; }
      .tab-nav-inner { padding: 0 0.75rem; flex-direction: column; align-items: stretch; gap: 0; }
      .brand-block { padding: 0.6rem 0 0.4rem; }
      .tabs-wrapper { justify-content: flex-start; border-top: 1px solid var(--rule); margin: 0 -0.75rem; padding: 0 0.75rem; }
      .tab-btn { padding: 0.85rem 0.7rem; font-size: 0.68rem; }
      .drop-cap::first-letter { font-size: 3.2em; }
      .display-xl { font-size: 2.2rem; line-height: 1; }
      .display-lg { font-size: 1.8rem; }
      .display-md { font-size: 1.3rem; }
      .year-btn { font-size: 0.72rem; padding: 0.5rem 0; }
      .metric-value { font-size: 1.5rem; }
      .bar-stack { height: 34px; font-size: 0.62rem; }
      .hist-row { grid-template-columns: 42px 1fr; gap: 0.5rem; } .hist-bar { height: 24px; } .hist-bar > div { font-size: 0.58rem; }
      input[type="range"].slider-ink::-webkit-slider-thumb { width: 28px; height: 28px; }
      .pill-btn { font-size: 0.72rem; padding: 0.5rem 0.3rem; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .grid-3 { grid-template-columns: repeat(2, 1fr); }
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
      .grid-calc { grid-template-columns: 1fr; }
    }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.4s ease-out both; }
  `}</style>
);

/* =========================================================================
   COMPONENTES BASE
   ========================================================================= */

const TabNav = ({ active, onChange }) => {
  const tabs = [
    { id: 'home', label: 'Inicio' },
    { id: 'calc', label: 'Calculadora' },
    { id: 'comp', label: 'Progresividad' },
    { id: 'brackets', label: 'Tramos' },
    { id: 'curve', label: 'Curva IRPF' },
    { id: 'distrib', label: 'Distribución' },
    { id: 'ocde', label: 'OCDE' },
    { id: 'debt', label: 'Tu deuda' },
    { id: 'history', label: 'Cronología' },
    { id: 'manual', label: 'Manual' },
  ];
  return (
    <nav className="tab-nav">
      <div className="tab-nav-inner">
        <div className="brand-block">
          <div style={{ width: 24, height: 24, background: 'var(--crimson)', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 5, left: 5, width: 14, height: 14, background: 'var(--paper)' }} />
            <div style={{ position: 'absolute', top: 8, left: 8, width: 8, height: 8, background: 'var(--crimson)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="serif" style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap' }}>LA MORDIDA SILENCIOSA</div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink-faded)', marginTop: 2 }}>IRPF · 2012—2026</div>
          </div>
        </div>
        <div className="tabs-wrapper">
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${active === t.id ? 'active' : ''}`} onClick={() => { onChange(t.id); window.scrollTo(0, 0); }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Metric = ({ label, value, sub, color = 'var(--ink)' }) => (
  <div>
    <div className="metric-label">{label}</div>
    <div className="metric-value" style={{ color }}>{value}</div>
    {sub && <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>{sub}</div>}
  </div>
);

/* =========================================================================
   PANEL DE CONFIGURACIÓN AVANZADA
   ========================================================================= */

const Stepper = ({ value, onChange, min = 0, max = 9, label }) => (
  <div>
    {label && <span className="config-label">{label}</span>}
    <div className="stepper">
      <button className="stepper-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Restar"><Minus size={14} /></button>
      <div className="stepper-val">{value}</div>
      <button className="stepper-btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Sumar"><Plus size={14} /></button>
    </div>
  </div>
);

const ConfigPanel = ({ opts, setOpts, anio }) => {
  const isForal = REGIONES[opts.ccaa]?.foral;
  const handle = (key, val) => setOpts({ ...opts, [key]: val });

  return (
    <div>
      <div className="config-block">
        <span className="config-label">Régimen</span>
        <div className="pill-group">
          <button className={`pill-btn ${opts.regimen === 'asalariado' ? 'active' : ''}`} onClick={() => handle('regimen', 'asalariado')}>Asalariado</button>
          <button className={`pill-btn ${opts.regimen === 'autonomo' ? 'active' : ''}`} onClick={() => handle('regimen', 'autonomo')}>Autónomo</button>
        </div>
      </div>

      <div className="config-block">
        <span className="config-label">Comunidad Autónoma</span>
        <select className="select-std" value={opts.ccaa} onChange={(e) => handle('ccaa', e.target.value)}>
          {Object.entries(REGIONES).map(([k, r]) => (
            <option key={k} value={k}>{r.name}</option>
          ))}
        </select>
        {isForal && (
          <div className="flag-warn" style={{ marginTop: 8 }}>
            <AlertTriangle size={14} /> Régimen foral no modelado. Se aplica la escala estándar como aproximación.
          </div>
        )}
        {anio < 2024 && opts.ccaa !== 'default' && !isForal && (
          <div className="flag-info" style={{ marginTop: 8 }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Las divergencias autonómicas anteriores a 2024 no se modelan: para {anio} se aplica la escala estándar.</span>
          </div>
        )}
      </div>

      <div className="config-block">
        <span className="config-label">Tributación</span>
        <div className="pill-group">
          <button className={`pill-btn ${opts.tributacion === 'individual' ? 'active' : ''}`} onClick={() => handle('tributacion', 'individual')}>Individual</button>
          <button className={`pill-btn ${opts.tributacion === 'conjunta' ? 'active' : ''}`} onClick={() => handle('tributacion', 'conjunta')}>Conjunta</button>
        </div>
        {opts.tributacion === 'conjunta' && (
          <div style={{ fontSize: '0.72rem', color: 'var(--ink-faded)', marginTop: 6, lineHeight: 1.4 }}>
            Cónyuge sin renta. Reducción base imponible: 3.400 €.
          </div>
        )}
      </div>

      <div className="config-block">
        <span className="config-label">Cargas familiares</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <Stepper label="Hijos" value={opts.nHijos} onChange={(v) => setOpts({ ...opts, nHijos: v, nHijosMenores3: Math.min(opts.nHijosMenores3, v) })} max={6} />
          <Stepper label="< 3 años" value={opts.nHijosMenores3} onChange={(v) => handle('nHijosMenores3', v)} max={opts.nHijos} />
        </div>
        <Stepper label="Ascendientes a cargo" value={opts.nAscendientes} onChange={(v) => handle('nAscendientes', v)} max={2} />
      </div>
    </div>
  );
};

/* =========================================================================
   HOME
   ========================================================================= */

const HomeSection = ({ setTab }) => {
  const mini = useMemo(() => {
    const salario2026 = 30000;
    const inf = inflacionAcumulada(2012, 2026);
    const n2012 = calcularNomina(salario2026 / inf, 2012);
    const n2026 = calcularNomina(salario2026, 2026);
    return { perdida: n2012.neto * inf - n2026.neto };
  }, []);

  return (
    <div className="section-wrap fade-up">
      <div style={{ marginBottom: '2rem' }}>
        <div className="eyebrow">Ensayo fiscal · Auditoría ciudadana</div>
        <h1 className="display-xl serif" style={{ margin: '0.8rem 0 1.2rem' }}>
          El impuesto que <em style={{ color: 'var(--crimson)', fontStyle: 'italic', fontWeight: 400 }}>nadie votó</em>: cómo la inflación sube tus impuestos sin cambiar el BOE.
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.15rem)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 820, fontWeight: 300 }}>
          Se llama <strong style={{ fontWeight: 600 }}>progresividad en frío</strong>. Tu sueldo nominal sube para compensar la inflación, pero los tramos del IRPF, los mínimos personales y las reducciones permanecen congelados. Pagas un tipo efectivo más alto sin haber ganado, en términos reales, un solo euro. Esta página audita ese fenómeno entre 2012 y 2026 — para asalariados y autónomos, en cualquier comunidad autónoma, con tu situación familiar real.
        </p>
      </div>

      <div className="rule-thick" style={{ marginBottom: '1.5rem' }} />

      <div className="grid-auto-fit" style={{ marginBottom: '2.5rem' }}>
        <div className="card-deep">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Caso testigo</div>
          <div className="serif" style={{ fontSize: 'clamp(1.05rem, 2vw, 1.3rem)', lineHeight: 1.3, marginBottom: 14 }}>
            Un trabajador cuyo salario sube exactamente con la inflación 2012→2026…
          </div>
          <div style={{ borderTop: '1px solid rgba(245,241,232,0.25)', paddingTop: 14 }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ochre)', marginBottom: 4 }}>Pierde, en poder adquisitivo real</div>
            <div className="serif num" style={{ fontSize: 'clamp(2rem, 7vw, 3rem)', fontWeight: 500, lineHeight: 1 }}>
              {fmtEUR(mini.perdida)}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(245,241,232,0.7)', marginTop: 6 }}>
              al año, sobre un salario equivalente a {fmtEUR(30000)} brutos de 2026.
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--paper-dark)' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>¿Qué encontrarás aquí?</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.65, fontSize: '0.94rem' }}>
            {[
              ['Calculadora completa', 'asalariado o autónomo, cualquier CCAA, con familia.'],
              ['Comparador de poder adquisitivo', 'ajustado por IPC dic-a-dic.'],
              ['Visualización de tramos', 'estatales y autonómicos, año por año.'],
              ['Cronología normativa', ': Montoro, MEI, Solidaridad, reformas autonómicas.'],
              ['Manual paso a paso', 'del cálculo, con mínimos familiares.'],
            ].map(([t, d], i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <ChevronRight size={16} style={{ color: 'var(--crimson)', flexShrink: 0, marginTop: 4 }} />
                <span><strong>{t}</strong> {d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="display-md serif" style={{ marginBottom: '0.8rem' }}>La mecánica de la estafa técnica</h2>
          <p className="drop-cap" style={{ fontSize: '0.98rem', lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: '0.8rem' }}>
            El IRPF es progresivo: a más base, mayor tipo marginal. Los tramos están en euros fijos. Cuando el IPC corre al 5-6 % y tu salario sube igual, cruzas tramos sin enriquecerte. El Estado recauda más sin legislar nada.
          </p>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: 'var(--ink-soft)' }}>
            Alemania, Países Bajos o Portugal indexan tramos al IPC. España no lo hace desde 2008. El resultado entre 2021-2024 fue una bolsa fiscal oculta de más de <strong>25.000 millones</strong> solo en IRPF.
          </p>
        </div>
        <div>
          <h2 className="display-md serif" style={{ marginBottom: '0.8rem' }}>No es solo IRPF</h2>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: '0.8rem' }}>
            Desde 2023 se suman dos figuras: el <strong>MEI</strong> (Mecanismo de Equidad Intergeneracional) y la <strong>Cuota de Solidaridad</strong>. Y para los autónomos, todo cambió en 2023 con el sistema de cotización por ingresos reales.
          </p>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: 'var(--ink-soft)' }}>
            Y ojo: una <strong>familia con dos hijos</strong> en Madrid y otra en Cataluña con el mismo bruto pueden pagar miles de euros distintos. La calculadora te lo enseña.
          </p>
        </div>
      </div>

      <div className="rule-thick" />
      <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
        <button onClick={() => setTab('calc')} style={{
          fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.05rem, 3vw, 1.4rem)', fontWeight: 500,
          background: 'var(--crimson)', color: 'var(--paper)', border: 'none',
          padding: '0.85rem 1.8rem', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        }}>
          Abrir la calculadora <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   CALCULADORA
   ========================================================================= */

const CalculatorSection = () => {
  const [bruto, setBruto] = useState(35000);
  const [anio, setAnio] = useState(2026);
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const brutoDeferred = useDeferredValue(bruto);
  const r = useMemo(() => calcularNomina(brutoDeferred, anio, opts), [brutoDeferred, anio, opts]);
  // Comparativa: ¿cuánto pagaría la versión "soltero sin cargas"?
  const rBaseline = useMemo(() => calcularNomina(brutoDeferred, anio, { ...opts, tributacion: 'individual', nHijos: 0, nHijosMenores3: 0, nAscendientes: 0 }), [brutoDeferred, anio, opts]);
  const ahorroFamiliar = rBaseline.irpf - r.irpf;
  const tieneFamilia = opts.nHijos > 0 || opts.nAscendientes > 0 || opts.tributacion === 'conjunta';

  const tramoColors = ['#8b1e2c', '#b8891f', '#5c6b3e', '#3d4a5c', '#5c0f1c', '#2d5a3d', '#1a1613', '#a05a30', '#506060'];
  const stackData = r.regimen === 'autonomo'
    ? [{ key: 'Neto', value: r.neto, color: '#2d5a3d' }, { key: 'IRPF', value: r.irpf, color: '#8b1e2c' }, { key: 'SS', value: r.cotTra, color: '#3d4a5c' }]
    : [{ key: 'Neto', value: r.neto, color: '#2d5a3d' }, { key: 'IRPF', value: r.irpf, color: '#8b1e2c' }, { key: 'SS Trab.', value: r.cotTra, color: '#3d4a5c' }];
  const totalBrutoVis = r.neto + r.irpf + r.cotTra;

  const labelInput = r.regimen === 'autonomo' ? 'Rendimiento neto anual de la actividad' : 'Salario bruto anual';

  return (
    <div className="section-wrap fade-up">
      <div className="eyebrow">Módulo 01</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1.5rem' }}>
        De bruto a neto: la cuenta completa
      </h1>

      <div className="grid-calc" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'var(--paper-dark)' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <div className="metric-label">{labelInput}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <input type="number" inputMode="numeric" pattern="[0-9]*" className="input-big"
                value={bruto} onChange={(e) => setBruto(Math.max(0, Math.min(500000, Number(e.target.value) || 0)))}
                min={0} max={500000} step={500} />
              <span className="serif" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--ink-faded)' }}>€</span>
            </div>
            <input type="range" className="slider-ink" min={0} max={150000} step={500}
              value={Math.min(bruto, 150000)} onChange={(e) => setBruto(Number(e.target.value))} style={{ marginTop: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--ink-faded)', marginTop: 4 }} className="mono">
              <span>0 €</span><span>150.000 €</span>
            </div>
          </div>

          <div>
            <div className="metric-label">Ejercicio fiscal</div>
            <div className="year-grid-15" style={{ marginTop: 6 }}>
              {ANIOS.map(a => (
                <button key={a} onClick={() => setAnio(a)} className={`year-btn ${anio === a ? 'active' : ''}`}>{a}</button>
              ))}
            </div>
          </div>

          <div className="rule-thin" style={{ margin: '1.2rem 0 0' }} />
          <ConfigPanel opts={opts} setOpts={setOpts} anio={anio} />
        </div>

        {/* SUMMARY */}
        <div>
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <Metric
              label={r.regimen === 'autonomo' ? 'Coste autónomo' : 'Coste empresa'}
              value={fmtEUR(r.costeLab)}
              sub={r.regimen === 'autonomo' ? `(no hay empleador)` : `+${fmtEUR(r.cotEmp)} SS`}
            />
            <Metric label={r.regimen === 'autonomo' ? 'Rendimiento bruto' : 'Salario bruto'} value={fmtEUR(r.bruto)} sub="Tu input" />
            <Metric label="Neto anual" value={fmtEUR(r.neto)} sub={`${fmtEUR(r.neto / 12)} / mes`} color="var(--olive)" />
            <Metric label="Cuña fiscal" value={fmtPct1(r.cunaFiscal)} sub={r.regimen === 'autonomo' ? '% del bruto' : '% del coste laboral'} color="var(--crimson)" />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="metric-label" style={{ marginBottom: 6 }}>Descomposición</div>
            <div className="bar-stack">
              {stackData.map(s => {
                const pct = totalBrutoVis > 0 ? (s.value / totalBrutoVis) * 100 : 0;
                if (pct < 0.5) return null;
                return (
                  <div key={s.key} style={{ background: s.color, width: `${pct}%` }}>
                    {pct > 12 && `${s.key} ${pct.toFixed(0)}%`}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: 'var(--ink-faded)' }} className="mono">
              <span>0 €</span><span>{fmtEUR(r.bruto)}</span>
            </div>
          </div>

          <div className="grid-3" style={{ marginBottom: tieneFamilia ? '1.2rem' : 0 }}>
            <div className="card" style={{ padding: '0.8rem' }}>
              <div className="metric-label">Marginal IRPF</div>
              <div className="serif num" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 500, color: 'var(--crimson)' }}>{fmtPct(r.tipoMargIRPF * 100)}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-faded)' }}>{REGIONES[opts.ccaa].name}</div>
            </div>
            <div className="card" style={{ padding: '0.8rem' }}>
              <div className="metric-label">Efectivo IRPF</div>
              <div className="serif num" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 500, color: 'var(--crimson)' }}>{fmtPct(r.tipoEfIRPF)}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-faded)' }}>Sobre bruto</div>
            </div>
            <div className="card" style={{ padding: '0.8rem' }}>
              <div className="metric-label">Efectivo SS</div>
              <div className="serif num" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 500, color: 'var(--slate)' }}>{fmtPct(r.tipoEfSS)}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-faded)' }}>{r.regimen === 'autonomo' ? 'Autónomo' : 'Trabajador'}</div>
            </div>
          </div>

          {tieneFamilia && ahorroFamiliar > 0 && (
            <div className="card" style={{ background: 'var(--success)', color: 'var(--paper)', padding: '1rem', borderColor: 'var(--success)' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 4 }}>Ahorro fiscal por situación familiar</div>
              <div className="serif num" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 500 }}>
                {fmtEUR(ahorroFamiliar)} <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>/ año</span>
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4 }}>
                vs. ese mismo bruto sin cargas. Mensual: {fmtEUR(ahorroFamiliar / 12)}.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="divider-fancy">
        <span className="eyebrow">Flujo del cálculo · {r.regimen === 'autonomo' ? 'Autónomo' : 'Asalariado'} · {REGIONES[opts.ccaa].name}</span>
      </div>

      <div className="grid-2">
        <div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div className="eyebrow">Paso 1 — Seguridad Social</div>
            <h3 className="display-md serif" style={{ margin: '0.3rem 0 0.8rem' }}>Cotizaciones</h3>
            <div className="table-scroll">
              <table className="tbl">
                <tbody>
                  {r.regimen === 'asalariado' ? (
                    <>
                      <tr><td>Base de cotización</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.baseCot)}</td></tr>
                      <tr><td>Base máxima del año</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.baseMax)}</td></tr>
                      {r.excBase > 0 && <tr><td>Exceso sobre base máxima</td><td className="mono" style={{ textAlign: 'right', color: 'var(--crimson)' }}>{fmtEUR2(r.excBase)}</td></tr>}
                      <tr><td>Tipo trabajador (+MEI)</td><td className="mono" style={{ textAlign: 'right' }}>{(r.tTra * 100).toFixed(3)}%</td></tr>
                      <tr><td>Tipo empresa (+MEI)</td><td className="mono" style={{ textAlign: 'right' }}>{(r.tEmp * 100).toFixed(3)}%</td></tr>
                      <tr style={{ background: 'var(--paper-dark)' }}><td><strong>SS Trabajador</strong></td><td className="mono" style={{ textAlign: 'right' }}><strong>{fmtEUR2(r.cotTra)}</strong></td></tr>
                      <tr style={{ background: 'var(--paper-dark)' }}><td><strong>SS Empresa</strong></td><td className="mono" style={{ textAlign: 'right' }}><strong>{fmtEUR2(r.cotEmp)}</strong></td></tr>
                    </>
                  ) : (
                    <>
                      <tr><td>Rend. neto anual (input)</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.bruto)}</td></tr>
                      <tr><td>Rend. neto mensual</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.bruto / 12)}</td></tr>
                      <tr><td>Tipo combinado autónomo {anio}</td><td className="mono" style={{ textAlign: 'right' }}>{(r.tTra * 100).toFixed(2)}%</td></tr>
                      <tr style={{ background: 'var(--paper-dark)' }}><td><strong>Cuota anual SS autónomo</strong></td><td className="mono" style={{ textAlign: 'right' }}><strong>{fmtEUR2(r.cotTra)}</strong></td></tr>
                      <tr><td>Equivalente mensual</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.cotTra / 12)}</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            {anio >= 2023 && r.regimen === 'asalariado' && (
              <div className="flag-warn" style={{ marginTop: 10 }}>
                <AlertTriangle size={14} /> MEI activo desde 2023.{anio >= 2025 ? ' Solidaridad activa desde 2025.' : ''}
              </div>
            )}
            {anio >= 2023 && r.regimen === 'autonomo' && (
              <div className="flag-info" style={{ marginTop: 10 }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Sistema de cotización por ingresos reales (RD-ley 13/2022). Base mínima asignada según tu rendimiento.</span>
              </div>
            )}
          </div>

          <div>
            <div className="eyebrow">Paso 2 — Rendimiento</div>
            <h3 className="display-md serif" style={{ margin: '0.3rem 0 0.8rem' }}>Base imponible</h3>
            <div className="table-scroll">
              <table className="tbl">
                <tbody>
                  <tr><td>{r.regimen === 'autonomo' ? 'Rendimiento bruto' : 'Ingresos íntegros'}</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.bruto)}</td></tr>
                  <tr><td>(−) {r.regimen === 'autonomo' ? 'SS autónomo' : 'SS Trabajador'}</td><td className="mono" style={{ textAlign: 'right' }}>−{fmtEUR2(r.cotTra)}</td></tr>
                  <tr><td>= Rendimiento previo</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.rnPrevio)}</td></tr>
                  <tr><td>(−) {r.regimen === 'autonomo' ? 'Gastos difícil justif. (5%, máx 2k)' : 'Gastos art. 19.2.f'}</td><td className="mono" style={{ textAlign: 'right' }}>−{fmtEUR2(r.gastos)}</td></tr>
                  {r.regimen === 'asalariado' && <tr><td>(−) Reducción art. 20</td><td className="mono" style={{ textAlign: 'right' }}>−{fmtEUR2(r.red20)}</td></tr>}
                  {r.reduccionConjunta > 0 && <tr><td>(−) Reducción tributación conjunta</td><td className="mono" style={{ textAlign: 'right', color: 'var(--success)' }}>−{fmtEUR2(r.reduccionConjunta)}</td></tr>}
                  <tr style={{ background: 'var(--paper-dark)' }}><td><strong>Base imponible</strong></td><td className="mono" style={{ textAlign: 'right' }}><strong>{fmtEUR2(r.baseImp)}</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div className="eyebrow">Paso 3 — Cuota por tramos</div>
            <h3 className="display-md serif" style={{ margin: '0.3rem 0 0.8rem' }}>Escala de gravamen</h3>
            <div className="table-scroll">
              {r.tramos.length > 0 ? (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Tramo</th>
                      <th style={{ textAlign: 'right' }}>Base</th>
                      <th style={{ textAlign: 'right' }}>Tipo</th>
                      <th style={{ textAlign: 'right' }}>Cuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.tramos.map((t, i) => (
                      <tr key={i}>
                        <td className="mono" style={{ fontSize: '0.75rem' }}>{fmtEUR(t.desde)}–{t.hasta === Infinity ? '∞' : fmtEUR(t.hasta)}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(t.base)}</td>
                        <td className="mono" style={{ textAlign: 'right', color: tramoColors[i % tramoColors.length], fontWeight: 600 }}>{(t.tipo * 100).toFixed(2)}%</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(t.cuota)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--paper-dark)' }}>
                      <td colSpan={3}><strong>Cuota íntegra</strong></td>
                      <td className="mono" style={{ textAlign: 'right' }}><strong>{fmtEUR2(r.qIntegra)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              ) : <p style={{ color: 'var(--ink-faded)', fontSize: '0.9rem' }}>Sin base imponible sujeta.</p>}
            </div>
          </div>

          <div>
            <div className="eyebrow">Paso 4 — Liquidación</div>
            <h3 className="display-md serif" style={{ margin: '0.3rem 0 0.8rem' }}>Del íntegro al neto</h3>
            <div className="table-scroll">
              <table className="tbl">
                <tbody>
                  <tr><td>Cuota íntegra</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.qIntegra)}</td></tr>
                  <tr><td>Mín. personal y familiar</td><td className="mono" style={{ textAlign: 'right', color: 'var(--ink-faded)' }}>{fmtEUR2(r.minPersonalYFamiliar)}</td></tr>
                  <tr><td>(−) Cuota mín. personal y familiar</td><td className="mono" style={{ textAlign: 'right', color: 'var(--success)' }}>−{fmtEUR2(r.qMin)}</td></tr>
                  <tr><td>= Cuota teórica</td><td className="mono" style={{ textAlign: 'right' }}>{fmtEUR2(r.qTeorica)}</td></tr>
                  {r.dSMI > 0 && <tr><td>(−) Deducción SMI</td><td className="mono" style={{ textAlign: 'right', color: 'var(--success)' }}>−{fmtEUR2(r.dSMI)}</td></tr>}
                  {r.regimen === 'asalariado' && <tr><td>Límite 43% RIRPF</td><td className="mono" style={{ textAlign: 'right', color: 'var(--ink-faded)' }}>{fmtEUR2(r.limRet)}</td></tr>}
                  <tr style={{ background: 'var(--crimson)', color: 'var(--paper)' }}>
                    <td><strong>{r.regimen === 'autonomo' ? 'IRPF anual' : 'Retención IRPF'}</strong></td>
                    <td className="mono" style={{ textAlign: 'right' }}><strong>{fmtEUR2(r.irpf)}</strong></td>
                  </tr>
                  <tr style={{ background: 'var(--olive)', color: 'var(--paper)' }}>
                    <td><strong>Neto disponible</strong></td>
                    <td className="mono" style={{ textAlign: 'right' }}><strong>{fmtEUR2(r.neto)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   COMPARADOR
   ========================================================================= */

const ComparatorSection = () => {
  const [salarioRef, setSalarioRef] = useState(30000);
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const salarioRefDeferred = useDeferredValue(salarioRef);
  const isMobile = useIsMobile();

  const datos = useMemo(() => {
    const ref2026 = calcularNomina(salarioRefDeferred, 2026, opts);
    return ANIOS.map(a => {
      const inf = inflacionAcumulada(a, 2026);
      const brutoNom = salarioRefDeferred / inf;
      const r = calcularNomina(brutoNom, a, opts);
      const netoAj = r.neto * inf;
      const perdida = netoAj - ref2026.neto;
      return {
        anio: a, inf, brutoNom,
        netoReal: netoAj,
        irpfReal: r.irpf * inf,
        ssReal: r.cotTra * inf,
        perdida, perdidaMes: perdida / 12,
      };
    });
  }, [salarioRefDeferred, opts]);

  const peorAnio = datos.reduce((p, c) => c.perdida < p.perdida ? c : p, datos[0]);
  const perdidaMedia = datos.filter(d => d.anio < 2026).reduce((s, d) => s + d.perdida, 0) / (datos.length - 1);

  return (
    <div className="section-wrap fade-up">
      <div className="eyebrow">Módulo 02 · El corazón del análisis</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1.2rem' }}>
        ¿Cuánto te <em style={{ color: 'var(--crimson)', fontStyle: 'italic', fontWeight: 400 }}>cuesta</em> que los tramos no se actualicen?
      </h1>
      <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 900, marginBottom: '1.5rem' }}>
        Elige tu situación familiar y de régimen. El simulador deflacta el salario por IPC y reconstruye el poder adquisitivo neto en cada año. La diferencia contra 2026 es el impuesto que te cobraron por la inflación.
      </p>

      <div className="grid-2" style={{ marginBottom: '2rem', alignItems: 'flex-start' }}>
        <div className="card" style={{ background: 'var(--paper-dark)', padding: '1.3rem' }}>
          <div className="metric-label">Salario / Rendimiento de referencia (€ 2026)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
            <input type="number" inputMode="numeric" className="input-big"
              value={salarioRef} onChange={(e) => setSalarioRef(Math.max(12000, Math.min(200000, Number(e.target.value) || 12000)))}
              min={12000} max={200000} step={1000} />
            <span className="serif" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', color: 'var(--ink-faded)' }}>€</span>
          </div>
          <input type="range" className="slider-ink" min={15000} max={100000} step={1000}
            value={Math.min(salarioRef, 100000)} onChange={(e) => setSalarioRef(Number(e.target.value))} style={{ marginTop: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--ink-faded)', marginTop: 4 }} className="mono">
            <span>15k €</span><span>50k €</span><span>100k €</span>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--paper-dark)', padding: '1.3rem' }}>
          <ConfigPanel opts={opts} setOpts={setOpts} anio={2026} />
        </div>
      </div>

      <div className="grid-auto-fit" style={{ marginBottom: '2rem' }}>
        <div className="card-deep">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Peor año vs 2026</div>
          <div className="serif num" style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', fontWeight: 500, lineHeight: 1 }}>{peorAnio.anio}</div>
          <div style={{ fontSize: '0.85rem', marginTop: 6, color: 'rgba(245,241,232,0.8)' }}>
            {fmtEUR(peorAnio.perdida)} / año · {fmtEUR(peorAnio.perdidaMes)} / mes
          </div>
        </div>
        <div className="card">
          <div className="metric-label">Pérdida media anual 2012-25</div>
          <div className="serif num metric-value" style={{ color: 'var(--crimson)' }}>{fmtEUR(perdidaMedia)}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>frente a 2026</div>
        </div>
        <div className="card">
          <div className="metric-label">IPC acum. 2012→2026</div>
          <div className="serif num metric-value">{((inflacionAcumulada(2012) - 1) * 100).toFixed(1)}%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>×{inflacionAcumulada(2012).toFixed(4)}</div>
        </div>
        <div className="card">
          <div className="metric-label">Bruto nominal 2012</div>
          <div className="serif num metric-value">{fmtEUR(datos[0].brutoNom)}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>≡ {fmtEUR(salarioRef)} hoy</div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div className="eyebrow">Gráfico 01</div>
            <h3 className="display-md serif" style={{ margin: '0.2rem 0 0' }}>Neto real (€ 2026) vs neto 2026</h3>
          </div>
          <div className="chip">{REGIONES[opts.ccaa].name} · {opts.regimen === 'autonomo' ? 'Autónomo' : 'Asalariado'} · Hijos: {opts.nHijos}</div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 380}>
          <ComposedChart data={datos} margin={{ top: 10, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#8a7d70" opacity={0.3} />
            <XAxis dataKey="anio" stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} interval={isMobile ? 1 : 0} />
            <YAxis stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} width={40} />
            <Tooltip contentStyle={{ background: '#f5f1e8', border: '1.5px solid #1a1613', borderRadius: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              formatter={(v, n) => [fmtEUR(v), n]} />
            <Legend wrapperStyle={{ fontFamily: 'Inter Tight, sans-serif', fontSize: 11 }} />
            <ReferenceLine y={datos[datos.length - 1].netoReal} stroke="#8b1e2c" strokeDasharray="3 3" />
            <Bar dataKey="netoReal" name="Neto real (€ 2026)" fill="#5c6b3e" />
            <Line type="monotone" dataKey="irpfReal" name="IRPF (€ 2026)" stroke="#8b1e2c" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="eyebrow">Gráfico 02</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.8rem' }}>Pérdida anual de poder adquisitivo</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 240 : 320}>
          <BarChart data={datos} margin={{ top: 10, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#8a7d70" opacity={0.3} />
            <XAxis dataKey="anio" stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} interval={isMobile ? 1 : 0} />
            <YAxis stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} tickFormatter={(v) => `${v >= 0 ? '+' : ''}${(v/1000).toFixed(1)}k`} width={45} />
            <Tooltip contentStyle={{ background: '#f5f1e8', border: '1.5px solid #1a1613', borderRadius: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              formatter={(v) => [fmtEUR(v), 'Δ']} />
            <ReferenceLine y={0} stroke="#1a1613" strokeWidth={1.5} />
            <Bar dataKey="perdida">
              {datos.map((d, i) => (<Cell key={i} fill={d.perdida < 0 ? '#8b1e2c' : '#5c6b3e'} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: '0.6rem', fontStyle: 'italic' }}>
          Rojo: poder adquisitivo neto inferior a 2026. Verde: superior. La situación familiar se mantiene constante en todos los años (asunción simplificadora).
        </p>
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="eyebrow">Tabla detallada</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.8rem' }}>Año por año</h3>
        <div className="table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Año</th><th style={{ textAlign: 'right' }}>IPC</th><th style={{ textAlign: 'right' }}>Bruto nom.</th>
                <th style={{ textAlign: 'right' }}>IRPF (€26)</th><th style={{ textAlign: 'right' }}>SS (€26)</th>
                <th style={{ textAlign: 'right' }}>Neto (€26)</th><th style={{ textAlign: 'right' }}>Δ año</th><th style={{ textAlign: 'right' }}>Δ mes</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(d => (
                <tr key={d.anio} style={d.anio === 2026 ? { background: 'var(--paper-dark)', fontWeight: 600 } : {}}>
                  <td className="mono" style={{ fontWeight: 600 }}>{d.anio}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>×{d.inf.toFixed(3)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{fmtEUR(d.brutoNom)}</td>
                  <td className="mono" style={{ textAlign: 'right', color: 'var(--crimson)' }}>{fmtEUR(d.irpfReal)}</td>
                  <td className="mono" style={{ textAlign: 'right', color: 'var(--slate)' }}>{fmtEUR(d.ssReal)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{fmtEUR(d.netoReal)}</td>
                  <td className="mono" style={{ textAlign: 'right', color: d.perdida < 0 ? 'var(--crimson)' : d.perdida > 0 ? 'var(--olive)' : 'var(--ink)', fontWeight: 600 }}>
                    {d.perdida >= 0 ? '+' : ''}{fmtEUR(d.perdida)}
                  </td>
                  <td className="mono" style={{ textAlign: 'right', color: d.perdidaMes < 0 ? 'var(--crimson)' : 'var(--olive)' }}>
                    {d.perdidaMes >= 0 ? '+' : ''}{fmtEUR(d.perdidaMes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   TRAMOS
   ========================================================================= */

const BracketsSection = () => {
  const [anio, setAnio] = useState(2026);
  const [ccaa, setCcaa] = useState('default');
  const isMobile = useIsMobile();
  const tramos = getTramos(anio, ccaa);
  const reg = REGIONES[ccaa];

  const chartData = useMemo(() => {
    const step = isMobile ? 1500 : 500;
    const maxVis = 80000;
    const data = [];
    const inf2012 = inflacionAcumulada(2012);
    for (let s = 0; s <= maxVis; s += step) {
      const r = calcularNomina(s, anio, { ccaa });
      const r2012 = calcularNomina(s / inf2012, 2012);
      data.push({ bruto: s, tipoMarg: r.tipoMargIRPF * 100, tipoEf: r.tipoEfIRPF, tipoEf2012: r2012.tipoEfIRPF });
    }
    return data;
  }, [anio, ccaa, isMobile]);

  return (
    <div className="section-wrap fade-up">
      <div className="eyebrow">Módulo 03</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1rem' }}>La escala de gravamen</h1>
      <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 900, marginBottom: '1.5rem' }}>
        El IRPF se compone de un tramo estatal (común) y otro autonómico. Las CCAA tienen plena soberanía sobre su mitad. La diferencia entre Madrid y Cataluña, en un mismo bruto, puede ser de miles de euros.
      </p>

      <div className="grid-2" style={{ marginBottom: '1.5rem', alignItems: 'flex-end' }}>
        <div>
          <span className="config-label">Año</span>
          <div className="year-grid-15">
            {ANIOS.map(a => (
              <button key={a} onClick={() => setAnio(a)} className={`year-btn ${anio === a ? 'active-crimson' : ''}`}>{a}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="config-label">CCAA</span>
          <select className="select-std" value={ccaa} onChange={(e) => setCcaa(e.target.value)}>
            {Object.entries(REGIONES).map(([k, r]) => (
              <option key={k} value={k}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.3rem' }}>
          <div className="eyebrow">Escala combinada {anio}</div>
          <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.8rem' }}>{reg.name} · {tramos.length} tramos</h3>
          <div className="table-scroll">
            <table className="tbl">
              <thead><tr><th>Base liquidable</th><th style={{ textAlign: 'right' }}>Tipo</th></tr></thead>
              <tbody>
                {tramos.map(([lim, tipo], i) => {
                  const desde = i === 0 ? 0 : tramos[i - 1][0];
                  return (
                    <tr key={i}>
                      <td className="mono" style={{ fontSize: '0.78rem' }}>{fmtEUR(desde)} – {lim === Infinity ? '∞' : fmtEUR(lim)}</td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--crimson)' }}>{(tipo * 100).toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.9rem', background: 'var(--paper-dark)', borderLeft: '3px solid var(--crimson)' }}>
            <div className="eyebrow">Contexto</div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--ink-soft)', marginTop: 4 }}>{reg.desc}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.3rem' }}>
          <div className="eyebrow">Curva de tipos</div>
          <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.4rem' }}>Marginal vs efectivo</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-faded)', marginBottom: '0.8rem', lineHeight: 1.5 }}>
            En oro: tipo efectivo de 2012 con euros deflactados (la línea de la progresividad en frío).
          </p>
          <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#8a7d70" opacity={0.3} />
              <XAxis dataKey="bruto" stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9 }} tickFormatter={v => `${v.toFixed(0)}%`} domain={[0, 'dataMax + 5']} width={35} />
              <Tooltip contentStyle={{ background: '#f5f1e8', border: '1.5px solid #1a1613', borderRadius: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
                formatter={(v, n) => [`${Number(v).toFixed(2)}%`, n]} labelFormatter={(l) => `${fmtEUR(l)}`} />
              <Legend wrapperStyle={{ fontFamily: 'Inter Tight, sans-serif', fontSize: 10 }} />
              <Line type="stepAfter" dataKey="tipoMarg" name={`Marg. ${anio}`} stroke="#8b1e2c" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tipoEf" name={`Efec. ${anio}`} stroke="#1a1613" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tipoEf2012" name="Efec. 2012 deflact." stroke="#b8891f" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ padding: '1.3rem' }}>
        <div className="eyebrow">Comparativa autonómica 2026</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 1rem' }}>Tipos máximos por CCAA</h3>
        <div>
          {Object.entries(REGIONES).filter(([k]) => k !== 'foral').map(([k, r]) => {
            const t = getTramos(2026, k);
            const tipoMax = t[t.length - 1][1];
            return (
              <div key={k} className="hist-row">
                <div className="mono" style={{ fontWeight: 600, fontSize: '0.72rem' }}>{r.name.length > 8 ? r.name.slice(0, 8) + '…' : r.name}</div>
                <div className="hist-bar" style={{ position: 'relative' }}>
                  <div style={{ width: `${tipoMax * 180}%`, background: tipoMax >= 0.5 ? 'var(--crimson)' : tipoMax >= 0.47 ? 'var(--ochre)' : 'var(--olive)', color: 'var(--paper)', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                    {(tipoMax * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: '0.8rem', fontStyle: 'italic' }}>
          Tipo marginal máximo combinado (estatal + autonómico) en 2026. País Vasco y Navarra no aparecen por aplicar su régimen foral propio.
        </p>
      </div>
    </div>
  );
};

/* =========================================================================
   CURVA IRPF — IRPF pagado por salario bruto, con comparativa multi-año
   y ajuste por IPC (la pieza central de la auditoría)
   ========================================================================= */

const CurvaIRPFSection = () => {
  const [anioPrincipal, setAnioPrincipal] = useState(2026);
  const [aniosCompara, setAniosCompara] = useState([2012, 2018, 2021]);
  const [regimen, setRegimen] = useState('asalariado');
  const [ccaa, setCcaa] = useState('default');
  const [maxSalario, setMaxSalario] = useState(100000);
  const [modoVisual, setModoVisual] = useState('euros'); // 'euros' | 'porcentaje'
  const [ajustarIPC, setAjustarIPC] = useState(true);    // ★ POR DEFECTO ON

  const isMobile = useIsMobile();

  const toggleCompara = (a) => {
    if (a === anioPrincipal) return;
    setAniosCompara(prev =>
      prev.includes(a)
        ? prev.filter(x => x !== a)
        : prev.length >= 4 ? [...prev.slice(1), a] : [...prev, a]
    );
  };

  // === MOTOR DE CÁLCULO CON AJUSTE IPC ===
  // Si ajustarIPC = true: el eje X representa "€ de 2026" (poder adquisitivo equivalente)
  //   - Para cada año Y, convertimos X → salario nominal de Y → calculamos IRPF en Y → reflactamos a € de 2026
  // Si ajustarIPC = false: el eje X es nominal de cada año, IRPF nominal
  // Devolvemos TANTO el valor nominal del año como el deflactado, para que el usuario
  // pueda auditar la cadena de deflación (salario nominal → IRPF nominal → IRPF en € 2026).
  const calcularPunto = (salarioEjeX, anio) => {
    const factor = ajustarIPC ? inflacionAcumulada(anio, 2026) : 1;
    const salarioNominal = ajustarIPC ? salarioEjeX / factor : salarioEjeX;
    const r = calcularNomina(salarioNominal, anio, { regimen, ccaa });
    return {
      irpf: Math.round(r.irpf * factor),         // IRPF en € del eje (2026 si ajustado, nominal si no)
      irpfNominal: Math.round(r.irpf),           // IRPF en € nominales del año Y
      salarioNominal: Math.round(salarioNominal),// Salario en € nominales del año Y
      factor,                                    // Multiplicador IPC (Y → 2026)
      pct: r.bruto > 0 ? r.tipoEfIRPF : 0,       // % efectivo (invariante al ajuste)
      neto: r.neto * factor,
    };
  };

  // Datos del gráfico
  const datosCurva = useMemo(() => {
    const step = isMobile ? 2000 : 1000;
    const aniosTodos = [anioPrincipal, ...aniosCompara].filter((v, i, arr) => arr.indexOf(v) === i);
    const data = [];
    for (let s = 0; s <= maxSalario; s += step) {
      const punto = { bruto: s };
      for (const a of aniosTodos) {
        const calc = calcularPunto(s, a);
        punto[`irpf_${a}`] = calc.irpf;
        punto[`pct_${a}`] = Number(calc.pct.toFixed(2));
      }
      data.push(punto);
    }
    return data;
  }, [anioPrincipal, aniosCompara, regimen, ccaa, maxSalario, isMobile, ajustarIPC]);

  // Tabla de referencia
  const salariosReferencia = [15000, 20000, 25000, 30000, 40000, 50000, 60000, 75000, 100000];
  const tablaReferencia = useMemo(() => {
    const aniosTodos = [anioPrincipal, ...aniosCompara].filter((v, i, arr) => arr.indexOf(v) === i);
    return salariosReferencia.filter(s => s <= maxSalario).map(s => {
      const fila = { bruto: s };
      for (const a of aniosTodos) fila[a] = calcularPunto(s, a);
      return fila;
    });
  }, [anioPrincipal, aniosCompara, regimen, ccaa, maxSalario, ajustarIPC]);

  // Paleta rotada por hue cada ~24° — cada año claramente distinto del anterior.
  // Lightness 25-40% y saturación 45-55% para legibilidad sobre fondo crema.
  const COLORES_ANIO = {
    2012: '#7a1f2c', // crimson profundo (350°)
    2013: '#b34428', // rojo-naranja (15°)
    2014: '#c2671c', // naranja terracota (30°)
    2015: '#a8841f', // dorado quemado (45°)
    2016: '#7a8030', // amarillo-oliva (70°)
    2017: '#4d7a3a', // verde oliva (100°)
    2018: '#2d6e4a', // verde bosque (140°)
    2019: '#1f6e6e', // teal (180°)
    2020: '#286b80', // cian-azul (200°)
    2021: '#3a5d8c', // azul (220°)
    2022: '#5240a0', // índigo (255°)
    2023: '#7a3a8e', // violeta (285°)
    2024: '#9c2d7e', // magenta (315°)
    2025: '#a52858', // rosa-rojo (340°)
    2026: '#1a1613', // tinta (año actual — destaca por ser casi negro)
  };

  const aniosVisibles = [anioPrincipal, ...aniosCompara].filter((v, i, arr) => arr.indexOf(v) === i);

  // Salario de referencia controlado por el usuario — marca la línea vertical en el gráfico
  // y dirige todos los textos dinámicos del pie.
  const [salarioRef, setSalarioRef] = useState(30000);
  const refPunto = useMemo(
    () => calcularPunto(salarioRef, anioPrincipal),
    [salarioRef, anioPrincipal, regimen, ccaa, ajustarIPC]
  );

  // ¿Hay diferencia significativa entre el principal y el más antiguo?
  const aniosOrden = aniosCompara.length > 0 ? Math.min(...aniosCompara) : null;
  const deltaRef = useMemo(() => {
    if (!aniosOrden) return null;
    const p = calcularPunto(salarioRef, anioPrincipal);
    const v = calcularPunto(salarioRef, aniosOrden);
    return p.irpf - v.irpf;
  }, [salarioRef, anioPrincipal, aniosOrden, regimen, ccaa, ajustarIPC]);

  // Diferencias completas (un objeto por cada año comparado) para el callout dinámico
  const deltasDetalle = useMemo(() => {
    const principal = calcularPunto(salarioRef, anioPrincipal);
    return aniosCompara
      .slice()
      .sort((a, b) => a - b)
      .map(a => {
        const v = calcularPunto(salarioRef, a);
        return {
          anio: a,
          irpf: v.irpf,                       // en € del eje (€ 2026 si ajustado)
          irpfNominal: v.irpfNominal,         // en € nominales del año
          salarioNominal: v.salarioNominal,   // salario nominal en ese año
          factor: v.factor,                   // multiplicador IPC
          delta: principal.irpf - v.irpf,     // delta en € del eje
        };
      });
  }, [salarioRef, anioPrincipal, aniosCompara, regimen, ccaa, ajustarIPC]);

  const sufijoEuros = ajustarIPC ? '€ de 2026' : '€ nominales';

  return (
    <div className="section-wrap fade-up">
      <div className="eyebrow">Módulo 04 · Curva del impuesto</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1rem' }}>
        ¿Cuánto IRPF se paga, <em style={{ color: 'var(--crimson)', fontStyle: 'italic', fontWeight: 400 }}>en euros</em>, en cada nivel salarial?
      </h1>
      <p style={{ fontSize: 'clamp(0.95rem,2vw,1.05rem)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 900, marginBottom: '1.2rem' }}>
        Mientras la pestaña de tramos muestra el <strong>tipo</strong> aplicable, esta vista revela la <strong>cantidad real</strong> de IRPF que paga un trabajador según su bruto. La opción <strong>Ajustar por IPC</strong>, activada por defecto, expresa todos los importes en euros de 2026: así puedes ver cuánto se pagaba realmente en años pasados con el mismo poder adquisitivo de hoy. Esa diferencia es, exactamente, la <strong>progresividad en frío</strong>.
      </p>

      {/* ====== TOGGLE PRINCIPAL: AJUSTE IPC ====== */}
      <div
        onClick={() => setAjustarIPC(!ajustarIPC)}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.2rem', cursor: 'pointer', userSelect: 'none',
          background: ajustarIPC ? 'var(--ink)' : 'var(--paper-dark)',
          color: ajustarIPC ? 'var(--paper)' : 'var(--ink)',
          border: `2px solid ${ajustarIPC ? 'var(--ochre)' : 'var(--rule)'}`,
          marginBottom: '1.5rem', flexWrap: 'wrap',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{
          width: 44, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0,
          background: ajustarIPC ? 'var(--ochre)' : 'var(--ink-faded)',
          transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 2, left: ajustarIPC ? 22 : 2,
            width: 20, height: 20, borderRadius: '50%', background: 'var(--paper)',
            transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif" style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.2 }}>
            Ajustar por IPC {ajustarIPC ? '· activado' : '· desactivado'}
          </div>
          <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: 3 }}>
            {ajustarIPC
              ? 'Importes expresados en euros constantes de 2026. Comparas poder adquisitivo equivalente.'
              : 'Importes nominales de cada año. Las curvas convergen entre años cercanos.'}
          </div>
        </div>
        <div className="chip" style={{
          background: ajustarIPC ? 'var(--ochre)' : 'var(--ink-faded)',
          color: ajustarIPC ? 'var(--ink)' : 'var(--paper)',
          borderColor: 'transparent', fontWeight: 600,
        }}>
          {sufijoEuros.toUpperCase()}
        </div>
      </div>

      {/* ====== PANEL DE CONFIGURACIÓN ====== */}
      <div className="card" style={{ background: 'var(--paper-dark)', padding: '1.25rem', marginBottom: '2rem' }}>
        <div className="config-block">
          <label className="config-label">Año principal</label>
          <div className="year-grid-15">
            {ANIOS.map(a => (
              <button key={a} onClick={() => setAnioPrincipal(a)} className={`year-btn ${anioPrincipal === a ? 'active-crimson' : ''}`}>{a}</button>
            ))}
          </div>
        </div>

        <div className="config-block">
          <label className="config-label">Años para superponer (máx. 4) · {aniosCompara.length} seleccionados</label>
          <div className="year-grid-15">
            {ANIOS.map(a => {
              const seleccionado = aniosCompara.includes(a);
              const esPrincipal = a === anioPrincipal;
              return (
                <button
                  key={a}
                  onClick={() => toggleCompara(a)}
                  disabled={esPrincipal}
                  className="year-btn"
                  style={{
                    background: esPrincipal ? 'var(--crimson)' : seleccionado ? 'var(--ochre)' : 'transparent',
                    color: esPrincipal || seleccionado ? 'var(--paper)' : 'var(--ink)',
                    borderColor: esPrincipal ? 'var(--crimson)' : seleccionado ? 'var(--ochre)' : 'var(--rule)',
                    opacity: esPrincipal ? 0.4 : 1,
                    cursor: esPrincipal ? 'not-allowed' : 'pointer',
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid-3" style={{ paddingTop: '1rem', borderTop: '1px solid var(--rule)' }}>
          <div>
            <label className="config-label">Régimen</label>
            <div className="pill-group">
              <button className={`pill-btn ${regimen === 'asalariado' ? 'active' : ''}`} onClick={() => setRegimen('asalariado')}>
                Asalariado
              </button>
              <button className={`pill-btn ${regimen === 'autonomo' ? 'active' : ''}`} onClick={() => setRegimen('autonomo')}>
                Autónomo
              </button>
            </div>
          </div>
          <div>
            <label className="config-label">CCAA</label>
            <select className="select-std" value={ccaa} onChange={(e) => setCcaa(e.target.value)}>
              {Object.entries(REGIONES).map(([k, r]) => (
                <option key={k} value={k}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="config-label">Visualización</label>
            <div className="pill-group">
              <button className={`pill-btn ${modoVisual === 'euros' ? 'active' : ''}`} onClick={() => setModoVisual('euros')}>€ pagados</button>
              <button className={`pill-btn ${modoVisual === 'porcentaje' ? 'active' : ''}`} onClick={() => setModoVisual('porcentaje')}>% efectivo</button>
            </div>
          </div>
        </div>

        <div className="config-block" style={{ marginTop: '1rem', borderTop: '1px solid var(--rule)', paddingTop: '1rem' }}>
          <label className="config-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Tu salario · marca de referencia en el gráfico</span>
            <span className="chip chip-crimson" style={{ fontSize: '0.65rem' }}>{fmtEUR(salarioRef)}</span>
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <input
              type="number"
              inputMode="numeric"
              value={salarioRef}
              onChange={(e) => setSalarioRef(Math.max(0, Math.min(maxSalario, Number(e.target.value) || 0)))}
              min={0}
              max={maxSalario}
              step={500}
              style={{
                width: 130, padding: '0.5rem 0.6rem', fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.05rem', fontWeight: 600, background: 'var(--paper)',
                border: '1.5px solid var(--rule)', color: 'var(--ink)', flexShrink: 0,
              }}
            />
            <input
              type="range"
              className="slider-ink"
              min={0} max={maxSalario} step={500}
              value={salarioRef}
              onChange={(e) => setSalarioRef(Number(e.target.value))}
              style={{ flex: 1, minWidth: 120 }}
            />
          </div>
        </div>

        <div className="config-block" style={{ marginTop: '1rem' }}>
          <label className="config-label">Salario bruto máximo del eje X · hasta {fmtEUR(maxSalario)}</label>
          <input type="range" className="slider-ink" min={30000} max={300000} step={10000}
            value={maxSalario} onChange={(e) => setMaxSalario(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--ink-faded)', marginTop: 4 }} className="mono">
            <span>30k €</span><span>150k €</span><span>300k €</span>
          </div>
        </div>
      </div>

      {/* ====== MÉTRICAS DE REFERENCIA ====== */}
      <div className="grid-auto-fit" style={{ marginBottom: '2rem' }}>
        <div className="card-deep">
          <div className="eyebrow" style={{ marginBottom: 6 }}>{anioPrincipal} · {fmtEUR(salarioRef)} brutos</div>
          <div className="serif num" style={{ fontSize: 'clamp(2rem,6vw,2.8rem)', fontWeight: 500, lineHeight: 1 }}>{fmtEUR(refPunto.irpf)}</div>
          <div style={{ fontSize: '0.85rem', marginTop: 6, color: 'rgba(245,241,232,0.8)' }}>
            IRPF anual · {fmtPct(refPunto.pct)} efectivo · {sufijoEuros}
          </div>
          {deltaRef !== null && Math.abs(deltaRef) > 50 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(245,241,232,0.25)', fontSize: '0.85rem' }}>
              <strong style={{ color: deltaRef > 0 ? 'var(--ochre)' : '#a4c98a' }}>
                {deltaRef > 0 ? '+' : ''}{fmtEUR(deltaRef)}
              </strong> vs {aniosOrden}
              {ajustarIPC && deltaRef < 0 && <span style={{ opacity: 0.8 }}> · pagas menos en términos reales hoy</span>}
              {ajustarIPC && deltaRef > 0 && <span style={{ opacity: 0.8 }}> · progresividad en frío en acción</span>}
            </div>
          )}
        </div>
        {[15000, 50000, 100000].map((s, i) => {
          const calc = calcularPunto(s, anioPrincipal);
          const colors = ['var(--olive)', 'var(--ochre)', 'var(--crimson)'];
          return (
            <div key={s} className="card">
              <div className="metric-label">A {fmtEUR(s)} brutos</div>
              <div className="serif num metric-value" style={{ color: colors[i] }}>{fmtEUR(calc.irpf)}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>{fmtPct(calc.pct)} efectivo</div>
            </div>
          );
        })}
      </div>

      {/* ====== GRÁFICO PRINCIPAL ====== */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow">Curva del impuesto · {sufijoEuros}</div>
            <h3 className="display-md serif" style={{ margin: '0.2rem 0 0' }}>
              {modoVisual === 'euros' ? `IRPF pagado (${ajustarIPC ? '€ de 2026' : '€'})` : 'Tipo efectivo (%)'} por salario bruto
            </h3>
          </div>
          <div className="chip" style={{ background: ajustarIPC ? 'var(--ochre)' : 'var(--paper-dark)', color: ajustarIPC ? 'var(--ink)' : 'var(--ink)', borderColor: ajustarIPC ? 'var(--ochre)' : 'var(--rule)' }}>
            {REGIONES[ccaa].name} · {regimen === 'autonomo' ? 'Autónomo' : 'Asalariado'}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 320 : 460}>
          <LineChart data={datosCurva} margin={{ top: 10, right: 10, left: 5, bottom: 10 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#8a7d70" opacity={0.3} />
            <XAxis
              dataKey="bruto"
              stroke="#1a1613"
              tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              label={isMobile ? null : { value: `Salario bruto anual (${ajustarIPC ? '€ de 2026' : '€ nominales'})`, position: 'insideBottom', offset: -5, fontSize: 11, fontFamily: 'Inter Tight' }}
            />
            <YAxis
              stroke="#1a1613"
              tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
              tickFormatter={v => modoVisual === 'euros' ? `${(v / 1000).toFixed(0)}k` : `${v.toFixed(0)}%`}
              width={50}
              label={isMobile ? null : { value: modoVisual === 'euros' ? `IRPF anual (${ajustarIPC ? '€ de 2026' : '€'})` : 'Tipo efectivo (%)', angle: -90, position: 'insideLeft', fontSize: 11, fontFamily: 'Inter Tight' }}
            />
            <Tooltip
              contentStyle={{ background: '#f5f1e8', border: '1.5px solid #1a1613', borderRadius: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              formatter={(v, n) => {
                const anio = n.split(' ')[0];
                return [modoVisual === 'euros' ? fmtEUR(v) : `${v}%`, anio];
              }}
              labelFormatter={(l) => `Bruto: ${fmtEUR(l)}${ajustarIPC ? ' (€ 2026)' : ''}`}
            />
            <Legend wrapperStyle={{ fontFamily: 'Inter Tight, sans-serif', fontSize: 11, paddingTop: 10 }} />
            {salarioRef > 0 && salarioRef <= maxSalario && (
              <ReferenceLine
                x={salarioRef}
                stroke="var(--crimson)"
                strokeWidth={2}
                strokeDasharray="5 4"
                label={{
                  value: `Tu salario · ${fmtEUR(salarioRef)}`,
                  position: 'top',
                  fill: 'var(--crimson)',
                  fontSize: 11,
                  fontFamily: 'Inter Tight, sans-serif',
                  fontWeight: 600,
                }}
              />
            )}
            {aniosVisibles.map(a => (
              <Line
                key={a}
                type="monotone"
                dataKey={modoVisual === 'euros' ? `irpf_${a}` : `pct_${a}`}
                name={`${a}${a === anioPrincipal ? ' ★' : ''}`}
                stroke={COLORES_ANIO[a]}
                strokeWidth={a === anioPrincipal ? 3 : 1.8}
                dot={false}
                strokeDasharray={a === anioPrincipal ? '0' : '4 3'}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {/* ===== CALLOUT DINÁMICO — diferencias exactas para el salario seleccionado ===== */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem 1.1rem',
          background: 'var(--paper-dark)',
          borderLeft: '3px solid var(--crimson)',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--crimson)', marginBottom: 8 }}>
            Para tu salario · {fmtEUR(salarioRef)} brutos {ajustarIPC && <span style={{ color: 'var(--ochre)' }}>(€ de 2026)</span>}
          </div>

          {/* Frase principal: año principal */}
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }}>
            En <strong style={{ color: COLORES_ANIO[anioPrincipal] }}>{anioPrincipal}</strong> pagas{' '}
            <span className="num" style={{ fontWeight: 600 }}>{fmtEUR2(refPunto.irpf)}</span> de IRPF
            <span style={{ color: 'var(--ink-faded)', fontSize: '0.85em' }}> ({fmtPct(refPunto.pct)} efectivo)</span>.
          </div>

          {/* Línea de auditoría del año principal cuando IPC está activado */}
          {ajustarIPC && anioPrincipal !== 2026 && (
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-faded)', marginBottom: 12, lineHeight: 1.5 }}>
              ↳ {fmtEUR(salarioRef)} (€ 2026) ÷ {refPunto.factor.toFixed(4)} = {fmtEUR(refPunto.salarioNominal)} nominal {anioPrincipal} → IRPF nominal: {fmtEUR2(refPunto.irpfNominal)} × {refPunto.factor.toFixed(4)} = {fmtEUR2(refPunto.irpf)} (€ 2026)
            </div>
          )}

          {/* Tarjetas de comparación con cadena nominal → deflactado */}
          {deltasDetalle.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
              {deltasDetalle.map(d => (
                <div key={d.anio} style={{
                  background: 'var(--paper)',
                  border: `1.5px solid ${COLORES_ANIO[d.anio]}`,
                  padding: '0.55rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 170,
                  flex: '1 1 170px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                    <span className="mono" style={{ fontWeight: 700, color: COLORES_ANIO[d.anio] }}>{d.anio}</span>
                    <span className="num" style={{ fontSize: '1rem', fontWeight: 600 }}>{fmtEUR(d.irpf)}</span>
                  </div>
                  {/* Detalle de deflación cuando IPC está activado */}
                  {ajustarIPC ? (
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--ink-faded)', lineHeight: 1.45, paddingBottom: 4 }}>
                      Sueldo: {fmtEUR(d.salarioNominal)} nominal<br />
                      IRPF: {fmtEUR(d.irpfNominal)} (× {d.factor.toFixed(3)})
                    </div>
                  ) : (
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--ink-faded)', paddingBottom: 4 }}>
                      Tipo efectivo: {fmtPct(d.salarioNominal > 0 ? (d.irpfNominal / d.salarioNominal) * 100 : 0)}
                    </div>
                  )}
                  <div className="num" style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: d.delta > 0 ? 'var(--crimson)' : d.delta < 0 ? 'var(--olive)' : 'var(--ink-faded)',
                    borderTop: '1px dashed var(--ink-faded)',
                    paddingTop: 4,
                  }}>
                    {d.delta > 0 ? '+' : ''}{fmtEUR(d.delta)} {d.delta > 0 ? `más en ${anioPrincipal}` : d.delta < 0 ? `menos en ${anioPrincipal}` : 'sin cambio'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nota metodológica */}
          {ajustarIPC && deltasDetalle.length > 0 && (
            <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--ink-faded)', fontStyle: 'italic', lineHeight: 1.5 }}>
              <strong>Cómo se calcula:</strong> tu salario en € de 2026 se divide por el IPC acumulado (dic-a-dic) para obtener el sueldo nominal equivalente del año correspondiente. Sobre ese sueldo nominal se calcula el IRPF según la normativa vigente en cada ejercicio (escalas, mínimos personales, reducción art. 20, gastos del art. 19.2.f). Después, ese IRPF nominal se multiplica de nuevo por el IPC acumulado para reexpresarlo en € de 2026.
            </div>
          )}
          {!ajustarIPC && (
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--ink-faded)', fontStyle: 'italic', lineHeight: 1.5 }}>
              Importes nominales sin ajustar por inflación. Activa el ajuste por IPC para ver la magnitud real del impuesto a lo largo del tiempo.
            </div>
          )}
        </div>
      </div>

      {/* ====== TABLA DE REFERENCIA — VERSIÓN COMPACTA MÓVIL ====== */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="eyebrow">Tabla de referencia · {sufijoEuros}</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.8rem' }}>IRPF pagado por salario bruto</h3>

        {isMobile ? (
          // Vista móvil: una tarjeta por salario, columnas verticales
          <div>
            {tablaReferencia.map(fila => {
              const datoPrincipal = fila[anioPrincipal];
              return (
                <div key={fila.bruto} style={{ borderBottom: '1px solid var(--paper-dark)', padding: '0.75rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <div className="serif" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{fmtEUR(fila.bruto)} <span style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', fontWeight: 400 }}>brutos</span></div>
                    <div className="mono" style={{ color: 'var(--crimson)', fontWeight: 600, fontSize: '1rem' }}>
                      {fmtEUR(datoPrincipal.irpf)} <span style={{ fontSize: '0.7rem', color: 'var(--ink-faded)', fontWeight: 400 }}>· {anioPrincipal} ★</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 6 }}>
                    {aniosVisibles.filter(a => a !== anioPrincipal).map(a => {
                      const d = fila[a];
                      const delta = d.irpf - datoPrincipal.irpf;
                      return (
                        <div key={a} style={{ background: 'var(--paper-dark)', padding: '0.45rem 0.55rem', fontSize: '0.78rem' }}>
                          <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--ink-faded)', fontSize: '0.7rem', fontWeight: 600 }}>{a}</div>
                          <div className="mono" style={{ fontWeight: 600 }}>{fmtEUR(d.irpf)}</div>
                          <div className="mono" style={{ fontSize: '0.7rem', color: delta < 0 ? 'var(--olive)' : 'var(--crimson)' }}>
                            {delta >= 0 ? '+' : ''}{fmtEUR(delta)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Vista desktop: tabla horizontal
          <div className="table-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Bruto anual</th>
                  {aniosVisibles.map(a => (
                    <th key={a} style={{ textAlign: 'right', color: a === anioPrincipal ? 'var(--crimson)' : 'var(--ink-faded)' }}>
                      {a}{a === anioPrincipal ? ' ★' : ''}
                    </th>
                  ))}
                  {aniosOrden && (
                    <th style={{ textAlign: 'right' }}>Δ {anioPrincipal} − {aniosOrden}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tablaReferencia.map(fila => {
                  const dPrin = fila[anioPrincipal];
                  const dAnt = aniosOrden ? fila[aniosOrden] : null;
                  const delta = dAnt ? dPrin.irpf - dAnt.irpf : 0;
                  return (
                    <tr key={fila.bruto}>
                      <td className="mono" style={{ fontWeight: 600 }}>{fmtEUR(fila.bruto)}</td>
                      {aniosVisibles.map(a => {
                        const d = fila[a];
                        return (
                          <td key={a} className="mono" style={{ textAlign: 'right', fontWeight: a === anioPrincipal ? 600 : 400, color: a === anioPrincipal ? 'var(--crimson)' : 'var(--ink-soft)' }}>
                            <div>{fmtEUR(d.irpf)}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--ink-faded)', fontWeight: 400 }}>{fmtPct(d.pct)}</div>
                          </td>
                        );
                      })}
                      {dAnt && (
                        <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: delta > 0 ? 'var(--crimson)' : delta < 0 ? 'var(--olive)' : 'var(--ink)' }}>
                          {delta >= 0 ? '+' : ''}{fmtEUR(delta)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: '0.8rem', fontStyle: 'italic', lineHeight: 1.5 }}>
          {ajustarIPC
            ? 'Importes en euros de 2026. Para cada año, se calcula el IRPF que pagaba un trabajador con poder adquisitivo equivalente al bruto indicado en la primera columna.'
            : 'Importes nominales del año correspondiente, sin ajustar por inflación.'}
        </p>
      </div>
    </div>
  );
};

/* =========================================================================
   DISTRIBUCIÓN SALARIAL — Tu posición social vs tu posición fiscal
   La pieza que cierra el círculo de la "progresividad en frío":
   subes nominalmente, pagas más IRPF, pero caes en la escala social.
   ========================================================================= */

const DistribucionSection = () => {
  const [anioOrigen, setAnioOrigen] = useState(2018);
  const [anioDestino, setAnioDestino] = useState(2026);
  const [salarioBase, setSalarioBase] = useState(25000);
  const isMobile = useIsMobile();

  // Recalcula posición social en ambos años — comparación bidireccional
  // El salario nominal del usuario se ajusta por IPC del año origen al año destino.
  // Las distribuciones salariales se mantienen en € corrientes de cada año
  // (es lo correcto: el INE mide la realidad nominal de cada ejercicio).
  const escenario = useMemo(() => {
    // Factor IPC desde origen hasta destino (puede ser hacia adelante o atrás)
    const factor = inflacionAcumulada(anioOrigen, anioDestino);
    const salarioEquivDestino = salarioBase * factor;

    const percentilOrigen = percentilDe(salarioBase, anioOrigen);
    const percentilDestino = percentilDe(salarioEquivDestino, anioDestino);

    const distOrigen = DISTRIBUCION_SALARIAL[anioOrigen];
    const distDestino = DISTRIBUCION_SALARIAL[anioDestino];

    return {
      factor, salarioEquivDestino,
      percentilOrigen, percentilDestino,
      saltoPercentil: percentilDestino - percentilOrigen,
      distOrigen, distDestino,
      yearsDelta: anioDestino - anioOrigen,
    };
  }, [anioOrigen, anioDestino, salarioBase]);

  // Curvas de densidad para ambos años
  const curvasDensidad = useMemo(() => {
    const maxSalario = 80000;
    const step = 500;
    const generar = (anio) => {
      const arr = [];
      for (let s = 1000; s <= maxSalario; s += step) {
        arr.push({ salario: s, densidad: densidadLogNormal(s, anio) });
      }
      const maxD = Math.max(...arr.map(p => p.densidad));
      return arr.map(p => ({ ...p, alturaRel: p.densidad / maxD }));
    };
    return {
      origen: generar(anioOrigen),
      destino: generar(anioDestino),
    };
  }, [anioOrigen, anioDestino]);

  // Helpers para SVG bell curve
  const renderBellCurve = ({ datos, salarioMarcado, dist, anio, colorBase }) => {
    const W = 100, H = 100; // viewBox %
    const maxSalario = 80000;
    const xPct = s => (s / maxSalario) * W;
    const yPct = h => H - (h * 0.85 * H) - 5; // deja 5% margen sup/inf

    // Path del área bajo la curva
    const pathArea = datos.length > 0
      ? `M ${xPct(datos[0].salario)} ${H} ` +
        datos.map(p => `L ${xPct(p.salario)} ${yPct(p.alturaRel)}`).join(' ') +
        ` L ${xPct(datos[datos.length - 1].salario)} ${H} Z`
      : '';

    const xMarca = xPct(Math.min(salarioMarcado, maxSalario));

    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 220, display: 'block' }}>
        {/* Eje X de líneas verticales en P10/P25/P50/P75/P90 */}
        {[
          { v: dist.p10, label: 'P10' },
          { v: dist.p25, label: 'P25' },
          { v: dist.p50, label: 'P50' },
          { v: dist.p75, label: 'P75' },
          { v: dist.p90, label: 'P90' },
        ].map(({ v, label }) => v <= maxSalario && (
          <g key={label}>
            <line x1={xPct(v)} y1={5} x2={xPct(v)} y2={H - 8}
                  stroke="#8a7d70" strokeWidth={0.15} strokeDasharray="0.5 0.5" />
            <text x={xPct(v)} y={4} textAnchor="middle"
                  style={{ fontSize: 2.4, fill: '#8a7d70', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
              {label}
            </text>
          </g>
        ))}

        {/* Área bajo la curva */}
        <path d={pathArea} fill={colorBase} fillOpacity={0.2} stroke={colorBase} strokeWidth={0.3} />

        {/* Marcador del salario del usuario */}
        {salarioMarcado > 0 && salarioMarcado <= maxSalario && (
          <>
            <line x1={xMarca} y1={5} x2={xMarca} y2={H - 8}
                  stroke="#8b1e2c" strokeWidth={0.5} />
            <circle cx={xMarca} cy={yPct(0.85)} r={1.4} fill="#8b1e2c" stroke="#f5f1e8" strokeWidth={0.4} />
          </>
        )}

        {/* Eje X numérico */}
        <line x1={0} y1={H - 8} x2={W} y2={H - 8} stroke="#1a1613" strokeWidth={0.3} />
        {[10000, 20000, 30000, 40000, 50000, 60000, 70000].map(v => (
          <text key={v} x={xPct(v)} y={H - 1.5} textAnchor="middle"
                style={{ fontSize: 2.5, fill: '#4a4038', fontFamily: 'JetBrains Mono' }}>
            {v / 1000}k
          </text>
        ))}
      </svg>
    );
  };

  // Tono interpretativo del salto
  const tono = (() => {
    const s = escenario.saltoPercentil;
    if (s < -8) return { color: 'var(--crimson)', titulo: 'Caída clara en la escala', icon: '↓↓' };
    if (s < -3) return { color: 'var(--ochre)', titulo: 'Pierdes posiciones', icon: '↓' };
    if (s > 3) return { color: 'var(--olive)', titulo: 'Subes posiciones (raro)', icon: '↑' };
    return { color: 'var(--slate)', titulo: 'Tu posición social apenas se mueve', icon: '→' };
  })();

  return (
    <div className="section-wrap fade-up">
      <div className="eyebrow">Módulo 05 · Distribución salarial</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1rem' }}>
        El doble castigo: pagas <em style={{ color: 'var(--crimson)', fontStyle: 'italic', fontWeight: 400 }}>impuestos de rico</em> mientras caes en la escala social
      </h1>
      <p style={{ fontSize: 'clamp(0.95rem,2vw,1.05rem)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 900, marginBottom: '1.2rem' }}>
        Hasta ahora hemos visto cómo la inflación arrastra tus impuestos hacia arriba. Pero hay un segundo efecto, igual o más doloroso: <strong>aunque tu salario nominal suba al ritmo del IPC</strong>, otros suben más rápido y tú <strong>caes en la distribución salarial española</strong>. Pagas el IRPF de un trabajador acomodado mientras te conviertes, en términos relativos, en uno más pobre. Esta sección lo demuestra con datos del INE.
      </p>

      {/* === PANEL DE CONTROL === */}
      <div className="card" style={{ background: 'var(--paper-dark)', padding: '1.25rem', marginBottom: '2rem' }}>
        <div className="config-block">
          <label className="config-label">Año de origen</label>
          <div className="year-grid-15">
            {ANIOS.map(a => (
              <button
                key={a}
                onClick={() => setAnioOrigen(a)}
                disabled={a === anioDestino}
                className={`year-btn ${anioOrigen === a ? 'active-crimson' : ''}`}
                style={a === anioDestino ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="config-block" style={{ marginTop: '0.8rem' }}>
          <label className="config-label">Año de comparación</label>
          <div className="year-grid-15">
            {ANIOS.map(a => (
              <button
                key={a}
                onClick={() => setAnioDestino(a)}
                disabled={a === anioOrigen}
                className={`year-btn ${anioDestino === a ? 'active' : ''}`}
                style={{
                  ...(a === anioOrigen ? { opacity: 0.3, cursor: 'not-allowed' } : {}),
                  ...(anioDestino === a ? { background: 'var(--ochre)', color: 'var(--paper)', borderColor: 'var(--ochre)' } : {}),
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--ink-faded)', lineHeight: 1.4 }}>
            Compara cualquier par de años entre 2012 y 2026. El sistema ajusta tu salario por IPC entre las dos fechas y comprueba en qué percentil te ubica cada distribución salarial nominal del INE.
          </div>
        </div>

        <div className="config-block" style={{ marginTop: '1rem', borderTop: '1px solid var(--rule)', paddingTop: '1rem' }}>
          <label className="config-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Tu salario en {anioOrigen}</span>
            <span className="chip chip-crimson" style={{ fontSize: '0.65rem' }}>{fmtEUR(salarioBase)}</span>
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <input
              type="number"
              inputMode="numeric"
              value={salarioBase}
              onChange={(e) => setSalarioBase(Math.max(8000, Math.min(80000, Number(e.target.value) || 0)))}
              min={8000}
              max={80000}
              step={500}
              style={{
                width: 130, padding: '0.5rem 0.6rem', fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.05rem', fontWeight: 600, background: 'var(--paper)',
                border: '1.5px solid var(--rule)', color: 'var(--ink)', flexShrink: 0,
              }}
            />
            <input
              type="range"
              className="slider-ink"
              min={8000} max={80000} step={500}
              value={salarioBase}
              onChange={(e) => setSalarioBase(Number(e.target.value))}
              style={{ flex: 1, minWidth: 120 }}
            />
          </div>
        </div>
      </div>

      {/* === BLOQUE NARRATIVO PRINCIPAL === */}
      <div className="card-deep" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>El relato en una frase</div>
        <p className="serif" style={{ fontSize: 'clamp(1.1rem, 2.6vw, 1.5rem)', lineHeight: 1.4, fontWeight: 500, margin: 0 }}>
          En <strong>{anioOrigen}</strong>, ganar <strong className="num">{fmtEUR(salarioBase)}</strong> te situaba en el{' '}
          <strong style={{ color: 'var(--ochre)' }}>percentil {Math.round(escenario.percentilOrigen)}</strong>{' '}
          de la escala salarial española. Si tu sueldo ha seguido al IPC, en {anioDestino} {anioDestino > anioOrigen ? 'cobras' : 'cobrabas'}{' '}
          <strong className="num">{fmtEUR(escenario.salarioEquivDestino)}</strong> y estás en el{' '}
          <strong style={{ color: tono.color }}>percentil {Math.round(escenario.percentilDestino)}</strong>.
        </p>
        <div style={{ marginTop: 14, padding: '0.9rem 1.1rem', background: 'rgba(184, 137, 31, 0.15)', borderLeft: '3px solid var(--ochre)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ochre)', marginBottom: 4 }}>
            {tono.icon} {tono.titulo}
          </div>
          <div className="serif" style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: 8 }}>
            <span className="num" style={{ color: tono.color, fontWeight: 600 }}>
              {escenario.saltoPercentil > 0 ? '+' : ''}{escenario.saltoPercentil.toFixed(1)} puntos percentiles
            </span>{' '}
            en {Math.abs(escenario.yearsDelta)} años, sin haber ganado ni perdido un euro de poder adquisitivo.
          </div>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.55, opacity: 0.92 }}>
            {Math.abs(escenario.saltoPercentil) < 3
              ? 'Tu posición social apenas cambia: los salarios españoles han seguido al IPC en estos años, así que mantenerte significa quedarte en el mismo lugar relativo. Pero los tramos del IRPF no se han actualizado al mismo ritmo: aunque tu sueldo en € de hoy compra lo mismo que antes, pagas un porcentaje mayor en impuestos. Ese es el verdadero doble castigo.'
              : escenario.saltoPercentil < 0
              ? 'Caes en la escala porque otros han subido más rápido que tú (especialmente por la fuerte revalorización del SMI). Y al mismo tiempo, los tramos del IRPF no se han actualizado, así que pagas más impuestos. Doble pérdida: posición y bolsillo.'
              : 'Subes ligeramente en la escala (raro: solo ocurre cuando tu sueldo crece más que la mediana). El castigo fiscal de la progresividad en frío sigue presente.'
            }
          </div>
        </div>
      </div>

      {/* === DOS CAMPANAS LADO A LADO === */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* AÑO ORIGEN */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="eyebrow">Distribución salarial · {anioOrigen}</div>
          <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.5rem' }}>
            Tu posición: percentil {Math.round(escenario.percentilOrigen)}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-faded)', marginBottom: 12 }}>
            Salario: {fmtEUR(salarioBase)} · {escenario.percentilOrigen > 50 ? `${Math.round(escenario.percentilOrigen - 50)} puntos por encima de la mediana` : escenario.percentilOrigen < 50 ? `${Math.round(50 - escenario.percentilOrigen)} puntos por debajo de la mediana` : 'justo en la mediana'}
          </div>
          {renderBellCurve({
            datos: curvasDensidad.origen,
            salarioMarcado: salarioBase,
            dist: escenario.distOrigen,
            anio: anioOrigen,
            colorBase: '#3d4a5c',
          })}
          <div style={{ marginTop: 12, padding: '0.7rem 0.8rem', background: 'var(--paper-dark)', fontSize: '0.78rem', lineHeight: 1.5 }} className="mono">
            P10 {fmtEUR(escenario.distOrigen.p10)} · P25 {fmtEUR(escenario.distOrigen.p25)} · <strong>P50 {fmtEUR(escenario.distOrigen.p50)}</strong> · P75 {fmtEUR(escenario.distOrigen.p75)} · P90 {fmtEUR(escenario.distOrigen.p90)}
          </div>
        </div>

        {/* AÑO DESTINO 2026 */}
        <div className="card" style={{ padding: '1.25rem', borderColor: tono.color, borderWidth: 2 }}>
          <div className="eyebrow" style={{ color: tono.color }}>Mismo poder adquisitivo · {anioDestino}</div>
          <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.5rem' }}>
            Tu posición: percentil {Math.round(escenario.percentilDestino)}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-faded)', marginBottom: 12 }}>
            Salario: {fmtEUR(escenario.salarioEquivDestino)} · {escenario.percentilDestino > 50 ? `${Math.round(escenario.percentilDestino - 50)} puntos por encima de la mediana` : escenario.percentilDestino < 50 ? `${Math.round(50 - escenario.percentilDestino)} puntos por debajo de la mediana` : 'justo en la mediana'}
          </div>
          {renderBellCurve({
            datos: curvasDensidad.destino,
            salarioMarcado: escenario.salarioEquivDestino,
            dist: escenario.distDestino,
            anio: 2026,
            colorBase: tono.color,
          })}
          <div style={{ marginTop: 12, padding: '0.7rem 0.8rem', background: 'var(--paper-dark)', fontSize: '0.78rem', lineHeight: 1.5 }} className="mono">
            P10 {fmtEUR(escenario.distDestino.p10)} · P25 {fmtEUR(escenario.distDestino.p25)} · <strong>P50 {fmtEUR(escenario.distDestino.p50)}</strong> · P75 {fmtEUR(escenario.distDestino.p75)} · P90 {fmtEUR(escenario.distDestino.p90)}
          </div>
        </div>
      </div>

      {/* === MÉTRICAS COMBINADAS: DOBLE CASTIGO === */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="eyebrow">El doble castigo · medido</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 1rem' }}>Lo que la inflación te quita por dos lados</h3>

        <div className="grid-3">
          {/* Lado fiscal */}
          <div style={{ borderLeft: '3px solid var(--crimson)', paddingLeft: 14 }}>
            <div className="metric-label">Castigo fiscal</div>
            <div className="serif num metric-value" style={{ color: 'var(--crimson)' }}>
              {(() => {
                const irpfOrigen = calcularNomina(salarioBase, anioOrigen).irpf;
                const irpfDestino = calcularNomina(escenario.salarioEquivDestino, anioDestino).irpf;
                const delta = (irpfDestino / escenario.salarioEquivDestino - irpfOrigen / salarioBase) * 100;
                return `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} pp`;
              })()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-faded)', marginTop: 6, lineHeight: 1.4 }}>
              Variación del tipo efectivo IRPF entre {anioOrigen} y {anioDestino} para el mismo poder adquisitivo.
            </div>
          </div>

          {/* Lado social */}
          <div style={{ borderLeft: `3px solid ${tono.color}`, paddingLeft: 14 }}>
            <div className="metric-label">Castigo social</div>
            <div className="serif num metric-value" style={{ color: tono.color }}>
              {escenario.saltoPercentil >= 0 ? '+' : ''}{escenario.saltoPercentil.toFixed(1)} pp
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-faded)', marginTop: 6, lineHeight: 1.4 }}>
              Cambio de percentil en la distribución salarial. Negativo = caes en la escala.
            </div>
          </div>

          {/* Resumen */}
          <div style={{ borderLeft: '3px solid var(--ink)', paddingLeft: 14 }}>
            <div className="metric-label">Lectura conjunta</div>
            <div className="serif" style={{ fontSize: '1rem', lineHeight: 1.4, fontWeight: 500, marginTop: 2 }}>
              Pagas un IRPF más caro <strong style={{ color: 'var(--crimson)' }}>y</strong> tu posición relativa empeora. La inflación te empobrece dos veces.
            </div>
          </div>
        </div>
      </div>

      {/* === NOTA METODOLÓGICA === */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--paper-dark)' }}>
        <div className="eyebrow">Metodología y fuentes</div>
        <h4 className="serif" style={{ margin: '0.4rem 0 0.6rem', fontSize: '1.1rem', fontWeight: 600 }}>Cómo se construyen estos percentiles</h4>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: '0.7rem' }}>
          Los datos de distribución salarial proceden de la <strong>Encuesta Anual de Estructura Salarial (EAES) del INE</strong>, complementada en los años cuatrienales (2014, 2018, 2022) por la Encuesta de Estructura Salarial (EES). Cubren la ganancia bruta anual de asalariados a tiempo completo en España, excluyendo País Vasco y Navarra (territorios forales con sus propias encuestas).
        </p>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: '0.7rem' }}>
          La curva de densidad ("campana") es una <strong>aproximación log-normal</strong> calibrada con la mediana y la media oficiales de cada año. La distribución salarial real tiene una cola superior más gruesa que la log-normal pura, así que la zona P5-P90 es muy fiable y la cola por encima del P95 está infraestimada visualmente. Los percentiles numéricos al pie de cada gráfico son los valores oficiales del INE, no la aproximación.
        </p>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: '0.7rem' }}>
          Los años <strong>2024, 2025 y 2026</strong> son proyecciones (IPC + 1% real) porque los datos definitivos de la EAES llevan 18-24 meses de retraso. Cuando el INE publique las series completas, se sustituirán los valores estimados.
        </p>
        <div style={{ marginTop: '0.8rem', padding: '0.7rem 0.9rem', background: 'var(--paper)', border: '1px dashed var(--rule)', fontSize: '0.78rem', lineHeight: 1.5 }}>
          <strong>Fuentes año {anioOrigen}:</strong> <span className="mono">{escenario.distOrigen.src}</span><br />
          <strong>Fuentes año {anioDestino}:</strong> <span className="mono">{escenario.distDestino.src}</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   CUÑA FISCAL OCDE — Comparativa internacional + simulador "Si España fuera..."
   ========================================================================= */
const OcdeSection = () => {
  const [costeLab, setCosteLab] = useState(50000);
  const [paisRef, setPaisRef] = useState('OECD');
  const isMobile = useIsMobile();

  const espana = CUNA_OCDE_2025.find(p => p.code === 'ES');
  const referencia = CUNA_OCDE_2025.find(p => p.code === paisRef);

  // Cálculo del neto bajo cada régimen para el coste laboral seleccionado
  const calcNetoPais = (pais, coste) => {
    const total = (pais.irpf + pais.cotTrab + pais.cotEmp) / 100;
    // Modelo: cuna = (coste - neto) / coste  →  neto = coste × (1 - cuna_total/100)
    // Pero la cuña OCDE usa coste laboral como denominador, así que aplicamos directo
    return coste * (1 - pais.total / 100);
  };

  const netoEspana = calcNetoPais(espana, costeLab);
  const netoRef = calcNetoPais(referencia, costeLab);
  const diferencia = netoRef - netoEspana;

  // Datos para el gráfico de barras apiladas
  const datosBarras = CUNA_OCDE_2025.map(p => ({
    pais: p.pais,
    code: p.code,
    Neto: 100 - p.total,
    'IRPF': p.irpf,
    'Cot. trabajador': p.cotTrab,
    'Cot. empresa': p.cotEmp,
    color: p.color,
    esp: p.esp,
    media: p.media,
  }));

  return (
    <div className="section-wrap fade-up">
      <div className="eyebrow">Módulo 06 · Comparativa internacional</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1rem' }}>
        Cuña fiscal: <em style={{ color: 'var(--crimson)', fontStyle: 'italic', fontWeight: 400 }}>cuánto del coste laboral</em> nunca llega a tu bolsillo
      </h1>
      <p style={{ fontSize: 'clamp(0.95rem,2vw,1.05rem)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 900, marginBottom: '1.2rem' }}>
        La cuña fiscal mide la diferencia entre lo que le cuestas a tu empresa y lo que recibes en neto. Incluye IRPF, cotizaciones del trabajador <strong>y</strong> cotizaciones del empleador (las que no aparecen en tu nómina pero salen del mismo "coste total"). Según el informe <strong>Taxing Wages 2026</strong> de la OCDE, en España alcanza el <strong style={{ color: 'var(--crimson)' }}>41,4%</strong> — 6,3 puntos por encima de la media OCDE y la décima más alta del mundo desarrollado.
      </p>

      {/* === GRÁFICO PRINCIPAL: Barras apiladas comparativas === */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="eyebrow">Cuña fiscal sobre el salario medio · 2025</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 1rem' }}>
          Cómo se reparte el coste laboral en cada país
        </h3>
        <ResponsiveContainer width="100%" height={isMobile ? 480 : 540}>
          <BarChart
            data={datosBarras}
            layout="vertical"
            margin={{ top: 10, right: 20, left: isMobile ? 70 : 110, bottom: 10 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="2 4" stroke="#8a7d70" opacity={0.3} horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
              domain={[0, 1]}
            />
            <YAxis
              type="category"
              dataKey="pais"
              tick={{ fontFamily: 'Inter Tight', fontSize: 11, fontWeight: 500 }}
              width={isMobile ? 65 : 105}
            />
            <Tooltip
              contentStyle={{ background: '#f5f1e8', border: '1.5px solid #1a1613', borderRadius: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              formatter={(v) => `${v.toFixed(1)}%`}
            />
            <Legend wrapperStyle={{ fontFamily: 'Inter Tight, sans-serif', fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="Neto" stackId="a" fill="#5c6b3e" />
            <Bar dataKey="IRPF" stackId="a" fill="#8b1e2c" />
            <Bar dataKey="Cot. trabajador" stackId="a" fill="#b8891f" />
            <Bar dataKey="Cot. empresa" stackId="a" fill="#3d4a5c" />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: '0.6rem', fontStyle: 'italic', lineHeight: 1.5 }}>
          Cada barra suma 100% del coste laboral total. La parte verde (Neto) es lo que finalmente recibe el trabajador en su cuenta bancaria. España es la sexta más cara — solo Bélgica, Alemania, Francia, Austria e Italia se llevan más en proporción del coste laboral.
        </p>
      </div>

      {/* === SIMULADOR "SI ESPAÑA FUERA..." === */}
      <div className="card-deep" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Simulador · "Si yo viviera en…"</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 1rem' }}>¿Cuánto cobrarías con tu mismo coste laboral en otro país?</h3>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
          <div>
            <div className="metric-label" style={{ color: 'var(--ochre)' }}>Coste laboral total (anual)</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: 4 }}>
              <input
                type="number"
                inputMode="numeric"
                value={costeLab}
                onChange={(e) => setCosteLab(Math.max(15000, Math.min(200000, Number(e.target.value) || 0)))}
                min={15000} max={200000} step={1000}
                style={{
                  width: '100%', padding: '0.5rem 0.7rem',
                  fontFamily: 'Fraunces, serif', fontSize: '1.6rem', fontWeight: 500,
                  background: 'transparent', color: 'var(--paper)',
                  border: 'none', borderBottom: '2px solid var(--ochre)',
                }}
              />
              <span className="serif" style={{ fontSize: '1.4rem', color: 'var(--ochre)' }}>€</span>
            </div>
            <input
              type="range"
              min={15000} max={150000} step={1000}
              value={Math.min(costeLab, 150000)}
              onChange={(e) => setCosteLab(Number(e.target.value))}
              style={{
                width: '100%', marginTop: 10, height: 4,
                background: 'rgba(245,241,232,0.3)',
              }}
            />
          </div>
          <div>
            <div className="metric-label" style={{ color: 'var(--ochre)' }}>Comparar España con</div>
            <select
              value={paisRef}
              onChange={(e) => setPaisRef(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 0.7rem', marginTop: 4,
                fontFamily: 'Inter Tight, sans-serif', fontSize: '1rem', fontWeight: 500,
                background: 'rgba(245,241,232,0.1)', color: 'var(--paper)',
                border: '1.5px solid var(--ochre)',
              }}
            >
              {CUNA_OCDE_2025.filter(p => p.code !== 'ES').map(p => (
                <option key={p.code} value={p.code} style={{ background: 'var(--ink)' }}>
                  {p.pais} ({p.total}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparación visual */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139,30,44,0.2)', borderLeft: '3px solid var(--crimson)' }}>
            <div className="eyebrow" style={{ color: '#f5b7be' }}>🇪🇸 España · cuña 41,4%</div>
            <div className="serif num" style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)', fontWeight: 500, lineHeight: 1, marginTop: 6 }}>
              {fmtEUR(netoEspana)}
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: 6, color: 'rgba(245,241,232,0.85)' }}>
              netos al año · {fmtEUR(netoEspana / 12)} al mes
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(184,137,31,0.2)', borderLeft: '3px solid var(--ochre)' }}>
            <div className="eyebrow" style={{ color: 'var(--ochre)' }}>{referencia.pais} · cuña {referencia.total}%</div>
            <div className="serif num" style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)', fontWeight: 500, lineHeight: 1, marginTop: 6 }}>
              {fmtEUR(netoRef)}
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: 6, color: 'rgba(245,241,232,0.85)' }}>
              netos al año · {fmtEUR(netoRef / 12)} al mes
            </div>
          </div>
        </div>

        {Math.abs(diferencia) > 200 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.9rem 1.1rem',
            background: diferencia > 0 ? 'rgba(184,137,31,0.18)' : 'rgba(92,107,62,0.18)',
            borderLeft: `3px solid ${diferencia > 0 ? 'var(--ochre)' : 'var(--olive)'}`,
          }}>
            <div className="serif" style={{ fontSize: 'clamp(1rem, 2.4vw, 1.25rem)', fontWeight: 500, lineHeight: 1.4 }}>
              {diferencia > 0
                ? <>Si España aplicara el sistema de <strong>{referencia.pais}</strong>, con tu mismo coste laboral cobrarías <strong className="num" style={{ color: 'var(--ochre)' }}>+{fmtEUR(diferencia)}</strong> al año — unos {fmtEUR(diferencia / 12)} más al mes en tu cuenta.</>
                : <>España es más generosa que <strong>{referencia.pais}</strong> en este caso: cobras <strong className="num" style={{ color: 'var(--olive)' }}>{fmtEUR(Math.abs(diferencia))}</strong> más al año aquí.</>
              }
            </div>
          </div>
        )}
      </div>

      {/* === LECTURA NARRATIVA === */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="eyebrow">Por qué importa</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.8rem' }}>El argumento de la "presión fiscal baja", desmontado</h3>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: '0.8rem' }}>
          El Gobierno suele argumentar que la <strong>presión fiscal española</strong> (recaudación / PIB) está por debajo de la media UE. Es cierto, pero engañoso: ese ratio mide cuánto recauda el Estado en relación a la economía total, no cuánto pesa sobre el trabajador. La cuña fiscal sí lo mide, y aquí España aparece como el décimo país más caro de la OCDE — por encima de Dinamarca, Noruega, Reino Unido o Estados Unidos.
        </p>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: '0.8rem' }}>
          La trampa está en el desglose: España tiene un IRPF moderado (13,1% sobre el bruto, similar a la media OCDE) pero unas <strong>cotizaciones empresariales altísimas</strong> (23,4% del coste laboral). Esto significa que el grueso de la cuña sale por la parte que el trabajador <em>no ve</em> en su nómina. Son 23 céntimos de cada euro de coste laboral que la empresa paga directamente al Estado sin pasar por tu cuenta.
        </p>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--ink-soft)' }}>
          En 2025 España fue uno de los <strong>10 países de la OCDE en los que el ingreso real después de impuestos cayó respecto a 2024</strong>, según el propio informe Taxing Wages. La subida de la cuña (+0,31 pp) duplicó la media de la OCDE (+0,15 pp).
        </p>
        <div style={{ marginTop: '0.8rem', padding: '0.7rem 0.9rem', background: 'var(--paper-dark)', fontSize: '0.78rem', lineHeight: 1.5 }}>
          <strong>Fuente:</strong> <span className="mono">OCDE, Taxing Wages 2026</span> (publicado abril 2026, datos de 2025). Trabajador soltero sin hijos al salario medio nacional.
        </div>
      </div>
    </div>
  );
};


/* =========================================================================
   TU DEUDA — Cuánto te toca de la deuda pública española
   ========================================================================= */
const DebtSection = () => {
  const [salarioBruto, setSalarioBruto] = useState(35000);
  const [anio, setAnio] = useState(2026);
  const [aniosProyeccion, setAniosProyeccion] = useState(20);
  const isMobile = useIsMobile();

  const datos = DEUDA_ESPANA[anio];
  const irpfAnual = useMemo(
    () => calcularNomina(salarioBruto, anio).irpf,
    [salarioBruto, anio]
  );

  // Cuántos años de tu IRPF entero te tocaría destinar para pagar tu parte de la deuda
  const aniosParaPagar = irpfAnual > 0 ? datos.perCapita / irpfAnual : Infinity;

  // Datos para el gráfico de evolución de deuda
  const datosDeuda = ANIOS.map(a => ({
    anio: a,
    perCapita: DEUDA_ESPANA[a].perCapita,
    pctPIB: DEUDA_ESPANA[a].pctPIB,
    totalMM: DEUDA_ESPANA[a].totalMM,
  }));

  // Crecimiento desde 2012
  const crecimientoTotal = ((datos.totalMM / DEUDA_ESPANA[2012].totalMM) - 1) * 100;
  const crecimientoPerCap = ((datos.perCapita / DEUDA_ESPANA[2012].perCapita) - 1) * 100;

  // Proyección: si destinas todo tu IRPF a la deuda durante N años
  const proyeccion = useMemo(() => {
    const arr = [];
    let pendiente = datos.perCapita;
    for (let i = 0; i <= aniosProyeccion; i++) {
      arr.push({ anio: i, pendiente: Math.max(0, pendiente) });
      pendiente -= irpfAnual;
    }
    return arr;
  }, [datos.perCapita, irpfAnual, aniosProyeccion]);

  return (
    <div className="section-wrap fade-up">
      <div className="eyebrow">Módulo 07 · Tu parte de la cuenta</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1rem' }}>
        El <em style={{ color: 'var(--crimson)', fontStyle: 'italic', fontWeight: 400 }}>"Día de la deuda"</em>: cuánto debes tú al sistema
      </h1>
      <p style={{ fontSize: 'clamp(0.95rem,2vw,1.05rem)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 900, marginBottom: '1.2rem' }}>
        Cada español carga con una parte proporcional de la deuda pública. A finales de 2025, esa cifra superaba los 34.000 € por habitante, según el Banco de España. Esta sección calcula cuántos años tendrías que destinar el <strong>total</strong> de tu IRPF — sin gastar un euro en sanidad, educación o pensiones — solo para amortizar tu cuota personal de la deuda nacional.
      </p>

      {/* === PANEL DE CONTROL === */}
      <div className="card" style={{ background: 'var(--paper-dark)', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="grid-2">
          <div>
            <label className="config-label">Tu salario bruto</label>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <input
                type="number"
                inputMode="numeric"
                value={salarioBruto}
                onChange={(e) => setSalarioBruto(Math.max(15000, Math.min(200000, Number(e.target.value) || 0)))}
                min={15000} max={200000} step={500}
                style={{
                  width: 130, padding: '0.5rem 0.6rem',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', fontWeight: 600,
                  background: 'var(--paper)', border: '1.5px solid var(--rule)', color: 'var(--ink)',
                }}
              />
              <input
                type="range"
                className="slider-ink"
                min={15000} max={120000} step={500}
                value={Math.min(salarioBruto, 120000)}
                onChange={(e) => setSalarioBruto(Number(e.target.value))}
                style={{ flex: 1, minWidth: 120 }}
              />
            </div>
          </div>
          <div>
            <label className="config-label">Año de referencia</label>
            <div className="year-grid-15" style={{ marginTop: 4 }}>
              {ANIOS.map(a => (
                <button key={a} onClick={() => setAnio(a)} className={`year-btn ${anio === a ? 'active-crimson' : ''}`}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === LA FRASE DEMOLEDORA === */}
      <div className="card-deep" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>El cálculo en una frase</div>
        <p className="serif" style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.4rem)', lineHeight: 1.45, fontWeight: 500, margin: 0 }}>
          Pagas <strong className="num" style={{ color: 'var(--ochre)' }}>{fmtEUR(irpfAnual)}</strong> de IRPF al año. Tu parte proporcional de la deuda pública española en {anio} asciende a <strong className="num" style={{ color: 'var(--crimson)' }}>{fmtEUR(datos.perCapita)}</strong>. Tendrías que destinar el <strong>100% de tu IRPF durante <span style={{ color: 'var(--crimson)' }}>{aniosParaPagar.toFixed(1)} años</span></strong> solo para pagar tu cuota personal — sin financiar sanidad, educación, pensiones, defensa ni infraestructuras.
        </p>
      </div>

      {/* === MÉTRICAS DESTACADAS === */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="metric-label">Deuda total · {anio}</div>
          <div className="serif num metric-value">{datos.totalMM.toLocaleString('es-ES')} mM €</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>{datos.pctPIB.toFixed(1)}% del PIB</div>
        </div>
        <div className="card">
          <div className="metric-label">Por habitante · {anio}</div>
          <div className="serif num metric-value" style={{ color: 'var(--crimson)' }}>{fmtEUR(datos.perCapita)}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>{datos.poblacion.toFixed(2)}M habitantes</div>
        </div>
        <div className="card">
          <div className="metric-label">Crecimiento desde 2012</div>
          <div className="serif num metric-value" style={{ color: 'var(--ochre)' }}>+{crecimientoTotal.toFixed(0)}%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>per cápita: +{crecimientoPerCap.toFixed(0)}%</div>
        </div>
        <div className="card">
          <div className="metric-label">Años de tu IRPF</div>
          <div className="serif num metric-value" style={{ color: 'var(--crimson)' }}>{aniosParaPagar.toFixed(1)}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: 4 }}>al 100% para amortizar</div>
        </div>
      </div>

      {/* === EVOLUCIÓN HISTÓRICA === */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="eyebrow">Evolución 2012 — 2026</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 1rem' }}>Deuda pública española: total y por habitante</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 360}>
          <ComposedChart data={datosDeuda} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#8a7d70" opacity={0.3} />
            <XAxis dataKey="anio" stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} />
            <YAxis yAxisId="left" stroke="#8b1e2c" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={48} />
            <YAxis yAxisId="right" orientation="right" stroke="#3d4a5c" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} tickFormatter={v => `${v}%`} width={40} />
            <Tooltip
              contentStyle={{ background: '#f5f1e8', border: '1.5px solid #1a1613', borderRadius: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              formatter={(v, n) => n === 'pctPIB' ? `${v.toFixed(1)}%` : n === 'totalMM' ? `${v.toLocaleString('es-ES')} mM €` : fmtEUR(v)}
            />
            <Legend wrapperStyle={{ fontFamily: 'Inter Tight, sans-serif', fontSize: 11, paddingTop: 8 }} />
            <Bar yAxisId="left" dataKey="perCapita" name="Deuda per cápita (€)" fill="#8b1e2c" />
            <Line yAxisId="right" type="monotone" dataKey="pctPIB" name="% del PIB" stroke="#3d4a5c" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faded)', marginTop: '0.6rem', fontStyle: 'italic', lineHeight: 1.5 }}>
          La deuda per cápita ha crecido un {crecimientoPerCap.toFixed(0)}% desde 2012, mientras la mediana salarial ha subido apenas un 36% en el mismo periodo. La deuda pública sube más rápido que tu sueldo.
        </p>
      </div>

      {/* === SIMULACIÓN DE AMORTIZACIÓN === */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="eyebrow">Simulación · escenario imposible</div>
        <h3 className="display-md serif" style={{ margin: '0.2rem 0 0.8rem' }}>Si destinaras el 100% de tu IRPF a tu deuda</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '0.8rem' }}>
          Cuántos años harían falta para amortizar tus {fmtEUR(datos.perCapita)} de cuota personal, asumiendo deuda congelada y aportando {fmtEUR(irpfAnual)} cada año.
        </p>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
          <BarChart data={proyeccion} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#8a7d70" opacity={0.3} />
            <XAxis dataKey="anio" stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} label={isMobile ? null : { value: 'Años destinando todo tu IRPF', position: 'insideBottom', offset: -2, fontSize: 11, fontFamily: 'Inter Tight' }} />
            <YAxis stroke="#1a1613" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={48} />
            <Tooltip
              contentStyle={{ background: '#f5f1e8', border: '1.5px solid #1a1613', borderRadius: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              formatter={(v) => [fmtEUR(v), 'Pendiente']}
              labelFormatter={(l) => `Año ${l}`}
            />
            <ReferenceLine y={0} stroke="#1a1613" strokeWidth={1.5} />
            <Bar dataKey="pendiente" fill="#8b1e2c" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === NOTA METODOLÓGICA === */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--paper-dark)' }}>
        <div className="eyebrow">Metodología y fuentes</div>
        <h4 className="serif" style={{ margin: '0.4rem 0 0.6rem', fontSize: '1.05rem', fontWeight: 600 }}>Sobre los datos de deuda</h4>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--ink-soft)', marginBottom: '0.6rem' }}>
          Los datos de deuda total y % PIB proceden del <strong>Banco de España</strong>, criterio Protocolo de Déficit Excesivo (PDE) — el indicador estandarizado de Eurostat. La población corresponde a la Estadística Continua de Población (ECP) del INE.
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--ink-soft)', marginBottom: '0.6rem' }}>
          La cifra per cápita resulta de dividir la deuda total entre la población residente. Es un <strong>cálculo aritmético, no un compromiso individual real</strong>: la deuda no se reparte personalmente entre ciudadanos, se amortiza mediante impuestos generales presentes y futuros.
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--ink-soft)' }}>
          El cálculo de "años de IRPF" es una <strong>ilustración divulgativa</strong>: muestra el orden de magnitud de la carga fiscal personal frente al endeudamiento del Estado, asumiendo que la deuda no creciera más y que tu IRPF actual se mantuviera constante. Sirve para dimensionar el problema, no como predicción contable.
        </p>
      </div>
    </div>
  );
};

/* =========================================================================
   CRONOLOGÍA
   ========================================================================= */

const TimelineSection = () => {
  const hitos = [
    { anio: 2012, tag: 'IRPF', titulo: 'Gravamen complementario Rajoy', texto: 'RD-ley 20/2011. Recargo temporal con tipos hasta el 52% para rentas >300k€. 7 tramos. Mínimo personal: 5.151€.' },
    { anio: 2015, tag: 'IRPF', titulo: 'Reforma Montoro — Fase I', texto: 'Ley 26/2014. Simplificación a 5 tramos, máximo 46%. Gastos deducibles 2.000€ (art. 19.2.f). Mínimo personal a 5.550€.' },
    { anio: 2016, tag: 'IRPF', titulo: 'Reforma Montoro — Fase II', texto: 'Tipo mínimo al 19%, máximo al 45%. Esta escala vigente sin cambios hasta 2020.' },
    { anio: 2018, tag: 'IRPF', titulo: 'Nueva reducción art. 20', texto: 'PGE 2018: ampliación de la reducción por rendimientos del trabajo bajos (3.700€ → 5.565€).' },
    { anio: 2021, tag: 'IRPF', titulo: 'Nuevo tramo 47%', texto: 'Ley 11/2020 PGE. Se añade un 6º tramo para bases >300k€ al 47% estatal+autonómico.' },
    { anio: 2023, tag: 'AUT', titulo: 'Nuevo sistema cotización autónomos', texto: 'RD-ley 13/2022. Sistema de cotización por ingresos reales. 15 tramos según rendimiento neto. Despliegue gradual hasta 2032. Implica subida para autónomos con ingresos altos y bajada para los de ingresos modestos.' },
    { anio: 2023, tag: 'SS', titulo: 'MEI', texto: 'Ley 21/2021. Cotización adicional 0,6% (0,5% empresa / 0,1% trabajador). Escalado progresivo hasta 2029 (1,2%).' },
    { anio: 2023, tag: 'CCAA', titulo: 'Andalucía rebaja su IRPF', texto: 'Ley 7/2022. Bajada del tipo mínimo y máximo autonómico. Es la primera "guerra fiscal" autonómica relevante post-pandemia.' },
    { anio: 2023, tag: 'IRPF', titulo: 'Ampliación reducción art. 20', texto: 'RD-ley 18/2022. Umbral superior a 19.747,5€, reducción máxima 6.498€.' },
    { anio: 2024, tag: 'CCAA', titulo: 'Madrid rebaja su IRPF', texto: 'Ley 4/2024. Madrid baja todos sus tramos autonómicos, consolidándose como la CCAA con menor presión fiscal del régimen común.' },
    { anio: 2024, tag: 'IRPF', titulo: 'Segunda ampliación + nuevo mínimo', texto: 'RD-ley 8/2023. Reducción máxima 7.302€. Mínimo exento de retención a 15.876€.' },
    { anio: 2025, tag: 'SS', titulo: 'Cuota de Solidaridad + Deducción SMI', texto: 'RD 322/2024. Cuota tripartita sobre exceso de base máxima: 0,92% / 1,00% / 1,17%. Reparto 5/6 empresa, 1/6 trabajador. Deducción IRPF 340€ rentas SMI.' },
    { anio: 2026, tag: 'SS', titulo: 'MEI 0,9% + Solidaridad al alza', texto: 'MEI sube al 0,9% (0,75% empresa / 0,15% trabajador). Solidaridad: 1,15% / 1,25% / 1,46%. Deducción SMI: 590,89€.' },
  ];

  const tagColor = { IRPF: 'var(--crimson)', SS: 'var(--slate)', AUT: 'var(--ochre)', CCAA: 'var(--olive)' };

  return (
    <div className="section-wrap-narrow fade-up">
      <div className="eyebrow">Módulo 04</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1rem' }}>Quince años de retoques al BOE</h1>
      <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: '2rem' }}>
        Las reformas IRPF se concentran en la base y reducciones para rentas bajas, pero los <strong>tramos no se han tocado desde 2016</strong>. La cotización siempre sube. Las CCAA empezaron a divergir en 2023.
      </p>

      <div className="timeline-wrap">
        <div className="timeline-line" />
        {hitos.map((h, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: '1.5rem', paddingBottom: '1.2rem', borderBottom: i < hitos.length - 1 ? '1px dashed var(--ink-faded)' : 'none' }}>
            <div className="timeline-dot" style={{ background: tagColor[h.tag] }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <div className="serif num" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 500, lineHeight: 1, color: 'var(--ink)' }}>{h.anio}</div>
              <div className="chip" style={{ background: tagColor[h.tag], color: 'var(--paper)', borderColor: tagColor[h.tag] }}>{h.tag}</div>
            </div>
            <h3 className="serif" style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.4rem)', fontWeight: 500, margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>{h.titulo}</h3>
            <p style={{ fontSize: '0.94rem', lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0 }}>{h.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   MANUAL
   ========================================================================= */

const ManualSection = () => {
  const pasos = [
    { num: '01', tit: 'Cotizaciones (asalariado)', texto: 'Tu retribución bruta cotiza hasta la base máxima (61.214,4€ en 2026). El trabajador paga ~6,48% + MEI (0,9% combinado en 2026, 0,15% por su parte). Desde 2025, sobre el exceso de la base máxima se aplica además la Cuota de Solidaridad.', formula: 'cotización_trab = base_cot × (6,48% + MEI)' },
    { num: '01b', tit: 'Cotizaciones (autónomo)', texto: 'Desde 2023, el autónomo cotiza por ingresos reales: 15 tramos. Su rendimiento neto mensual lo asigna a una base mínima obligatoria. Sobre esa base aplica el tipo combinado (~31,5% en 2026, incluye MEI). Sin empleador: paga el 100%.', formula: 'cuota_autónomo = base_min(rendimiento) × 12 × 31,5%' },
    { num: '02', tit: 'Rendimiento neto del trabajo', texto: 'Bruto menos cotizaciones del trabajador. A los asalariados se les aplica un gasto fijo deducible de 2.000€ (art. 19.2.f) y la reducción art. 20 (rentas bajas, hasta 7.302€ en 2026). A los autónomos en estimación directa simplificada se les aplica un 5% por gastos de difícil justificación, con máximo de 2.000€.', formula: 'rendimiento_previo = bruto − ss_trab − gastos − red_art_20' },
    { num: '03', tit: 'Tributación conjunta', texto: 'Si tributas con tu cónyuge sin renta, se aplica una reducción adicional de 3.400€ a la base imponible. No siempre compensa: si ambos cobráis, suele salir mejor declarar individualmente.', formula: 'base_liquidable = base_imponible − 3.400€' },
    { num: '04', tit: 'CCAA y la mitad autonómica', texto: 'El IRPF tiene dos mitades. La estatal es común. La autonómica la fija cada CCAA (con plena soberanía sobre su mitad). Madrid bajó tipos en 2024; Cataluña y Valencia tienen los marginales máximos más altos. País Vasco y Navarra tienen régimen foral propio (no se modela aquí).', formula: 'tipo_total = tipo_estatal + tipo_autonómico' },
    { num: '05', tit: 'Cuota íntegra por tramos', texto: 'Sobre la base liquidable se aplica la escala combinada. Cada euro tributa al tipo del tramo en el que cae. La cuota es el sumatorio.', formula: 'cuota_íntegra = Σ (base_tramo_i × tipo_combinado_i)' },
    { num: '06', tit: 'Mínimo personal y familiar', texto: 'Se calcula sumando: 5.550€ personal + 2.400€ por el 1er hijo + 2.700€ por el 2º + 4.000€ por el 3º + 4.500€ por el 4º y siguientes. Cada hijo menor de 3 años suma 2.800€. Cada ascendiente >65 a cargo: 1.150€. La cuota correspondiente a este total se RESTA de la íntegra.', formula: 'cuota_mín_PyF = aplicar_escala(5.550 + Σhijos + Σascendientes)' },
    { num: '07', tit: 'Deducciones y SMI', texto: 'Desde 2025, hay una deducción específica para rentas cercanas al SMI (340€ en 2025, 590,89€ en 2026). Se descuenta de la cuota líquida.', formula: 'cuota_líquida = cuota_íntegra − cuota_mín_PyF − deducción_SMI' },
    { num: '08', tit: 'Límite 43% y neto', texto: 'En el asalariado, la retención mensual no puede superar el 43% del exceso sobre el mínimo exento (art. 85.3 RIRPF). En el autónomo no hay retención, paga trimestralmente (modelo 130).', formula: 'neto = bruto − ss − irpf' },
  ];

  return (
    <div className="section-wrap-narrow fade-up">
      <div className="eyebrow">Módulo 05</div>
      <h1 className="display-lg serif" style={{ margin: '0.6rem 0 1rem' }}>Tu nómina, en 8 pasos</h1>
      <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.1rem)', lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: '2rem' }}>
        El algoritmo exacto del simulador. Aplica para asalariados y autónomos, en cualquier CCAA del régimen común, con la situación familiar real.
      </p>

      {pasos.map((p, i) => (
        <div key={i} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px dashed var(--ink-faded)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <div className="serif num" style={{ fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', fontWeight: 500, color: 'var(--crimson)', lineHeight: 0.9, letterSpacing: '-0.03em' }}>{p.num}</div>
            <h3 className="serif" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>{p.tit}</h3>
          </div>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.02rem)', lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: '0.8rem' }}>{p.texto}</p>
          <div style={{ padding: '0.7rem 0.9rem', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', overflowX: 'auto' }}>
            {p.formula}
          </div>
        </div>
      ))}

      <div className="card-deep" style={{ marginTop: '2rem' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Glosario</div>
        <div className="grid-2">
          {[
            ['IRPF', 'Impuesto sobre la Renta de las Personas Físicas. Mitad estatal + mitad autonómica.'],
            ['Base máxima', 'Límite anual para cotizar SS. Lo que ganas por encima no cotiza (salvo Solidaridad).'],
            ['Tipo marginal', 'Tipo que pagarías por el próximo euro extra que ganes.'],
            ['Tipo efectivo', 'Tipo medio real sobre tu bruto total.'],
            ['Mínimo personal y familiar', 'Cuantía exenta de tributación por el contribuyente, hijos y ascendientes a cargo.'],
            ['Tributación conjunta', 'Modalidad que reduce 3.400€ la base imponible para parejas con un cónyuge sin renta.'],
            ['Régimen foral', 'País Vasco y Navarra. IRPF propio con escalas y deducciones distintas.'],
            ['Sistema de ingresos reales', 'Nuevo modelo de cotización autónomos desde 2023: cotizan según rendimiento.'],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="serif" style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ochre)', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: '0.83rem', lineHeight: 1.5, color: 'rgba(245,241,232,0.85)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   FOOTER
   ========================================================================= */

const Footer = () => (
  <footer style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '2.5rem 1rem 1.5rem', marginTop: '1.5rem' }}>
    <div className="footer-grid">
      <div>
        <div className="serif" style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 10 }}>La mordida silenciosa</div>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'rgba(245,241,232,0.7)' }}>
          Auditoría ciudadana del IRPF español 2012-2026. Asalariado o autónomo, cualquier CCAA del régimen común, con tu situación familiar real.
        </p>
      </div>
      <div>
        <div className="eyebrow" style={{ color: 'var(--ochre)', marginBottom: 10 }}>Cobertura</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', lineHeight: 1.8, color: 'rgba(245,241,232,0.7)' }}>
          <li>Asalariados (Régimen General)</li>
          <li>Autónomos (sistema 2023+)</li>
          <li>15 CCAA del régimen común</li>
          <li>Mínimos por hijos y ascendientes</li>
          <li>Tributación conjunta</li>
        </ul>
      </div>
      <div>
        <div className="eyebrow" style={{ color: 'var(--ochre)', marginBottom: 10 }}>No modelado</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', lineHeight: 1.8, color: 'rgba(245,241,232,0.7)' }}>
          <li>País Vasco / Navarra (foral)</li>
          <li>Rentas del ahorro (cap. mob.)</li>
          <li>Mínimos por discapacidad</li>
          <li>Deducciones autonómicas</li>
          <li>Divergencia autonómica pre-2024</li>
        </ul>
      </div>
    </div>
    <div style={{ borderTop: '1px solid rgba(245,241,232,0.2)', marginTop: '2rem', paddingTop: '1.2rem', fontSize: '0.7rem', color: 'rgba(245,241,232,0.5)', textAlign: 'center' }} className="mono">
      MOTOR v2.0 · DATOS 2012–2026 · AUDITORÍA ABIERTA
    </div>
  </footer>
);

/* =========================================================================
   APP ROOT
   ========================================================================= */

export default function App() {
  const [tab, setTab] = useState('home');
  return (
    <>
      <GlobalStyles />
      <div className="app-root">
        <TabNav active={tab} onChange={setTab} />
        {tab === 'home' && <HomeSection setTab={setTab} />}
        {tab === 'calc' && <CalculatorSection />}
        {tab === 'comp' && <ComparatorSection />}
        {tab === 'brackets' && <BracketsSection />}
        {tab === 'curve' && <CurvaIRPFSection />}
        {tab === 'distrib' && <DistribucionSection />}
        {tab === 'ocde' && <OcdeSection />}
        {tab === 'debt' && <DebtSection />}
        {tab === 'history' && <TimelineSection />}
        {tab === 'manual' && <ManualSection />}
        <Footer />
      </div>
    </>
  );
}
