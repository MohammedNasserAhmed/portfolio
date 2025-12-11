import Parser from 'rss-parser';

export default async function handler(req, res) {
    const parser = new Parser();
    const FEED_URL = 'https://medium.com/feed/@mohd_nass';

    try {
        const feed = await parser.parseURL(FEED_URL);

        // Transform and limit posts
        const posts = feed.items.slice(0, 6).map((item) => {
            const content = item['content:encoded'] || item.content || '';

            // Extract first image
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);

            // Generate excerpt (clean HTML)
            let excerpt = item.contentSnippet;
            if (!excerpt && content) {
                // Strip HTML tags
                excerpt =
                    content
                        .replace(/<[^>]*>?/gm, '')
                        .substring(0, 160)
                        .trim() + '...';
            }
            if (!excerpt) excerpt = 'Click to read this article on Medium.';

            return {
                title: item.title,
                link: item.link,
                published_at: item.isoDate || item.pubDate,
                excerpt: excerpt,
                image: imgMatch ? imgMatch[1] : null,
                categories: item.categories || []
            };
        });

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).json(posts);
    } catch (error) {
        console.error('Medium RSS Error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
}
