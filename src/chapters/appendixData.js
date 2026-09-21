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
    descripcion: 'Se suben las bases máximas de cotización y se incrementan los tipos de SS en varios epígrafes. Congelación del SMI.',
    metricas: [
      { label: 'SS trabajador', valor: '6,35%' },
    ],
  },
  {
    anio: 2015,
    mes: 'Ene',
    tipo: 'irpf',
    titulo: 'Gran reforma Montoro II — Fase 1',
    subtitulo: 'Ley 26/2014 — Reforma LIRPF',
    descripcion: 'La mayor reforma del IRPF desde 2007. Reduce los tramos de 7 a 5, baja tipos, amplía el Art.20 (reducción por rendimientos del trabajo) y crea los gastos fijos de 2.000 € (Art.19). El mínimo personal sube a 5.550 €.',
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
    titulo: 'Gran reforma Montoro II — Fase 2',
    subtitulo: 'Segunda parte de la Ley 26/2014',
    descripcion: 'La reforma se diseñó en dos etapas. En 2016, los tipos bajan de nuevo: el mínimo pasa a 19% y el máximo a 45%. Se consolida el nuevo Art.20 con umbrales más generosos. Es el IRPF más bajo de la serie.',
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
    titulo: 'Gobierno PSOE: SMI histórico + Art.20',
    subtitulo: 'RDL 28/2018 — Revalorización SMI',
    descripcion: 'El SMI sube un 22% de golpe, el mayor aumento en décadas. Para compensar el efecto fiscal en rentas bajas, el Art.20 también se amplía: el umbral inferior sube a 16.825 €. Los que ganan menos de ese umbral pagan menos IRPF.',
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
    descripcion: 'Se crea un tipo marginal del 47% para bases liquidables superiores a 300.000 €. Afecta a muy pocos contribuyentes pero tiene alto impacto simbólico. El SMI sube a 13.300 €.',
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
    descripcion: 'El mayor cambio para autónomos en décadas: sus cuotas SS ya no son una cantidad fija sino que dependen de sus rendimientos netos reales, con 15 tramos. Además, el MEI (Mecanismo de Equidad Intergeneracional) añade +0,6% de cotización a todos los trabajadores para reforzar el sistema de pensiones.',
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
    descripcion: 'Las CCAA aceleran su diferenciación fiscal. Madrid consolida los tipos más bajos del régimen común (mínimo 18%, máximo 45,5%), mientras Cataluña mantiene los más altos (hasta 50%). Andalucía también baja tipos tras su reforma 2022. La diferencia entre CCAA puede superar los 3.000 € anuales para el mismo salario.',
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
    titulo: 'SMI 16.576 € — continuidad ascendente',
    subtitulo: 'Real Decreto SMI 2025',
    descripcion: 'El SMI continúa su senda alcista. Desde 2018 ha aumentado un 60,9% en términos nominales y cerca de un tercio en términos reales. El efecto sobre el IRPF es notable: más trabajadores superan el umbral de retención y la reducción Art.20 se vuelve menos valiosa.',
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
    a: 'Comparar 30.000€ de 2012 con 30.000€ de 2026 es un error financiero: debido a la inflación (aprox. +25% en este periodo), el dinero de 2012 tenía mucho más poder de compra. Si comparásemos euros nominales, parecería que hoy pagamos menos impuestos simplemente porque los números son más grandes.\n\nAl convertir todo a "Euros de 2026", eliminamos el ruido de los precios. Si una línea de 2015 está por encima de la de 2026 en el gráfico de salario neto, significa que en 2015 tenías más capacidad de compra real, independientemente de lo que pusiera en tu nómina. Es la única forma de ver si las reformas fiscales te han beneficiado o si la inflación se ha "comido" tus subidas.'
  },
  {
    q: '¿Qué es la "trampa de la inflación" en el IRPF?',
    a: 'Es lo que los economistas llaman "progresividad fría" o "bracket creep". El IRPF es un impuesto progresivo (paga más quien más gana), pero los tramos (19%, 24%, etc.) se definen en euros nominales. Si tu sueldo sube un 5% para igualar la inflación, tu poder adquisitivo es el mismo, pero Hacienda puede pasarte al siguiente tramo de impuestos.\n\nResultado: ganas lo mismo en términos reales, pero pagas un porcentaje mayor de IRPF. Esta herramienta permite visualizar este efecto: verás que en muchos años, aunque el neto nominal subía, el neto real (en euros de 2026) bajaba o se estancaba.'
  },
  {
    q: '¿Qué es el IRPF y cómo funciona?',
    a: 'El Impuesto sobre la Renta de las Personas Físicas es un impuesto personal, progresivo y directo sobre la renta obtenida en España (arts. 1-14 LIRPF). "Progresivo" significa que a mayor renta, mayor tipo aplicable. Para trabajadores por cuenta ajena, el empleador actúa como retenedor: calcula y retiene mensualmente el IRPF e ingresa en Hacienda.\n\nEl cálculo sigue este orden crítico: del Salario Bruto se restan las Cotizaciones SS (Paso 1), el resultado es el Rendimiento Neto. A este se le restan los Gastos Deducibles (Art. 19) y la Reducción por Trabajo (Art. 20) para obtener la Base Imponible. Solo sobre esta última se aplica la tarifa por tramos.'
  },
  {
    q: '¿Qué es la reducción Art.20 y por qué es tan importante?',
    a: 'Es el Art. 20 de la LIRPF ("Reducción por obtención de rendimientos del trabajo") y es la herramienta que usa el Estado para que las rentas bajas no paguen (o paguen muy poco) IRPF sin tener que bajar los impuestos a todo el mundo.\n\nFunciona con dos umbrales: por debajo del inferior (aprox. el SMI), la reducción es máxima y suele anular el impuesto. Entre ambos umbrales, la reducción desaparece progresivamente. El problema es que en esa zona de desaparición se crea el "efecto cliff": cada euro extra que ganas te quita parte de la reducción, por lo que tu base imponible sube más de un euro por cada euro ganado. Esto explica por qué el tipo marginal efectivo es tan alto para salarios entre 15.000€ y 20.000€.'
  },
  {
    q: 'Diferencia entre Mínimo Personal y Mínimo Exento',
    a: 'Es la confusión más común. El Mínimo Personal (Art. 57, aprox. 5.550€) es una cantidad que no tributa para nadie; se resta al final del cálculo. El Mínimo Exento de Retención (aprox. 15.876€ en 2026), sin embargo, es el umbral por debajo del cual la ley prohíbe a tu empresa retenerte nada de IRPF.\n\nSi ganas 15.000€, tu mínimo exento es mayor que tu sueldo, así que tu retención es 0%. Pero si ganas 16.000€, ya superas el mínimo exento y empiezas a pagar IRPF sobre todo lo que exceda del mínimo personal y las reducciones. Por eso, al pasar el mínimo exento, el neto puede no subir tanto como el bruto.'
  },
  {
    q: '¿Qué son los 2.000€ de gastos deducibles (Art.19.2.f)?',
    a: 'Introducidos en 2015, son una cantidad fija que se resta de tu sueldo bruto para compensar los gastos que conlleva trabajar (ropa, transporte, etc.). No necesitas facturas para justificarlos; se aplican por defecto a todos los trabajadores.\n\nEs importante porque reduce la Base Imponible directamente. Para una persona en el tramo del 19%, estos 2.000€ suponen un ahorro real de 380€ al año en impuestos.'
  },
  {
    q: '¿Qué es el tipo marginal y por qué puede superar el 40% en rentas medias?',
    a: 'El tipo marginal es el impuesto que pagas por el "siguiente euro" que ganas. Si te suben el sueldo 1.000€ y Hacienda se queda con 400€, tu marginal es del 40%.\n\nEn España, el tipo marginal efectivo es engañoso: aunque los tramos oficiales dicen 19% o 24%, en las rentas entre 15k y 20k el marginal real se dispara. ¿Por qué? Porque al ganar más sueldo, pierdes la reducción del Art. 20. Esa pérdida de un beneficio actúa como un impuesto invisible adicional.'
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
    fuente: 'RDL 28/2018, art. 59 (BOE-A-2018-9268)',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268#ar-59'
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
    url: null
  },
  {
    concepto: 'SMI histórico',
    fuente: 'RD aprobado cada año (BOE oficial de cada ejercicio)',
    url: null
  },
];
