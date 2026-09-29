import { useRef } from "react";
import { tinaField } from "tinacms/dist/react";
import { PiXLight } from "react-icons/pi";
import type { PromoPopupQuery } from "../../../tina/__generated__/types";
import { mediaUrl } from "../../utils/mediaUrl";
import { hoverUnderline } from "../blog/underline";
import PromoPopupSocials, { type PopupSocial } from "./PromoPopupSocials";
import { useCopyCoupon } from "./useCopyCoupon";

type PromoPopupData = PromoPopupQuery["promoPopup"];
export type PromoCampaign = NonNullable<NonNullable<PromoPopupData["campaigns"]>[number]>;

export const PROMO_POPUP_TITLE_ID = "promo-popup-title";

interface Props {
  popup: PromoPopupData;
  campaign: PromoCampaign;
  socials: PopupSocial[];
  onClose: () => void;
  onCopy: () => void;
  onCtaClick: () => void;
}

function CouponBlock({ campaign, onCopy }: Pick<Props, "campaign" | "onCopy">) {
  const codeRef = useRef<HTMLParagraphElement>(null);
  const { copied, copy } = useCopyCoupon(campaign.couponCode || "", codeRef, onCopy);

  return (
    <div className="mt-7 flex flex-col gap-3">
      <p
        ref={codeRef}
        className="grid h-14 select-all place-items-center border border-dashed border-line-strong bg-surface text-body-lg font-medium uppercase tracking-[.12em] text-content"
        data-tina-field={tinaField(campaign, "couponCode")}
      >
        {campaign.couponCode}
      </p>
      <button type="button" onClick={copy} className="btn-primary w-full" aria-live="polite">
        {copied ? campaign.copiedLabel || "¡Código copiado!" : campaign.copyLabel || "Copiar código"}
      </button>
    </div>
  );
}

export default function PromoPopupPanel({ popup, campaign, socials, onClose, onCopy, onCtaClick }: Props) {
  const image = mediaUrl(campaign.image);
  const hasCoupon = Boolean(campaign.couponCode);
  const hasCta = Boolean(campaign.ctaLabel && campaign.ctaUrl);

  return (
    <div
      className={`relative grid max-h-[90dvh] w-full overflow-y-auto overscroll-contain bg-surface-raised shadow-xl ${
        image ? "max-w-[1040px] md:grid-cols-2" : "max-w-[560px]"
      }`}
      data-lenis-prevent
    >
      {image && (
        <div className="aspect-[16/9] bg-stone-100 md:aspect-auto" data-tina-field={tinaField(campaign, "image")}>
          <img src={image} alt={campaign.imageAlt || ""} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-col justify-center p-[clamp(32px,5vw,56px)]">
        <div className="mx-auto flex w-full max-w-[420px] flex-col text-center">
          {campaign.eyebrow && (
            <p
              className="text-caption-sm uppercase tracking-[.2em] text-content-muted"
              data-tina-field={tinaField(campaign, "eyebrow")}
            >
              — {campaign.eyebrow}
            </p>
          )}
          <h2
            id={PROMO_POPUP_TITLE_ID}
            className="mt-4 text-balance text-heading-sm leading-[1.05] text-content"
            data-tina-field={tinaField(campaign, "title")}
          >
            {campaign.title}
          </h2>
          {campaign.body && (
            <p
              className="mt-4 text-pretty text-body-md leading-[1.65] text-content-muted"
              data-tina-field={tinaField(campaign, "body")}
            >
              {campaign.body}
            </p>
          )}

          {hasCoupon && <CouponBlock campaign={campaign} onCopy={onCopy} />}

          {hasCta && (
            <a
              href={campaign.ctaUrl!}
              onClick={onCtaClick}
              className={`w-full ${hasCoupon ? "btn-secondary mt-3" : "btn-primary mt-7"}`}
              data-tina-field={tinaField(campaign, "ctaLabel")}
            >
              {campaign.ctaLabel}
            </a>
          )}

          {campaign.finePrint && (
            <p
              className="mt-3 text-caption-sm text-content-subtle"
              data-tina-field={tinaField(campaign, "finePrint")}
            >
              {campaign.finePrint}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`mt-5 self-center text-caption-md text-content-muted ${hoverUnderline}`}
            data-tina-field={tinaField(popup, "dismissLabel")}
          >
            {popup.dismissLabel || "No, gracias"}
          </button>

          {popup.showSocials && <PromoPopupSocials socials={socials} />}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-3 top-3 grid h-11 w-11 place-items-center border border-line bg-surface-raised text-content transition-colors duration-400 ease-out-expo hover:border-ink"
      >
        <PiXLight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
