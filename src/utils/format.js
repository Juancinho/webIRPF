/* `es-ES` agrupa por defecto a partir de cinco cifras, así que «35.000 €» y
   «6329 €» convivían en la misma frase. En una publicación que enseña sus
   operaciones eso se lee como una errata, no como una norma tipográfica: aquí
   los millares se separan siempre. */
const es = (opts) => new Intl.NumberFormat('es-ES', { useGrouping: 'always', ...opts });

export const eur = (n, dec = 0) =>
  es({ style: 'currency', currency: 'EUR', minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);

// Coma decimal y espacio duro ante el signo, como pide la tipografía española.
export const pct = (n, decimales = 1) =>
  es({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(+n) + ' %';

export const num = (n) => es({ maximumFractionDigits: 0 }).format(n);

export const sign = (n, dec = 0) => {
  const s = eur(Math.abs(n), dec);
  return n >= 0 ? `+${s}` : `−${s}`;
};

// Decimales con coma española, para valores que no son ni euros ni porcentajes.
export const dec = (n, decimales = 1) =>
  es({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(+n);
