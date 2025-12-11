import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Server-side)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    try {
        // Fetch blogs from Supabase
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        // Transform to match frontend expectation (though table columns are already close)
        const posts = data.map((post) => ({
            title: post.title,
            link: post.url,
            published_at: post.published_date,
            excerpt: post.summary, // 20-25 words summary
            image: post.image,
            categories: [] // Optional: Add a category column to DB if needed later
        }));

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(posts || []);
    } catch (error) {
        console.error('Supabase Blog Error:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
}
