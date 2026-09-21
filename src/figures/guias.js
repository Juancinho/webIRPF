/* ═══════════════════════════════════════════════════════════════════════════
   CÓMO SE LEE CADA FIGURA.

   Una publicación de datos falla cuando el lector entiende el dibujo pero no
   sabe qué pregunta responde. Estas guías van en el margen izquierdo, que es
   fijo mientras se desplaza el capítulo, y cambian sola cuando cambia la
   figura que se tiene delante.

   Cada una responde a tres cosas, siempre en el mismo orden:

     que · qué pregunta contesta la figura
     lee · qué es cada eje, cada marca y cada color
     ojo · el matiz que evita leerla mal

   Se escriben en texto llano, sin cifras concretas: las cifras ya están en la
   figura y cambian con el sueldo y el año. Aquí va lo que no cambia.
   ═══════════════════════════════════════════════════════════════════════════ */

export const GUIAS = {
  '02': {
    titulo: 'El reparto de tu bruto',
    que: 'Parte tu salario bruto en los tres sitios a los que va: lo que llega a tu cuenta, lo que se lleva el IRPF y lo que se lleva tu cotización.',
    lee: 'La barra entera es el 100 % de tu bruto. El ancho de cada tramo es proporcional a su importe y cada uno lleva su cifra al lado, sin leyenda que descifrar.',
    ojo: 'El denominador aquí es el bruto. Lo que la empresa paga por encima de tu sueldo no está en esta barra: aparece en el capítulo siguiente.',
  },
  '03': {
    titulo: 'El libro de cálculo',
    que: 'El camino entero de un euro, operación a operación, desde lo que cuesta tu puesto hasta lo que acaba en tu cuenta.',
    lee: 'Barra llena, dinero. Rayada, lo que se descuenta de lo que había. De trazos, una magnitud de cálculo que no sale de tu bolsillo. Todas comparten escala.',
    ojo: 'Despliega cualquier fila para ver su fórmula y su norma. La base imponible no es un descuento: es la cifra sobre la que se aplica la escala.',
  },
  '04': {
    titulo: 'El caudal que se estrecha',
    que: 'El mismo recorrido del capítulo anterior, pero visto como un caudal: cuatro estadios y tres desprendimientos.',
    lee: 'El ancho de cada banda es proporcional al importe y cada marca vale una cantidad fija de euros. Los hilos que se van por los lados son el dinero que se desprende en ese paso.',
    ojo: 'Se lee desplazándote: cada párrafo enciende el tramo del dibujo del que habla.',
  },
  '05': {
    titulo: 'Dónde cae tu base',
    que: 'En qué tramo de la escala termina tu base imponible, y cuánta renta tuya cae en cada uno.',
    lee: 'Cada columna es un tramo: la altura es su tipo, el ancho la renta que cabe. Marcas llenas, renta tuya; huecas, capacidad que no alcanzas.',
    ojo: 'Terminar «dentro» de un tramo no es pagar ese tipo por todo el sueldo, sólo por la parte que cae ahí.',
  },
  '06': {
    titulo: 'Cien euros contra cien euros',
    que: 'Los cien euros que ya has ganado frente a los cien siguientes, contados uno a uno.',
    lee: 'Cada cuadrado es un euro: lleno, IRPF; hueco, lo que te queda. Arriba, el reparto medio de tu sueldo; abajo, el de los cien siguientes.',
    ojo: 'Miden igual a propósito: lo que cambia no es cuánto ganas, sino cuánto se lleva cada euro según dónde caiga.',
  },
  '07': {
    titulo: 'Marginal frente a efectivo',
    que: 'Cómo se separan el marginal y los efectivos a lo largo de toda la escala.',
    lee: 'Horizontal, el bruto; vertical, el porcentaje. Cada línea se nombra en su extremo; la vertical de puntos es tu sueldo.',
    ojo: 'La azul es el euro siguiente; las otras dos, el sueldo entero. Por eso estar «en el tramo del 37 %» no es pagar el 37 %.',
  },
  '08': {
    titulo: 'El acantilado del art. 20',
    que: 'Por qué en los salarios bajos el marginal se dispara: la reducción del art. 20 se retira según sube el sueldo.',
    lee: 'Comparten eje horizontal: la causa queda encima del efecto. Arriba, la reducción en euros; abajo, el marginal punto a punto.',
    ojo: 'En la caída, cada euro de más sube el rendimiento y recorta el beneficio: la base crece más de un euro por euro.',
  },
  '09': {
    titulo: 'Qué te queda de una subida',
    que: 'Cuánto llega de verdad a tu cuenta de una subida de sueldo, y cuánto se queda por el camino.',
    lee: 'Mueve el importe. El bloque reparte cien euros de esa subida —no de tu sueldo— entre lo que llega y lo que no.',
    ojo: 'El marginal de una subida grande es la media de los tramos que atraviesa: no tiene por qué ser el tipo de tu tramo de hoy.',
  },
  '10': {
    titulo: 'Quince fiscalidades',
    que: 'Qué te habría dejado el mismo poder de compra bajo las normas de cada uno de los quince años.',
    lee: 'Una fila por año. La vertical es el neto del último ejercicio: a la derecha, los que dejaban más; a la izquierda, los que dejaban menos. Pulsa un año para llevar el informe a él.',
    ojo: 'El bruto se reexpresa en euros de cada año: lo que cambia de fila a fila no es tu sueldo, es la fiscalidad.',
  },
  '11': {
    titulo: 'La diferencia, en fichas',
    que: 'Lo que separa a dos años, contado en fichas en vez de en porcentajes.',
    lee: 'Cada ficha vale una cantidad fija y van de cinco en cinco. Las oscuras son IRPF; las verdes, tu cotización.',
    ojo: 'Sólo cuenta lo que sale de tu nómina: la cotización de la empresa no está aquí.',
  },
  '12': {
    titulo: 'Dos años, cara a cara',
    que: 'Dos ejercicios uno al lado del otro, concepto a concepto, desde el mismo poder adquisitivo.',
    lee: 'Elige los dos años arriba. Todas las cifras van en euros de hoy, así que se comparan sin corregir nada.',
    ojo: 'Es la misma persona con el mismo sueldo real en dos sistemas distintos, no dos personas.',
  },
  '13': {
    titulo: 'Todos los sueldos a la vez',
    que: 'El neto real de toda la escala salarial, no sólo el tuyo, dibujado una vez por año.',
    lee: 'Horizontal, el bruto; vertical, el neto en euros constantes. Cada curva es un año: el elegido en verde, el resto de contexto.',
    ojo: 'Sirve para ver si una reforma afectó igual a rentas bajas, medias y altas, o si las curvas se cruzan.',
  },
  '14': {
    titulo: 'La progresividad en frío',
    que: 'Qué pasa si tu sueldo sube justo lo que el IPC: tu poder de compra no cambia, el impuesto sí.',
    lee: 'Continua, con las reglas aprobadas de verdad. Discontinua, el mismo caso con los umbrales indexados al IPC. La distancia es el efecto.',
    ojo: 'No es una subida votada por nadie: es no mover los números de la ley mientras los precios se mueven.',
  },
  '15': {
    titulo: 'Una norma reescrita seis veces',
    que: 'Cómo se ha reescrito la reducción del artículo 20 en quince años.',
    lee: 'Horizontal, el rendimiento neto previo; vertical, la reducción. Cada curva es la redacción vigente en un año, nombrada en su extremo.',
    ojo: 'La caída de cada curva marca el acantilado de ese año: donde la reducción se retira.',
  },
  '16': {
    titulo: 'Quince años, altura por altura',
    que: '¿Se lleva hoy el sistema más que antes por el mismo poder de compra? Para nueve alturas de la escala a la vez.',
    lee: 'Horizontal, los quince años; vertical, el tipo efectivo total. Cada línea es un nivel fijo de sueldo, en euros de cada año para que su poder de compra no cambie.',
    ojo: 'Si el poder de compra no cambia, sólo la fiscalidad mueve una línea. Los años elegidos marcan el tramo que se mide a la derecha.',
  },
  '17': {
    titulo: 'El mapa completo',
    que: 'Los quince años y los cien niveles de renta a la vez, en una sola imagen.',
    lee: 'Una fila por año, una columna por nivel de sueldo con el mismo poder de compra. Cuanto más oscura la celda, mayor la carga.',
    ojo: 'Sirve para localizar manchas: periodos o tramos que se salen del patrón. Para medir, la figura anterior es más precisa.',
  },
  '18': {
    titulo: 'El sueldo, medido en cosas',
    que: 'El mismo sueldo medido en cosas que se pueden señalar, en vez de en euros constantes.',
    lee: 'Una fila por año. Cada figura es una unidad —un m², un mes de alquiler, una mensualidad del SMI— y se cuentan las que caben en tu neto.',
    ojo: 'Cada fila se mueve por dos motivos: lo que te dejó la fiscalidad y lo que costaba esa cosa ese año. No todo el cambio es fiscal.',
  },
  '19': {
    titulo: 'Cien euros de coste laboral',
    que: 'Los cien euros que cuesta tu puesto de trabajo, repartidos entre los cuatro sitios a los que van.',
    lee: 'Cada bloque es un euro de cada cien. Al desplazarte, los mismos cien bloques se separan en sus cuatro destinos y luego se señala uno a uno, con su cifra.',
    ojo: 'Nada aparece ni desaparece: son siempre los mismos cien bloques moviéndose, así que puedes seguir un euro concreto desde el montón inicial hasta su destino.',
  },
  '20': {
    titulo: 'La misma cuña, treinta y ocho países',
    que: 'La misma medida calculada igual para treinta y ocho países, que es la única forma de saber si la cuña española es mucho o poco.',
    lee: 'Cada fila son cien euros de coste laboral en un país. La parte clara es lo que llega al trabajador; las tres oscuras son IRPF, cotización del trabajador y cotización de la empresa.',
    ojo: 'Es un caso estandarizado —soltero, sin hijos, al salario medio de cada país—, no tu caso. Compara sistemas fiscales, no personas.',
  },
  '21': {
    titulo: 'Cuánta gente cobra cada sueldo',
    que: 'Cómo se reparten los salarios en España, y en qué punto del reparto caes tú.',
    lee: 'Horizontal, el salario bruto anual. El área bajo la curva es cuántos asalariados hay en cada nivel: donde la curva es alta, hay mucha gente. La marca verde eres tú.',
    ojo: 'La curva tiene una cola larga hacia la derecha, así que la media queda bastante por encima de la mediana. Por eso la mediana describe mejor lo que cobra la gente normal.',
  },
  '22': {
    titulo: 'Tu percentil',
    que: 'La misma distribución leída por percentiles: qué sueldo deja por debajo a cada porcentaje de asalariados.',
    lee: 'Una marca vale una cantidad fija de euros. La vertical verde es tu salario, y el número que la acompaña es cuántos de cada cien cobran menos que tú.',
    ojo: 'El percentil mide salario bruto entre asalariados. No mide patrimonio, ni renta del hogar, ni bienestar.',
  },
  '23': {
    titulo: 'Mil asalariados, uno por punto',
    que: 'La distribución entera contada en personas: mil puntos colocados por su sueldo.',
    lee: 'Los puntos se apilan cuando coinciden, así que la altura del montón es cuánta gente cobra ese sueldo. No hay eje vertical: la forma es el dato. El punto verde eres tú.',
    ojo: 'Los escalones salen de interpolar entre los cinco percentiles publicados, no de la realidad. Los que pasan de 100.000 € van contados aparte, a la derecha.',
  },
  '24': {
    titulo: 'La escalera también se mueve',
    que: 'Cómo se ha desplazado la escala salarial entera en quince años, no sólo tu sueldo.',
    lee: 'Cada año lleva una banda clara (percentiles 10 a 90), una oscura (25 a 75) y la mediana. Todo en euros de hoy. Los puntos verdes son tu sueldo llevado a cada año con el IPC.',
    ojo: 'Si tu sueldo sube como el IPC pero la escala sube más, bajas de posición sin perder poder adquisitivo. Son dos cosas distintas.',
  },
  '25': {
    titulo: 'Quién sostiene la recaudación',
    que: 'De qué parte de la escala salarial sale lo que se recauda sobre las nóminas.',
    lee: 'Veinte grupos de cinco percentiles. El ancho es la masa salarial que cobra el grupo; la altura, su tipo efectivo. Como recaudación es masa por tipo, el área de cada bloque es su aportación.',
    ojo: 'Es un modelo: aplica el mismo perfil a todos los tramos, así que no es la recaudación real. El último grupo descansa sobre la extrapolación de la cola alta.',
  },
  '26': {
    titulo: 'El río de los euros',
    que: 'A dónde iría tu aportación si se repartiera igual que se reparte el gasto público.',
    lee: 'Dos afluentes —cotizaciones e IRPF— desembocan en una caja común, y la caja se abre en las funciones del gasto. El ancho de cada cinta es su parte. Arriba se cambia la unidad.',
    ojo: 'El presupuesto no está afectado: ningún impuesto financia una función concreta. No dice a dónde fue tu dinero, sino cómo se repartiría si siguiera el reparto del gasto.',
  },
  '27': {
    titulo: 'La misma cifra, en días',
    que: 'Cuántos días del año trabajas para el sistema antes de empezar a cobrar para ti.',
    lee: 'Cada casilla es un día del año. Las llenas equivalen a la cuña fiscal; las vacías, a renta neta. Los colores aplican el reparto del gasto de la figura anterior.',
    ojo: 'Es una equivalencia proporcional, no un calendario de pagos: los impuestos no se devengan así, y la fecha sale de ordenar una proporción desde el 1 de enero.',
  },
  '28': {
    titulo: 'El saldo de la deuda',
    que: 'Cuánta deuda pública acumula España, año a año, y cuánto pesa sobre el tamaño de su economía.',
    lee: 'Una marca por año, con su línea vertical hasta el cero. En verde, el año que tienes seleccionado. Pasa el cursor para inspeccionar cualquier ejercicio.',
    ojo: 'Elige una magnitud cada vez. Total, por habitante y porcentaje del PIB miden cosas distintas y superponerlas engaña al ojo.',
  },
  '29': {
    titulo: 'Cuánto cambió cada año',
    que: 'La variación anual del saldo, en vez del saldo acumulado.',
    lee: 'Cada columna parte de cero: hacia arriba, aumento; hacia abajo, reducción. La suma de todas las columnas es la variación de todo el periodo.',
    ojo: 'Un saldo que sigue creciendo puede estar creciendo cada vez menos. Esta figura enseña el ritmo; la anterior, el nivel.',
  },
  '30': {
    titulo: 'La deuda frente a tu IRPF',
    que: 'Una comparación de escala: la deuda que toca por habitante frente a lo que pagas de IRPF en un año.',
    lee: 'Un bloque vale una cantidad fija de euros. Arriba, la deuda por habitante; abajo, tu IRPF de un año. El deslizador pinta en verde la parte que cubrirían los años que elijas.',
    ojo: 'No es una deuda que te corresponda pagar ni una previsión de amortización. La deuda se sostiene y se refinancia con el conjunto de los ingresos y activos de la economía.',
  },
};

/** El número de figura tal y como lo escribe el marco: «FIG. 16» → «16». */
export const idDeFigura = nodo =>
  nodo?.querySelector('.fs-figure-id')?.textContent.replace(/[^0-9]/g, '') || null;
