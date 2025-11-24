import { json, corsHeaders, isPreflight } from './_lib/http.js';
import { supabase } from './_lib/supabase.js';

export default async function(req, res) {
    const origin = req?.headers?.origin || '*';
    const cors = corsHeaders(origin);

    if (isPreflight(req)) {
        return json(res, 204, {}, cors);
    }

    if (!supabase) {
        // Mock data if Supabase is not configured
        const mockPosts = [
            {
                slug: 'hello-world',
                title: 'Welcome to my new portfolio',
                excerpt: 'A look into how I built this site using modern web technologies.',
                published_at: new Date().toISOString()
            },
            {
                slug: 'ai-engineering-2025',
                title: 'The State of AI Engineering in 2025',
                excerpt: 'Reflections on the rapid evolution of LLMs and agentic workflows.',
                published_at: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        return json(res, 200, mockPosts, cors);
    }

    try {
        const { data, error } = await supabase
            .from('posts')
            .select('slug, title, excerpt, published_at')
            .order('published_at', { ascending: false });

        if (error) throw error;

        return json(res, 200, data, cors);
    } catch (e) {
        console.error('Posts API Error:', e);
        return json(res, 500, { error: 'internal_error' }, cors);
    }
}
