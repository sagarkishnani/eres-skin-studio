/// <reference types="astro/client" />

// Non-PUBLIC_ variables are deliberately not declared: they are build-only secrets.
interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly PUBLIC_WOO_API_URL: string;
  readonly PUBLIC_WOO_CHECKOUT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
