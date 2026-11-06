import { useEffect } from "react";
import { claimPurchaseToTrack } from "../../utils/wooClient";
import { trackPurchase } from "../../utils/analytics";
import { CONSENT_CHANGE_EVENT, hasAnalyticsConsent } from "../../utils/cookieConsent";
import { insideTinaEditor } from "../../utils/reveal";

export function useTrackPurchase(orderKey: string | null): void {
  useEffect(() => {
    if (!orderKey || insideTinaEditor()) return;

    let claimed = false;
    // Sin consentimiento no se reclama: el servidor entrega la compra una sola vez y se perdería.
    const claimOnceWithConsent = () => {
      if (claimed || !hasAnalyticsConsent()) return;
      claimed = true;
      claimPurchaseToTrack(orderKey).then((purchase) => purchase && trackPurchase(purchase));
    };

    claimOnceWithConsent();
    window.addEventListener(CONSENT_CHANGE_EVENT, claimOnceWithConsent);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, claimOnceWithConsent);
  }, [orderKey]);
}
