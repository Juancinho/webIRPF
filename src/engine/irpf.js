// =============================================================================
// MOTOR FISCAL IRPF 2012-2026
// Traducción directa del código Python original del autor
// =============================================================================

export const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);

export const IPC_ANUAL_DIC = {
  2013: 0.003, 2014: -0.010, 2015: 0.000, 2016: 0.016, 2017: 0.011,
  2018: 0.012, 2019: 0.008, 2020: -0.005, 2021: 0.065, 2022: 0.057,
  2023: 0.031, 2024: 0.028, 2025: 0.029, 2026: 0.030
};

// SMI anual (14 pagas × tarifa mensual oficial — RD aprobado cada año)
export const SMI_ANUAL = {
  2012: 8979.60, 2013: 9034.20, 2014: 9034.20, 2015: 9080.40,
  2016: 9172.80, 2017: 9906.60, 2018: 10302.60, 2019: 12600.00,
  2020: 13300.00, 2021: 13300.00, 2022: 14000.00, 2023: 15120.00,
  2024: 15876.00, 2025: 16576.00, 2026: 17094.00,
};

export const REFORMA_ANIOS = [
  { anio: 2015, label: 'Reforma 2015', color: '#facc15' },
  { anio: 2019, label: 'Ampliación Art.20', color: '#38bdf8' },
  { anio: 2023, label: 'MEI + tramo 47%', color: '#a78bfa' },
];

export function inflacionAcumulada(anioBase, anioDestino = 2026) {
  if (anioBase === anioDestino) return 1.0;
  let mult = 1.0;
  for (let a = anioBase + 1; a <= anioDestino; a++) mult *= (1 + IPC_ANUAL_DIC[a]);
  return mult;
}

export const INFLACION_A_2026 = {};
for (const a of ANIOS) INFLACION_A_2026[a] = inflacionAcumulada(a, 2026);

const BASE_MAX = {
  2012: 39150, 2013: 41108.4, 2014: 43164, 2015: 43272, 2016: 43704,
  2017: 45014.4, 2018: 45014.4, 2019: 48841.2, 2020: 48841.2, 2021: 48841.2,
  2022: 49672.8, 2023: 53946, 2024: 56646, 2025: 58914, 2026: 61214.4
};

const MINIMO_EXENTO = {
  2012: 11162, 2013: 11162, 2014: 11162, 2015: 12000, 2016: 12000, 2017: 12000,
  2018: 12643, 2019: 14000, 2020: 14000, 2021: 14000, 2022: 14000, 2023: 15000,
  2024: 15876, 2025: 15876, 2026: 15876
};

export function getArt20Meta(anio) {
  if (anio <= 2014) return { uInf: 9180, rMax: 4080, uSup: 13260, rMin: 2652 };
  if (anio <= 2017) return { uInf: 11250, rMax: 3700, uSup: 14450, rMin: 0 };
  if (anio === 2018) return { uInf: null, rMax: null, uSup: null, label: 'Régimen transitorio (media 2017/2019)' };
  if (anio <= 2022) return { uInf: 13115, rMax: 5565, uSup: 16825, rMin: 0 };
  if (anio === 2023) return { uInf: 14047.5, rMax: 6498, uSup: 19747.5, rMin: 0 };
  return { uInf: 14852, rMax: 7302, uSup: 19747.5, rMin: 0 };
}

