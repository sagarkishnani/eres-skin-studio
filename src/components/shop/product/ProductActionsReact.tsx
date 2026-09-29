import { useEffect, useState } from "react";
import { PiArrowBendUpRightLight, PiQuestionLight } from "react-icons/pi";

interface Props {
  productName: string;
  askUrl: string | null;
}

type ShareMode = "native" | "copy" | null;

const COPIED_FEEDBACK_MS = 2200;

const actionClass = "flex items-center gap-2.5 py-1.5 text-content";
const underlineClass =
  "bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo [background-image:linear-gradient(currentColor,currentColor)] group-hover:bg-[length:100%_1px] group-hover:bg-left-bottom group-focus-visible:bg-[length:100%_1px] group-focus-visible:bg-left-bottom";

function detectShareMode(): ShareMode {
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch && typeof navigator.share === "function") return "native";
  if (typeof navigator.clipboard?.writeText === "function") return "copy";
  if (typeof navigator.share === "function") return "native";
  return null;
}

export default function ProductActionsReact({ productName, askUrl }: Props) {
  const [shareMode, setShareMode] = useState<ShareMode>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => setShareMode(detectShareMode()), []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function share() {
    if (shareMode === "native") {
      try {
        await navigator.share({ title: productName, url: window.location.href });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {}
  }

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
