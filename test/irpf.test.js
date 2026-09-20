import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANIOS,
  REGIONES,
  calcularNomina,
  calcularSSAutonomo,
  calcularTipoMarginal,
  CARGA_PERSONAL_OCDE_2025,
  CRECIMIENTO_PROYECCION_SALARIAL,
  CUNA_OCDE_2025,
  CUNA_OCDE_META,
  DISTRIBUCION_SALARIAL,
  DISTRIBUCION_SALARIAL_OFICIAL,
  percentilDe,
  ULTIMO_ANIO_SALARIAL_OFICIAL,
} from '../src/engine/irpf.js';

const closeTo = (actual, expected, tolerance = 0.02) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} no está a ±${tolerance} de ${expected}`);
};

test('el motor cubre de 2012 a 2026', () => {
  assert.deepEqual(ANIOS, Array.from({ length: 15 }, (_, i) => 2012 + i));
});

test('los cálculos de asalariados son finitos y cuadran contablemente', () => {
  for (const anio of ANIOS) {
    for (let bruto = 0; bruto <= 200_000; bruto += 1_000) {
      const resultado = calcularNomina(bruto, anio);
      for (const campo of ['cotEmp', 'cotTra', 'costeLab', 'irpfFinal', 'salarioNeto', 'tipoEfectivoIRPF', 'tipoEfectivoTotal']) {
        assert.ok(Number.isFinite(resultado[campo]), `${campo} no finito para ${anio}/${bruto}`);
      }
      assert.ok(resultado.cotEmp >= 0);
      assert.ok(resultado.cotTra >= 0);
      assert.ok(resultado.irpfFinal >= 0);
      closeTo(resultado.salarioNeto, bruto - resultado.cotTra - resultado.irpfFinal);
      closeTo(resultado.costeLab, bruto + resultado.cotEmp);
    }
  }
});

test('todos los perfiles configurables producen resultados coherentes', () => {
  const perfiles = [
    ...Object.keys(REGIONES).map(ccaa => ({ ccaa })),
    { tributacion: 'conjunta', nHijos: 3, nHijosMenores3: 1, nAscendientes: 1 },
    { regimen: 'autonomo' },
  ];

  for (const opts of perfiles) {
    for (const anio of ANIOS) {
      const resultado = calcularNomina(35_000, anio, opts);
      assert.ok(Number.isFinite(resultado.salarioNeto));
      assert.ok(resultado.irpfFinal >= 0);
      closeTo(resultado.salarioNeto, resultado.bruto - resultado.cotTra - resultado.irpfFinal);
    }
  }
});

test('la comunidad seleccionada cambia la escala aplicada desde 2024', () => {
  const madrid = calcularNomina(80_000, 2026, { ccaa: 'madrid' });
  const cataluna = calcularNomina(80_000, 2026, { ccaa: 'cataluna' });

  assert.notDeepEqual(madrid.tramos, cataluna.tramos);
  assert.ok(cataluna.irpfFinal > madrid.irpfFinal);
});

test('la reducción conjunta nunca se vuelve negativa', () => {
  for (const bruto of [0, 1_000, 5_000, 10_000, 20_000]) {
    const resultado = calcularNomina(bruto, 2026, { tributacion: 'conjunta' });
    assert.ok(resultado.reduccionConjunta >= 0);
  }
});

test('las bases mínimas y tipos de autónomos cambian por ejercicio', () => {
  closeTo(calcularSSAutonomo(0, 2023), 751.63 * 12 * 0.312);
  closeTo(calcularSSAutonomo(0, 2024), 735.29 * 12 * 0.313);
  closeTo(calcularSSAutonomo(0, 2025), 653.59 * 12 * 0.314);
  closeTo(calcularSSAutonomo(0, 2026), 653.59 * 12 * 0.315);
});

test('los tipos marginales son finitos en todo el rango de la interfaz', () => {
  for (const anio of ANIOS) {
    for (const bruto of [0, 15_000, 20_000, 35_000, 60_000, 150_000, 200_000]) {
      const marginal = calcularTipoMarginal(bruto, anio);
      assert.ok(Number.isFinite(marginal.netoMarginal));
      assert.ok(Number.isFinite(marginal.tipoMarginalTotal));
      assert.ok(Number.isFinite(marginal.tipoMarginalIRPF));
    }
  }
});

test('la distribución salarial reproduce la tabla 28191 del INE hasta 2024', () => {
  assert.equal(ULTIMO_ANIO_SALARIAL_OFICIAL, 2024);
  assert.deepEqual(DISTRIBUCION_SALARIAL_OFICIAL[2012], {
    p10: 7979.40, p25: 13369.45, p50: 19040.98,
    p75: 28395.50, p90: 40807.99, media: 22726.44,
  });
  assert.deepEqual(DISTRIBUCION_SALARIAL_OFICIAL[2024], {
    p10: 12018.46, p25: 17457.47, p50: 24497.17,
    p75: 36969.61, p90: 52515.27, media: 29540.26,
  });
});

test('las estimaciones salariales posteriores son explícitas y reproducibles', () => {
  const factor2025 = 1 + CRECIMIENTO_PROYECCION_SALARIAL;
  closeTo(DISTRIBUCION_SALARIAL[2025].p50, DISTRIBUCION_SALARIAL[2024].p50 * factor2025);
  closeTo(DISTRIBUCION_SALARIAL[2026].p50, DISTRIBUCION_SALARIAL[2024].p50 * factor2025 ** 2);
});

test('el estimador de percentil pasa por los puntos oficiales publicados', () => {
  const dist = DISTRIBUCION_SALARIAL[2024];
  for (const [clave, percentil] of [['p10', 10], ['p25', 25], ['p50', 50], ['p75', 75], ['p90', 90]]) {
    closeTo(percentilDe(dist[clave], 2024), percentil, 0.001);
  }
});

test('la comparativa OCDE reproduce la tabla 1.2 de Taxing Wages 2026', () => {
  const paises = CUNA_OCDE_2025.filter(fila => !fila.media);
  assert.equal(paises.length, 38);
  assert.equal(new Set(paises.map(fila => fila.code)).size, 38);
  assert.equal(CUNA_OCDE_META.ejercicio, 2025);
  assert.equal(CUNA_OCDE_META.tabla, '1.2');

  assert.deepEqual(CUNA_OCDE_2025.find(fila => fila.code === 'ES'), {
    pais: 'España', code: 'ES', total: 41.4,
    irpf: 13.1, cotTrab: 5.0, cotEmp: 23.4, esp: true,
  });
  assert.deepEqual(CUNA_OCDE_2025.find(fila => fila.code === 'OECD'), {
    pais: 'Media OCDE', code: 'OECD', total: 35.1,
    irpf: 13.4, cotTrab: 8.1, cotEmp: 13.5, media: true,
  });

  for (const fila of CUNA_OCDE_2025) {
    closeTo(fila.irpf + fila.cotTrab + fila.cotEmp, fila.total, 0.11);
  }
});

test('la carga personal sobre bruto permanece separada de la cuña sobre coste laboral', () => {
  assert.deepEqual(CARGA_PERSONAL_OCDE_2025.espana, {
    total: 23.5, irpf: 17.1, cotTrab: 6.5,
  });
  assert.deepEqual(CARGA_PERSONAL_OCDE_2025.mediaOCDE, {
    total: 25.1, irpf: 15.5, cotTrab: 9.6,
  });
});
