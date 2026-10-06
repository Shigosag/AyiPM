import type { ThemeMode } from '@/types';
import { THEME_STORAGE_KEY } from '@/constants/defaults';

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'device') return mode;
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolveTheme(mode));
}

// Runs before hydration so the saved theme paints on the first frame.
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}');var d=m==='dark'||(m==='device'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;
