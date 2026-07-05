/**
 * SuccessCheck — an animated checkmark for completion / success moments.
 *
 * The ring draws itself, then the tick strokes in, using the shared `checkDraw`
 * keyframe. Purely decorative; mark `aria-hidden` and pair with a text label.
 */
import type { CSSProperties } from 'react';

interface SuccessCheckProps {
  size?: number;
  className?: string;
}

export function SuccessCheck({ size = 22, className = '' }: SuccessCheckProps) {
  const ring: CSSProperties = {
    '--check-len': '63',
    animation: 'checkDraw 0.5s var(--ease-out-quart) both',
  } as CSSProperties;

  const tick: CSSProperties = {
    '--check-len': '16',
    animation: 'checkDraw 0.3s var(--ease-out-quart) 0.4s both',
  } as CSSProperties;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="63"
        style={ring}
      />
      <path
        d="M7 12.5l3.2 3.2L17 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="16"
        style={tick}
      />
    </svg>
  );
}
