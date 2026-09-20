import { useRef, useState, useEffect } from 'react';

/**
 * Hook that detects when an element enters the viewport (once).
 * Returns [ref, isVisible]. Attach ref to the element you want to observe.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const threshold = options.threshold ?? 0.12;
  const rootMargin = options.rootMargin ?? '0px 0px -60px 0px';

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
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, threshold]);

  return [ref, isVisible];
}
