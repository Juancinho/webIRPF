export const eur = (n, dec = 0) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);

export const pct = (n, dec = 1) => `${(+n).toFixed(dec)}%`;

export const num = (n) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n);

export const sign = (n, dec = 0) => {
  const s = eur(Math.abs(n), dec);
  return n >= 0 ? `+${s}` : `−${s}`;
};
