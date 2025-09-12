/**
 * Visitor Statistics Component - Tracks visitors and star ratings
 * Handles visitor counting and star rating functionality with localStorage persistence
 * @class VisitorStatsComponent
 */
export class VisitorStatsComponent {
    /**
     * Initialize the visitor stats component
     * @constructor
     */
    constructor() {
        /** @type {HTMLElement|null} Component container */
        this.container = null;

        /** @type {HTMLElement|null} Visitor count display */
        this.visitorDisplay = null;

        /** @type {HTMLElement|null} Star count display */
        this.starDisplay = null;

        /** @type {HTMLElement|null} Star button */
        this.starButton = null;

        /** @type {number} Current visitor count */
        this.visitorCount = 0;

        /** @type {number} Current star count */
        this.starCount = 0;

        /** @type {boolean} Whether user has already starred */
        this.hasUserStarred = false;

        /** @type {string} localStorage key for visitor count */
        this.VISITOR_KEY = 'portfolio_visitor_count';

        /** @type {string} localStorage key for star count */
        this.STAR_KEY = 'portfolio_star_count';

        /** @type {string} localStorage key for user star status */
        this.USER_STAR_KEY = 'portfolio_user_starred';

        /** @type {string} localStorage key for initialization flag */
        this.INIT_KEY = 'portfolio_stats_initialized';

        // Initial values as requested
        this.INITIAL_VISITORS = 109;
        this.INITIAL_STARS = 89;
    }

    /**
     * Initialize the component
     * @returns {void}
     */
    init() {
        this.loadOrInitializeData();
        this.incrementVisitorCount();
        this.createUI();
        this.attachEventListeners();
    }

    /**
     * Load existing data or initialize with default values
     * @returns {void}
     * @private
     */
    loadOrInitializeData() {
        const isInitialized = localStorage.getItem(this.INIT_KEY);

        if (!isInitialized) {
            // First time initialization
            this.visitorCount = this.INITIAL_VISITORS;
            this.starCount = this.INITIAL_STARS;
            this.hasUserStarred = false;

            // Save initial values
            localStorage.setItem(this.VISITOR_KEY, this.visitorCount.toString());
            localStorage.setItem(this.STAR_KEY, this.starCount.toString());
            localStorage.setItem(this.USER_STAR_KEY, 'false');
            localStorage.setItem(this.INIT_KEY, 'true');
        } else {
            // Load existing values
            this.visitorCount = parseInt(localStorage.getItem(this.VISITOR_KEY) || '0', 10);
            this.starCount = parseInt(localStorage.getItem(this.STAR_KEY) || '0', 10);
            this.hasUserStarred = localStorage.getItem(this.USER_STAR_KEY) === 'true';
        }
    }

    /**
     * Increment visitor count (once per session)
     * @returns {void}
     * @private
     */
    incrementVisitorCount() {
        const sessionKey = 'portfolio_session_visited';
        const hasVisitedThisSession = sessionStorage.getItem(sessionKey);

        if (!hasVisitedThisSession) {
            this.visitorCount++;
            localStorage.setItem(this.VISITOR_KEY, this.visitorCount.toString());
            sessionStorage.setItem(sessionKey, 'true');
        }
    }

    /**
     * Create the UI elements
     * @returns {void}
     * @private
     */
    createUI() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'visitor-stats flex items-center gap-4 text-sm text-gray-300';
        this.container.setAttribute('aria-label', 'Portfolio statistics');

        // Create visitor counter
        const visitorContainer = document.createElement('div');
        visitorContainer.className = 'flex items-center gap-1';
        visitorContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 21-3-3m0 0a4.5 4.5 0 1 1-6.36-6.36 4.5 4.5 0 0 1 6.36 6.36Z"/>
            </svg>
        `;

        this.visitorDisplay = document.createElement('span');
        this.visitorDisplay.textContent = this.formatNumber(this.visitorCount);
        this.visitorDisplay.setAttribute('aria-label', `${this.visitorCount} visitors`);

        visitorContainer.appendChild(this.visitorDisplay);

        // Create star rating
        const starContainer = document.createElement('div');
        starContainer.className = 'flex items-center gap-1';

        this.starButton = document.createElement('button');
        this.starButton.className = `star-button transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-red/50 rounded ${
            this.hasUserStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
        }`;
        this.starButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${
                this.hasUserStarred ? 'currentColor' : 'none'
            }" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
        `;
        this.starButton.setAttribute(
            'aria-label',
            this.hasUserStarred ? 'Remove star' : 'Give star'
        );
        this.starButton.setAttribute(
            'title',
            this.hasUserStarred ? 'Remove your star' : 'Star this portfolio'
        );

