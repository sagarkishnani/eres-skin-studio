import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, readConsent } from "../../utils/cookieConsent";

export function useConsentAnswered(): boolean {
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setAnswered(readConsent() !== null);
    const onConsentChange = () => setAnswered(true);
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
  }, []);

  return answered;
}
