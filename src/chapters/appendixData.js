/* Contenido normativo protegido: cronología, preguntas y fuentes.
   Texto y referencias legales trasladados literalmente desde la versión
   anterior de FiscalScope; sólo se han retirado los colores del sistema
   visual anterior. */

export const CRONOLOGIA = [
  {
    anio: 2012,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Tipos adicionales temporales IRPF',
    subtitulo: 'RDL 20/2011 — Plan de estabilidad',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-20638',
    descripcion: 'Se añaden tipos adicionales "temporales" de 0,75% a 7% sobre los tramos ordinarios. El tipo marginal máximo sube hasta el 52%. Tenía que durar dos años; duró cuatro.',
    metricas: [
      { label: 'Tipo marginal máximo', valor: '52%' },
      { label: 'SMI anual', valor: '8.980 €' },
    ],
  },
  {
    anio: 2012,
    mes: 'Jul',
    tipo: 'ss',
    titulo: 'Subida cotizaciones SS',
    subtitulo: 'RDL 20/2012 — Medidas de ajuste',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-9364',
    descripcion: 'Se suben las bases máximas de cotización y se incrementan los tipos de SS en varios epígrafes. Congelación del SMI.',
    metricas: [
      { label: 'SS trabajador', valor: '6,35%' },
    ],
  },
  {
    anio: 2015,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Reforma del IRPF — fase 1',
    subtitulo: 'Ley 26/2014 — Reforma LIRPF',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12327',
    descripcion: 'La Ley 26/2014 reduce los tramos de 7 a 5, modifica los tipos, amplía la reducción por rendimientos del trabajo del art. 20 e introduce 2.000 € de otros gastos deducibles en el art. 19. El mínimo personal pasa a 5.550 €.',
    metricas: [
      { label: 'Tramos IRPF', valor: '5 tramos' },
      { label: 'Tipo mínimo', valor: '19,5%' },
      { label: 'Tipo máximo', valor: '47%' },
      { label: 'Gastos Art.19', valor: '2.000 €' },
    ],
  },
  {
    anio: 2016,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Reforma del IRPF — fase 2',
    subtitulo: 'Segunda parte de la Ley 26/2014',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12327',
    descripcion: 'La segunda fase de la Ley 26/2014 sitúa el tipo mínimo en el 19% y el máximo en el 45%, y aplica los umbrales previstos para la nueva redacción del art. 20.',
    metricas: [
      { label: 'Tipo mínimo', valor: '19%' },
      { label: 'Tipo máximo', valor: '45%' },
      { label: 'Art.20 umbral inf.', valor: '11.250 €' },
    ],
  },
  {
    anio: 2019,
    mes: 'Ene',
    tipo: 'mixto',
    titulo: 'Actualización del SMI y del art. 20',
    subtitulo: 'Ley 6/2018, art. 59 — ampliación del art. 20',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268#a59',
    descripcion: 'El SMI aumenta un 22,3% y el umbral inferior del art. 20 pasa a 16.825 €. En el cálculo del IRPF, esta ampliación incrementa la reducción aplicable a parte de las rentas del trabajo más bajas.',
    metricas: [
      { label: 'SMI anual', valor: '12.600 €' },
      { label: 'Subida SMI', valor: '+22,3%' },
      { label: 'Art.20 umbral inf.', valor: '16.825 €' },
    ],
  },
  {
    anio: 2020,
    mes: 'Jun',
    tipo: 'irpf',
    titulo: 'Nuevo tramo 47% para rentas muy altas',
    subtitulo: 'PGE 2021 / Ley 11/2020',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-17339',
    descripcion: 'Se crea un tipo marginal del 47% para bases liquidables superiores a 300.000 €. Su alcance depende del número de contribuyentes cuya base supera ese umbral. El SMI pasa a 13.300 € anuales.',
    metricas: [
      { label: 'Nuevo tramo', valor: '>300k€ → 47%' },
      { label: 'SMI anual', valor: '13.300 €' },
    ],
  },
  {
    anio: 2023,
    mes: 'Ene',
    tipo: 'ss',
    titulo: 'MEI + cuotas autónomos por ingresos reales',
    subtitulo: 'Ley 21/2021 — Sistema de cuotas progresivo autónomos',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-21652#df-4',
    descripcion: 'La cotización de los trabajadores autónomos pasa a vincularse a sus rendimientos netos mediante 15 tramos. Además, el Mecanismo de Equidad Intergeneracional añade 0,6 puntos porcentuales a la cotización total destinada al sistema de pensiones.',
    metricas: [
      { label: 'MEI', valor: '+0,6% SS' },
      { label: 'Tramos autónomos', valor: '15 tramos' },
      { label: 'SMI anual', valor: '15.120 €' },
    ],
  },
  {
    anio: 2023,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Tramo 47% baja a 200.000 €',
    subtitulo: 'Ley de PGE 2023',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128',
    descripcion: 'El umbral del tramo marginal del 47% desciende de 300.000 € a 200.000 €, ampliando su aplicación. El Art.20 se amplía nuevamente: el umbral inferior sube a 19.747,50 €, el más alto de la serie.',
    metricas: [
      { label: 'Tramo 47%', valor: 'desde 200k€' },
      { label: 'Art.20 umbral inf.', valor: '19.747,50 €' },
    ],
  },
  {
    anio: 2024,
    mes: 'Ene',
    tipo: 'ccaa',
    titulo: 'Reformas autonómicas: Madrid, Andalucía, Cataluña',
    subtitulo: 'Divergencia fiscal territorial',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-5610',
    descripcion: 'Las escalas autonómicas mantienen diferencias relevantes. En los parámetros incluidos, Madrid aplica un mínimo del 18% y un máximo del 45,5%, Cataluña alcanza el 50% y Andalucía incorpora los cambios de su reforma de 2022. El resultado para un mismo salario depende también de mínimos y deducciones autonómicas.',
    metricas: [
      { label: 'Madrid máx.', valor: '45,5%' },
      { label: 'Cataluña máx.', valor: '50%' },
      { label: 'SMI anual', valor: '15.876 €' },
    ],
  },
  {
    anio: 2025,
    mes: 'Ene',
    tipo: 'smi',
    titulo: 'SMI de 16.576 €',
    subtitulo: 'Real Decreto SMI 2025',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-2576',
    descripcion: 'El SMI alcanza 16.576 € anuales, un 60,9% más que en 2018 en términos nominales. Su relación con el IRPF depende de los umbrales de retención, de la reducción del art. 20 y del resto de parámetros vigentes.',
    metricas: [
      { label: 'SMI anual', valor: '16.576 €' },
      { label: 'Variación 2018→2025', valor: '+60,9%' },
    ],
  },
  {
    anio: 2026,
    mes: 'Feb',
    tipo: 'smi',
    titulo: 'SMI 17.094 € — nueva deducción en cuota',
    subtitulo: 'RD 126/2026 y RDL 5/2026',
    url: 'https://www.boe.es/eli/es/rd/2026/02/18/126',
    urls: [
      { label: 'RD 126/2026 · SMI', url: 'https://www.boe.es/eli/es/rd/2026/02/18/126' },
      { label: 'RDL 5/2026 · deducción', url: 'https://www.boe.es/eli/es/rdl/2026/02/17/5' },
    ],
    descripcion: 'El SMI queda fijado en 1.221 € mensuales en 14 pagas. La deducción por rendimientos del trabajo sube a 590,89 € y desaparece progresivamente hasta 20.048,45 €. El IPC usado para las comparaciones en euros constantes de 2026 sigue siendo una estimación hasta que el INE publique el dato de diciembre.',
    metricas: [
      { label: 'SMI anual', valor: '17.094 €' },
      { label: 'Deducción máxima', valor: '590,89 €' },
    ],
  },
];

