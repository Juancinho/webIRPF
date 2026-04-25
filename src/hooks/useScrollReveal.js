import { useRef, useState, useEffect } from 'react';

/**
 * Hook that detects when an element enters the viewport (once).
 * Returns [ref, isVisible]. Attach ref to the element you want to observe.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px 0px -60px 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, isVisible];
}
