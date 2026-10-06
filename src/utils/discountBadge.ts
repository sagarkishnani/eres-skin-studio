export type DiscountBadgeStyle = "horizontal" | "diagonal";

export function resolveDiscountBadgeStyle(value?: string | null): DiscountBadgeStyle {
  return value === "horizontal" ? "horizontal" : "diagonal";
}
