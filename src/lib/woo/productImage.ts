import { getImage } from "astro:assets";

export interface ResponsiveImage {
  src: string;
  srcset?: string;
}

const PRODUCT_CARD_WIDTHS = [240, 360, 480, 720];

export async function productCardImage(src: string): Promise<ResponsiveImage> {
  try {
    const image = await getImage({ src, inferSize: true, widths: PRODUCT_CARD_WIDTHS, format: "webp" });
    return { src: image.src, srcset: image.srcSet.attribute };
  } catch (error) {
    // Una imagen caída en Woo no debe tumbar el build: se sirve el original.
    console.warn(`[woo] no se pudo optimizar ${src}: ${(error as Error).message}`);
    return { src };
  }
}
