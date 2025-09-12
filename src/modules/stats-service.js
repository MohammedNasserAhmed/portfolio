// StatsService: abstract persistence for visitors and stars with backend-first, local fallback
import { getConfig } from '../config/environment.js';

const LS = {
    CLIENT_ID: 'portfolio_client_id',
    VISITORS: 'portfolio_visitor_count',
    STARS: 'portfolio_star_count',
    USER_STARRED: 'portfolio_user_starred'
};

function uuidv4() {
    // RFC4122 UUID v4 using crypto if available, otherwise Math.random fallback
    const g = typeof globalThis !== 'undefined' ? globalThis : window;
    const c = g && g.crypto && typeof g.crypto.getRandomValues === 'function' ? g.crypto : null;
    if (c) {
        const bytes = new Uint8Array(16);
        c.getRandomValues(bytes);
        // Set version and variant bits
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    // Fallback (lower entropy) - acceptable for non-security client id
    let s = '';
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) s += '-';
        else if (i === 14) s += '4';
        else {
            const r = (Math.random() * 16) | 0;
            s += (i === 19 ? (r & 0x3) | 0x8 : r).toString(16);
        }
    }
    return s;
}

export class StatsService {
    constructor() {
        this.baseUrl = (getConfig && getConfig('apiBaseUrl')) || '';
        // Treat example placeholder and GitHub Pages as disabled; allow relative '/api' (Vercel same-origin)
        const isString = typeof this.baseUrl === 'string' && this.baseUrl.length > 0;
        const looksExample = /api\.example\.com\/api$/i.test(this.baseUrl);
        const looksGithub = /github\.io|githubusercontent\.com/i.test(this.baseUrl);
        const isRelativeApi = typeof this.baseUrl === 'string' && this.baseUrl.startsWith('/api');
        this.enabled = (isString || isRelativeApi) && !looksExample && !looksGithub;
        this.clientId = this.getOrCreateClientId();
    }

    getOrCreateClientId() {
        try {
            let id = localStorage.getItem(LS.CLIENT_ID);
            if (!id) {
                id = uuidv4();
                localStorage.setItem(LS.CLIENT_ID, id);
            }
            return id;
        } catch (e) {
            // Fallback non-persistent id
            return uuidv4();
        }
    }

    async getStats() {
        if (!this.enabled) {
            return this.getLocalStats();
        }
        try {
            const res = await fetch(
                `${this.baseUrl}/stats?cid=${encodeURIComponent(this.clientId)}`,
                {
                    method: 'GET',
                    headers: { accept: 'application/json' },
                    cache: 'no-store'
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            // { visitors, stars, userHasStarred }
            this.setLocalStats(data);
            return data;
        } catch (e) {
            return this.getLocalStats();
        }
    }

    async incrementVisit() {
        if (!this.enabled) {
            // Local increment
            const stats = this.getLocalStats();
            stats.visitors += 1;
            this.setLocalStats(stats);
            return stats;
        }
        const res = await fetch(`${this.baseUrl}/stats/visit`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ clientId: this.clientId })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.setLocalStats(data);
        return data;
    }

    async toggleStar(desired) {
        if (!this.enabled) {
            // Local toggle
            const stats = this.getLocalStats();
            const current = stats.userHasStarred === true;
            const next = typeof desired === 'boolean' ? desired : !current;
            stats.userHasStarred = next;
            stats.stars += next ? 1 : -1;
            if (stats.stars < 0) stats.stars = 0;
            this.setLocalStats(stats);
            return stats;
        }
        const res = await fetch(`${this.baseUrl}/stats/star`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ clientId: this.clientId, desired })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.setLocalStats(data);
        return data;
    }

    // Local helpers
    getLocalStats() {
        let visitors = 0;
        let stars = 0;
        let userHasStarred = false;
        try {
            visitors = parseInt(localStorage.getItem(LS.VISITORS) || '0', 10);
            stars = parseInt(localStorage.getItem(LS.STARS) || '0', 10);
            userHasStarred = localStorage.getItem(LS.USER_STARRED) === 'true';
        } catch (e) {
            // Ignore localStorage access errors (privacy modes, quotas)
            // Defaults are already set above
            if (console && typeof console.info === 'function') {
                console.info('StatsService.getLocalStats: using defaults');
            }
        }
        return { visitors, stars, userHasStarred };
    }

    setLocalStats({ visitors, stars, userHasStarred }) {
        try {
            if (typeof visitors === 'number') localStorage.setItem(LS.VISITORS, String(visitors));
            if (typeof stars === 'number') localStorage.setItem(LS.STARS, String(stars));
            if (typeof userHasStarred === 'boolean')
                localStorage.setItem(LS.USER_STARRED, String(userHasStarred));
        } catch (e) {
            // Ignore persistence failures silently
            if (console && typeof console.info === 'function') {
                console.info('StatsService.setLocalStats: persistence skipped');
            }
        }
    }
}

export const statsService = new StatsService();
