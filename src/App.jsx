import { useCallback, useState } from 'react';
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
import Nomina from './chapters/Nomina';
import Viaje from './chapters/Viaje';
import Irpf from './chapters/Irpf';
import Historia from './chapters/Historia';
import Cuna from './chapters/Cuna';
import Lugar from './chapters/Lugar';
import Apendice from './chapters/Apendice';
import './styles/paper.css';
import './styles/figures.css';
import './styles/shell.css';

export default function App() {
  return (
    <FiscalProvider>
      <Publicacion />
    </FiscalProvider>
  );
}

function Publicacion() {
  const { anio, getShareURL } = useFiscal();
  const { active, progress, past } = useChapters(CAPITULO_IDS);
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
      <a className="fs-skip" href="#nomina">
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
        <Portada />
        <Nomina />
        <Viaje />
        <Irpf />
        <Historia />
        <Cuna />
        <Lugar />
        <Apendice />
      </main>

      <Colofon />

      <Cinta visible={past && !enApendice} />
    </>
  );
}
