/**
 * Single source of truth for site identity.
 * Values are read from env at build time (NEXT_PUBLIC_ prefix makes them
 * available in both server and client components without any extra wiring).
 */
export const SITE_TITLE       = process.env.NEXT_PUBLIC_SITE_TITLE       ?? "Meridian"
export const SITE_DESCRIPTION = process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "The financial infrastructure for modern companies."
