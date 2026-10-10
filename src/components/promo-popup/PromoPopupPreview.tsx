import { useState } from "react";
import type { PromoPopupQuery } from "../../../tina/__generated__/types";
import { pickPreviewCampaign } from "../../utils/promoPopup";
import PromoPopupDialog from "./PromoPopupDialog";
import PromoPopupPanel from "./PromoPopupPanel";
import type { PopupSocial } from "./PromoPopupSocials";

interface Props {
  popup: PromoPopupQuery["promoPopup"];
  socials: PopupSocial[];
}

export default function PromoPopupPreview({ popup, socials }: Props) {
  const contentSignature = JSON.stringify(popup);
  const [closedSignature, setClosedSignature] = useState<string | null>(null);
  const campaign = pickPreviewCampaign(popup.campaigns);

  if (!campaign || closedSignature === contentSignature) return null;

  return (
    <PromoPopupDialog onClosed={() => setClosedSignature(contentSignature)}>
      {({ requestClose, closeButtonRef }) => (
        <PromoPopupPanel
          popup={popup}
          campaign={campaign}
          socials={socials}
          closeButtonRef={closeButtonRef}
          onClose={requestClose}
          onCopy={() => {}}
          onCtaClick={() => {}}
        />
      )}
    </PromoPopupDialog>
  );
}
