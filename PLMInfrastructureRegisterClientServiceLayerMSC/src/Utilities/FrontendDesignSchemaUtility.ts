import TanstackQueryClientService from '../Services/TanstackQueryClientService';

export type FrontendDesignSchemaType = 'WePLM' | 'AtlasCopco';

// Backend-held, app-wide setting read from ConfigurationConstants'
// "FrontendDesignSchema" field (see specs/012-ui-polish-cleanup) - a pure
// backend/database value with no in-app control to change it. Recognized
// values are exactly "WEPLM" and "ATLASCOPCO" (case-insensitive); anything
// else, an empty list, or a still-loading/missing result all resolve to the
// same default, 'AtlasCopco'.
export default class FrontendDesignSchemaUtility {
  public static current: FrontendDesignSchemaUtility = new FrontendDesignSchemaUtility();

  public resolve(rawValues: string[] | undefined): FrontendDesignSchemaType {
    return rawValues?.[0]?.toUpperCase() === 'WEPLM' ? 'WePLM' : 'AtlasCopco';
  }
}

// Every surface that branches on the design schema (the bootstrap CSS-class
// toggle, the Infrastructure Register AI button, the navigation item, the
// Feature Request route) should use this instead of reading the raw query
// directly, so the default-to-AtlasCopco fallback only lives in one place.
export function useFrontendDesignSchema(): FrontendDesignSchemaType {
  const { data } = TanstackQueryClientService.current.configurationConstants.useOptionsQuery('FrontendDesignSchema');
  return FrontendDesignSchemaUtility.current.resolve(data);
}

// For callers about to take an action that can't be un-done by a later
// render (e.g. navigating away) - true once the real backend value is known,
// false while useFrontendDesignSchema() above is still returning its
// optimistic 'AtlasCopco' guess. A cosmetic flash while this is false is fine
// for callers that only ever re-render (the CSS class, the AI button, the
// nav item); a navigation decided on the guess instead of the real value is
// not, since there's no later render to undo it once the URL has changed.
export function useIsFrontendDesignSchemaResolved(): boolean {
  const { data } = TanstackQueryClientService.current.configurationConstants.useOptionsQuery('FrontendDesignSchema');
  return data !== undefined;
}
