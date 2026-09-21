/** The publication's table of contents — ten movements, one argument. */
export const CAPITULOS = [
  { id: 'portada', n: '00', titulo: 'Portada', desc: 'La regla, tu sueldo y tu neto' },
  { id: 'nomina', n: '01', titulo: 'Tu nómina', desc: 'Lo que ves en la nómina' },
  { id: 'viaje', n: '02', titulo: 'El viaje de cada euro', desc: 'De coste laboral a renta neta' },
  { id: 'irpf', n: '03', titulo: 'Cómo funciona el IRPF', desc: 'Tramos, marginal y el acantilado' },
  { id: 'historia', n: '04', titulo: 'Quince años', desc: 'Mismo sueldo real, 2012–2026' },
  { id: 'cuna', n: '05', titulo: 'La cuña fiscal', desc: 'De cada 100 € de coste laboral' },
  { id: 'lugar', n: '06', titulo: 'Tu lugar', desc: 'Dónde estás entre los demás asalariados' },
  { id: 'destino', n: '07', titulo: 'A dónde va', desc: 'El destino real de tu aportación' },
  { id: 'deuda', n: '08', titulo: 'La deuda', desc: 'Lo que el Estado ya debe en tu nombre' },
  { id: 'cierre', n: '·', titulo: 'Tu resumen', desc: 'La tarjeta para llevarte', noche: true, fueraDelRail: true },
  { id: 'apendice', n: '09', titulo: 'Apéndice', desc: 'Método, parámetros, normativa y fuentes' },
];
export const CAPITULO_IDS = CAPITULOS.map(c => c.id);
