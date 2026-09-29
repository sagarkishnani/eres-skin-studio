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
import PromoPopupDialog from "./PromoPopupDialog";
import PromoPopupPanel, { type PromoCampaign } from "./PromoPopupPanel";
import PromoPopupPreview from "./PromoPopupPreview";
import type { PopupSocial } from "./PromoPopupSocials";
import { useConsentAnswered } from "./useConsentAnswered";
import { useInsideTinaEditor } from "./useInsideTinaEditor";
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
  const editing = useInsideTinaEditor();
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
    Boolean(popup.enabled) &&
    !editing &&
    consentAnswered &&
    Boolean(eligibleCampaign) &&
    openCampaignId === null &&
    shownOnVisit !== visit.count;

  usePromoTrigger(popup.triggers, armed, visit.count, () => {
    convertedRef.current = false;
    setOpenCampaignId(eligibleCampaign?.id ?? null);
    setShownOnVisit(visit.count);
  });

  if (editing) return <PromoPopupPreview popup={popup} socials={socials} />;

  const campaign = popup.campaigns?.find((item) => item?.id === openCampaignId);
  // A null render fails Astro's React renderer check, which then falls back to the MDX renderer and calls hooks outside React.
  if (!campaign) return <></>;

  const closed = () => {
    if (!convertedRef.current) recordDismiss(campaign.id);
    setOpenCampaignId(null);
  };

  const convert = () => {
    if (convertedRef.current) return;
    convertedRef.current = true;
    recordConvert(campaign.id);
  };

  return (
    <PromoPopupDialog key={campaign.id} onClosed={closed}>
      {({ requestClose, closeButtonRef }) => (
        <PromoPopupPanel
          popup={popup}
          campaign={campaign}
          socials={socials}
          closeButtonRef={closeButtonRef}
          onClose={requestClose}
          onCopy={convert}
          onCtaClick={() => {
            convert();
            requestClose();
          }}
        />
      )}
    </PromoPopupDialog>
  );
}
