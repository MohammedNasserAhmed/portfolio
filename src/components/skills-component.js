// Skills section component with progressive arc matrix
import { APP_CONFIG, SKILL_ICONS } from '../config/app-config.js';
import {
    escapeHTML,
    escapeAttr,
    createIntersectionObserver,
    handleError,
    ErrorTypes,
    validateParams,
    logInfo,
    logWarn
} from '../utils/helpers.js';

/**
 * Skills component with interactive skill matrix and filtering
 * @class SkillsComponent
 */
export class SkillsComponent {
    /**
     * Create a skills component instance
     * @constructor
     */
    constructor() {
        /** @type {HTMLElement|null} Main skills container */
        this.container = null;

        /** @type {HTMLElement|null} Category pills container */
        this.pillsContainer = null;

        /** @type {Set<string>} Currently active skill filters */
        this.activeFilters = new Set();

        /** @type {string|null} Last clicked skill for analytics */
        this.lastClickedSkill = null;

        /** @type {HTMLElement|null} Tooltip element */
        this.tooltip = null;

        /** @type {Function|null} Filter change callback */
        this.onFilterChange = null;

        /** @type {boolean} Component initialization state */
        this.isInitialized = false;

        logInfo('SkillsComponent created');
    }

    /**
     * Initialize the skills component
     * @returns {void}
     * @throws {Error} When required DOM elements are missing
     */
    init() {
        if (this.isInitialized) {
            logInfo('SkillsComponent already initialized');
            return;
        }

        try {
            this.container = document.getElementById('skills-track');
            this.pillsContainer = document.getElementById('skill-category-pills');

            if (!this.container) {
                throw new Error('Skills container element not found');
            }

            if (!this.pillsContainer) {
                logWarn('Category pills container not found, some functionality may be limited');
            }

            this.initTooltip();
            this.restoreFilters();

            this.isInitialized = true;
            logInfo('SkillsComponent initialized successfully');
        } catch (error) {
            throw handleError(error, 'Failed to initialize SkillsComponent', ErrorTypes.COMPONENT);
        }
    }

    /**
     * Restore filters from localStorage
     * @private
     * @returns {void}
     */
    restoreFilters() {
        try {
            const stored = localStorage.getItem(APP_CONFIG.skills.filterStorageKey);
            if (stored) {
                const filters = JSON.parse(stored);
                if (Array.isArray(filters)) {
                    filters.forEach((skill) => {
                        if (typeof skill === 'string') {
                            this.activeFilters.add(skill);
                        }
                    });
                    logInfo(`Restored ${filters.length} skill filters`);
                }
            }
        } catch (error) {
            logWarn('Failed to restore skill filters:', error.message);
        }
    }

    /**
     * Persist current filters to localStorage
     * @private
     * @returns {void}
     */
    persistFilters() {
        try {
            localStorage.setItem(
                APP_CONFIG.skills.filterStorageKey,
                JSON.stringify(Array.from(this.activeFilters))
            );
        } catch (error) {
            logWarn('Failed to persist skill filters:', error.message);
        }
    }

