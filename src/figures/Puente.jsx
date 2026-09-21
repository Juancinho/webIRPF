/**
 * EL PUENTE ENTRE DOS FIGURAS.
 *
 * Una publicación con veinticuatro figuras y catorce párrafos no es una
 * publicación: es un álbum de gráficos. El puente es el tejido que faltaba —
 * dos o tres frases que cierran lo que acabas de ver y plantean la pregunta
 * que abre lo siguiente, siempre en la columna de lectura y con una regla
 * encima para que se lea como una pausa, no como un pie de figura.
 */
export default function Puente({ children, rotulo }) {
  return (
    <div className="fs-puente">
      {rotulo && <span className="fs-puente-r">{rotulo}</span>}
      <p className="fs-puente-t">{children}</p>
    </div>
  );
}
