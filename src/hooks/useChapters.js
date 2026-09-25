import { useEffect, useState } from 'react';

/**
 * Document navigation, not product navigation: observes the chapter sections
 * and reports which one is being read plus overall reading progress.
 */
export function useChapters(ids, version = 0) {
  const [active, setActive] = useState(ids[0]);
  const [progress, setProgress] = useState(0);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const sections = ids
      .map(id => document.getElementById(id))
      .filter(Boolean);

    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01, 0.2] }
    );
    sections.forEach(s => io.observe(s));

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
      setPast(h.scrollTop > window.innerHeight * 0.72);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // `version` cambia cuando un capítulo diferido se monta y su nodo se
    // sustituye: hay que volver a observar los nodos nuevos.
  }, [ids, version]);

  return { active, progress, past };
}

/**
 * Which step of a sticky scrollytelling sequence is current. Reports an index
 * into `count`; the figure transforms, the captions do not become cards.
 */
export function useSteps(refs, count) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean);
    if (!nodes.length) return undefined;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const i = nodes.indexOf(e.target);
            if (i >= 0) setStep(i);
          }
        });
      },
      // En móvil la figura se clava en la mitad de arriba y los pasos se leen
      // en la de abajo: la línea que decide el paso activo baja con ellos.
      {
        rootMargin: window.matchMedia('(max-width: 999px)').matches
          ? '-72% 0px -24% 0px'
          : '-48% 0px -48% 0px',
        threshold: 0,
      }
    );
    nodes.forEach(n => io.observe(n));
    return () => io.disconnect();
  }, [refs, count]);

  return step;
}
