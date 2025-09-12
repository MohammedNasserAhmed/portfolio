// Storage abstraction with Redis (Upstash) optional, in-memory fallback
let memory = {
    visitors: 0,
    stars: 0,
    starredBy: new Set(),
    visitsBy: new Map() // clientId -> lastVisitTimestamp
};

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisFetch(path, init) {
    const url = `${process.env.UPSTASH_REDIS_REST_URL}${path}`;
    const res = await fetch(url, {
        ...init,
        headers: {
            authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
            'content-type': 'application/json',
            ...(init?.headers || {})
        },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
    return res.json();
}

export async function getStats(clientId) {
    if (!hasUpstash) {
        return {
            visitors: memory.visitors,
            stars: memory.stars,
            userHasStarred: clientId ? memory.starredBy.has(clientId) : false
        };
    }
    const [visitors, stars, userStarred] = await Promise.all([
        redisFetch('/GET/portfolio:visitors'),
        redisFetch('/GET/portfolio:stars'),
        clientId ? redisFetch(`/SISMEMBER/portfolio:starredBy/${clientId}`) : { result: 0 }
    ]);
    return {
        visitors: Number(visitors.result || 0),
        stars: Number(stars.result || 0),
        userHasStarred: !!Number(userStarred.result || 0)
    };
}

export async function incrementVisit(clientId) {
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000; // at most once per 24h per client

    if (!hasUpstash) {
        const last = memory.visitsBy.get(clientId);
        if (!last || now - last > windowMs) {
            memory.visitors += 1;
            memory.visitsBy.set(clientId, now);
        }
        return getStats(clientId);
    }

    // Redis script: if last visit older than window, INCR visitors and update timestamp
    // Using two keys: portfolio:lastVisit:{cid} and counters
    const keyLast = `portfolio:lastVisit:${clientId}`;
    const lastJson = await redisFetch(`/GET/${encodeURIComponent(keyLast)}`).catch(() => ({
        result: null
    }));
    const last = Number(lastJson?.result || 0);
    if (!last || now - last > windowMs) {
        await Promise.all([
            redisFetch('/INCR/portfolio:visitors', { method: 'POST' }),
            redisFetch(`/SET/${encodeURIComponent(keyLast)}/${now}`, { method: 'POST' })
        ]);
    }
    return getStats(clientId);
}

export async function toggleStar(clientId, desired) {
    if (!hasUpstash) {
        const has = memory.starredBy.has(clientId);
        const next = typeof desired === 'boolean' ? desired : !has;
        if (next && !has) {
            memory.starredBy.add(clientId);
            memory.stars += 1;
        } else if (!next && has) {
            memory.starredBy.delete(clientId);
            memory.stars = Math.max(0, memory.stars - 1);
        }
        return getStats(clientId);
    }
    const keySet = 'portfolio:starredBy';
    const keyStars = 'portfolio:stars';
    if (desired) {
        // Add star
        const added = await redisFetch(`/SADD/${keySet}/${clientId}`, { method: 'POST' });
        if (Number(added.result || 0) > 0) {
            await redisFetch(`/INCR/${keyStars}`, { method: 'POST' });
        }
    } else {
        // Remove star
        const removed = await redisFetch(`/SREM/${keySet}/${clientId}`, { method: 'POST' });
        if (Number(removed.result || 0) > 0) {
            // Upstash doesn't have DECR if below zero enforcement, but we protect client side anyway
            await redisFetch(`/DECR/${keyStars}`, { method: 'POST' });
        }
    }
    return getStats(clientId);
}
