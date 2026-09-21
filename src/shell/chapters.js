/** The publication's table of contents — ten movements, one argument. */
export const CAPITULOS = [
  { id: 'portada', n: '00', titulo: 'Portada', desc: 'La regla que gobierna todo el informe', preview: 'ruler' },
  { id: 'nomina', n: '01', titulo: 'Tu nómina', desc: 'Qué conceptos separan el bruto del neto', preview: 'split' },
  { id: 'viaje', n: '02', titulo: 'El coste completo', desc: 'Del coste laboral a la renta neta', preview: 'flow' },
  { id: 'irpf', n: '03', titulo: 'Cómo funciona el IRPF', desc: 'Base, tramos, tipos y reducción del art. 20', preview: 'steps' },
  { id: 'historia', n: '04', titulo: 'Quince años', desc: 'Comparación con poder adquisitivo constante', preview: 'history' },
  { id: 'cuna', n: '05', titulo: 'La cuña fiscal', desc: 'Componentes y comparación internacional', preview: 'hundred' },
  { id: 'lugar', n: '06', titulo: 'La distribución salarial', desc: 'Percentiles, mediana y posición salarial', preview: 'distribution' },
  { id: 'destino', n: '07', titulo: 'El gasto por funciones', desc: 'Correspondencia hipotética con el reparto COFOG', preview: 'allocation' },
  { id: 'deuda', n: '08', titulo: 'La deuda pública', desc: 'Saldo nominal, real, por habitante y sobre PIB', preview: 'debt' },
  { id: 'cierre', n: '·', titulo: 'Tu resumen', desc: 'Las cifras esenciales del recorrido', noche: true, fueraDelRail: true, preview: 'summary' },
  { id: 'apendice', n: '09', titulo: 'Método y fuentes', desc: 'Parámetros, normas y límites', preview: 'method' },
];
export const CAPITULO_IDS = CAPITULOS.map(c => c.id);
