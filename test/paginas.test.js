import test from 'node:test';
import assert from 'node:assert/strict';
import { RUTAS, SUELDOS, paginaDeRuta, paginaSueldo } from '../src/paginas/contenido.js';
import { calcularNomina, DEFAULT_OPTS } from '../src/engine/irpf.js';

const texto = p =>
  [p.titulo, p.descripcion, p.h1, p.entradilla, ...p.cifras.map(c => `${c.v} ${c.nota ?? ''}`),
    ...p.secciones.flatMap(s => [...s.parrafos, ...(s.tabla ? s.tabla.filas.flat().map(v => (typeof v === 'object' ? v.texto : v)) : [])]),
    ...p.preguntas.flatMap(q => [q.p, q.r])].join(' ');

test('todas las rutas generan una página completa, sin cifras rotas', () => {
  for (const ruta of RUTAS) {
    const p = paginaDeRuta(ruta);
    assert.ok(p, ruta);
    assert.equal(p.ruta, ruta);
    assert.ok(!/NaN|undefined|Infinity|null/.test(texto(p)), `${ruta} contiene un valor roto`);
    assert.ok(p.titulo.length <= 70, `${ruta}: título de ${p.titulo.length} caracteres`);
    assert.ok(p.descripcion.length <= 165, `${ruta}: descripción de ${p.descripcion.length} caracteres`);
  }
});

test('títulos y descripciones no se repiten entre páginas', () => {
  const paginas = RUTAS.map(paginaDeRuta);
  assert.equal(new Set(paginas.map(p => p.titulo)).size, paginas.length);
  assert.equal(new Set(paginas.map(p => p.descripcion)).size, paginas.length);
  assert.equal(new Set(paginas.map(p => p.h1)).size, paginas.length);
});

test('la página de un sueldo usa exactamente el motor fiscal', () => {
  for (const b of [14000, 30000, 61000, 100000]) {
    const n = calcularNomina(b, 2026, DEFAULT_OPTS);
    const p = paginaSueldo(b);
    const neto = new Intl.NumberFormat('es-ES', { useGrouping: 'always', style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n.salarioNeto);
    assert.ok(p.h1.includes(neto), `${b}: ${p.h1} no contiene ${neto}`);
  }
});

test('las rutas desconocidas y la portada no son páginas de entrada', () => {
  assert.equal(paginaDeRuta('/'), null);
  assert.equal(paginaDeRuta('/index.html'), null);
  assert.equal(paginaDeRuta('/sueldo-neto/30500/'), null);
  assert.equal(paginaDeRuta('/no-existe/'), null);
  assert.ok(paginaDeRuta('/sueldo-neto/30000'));
  assert.ok(paginaDeRuta('/tramos-irpf-2026/index.html'));
  assert.equal(SUELDOS.length, new Set(SUELDOS).size);
});
