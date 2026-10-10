import { useEffect, useRef, useState, type RefObject } from "react";

const COPIED_FEEDBACK_MS = 2000;

function selectContents(element: HTMLElement | null) {
  const selection = window.getSelection();
  if (!element || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function useCopyCoupon(code: string, codeRef: RefObject<HTMLElement | null>, onCopied: () => void) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      selectContents(codeRef.current);
      return;
    }
    setCopied(true);
    onCopied();
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return { copied, copy };
}
