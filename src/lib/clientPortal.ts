// Maps a hostname (or ?portal= override in dev) to a client portal config.
// Each entry defines which client_id the portal exposes and its branding.

export type ClientPortalConfig = {
  slug: string;
  clientId: string;
  clientName: string;
  displayName: string; // shown in UI
  tagline?: string;
};

export const CLIENT_PORTALS: Record<string, ClientPortalConfig> = {
  actinver: {
    slug: "actinver",
    clientId: "1b3831de-23f1-4aa7-a40f-8288ff70fb1d",
    clientName: "Actinver",
    displayName: "Actinver",
    tagline: "Portal privado de análisis diario",
  },
};

/** Returns the active portal slug based on subdomain or ?portal= override, or null. */
export function detectClientPortal(): ClientPortalConfig | null {
  if (typeof window === "undefined") return null;

  // Dev override
  try {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("portal");
    if (override && CLIENT_PORTALS[override]) return CLIENT_PORTALS[override];
  } catch {
    /* noop */
  }

  const host = window.location.hostname.toLowerCase();
  // First subdomain segment; ignore preview/staging Lovable hosts.
  const parts = host.split(".");
  if (parts.length < 2) return null;
  const first = parts[0];
  if (first === "www" || first === "kimedia") return null;
  if (host.endsWith("lovable.app") || host.endsWith("lovable.dev")) {
    // Only allow explicit override in Lovable preview environments.
    return null;
  }
  return CLIENT_PORTALS[first] ?? null;
}