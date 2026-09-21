/**
 * Inversa de la curva de percentiles publicada, sólo para dibujar.
 *
 * El motor sabe ir de salario a percentil (`percentilDe`); estas figuras
 * necesitan el camino contrario. Es la misma interpolación, escrita una vez
 * para que el enjambre y el mosaico no inventen cada uno la suya.
 */
export function salarioEnPercentil(p, dist) {
  const pts = [
    [10, dist.p10],
    [25, dist.p25],
    [50, dist.p50],
    [75, dist.p75],
    [90, dist.p90],
  ];
  if (p <= 10) return dist.p10 * Math.pow(p / 10, 1 / 0.7);
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, s0] = pts[i];
    const [p1, s1] = pts[i + 1];
    if (p >= p0 && p <= p1) return s0 + ((p - p0) / (p1 - p0)) * (s1 - s0);
  }
  const q = Math.min(p, 99.4);
  return dist.p90 * (1 - Math.log(Math.max(1e-3, 1 - (q - 90) / 10)));
}
