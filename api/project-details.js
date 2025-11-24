import { json, corsHeaders, isPreflight } from './_lib/http.js';
import { supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
    const origin = req?.headers?.origin || '*';
    const cors = corsHeaders(origin);

    if (isPreflight(req)) {
        return json(res, 204, {}, cors);
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');

    if (!id) {
        return json(res, 400, { error: 'missing_id' }, cors);
    }

    if (!supabase) {
        // Mock data
        const mockProject = {
            id: id,
            title: 'Project ' + id,
            description: 'A detailed look at this amazing project.',
            problem: 'The world needed a better way to do X.',
            solution: 'I built a scalable system using Y and Z.',
            impact: 'Reduced latency by 50% and increased user engagement.',
            tech_stack: ['Node.js', 'React', 'AI'],
            github_url: 'https://github.com',
            demo_url: 'https://example.com'
        };
        return json(res, 200, mockProject, cors);
    }

    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return json(res, 404, { error: 'not_found' }, cors);

        return json(res, 200, data, cors);
    } catch (e) {
        console.error('Project Details API Error:', e);
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
