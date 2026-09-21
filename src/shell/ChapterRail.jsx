import { CAPITULOS } from './chapters';

/** Margin navigation: chapter numerals with a petrol marker on the current one. */
export default function ChapterRail({ active, visible }) {
  // el raíl vive fuera de los capítulos: sobre el capítulo invertido tiene que
  // invertirse él también o desaparece contra el fondo
  const noche = CAPITULOS.some(c => c.id === active && c.noche);
  return (
    <nav
      className={`fs-rail-nav ${visible ? 'is-on' : ''} ${noche ? 'is-night' : ''}`.trim()}
      aria-label="Capítulos"
    >
      {CAPITULOS.filter(c => !c.fueraDelRail).map(c => (
        <a
          key={c.id}
          href={`#${c.id}`}
          className={active === c.id ? 'is-on' : ''}
          aria-current={active === c.id ? 'true' : undefined}
        >
          {c.n}
          <span className="fs-rail-label">{c.titulo}</span>
        </a>
      ))}
    </nav>
  );
}
