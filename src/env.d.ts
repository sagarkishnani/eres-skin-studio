/// <reference types="astro/client" />

// Non-PUBLIC_ variables are deliberately not declared: they are build-only secrets.
interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
