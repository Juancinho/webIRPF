# Comparativa del IRPF: Salario de 18.000 € en 2026 frente a su equivalente en 2019

## Metodología

El objetivo de este informe es analizar cuánto paga en impuestos un trabajador con un salario bruto de **18.000 € en 2026** y compararlo con lo que pagaba en 2019 por un salario equivalente en términos de poder de compra.

Para que la comparación sea rigurosa, no se enfrenta 18.000 € de 2026 contra 18.000 € de 2019, ya que ambas cifras representan capacidades de compra distintas. En su lugar, se aplica un **ajuste por IPC**: según los datos del INE, la inflación acumulada entre diciembre de 2019 y diciembre de 2025 se situó en torno al **22,3 %**[^1].

[^1]: Fuente: [INE – Variación del IPC](https://www.ine.es/varipc/verVariaciones.do?idmesini=12&anyoini=2019&idmesfin=12&anyofin=2025&ntipo=1&enviar=Calcular)

Definiendo el **Índice de Precios** ($IP$) como:

$$IP = 1 + 0{,}223 = 1{,}223$$

El salario de 2019 equivalente en poder adquisitivo a 18.000 € de 2026 es:

$$\text{Salario}_{2019} = \frac{18.000}{1{,}223} = \mathbf{14.717{,}91 \text{ €}}$$

Esto significa que 14.717,91 € en 2019 y 18.000 € en 2026 permiten adquirir exactamente los mismos bienes y servicios.

La tabla comparativa final presenta tres columnas:
- **2026**: valores calculados con salario bruto de 18.000 €.
- **2019 (€ de 2019)**: valores calculados con salario bruto de 14.717,91 €, en euros de 2019.
- **2019 (€ de 2026)**: los mismos valores de 2019 multiplicados por 1,223 para expresarlos en euros de 2026 y hacer la diferencia directamente comparable.

---

## 1. Cálculo del IRPF en 2026

### 1.1 Cotización a la Seguridad Social

Las cotizaciones aplicables en 2026 son las establecidas por la Tesorería General de la Seguridad Social[^2].

[^2]: Fuente: [TGSS – Bases y tipos de cotización 2026](https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537)

#### Cotización SS Empresa (B)

Es el importe que la empresa abona al Estado por cada trabajador contratado, adicional al salario bruto. Sumando los conceptos de la columna **"Empresa"**:

| Concepto | Tipo |
|---|---|
| Contingencias Comunes | 23,60 % |
| Desempleo | 5,50 % |
| FOGASA | 0,20 % |
| Formación Profesional | 0,60 % |
| AT y EP (Accidentes de Trabajo) | 1,50 % |
| MEI (Mecanismo de Equidad Intergeneracional) | 0,75 % |
| **Total** | **32,15 %** |

$$B = 18.000 \times 0{,}3215 = \mathbf{5.787 \text{ €}}$$

#### Cotización SS Trabajador (D)

Es el descuento que se aplica directamente sobre el salario bruto del trabajador. Sumando los conceptos de la columna **"Trabajador"**:

| Concepto | Tipo |
|---|---|
| Contingencias Comunes | 4,70 % |
| Desempleo | 1,55 % |
| Formación Profesional | 0,10 % |
| MEI (Mecanismo de Equidad Intergeneracional) | 0,15 % |
| **Total** | **6,50 %** |

$$D = 18.000 \times 0{,}065 = \mathbf{1.170 \text{ €}}$$

### 1.2 Rendimiento del trabajo (E = C − D)

$$E = 18.000 - 1.170 = \mathbf{16.830 \text{ €}}$$

### 1.3 Deducciones sobre el rendimiento del trabajo

#### Deducción general (F) — Art. 19.2.f Ley 35/2006 del IRPF[^3]

Es una cantidad fija que reduce el rendimiento del trabajo para todos los asalariados:

$$F = \mathbf{2.000 \text{ €}}$$

[^3]: Fuente: [BOE – Ley 35/2006 del IRPF, art. 19](https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a19)

#### Reducción por rendimientos del trabajo (G) — Art. 20 Ley 35/2006 del IRPF[^4]

Para rendimientos íntegros del trabajo (RIT) entre 14.852,51 € y 17.673,52 €, la reducción se calcula según la fórmula:

$$G = 7.302 - [1{,}75 \times (RIT - 14.852{,}51)]$$

Con $RIT = 16.830$ €:

$$G = 7.302 - [1{,}75 \times (16.830 - 14.852{,}51)] = 7.302 - [1{,}75 \times 1.977{,}49] = 7.302 - 3.460{,}61 = \mathbf{3.841{,}39 \text{ €}}$$

[^4]: Fuente: [BOE – Ley 35/2006 del IRPF, art. 20](https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a20)

### 1.4 Base imponible (H = C − D − F − G)

$$H = 18.000 - 1.170 - 2.000 - 3.841{,}39 = \mathbf{10.988{,}61 \text{ €}}$$

### 1.5 Mínimo del contribuyente (I) — Art. 57 Ley 35/2006 del IRPF

Es la parte de la renta que se considera necesaria para vivir y que no tributa. Para un contribuyente sin circunstancias especiales:

$$I = \mathbf{5.550 \text{ €}}$$

### 1.6 Cuota íntegra — Primer tramo al 19 % (J)

Se aplica el tipo del 19 % sobre la diferencia entre la base imponible y el mínimo del contribuyente:

$$J = (H - I) \times 0{,}19 = (10.988{,}61 - 5.550) \times 0{,}19 = 5.438{,}61 \times 0{,}19 = \mathbf{1.033{,}34 \text{ €}}$$

### 1.7 Deducción por obtención de rendimientos del trabajo — Deducción SMI (K)

Para rendimientos íntegros del trabajo entre 16.576 € y 18.326 €, la deducción se calcula[^5]:

$$K = 340 - [0{,}20 \times (RIT - 16.576)] = 340 - [0{,}20 \times (16.830 - 16.576)] = 340 - 50{,}80 = \mathbf{289{,}20 \text{ €}}$$

[^5]: Fuente: [AEAT – Deducción por obtención de rendimientos del trabajo](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html)

### 1.8 IRPF final (L = J − K)

$$L = 1.033{,}34 - 289{,}20 = \mathbf{744{,}14 \text{ €}}$$

### 1.9 Salario neto (C − D − L)

$$\text{Salario neto} = 18.000 - 1.170 - 744{,}14 = \mathbf{16.085{,}86 \text{ €}}$$

---

## 2. Cálculo del IRPF en 2019 (salario equivalente: 14.717,91 €)

### 2.1 Cotización a la Seguridad Social

Las cotizaciones aplicables en 2019[^6]:

[^6]: Fuente: [TGSS – Bases y tipos de cotización 2019 (archivo)](https://web.archive.org/web/20190223131030/https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537)

#### Cotización SS Empresa (B)

| Concepto | Tipo |
|---|---|
| Contingencias Comunes | 23,60 % |
| Desempleo | 5,50 % |
| FOGASA | 0,20 % |
| Formación Profesional | 0,60 % |
| AT y EP (Accidentes de Trabajo) | 1,50 % |
| **Total** | **31,40 %** |

> En 2019 no existía el MEI (0,75 %), introducido posteriormente como mecanismo de sostenibilidad del sistema de pensiones.

$$B = 14.717{,}91 \times 0{,}314 = \mathbf{4.621{,}42 \text{ €}}$$

#### Cotización SS Trabajador (D)

| Concepto | Tipo |
|---|---|
| Contingencias Comunes | 4,70 % |
| Desempleo | 1,55 % |
| Formación Profesional | 0,10 % |
| **Total** | **6,35 %** |

> En 2019 tampoco existía el MEI del trabajador (0,15 %).

$$D = 14.717{,}91 \times 0{,}0635 = \mathbf{934{,}59 \text{ €}}$$

### 2.2 Rendimiento del trabajo (E = C − D)

$$E = 14.717{,}91 - 934{,}59 = \mathbf{13.783{,}32 \text{ €}}$$

### 2.3 Deducciones sobre el rendimiento del trabajo

#### Deducción general (F)

$$F = \mathbf{2.000 \text{ €}}$$

#### Reducción por rendimientos del trabajo (G) — Versión 2018 del art. 20[^7]

Para rendimientos íntegros del trabajo (RIT) entre 13.115 € y 16.825 €:

$$G = 5.565 - [1{,}5 \times (RIT - 13.115)]$$

Con $RIT = 13.783{,}32$ €:

$$G = 5.565 - [1{,}5 \times (13.783{,}32 - 13.115)] = 5.565 - [1{,}5 \times 668{,}32] = 5.565 - 1.002{,}48 = \mathbf{4.562{,}52 \text{ €}}$$

[^7]: Fuente: [BOE – Ley 26/2014, art. 20 vigente en 2019](https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268#ar-59)

### 2.4 Base imponible (H = C − D − F − G)

$$H = 14.717{,}91 - 934{,}59 - 2.000 - 4.562{,}52 = \mathbf{7.220{,}80 \text{ €}}$$

### 2.5 Mínimo del contribuyente (I)

$$I = \mathbf{5.550 \text{ €}}$$

### 2.6 Cuota íntegra — Primer tramo al 19 % (J)

$$J = (7.220{,}80 - 5.550) \times 0{,}19 = 1.670{,}80 \times 0{,}19 = \mathbf{317{,}45 \text{ €}}$$

### 2.7 Deducción SMI (K)

En 2019 **no existía** esta deducción.

### 2.8 IRPF final (L)

$$L = \mathbf{317{,}45 \text{ €}}$$

### 2.9 Salario neto (C − D − L)

$$\text{Salario neto} = 14.717{,}91 - 934{,}59 - 317{,}45 = \mathbf{13.465{,}87 \text{ €}}$$

---

## 3. Tabla comparativa

Para hacer la comparación directamente en términos monetarios de hoy, los valores de 2019 se expresan también en euros de 2026 (multiplicando por el factor de inflación 1,223). La diferencia se calcula siempre como **2026 − 2019 (en € de 2026)**.

| Concepto | 2026 | 2019 (€ de 2019) | 2019 (€ de 2026) | Diferencia | Var. % |
|---|---:|---:|---:|---:|---:|
| **Coste laboral** (C+B) | 23.787,00 € | 19.339,33 € | 23.652,00 € | +135,00 € | +0,57 % |
| Cotización SS Empresa (B) | 5.787,00 € | 4.621,42 € | 5.652,00 € | +135,00 € | +2,39 % |
| **Salario Bruto** (C) | **18.000,00 €** | **14.717,91 €** | **18.000,00 €** | **0,00 €** | **0,00 %** |
| Cotización SS Trabajador (D) | 1.170,00 € | 934,59 € | 1.143,00 € | +27,00 € | +2,36 % |
| Rendimiento del Trabajo (E) | 16.830,00 € | 13.783,32 € | 16.857,00 € | −27,00 € | −0,16 % |
| Deducción general (F) | 2.000,00 € | 2.000,00 € | 2.446,00 € | −446,00 € | −18,23 % |
| Reducción por rendimientos (G) | 3.841,39 € | 4.562,52 € | 5.579,96 € | −1.738,57 € | −31,16 % |
| **Base imponible** (H) | **10.988,61 €** | **7.220,80 €** | **8.831,04 €** | **+2.157,57 €** | **+24,43 %** |
| Mínimo del contribuyente (I) | 5.550,00 € | 5.550,00 € | 6.787,65 € | −1.237,65 € | −18,23 % |
| IRPF antes de deducción (J) | 1.033,34 € | 317,45 € | 388,24 € | +645,10 € | +166,16 % |
| Deducción SMI (K) | 289,20 € | — | — | — | — |
| **IRPF Final** (L) | **744,14 €** | **317,45 €** | **388,24 €** | **+355,90 €** | **+91,67 %** |
| **Salario Neto** (C−D−L) | **16.085,86 €** | **13.465,87 €** | **16.468,76 €** | **−382,89 €** | **−2,32 %** |

---

## 4. Conclusiones

La comparación muestra que, para un trabajador con **el mismo poder adquisitivo** en ambos años, la carga fiscal ha aumentado significativamente en 2026 respecto a 2019:

- **El IRPF final prácticamente se ha duplicado**: se pagan 355,90 € más (+91,67 %) en términos reales.
- **El salario neto es 382,89 € menor en términos reales** (−2,32 %), a pesar de que el salario bruto nominal es idéntico (18.000 €).
- **La base imponible ha crecido un 24,43 %** en términos reales, impulsada principalmente por la pérdida de valor real de las deducciones y la reducción por rendimientos del trabajo, que no se han actualizado con la inflación.
- El incremento de la cotización a la Seguridad Social por la introducción del **MEI** (0,90 puntos porcentuales en total entre empresa y trabajador) contribuye marginalmente al aumento del coste laboral (+135 €), pero el efecto principal recae en el IRPF.

En definitiva, el trabajador de 2026 con 18.000 € brutos no solo percibe menos renta disponible en términos reales que su homólogo de 2019, sino que el sistema fiscal le exige una contribución proporcionalmente mucho mayor.
