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

/**
 * Los conceptos que componen cada tipo de cotización, uno a uno.
 *
 * El motor sólo necesita el tipo agregado, pero el desglose del capítulo 01
 * tiene que poder enseñar de dónde sale ese 32,15 %: son seis conceptos con
 * nombre y norma propios, y esconderlos detrás de un único porcentaje es
 * justo lo que hace que una nómina resulte incomprensible.
 *
 * Los tipos de desempleo corresponden al contrato indefinido, que es el
 * supuesto estándar de esta publicación; en temporal son más altos.
 */
export function conceptosCotizacion(anio) {
  const { mei, tipoEmp, tipoTra } = getSSTipos(anio);
  const empresa = [
    ['Contingencias comunes', 0.236, 'Pensiones, incapacidad temporal y prestaciones del sistema'],
    ['Desempleo', 0.055, 'Contrato indefinido; en temporal el tipo es mayor'],
    ['FOGASA', 0.002, 'Fondo de Garantía Salarial'],
    ['Formación profesional', 0.006, 'Formación para el empleo'],
    ['Accidentes de trabajo y EP', 0.015, 'Tipo medio; depende de la actividad de la empresa (tarifa de primas)'],
  ];
  const trabajador = [
    ['Contingencias comunes', 0.047, 'La parte del trabajador de la misma contingencia'],
    ['Desempleo', 0.0155, 'Contrato indefinido'],
    ['Formación profesional', 0.001, 'Formación para el empleo'],
  ];
  if (mei[0] > 0) {
    empresa.push(['MEI · Mecanismo de Equidad Intergeneracional', mei[0], `Refuerzo del Fondo de Reserva de las pensiones, en vigor desde 2023`]);
    trabajador.push(['MEI · Mecanismo de Equidad Intergeneracional', mei[1], 'Refuerzo del Fondo de Reserva de las pensiones, en vigor desde 2023']);
  }
  return { empresa, trabajador, tipoEmp, tipoTra, desdeMEI: 2023 };
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
// Bases mínimas mensuales de cada tramo de rendimientos netos (RDL 13/2022 y
// órdenes anuales de cotización). Los topes de tramo son comunes en 2023-2026.
const SS_AUTONOMO_TOPES = [
  670, 900, 1166.7, 1300, 1500, 1700, 1850, 2030,
  2330, 2760, 3190, 3620, 4050, 6000, Infinity,
];

const SS_AUTONOMO_BASES = {
  2023: [751.63, 849.67, 898.69, 950.98, 960.78, 960.78, 1013.07, 1029.41, 1045.75, 1078.43, 1143.79, 1209.15, 1274.51, 1372.55, 1633.99],
  2024: [735.29, 816.99, 872.55, 950.98, 960.78, 960.78, 1045.75, 1062.09, 1078.43, 1111.11, 1176.47, 1241.83, 1307.19, 1454.25, 1732.03],
  2025: [653.59, 718.95, 849.67, 950.98, 960.78, 960.78, 1143.79, 1209.15, 1274.51, 1356.21, 1437.91, 1519.61, 1601.31, 1732.03, 1928.10],
  2026: [653.59, 718.95, 849.67, 950.98, 960.78, 960.78, 1143.79, 1209.15, 1274.51, 1356.21, 1437.91, 1519.61, 1601.31, 1732.03, 1928.10],
};

function tipoAutonomoCombinado(anio) {
  if (anio >= 2026) return 0.315;
  if (anio === 2025) return 0.314;
  if (anio === 2024) return 0.313;
  if (anio === 2023) return 0.312;
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
  const bases = SS_AUTONOMO_BASES[anio] || SS_AUTONOMO_BASES[2026];
  let tramo = SS_AUTONOMO_TOPES.length - 1;
  for (let i = 0; i < SS_AUTONOMO_TOPES.length; i++) {
    const tope = SS_AUTONOMO_TOPES[i];
    // El tercer tramo termina justo antes de 1.166,70 €; el siguiente lo incluye.
    const dentro = i === 2 ? monthly < tope : monthly <= tope;
    if (dentro) { tramo = i; break; }
  }
  return bases[tramo] * 12 * tipo;
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
  const reduccionConjunta = tributacion === 'conjunta'
    ? Math.max(0, Math.min(REDUCCION_CONJUNTA, rendimientoNeto - redTrabajo))
    : 0;
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
// El atlas arranca en cero: recortar el eje por abajo dejaba las curvas
// colgando a media altura y hacía ilegible el primer tramo de la escala.
export const SALARIOS_CHART = Array.from({ length: 201 }, (_, i) => i * 500);

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

export const DATOS_CHART_NOMINAL = SALARIOS_CHART.map(bruto => {
  const point = { bruto };
  for (const anio of ANIOS) {
    const n = calcularNomina(bruto, anio);
    const marg = calcularTipoMarginal(bruto, anio);
    point[`neto_${anio}`]     = Math.round(n.salarioNeto);
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
// Tabla 28191: ambos sexos, total nacional, ganancia bruta anual, € corrientes.
// https://www.ine.es/jaxiT3/Tabla.htm?t=28191
// Los datos oficiales incluyen el conjunto de jornadas cubiertas por la EAES.
export const ULTIMO_ANIO_SALARIAL_OFICIAL = 2024;
export const CRECIMIENTO_PROYECCION_SALARIAL = 0.032;

export const DISTRIBUCION_SALARIAL_OFICIAL = {
  2012: { p10: 7979.40,  p25: 13369.45, p50: 19040.98, p75: 28395.50, p90: 40807.99, media: 22726.44 },
  2013: { p10: 7692.30,  p25: 13039.36, p50: 19029.66, p75: 28563.69, p90: 41108.40, media: 22697.86 },
  2014: { p10: 7626.20,  p25: 13217.84, p50: 19263.78, p75: 28782.70, p90: 41350.36, media: 22858.17 },
  2015: { p10: 7962.45,  p25: 13414.92, p50: 19466.49, p75: 29163.66, p90: 41648.67, media: 23106.30 },
  2016: { p10: 8095.44,  p25: 13369.74, p50: 19432.62, p75: 29191.56, p90: 41855.38, media: 23156.34 },
  2017: { p10: 8583.81,  p25: 13897.22, p50: 19830.12, p75: 29628.64, p90: 42454.21, media: 23646.50 },
  2018: { p10: 8457.36,  p25: 13998.29, p50: 20078.44, p75: 30057.33, p90: 43382.16, media: 24009.12 },
  2019: { p10: 8943.26,  p25: 14271.06, p50: 20351.02, p75: 30558.45, p90: 44127.12, media: 24395.98 },
  2020: { p10: 9586.51,  p25: 14641.96, p50: 20920.12, p75: 31550.01, p90: 45359.96, media: 25165.51 },
  2021: { p10: 10192.38, p25: 15215.03, p50: 21638.69, p75: 32385.45, p90: 46430.36, media: 25896.82 },
  2022: { p10: 10657.37, p25: 15913.52, p50: 22383.11, p75: 33561.62, p90: 48217.21, media: 26948.87 },
  2023: { p10: 11466.88, p25: 16632.97, p50: 23349.00, p75: 34991.64, p90: 49836.00, media: 28049.94 },
  2024: { p10: 12018.46, p25: 17457.47, p50: 24497.17, p75: 36969.61, p90: 52515.27, media: 29540.26 },
};

function proyectarDistribucion(base, anios) {
  const factor = Math.pow(1 + CRECIMIENTO_PROYECCION_SALARIAL, anios);
  return Object.fromEntries(
    Object.entries(base).map(([clave, valor]) => [clave, Math.round(valor * factor * 100) / 100])
  );
}

export const DISTRIBUCION_SALARIAL = {
  ...DISTRIBUCION_SALARIAL_OFICIAL,
  2025: proyectarDistribucion(DISTRIBUCION_SALARIAL_OFICIAL[2024], 1),
  2026: proyectarDistribucion(DISTRIBUCION_SALARIAL_OFICIAL[2024], 2),
};

export function percentilDe(salario, anio) {
  const d = DISTRIBUCION_SALARIAL[anio];
  if (!d || salario <= 0) return 0;
  const puntos = [
    [d.p10, 10], [d.p25, 25], [d.p50, 50], [d.p75, 75], [d.p90, 90],
  ];
  if (salario < d.p10) {
    const fraccion = salario / d.p10;
    return 10 * Math.pow(fraccion, 0.7);
  }
  for (let i = 0; i < puntos.length - 1; i++) {
    const [s0, p0] = puntos[i];
    const [s1, p1] = puntos[i + 1];
    if (salario >= s0 && salario <= s1) {
      return p0 + ((salario - s0) / (s1 - s0)) * (p1 - p0);
    }
  }
  // El INE no publica P95/P99 en esta tabla. La cola se muestra como una
  // extrapolación suave y se limita a P99,9 para no fingir precisión censal.
  return Math.min(99.9, 90 + 10 * (1 - Math.exp(-(salario - d.p90) / d.p90)));
}

export function densidadLogNormal(salario, anio) {
  const d = DISTRIBUCION_SALARIAL[anio];
  if (!d || salario <= 0) return 0;
  const mu = Math.log(d.p50);
  // Ajuste visual robusto mediante la distancia observada entre P10 y P90.
  // Una log-normal no puede reproducir simultáneamente todos los percentiles.
  const sigma = Math.log(d.p90 / d.p10) / (2 * 1.2815515655446004);
  if (sigma <= 0) return 0;
  const x = Math.log(salario);
  return (1 / (salario * sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
}

// ── Cuña fiscal OCDE 2025 (Taxing Wages 2026, datos 2025) ────────────────────
// Fuente: tabla 1.2. Persona soltera, sin hijos, al 100% del salario medio.
// Unidad de total y componentes: % del coste laboral. La contribución del
// empleador incluye impuestos sobre nóminas cuando corresponde.
export const CUNA_OCDE_META = Object.freeze({
  informe: 'Taxing Wages 2026',
  ejercicio: 2025,
  tabla: '1.2',
  unidad: '% del coste laboral',
  supuesto: 'Persona soltera, sin hijos, al 100% del salario medio nacional',
  doi: 'https://doi.org/10.1787/3a5169ef-en',
  fuente: 'https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/overview_d93131c3.html',
  verificado: '2026-09-20',
});

export const CUNA_OCDE_2025 = [
  { pais: 'Alemania',            code: 'DE', total: 49.3, irpf: 14.2, cotTrab: 17.8, cotEmp: 17.3 },
  { pais: 'Suiza',               code: 'CH', total: 23.0, irpf: 10.9, cotTrab:  6.0, cotEmp:  6.0 },
  { pais: 'Bélgica',             code: 'BE', total: 52.5, irpf: 20.1, cotTrab: 11.0, cotEmp: 21.4 },
  { pais: 'Austria',             code: 'AT', total: 47.1, irpf: 11.4, cotTrab: 14.0, cotEmp: 21.6 },
  { pais: 'Luxemburgo',          code: 'LU', total: 40.2, irpf: 17.3, cotTrab: 10.8, cotEmp: 12.0 },
  { pais: 'Países Bajos',        code: 'NL', total: 35.9, irpf: 15.8, cotTrab:  8.9, cotEmp: 11.2 },
  { pais: 'Noruega',             code: 'NO', total: 36.4, irpf: 18.1, cotTrab:  6.8, cotEmp: 11.5 },
  { pais: 'Reino Unido',         code: 'UK', total: 32.4, irpf: 15.4, cotTrab:  4.9, cotEmp: 12.0 },
  { pais: 'Francia',             code: 'FR', total: 47.2, irpf: 12.2, cotTrab:  8.3, cotEmp: 26.7 },
  { pais: 'Irlanda',             code: 'IE', total: 32.6, irpf: 18.9, cotTrab:  3.7, cotEmp: 10.1 },
  { pais: 'Canadá',              code: 'CA', total: 32.1, irpf: 17.2, cotTrab:  6.2, cotEmp:  8.8 },
  { pais: 'Dinamarca',           code: 'DK', total: 35.8, irpf: 35.1, cotTrab:  0.0, cotEmp:  0.7 },
  { pais: 'Islandia',            code: 'IS', total: 31.5, irpf: 25.4, cotTrab:  0.1, cotEmp:  6.0 },
  { pais: 'Finlandia',           code: 'FI', total: 42.5, irpf: 17.6, cotTrab:  7.9, cotEmp: 17.0 },
  { pais: 'Suecia',              code: 'SE', total: 41.1, irpf: 11.9, cotTrab:  5.3, cotEmp: 23.9 },
  { pais: 'Australia',           code: 'AU', total: 27.9, irpf: 22.2, cotTrab:  0.0, cotEmp:  5.7 },
  { pais: 'Italia',              code: 'IT', total: 45.8, irpf: 14.5, cotTrab:  7.2, cotEmp: 24.0 },
  { pais: 'Estados Unidos',      code: 'US', total: 30.0, irpf: 15.4, cotTrab:  7.1, cotEmp:  7.5 },
  { pais: 'España',              code: 'ES', total: 41.4, irpf: 13.1, cotTrab:  5.0, cotEmp: 23.4, esp: true },
  { pais: 'Corea',               code: 'KR', total: 24.8, irpf:  6.4, cotTrab:  8.5, cotEmp: 10.0 },
  { pais: 'Japón',               code: 'JP', total: 33.1, irpf:  6.9, cotTrab: 12.7, cotEmp: 13.5 },
  { pais: 'Türkiye',             code: 'TR', total: 40.3, irpf: 12.1, cotTrab: 12.7, cotEmp: 15.6 },
  { pais: 'Israel',              code: 'IL', total: 26.1, irpf: 11.9, cotTrab:  8.3, cotEmp:  5.9 },
  { pais: 'Eslovenia',           code: 'SI', total: 45.3, irpf: 10.4, cotTrab: 20.6, cotEmp: 14.2 },
  { pais: 'Polonia',             code: 'PL', total: 35.0, irpf:  5.7, cotTrab: 15.3, cotEmp: 14.0 },
  { pais: 'Grecia',              code: 'GR', total: 39.3, irpf: 10.5, cotTrab: 11.0, cotEmp: 17.9 },
  { pais: 'Chequia',             code: 'CZ', total: 41.2, irpf:  7.3, cotTrab:  8.7, cotEmp: 25.3 },
  { pais: 'Estonia',             code: 'EE', total: 42.6, irpf: 16.2, cotTrab:  1.2, cotEmp: 25.3 },
  { pais: 'Lituania',            code: 'LT', total: 39.8, irpf: 18.9, cotTrab: 19.2, cotEmp:  1.8 },
  { pais: 'Portugal',            code: 'PT', total: 39.3, irpf: 11.3, cotTrab:  8.9, cotEmp: 19.2 },
  { pais: 'Nueva Zelanda',       code: 'NZ', total: 20.8, irpf: 20.8, cotTrab:  0.0, cotEmp:  0.0 },
  { pais: 'Letonia',             code: 'LV', total: 40.1, irpf: 12.5, cotTrab:  8.5, cotEmp: 19.1 },
  { pais: 'Hungría',             code: 'HU', total: 41.2, irpf: 13.3, cotTrab: 16.4, cotEmp: 11.5 },
  { pais: 'República Eslovaca',  code: 'SK', total: 42.7, irpf:  8.2, cotTrab: 10.1, cotEmp: 24.4 },
  { pais: 'Costa Rica',          code: 'CR', total: 27.7, irpf:  0.0, cotTrab:  7.9, cotEmp: 19.8 },
  { pais: 'Chile',               code: 'CL', total:  7.5, irpf:  0.1, cotTrab:  7.0, cotEmp:  0.4 },
  { pais: 'México',              code: 'MX', total: 21.7, irpf: 10.6, cotTrab:  1.3, cotEmp:  9.8 },
  { pais: 'Colombia',            code: 'CO', total:  0.0, irpf:  0.0, cotTrab:  0.0, cotEmp:  0.0 },
  { pais: 'Media OCDE',          code: 'OECD', total: 35.1, irpf: 13.4, cotTrab: 8.1, cotEmp: 13.5, media: true },
];

// Tabla 1.3: carga que afronta directamente el trabajador sobre salario bruto.
export const CARGA_PERSONAL_OCDE_2025 = Object.freeze({
  espana: { total: 23.5, irpf: 17.1, cotTrab: 6.5 },
  mediaOCDE: { total: 25.1, irpf: 15.5, cotTrab: 9.6 },
});

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


// ── Destino del gasto público · clasificación funcional COFOG ────────────────
// IGAE, «Informe sobre la clasificación de las funciones de las Administraciones
// Públicas», último ejercicio publicado (2023, provisional). Importes en
// millones de euros de 2023. El presupuesto español NO está afectado: ningún
// impuesto concreto financia una función concreta. Estas proporciones sirven
// para repartir una aportación individual *como se reparte el gasto real*, que
// es la única lectura honesta posible.
export const GASTO_COFOG = Object.freeze({
  anio: 2023,
  total: 680952,
  fuente: 'IGAE — Clasificación funcional del gasto de las AAPP (COFOG), 2023 provisional',
  url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/paginas/iacogof.aspx',
  grupos: [
    {
      key: 'social',
      label: 'Protección social',
      nota: 'Pensiones, desempleo, incapacidad y prestaciones familiares',
      partidas: [
        { key: 'vejez',     label: 'Pensiones de jubilación', valor: 153153, nota: 'Vejez (COFOG 10.2)' },
        { key: 'incap',     label: 'Enfermedad e incapacidad', valor: 39948, nota: 'Incapacidad temporal y permanente' },
        { key: 'superv',    label: 'Viudedad y orfandad',      valor: 33634, nota: 'Supervivencia' },
        { key: 'paro',      label: 'Desempleo',                valor: 22995, nota: 'Prestaciones y subsidios por desempleo' },
        { key: 'familia',   label: 'Familia e hijos',          valor: 14679, nota: 'Prestaciones familiares y por nacimiento' },
        { key: 'exclusion', label: 'Exclusión social',         valor: 10150, nota: 'Incluye el ingreso mínimo vital' },
        { key: 'otrasPS',   label: 'Otras prestaciones',       valor:  2545, nota: 'Vivienda social, I+D y gestión del sistema' },
      ],
    },
    {
      key: 'servicios',
      label: 'Servicios públicos',
      nota: 'Lo que el Estado y las comunidades prestan directamente',
      partidas: [
        { key: 'salud',     label: 'Sanidad',                 valor: 98624, nota: 'Hospitales, atención primaria, farmacia' },
        { key: 'educacion', label: 'Educación',               valor: 63040, nota: 'De infantil a universidad' },
        { key: 'orden',     label: 'Orden público y justicia', valor: 27443, nota: 'Policía, bomberos, tribunales, prisiones' },
        { key: 'ocio',      label: 'Ocio, cultura y religión', valor: 18729, nota: 'Deporte, cultura, medios públicos' },
        { key: 'medio',     label: 'Medio ambiente',          valor: 14640, nota: 'Residuos, aguas, protección del entorno' },
        { key: 'defensa',   label: 'Defensa',                 valor: 13987, nota: 'Fuerzas armadas y defensa civil' },
        { key: 'vivienda',  label: 'Vivienda y urbanismo',    valor:  7643, nota: 'Vivienda, alumbrado, abastecimiento de agua' },
      ],
    },
    {
      key: 'estado',
      label: 'Economía y Estado',
      nota: 'La máquina administrativa, la deuda y el apoyo a la actividad',
      partidas: [
        { key: 'generales', label: 'Servicios generales', valor: 84784, nota: 'Administración, exterior y los intereses de la deuda' },
        { key: 'economia',  label: 'Asuntos económicos',  valor: 74958, nota: 'Transporte, energía, agricultura, I+D, empleo' },
      ],
    },
  ],
});


// ── Precios de referencia para medir el poder adquisitivo ───────────────────
// Sólo entran series anuales completas y publicadas. El coche y el menú del
// día, que serían más gráficos, no tienen serie anual pública desde 2012: el
// precio medio del coche nuevo sólo está publicado desde 2019 y la encuesta
// del menú del día arranca en 2016, así que quedan fuera antes que entrar a
// medias.
//
// Vivienda: idealista, informe de precios, valor de diciembre de cada año.
// SMI: BOE, Real Decreto de cada ejercicio (ya en SMI_ANUAL).
export const PRECIOS_REFERENCIA = Object.freeze({
  fuente: 'idealista — informes de precio de vivienda (valores de diciembre)',
  url: 'https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/',
  ultimoAnio: 2025,
  // euros por metro cuadrado de vivienda en venta
  venta: {
    2012: 1801, 2013: 1613, 2014: 1590, 2015: 1549, 2016: 1547, 2017: 1600,
    2018: 1730, 2019: 1792, 2020: 1795, 2021: 1856, 2022: 1951, 2023: 2124,
    2024: 2324, 2025: 2725,
  },
  // euros por metro cuadrado y mes de alquiler
  alquiler: {
    2012: 7.7, 2013: 7.4, 2014: 7.4, 2015: 7.6, 2016: 8.4, 2017: 9.8,
    2018: 10.5, 2019: 10.8, 2020: 10.9, 2021: 10.5, 2022: 11.3, 2023: 12.3,
    2024: 13.5, 2025: 14.4,
  },
  // el piso de referencia para convertir €/m² en una mensualidad
  pisoM2: 80,
});

function r2(n) { return Math.round(n * 100) / 100; }
