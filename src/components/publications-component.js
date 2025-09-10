// Publications section component
import { escapeHTML, escapeAttr } from '../utils/helpers.js';

export class PublicationsComponent {
    constructor() {
        this.heroContainer = null;
        this.gridContainer = null;
        this.controlsContainer = null;
        this.searchInput = null;
        this.clearButton = null;
    }
    
    init() {
        this.heroContainer = document.getElementById('publications-hero');
        this.gridContainer = document.getElementById('publications-grid');
        this.controlsContainer = document.getElementById('publications-controls');
    }
    
    normalizePublications(items) {
        return items.map(item => {
            if (typeof item === 'string') {
                return { title: item };
            }
            
            return {
                title: item.title || item.name || 'Untitled',
                image: item.image || '',
                published: item.published || item.date || '',
                description: item.description || item.summary || '',
                link: item.link || item.url || '#',
                type: item.type || '',
                domain: item.domain || item.topic || '',
                featured: !!item.featured,
                pdf: item.pdf || null,
                readingTime: item.readingTime || null
            };
        }).sort((a, b) => {
            const dateA = Date.parse(a.published) || 0;
            const dateB = Date.parse(b.published) || 0;
            return dateB - dateA; // Newest first
        });
    }
    
    estimateReadingTime(text) {
        if (!text) return '';
        const words = String(text).trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.round(words / 200));
        return `${minutes} min`;
    }
    
    createBadgeHTML(publication) {
        const badges = [];
        
        if (publication.type) {
            badges.push(`<span class="pub-pill type">${escapeHTML(publication.type)}</span>`);
        }
        
        if (publication.domain) {
            badges.push(`<span class="pub-pill domain">${escapeHTML(publication.domain)}</span>`);
        }
        
        if (publication.featured) {
            badges.push('<span class="pub-pill featured">Featured</span>');
        }
        
        if (badges.length === 0) return '';
        
        return `<div class="pub-badges" aria-label="Tags">${badges.join('')}</div>`;
    }
    
    createMetaRow(publication) {
        const readingTime = publication.readingTime || this.estimateReadingTime(publication.description);
        let dateDisplay = '';
        
        if (publication.published) {
            const timestamp = Date.parse(publication.published.replace(/,/g, ''));
            if (!isNaN(timestamp)) {
                const isoDate = new Date(timestamp).toISOString().split('T')[0];
                dateDisplay = `<time datetime="${isoDate}">${escapeHTML(publication.published)}</time>`;
            } else {
                dateDisplay = `<span class="pub-date">${escapeHTML(publication.published)}</span>`;
            }
        }
        
        return `
            <div class="pub-meta-row">
                ${dateDisplay}
                ${readingTime ? `<span class="reading-time">${escapeHTML(readingTime)}</span>` : ''}
            </div>
        `;
    }
    
    createSummaryHTML(publication) {
        return `<p class="pub-summary">${escapeHTML(publication.description || '')}</p>`;
    }
    
    createActionsHTML(publication, isPrimary = false) {
        const buttonClass = isPrimary ? 'pub-btn primary' : 'pub-btn';
        const linkText = isPrimary ? 'Read →' : 'Open';
        
        return `
            <div class="pub-actions">
                <a class="${buttonClass}" 
                   href="${escapeAttr(publication.link)}" 
                   target="_blank" 
                   rel="noopener" 
                   aria-label="${linkText} ${escapeAttr(publication.title)}">
                    ${linkText}
                </a>
                ${publication.pdf ? 
                    `<a class="pub-btn" 
                        href="${escapeAttr(publication.pdf)}" 
                        target="_blank" 
                        rel="noopener" 
                        aria-label="Download PDF of ${escapeAttr(publication.title)}">
                        PDF
                    </a>` : ''
                }
            </div>
        `;
    }
    
    createFeatureCardHTML(publication, index) {
        return `
            <article class="pub-feature-card" aria-labelledby="feature-${index}-title">
                <img class="thumb" 
                     src="${escapeAttr(publication.image)}" 
                     alt="${escapeAttr(publication.title)}" 
                     loading="lazy" />
                <div class="content">
                    ${this.createBadgeHTML(publication)}
                    <h3 class="pub-title" id="feature-${index}-title">
                        <a href="${escapeAttr(publication.link)}" 
                           target="_blank" 
                           rel="noopener">
                            ${escapeHTML(publication.title)}
                        </a>
                    </h3>
                    ${this.createMetaRow(publication)}
                    ${this.createSummaryHTML(publication)}
                    ${this.createActionsHTML(publication, true)}
                </div>
            </article>
        `;
    }
    
    createCardHTML(publication, index) {
        return `
            <article class="pub-card" aria-labelledby="pub-${index}-title">
                <img src="${escapeAttr(publication.image)}" 
                     alt="${escapeAttr(publication.title)}" 
                     class="cover" 
                     loading="lazy" />
                ${this.createBadgeHTML(publication)}
                <h3 class="pub-title" id="pub-${index}-title">
                    <a href="${escapeAttr(publication.link)}" 
                       target="_blank" 
                       rel="noopener">
                        ${escapeHTML(publication.title)}
                    </a>
                </h3>
                ${this.createMetaRow(publication)}
                ${this.createSummaryHTML(publication)}
                ${this.createActionsHTML(publication)}
            </article>
        `;
    }
    
    buildControls(publications) {
        if (!this.controlsContainer || this.controlsContainer.dataset.ready) return;
        
        const types = Array.from(
            new Set(publications.map(pub => (pub.type || '').trim().toLowerCase()).filter(Boolean))
        );
        
        const pillsHTML = types.map(type => 
            `<button class="pub-filter-pill" 
                     data-type="${escapeAttr(type)}" 
                     aria-pressed="false">
                ${escapeHTML(type)}
            </button>`
        ).join('');
        
        this.controlsContainer.innerHTML = `
            <div class="pub-search-outer" data-enhanced>
                <div class="pub-search-box" role="search">
                    <span class="icon" aria-hidden="true">🔍</span>
                    <input id="pub-search" 
                           type="search" 
                           autocomplete="off" 
                           spellcheck="false" 
                           placeholder="Search guides & reports..." 
                           aria-label="Search publications" />
                    <button type="button" 
                            class="clear-btn" 
                            id="pub-search-clear" 
                            aria-label="Clear search" 
                            hidden>✕</button>
                    <div class="ring-anim" aria-hidden="true"></div>
                </div>
            </div>
            <div class="pub-filter-pills" 
                 role="toolbar" 
                 aria-label="Publication type filters">
                ${pillsHTML}
            </div>
        `;
        
        this.controlsContainer.dataset.ready = 'true';
        this.bindControlEvents();
    }
    
    bindControlEvents() {
        // Filter pill events
        this.controlsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.pub-filter-pill');
            if (!button) return;
            
            const isPressed = button.getAttribute('aria-pressed') === 'true';
            
            // Single-select behavior
            this.controlsContainer.querySelectorAll('.pub-filter-pill[aria-pressed="true"]')
                .forEach(btn => btn.setAttribute('aria-pressed', 'false'));
            
            button.setAttribute('aria-pressed', isPressed ? 'false' : 'true');
            this.applyFilters();
        });
        
        // Search events
        this.searchInput = this.controlsContainer.querySelector('#pub-search');
        this.clearButton = this.controlsContainer.querySelector('#pub-search-clear');
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.clearButton.hidden = this.searchInput.value.length === 0;
                this.applyFilters();
            });
            
            this.searchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && this.searchInput.value) {
                    this.searchInput.value = '';
                    this.clearButton.hidden = true;
                    this.applyFilters();
                }
            });
        }
        
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                if (!this.searchInput.value) return;
                this.searchInput.value = '';
                this.clearButton.hidden = true;
                this.applyFilters();
                this.searchInput.focus();
            });
        }
    }
    
    applyFilters() {
        const query = (this.searchInput?.value || '').toLowerCase();
        const activeTypeButton = this.controlsContainer?.querySelector('.pub-filter-pill[aria-pressed="true"]');
        const activeType = activeTypeButton?.dataset.type;
        
        const filtered = this.currentPublications.filter(pub => {
            const matchesType = activeType ? (pub.type || '').toLowerCase() === activeType : true;
            if (!matchesType) return false;
            
            if (!query) return true;
            
            const searchableText = [pub.title, pub.description, pub.type, pub.domain]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
                
            return searchableText.includes(query);
        });
        
        this.renderFiltered(filtered);
    }
    
    renderFiltered(publications) {
        // Recompute featured subset for filtered publications
        const explicitFeatured = publications.filter(pub => pub.featured);
        const fillCount = Math.max(0, 2 - explicitFeatured.length);
        const fillFeatured = publications
            .filter(pub => !pub.featured)
            .slice(0, fillCount);
        const featured = [...explicitFeatured, ...fillFeatured].slice(0, 2);
        
        const featuredIds = new Set(featured.map(pub => pub.title + '|' + pub.published));
        const regular = publications.filter(pub => 
            !featuredIds.has(pub.title + '|' + pub.published)
        );
        
        // Render hero section
        this.heroContainer.innerHTML = featured.length
            ? `<div class="pub-featured-row">
                ${featured.map((pub, i) => this.createFeatureCardHTML(pub, i)).join('')}
               </div>`
            : '';
        
        // Render grid section
        if (featured.length === 0 && regular.length === 0) {
            this.gridContainer.innerHTML = `
                <div class="pub-empty" role="status">
                    No publications match your filters.
                    <button type="button" class="pub-reset">Reset</button>
                </div>
            `;
            
            const resetButton = this.gridContainer.querySelector('.pub-reset');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    this.clearFilters();
                });
            }
        } else {
            this.gridContainer.innerHTML = regular.map((pub, i) => this.createCardHTML(pub, i)).join('');
        }
        
        // Equalize heights and setup image loading
        requestAnimationFrame(() => {
            this.equalizeHeights();
            this.attachImageSkeletons();
            this.runImageRecovery();
        });
    }
    
    clearFilters() {
        // Clear search
        if (this.searchInput) {
            this.searchInput.value = '';
            this.clearButton.hidden = true;
        }
        
        // Clear filter pills
        this.controlsContainer?.querySelectorAll('.pub-filter-pill[aria-pressed="true"]')
            .forEach(btn => btn.setAttribute('aria-pressed', 'false'));
        
        this.applyFilters();
    }
    
    equalizeHeights() {
        // Equalize summary heights in feature cards
        const featureCards = this.heroContainer.querySelectorAll('.pub-feature-card');
        let maxSummaryHeight = 0;
        
        featureCards.forEach(card => {
            const summary = card.querySelector('.pub-summary');
            if (summary) {
                summary.style.maxHeight = 'none';
                const height = summary.getBoundingClientRect().height;
                if (height > maxSummaryHeight) {
                    maxSummaryHeight = height;
                }
            }
        });
        
        featureCards.forEach(card => {
            const summary = card.querySelector('.pub-summary');
            if (summary) {
                summary.style.maxHeight = maxSummaryHeight + 'px';
            }
        });
        
        // Equalize title heights in grid cards
        const gridTitles = this.gridContainer.querySelectorAll('.pub-card .pub-title');
        let maxTitleHeight = 0;
        
        gridTitles.forEach(title => {
            title.style.maxHeight = 'none';
            const height = title.getBoundingClientRect().height;
            if (height > maxTitleHeight) {
                maxTitleHeight = height;
            }
        });
        
        gridTitles.forEach(title => {
            title.style.maxHeight = maxTitleHeight + 'px';
        });
    }
    
    attachImageSkeletons() {
        const images = document.querySelectorAll(
            '#publications-hero img.thumb:not([data-skel]), #publications-grid img.cover:not([data-skel])'
        );
        
        images.forEach(img => {
            img.dataset.skel = '1';
            img.classList.add('pub-img-skel');
            
            if (img.complete) {
                requestAnimationFrame(() => img.classList.add('loaded'));
            } else {
                img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
                img.addEventListener('error', () => {
                    img.classList.add('loaded', 'error');
                }, { once: true });
            }
        });
    }
    
    runImageRecovery() {
        const images = document.querySelectorAll(
            '#publications-hero img.thumb, #publications-grid img.cover'
        );
        const altRoots = ['src', 'images', 'docs'];
        
        images.forEach(img => {
            if (img.getAttribute('data-img-recovery-bound') === '1') return;
            img.setAttribute('data-img-recovery-bound', '1');
            
            const tryNextPath = () => {
                const currentSrc = img.getAttribute('src') || '';
                const filename = currentSrc.split(/[/\\]/).pop();
                let attemptIndex = Number(img.getAttribute('data-fallback-idx') || '0');
                
                const candidates = altRoots
                    .map(root => `${root}/${filename}`)
                    .filter(path => !currentSrc.startsWith(path.split('/')[0] + '/'));
                
                if (attemptIndex >= candidates.length) return;
                
                img.setAttribute('data-fallback-idx', String(attemptIndex + 1));
                img.src = candidates[attemptIndex];
            };
            
            img.addEventListener('error', () => {
                if (img.complete && img.naturalWidth > 0) return;
                tryNextPath();
            });
            
            // Fallback timeout for browsers that don't fire error events
            setTimeout(() => {
                if (img.naturalWidth === 0 && !img.hasAttribute('data-fallback-idx')) {
                    tryNextPath();
                }
            }, 1200);
        });
    }
    
    render(items) {
        if (!this.heroContainer || !this.gridContainer || !Array.isArray(items)) return;
        
        this.currentPublications = this.normalizePublications(items);
        this.buildControls(this.currentPublications);
        this.renderFiltered(this.currentPublications);
    }
}