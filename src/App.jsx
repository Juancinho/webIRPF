import { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { FiscalProvider } from './state/FiscalState';
import { useFiscal } from './state/fiscalContext';
import { useChapters } from './hooks/useChapters';
import { CAPITULO_IDS } from './shell/chapters';
import RunningHeader from './shell/RunningHeader';
import ChapterRail from './shell/ChapterRail';
import Indice from './shell/Indice';
import Cinta from './shell/Cinta';
import Colofon from './shell/Colofon';
import Portada from './chapters/Portada';
import Prologo from './chapters/Prologo';
import Aterrizaje from './paginas/Aterrizaje';
import Diferido from './shell/Diferido';

/* Los capítulos que no están en la primera pantalla se cargan aparte: el
   navegador sólo descarga y compila su código cuando el capítulo se acerca a
   la vista (ver `shell/montajeDiferido.js`). Hasta entonces se ve su HTML
   prerenderizado. */
const Nomina = lazy(() => import('./chapters/Nomina'));
const Viaje = lazy(() => import('./chapters/Viaje'));
const Irpf = lazy(() => import('./chapters/Irpf'));
const Historia = lazy(() => import('./chapters/Historia'));
const Cuna = lazy(() => import('./chapters/Cuna'));
const Lugar = lazy(() => import('./chapters/Lugar'));
const Destino = lazy(() => import('./chapters/Destino'));
const Deuda = lazy(() => import('./chapters/Deuda'));
const Cierre = lazy(() => import('./chapters/Cierre'));
const Apendice = lazy(() => import('./chapters/Apendice'));
import { activarTodo, useVersionDiferido } from './shell/montajeDiferido';
import './styles/paper.css';
import './styles/figures.css';
import './styles/shell.css';
import './styles/mobile.css';
import './styles/paginas.css';

/**
 * `pagina` sólo existe en las páginas de entrada (`src/paginas`): la portada
 * se sirve sin ella y se pinta exactamente igual que siempre. En una página
 * de entrada, el informe arranca con su caso —su sueldo— y va precedido de la
 * respuesta.
 */
export default function App({ pagina = null }) {
  return (
    <FiscalProvider inicial={pagina?.estado}>
      <Publicacion pagina={pagina} />
    </FiscalProvider>
  );
}

function Publicacion({ pagina }) {
  const { bruto, anio, pagas, opts, getShareURL } = useFiscal();
  const montados = useVersionDiferido();
  const { active, progress, past } = useChapters(CAPITULO_IDS, montados);

  /* En cuanto el lector cambia su caso, todo el informe tiene que estar vivo:
     el HTML prerenderizado muestra el caso de partida. */
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    activarTodo();
  }, [bruto, anio, pagas, opts]);

  /* Un salto a un ancla —índice, enlaces entre capítulos— lleva a su
     destino ya montado. */
  useEffect(() => {
    const alPulsar = e => {
      if (e.target.closest?.('a[href^="#"]')) activarTodo();
    };
    document.addEventListener('click', alPulsar, true);
    return () => document.removeEventListener('click', alPulsar, true);
  }, []);
  const [indiceOpen, setIndiceOpen] = useState(false);
  const [shareState, setShareState] = useState('idle');

  const onShare = useCallback(async () => {
    const url = getShareURL();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'FiscalScope', url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2200);
      }
    } catch {
      // Compartir puede cancelarse o no estar permitido; no bloquea la lectura.
    }
  }, [getShareURL]);

  const enApendice = active === 'apendice';

  return (
    <>
      <a className="fs-skip" href={pagina ? '#respuesta' : '#nomina'}>
        Saltar a la publicación
      </a>

      <RunningHeader
        active={active}
        progress={progress}
        visible={past}
        anio={anio}
        onIndice={() => setIndiceOpen(true)}
        onShare={onShare}
        shareState={shareState}
      />

      <ChapterRail active={active} visible={past} />

      {indiceOpen && <Indice onClose={() => setIndiceOpen(false)} />}

      <main>
        {pagina && <Aterrizaje pagina={pagina} />}
        <Portada secundaria={!!pagina} />
        <Prologo />
        <Diferido id="nomina"><Nomina /></Diferido>
        <Diferido id="viaje"><Viaje /></Diferido>
        <Diferido id="irpf"><Irpf /></Diferido>
        <Diferido id="historia"><Historia /></Diferido>
        <Diferido id="cuna"><Cuna /></Diferido>
        <Diferido id="lugar"><Lugar /></Diferido>
        <Diferido id="destino"><Destino /></Diferido>
        <Diferido id="deuda"><Deuda /></Diferido>
        <Diferido id="cierre"><Cierre /></Diferido>
        <Diferido id="apendice"><Apendice /></Diferido>
      </main>

      <Colofon />

      <Cinta visible={past && !enApendice} />
    </>
  );
}
