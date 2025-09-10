// Summary section component
import { escapeHTML, escapeAttr, hexToRgba } from '../utils/helpers.js';

export class SummaryComponent {
    constructor() {
        this.container = null;
    }
    
    init() {
        this.container = document.getElementById('summary-cards');
        if (this.container) {
            this.initInteractions();
        }
    }
    
    initInteractions() {
        if (this.container.dataset.enhanced) return;
        this.container.dataset.enhanced = 'true';
        
        // Intersection observer for reveal animation
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.container.classList.add('is-visible');
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(this.container);
        } else {
            this.container.classList.add('is-visible');
        }
        
        // Mouse tracking for card tilt effect
        this.container.addEventListener('pointermove', this.handlePointerMove.bind(this));
        this.container.addEventListener('pointerleave', this.handlePointerLeave.bind(this));
    }
    
    handlePointerMove(event) {
        const card = event.target.closest('.card-hover-effect');
        if (!card) return;
        
        const rect = card.getBoundingClientRect();
        const mx = ((event.clientX - rect.left) / rect.width) * 100;
        const my = ((event.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
        
        // Calculate tilt relative to center
        const dx = mx / 100 - 0.5;
        const dy = my / 100 - 0.5;
        
        const computedStyle = window.getComputedStyle(card);
        const maxTilt = parseFloat(computedStyle.getPropertyValue('--card-tilt-max')) || 5;
        
        card.style.setProperty('--rx', `${(-dy * maxTilt).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(dx * maxTilt).toFixed(2)}deg`);
    }
    
    handlePointerLeave() {
        const cards = this.container.querySelectorAll('.card-hover-effect');
        cards.forEach(card => {
            card.style.removeProperty('--rx');
            card.style.removeProperty('--ry');
        });
    }
    
    derivePillar(title) {
        const t = (title || '').toLowerCase();
        if (t.includes('machine')) return 'Core';
        if (t.includes('generative') || t.includes('llm')) return 'LLMs';
        if (t.includes('vector') || t.includes('retrieval')) return 'Retrieval';
        if (t.includes('pipeline') || t.includes('mlops')) return 'MLOps';
        return 'Focus';
    }
    
    getInlineIcon(name) {
        const iconMap = {
            core: "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6'><circle cx='12' cy='12' r='3'/><circle cx='12' cy='12' r='8'/></svg>",
            brain: "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M8 6a3 3 0 0 0-3 3v1.5A2.5 2.5 0 0 0 7.5 13H8v7h1a3 3 0 0 0 3-3v-4h1a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2 2 2 0 0 0-2-2h-1'/></svg>",
            retrieval: "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M3 7h18M3 12h18M3 17h18'/><path d='M8 5v4M12 10v4M16 15v4'/></svg>",
            pipeline: "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6'><rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/><rect x='3' y='14' width='7' height='7' rx='1'/><path d='M10 6h4M6.5 10v4M17.5 10v4M10 17h4'/></svg>"
        };
        
        if (!name) return null;
        const key = name.toLowerCase();
        return iconMap[key] || null;
    }
    
    render(items) {
        if (!this.container || !Array.isArray(items)) return;
        
        this.container.innerHTML = items.map((item, index) => {
            const pillar = this.derivePillar(item.title);
            const metric = item.metric || item.badge;
            
            const iconHTML = item.icon
                ? item.icon.includes('/') || item.icon.includes('.svg')
                    ? `<span class='summary-icon'><img src='${escapeAttr(item.icon)}' alt='' loading='lazy' decoding='async' /></span>`
                    : this.getInlineIcon(item.icon)
                        ? `<span class='summary-icon'>${this.getInlineIcon(item.icon)}</span>`
                        : ''
                : '';
            
            const accentFrom = item.colorFrom || item.accentFrom || item.color || '#d92323';
            const accentTo = item.colorTo || item.accentTo || 
                           (accentFrom === '#d92323' ? '#ff5858' : accentFrom);
            const tilt = typeof item.tilt === 'number' ? item.tilt : 5;
            const radial = hexToRgba(accentTo, 0.22);
            
            return `
                <div class="summary-card card-hover-effect group focus-within:outline-none" 
                     tabindex="0" 
                     data-index="${index}" 
                     style="--card-accent-from:${escapeAttr(accentFrom)};--card-accent-to:${escapeAttr(accentTo)};--card-tilt-max:${tilt}deg;--card-accent-radial:${radial};">
                    <div class="summary-card-inner">
                        ${iconHTML}
                        <span class="summary-pill" aria-hidden="true">${escapeHTML(item.pillar || pillar)}</span>
                        <h3 class="summary-title">${escapeHTML(item.title)}</h3>
                        <p class="summary-body">${escapeHTML(item.body)}</p>
                        ${metric ? `<span class='summary-metric' aria-label='Key metric'>${escapeHTML(metric)}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}