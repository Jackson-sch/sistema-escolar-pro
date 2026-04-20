// Stubbed for Next.js SSR Compatibility: 
// createContext and useContext are not allowed in Server Components / Route Handlers.
// For server-side PDF generation, we return the default theme statically.

import { theme as defaultTheme } from './pdfx-theme';

export type PdfxTheme = typeof defaultTheme;

// We export a dummy provider so components don't break if they use it.
export interface PdfxThemeProviderProps {
  theme?: PdfxTheme;
  children: any;
}

export function PdfxThemeProvider({ children }: PdfxThemeProviderProps) {
  return children;
}

/**
 * Returns the active theme. Statically returns defaultTheme for SSR compatibility.
 */
export function usePdfxTheme(): PdfxTheme {
  return defaultTheme;
}

/**
 * Calls factory() and returns the result.
 */
export function useSafeMemo<T>(factory: () => T, _deps: any): T {
  return factory();
}
