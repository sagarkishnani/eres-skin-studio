export interface Social {
  network?: string | null;
  url?: string | null;
}

export function socialLabel(network: string): string {
  return network === "x" ? "X" : network.charAt(0).toUpperCase() + network.slice(1);
}

export function presentSocials(socials?: (Social | null)[] | null): Social[] {
  return (socials || []).filter((social): social is Social => Boolean(social?.network && social?.url));
}
