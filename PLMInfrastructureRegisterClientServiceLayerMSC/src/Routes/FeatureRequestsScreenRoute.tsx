import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import FeatureRequestsScreenController from '../Features/FeatureRequests/FeatureRequestsScreenController';
import ApplicationRouteCON from '../Constants/ApplicationRouteCON';
import { useFrontendDesignSchema, useIsFrontendDesignSchemaResolved } from '../Utilities/FrontendDesignSchemaUtility';

// The route itself stays registered in ApplicationRouter.tsx's route tree
// either way (TanStack Router builds that tree once, at module scope) -
// reachability is enforced here instead: a direct visit under the
// 'AtlasCopco' schema redirects away rather than rendering the screen
// controller, per specs/012-ui-polish-cleanup research.md §4.
//
// Gated on useIsFrontendDesignSchemaResolved() rather than acting on
// useFrontendDesignSchema()'s own optimistic 'AtlasCopco' default - a
// redirect fired on that guess, before the real value is known, would send a
// genuine WePLM visitor away with no later render able to undo it once the
// URL has already changed. Rendering the real page for a brief instant while
// still loading (even in the common AtlasCopco case) is the safer tradeoff.
export default function FeatureRequestsScreenRoute(): React.JSX.Element | null {
  const navigate = useNavigate();
  const frontendDesignSchema = useFrontendDesignSchema();
  const isResolved = useIsFrontendDesignSchemaResolved();
  const shouldRedirectAway = isResolved && frontendDesignSchema === 'AtlasCopco';

  useEffect(() => {
    if (shouldRedirectAway) {
      navigate({ to: ApplicationRouteCON.ROOT, replace: true });
    }
  }, [shouldRedirectAway, navigate]);

  if (shouldRedirectAway) return null;

  return <FeatureRequestsScreenController />;
}
