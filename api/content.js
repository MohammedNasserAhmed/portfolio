
import { json, corsHeaders, isPreflight } from './_lib/http.js';
import { getSiteContent } from './_lib/storage.js';

export default async function(req, res) {
    const cors = corsHeaders(req);
    
    if (isPreflight(req)) {
        return json(res, 204, null, cors);
    }

    try {
        const content = await getSiteContent();
        if (!content) {
             // 404 but correct JSON structure to avoid client crash
            return json(res, 404, { error: 'content_not_found' }, cors);
        }
        return json(res, 200, content, cors);
    } catch (e) {
        console.error('Content API Error:', e);
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