export const PREGUNTAS = [
  {
    q: '¿Por qué el gráfico usa "euros constantes de 2026"?',
    a: 'Una misma cantidad nominal no representa el mismo poder de compra en años con niveles de precios distintos. Expresar cada importe en euros constantes de 2026 consiste en actualizarlo con el IPC para que todas las observaciones compartan una unidad comparable.\n\nSi el neto de 2015, convertido a euros de 2026, queda por encima del neto de 2026, su poder adquisitivo estimado era mayor. La comparación real aísla el efecto de los precios; la nominal conserva las cantidades efectivamente declaradas en cada año. Ambas responden a preguntas diferentes.'
  },
  {
    q: '¿Qué es la progresividad en frío?',
    a: 'Es el aumento de la carga efectiva que puede producirse cuando la renta nominal crece con los precios, pero los umbrales del impuesto no se actualizan en la misma proporción. El poder adquisitivo puede permanecer estable mientras una parte mayor de la renta queda sujeta a tramos superiores o se reducen beneficios ligados a límites nominales.\n\nDeflactar una serie convierte importes pasados a euros de poder adquisitivo comparable. Indexar —o deflactar, en el uso habitual referido a la tarifa— consiste en actualizar tramos, mínimos, reducciones y deducciones con el IPC. Esto no cambia los tipos legales; cambia los umbrales nominales a los que se aplican. La referencia indexada de esta publicación es un contrafactual, no una norma que estuviera vigente.'
  },
  {
    q: '¿Qué es el IRPF y cómo funciona?',
    a: 'El Impuesto sobre la Renta de las Personas Físicas es un impuesto personal, progresivo y directo sobre la renta obtenida en España (arts. 1-14 LIRPF). La progresividad implica que el tipo marginal aumenta por tramos: cada tipo se aplica únicamente a la parte de base comprendida en su intervalo. Para trabajadores por cuenta ajena, el pagador practica retenciones a cuenta e ingresa su importe en la Agencia Tributaria.\n\nEn el modelo de esta publicación, del rendimiento íntegro se restan cotizaciones y gastos deducibles para obtener el rendimiento neto; después se aplican las reducciones correspondientes. La escala se aplica a la base y el mínimo personal y familiar interviene mediante el procedimiento legal de cálculo de la cuota.'
  },
  {
    q: '¿Qué es la reducción Art.20 y por qué es tan importante?',
    a: 'El art. 20 de la LIRPF regula una reducción aplicable a determinados rendimientos netos del trabajo. Su cuantía depende de los umbrales y condiciones vigentes en cada ejercicio.\n\nPor debajo del umbral inferior la reducción alcanza su máximo; entre los umbrales disminuye de forma gradual hasta desaparecer. En esa zona, un euro adicional de rendimiento puede aumentar la base imponible en más de un euro porque, además, reduce parte del beneficio. Ese mecanismo eleva el tipo marginal efectivo sin modificar el tipo legal del tramo.'
  },
  {
    q: 'Diferencia entre Mínimo Personal y Mínimo Exento',
    a: 'Son conceptos distintos. El mínimo personal y familiar interviene en el cálculo de la cuota para reconocer una parte de renta destinada a necesidades básicas. El límite excluyente de la obligación de retener determina cuándo el pagador debe practicar retención, según la situación personal y familiar.\n\nSuperar el límite de retención no significa que todo el salario pase a tributar de una vez: se aplica el procedimiento completo de cálculo y sus límites. Por eso conviene distinguir entre retención en nómina, cuota anual y mínimo personal.'
  },
  {
    q: '¿Qué son los 2.000€ de gastos deducibles (Art.19.2.f)?',
    a: 'Desde 2015, el art. 19.2.f establece una cuantía general de otros gastos deducibles para obtener el rendimiento neto del trabajo, sin exigir la acreditación individual de ese importe. No debe confundirse con una deducción directa en cuota.\n\nSu efecto fiscal depende del tipo marginal y del resto del cálculo. Con un marginal del 19%, una reducción adicional de base de 2.000 € tendría, de forma aislada, un efecto de hasta 380 €; el resultado efectivo puede variar por mínimos, reducciones y límites.'
  },
  {
    q: '¿Qué es el tipo marginal y por qué puede superar el 40% en rentas medias?',
    a: 'El tipo marginal efectivo mide cuánto disminuye el incremento de renta neta cuando aumenta el salario bruto. Incluye no solo el IRPF, sino también cotizaciones y la retirada de reducciones o deducciones vinculadas a la renta.\n\nPor eso puede superar el tipo legal del tramo. En la zona de retirada del art. 20, un aumento de salario eleva el rendimiento y, al mismo tiempo, reduce la reducción aplicable. La diferencia entre marginal legal y efectivo procede de esa interacción.'
  },
  {
    q: '¿Qué representa el calendario fiscal?',
    a: 'Es una equivalencia gráfica, no un calendario de cobros o pagos. Primero se divide la cuña fiscal —IRPF y cotizaciones— entre el coste laboral total. Después se multiplica esa proporción por los 365 o 366 días del año. Ordenar esos días desde el 1 de enero produce una fecha de corte convencional.\n\nLa fecha no significa que hasta entonces se trabaje para una administración ni que a partir de ella el salario cambie de destinatario. Tampoco identifica cuándo se devenga o se ingresa cada tributo. Los colores aplican, como segunda operación ilustrativa, la estructura agregada del gasto COFOG a los días equivalentes; no trazan impuestos concretos hasta partidas presupuestarias concretas.'
  },

];

