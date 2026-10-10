import { useEffect, useState } from "react";

export type ShareMode = "native" | "copy" | null;

const COPIED_FEEDBACK_MS = 2200;

function detectShareMode(): ShareMode {
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch && typeof navigator.share === "function") return "native";
  if (typeof navigator.clipboard?.writeText === "function") return "copy";
  if (typeof navigator.share === "function") return "native";
  return null;
}

export function useShareLink(title: string) {
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
        await navigator.share({ title, url: window.location.href });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {}
  }

  return { shareMode, copied, share };
}
