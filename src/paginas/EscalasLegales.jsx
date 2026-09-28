import { useState } from 'react';
import { ESCALA_ESTATAL, ESCALAS_AUTONOMICAS_2026 } from '../engine/escalasLegales';
import { useFiscal } from '../state/fiscalContext';
import { eur, pct } from '../utils/format';

function Tabla({ titulo, tramos }) {
  return (
    <div className="fs-table-scroll">
      <table className="fs-table is-apilable">
        <caption>{titulo}</caption>
        <thead><tr><th scope="col">Parte de la base liquidable general</th><th scope="col">Tipo de este tramo</th></tr></thead>
        <tbody>
          {tramos.map(([limite, tipo], i) => {
            const desde = i ? tramos[i - 1][0] : 0;
            const decimales = desde % 1 || limite % 1 ? 2 : 0;
            return (
              <tr key={desde}>
                <th scope="row">{eur(desde, decimales)} a {Number.isFinite(limite) ? eur(limite, decimales) : 'sin límite'}</th>
                <td data-label="Tipo de este tramo">{pct(tipo * 100, 2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EscalasLegales() {
  const { opts } = useFiscal();
  const [seleccion, setSeleccion] = useState(null);
  const clave = seleccion || (ESCALAS_AUTONOMICAS_2026[opts.ccaa] ? opts.ccaa : 'madrid');
  const autonomia = ESCALAS_AUTONOMICAS_2026[clave];

  return (
    <div className="fs-lp-seccion">
      <h2>Retención en nómina y cuota anual: no son la misma tabla</h2>
      <p><strong>En la nómina</strong>, la empresa descuenta una retención a cuenta del IRPF. El <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a101" target="_blank" rel="noreferrer noopener">art. 101 de la Ley del IRPF</a> incluye una escala del 19 % al 47 % para calcular el tipo de retención. Esa retención es un anticipo, no la cantidad definitiva que corresponde pagar por el año.</p>
      <p><strong>En la declaración anual</strong>, se calcula la cuota con la escala estatal y la de la comunidad autónoma, además de los mínimos, otras rentas y las deducciones que correspondan. Las retenciones ya practicadas se descuentan de esa cuota: según el resultado, puede quedar un importe a ingresar o a devolver. Las dos escalas de la renta general se muestran debajo por separado porque sus tramos no siempre coinciden.</p>
      <p className="fs-note">Fuentes: <a href="https://sede.agenciatributaria.gob.es/Sede/irpf/retenciones-ingresos-cuenta-pagos-fraccionados/retenciones-ingresos-cuenta.html" target="_blank" rel="noreferrer noopener">AEAT, qué son las retenciones</a>; <a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/cuota-diferencial.html" target="_blank" rel="noreferrer noopener">AEAT, cuota diferencial</a>.</p>
      <Tabla titulo="Declaración anual · escala estatal · 2026" tramos={ESCALA_ESTATAL} />
      <p className="fs-note">Fuente legal: <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a63" target="_blank" rel="noreferrer noopener">Ley 35/2006 del IRPF, art. 63</a>.</p>
      <label className="fs-label" htmlFor="escala-autonomica">Escala autonómica que quieres consultar</label>
      <select id="escala-autonomica" className="fs-select" value={clave} onChange={e => setSeleccion(e.target.value)}>
        {Object.entries(ESCALAS_AUTONOMICAS_2026).map(([id, region]) => <option key={id} value={id}>{region.nombre}</option>)}
      </select>
      <p className="fs-note">Este selector solo cambia la tabla que lees. El perfil de la calculadora se cambia en «Perfil».</p>
      <Tabla titulo={`Declaración anual · escala autonómica de ${autonomia.nombre} · 2026`} tramos={autonomia.tramos} />
      <p className="fs-note">Fuente legal: <a href={autonomia.fuente} target="_blank" rel="noreferrer noopener">{autonomia.norma}</a> (texto consolidado). Si tu perfil indica «Estándar / Resto CCAA» o un territorio foral, Madrid aparece aquí solo como ejemplo: no es la escala de tu territorio. Las comunidades no incluidas en este selector también tienen su propia escala.</p>
      <p className="fs-note">FiscalScope todavía no calcula por separado la retención oficial exacta y la cuota anual definitiva. En el perfil estándar toma los tipos del art. 101 como referencia para un cálculo orientativo del descuento de IRPF y del neto; en los perfiles autonómicos usa otras escalas combinadas aproximadas. La cifra resultante no debe leerse como el impuesto final de la declaración ni como la retención exacta que aplicará una empresa.</p>
    </div>
  );
}
