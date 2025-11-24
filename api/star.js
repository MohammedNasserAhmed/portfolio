import { json, corsHeaders, isPreflight } from './_lib/http.js';
import { toggleStar } from './_lib/storage.js';

export default async function handler(req, res) {
    const origin = req?.headers?.origin || '*';
    const cors = corsHeaders(origin);

    if (isPreflight(req)) {
        return json(res, 204, {}, cors);
    }

    if (req.method !== 'POST') {
        return json(res, 405, { error: 'method_not_allowed' }, cors);
    }

    try {
        const body = await req.json();
        const { cid, desired } = body;

        if (!cid) {
            return json(res, 400, { error: 'missing_cid' }, cors);
        }

        const stats = await toggleStar(cid, desired);
        return json(res, 200, stats, cors);
    } catch (e) {
        console.error('Star API Error:', e);
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