export const FUENTES = [
  {
    concepto: 'Escalas IRPF (tarifa)',
    fuente: 'Art. 63-64 LIRPF (BOE-A-2006-20764)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a63'
  },
  {
    concepto: 'Reducción Art.20 — redacción 2026',
    fuente: 'Art. 20 LIRPF (BOE)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a20'
  },
  {
    concepto: 'Reducción Art.20 — redacción 2019',
    fuente: 'Ley 6/2018, art. 59 (BOE-A-2018-9268)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268#a59'
  },
  {
    concepto: 'Gastos deducibles Art.19.2.f',
    fuente: 'Art. 19 LIRPF (BOE)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a19'
  },
  {
    concepto: 'Mínimo del contribuyente Art.57',
    fuente: 'Art. 57 LIRPF (BOE)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a57'
  },
  {
    concepto: 'Deducción por obtención de rentas del trabajo (SMI)',
    fuente: 'AEAT — Manual IRPF 2025',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html'
  },
  {
    concepto: 'Cotizaciones SS trabajadores 2026 (TGSS)',
    fuente: 'Orden PJC/297/2026 (BOE)',
    url: 'https://www.boe.es/eli/es/o/2026/03/30/pjc297'
  },
  {
    concepto: 'Cotizaciones SS 2019 (archivado)',
    fuente: 'Wayback Machine — TGSS 2019',
    url: 'https://web.archive.org/web/20190223131030/https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537'
  },
  {
    concepto: 'IPC acumulado dic.2019 / dic.2025 (INE)',
    fuente: 'INE — Variaciones del IPC',
    url: 'https://www.ine.es/varipc/verVariaciones.do?idmesini=12&anyoini=2019&idmesfin=12&anyofin=2025&ntipo=1&enviar=Calcular'
  },
  {
    concepto: 'MEI y cotización de solidaridad',
    fuente: 'RDL 2/2023, art. 127 bis y 19 bis LGSS',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-6967'
  },
  {
    concepto: 'SMI 2025 y 2026',
    fuente: 'RD 87/2025 y RD 126/2026 (BOE)',
    url: 'https://www.boe.es/eli/es/rd/2026/02/18/126'
  },
];
