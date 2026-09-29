import { useMemo, useRef, useState } from "react";
import { useTina } from "tinacms/dist/react";
import type { PromoPopupQuery, PromoPopupQueryVariables } from "../../../tina/__generated__/types";
import {
  isCampaignSnoozed,
  isPathExcluded,
  pickActiveCampaign,
  readHistory,
  recordConvert,
  recordDismiss,
} from "../../utils/promoPopup";
import PromoPopupPanel, { PROMO_POPUP_TITLE_ID, type PromoCampaign } from "./PromoPopupPanel";
import type { PopupSocial } from "./PromoPopupSocials";
import { useConsentAnswered } from "./useConsentAnswered";
import { usePageVisit } from "./usePageVisit";
import { usePromoTrigger } from "./usePromoTrigger";

interface Props {
  query: string;
  variables: PromoPopupQueryVariables;
  data: PromoPopupQuery;
  socials: PopupSocial[];
}

export default function PromoPopupReact({ query, variables, data: initialData, socials }: Props) {
  const { data } = useTina<PromoPopupQuery>({ query, variables, data: initialData });
  const popup = data.promoPopup;
  const visit = usePageVisit();
  const consentAnswered = useConsentAnswered();
  const [openCampaignId, setOpenCampaignId] = useState<string | null>(null);
  const [shownOnVisit, setShownOnVisit] = useState<number | null>(null);
  const convertedRef = useRef(false);

  const eligibleCampaign = useMemo<PromoCampaign | null>(() => {
    if (!visit.pathname || isPathExcluded(visit.pathname, popup.excludedPaths)) return null;
    const now = Date.now();
    const active = pickActiveCampaign(popup.campaigns, now);
    return active && !isCampaignSnoozed(readHistory(), active.id, popup.frequency, now) ? active : null;
  }, [visit, popup.excludedPaths, popup.campaigns, popup.frequency]);

  const armed =
    consentAnswered && Boolean(eligibleCampaign) && openCampaignId === null && shownOnVisit !== visit.count;

  usePromoTrigger(popup.triggers, armed, visit.count, () => {
    convertedRef.current = false;
    setOpenCampaignId(eligibleCampaign?.id ?? null);
    setShownOnVisit(visit.count);
  });

  const campaign = popup.campaigns?.find((item) => item?.id === openCampaignId);
  if (!campaign) return null;

  const close = () => {
    if (!convertedRef.current) recordDismiss(campaign.id);
    setOpenCampaignId(null);
  };

  const convert = () => {
    if (convertedRef.current) return;
    convertedRef.current = true;
    recordConvert(campaign.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={PROMO_POPUP_TITLE_ID}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 px-gutter"
    >
      <PromoPopupPanel
        popup={popup}
        campaign={campaign}
        socials={socials}
        onClose={close}
        onCopy={convert}
        onCtaClick={convert}
      />
    </div>
  );
}
