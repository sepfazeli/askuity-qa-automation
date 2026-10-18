// The store's layout breakpoints.
export const BREAKPOINTS = { sm: 640, lg: 1024, xl: 1280 };

export function expectedGridColumns(viewportWidth: number): number {
  if (viewportWidth >= BREAKPOINTS.xl) return 4;
  if (viewportWidth >= BREAKPOINTS.lg) return 3;
  return 2;
}

// Below 640px the header hides the username and "Logout" text.
export const isCompactHeader = (viewportWidth: number): boolean => viewportWidth < BREAKPOINTS.sm;
