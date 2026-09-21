# FiscalScope

Herramienta web interactiva para analizar la evolución del IRPF en España entre 2012 y 2026. Permite calcular nóminas año a año, comparar cómo ha cambiado el salario neto real descontando la inflación, y visualizar los mecanismos internos del sistema fiscal como la reducción por rendimientos del trabajo (Art. 20 LIRPF) o la cuña fiscal.

La idea es hacer accesible información que existe en el BOE y en la normativa tributaria, pero que resulta difícil de interpretar sin herramientas que la pongan en contexto.

---

## Origen del proyecto

Este proyecto nace a partir de un script en Python publicado por **Jon González**, que realizaba los cálculos básicos de IRPF año a año para ilustrar el fenómeno conocido como "progresividad en frío" o "subida de impuestos en frío": la situación en que los tramos del IRPF no se actualizan con el IPC, haciendo que los contribuyentes paguen más impuestos en términos reales aunque su poder adquisitivo no haya mejorado.

El código original de Jon fue adaptado a JavaScript, extendido con nuevos años, nuevos parámetros normativos y envuelto en una interfaz web interactiva. Todo el crédito de la idea de fondo y la lógica de cálculo inicial es suyo.

---

## Qué hace

**Calculadora de nómina**
Introduce un salario bruto y un año y obtienes el desglose completo: cotizaciones a la Seguridad Social, reducción por rendimientos del trabajo, base imponible, tramos IRPF aplicados, cuota resultante y salario neto. Se muestran también el tipo efectivo real y el tipo marginal efectivo.

**Comparativa histórica (2012–2026)**
Tres vistas sobre los mismos datos: el salario neto por nivel salarial en euros constantes de 2026, el tipo efectivo IRPF por nivel salarial, y la evolución temporal del neto y los tipos para un salario de referencia. Todo ajustado por inflación (IPC diciembre a diciembre, INE) para que la comparación sea real y no nominal.

**Cuña fiscal**
Un gráfico de distribución que muestra cómo se reparte cada euro del sueldo entre salario neto, IRPF, cotización del trabajador y cotización patronal. Incluye una vista desde la perspectiva del trabajador (sobre el bruto) y otra desde la perspectiva del coste laboral total para la empresa.

**Mecanismos fiscales**
Visualización de la curva de reducción del Art. 20 LIRPF por año, que es el mecanismo que más protege a las rentas bajas pero que también genera la llamada "zona cliff": un tramo de ingresos en el que ganar más puede implicar un tipo marginal efectivo superior al 50%. Se incluye también la evolución histórica de los umbrales clave del sistema (SMI, mínimo exento de retención, umbrales del Art. 20) en términos nominales y reales.

**Normativa y contexto**
Resumen de las reformas fiscales del periodo, tabla de parámetros históricos y respuestas a las preguntas más frecuentes sobre la metodología.

---

## Limitaciones importantes

Los cálculos son **orientativos** y pueden contener errores. Hay que tenerlo en cuenta:

- Se usan escalas combinadas específicas para Madrid, Cataluña, Comunitat Valenciana y Andalucía desde 2024. El resto de comunidades usa una escala estándar aproximada; País Vasco y Navarra requieren un cálculo foral que esta versión no implementa.
- Se contemplan mínimos familiares básicos y tributación conjunta, pero no discapacidad, familia numerosa, planes de pensiones, rendimientos del capital, actividades económicas ni otras deducciones particulares.
- El año 2018 tiene un tratamiento especial (régimen transitorio entre las normativas de 2017 y 2019) que es una aproximación.
- Los factores de inflación se calculan a partir del IPC interanual de diciembre publicado por el INE. Para 2026 se usa provisionalmente una estimación del 3,0% hasta que se publique el dato de diciembre.
- El SMI y las cotizaciones de 2026 están actualizados con el RD 126/2026 y la Orden PJC/297/2026. Los resultados siguen siendo orientativos y pueden no reproducir todas las particularidades de una nómina o declaración real.

Si encuentras un error en los cálculos, en los parámetros históricos o en la interpretación normativa, se agradece mucho que lo reportes.

---

## Stack técnico

- **React** con Vite como bundler
- **SVG a medida** para todas las figuras: no hay librería de gráficos
- **CSS propio** (`src/styles/`), sin framework de utilidades
- **JavaScript** puro para el motor de cálculo, sin dependencias externas

En producción sólo se envían React y el propio código: las únicas dependencias del paquete son `react` y `react-dom`.

El motor fiscal está en `src/engine/irpf.js` e implementa la normativa año a año de forma explícita. Es la parte más delicada del proyecto y la que más puede beneficiarse de revisión externa.

La interfaz es una publicación de scroll continuo dividida en ocho capítulos y quince
figuras. La dirección de arte está documentada en `VISUAL_PLAN_V4.md` y el guion capítulo a
capítulo en `STORYBOARD_V2.md`; ambos son la referencia antes de tocar la capa visual.

```text
src/
  engine/     motor fiscal (protegido)
  state/      estado fiscal único: salario, año, pagas, perfil
  figures/    marco de figura, escalas y primitivas de trazo
  chapters/   los ocho capítulos de la publicación
  shell/      cabecera de lectura, índice, raíl de capítulos, cinta y colofón
  styles/     paper.css · figures.css · shell.css
```

---

## Instalación y uso local

```bash
git clone https://github.com/Juancinho/webIRPF.git
cd webIRPF
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Contribuir

El proyecto está abierto a colaboración. Las áreas donde más ayuda vendría bien:

- **Revisión de parámetros fiscales**: si detectas que un umbral, tipo o reducción de un año concreto no coincide con la normativa publicada en el BOE, abre un issue con la referencia legal.
- **Tramos autonómicos**: añadir la tarifa autonómica por comunidad ampliaría mucho la utilidad de la herramienta.
- **Años futuros**: cuando se aprueben presupuestos o modificaciones normativas de años venideros.
- **Mejoras de la interfaz**: si algo no se entiende bien o los gráficos no comunican lo que deberían.

Para contribuir: haz un fork, crea una rama descriptiva y abre una pull request explicando qué cambias y por qué. Si el cambio afecta a cálculos fiscales, incluye la referencia normativa (artículo, BOE, año).

---

## Fuentes

- Ley 35/2006 del Impuesto sobre la Renta de las Personas Físicas (LIRPF) y sus modificaciones anuales — BOE
- Ley General de la Seguridad Social (LGSS) y órdenes anuales de cotización — BOE
- Reales Decretos del Salario Mínimo Interprofesional — BOE
- Índice de Precios al Consumo (IPC), variación interanual diciembre — INE
- Bases máximas de cotización y tipos aplicables — TGSS

---

## Créditos

La idea original y la lógica de cálculo de base son de **Jon González**, quien publicó un script en Python que analizaba el impacto de la progresividad en frío en los salarios españoles. Esta herramienta es una adaptación y extensión de ese trabajo.

---

## Licencia

MIT. Úsalo, modifícalo y compártelo libremente. Si lo adaptas para otro país o contexto fiscal, se agradece una mención al proyecto original.
