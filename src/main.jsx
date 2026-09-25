import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { paginaDeRuta } from './paginas/contenido.js'
import { capturarPrerender } from './shell/montajeDiferido'
import { CAPITULO_IDS } from './shell/chapters'

// Antes de que React sustituya el HTML prerenderizado, se guarda el de cada
// capítulo para poder mostrarlo tal cual hasta que haga falta montarlo.
capturarPrerender(CAPITULO_IDS.filter(id => !['portada', 'prologo'].includes(id)))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App pagina={paginaDeRuta(window.location.pathname)} />
  </StrictMode>,
)
