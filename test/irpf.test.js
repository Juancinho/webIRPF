import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANIOS,
  REGIONES,
  calcularNomina,
  calcularSSAutonomo,
  calcularTipoMarginal,
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