// Exportada para GraficoMecanismos
export function reduccionTrabajo(anio, rn) {
  if (anio <= 2014) {
    if (rn <= 9180) return 4080;
    if (rn <= 13260) return 4080 - 0.35 * (rn - 9180);
    return 2652;
  }
  if (anio <= 2017) {
    if (rn <= 11250) return 3700;
    if (rn <= 14450) return 3700 - 1.15625 * (rn - 11250);
    return 0;
  }
  if (anio === 2018) {
    const pre = rn <= 11250 ? 3700 : rn <= 14450 ? 3700 - 1.15625 * (rn - 11250) : 0;
    const post = rn <= 13115 ? 5565 : rn <= 16825 ? Math.max(0, 5565 - 1.5 * (rn - 13115)) : 0;
    return pre / 2 + post / 2;
  }
  if (anio <= 2022) {
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
}

export function getTramosIRPF(anio) {
  if (anio <= 2014) return [[17707,0.2475],[33007,0.30],[53407,0.40],[120000,0.47],[175000,0.49],[300000,0.51],[Infinity,0.52]];
  if (anio === 2015) return [[12450,0.195],[20200,0.245],[34000,0.305],[60000,0.38],[Infinity,0.46]];
  if (anio <= 2020) return [[12450,0.19],[20200,0.24],[35200,0.30],[60000,0.37],[Infinity,0.45]];
  return [[12450,0.19],[20200,0.24],[35200,0.30],[60000,0.37],[300000,0.45],[Infinity,0.47]];
}

function deduccionSMI(anio, bruto) {
  if (anio === 2026) return bruto <= 17094 ? 590.89 : Math.max(0, 590.89 - 0.20 * (bruto - 17094));
  if (anio === 2025) return bruto <= 16576 ? 340 : bruto <= 18276 ? Math.max(0, 340 - 0.20 * (bruto - 16576)) : 0;
  return 0;
}

function getSSTipos(anio) {
  const mei = anio === 2023 ? [0.005,0.001] : anio === 2024 ? [0.0058,0.0012] : anio === 2025 ? [0.0067,0.0013] : anio >= 2026 ? [0.0075,0.0015] : [0,0];
  const baseEmp = 0.236 + 0.055 + 0.002 + 0.006 + 0.015;
  const baseTra = 0.047 + 0.0155 + 0 + 0.001 + 0;
  return { tipoEmp: baseEmp + mei[0], tipoTra: baseTra + mei[1], mei };
}

function solidaridadCuota(anio, exceso, baseMax) {
  if (exceso <= 0) return 0;
  const tramos = anio === 2025
    ? [[baseMax * 0.10, 0.0092],[baseMax * 0.50, 0.0100],[Infinity, 0.0117]]
    : [[baseMax * 0.10, 0.0115],[baseMax * 0.50, 0.0125],[Infinity, 0.0146]];
  let q = 0, prev = 0;
  for (const [lim, tipo] of tramos) {
    const chunk = Math.min(Math.max(0, exceso - prev), lim - prev);
    q += chunk * tipo;
    prev = lim;
    if (exceso <= lim) break;
  }
  return q;
}

function calcularCuotaIRPF(baseImp, tramos) {
  let q = 0, limAnt = 0;
  for (const [lim, tipo] of tramos) {
    if (baseImp > lim) { q += (lim - limAnt) * tipo; limAnt = lim; }
    else { q += (baseImp - limAnt) * tipo; break; }
  }
  return q;
}

export function calcularNomina(bruto, anio) {
  const baseMax = BASE_MAX[anio];
  const { tipoEmp, tipoTra, mei } = getSSTipos(anio);
  const tramos = getTramosIRPF(anio);
  const irpfMinimo = anio <= 2014 ? 5151 : 5550;
  const minimoExento = MINIMO_EXENTO[anio];
  const gastosFijos = anio <= 2014 ? 0 : 2000;

  const baseCot = Math.min(bruto, baseMax);
  const exceso = Math.max(0, bruto - baseMax);
  let cotEmp = baseCot * tipoEmp;
  let cotTra = baseCot * tipoTra;

  if (anio >= 2025 && exceso > 0) {
    const qSol = solidaridadCuota(anio, exceso, baseMax);
    cotEmp += qSol * (5 / 6);
    cotTra += qSol * (1 / 6);
  }

  const costeLab = bruto + cotEmp;
  const rnPrevio = bruto - cotTra;
  const redTrabajo = Math.max(0, reduccionTrabajo(anio, rnPrevio));
  const rendimientoNeto = Math.max(0, rnPrevio - gastosFijos);
  const baseImponible = Math.max(0, rendimientoNeto - redTrabajo);
  const cuotaIntegra = calcularCuotaIRPF(baseImponible, tramos);
  const cuotaMinimo = irpfMinimo * tramos[0][1];
  const cuotaTeorica = Math.max(0, cuotaIntegra - cuotaMinimo);
  const deduccion = deduccionSMI(anio, bruto);
  const cuotaSMI = Math.max(0, cuotaTeorica - deduccion);
  const limiteRetencion = Math.max(0, (bruto - minimoExento) * 0.43);
  const irpfFinal = Math.min(cuotaSMI, limiteRetencion);
  const salarioNeto = bruto - cotTra - irpfFinal;

  return {
    bruto, anio,
    cotEmp: r2(cotEmp), cotTra: r2(cotTra), costeLab: r2(costeLab),
    rnPrevio: r2(rnPrevio), gastosFijos, rendimientoNeto: r2(rendimientoNeto),
    redTrabajo: r2(redTrabajo), baseImponible: r2(baseImponible),
    cuotaIntegra: r2(cuotaIntegra), cuotaMinimo: r2(cuotaMinimo),
    cuotaTeorica: r2(cuotaTeorica), deduccionSMI: r2(deduccion),
    cuotaSMI: r2(cuotaSMI), limiteRetencion: r2(limiteRetencion),
    irpfFinal: r2(irpfFinal), salarioNeto: r2(salarioNeto),
    tipoEfectivoIRPF: bruto > 0 ? irpfFinal / bruto : 0,
    tipoEfectivoTotal: bruto > 0 ? (cotTra + irpfFinal) / bruto : 0,
    mei, tramos, gastosFijos,
  };
}

export function calcularTipoMarginal(bruto, anio, delta = 100) {
  if (bruto === 0) return { netoMarginal: 1, tipoMarginalTotal: 0, tipoMarginalIRPF: 0 };
  const n1 = calcularNomina(bruto, anio);
  const n2 = calcularNomina(bruto + delta, anio);
  const difNeto = n2.salarioNeto - n1.salarioNeto;
  const difIRPF = n2.irpfFinal - n1.irpfFinal;
  return {
    netoMarginal: r2(difNeto / delta),
    tipoMarginalTotal: r2(1 - difNeto / delta),
    tipoMarginalIRPF: r2(difIRPF / delta),
  };
}

// ── Datos precomputados para gráfico comparativo (X = €2026) ──
export const SALARIOS_CHART = Array.from({ length: 171 }, (_, i) => 15000 + i * 500);

export const DATOS_CHART = SALARIOS_CHART.map(bruto2026 => {
  const point = { bruto: bruto2026 };
  for (const anio of ANIOS) {
    const inf = INFLACION_A_2026[anio];
    const n = calcularNomina(bruto2026 / inf, anio);
    const marg = calcularTipoMarginal(bruto2026 / inf, anio);
    point[`neto_${anio}`]     = Math.round(n.salarioNeto * inf);
    point[`irpf_${anio}`]     = parseFloat((n.tipoEfectivoIRPF * 100).toFixed(2));
    point[`total_${anio}`]    = parseFloat((n.tipoEfectivoTotal * 100).toFixed(2));
    point[`marginal_${anio}`] = parseFloat((marg.tipoMarginalTotal * 100).toFixed(2));
  }
  return point;
});

// ── Curva de la reducción Art.20 por años clave (X = rendimiento neto previo) ──
const ANIOS_ART20 = [2012, 2015, 2019, 2023, 2024, 2026];
export const CURVA_ART20 = Array.from({ length: 261 }, (_, i) => i * 100).map(rn => {
  const p = { rn };
  for (const a of ANIOS_ART20) p[`red_${a}`] = Math.max(0, reduccionTrabajo(a, rn));
  return p;
});
export const ANIOS_ART20_MUESTRA = ANIOS_ART20;

// ── Evolución de umbrales nominales por año ──
export const DATOS_UMBRALES = ANIOS.map(anio => {
  const meta = getArt20Meta(anio);
  const { tipoEmp, tipoTra } = getSSTipos(anio);
  return {
    anio,
    smi: SMI_ANUAL[anio],
    minExento: MINIMO_EXENTO[anio],
    art20Inf: typeof meta.uInf === 'number' ? meta.uInf : null,
    art20Sup: typeof meta.uSup === 'number' ? meta.uSup : null,
    art20Max: typeof meta.rMax === 'number' ? meta.rMax : null,
    baseMax: BASE_MAX[anio],
  };
});

export function obtenerParametros(anio) {
  const { tipoEmp, tipoTra, mei } = getSSTipos(anio);
  return {
    baseMax: BASE_MAX[anio], tipoEmp, tipoTra, mei,
    irpfMinimo: anio <= 2014 ? 5151 : 5550,
    minimoExento: MINIMO_EXENTO[anio],
    gastosFijos: anio <= 2014 ? 0 : 2000,
    art20Meta: getArt20Meta(anio),
    tramos: getTramosIRPF(anio),
    hasSolidaridad: anio >= 2025,
    smi: SMI_ANUAL[anio],
  };
}

function r2(n) { return Math.round(n * 100) / 100; }