    /**
     * Initialize tooltip element
     * @private
     * @returns {void}
     */
    initTooltip() {
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'skill-tooltip';
            document.body.appendChild(this.tooltip);
        }
    }

    normalizeSkills(items) {
        return items.map((item, index) => {
            if (typeof item === 'string') {
                return { name: item };
            }

            const skill = {
                name: item.name || String(item),
                percent: item.percent,
                category: item.category,
                level: item.level,
                xp: item.xp
            };

            // Generate deterministic percentage if missing
            if (typeof skill.percent !== 'number') {
                const base = 58;
                skill.percent = Math.min(97, base + ((index * 7) % 42));
            }

            // Determine category if missing
            if (!skill.category) {
                skill.category = this.determineCategory(skill.name);
            }

            return skill;
        });
    }

    determineCategory(skillName) {
        const categoryMap = {
            python: 'ML/AI',
            pytorch: 'ML/AI',
            tensorflow: 'ML/AI',
            'scikit-learn': 'ML/AI',
            pandas: 'Data',
            docker: 'DevOps',
            sql: 'Data',
            'apache spark': 'Data',
            spark: 'Data',
            mlflow: 'MLOps',
            'hugging face transformers': 'LLM',
            ollama: 'LLM',
            'peft/lora': 'LLM',
            llamaindex: 'Retrieval',
            chromadb: 'VectorDB',
            milvus: 'VectorDB',
            langgraph: 'Orchestration',
            crewai: 'Agents',
            docling: 'OCR/Parsing',
            tesseract: 'OCR'
        };

        const key = skillName.toLowerCase();
        return categoryMap[key] || 'General';
    }

    getPerformanceBand(percent) {
        if (percent < 60) return 'low';
        if (percent < 80) return 'mid';
        if (percent < 92) return 'high';
        return 'top';
    }

    createSkillArc(skill, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'skill-arc';
        wrapper.dataset.index = String(index);
        wrapper.dataset.category = skill.category;
        wrapper.setAttribute('role', 'progressbar');
        wrapper.setAttribute('aria-label', `${skill.name} proficiency`);
        wrapper.setAttribute('aria-valuemin', '0');
        wrapper.setAttribute('aria-valuemax', '100');
        wrapper.setAttribute('aria-valuenow', String(skill.percent));
        wrapper.dataset.band = this.getPerformanceBand(skill.percent);

        const figure = document.createElement('figure');
        figure.style.margin = '0';
        figure.style.display = 'flex';
        figure.style.flexDirection = 'column';
        figure.style.alignItems = 'center';

        // Create SVG
        const svg = this.createProgressSVG(skill);
        figure.appendChild(svg);

        // Create skill button
        const button = this.createSkillButton(skill);
        figure.appendChild(button);

        // Create percentage display
        const percentSpan = document.createElement('span');
        percentSpan.className = 'skill-percent';
        percentSpan.textContent = '0%';
        percentSpan.dataset.target = String(skill.percent);
        figure.appendChild(percentSpan);

        // Create name label
        const nameSpan = document.createElement('span');
        nameSpan.className = 'skill-name';
        nameSpan.textContent = skill.name;
        figure.appendChild(nameSpan);

        wrapper.appendChild(figure);
        return wrapper;
    }

    createProgressSVG(skill) {
        const radius = 30;
        const outerRadius = 34;
        const circumference = 2 * Math.PI * radius;
        const outerCircumference = 2 * Math.PI * outerRadius;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 90 90');
        svg.classList.add('arc-svg');

        // Outer ambient track
        const outerTrack = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerTrack.setAttribute('class', 'ring-outer');
        outerTrack.setAttribute('cx', '45');
        outerTrack.setAttribute('cy', '45');
        outerTrack.setAttribute('r', String(outerRadius));
        outerTrack.style.strokeDasharray = `${outerCircumference}`;
        outerTrack.style.strokeDashoffset = '0';

        // Background track
        const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        track.setAttribute('class', 'ring-track');
        track.setAttribute('cx', '45');
        track.setAttribute('cy', '45');
        track.setAttribute('r', String(radius));
        track.style.strokeDasharray = `${circumference}`;
        track.style.strokeDashoffset = '0';

        // Progress ring
        const progress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progress.setAttribute('class', 'ring-progress');
        progress.setAttribute('cx', '45');
        progress.setAttribute('cy', '45');
        progress.setAttribute('r', String(radius));
        progress.style.strokeDasharray = `${circumference}`;
        progress.style.strokeDashoffset = `${circumference}`;
        progress.style.transformOrigin = '50% 50%';
        progress.style.transform = 'rotate(-90deg)';
        progress.setAttribute(
            'data-target-offset',
            String(circumference * (1 - skill.percent / 100))
        );
        progress.setAttribute('stroke', 'url(#grad-accent)');

        svg.appendChild(outerTrack);
        svg.appendChild(track);
        svg.appendChild(progress);

        return svg;
    }

    createSkillButton(skill) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'skill-item';
        button.setAttribute('data-skill', skill.name);
        button.setAttribute('data-category', skill.category);
        button.setAttribute('aria-label', `${skill.name} skill icon`);

        const iconSrc = SKILL_ICONS[skill.name];
        if (iconSrc) {
            button.innerHTML = `<img src="${escapeAttr(iconSrc)}" alt="${escapeAttr(skill.name)} logo" loading="lazy"/>`;
        } else {
            button.textContent = skill.name[0] || '?';
        }

        const tooltip = `${skill.name} — ${skill.level || ''} (${skill.percent}%)\nXP: ${skill.xp || 'n/a'}\nCategory: ${skill.category}`;
        button.setAttribute('data-tooltip', tooltip.trim());

        button.addEventListener('click', (e) => this.handleSkillClick(e, skill.name));

        return button;
    }

    handleSkillClick(event, skillName) {
        const isMultiSelect = event.ctrlKey || event.metaKey;
        const isRangeSelect = event.shiftKey;

        if (isRangeSelect && this.lastClickedSkill) {
            this.handleRangeSelection(skillName);
        } else if (
            !isMultiSelect &&
            !this.activeFilters.has(skillName) &&
            this.activeFilters.size <= 1
        ) {
            this.activeFilters.clear();
            this.activeFilters.add(skillName);
        } else if (isMultiSelect) {
            if (this.activeFilters.has(skillName)) {
                this.activeFilters.delete(skillName);
            } else {
                this.activeFilters.add(skillName);
            }
        } else if (this.activeFilters.has(skillName) && this.activeFilters.size === 1) {
            this.activeFilters.clear();
        } else {
            this.activeFilters.clear();
            this.activeFilters.add(skillName);
        }

        this.lastClickedSkill = skillName;
        this.updateVisualState();
        this.persistFilters();

        if (this.onFilterChange) {
            this.onFilterChange(Array.from(this.activeFilters));
        }
    }

    handleRangeSelection(endSkill) {
        const skillButtons = Array.from(this.container.querySelectorAll('[data-skill]'));
        const startIndex = skillButtons.findIndex(
            (btn) => btn.getAttribute('data-skill') === this.lastClickedSkill
        );
        const endIndex = skillButtons.findIndex(
            (btn) => btn.getAttribute('data-skill') === endSkill
        );

        if (startIndex !== -1 && endIndex !== -1) {
            const [start, end] =
                startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
            for (let i = start; i <= end; i++) {
                this.activeFilters.add(skillButtons[i].getAttribute('data-skill'));
            }
        } else {
            this.activeFilters.add(endSkill);
        }
    }

    updateVisualState() {
        const skillArcs = this.container.querySelectorAll('.skill-arc');
        const filters = Array.from(this.activeFilters);

        skillArcs.forEach((arc) => {
            const skillName = arc.querySelector('[data-skill]')?.getAttribute('data-skill');
            if (filters.length === 0) {
                arc.removeAttribute('data-selected');
            } else if (skillName && this.activeFilters.has(skillName)) {
                arc.setAttribute('data-selected', 'true');
            } else {
                arc.removeAttribute('data-selected');
            }
        });
    }

    buildCategoryPills(skills) {
        if (!this.pillsContainer) return;

        const categories = Array.from(new Set(skills.map((skill) => skill.category)));
        this.pillsContainer.innerHTML = '';

        categories.forEach((category) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'skill-cat-pill';
            button.textContent = category;
            button.setAttribute('data-category', category);
            button.setAttribute('aria-pressed', 'false');

            button.addEventListener('click', () => this.handleCategoryClick(category, skills));
            this.pillsContainer.appendChild(button);
        });
    }

    handleCategoryClick(category, skills) {
        const skillsInCategory = skills
            .filter((skill) => skill.category === category)
            .map((skill) => skill.name);

        const allSelected = skillsInCategory.every((skill) => this.activeFilters.has(skill));

        if (allSelected) {
            skillsInCategory.forEach((skill) => this.activeFilters.delete(skill));
        } else {
            skillsInCategory.forEach((skill) => this.activeFilters.add(skill));
        }

        this.updateVisualState();
        this.updateCategoryPillStates(skills);
        this.persistFilters();

        if (this.onFilterChange) {
            this.onFilterChange(Array.from(this.activeFilters));
        }
    }

    updateCategoryPillStates(skills) {
        const pills = this.pillsContainer.querySelectorAll('button[data-category]');
        pills.forEach((pill) => {
            const category = pill.getAttribute('data-category');
            const skillsInCategory = skills
                .filter((skill) => skill.category === category)
                .map((skill) => skill.name);
            const allSelected = skillsInCategory.every((skill) => this.activeFilters.has(skill));

            pill.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
            pill.classList.toggle('active', allSelected);
        });
    }

    initTooltipHandlers() {
        this.container.addEventListener('pointerover', this.handleTooltipShow.bind(this));
        this.container.addEventListener('pointerout', this.handleTooltipHide.bind(this));
        this.container.addEventListener('pointerdown', () => this.tooltip.classList.remove('show'));
    }

    handleTooltipShow(event) {
        const button = event.target.closest('button.skill-item');
        if (!button) return;

        const data = button.getAttribute('data-tooltip');
        if (!data) return;

        const skillName = button.getAttribute('data-skill');
        const arc = button.closest('.skill-arc');
        const percent = arc?.getAttribute('aria-valuenow') || '';
        const category = button.getAttribute('data-category') || '';

        const lines = data.split(/\n+/);
        const levelLine = lines[0];
        const xpLine = lines.find((line) => /^XP:/i.test(line));

        this.tooltip.innerHTML = `
            <div class="tt-head">
                <span>${escapeHTML(skillName || '')}</span>
                <span class="pct">${percent}%</span>
            </div>
            <div class="tt-meta">
                ${category ? `<span>${escapeHTML(category)}</span>` : ''}
                ${levelLine ? `<span>${escapeHTML(levelLine.replace(/^.*—/, '').replace(/\(.*/, '').trim())}</span>` : ''}
                ${xpLine ? `<span>${escapeHTML(xpLine.replace('XP:', '').trim())}</span>` : ''}
            </div>
        `;

        this.tooltip.classList.add('show');
        this.positionTooltip(event);

        window.addEventListener('pointermove', this.handleTooltipMove.bind(this), {
            passive: true
        });
    }

    handleTooltipMove(event) {
        this.positionTooltip(event);
    }

    handleTooltipHide(event) {
        if (event.relatedTarget?.closest('.skill-item')) return;
        this.tooltip.classList.remove('show');
        window.removeEventListener('pointermove', this.handleTooltipMove.bind(this));
    }

    positionTooltip(event) {
        const pad = 14;
        let x = event.clientX + pad;
        let y = event.clientY + pad;

        const rect = this.tooltip.getBoundingClientRect();
        if (x + rect.width + 8 > window.innerWidth) {
            x = event.clientX - rect.width - pad;
        }
        if (y + rect.height + 8 > window.innerHeight) {
            y = event.clientY - rect.height - pad;
        }

        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = y + 'px';
    }

    animateProgressRings() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const observer = createIntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const element = entry.target;
                    element.classList.add('reveal');

                    const progressRing = element.querySelector('circle.ring-progress');
                    const percentSpan = element.querySelector('.skill-percent');

                    if (progressRing) {
                        const targetOffset = progressRing.getAttribute('data-target-offset');
                        if (prefersReducedMotion) {
                            progressRing.style.strokeDashoffset = targetOffset;
                        } else {
                            requestAnimationFrame(() => {
                                progressRing.style.strokeDashoffset = targetOffset;
                            });
                        }
                    }

                    if (percentSpan) {
                        this.animateCountUp(
                            percentSpan,
                            Number(percentSpan.dataset.target || '0'),
                            prefersReducedMotion
                        );
                    }

                    observer.unobserve(element);
                });
            },
            { threshold: 0.25 }
        );

        this.container.querySelectorAll('.skill-arc').forEach((arc) => observer.observe(arc));
    }

    animateCountUp(element, target, reduced) {
        if (reduced) {
            element.textContent = target + '%';
            return;
        }

        const duration = 1100;
        const start = performance.now();

        const animate = (timestamp) => {
            const progress = Math.min(1, (timestamp - start) / duration);
            const eased = progress * (2 - progress); // easeOutQuad
            element.textContent = Math.round(eased * target) + '%';

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Render skills data with type validation and error handling
     * @param {Array<Object>} items - Array of skill objects
     * @param {string} items[].name - Skill name (required)
     * @param {number} [items[].percent] - Proficiency percentage (0-100)
     * @param {string} [items[].category] - Skill category
     * @param {string} [items[].level] - Skill level description
     * @param {string} [items[].xp] - Experience duration
     * @returns {void}
     * @throws {Error} When invalid data is provided
     */
    render(items) {
        try {
            // Validate input parameters
            validateParams(
                { items },
                {
                    items: {
                        required: true,
                        type: 'array',
                        validate: (arr) => arr.length > 0
                    }
                }
            );

            if (!this.container) {
                throw new Error('Skills container not initialized');
            }

            // Validate skill objects
            items.forEach((item, index) => {
                if (!item || typeof item !== 'object') {
                    throw new Error(`Invalid skill object at index ${index}`);
                }

                if (!item.name || typeof item.name !== 'string') {
                    throw new Error(`Skill at index ${index} missing valid name`);
                }

                if (
                    item.percent !== undefined &&
                    (typeof item.percent !== 'number' || item.percent < 0 || item.percent > 100)
                ) {
                    logWarn(
                        `Invalid percent value for skill '${item.name}', will be auto-generated`
                    );
                }
            });

            this.container.className = 'skills-matrix progressive-arcs';
            const normalizedSkills = this.normalizeSkills(items);

            // Rest of render logic...
            this.buildSkillsMatrix(normalizedSkills);
            this.buildCategoryPills(normalizedSkills);
            this.initTooltipHandlers();
            this.initScrollAnimations();

            logInfo(`Rendered ${normalizedSkills.length} skills successfully`);
        } catch (error) {
            handleError(error, 'Failed to render skills component', ErrorTypes.COMPONENT);

            // Render fallback content
            this.renderFallback();
        }
    }

    /**
     * Build the skills matrix with proper error handling
     * @private
     * @param {Array<Object>} skills - Normalized skills array
     * @returns {void}
     */
    buildSkillsMatrix(skills) {
        if (!skills || !Array.isArray(skills)) {
            throw new Error('Invalid skills array provided to buildSkillsMatrix');
        }

        const skillElements = skills
            .map((skill, index) => {
                try {
                    return this.createSkillArc(skill, index);
                } catch (error) {
                    logWarn(`Failed to create skill arc for '${skill.name}':`, error.message);
                    return null;
                }
            })
            .filter(Boolean);

        this.container.innerHTML = '';
        skillElements.forEach((element) => this.container.appendChild(element));
    }

    /**
     * Render fallback content when main rendering fails
     * @private
     * @returns {void}
     */
    renderFallback() {
        if (!this.container) return;

        const fallbackSkills = [
            { name: 'Python', percent: 92, category: 'ML/AI' },
            { name: 'PyTorch', percent: 88, category: 'ML/AI' },
            { name: 'LLMs', percent: 95, category: 'LLM' },
            { name: 'Docker', percent: 80, category: 'DevOps' }
        ];

        try {
            this.buildSkillsMatrix(fallbackSkills);
            logInfo('Rendered fallback skills content');
        } catch (error) {
            // Ultimate fallback - simple text list
            this.container.innerHTML = `
                <div class="skills-fallback">
                    <p>Core Skills: Python, PyTorch, LLMs, Docker</p>
                </div>
            `;
            logWarn('Rendered minimal fallback skills');
        }
    }

    /**
     * Set callback function for filter change events
     * @param {Function} callback - Function called when filters change
     * @returns {void}
     */
    setFilterChangeCallback(callback) {
        this.onFilterChange = callback;
    }

    /**
     * Get current active filters
     * @returns {string[]} Array of active filter names
     */
    getActiveFilters() {
        return Array.from(this.activeFilters);
    }

    /**
     * Clear all active filters
     * @returns {void}
     */
    clearFilters() {
        this.activeFilters.clear();
        this.updateVisualState();
        this.persistFilters();

        if (this.onFilterChange) {
            this.onFilterChange([]);
        }
    }

    /**
     * Initialize scroll-based animations for skill elements
     * @private
     * @returns {void}
     */
    initScrollAnimations() {
        const skillArcs = this.container.querySelectorAll('.skill-arc');

        const observer = createIntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        skillArcs.forEach((arc) => observer.observe(arc));
    }
}
