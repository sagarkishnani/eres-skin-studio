import type { IconType } from "react-icons";
import {
  PiFacebookLogoLight,
  PiInstagramLogoLight,
  PiLinkedinLogoLight,
  PiTiktokLogoLight,
  PiWhatsappLogoLight,
  PiXLogoLight,
  PiYoutubeLogoLight,
} from "react-icons/pi";
import { socialLabel } from "../shared/socialLinks";

export interface PopupSocial {
  network: string;
  url: string;
}

const ICONS: Record<string, IconType> = {
  instagram: PiInstagramLogoLight,
  facebook: PiFacebookLogoLight,
  tiktok: PiTiktokLogoLight,
  whatsapp: PiWhatsappLogoLight,
  linkedin: PiLinkedinLogoLight,
  x: PiXLogoLight,
  youtube: PiYoutubeLogoLight,
};

export default function PromoPopupSocials({ socials }: { socials: PopupSocial[] }) {
  const withIcon = socials.filter((social) => ICONS[social.network]);
  if (withIcon.length === 0) return null;

  return (
    <ul className="mt-7 flex flex-wrap justify-center gap-6">
      {withIcon.map((social) => {
        const Icon = ICONS[social.network];
        return (
          <li key={social.network}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener"
              aria-label={socialLabel(social.network)}
              className="grid h-11 w-11 place-items-center text-content-muted transition-colors duration-400 ease-out-expo hover:text-content"
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
