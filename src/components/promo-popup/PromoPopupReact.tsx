import { useEffect, useMemo, useState } from "react";
import { useTina } from "tinacms/dist/react";
import type { PromoPopupQuery, PromoPopupQueryVariables } from "../../../tina/__generated__/types";
import { isPathExcluded, pickActiveCampaign } from "../../utils/promoPopup";
import PromoPopupPanel, { PROMO_POPUP_TITLE_ID, type PromoCampaign } from "./PromoPopupPanel";
import type { PopupSocial } from "./PromoPopupSocials";
import { usePageVisit } from "./usePageVisit";

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
  const [openCampaignId, setOpenCampaignId] = useState<string | null>(null);

  const eligibleCampaign = useMemo<PromoCampaign | null>(() => {
    if (!visit.pathname || isPathExcluded(visit.pathname, popup.excludedPaths)) return null;
    return pickActiveCampaign(popup.campaigns, Date.now());
  }, [visit, popup.excludedPaths, popup.campaigns]);

  useEffect(() => {
    setOpenCampaignId(eligibleCampaign?.id ?? null);
  }, [eligibleCampaign?.id, visit.count]);

  const campaign = popup.campaigns?.find((item) => item?.id === openCampaignId);
  if (!campaign) return null;

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
        copied={false}
        onClose={() => setOpenCampaignId(null)}
        onCopy={() => {}}
        onCtaClick={() => {}}
      />
    </div>
  );
}
