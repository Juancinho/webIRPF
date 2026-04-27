// =============================================================================
// MOTOR FISCAL IRPF 2012-2026  — versión extendida
// Soporta: asalariado / autónomo · CCAA · tributación conjunta · cargas familiares
// =============================================================================

export const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);

export const IPC_ANUAL_DIC = {
  2013: 0.003, 2014: -0.010, 2015: 0.000, 2016: 0.016, 2017: 0.011,
  2018: 0.012, 2019: 0.008, 2020: -0.005, 2021: 0.065, 2022: 0.057,
  2023: 0.031, 2024: 0.028, 2025: 0.029, 2026: 0.030
};

export const SMI_ANUAL = {
  2012: 8979.60, 2013: 9034.20, 2014: 9034.20, 2015: 9080.40,
  2016: 9172.80, 2017: 9906.60, 2018: 10302.60, 2019: 12600.00,
  2020: 13300.00, 2021: 13300.00, 2022: 14000.00, 2023: 15120.00,
  2024: 15876.00, 2025: 16576.00, 2026: 17094.00,
};

export const REFORMA_ANIOS = [
  { anio: 2015, label: 'Reforma 2015', color: '#facc15' },
  { anio: 2019, label: 'Ampliación Art.20', color: '#d4a853' },
  { anio: 2023, label: 'MEI + tramo 47%', color: '#a78bfa' },
];

// ── Comunidades Autónomas (escalas combinadas 2024+) ────────────────────────
// Pre-2024: divergencias autonómicas menores, se usa la escala estándar.
// 2024+: las CCAA que han modificado su parte autonómica usan escala propia.
// Fuentes: BOE, leyes autonómicas de medidas tributarias 2024-2026.
export const REGIONES = {
  default: {
    name: 'Estándar / Resto CCAA',
    desc: 'Aragón, Asturias, Baleares, Cantabria, Castilla-La Mancha, Castilla y León, Extremadura, Galicia, La Rioja, Murcia, Canarias, Ceuta y Melilla. Diferencias menores entre ellas; se aplica la escala promedio estándar.',
    tramos2024: null,
  },
  madrid: {
    name: 'C. de Madrid',
    desc: 'Tras la rebaja de 2023-2024 (Ley 4/2024), Madrid es la CCAA con la fiscalidad más baja del régimen común. Su tipo mínimo baja al 18% y el máximo al 45,5%.',
    tramos2024: [[12450,0.18],[17707,0.215],[33007,0.27],[53407,0.355],[60000,0.405],[300000,0.435],[Infinity,0.455]],
  },
  cataluna: {
    name: 'Cataluña',
    desc: 'Cataluña tiene el tipo marginal máximo más alto (50%) y más tramos que cualquier otra CCAA del régimen común.',
    tramos2024: [[12450,0.215],[17707,0.24],[21000,0.265],[33007,0.295],[53407,0.35],[90000,0.415],[120000,0.45],[175000,0.47],[Infinity,0.50]],
  },
  valencia: {
    name: 'C. Valenciana',
    desc: 'Tipos elevados en tramos altos (hasta 54%). Pequeñas rebajas en tramos bajos desde 2023.',
    tramos2024: [[12450,0.195],[20200,0.24],[35200,0.30],[60000,0.37],[120000,0.455],[175000,0.475],[Infinity,0.54]],
  },
  andalucia: {
    name: 'Andalucía',
    desc: 'Tras la rebaja de 2022-2023 (Ley 7/2022), Andalucía bajó significativamente sus tipos y se sitúa entre las CCAA más competitivas fiscalmente.',
    tramos2024: [[12450,0.185],[20200,0.235],[28000,0.295],[35200,0.305],[60000,0.365],[300000,0.435],[Infinity,0.455]],
  },
  foral: {
    name: 'País Vasco / Navarra',
    desc: 'Régimen foral propio (Concierto Económico / Convenio). Sus IRPF se calculan con escalas y deducciones distintas al régimen común. Aquí se aplica la escala estándar como aproximación orientativa.',
    tramos2024: null,
    foral: true,
  },
};

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

export function getTramosConCCAA(anio, ccaa = 'default') {
  if (anio < 2024) return getTramosIRPF(anio);
  const reg = REGIONES[ccaa];
  if (reg?.tramos2024) return reg.tramos2024;
  return getTramosIRPF(anio);
}

