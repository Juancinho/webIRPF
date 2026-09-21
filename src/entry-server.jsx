import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';

/**
 * El informe, escrito en HTML antes de llegar al navegador.
 *
 * Sin esto, lo que se sirve es un documento vacío y todo el texto —las
 * treinta figuras, sus títulos, sus notas y sus fuentes— sólo existe después
 * de que el navegador ejecute JavaScript. Un buscador puede ejecutarlo, pero
 * lo hace tarde, a veces no lo hace, y ningún otro rastreador lo hace.
 *
 * El HTML que sale de aquí es exactamente el estado inicial que ve quien
 * llega sin parámetros en la URL, así que no hay nada que un lector pueda ver
 * y un rastreador no.
 */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
