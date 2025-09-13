// GET /api/stats/debug?cid=<clientId>
// Returns diagnostic info about backend persistence and current counters
import { json, corsHeaders, isPreflight } from '../_lib/http.js';

export default async function handler(req, res) {
    const origin = req?.headers?.origin || '*';
    const cors = corsHeaders(origin);

    if (isPreflight(req)) {
        return json(res, 204, {}, cors);
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const cid = url.searchParams.get('cid') || '';

        const hasUpstash =
            !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!hasUpstash) {
            return json(
                res,
                200,
                {
                    hasUpstash: false,
                    note: 'Upstash env vars not detected; server uses in-memory store (unstable across instances).'
                },
                cors
            );
        }

        async function redis(path, init) {
            const url = `${process.env.UPSTASH_REDIS_REST_URL}${path}`;
            const r = await fetch(url, {
                ...init,
                headers: {
                    authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                    'content-type': 'application/json',
                    ...(init?.headers || {})
                },
                cache: 'no-store'
            });
            const body = await r.text();
            let parsed = null;
            try {
                parsed = JSON.parse(body);
            } catch (_) {
                parsed = { raw: body };
            }
            return { ok: r.ok, status: r.status, data: parsed };
        }

        const keyLast = cid ? `portfolio:lastVisit:${cid}` : null;
        const [visitors, stars, member, lastVisit] = await Promise.all([
            redis('/GET/portfolio:visitors'),
            redis('/SCARD/portfolio:starredBy'),
            cid
                ? redis(`/SISMEMBER/portfolio:starredBy/${cid}`)
                : Promise.resolve({ ok: true, status: 200, data: { result: 0 } }),
            keyLast
                ? redis(`/GET/${encodeURIComponent(keyLast)}`)
                : Promise.resolve({ ok: true, status: 200, data: { result: null } })
        ]);

        return json(
            res,
            200,
            {
                hasUpstash: true,
                now: Date.now(),
                cid,
                visitors,
                stars,
                userHasStarred: !!Number(member?.data?.result || 0),
                lastVisitTs: Number(lastVisit?.data?.result || 0)
            },
            cors
        );
    } catch (e) {
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