// ── SS tipos ─────────────────────────────────────────────────────────────────
function getSSTipos(anio) {
  const mei = anio === 2023 ? [0.005,0.001]
    : anio === 2024 ? [0.0058,0.0012]
    : anio === 2025 ? [0.0067,0.0013]
    : anio >= 2026  ? [0.0075,0.0015]
    : [0,0];
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

function calcularCuotaIRPF(base, tramos) {
  let q = 0, limAnt = 0;
  for (const [lim, tipo] of tramos) {
    if (base > lim) { q += (lim - limAnt) * tipo; limAnt = lim; }
    else { q += (base - limAnt) * tipo; break; }
  }
  return q;
}

function deduccionSMI(anio, bruto) {
  if (anio === 2026) return bruto <= 17094 ? 590.89 : Math.max(0, 590.89 - 0.20 * (bruto - 17094));
  if (anio === 2025) return bruto <= 16576 ? 340 : bruto <= 18276 ? Math.max(0, 340 - 0.20 * (bruto - 16576)) : 0;
  return 0;
}

// ── Régimen autónomo ──────────────────────────────────────────────────────────
// Tabla 2023+: [tope rendimiento mensual, base cotización mensual mínima]
const SS_AUTONOMO_TABLA_2023 = [
  [670, 735.29], [900, 816.99], [1166.7, 872.55], [1300, 950.98],
  [1500, 960.78], [1700, 960.78], [1850, 1143.79], [2030, 1209.15],
  [2330, 1274.51], [2760, 1356.21], [3190, 1437.91], [3620, 1519.61],
  [4050, 1601.31], [6000, 1732.03], [Infinity, 1928.10],
];

function tipoAutonomoCombinado(anio) {
  if (anio >= 2026) return 0.315;
  if (anio === 2025) return 0.313;
  if (anio === 2024) return 0.3118;
  if (anio === 2023) return 0.3110;
  return 0.298;
}

export function calcularSSAutonomo(rendimientoNetoAnual, anio) {
  const tipo = tipoAutonomoCombinado(anio);
  if (anio < 2023) {
    const baseMensual = anio <= 2014 ? 858.6
      : anio <= 2017 ? 893.10
      : anio <= 2020 ? 944.40
      : 960.60;
    return baseMensual * 12 * tipo;
  }
  const monthly = Math.max(0, rendimientoNetoAnual) / 12;
  let baseMin = SS_AUTONOMO_TABLA_2023[SS_AUTONOMO_TABLA_2023.length - 1][1];
  for (const [tope, base] of SS_AUTONOMO_TABLA_2023) {
    if (monthly < tope) { baseMin = base; break; }
  }
  return baseMin * 12 * tipo;
}

// ── Mínimos personales y familiares (LIRPF arts. 56-61) ──────────────────────
const VALORES_HIJOS = [2400, 2700, 4000, 4500, 4500];
const BONO_HIJO_MENOR_3 = 2800;
const VALOR_ASCENDIENTE = 1150;
export const REDUCCION_CONJUNTA = 3400;

export function calcularMinimoFamiliar({ nHijos = 0, nHijosMenores3 = 0, nAscendientes = 0 } = {}) {
  let m = 0;
  for (let i = 0; i < nHijos; i++) m += VALORES_HIJOS[Math.min(i, VALORES_HIJOS.length - 1)];
  m += Math.min(nHijosMenores3, nHijos) * BONO_HIJO_MENOR_3;
  m += nAscendientes * VALOR_ASCENDIENTE;
  return m;
}

// ── Calculadora principal ─────────────────────────────────────────────────────
export const DEFAULT_OPTS = {
  regimen: 'asalariado',
  ccaa: 'default',
  tributacion: 'individual',
  nHijos: 0,
  nHijosMenores3: 0,
  nAscendientes: 0,
};

export function calcularNomina(bruto, anio, opts = {}) {
  const {
    regimen = 'asalariado',
    ccaa = 'default',
    tributacion = 'individual',
    nHijos = 0, nHijosMenores3 = 0, nAscendientes = 0,
  } = opts;

  const tramos = getTramosConCCAA(anio, ccaa);
  const minimoPersonal = anio <= 2014 ? 5151 : 5550;
  const minimoFamiliar = calcularMinimoFamiliar({ nHijos, nHijosMenores3, nAscendientes });
  const minimoPersonalYFamiliar = minimoPersonal + minimoFamiliar;

  if (regimen === 'autonomo') {
    const cotTra = calcularSSAutonomo(bruto, anio);
    const rnPrevio = bruto - cotTra;
    const gastosFijos = anio >= 2018 ? Math.min(Math.max(0, rnPrevio * 0.05), 2000) : 0;
    const rendimientoNeto = Math.max(0, rnPrevio - gastosFijos);
    const reduccionConjunta = tributacion === 'conjunta' ? Math.min(REDUCCION_CONJUNTA, rendimientoNeto) : 0;
    const baseImponible = Math.max(0, rendimientoNeto - reduccionConjunta);
    const cuotaIntegra = calcularCuotaIRPF(baseImponible, tramos);
    const cuotaMinimo = calcularCuotaIRPF(minimoPersonalYFamiliar, tramos);
    const cuotaTeorica = Math.max(0, cuotaIntegra - cuotaMinimo);
    const irpfFinal = cuotaTeorica;
    const salarioNeto = bruto - cotTra - irpfFinal;

    let tipoMargIRPF = tramos[0][1];
    for (const [lim, tipo] of tramos) {
      if (baseImponible <= lim) { tipoMargIRPF = tipo; break; }
      tipoMargIRPF = tipo;
    }

    return {
      bruto, anio, regimen: 'autonomo',
      cotEmp: 0, cotTra: r2(cotTra), costeLab: r2(bruto),
      rnPrevio: r2(rnPrevio), gastosFijos: r2(gastosFijos),
      rendimientoNeto: r2(rendimientoNeto), redTrabajo: 0,
      baseImponible: r2(baseImponible), reduccionConjunta: r2(reduccionConjunta),
      minimoPersonal, minimoFamiliar, minimoPersonalYFamiliar,
      cuotaIntegra: r2(cuotaIntegra), cuotaMinimo: r2(cuotaMinimo),
      cuotaTeorica: r2(cuotaTeorica), deduccionSMI: 0,
      cuotaSMI: r2(cuotaTeorica), limiteRetencion: Infinity,
      irpfFinal: r2(irpfFinal), salarioNeto: r2(salarioNeto),
      tipoEfectivoIRPF: bruto > 0 ? irpfFinal / bruto : 0,
      tipoEfectivoTotal: bruto > 0 ? (cotTra + irpfFinal) / bruto : 0,
      tipoMargIRPF,
      cunaFiscal: bruto > 0 ? (bruto - salarioNeto) / bruto : 0,
      mei: [0, 0], tramos,
    };
  }

  // === ASALARIADO ===
  const baseMax = BASE_MAX[anio];
  const { tipoEmp, tipoTra, mei } = getSSTipos(anio);
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
  const reduccionConjunta = tributacion === 'conjunta' ? Math.min(REDUCCION_CONJUNTA, rendimientoNeto - redTrabajo) : 0;
  const baseImponible = Math.max(0, rendimientoNeto - redTrabajo - reduccionConjunta);
  const cuotaIntegra = calcularCuotaIRPF(baseImponible, tramos);
  const cuotaMinimo = calcularCuotaIRPF(minimoPersonalYFamiliar, tramos);
  const cuotaTeorica = Math.max(0, cuotaIntegra - cuotaMinimo);
  const deduccion = deduccionSMI(anio, bruto);
  const cuotaSMI = Math.max(0, cuotaTeorica - deduccion);
  const limiteRetencion = Math.max(0, (bruto - MINIMO_EXENTO[anio]) * 0.43);
  const irpfFinal = Math.min(cuotaSMI, limiteRetencion);
  const salarioNeto = bruto - cotTra - irpfFinal;

  let tipoMargIRPF = tramos[0][1];
  for (const [lim, tipo] of tramos) {
    if (baseImponible <= lim) { tipoMargIRPF = tipo; break; }
    tipoMargIRPF = tipo;
  }

  return {
    bruto, anio, regimen: 'asalariado',
    cotEmp: r2(cotEmp), cotTra: r2(cotTra), costeLab: r2(costeLab),
    rnPrevio: r2(rnPrevio), gastosFijos, rendimientoNeto: r2(rendimientoNeto),
    redTrabajo: r2(redTrabajo), baseImponible: r2(baseImponible),
    reduccionConjunta: r2(reduccionConjunta),
    minimoPersonal, minimoFamiliar, minimoPersonalYFamiliar,
    cuotaIntegra: r2(cuotaIntegra), cuotaMinimo: r2(cuotaMinimo),
    cuotaTeorica: r2(cuotaTeorica), deduccionSMI: r2(deduccion),
    cuotaSMI: r2(cuotaSMI), limiteRetencion: r2(limiteRetencion),
    irpfFinal: r2(irpfFinal), salarioNeto: r2(salarioNeto),
    tipoEfectivoIRPF: bruto > 0 ? irpfFinal / bruto : 0,
    tipoEfectivoTotal: bruto > 0 ? (cotTra + irpfFinal) / bruto : 0,
    tipoMargIRPF,
    cunaFiscal: costeLab > 0 ? (costeLab - salarioNeto) / costeLab : 0,
    mei, tramos,
  };
}

export function calcularTipoMarginal(bruto, anio, optsOrDelta = {}, delta = 100) {
  let opts = optsOrDelta;
  if (typeof optsOrDelta === 'number') { delta = optsOrDelta; opts = {}; }
  if (bruto === 0) return { netoMarginal: 1, tipoMarginalTotal: 0, tipoMarginalIRPF: 0 };
  const n1 = calcularNomina(bruto, anio, opts);
  const n2 = calcularNomina(bruto + delta, anio, opts);
  const difNeto = n2.salarioNeto - n1.salarioNeto;
  const difIRPF = n2.irpfFinal - n1.irpfFinal;
  return {
    netoMarginal: r2(difNeto / delta),
    tipoMarginalTotal: r2(1 - difNeto / delta),
    tipoMarginalIRPF: r2(difIRPF / delta),
  };
}

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

// ── Datos precomputados (gráficos existentes — usan opts por defecto) ──────────
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

const ANIOS_ART20 = [2012, 2015, 2019, 2023, 2024, 2026];
export const CURVA_ART20 = Array.from({ length: 261 }, (_, i) => i * 100).map(rn => {
  const p = { rn };
  for (const a of ANIOS_ART20) p[`red_${a}`] = Math.max(0, reduccionTrabajo(a, rn));
  return p;
});
export const ANIOS_ART20_MUESTRA = ANIOS_ART20;

export const CURVA_ART20_REAL = Array.from({ length: 261 }, (_, i) => i * 100).map(rn2026 => {
  const p = { rn: rn2026 };
  for (const a of ANIOS_ART20) {
    const inf = INFLACION_A_2026[a];
    const rnNominal = rn2026 / inf;
    p[`red_${a}`] = Math.max(0, reduccionTrabajo(a, rnNominal)) * inf;
  }
  return p;
});

export const DATOS_UMBRALES = ANIOS.map(anio => {
  const meta = getArt20Meta(anio);
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

export const DATOS_UMBRALES_REAL = ANIOS.map(anio => {
  const meta = getArt20Meta(anio);
  const inf = INFLACION_A_2026[anio];
  return {
    anio,
    smi: SMI_ANUAL[anio] * inf,
    minExento: MINIMO_EXENTO[anio] * inf,
    art20Inf: typeof meta.uInf === 'number' ? meta.uInf * inf : null,
    art20Sup: typeof meta.uSup === 'number' ? meta.uSup * inf : null,
    art20Max: typeof meta.rMax === 'number' ? meta.rMax * inf : null,
    baseMax: BASE_MAX[anio] * inf,
  };
});

// ── Distribución salarial española (INE EAES) ─────────────────────────────────
// Ganancia bruta anual de asalariados a tiempo completo, en € corrientes.
// 2024-2026: proyecciones IPC + ~0,5% crecimiento real.
export const DISTRIBUCION_SALARIAL = {
  2012: { p10: 8390,  p25: 13420, p50: 19041, p75: 27780, p90: 41420, media: 22726 },
  2013: { p10: 8451,  p25: 13491, p50: 19029, p75: 27520, p90: 41450, media: 22697 },
  2014: { p10: 8530,  p25: 13578, p50: 19263, p75: 28012, p90: 42180, media: 22858 },
  2015: { p10: 8740,  p25: 13743, p50: 19467, p75: 28266, p90: 42420, media: 23106 },
  2016: { p10: 8843,  p25: 13750, p50: 19432, p75: 28419, p90: 42760, media: 23156 },
  2017: { p10: 8980,  p25: 13988, p50: 19830, p75: 29020, p90: 43500, media: 23646 },
  2018: { p10: 8890,  p25: 14114, p50: 19469, p75: 28659, p90: 42659, media: 24009 },
  2019: { p10: 10250, p25: 14710, p50: 20680, p75: 30450, p90: 45800, media: 24395 },
  2020: { p10: 10510, p25: 14750, p50: 20920, p75: 30650, p90: 46100, media: 25165 },
  2021: { p10: 10920, p25: 15240, p50: 21500, p75: 31500, p90: 47000, media: 25896 },
  2022: { p10: 11345, p25: 15876, p50: 22166, p75: 32622, p90: 48575, media: 26948 },
  2023: { p10: 12060, p25: 16908, p50: 23349, p75: 34236, p90: 51030, media: 28050 },
  2024: { p10: 12500, p25: 17480, p50: 24130, p75: 35400, p90: 52800, media: 29010 },
  2025: { p10: 12890, p25: 18030, p50: 24890, p75: 36510, p90: 54470, media: 29920 },
  2026: { p10: 13290, p25: 18590, p50: 25670, p75: 37650, p90: 56170, media: 30850 },
};

export function percentilDe(salario, anio) {
  const d = DISTRIBUCION_SALARIAL[anio];
  if (!d || salario <= 0) return 0;
  const puntos = [
    [0, 0], [d.p10, 10], [d.p25, 25], [d.p50, 50],
    [d.p75, 75], [d.p90, 90], [d.p90 * 1.7, 95],
    [d.p90 * 3.0, 99], [d.p90 * 6.0, 99.9],
  ];
  for (let i = 0; i < puntos.length - 1; i++) {
    const [s0, p0] = puntos[i];
    const [s1, p1] = puntos[i + 1];
    if (salario >= s0 && salario <= s1) {
      return p0 + ((salario - s0) / (s1 - s0)) * (p1 - p0);
    }
  }
  return 99.9;
}

export function densidadLogNormal(salario, anio) {
  const d = DISTRIBUCION_SALARIAL[anio];
  if (!d || salario <= 0) return 0;
  const mu = Math.log(d.p50);
  const ratio = d.media / d.p50;
  if (ratio <= 1) return 0;
  const sigma = Math.sqrt(2 * Math.log(ratio));
  const x = Math.log(salario);
  return (1 / (salario * sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
}

// ── Cuña fiscal OCDE 2025 (Taxing Wages 2026, datos 2025) ────────────────────
// Trabajador soltero sin hijos al salario medio nacional.
export const CUNA_OCDE_2025 = [
  { pais: 'Bélgica',       code: 'BE',   total: 52.5, irpf: 21.0, cotTrab: 11.0, cotEmp: 20.5 },
  { pais: 'Alemania',      code: 'DE',   total: 49.3, irpf: 16.0, cotTrab: 17.7, cotEmp: 15.6 },
  { pais: 'Francia',       code: 'FR',   total: 47.2, irpf: 13.2, cotTrab:  9.2, cotEmp: 24.8 },
  { pais: 'Austria',       code: 'AT',   total: 47.1, irpf: 12.8, cotTrab: 14.0, cotEmp: 20.3 },
  { pais: 'Italia',        code: 'IT',   total: 45.8, irpf: 16.7, cotTrab:  7.2, cotEmp: 21.9 },
  { pais: 'España',        code: 'ES',   total: 41.4, irpf: 13.1, cotTrab:  4.9, cotEmp: 23.4, esp: true },
  { pais: 'Grecia',        code: 'GR',   total: 38.0, irpf: 10.2, cotTrab: 13.7, cotEmp: 14.1 },
  { pais: 'Portugal',      code: 'PT',   total: 36.8, irpf: 14.6, cotTrab: 11.0, cotEmp: 11.2 },
  { pais: 'Media OCDE',    code: 'OECD', total: 35.1, irpf: 13.4, cotTrab:  8.2, cotEmp: 13.5, media: true },
  { pais: 'Países Bajos',  code: 'NL',   total: 35.0, irpf: 18.4, cotTrab:  9.7, cotEmp:  6.9 },
  { pais: 'Reino Unido',   code: 'UK',   total: 33.7, irpf: 14.2, cotTrab:  7.6, cotEmp: 11.9 },
  { pais: 'Estados Unidos',code: 'US',   total: 30.0, irpf: 14.4, cotTrab:  7.7, cotEmp:  7.9 },
  { pais: 'Irlanda',       code: 'IE',   total: 29.9, irpf: 17.7, cotTrab:  4.0, cotEmp:  8.2 },
  { pais: 'Suiza',         code: 'CH',   total: 22.9, irpf: 11.1, cotTrab:  6.3, cotEmp:  5.5 },
  { pais: 'Nueva Zelanda', code: 'NZ',   total: 20.8, irpf: 20.8, cotTrab:  0.0, cotEmp:  0.0 },
  { pais: 'México',        code: 'MX',   total: 21.7, irpf:  4.7, cotTrab:  1.3, cotEmp: 15.7 },
  { pais: 'Chile',         code: 'CL',   total:  7.5, irpf:  0.0, cotTrab:  7.0, cotEmp:  0.5 },
];

// ── Deuda pública española (Banco de España / PDE + INE) ─────────────────────
export const DEUDA_ESPANA = {
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

function r2(n) { return Math.round(n * 100) / 100; }
