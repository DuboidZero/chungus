/**
 * useReveal — reveal an element as it scrolls into view.
 *
 * Attach the returned ref to an element carrying the `.reveal` class; toggle
 * `.is-visible` from `visible`. Falls back to immediately visible when
 * IntersectionObserver is unavailable (SSR / very old browsers).
 */
import { useEffect, useRef, useState } from 'react';

interface RevealOptions {
  /** Fraction of the element that must be visible to trigger. */
  threshold?: number;
  /** Reveal only once (default) or re-hide when it leaves the viewport. */
  once?: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: RevealOptions) {
  const { threshold = 0.12, once = true } = options ?? {};
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, visible };
}
