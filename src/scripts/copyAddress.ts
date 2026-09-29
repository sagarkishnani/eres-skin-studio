const COPIED_FEEDBACK_MS = 2200;

function bindCopyButton(button: HTMLElement) {
  const label = button.querySelector("[data-copy-label]");
  const idleText = label?.textContent || "";
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyAddress || "");
    } catch {
      return;
    }
    if (!label) return;
    label.textContent = button.dataset.copiedLabel || idleText;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (label.textContent = idleText), COPIED_FEEDBACK_MS);
  });
  button.setAttribute("data-ready", "");
}

export function startCopyAddress() {
  if (!navigator.clipboard?.writeText) return;
  document.querySelectorAll<HTMLElement>("[data-copy-address]:not([data-ready])").forEach(bindCopyButton);
}
