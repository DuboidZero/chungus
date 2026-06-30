import { useEffect, useRef } from 'react';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useInactivityTimeout(onTimeout: () => void, isActive: boolean) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const resetTimeout = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(onTimeout, TIMEOUT_MS);
    };

    resetTimeout();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => document.addEventListener(event, handleActivity));

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [isActive, onTimeout]);
}
