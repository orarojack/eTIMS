/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute origin for QR links (e.g. https://app.example.com). Defaults to window.location.origin. */
  readonly VITE_PUBLIC_APP_URL?: string;
}
