/**
 * Specter app parameters — simplified standalone version
 * No longer relies on Base44 URL params or localStorage tokens.
 */

export const appParams = {
  appId: 'specter',
  token: null,
  fromUrl: typeof window !== 'undefined' ? window.location.href : '',
  functionsVersion: null,
  appBaseUrl: null,
}