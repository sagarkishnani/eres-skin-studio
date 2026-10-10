import { PiArrowBendUpRightLight } from "react-icons/pi";
import { useShareLink } from "../../hooks/useShareLink";
import { groupHoverUnderline } from "./underline";

export default function ShareButtonReact({ title }: { title: string }) {
  const { shareMode, copied, share } = useShareLink(title);

  if (!shareMode) return <div hidden />;

  return (
    <button type="button" onClick={share} className="group flex items-center gap-2.5 py-1.5 text-body-sm text-content">
      <PiArrowBendUpRightLight size={18} aria-hidden />
      <span className={`${groupHoverUnderline} duration-500`} aria-live="polite">
        {copied ? "Enlace copiado" : "Compartir"}
      </span>
    </button>
  );
}
