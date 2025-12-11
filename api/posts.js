import { supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
    try {
        if (!supabase) {
            console.error('Supabase client missing in api/posts.js');
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Supabase error fetching blogs:', error);
            throw error;
        }

        const posts = data.map((post) => ({
            title: post.title,
            link: post.url,
            published_at: post.published_date,
            excerpt: post.summary,
            image: post.image,
            categories: []
        }));

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(posts || []);
    } catch (error) {
        console.error('API /api/posts Error:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
}
