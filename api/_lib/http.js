// Minimal HTTP helpers (Vercel/Netlify compatible)
export function json(res, status, data, extraHeaders = {}) {
    const body = JSON.stringify(data);
    const headers = {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        ...extraHeaders
    };
    if (res) {
        Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
        res.statusCode = status;
        res.end(body);
    }
    return new Response(body, { status, headers });
}

export async function readJson(req) {
    try {
        // Read from the request stream (works for Node http.IncomingMessage and most serverless envs)
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

export function corsHeaders(origin = '*') {
    return {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type'
    };
}

export function isPreflight(req) {
    return (req?.method || '').toUpperCase() === 'OPTIONS';
}
