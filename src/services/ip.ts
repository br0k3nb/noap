import axios from "axios";

const IP_SERVICE_URL = 'https://whats-my-ip-delta.vercel.app/';

/**
 * Best-effort public-IP lookup for session metadata.
 *
 * Uses a bare axios instance (never the credentialed `api` client) so no
 * session credential is leaked to a third party. NEVER throws: returns ""
 * when the service is unreachable — the backend treats the identifier as
 * optional metadata, so a hiccup here must not fail auth.
 */
export async function fetchPublicIp(): Promise<string> {
    try {
        const { data } = await axios.get(IP_SERVICE_URL, { timeout: 6000 });
        if (typeof data === 'string') return data.trim();
        if (data && typeof data === 'object') {
            const candidate = (data as any).ip ?? (data as any).address ?? "";
            if (typeof candidate === 'string') return candidate.trim();
        }
        return "";
    } catch {
        return "";
    }
}
