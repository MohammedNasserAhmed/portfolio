// GET /api/stats
// Returns { visitors, stars, userHasStarred }
import { json, corsHeaders, isPreflight } from './_lib/http.js';
import { getStats } from './_lib/storage.js';

export default async function handler(req, res) {
    const origin = req?.headers?.origin || '*';
    const cors = corsHeaders(origin);

    if (isPreflight(req)) {
        return json(res, 204, {}, cors);
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const cid = url.searchParams.get('cid') || '';

    try {
        const stats = await getStats(cid);
        return json(res, 200, stats, cors);
    } catch (e) {
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
