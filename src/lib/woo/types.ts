// Reflejan los proyectores de public/woo-api.php: un campo que no esté en ambos lados no existe para el front.

export type StockStatus = "instock" | "outofstock" | "onbackorder";

export interface WooImage {
  src: string;
  alt: string;
}

export interface WooTermRef {
  id: number;
  name: string;
  slug: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: "simple" | "variable" | "grouped" | "external";
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: StockStatus;
  stock_quantity: number | null;
  average_rating: string;
  rating_count: number;
  categories: WooTermRef[];
  images: WooImage[];
  attributes: { name: string; options: string[] }[];
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  image: WooImage | null;
}

export type WooStock = Pick<
  WooProduct,
  "id" | "price" | "regular_price" | "sale_price" | "on_sale" | "purchasable" | "stock_status" | "stock_quantity"
>;

export interface WooCartItem {
  key: string;
  id: number;
  name: string;
  quantity: number;
  image: string;
  totals: { line_total: string; currency_minor_unit: number; currency_symbol: string } | null;
  prices: { price: string; regular_price: string; currency_minor_unit: number } | null;
}

export interface WooCart {
  items_count: number;
  items: WooCartItem[];
  totals: {
    total_items: string;
    total_price: string;
    currency_symbol: string;
    currency_minor_unit: number;
  } | null;
  needs_payment: boolean;
}
