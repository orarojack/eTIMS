/**
 * Base URL for QR codes. Set `VITE_PUBLIC_APP_URL` on your host (e.g. Vercel) to your canonical
 * origin (https://e-tims.vercel.app) so printed/PDF QRs always open the live app, not localhost.
 */
export function getPublicInvoiceViewUrl(qrToken: string): string {
  const fromEnv = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim();
  const base = fromEnv
    ? fromEnv.replace(/\/$/, '')
    : typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';
  const path = `/i/${encodeURIComponent(qrToken)}`;
  return base ? `${base}${path}` : path;
}
