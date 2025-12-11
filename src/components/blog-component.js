export class BlogComponent {
    constructor() {
        this.container = document.getElementById('blog-grid');
    }

    async init() {
        if (!this.container) return;

        try {
            const response = await fetch('/api/posts');
            const posts = await response.json();

            this.render(posts);
        } catch (error) {
            console.error('Failed to load posts:', error);
            this.container.innerHTML =
                '<p class="text-center text-red-400">Failed to load posts.</p>';
        }
    }

    render(posts) {
        if (!posts || posts.length === 0) {
            this.container.innerHTML =
                '<p class="text-center text-gray-400 col-span-full">No posts yet.</p>';
            return;
        }

        this.container.innerHTML = posts
            .map(
                (post) => `
            <article class="glass-panel p-6 rounded-xl hover:border-brand-red/50 transition-colors group cursor-pointer">
                <div class="text-sm text-brand-red mb-2">${new Date(post.published_at).toLocaleDateString()}</div>
                <h2 class="text-xl font-bold text-white mb-3 group-hover:text-brand-red transition-colors">${post.title}</h2>
                <p class="text-gray-400 line-clamp-3">${post.excerpt}</p>
                <div class="mt-4 flex items-center text-sm font-medium text-white group-hover:translate-x-2 transition-transform">
                    Read more <span class="ml-2">→</span>
                </div>
            </article>
        `
            )
            .join('');
    }
}
