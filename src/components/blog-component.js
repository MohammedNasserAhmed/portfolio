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
            .map((post, idx) => {
                // Fallback gradient if no image
                const gradients = [
                    'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
                    'linear-gradient(135deg, #D92323 0%, #000000 100%)',
                    'linear-gradient(135deg, #403B4A 0%, #E7E9BB 100%)'
                ];
                const bgStyle = post.image
                    ? `background-image: url('${post.image}'); background-size: cover; background-position: center;`
                    : `background: ${gradients[idx % gradients.length]};`;

                return `
                <a href="${post.link}" target="_blank" rel="noopener noreferrer" 
                   class="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-brand-red/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full">
                    
                    <!-- Image Header -->
                    <div class="relative h-48 w-full shrink-0 overflow-hidden">
                        <div class="absolute inset-0 transition-transform duration-500 group-hover:scale-110" style="${bgStyle}"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        
                        <!-- Badges -->
                        <div class="absolute bottom-3 left-3 flex items-center space-x-2">
                             ${
                                 post.categories.length
                                     ? `<span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-brand-red/90 rounded-md shadow-sm">${post.categories[0]}</span>`
                                     : ''
                             }
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-5 flex flex-col flex-grow relative">
                        <div class="flex items-center justify-between text-xs text-brand-gray mb-3 border-b border-white/5 pb-3">
                            <span class="flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                ${new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                             <span class="text-brand-red opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">Read &rarr;</span>
                        </div>

                        <h2 class="text-xl font-bold text-white mb-3 leading-tight group-hover:text-brand-red transition-colors">${post.title}</h2>
                        
                        <p class="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4 flex-grow">
                            ${post.excerpt}
                        </p>
                    </div>
                </a>
            `;
            })
            .join('');
    }
}
