import { PiArrowBendUpRightLight, PiQuestionLight } from "react-icons/pi";
import { useShareLink } from "../../../hooks/useShareLink";

interface Props {
  productName: string;
  askUrl: string | null;
}

const actionClass = "flex items-center gap-2.5 py-1.5 text-content";
const underlineClass =
  "bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo [background-image:linear-gradient(currentColor,currentColor)] group-hover:bg-[length:100%_1px] group-hover:bg-left-bottom group-focus-visible:bg-[length:100%_1px] group-focus-visible:bg-left-bottom";

export default function ProductActionsReact({ productName, askUrl }: Props) {
  const { shareMode, copied, share } = useShareLink(productName);

  if (!shareMode && !askUrl) return null;

  return (
    <div className="mt-[22px] flex flex-wrap gap-x-7 gap-y-3 text-body-xs">
      {shareMode && (
        <button type="button" onClick={share} className={`group ${actionClass}`}>
          <PiArrowBendUpRightLight size={18} aria-hidden />
          <span className={underlineClass} aria-live="polite">
            {copied ? "Enlace copiado" : "Compartir"}
          </span>
        </button>
      )}
      {askUrl && (
        <a href={askUrl} target="_blank" rel="noopener noreferrer" className={`group ${actionClass}`}>
          <PiQuestionLight size={18} aria-hidden />
          <span className={underlineClass}>Hacer una pregunta</span>
        </a>
      )}
    </div>
  );
}
