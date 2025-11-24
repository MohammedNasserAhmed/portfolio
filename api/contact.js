import { json, corsHeaders, isPreflight } from './_lib/http.js';
import { saveMessage } from './_lib/storage.js';

export default async function(req, res) {
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
        const { name, email, message } = body;

        // Basic validation
        if (!name || !email || !message) {
            return json(res, 400, { error: 'missing_fields' }, cors);
        }

        if (!email.includes('@')) {
            return json(res, 400, { error: 'invalid_email' }, cors);
        }

        const messageData = {
            name,
            email,
            message,
            timestamp: Date.now(),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        };

        await saveMessage(messageData);
        
        return json(res, 200, { success: true }, cors);
    } catch (e) {
        console.error('Contact API Error:', e);
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