        this.starDisplay = document.createElement('span');
        this.starDisplay.textContent = this.formatNumber(this.starCount);
        this.starDisplay.setAttribute('aria-label', `${this.starCount} stars`);

        starContainer.appendChild(this.starButton);
        starContainer.appendChild(this.starDisplay);

        // Assemble the component
        this.container.appendChild(visitorContainer);
        this.container.appendChild(starContainer);
    }

    /**
     * Attach event listeners
     * @returns {void}
     * @private
     */
    attachEventListeners() {
        if (this.starButton) {
            this.starButton.addEventListener('click', this.handleStarClick.bind(this));
            this.starButton.addEventListener('keydown', this.handleStarKeydown.bind(this));
        }
    }

    /**
     * Handle star button click
     * @returns {void}
     * @private
     */
    handleStarClick() {
        this.toggleStar();
    }

    /**
     * Handle star button keydown (Enter/Space)
     * @param {KeyboardEvent} event - The keyboard event
     * @returns {void}
     * @private
     */
    handleStarKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleStar();
        }
    }

    /**
     * Toggle star state
     * @returns {void}
     * @private
     */
    toggleStar() {
        if (this.hasUserStarred) {
            // Remove star
            this.starCount--;
            this.hasUserStarred = false;
            this.starButton.classList.remove('text-yellow-400');
            this.starButton.classList.add('text-gray-400', 'hover:text-yellow-400');
            this.starButton.querySelector('svg').setAttribute('fill', 'none');
            this.starButton.setAttribute('aria-label', 'Give star');
            this.starButton.setAttribute('title', 'Star this portfolio');
        } else {
            // Add star
            this.starCount++;
            this.hasUserStarred = true;
            this.starButton.classList.remove('text-gray-400', 'hover:text-yellow-400');
            this.starButton.classList.add('text-yellow-400');
            this.starButton.querySelector('svg').setAttribute('fill', 'currentColor');
            this.starButton.setAttribute('aria-label', 'Remove star');
            this.starButton.setAttribute('title', 'Remove your star');
        }

        // Update display
        this.starDisplay.textContent = this.formatNumber(this.starCount);
        this.starDisplay.setAttribute('aria-label', `${this.starCount} stars`);

        // Save to localStorage
        localStorage.setItem(this.STAR_KEY, this.starCount.toString());
        localStorage.setItem(this.USER_STAR_KEY, this.hasUserStarred.toString());

        // Add animation effect
        this.animateStarChange();
    }

    /**
     * Animate star change
     * @returns {void}
     * @private
     */
    animateStarChange() {
        this.starButton.style.transform = 'scale(1.3)';
        setTimeout(() => {
            this.starButton.style.transform = 'scale(1)';
        }, 150);
    }

    /**
     * Format number with commas for thousands
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     * @private
     */
    formatNumber(num) {
        return num.toLocaleString();
    }

    /**
     * Get the component DOM element
     * @returns {HTMLElement|null} The component container
     */
    getElement() {
        return this.container;
    }

    /**
     * Get current visitor count
     * @returns {number} Current visitor count
     */
    getVisitorCount() {
        return this.visitorCount;
    }

    /**
     * Get current star count
     * @returns {number} Current star count
     */
    getStarCount() {
        return this.starCount;
    }

    /**
     * Check if user has starred
     * @returns {boolean} Whether user has starred
     */
    getUserStarStatus() {
        return this.hasUserStarred;
    }

    /**
     * Destroy the component and clean up
     * @returns {void}
     */
    destroy() {
        if (this.starButton) {
            this.starButton.removeEventListener('click', this.handleStarClick.bind(this));
            this.starButton.removeEventListener('keydown', this.handleStarKeydown.bind(this));
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        this.container = null;
        this.visitorDisplay = null;
        this.starDisplay = null;
        this.starButton = null;
    }
}
