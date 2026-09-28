// Escalas de la base liquidable general. No incluyen ahorro ni deducciones.
// La tarifa estatal procede del art. 63 LIRPF. Las autonómicas se muestran
// por separado porque sus límites no tienen por qué coincidir con los estatales.
export const ESCALA_ESTATAL = [
  [12450, 0.095], [20200, 0.12], [35200, 0.15],
  [60000, 0.185], [300000, 0.225], [Infinity, 0.245],
];

export const ESCALAS_AUTONOMICAS_2026 = {
  madrid: {
    nombre: 'Comunidad de Madrid',
    norma: 'Decreto Legislativo 1/2010 de la Comunidad de Madrid, art. 1',
    fuente: 'https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068&p=20260710&tn=0#a1',
    tramos: [[13362.22, 0.085], [19004.63, 0.107], [35425.68, 0.128], [57320.40, 0.174], [Infinity, 0.205]],
  },
  cataluna: {
    nombre: 'Cataluña',
    norma: 'Decreto Legislativo 1/2024 de Cataluña, art. 611-1',
    fuente: 'https://www.boe.es/buscar/act.php?id=BOE-A-2024-6951&lang=es&p=&tn=1#a6',
    tramos: [[12500, 0.095], [22000, 0.125], [33000, 0.16], [53000, 0.19], [90000, 0.215], [120000, 0.235], [175000, 0.245], [Infinity, 0.255]],
  },
  andalucia: {
    nombre: 'Andalucía',
    norma: 'Ley 5/2021 de Andalucía, art. 23',
    fuente: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915&p=20251231&tn=1#a2-5',
    tramos: [[13000, 0.095], [21100, 0.12], [35200, 0.15], [60000, 0.185], [Infinity, 0.225]],
  },
  valencia: {
    nombre: 'Comunitat Valenciana',
    norma: 'Ley 13/1997 de la Comunitat Valenciana, art. 2',
    fuente: 'https://www.boe.es/eli/es-vc/l/1997/12/23/13/con/20260810#a2',
    tramos: [[12000, 0.088], [22000, 0.117], [32000, 0.146], [42000, 0.17], [52000, 0.194], [62000, 0.219], [72000, 0.244], [100000, 0.261], [150000, 0.2735], [200000, 0.2835], [Infinity, 0.2935]],
  },
};
