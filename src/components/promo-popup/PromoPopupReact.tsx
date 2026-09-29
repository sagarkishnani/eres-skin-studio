import { useTina } from "tinacms/dist/react";
import type { PromoPopupQuery, PromoPopupQueryVariables } from "../../../tina/__generated__/types";
import PromoPopupPanel, { PROMO_POPUP_TITLE_ID } from "./PromoPopupPanel";
import type { PopupSocial } from "./PromoPopupSocials";

interface Props {
  query: string;
  variables: PromoPopupQueryVariables;
  data: PromoPopupQuery;
  socials: PopupSocial[];
}

export default function PromoPopupReact({ query, variables, data: initialData, socials }: Props) {
  const { data } = useTina<PromoPopupQuery>({ query, variables, data: initialData });
  const popup = data.promoPopup;
  const campaign = popup.campaigns?.find(Boolean);

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
        onClose={() => {}}
        onCopy={() => {}}
        onCtaClick={() => {}}
      />
    </div>
  );
}
