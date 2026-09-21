import { CAPITULOS } from './chapters';

/** Margin navigation: chapter numerals with a petrol marker on the current one. */
export default function ChapterRail({ active, visible }) {
  return (
    <nav className={`fs-rail-nav ${visible ? 'is-on' : ''}`} aria-label="Capítulos">
      {CAPITULOS.map(c => (
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
