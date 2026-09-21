/**
 * Un umbral editorial entre la portada y el primer capítulo. No añade otra
 * etapa al índice: explica qué cambia de naturaleza a medida que avanza el
 * informe para que una simulación individual no se confunda con una
 * estadística observada o con una comparación agregada.
 */
export default function Prologo() {
  return (
    <section id="prologo" className="fs-prologo" aria-labelledby="prologo-t">
      <div className="fs-page">
        <div className="fs-prologo-grid">
          <header>
            <span className="fs-stamp">Nota de lectura</span>
            <h2 id="prologo-t" className="fs-title-sm">
              Un recorrido en tres escalas
            </h2>
          </header>

          <div className="fs-prologo-intro">
            <p className="fs-body">
              FiscalScope reconstruye una <strong>nómina anual estimada</strong> a partir del salario,
              el ejercicio y el perfil seleccionados. El cálculo aplica los parámetros fiscales y de
              cotización documentados en el apéndice; no reproduce una declaración concreta ni
              incorpora todas las circunstancias que puede contemplar el IRPF.
            </p>
            <p className="fs-body">
              La lectura cambia de escala de forma deliberada. Primero se explica el caso individual;
              después se compara ese mismo supuesto entre años y con referencias homogéneas; por
              último se pasa a estadísticas agregadas sobre salarios, gasto y deuda. Las cifras de
              una escala no deben interpretarse como si pertenecieran a otra.
            </p>
          </div>

          <ol className="fs-prologo-ruta">
            <li>
              <span>01—03</span>
              <strong>Cálculo personal</strong>
              <p>Nómina, coste laboral e IRPF para el perfil elegido.</p>
            </li>
            <li>
              <span>04—06</span>
              <strong>Comparación</strong>
              <p>Tiempo, OCDE y distribución salarial, con supuestos comunes y unidades declaradas.</p>
            </li>
            <li>
              <span>07—08</span>
              <strong>Contexto agregado</strong>
              <p>Gasto por funciones y deuda pública; no son una cuenta individual del contribuyente.</p>
            </li>
          </ol>

          <p className="fs-source fs-prologo-fuentes">
            Referencias principales ·{' '}
            <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noreferrer noopener">BOE · LIRPF</a>
            {' · '}
            <a href="https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537" target="_blank" rel="noreferrer noopener">TGSS · cotización</a>
            {' · '}
            <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=28191" target="_blank" rel="noreferrer noopener">INE · salarios</a>
            {' · '}
            <a href="https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/paginas/iacogof.aspx" target="_blank" rel="noreferrer noopener">IGAE · COFOG</a>
            {' · '}
            <a href="https://datos.bde.es/datos/es/datasets/000/033.html" target="_blank" rel="noreferrer noopener">Banco de España · deuda PDE</a>
          </p>
        </div>
      </div>
    </section>
  );
}
