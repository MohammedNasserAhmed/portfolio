// Storage abstraction using Supabase
import { supabase } from './supabase.js';

// In-memory fallback for when Supabase is not configured
let memory = {
    visitors: 0,
    stars: 0,
    starredBy: new Set(),
    visitsBy: new Map(), // clientId -> lastVisitTimestamp
    messages: []
};

export async function getStats(clientId) {
    if (!supabase) {
        return { visitors: 0, stars: 0, userHasStarred: false, error: 'no_db' };
    }

    try {
        // Read fast aggregates
        const { data: statsData, error: statsError } = await supabase
            .from('site_aggregates')
            .select('total_visitors, total_stars')
            .eq('id', 1)
            .single();

        if (statsError && statsError.code !== 'PGRST116') { // Ignore "no rows" matching, handle via default
             console.warn('Aggregates read error:', statsError);
        }

        let userHasStarred = false;
        if (clientId) {
            const { data } = await supabase
                .from('stars')
                .select('id')
                .eq('client_id', clientId)
                .maybeSingle(); // Use maybeSingle to avoid 406 on no rows
            userHasStarred = !!data;
        }

        return {
            visitors: statsData?.total_visitors || 0,
            stars: statsData?.total_stars || 0,
            userHasStarred
        };
    } catch (error) {
        console.error('Supabase getStats error:', error);
        return { visitors: 0, stars: 0, userHasStarred: false, error: true };
    }
}

export async function incrementVisit(clientId) {
    if (!supabase) {
        const now = Date.now();
        const last = memory.visitsBy.get(clientId);
        // Simple debounce
        if (!last || now - last > 3600000) {
            memory.visitors += 1;
            memory.visitsBy.set(clientId, now);
        }
        return getStats(clientId);
    }

    try {
        // Check if visited recently (optional optimization, skip for now to keep it simple)
        // Just insert a visit record.
        // In a real app, you might want to check for duplicates within a time window.

        // For this implementation, we'll just insert.
        await supabase.from('visits').insert({ client_id: clientId });

        return getStats(clientId);
    } catch (error) {
        console.error('Supabase incrementVisit error:', error);
        return getStats(clientId);
    }
}

export async function toggleStar(clientId, desired) {
    if (!supabase) {
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

    try {
        if (desired) {
            // Upsert or Insert (ignore conflict)
            await supabase
                .from('stars')
                .upsert({ client_id: clientId }, { onConflict: 'client_id' });
        } else {
            await supabase.from('stars').delete().eq('client_id', clientId);
        }
        return getStats(clientId);
    } catch (error) {
        console.error('Supabase toggleStar error:', error);
        return getStats(clientId);
    }
}

export async function saveMessage(messageData) {
    if (!supabase) {
        console.log('Mock saving message (Supabase not configured):', messageData);
        memory.messages.push(messageData);
        return { success: true, mock: true };
    }

    try {
        const { error } = await supabase.from('messages').insert({
            name: messageData.name,
            email: messageData.email,
            message: messageData.message
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Supabase saveMessage error:', error);
        throw error;
    }
}
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
            userHasStarred: clientId ? memory.starredBy.has(clientId) : false,
            unstable: true
        };
    }
    const [visitors, stars, userStarred] = await Promise.all([
        redisFetch('/GET/portfolio:visitors'),
        // Derive stars from set cardinality for correctness
        redisFetch('/SCARD/portfolio:starredBy'),
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
    if (desired) {
        // Add star (idempotent)
        await redisFetch(`/SADD/${keySet}/${clientId}`, { method: 'POST' });
    } else {
        // Remove star (idempotent)
        await redisFetch(`/SREM/${keySet}/${clientId}`, { method: 'POST' });
    }
    return getStats(clientId);
}

export async function saveMessage(messageData) {
    const { name, email, message, timestamp } = messageData;

    if (!hasUpstash) {
        console.log('Mock saving message:', messageData);
        return { success: true, mock: true };
    }

    try {
        // Store in a list
        await redisFetch('/RPUSH/portfolio:messages', {
            method: 'POST',
            body: JSON.stringify(JSON.stringify(messageData))
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to save message:', error);
        throw error;
    }
}
