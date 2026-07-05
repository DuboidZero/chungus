/**
 * Reveal — fades + lifts its children into view on scroll.
 *
 * A thin wrapper over {@link useReveal} + the `.reveal` CSS transition. Use to
 * stage sections of long pages so content arrives as the reader reaches it.
 * Honors prefers-reduced-motion (content stays visible, no transform).
 */
import type { ReactNode } from 'react';
import { useReveal } from '../lib/useReveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger successive sections by passing an increasing delay (ms). */
  delay?: number;
}

export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
