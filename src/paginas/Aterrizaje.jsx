import { Fragment } from 'react';
import { ANIO, DESTACADOS } from './contenido.js';

/** `**negrita**` → <strong>. Es la única marca que usan los textos. */
function Rico({ children }) {
  const partes = String(children).split(/\*\*(.+?)\*\*/g);
  return partes.map((t, i) => (i % 2 ? <strong key={i}>{t}</strong> : <Fragment key={i}>{t}</Fragment>));
}

function Celda({ valor, cabecera, primera }) {
  const contenido =
    valor && typeof valor === 'object'
      ? valor.ruta
        ? <a href={valor.ruta}>{valor.texto}</a>
        : valor.texto
      : valor;
  return primera
    ? <th scope="row">{contenido}</th>
    : <td data-label={cabecera}>{contenido}</td>;
}

/**
 * LA RESPUESTA — cabeza de las páginas de entrada.
 *
 * Contesta primero a lo que se buscó, con la cifra, y después deja paso al
 * informe completo, que empieza justo debajo con el mismo caso cargado. No
 * sustituye a ninguna figura: es la página de un periódico que resume la
 * noticia antes del reportaje.
 */
export default function Aterrizaje({ pagina }) {
  const { miga, sello, h1, entradilla, cifras, secciones, preguntas, vecinos, enlaces, informe, fuente, tipo } = pagina;

  return (
    <section id="respuesta" className="fs-lp" aria-labelledby="respuesta-t">
      <div className="fs-page">
        <header className="fs-lp-cabecera">
          <a className="fs-lp-marca" href="/">FiscalScope</a>
          <nav aria-label="Ruta de navegación" className="fs-lp-miga">
            <ol>
              {miga.map((m, i) => (
                <li key={m.ruta}>
                  {i === miga.length - 1 ? <span aria-current="page">{m.nombre}</span> : <a href={m.ruta}>{m.nombre}</a>}
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <div className="fs-lp-cuerpo">
          <p className="fs-stamp">{sello}</p>
          <h1 id="respuesta-t" className="fs-lp-h1">{h1}</h1>
          <p className="fs-lp-entradilla"><Rico>{entradilla}</Rico></p>

          <dl className="fs-lp-cifras">
            {cifras.map(c => (
              <div key={c.k} className={c.destacada ? 'is-destacada' : undefined}>
                <dt>{c.k}</dt>
                <dd>
                  <span className="fs-lp-v">{c.v}</span>
                  {c.nota && <span className="fs-lp-nota">{c.nota}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <p className="fs-lp-ir">
            <a href={informe.ancla}>{informe.texto} ↓</a>
          </p>

          {secciones.map(s => (
            <div key={s.titulo} className="fs-lp-seccion">
              <h2>{s.titulo}</h2>
              {s.parrafos.map((t, i) => (
                <p key={i}><Rico>{t}</Rico></p>
              ))}
              {s.tabla && (
                <div className="fs-table-scroll">
                  <table className="fs-table is-apilable">
                    <thead>
                      <tr>
                        {s.tabla.cabeceras.map(c => <th key={c} scope="col">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {s.tabla.filas.map((f, i) => (
                        <tr key={i}>
                          {f.map((v, j) => (
                            <Celda key={j} valor={v} cabecera={s.tabla.cabeceras[j]} primera={j === 0} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {s.tabla.nota && <p className="fs-note fs-lp-tabla-nota">{s.tabla.nota}</p>}
                </div>
              )}
            </div>
          ))}

          {preguntas.length > 0 && (
            <div className="fs-lp-seccion fs-lp-preguntas">
              <h2>Preguntas frecuentes</h2>
              {preguntas.map(q => (
                <div key={q.p}>
                  <h3>{q.p}</h3>
                  <p>{q.r}</p>
                </div>
              ))}
            </div>
          )}

          {vecinos && (vecinos.anterior || vecinos.siguiente) && (
            <nav className="fs-lp-vecinos" aria-label="Sueldos cercanos">
              {vecinos.anterior ? <a href={vecinos.anterior.ruta} rel="prev">← {vecinos.anterior.texto}</a> : <span />}
              <a href="/sueldo-neto/">Todos los sueldos</a>
              {vecinos.siguiente ? <a href={vecinos.siguiente.ruta} rel="next">{vecinos.siguiente.texto} →</a> : <span />}
            </nav>
          )}

          <nav className="fs-lp-enlaces" aria-label="Páginas relacionadas">
            <p className="fs-stamp">También en FiscalScope</p>
            <ul>
              {enlaces.map(e => (
                <li key={e.ruta}><a href={e.ruta}>{e.texto}</a></li>
              ))}
            </ul>
            {tipo === 'tema' && (
              <>
                <p className="fs-stamp">Sueldo neto en {ANIO}</p>
                <ul className="fs-lp-sueldos">
                  {DESTACADOS.map(e => (
                    <li key={e.ruta}><a href={e.ruta}>{e.texto}</a></li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          <p className="fs-note fs-lp-aviso">
            Cálculo orientativo con los parámetros oficiales de 2026 (BOE, TGSS, AEAT): retención
            estimada para un asalariado sin otras rentas. La declaración de la renta puede
            regularizarla. No es asesoramiento fiscal.
            {fuente && (
              <>
                {' '}Fuente de los datos:{' '}
                <a href={fuente.url} target="_blank" rel="noreferrer noopener">{fuente.texto}</a>.
              </>
            )}
          </p>
        </div>

        <p className="fs-lp-sigue" aria-hidden="true">El informe completo, con este caso</p>
      </div>
    </section>
  );
}
