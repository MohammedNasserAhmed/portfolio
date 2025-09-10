// Projects section component
import { escapeHTML, escapeAttr } from '../utils/helpers.js';

export class ProjectsComponent {
    constructor() {
        this.container = null;
        this.wrapper = null;
        this.scrollSpeed = 1;
        this.animationId = null;
        this.isPaused = false;
        
        // Bind methods for event listeners
        this.handleMouseEnter = () => { 
            this.container.style.animationPlayState = 'paused'; 
        };
        this.handleMouseLeave = () => { 
            this.container.style.animationPlayState = 'running'; 
        };
    }
    
    init() {
        this.container = document.getElementById('projects-grid');
        this.wrapper = document.getElementById('projects-carousel');
    }
    
    render(items) {
        if (!this.container || !Array.isArray(items)) return;
        
        const isAutoCarousel = this.wrapper && this.wrapper.dataset.auto === 'true';
        // Duplicate the items for seamless loop - exactly 2 sets for translateX(-50%) animation
        const projectList = isAutoCarousel ? [...items, ...items] : items;
        
        this.container.innerHTML = projectList.map((project, index) => {
            const isDuplicate = index >= items.length;
            const baseIndex = index % items.length;
            const altColors = ['#ff5858', '#2e2e2e', '#d92323', '#3a3a3a'];
            
            const backgroundStyle = project.image
                ? `url('${escapeAttr(project.image)}') center/cover`
                : altColors[baseIndex % altColors.length];
                
            const isDark = /#2e2e2e|#3a3a3a|var\(--color-card\)/i.test(backgroundStyle);
            
            return `
                <div class="project-card has-lid" 
                     role="listitem" 
                     data-dupe="${isDuplicate ? 'true' : 'false'}" 
                     style="--lid-bg:${backgroundStyle};">
                    <div class="project-lid${isDark ? ' is-dark' : ''}" tabindex="0">
                        ${this.renderGitHubLink(project)}
                    </div>
                    <div class="project-body">
                        <p class="text-brand-gray">${escapeHTML(project.description)}</p>
                        <div class="tech-tags">
                            ${(project.tech || []).map(tech => 
                                `<span>${escapeHTML(tech)}</span>`
                            ).join('')}
                        </div>
                        ${this.renderProjectLink(project)}
                    </div>
                </div>
            `;
        }).join('');
        
        if (isAutoCarousel) {
            this.initAutoCarousel();
        }
    }
    
    renderGitHubLink(project) {
        if (!project.githubUrl) return '';
        
        return `
            <a href='${escapeAttr(project.githubUrl)}' 
               class='proj-gh' 
               target='_blank' 
               rel='noopener' 
               aria-label='GitHub: ${escapeAttr(project.title)}'>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.13-3.2.7-3.88-1.36-3.88-1.36-.53-1.35-1.3-1.71-1.3-1.71-1.07-.73.08-.72.08-.72 1.18.08 1.8 1.21 1.8 1.21 1.05 1.79 2.76 1.27 3.43.97.11-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 2.9-.39 11.1 11.1 0 0 1 2.9.39c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.24 2.76.12 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22 0 1.6-.02 2.88-.02 3.27 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z'/>
                </svg>
            </a>
        `;
    }
    
    renderProjectLink(project) {
        if (!project.githubUrl) return '';
        
        return `
            <div class='mt-2'>
                <a href='${escapeAttr(project.githubUrl)}' 
                   class='text-brand-red text-xs font-semibold hover:underline' 
                   target='_blank' 
                   rel='noopener'>
                    GitHub →
                </a>
            </div>
        `;
    }
    
    initAutoCarousel() {
        // The CSS animation is already applied via the outreach-track class
        // Just need to add hover pause functionality
        this.wrapper.addEventListener('mouseenter', this.handleMouseEnter);
        this.wrapper.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    stopInfiniteScroll() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stopInfiniteScroll();
        if (this.wrapper) {
            this.wrapper.removeEventListener('mouseenter', this.handleMouseEnter);
            this.wrapper.removeEventListener('mouseleave', this.handleMouseLeave);
        }
    }
    
    // Filter projects based on active skill filters
    filterBySkills(activeFilters) {
        if (!this.container) return;
        
        const cards = Array.from(this.container.children);
        const isFiltering = activeFilters.length > 0;
        let matchedCount = 0;
        
        // Update carousel mode based on filtering state
        this.updateCarouselMode(isFiltering);
        
        if (isFiltering) {
            this.container.classList.add('filtering');
        } else {
            this.container.classList.remove('filtering');
        }
        
        cards.forEach(card => {
            const techBadges = Array.from(card.querySelectorAll('.tech-tags span'))
                .map(span => (span.textContent || '').toLowerCase());
            
            let shouldShow = !isFiltering || 
                activeFilters.some(filter => 
                    techBadges.includes(filter.toLowerCase())
                );
            
            // Hide duplicates when filtering
            if (isFiltering && card.dataset.dupe === 'true') {
                shouldShow = false;
            }
            
            card.dataset.hidden = shouldShow ? 'false' : 'true';
            
            if (!shouldShow) {
                setTimeout(() => {
                    if (card.dataset.hidden === 'true') {
                        card.style.display = 'none';
                    }
                }, 380);
            } else {
                card.style.display = '';
                matchedCount++;
            }
        });
        
        if (!isFiltering) {
            cards.forEach(card => {
                card.style.display = '';
                card.dataset.hidden = 'false';
            });
        }
        
        return matchedCount;
    }
    
    // Update carousel mode based on filtering state
    updateCarouselMode(isFiltering) {
        if (!this.wrapper || !this.container) return;
        
        if (isFiltering) {
            // Filtered mode: stop animation and center content
            this.wrapper.classList.add('filtered-mode');
            this.container.style.animationPlayState = 'paused';
        } else {
            // Default mode: restore infinite carousel
            this.wrapper.classList.remove('filtered-mode');
            this.container.style.animationPlayState = 'running';
        }
    }
}