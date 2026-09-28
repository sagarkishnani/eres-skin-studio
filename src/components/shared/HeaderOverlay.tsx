interface Props {
  panelOpen: boolean;
  megaMenuOpen: boolean;
  onClose: () => void;
}

export default function HeaderOverlay({ panelOpen, megaMenuOpen, onClose }: Props) {
  const visible = panelOpen || megaMenuOpen;
  return (
    <div
      aria-hidden
      onClick={onClose}
      className={`fixed inset-0 bg-ink/35 transition-opacity duration-500 ease-out-soft ${panelOpen ? "z-[65]" : "z-[45]"} ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    />
  );
}
