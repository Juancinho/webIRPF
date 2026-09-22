import Fuente from '../figures/Fuente';

/** The publication ends like a paper, not like a website footer (DESIGN.md §57). */
export default function Colofon() {
  return (
    <footer className="fs-colofon">
      <div className="fs-page">
        <div className="fs-colofon-grid">
          <div>
            <span className="fs-masthead-name">FiscalScope</span>
            <p className="fs-note" style={{ marginTop: 8 }}>
              Informe fiscal interactivo.<br />
              Herramienta independiente, sin afiliación política.
            </p>
          </div>
          <div>
            <span className="fs-stamp">Datos</span>
            <p className="fs-note" style={{ marginTop: 6 }}>
              <Fuente>BOE · AEAT · TGSS · INE<br />OCDE · Banco de España</Fuente>
            </p>
          </div>
          <div>
            <span className="fs-stamp">Periodo</span>
            <p className="fs-note" style={{ marginTop: 6 }}>
              2012—2026<br />
              Euros constantes de 2026 salvo indicación
            </p>
          </div>
          <div>
            <span className="fs-stamp">Método</span>
            <p className="fs-note" style={{ marginTop: 6 }}>
              <Fuente>Cálculo propio sobre parámetros oficiales.</Fuente><br />
              Estimación orientativa, no asesoramiento fiscal.
            </p>
          </div>
        </div>

        <p className="fs-colofon-end">Fin del informe</p>
      </div>
    </footer>
  );
}
