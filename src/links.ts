// Public pages the game links to (absolute, so the apps open them in the browser).
// VITE_SITE_URL is set per build in .env.production, .env.site and .env.app.
const SITE = import.meta.env.VITE_SITE_URL ?? "https://subscriptionplusgame.com";

export const PRIVACY_URL = `${SITE}/privacy.html`;
export const TERMS_URL = `${SITE}/terms.html`;
