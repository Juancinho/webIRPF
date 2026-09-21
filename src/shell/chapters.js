/** The publication's table of contents — eight movements, one argument. */
export const CAPITULOS = [
  { id: 'portada', n: '00', titulo: 'Portada', desc: 'La regla, tu sueldo y tu neto' },
  { id: 'nomina', n: '01', titulo: 'Tu nómina', desc: 'Lo que ves en la nómina' },
  { id: 'viaje', n: '02', titulo: 'El viaje de cada euro', desc: 'De coste laboral a renta neta' },
  { id: 'irpf', n: '03', titulo: 'Cómo funciona el IRPF', desc: 'Tramos, marginal y el acantilado' },
  { id: 'historia', n: '04', titulo: 'Quince años', desc: 'Mismo sueldo real, 2012–2026' },
  { id: 'cuna', n: '05', titulo: 'La cuña fiscal', desc: 'De cada 100 € de coste laboral', noche: true },
  { id: 'lugar', n: '06', titulo: 'Tu lugar y tu parte', desc: 'La distribución y la deuda' },
  { id: 'cierre', n: '·', titulo: 'Tu resumen', desc: 'La tarjeta para llevarte', noche: true, fueraDelRail: true },
  { id: 'apendice', n: '07', titulo: 'Apéndice', desc: 'Método, parámetros, normativa y fuentes' },
];

export const CAPITULO_IDS = CAPITULOS.map(c => c.id);
