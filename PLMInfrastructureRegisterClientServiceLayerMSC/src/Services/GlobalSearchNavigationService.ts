import { useEffect, useRef, useState } from 'react';

export type GlobalSearchEntityType = 'resource' | 'environmentOverview';

// Hands off "the user clicked this result" from GlobalSearchModalSharedComponent
// (mounted once in RootLayout, outside either page's own component tree) to
// whichever ScreenController owns that row - a plain in-memory singleton
// rather than sessionStorage, since this never needs to survive a hard
// reload, only a same-session client-side route change.
//
// Two delivery paths, both landing on the same pending-target slot:
// - Same page already mounted: NAVIGATE_EVENT fires immediately and its
//   listener (already registered) picks the target straight up.
// - Different page, not mounted yet: the event fires into a vacuum (nothing
//   is listening), but the target itself is still sitting in
//   `pendingTarget` - the destination page's own mount-time effect checks
//   for it directly, no event needed.
class GlobalSearchNavigationServiceClass {
  public static readonly NAVIGATE_EVENT = 'global-search-navigate-to-row';

  private pendingTarget: { entityType: GlobalSearchEntityType; id: string } | null = null;

  public requestNavigation(entityType: GlobalSearchEntityType, id: string): void {
    this.pendingTarget = { entityType, id };
    window.dispatchEvent(new CustomEvent(GlobalSearchNavigationServiceClass.NAVIGATE_EVENT));
  }

  public consumePendingTarget(entityType: GlobalSearchEntityType): string | null {
    if (this.pendingTarget?.entityType === entityType) {
      const id = this.pendingTarget.id;
      this.pendingTarget = null;
      return id;
    }
    return null;
  }
}

const GlobalSearchNavigationService = new GlobalSearchNavigationServiceClass();
export default GlobalSearchNavigationService;

const HIGHLIGHT_FLASH_DURATION_MS = 1800;

// One reusable hook for both ScreenControllers: consumes a pending target
// meant for `entityType`, calls `onClearFilters` so whatever's currently
// hiding the row (an active search query, Resources' own environment
// filter) gets reset, then waits for that row to actually show up in
// `items` before scrolling its `[data-row-id]` element into view and
// returning its id as `highlightedId` for a few seconds so the caller can
// flash it.
export function useGlobalSearchRowJump<T>(
  entityType: GlobalSearchEntityType,
  items: T[],
  getId: (item: T) => string,
  onClearFilters: () => void
): { highlightedId: string | null } {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const pendingIdRef = useRef<string | null>(null);

  useEffect(() => {
    const tryConsume = (): void => {
      const id = GlobalSearchNavigationService.consumePendingTarget(entityType);
      if (id) {
        pendingIdRef.current = id;
        onClearFilters();
      }
    };

    tryConsume();
    window.addEventListener(GlobalSearchNavigationServiceClass.NAVIGATE_EVENT, tryConsume);
    return () => window.removeEventListener(GlobalSearchNavigationServiceClass.NAVIGATE_EVENT, tryConsume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType]);

  useEffect(() => {
    const id = pendingIdRef.current;
    if (!id) return;
    if (!items.some((item) => getId(item) === id)) return; // not visible in the list yet - filters may still be clearing
    pendingIdRef.current = null;

    requestAnimationFrame(() => {
      const rowElement = document.querySelector(`[data-row-id="${id}"]`);
      rowElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), HIGHLIGHT_FLASH_DURATION_MS);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return { highlightedId };
}
