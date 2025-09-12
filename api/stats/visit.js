// POST /api/stats/visit
// Body: { clientId }
// Returns { visitors, stars, userHasStarred }
import { json, corsHeaders, isPreflight, readJson } from '../_lib/http.js';
import { incrementVisit } from '../_lib/storage.js';

export default async function handler(req, res) {
    const origin = req?.headers?.origin || '*';
    const cors = corsHeaders(origin);

    if (isPreflight(req)) {
        return json(res, 204, {}, cors);
    }

    if ((req.method || '').toUpperCase() !== 'POST') {
        return json(res, 405, { error: 'method_not_allowed' }, cors);
    }

    const body = await readJson(req);
    const clientId = String(body?.clientId || '').slice(0, 128);

    if (!clientId) {
        return json(res, 400, { error: 'client_id_required' }, cors);
    }

    try {
        const stats = await incrementVisit(clientId);
        return json(res, 200, stats, cors);
    } catch (e) {
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
