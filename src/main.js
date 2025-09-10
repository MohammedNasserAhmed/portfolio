// Main application entry point
import { themeManager } from './modules/theme-manager.js';
import { contentManager } from './modules/content-manager.js';
import { AnimationManager } from './modules/animation-manager.js';
import { SummaryComponent } from './components/summary-component.js';
import { ProjectsComponent } from './components/projects-component.js';
import { SkillsComponent } from './components/skills-component.js';
import { PublicationsComponent } from './components/publications-component.js';
import { MobileNavigation } from './components/mobile-navigation.js';
import { APP_CONFIG } from './config/app-config.js';
import { logInfo, handleError } from './utils/helpers.js';

/**
 * Main portfolio application class that orchestrates all components and modules
 * @class PortfolioApp
 */
class PortfolioApp {
    /**
     * Initialize the portfolio application
     * @constructor
     */
    constructor() {
        /** @type {Object<string, any>} Application components registry */
        this.components = {};
        
        /** @type {AnimationManager|null} Animation manager instance */
        this.animationManager = null;
        
        /** @type {boolean} Initialization state flag */
        this.isInitialized = false;
        
        /** @type {number} Initialization timeout handle */
        this.initTimeout = null;
    }
    
    /**
     * Initialize the complete application
     * @returns {Promise<void>}
     * @throws {Error} When initialization fails
     */
    async init() {
        if (this.isInitialized) {
            logInfo('Application already initialized');
            return;
        }
        
        logInfo('Initializing portfolio application...');
        
        // Set initialization timeout
        this.initTimeout = setTimeout(() => {
            handleError(new Error('Application initialization timeout'));
        }, APP_CONFIG.timeouts.initialization || 10000);
        
        try {
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize components
            this.initializeComponents();
            
            // Load and render content
            await this.loadContent();
            
            // Initialize animations and interactions
            this.initializeAnimations();
            
            // Setup accessibility features
            this.initializeAccessibility();
            
            // Setup fallback mechanisms
            this.setupFallbacks();
            
            this.isInitialized = true;
            clearTimeout(this.initTimeout);
            logInfo('Portfolio application initialized successfully');
            
        } catch (error) {
            clearTimeout(this.initTimeout);
            this.handleInitializationError(error);
            throw error;
        }
    }
    
    /**
     * Initialize core application systems
     * @returns {Promise<void>}
     * @private
     */
    async initializeCore() {
        try {
            // Theme manager is already initialized via import
            // Content manager is ready for loading
            this.animationManager = new AnimationManager();
            
            logInfo('Core systems initialized');
        } catch (error) {
            throw handleError(error, 'Failed to initialize core systems');
        }
    }
    
    initializeComponents() {
        // Initialize all UI components
        this.components.summary = new SummaryComponent();
        this.components.projects = new ProjectsComponent();
        this.components.skills = new SkillsComponent();
        this.components.publications = new PublicationsComponent();
        this.components.mobileNav = new MobileNavigation();
        
        // Initialize component DOM bindings
        Object.values(this.components).forEach(component => {
            if (component.init) {
                component.init();
            }
        });
        
        // Setup cross-component communication
        this.setupComponentInteractions();
    }
    
    setupComponentInteractions() {
        // Skills component filters affect projects display
        if (this.components.skills && this.components.projects) {
            this.components.skills.setFilterChangeCallback((activeFilters) => {
                const matchedCount = this.components.projects.filterBySkills(activeFilters);
                this.updateFilterIndicators(activeFilters, matchedCount);
                this.announceFilterChange(activeFilters);
            });
        }
    }
    
    updateFilterIndicators(filters, matchedCount) {
        const headerBox = document.getElementById('active-skill-filters');
        const clearBtn = document.getElementById('clear-skill-filters');
        
        if (!headerBox || !clearBtn) return;
        
        headerBox.innerHTML = '';
        
        if (filters.length === 0) {
            headerBox.classList.add('hidden');
            clearBtn.classList.add('hidden');
            return;
        }
        
        headerBox.classList.remove('hidden');
        clearBtn.classList.remove('hidden');
        
        filters.forEach(filter => {
            const pill = document.createElement('span');
            pill.className = 'px-2 py-1 bg-gray-700 rounded-full';
            pill.textContent = filter;
            headerBox.appendChild(pill);
        });
        
        clearBtn.textContent = `Clear Filters (${matchedCount})`;
        clearBtn.onclick = () => {
            if (this.components.skills) {
                this.components.skills.clearFilters();
            }
        };
    }
    
    announceFilterChange(filters) {
        const announcer = document.getElementById('filter-announcer');
        if (!announcer) return;
        
        if (filters.length === 0) {
            announcer.textContent = 'All projects visible';
        } else {
            announcer.textContent = `Filtered by ${filters.join(', ')}`;
        }
    }
    
    async loadContent() {
        try {
            const data = await contentManager.loadContent();
            
            // Render all sections
            if (this.components.summary && data.summary) {
                this.components.summary.render(data.summary);
            }
            
            if (this.components.projects && data.projects) {
                this.components.projects.render(data.projects);
            }
            
            if (this.components.skills && data.skills) {
                this.components.skills.render(data.skills);
            }
            
            if (this.components.publications && data.publications) {
                this.components.publications.render(data.publications);
            }
            
            logInfo('Content rendered successfully');
            
        } catch (error) {
            console.error('Failed to load content:', error);
            this.renderFallbackContent();
        }
    }
    
    renderFallbackContent() {
        // Render minimal fallback content if main content fails
        if (this.components.summary) {
            this.components.summary.render([
                { title: 'Machine Learning Engineering', body: 'Designing robust ML systems.' },
                { title: 'LLM & Retrieval', body: 'Building production-grade AI pipelines.' },
                { title: 'MLOps & Deployment', body: 'Shipping reliable, scalable models.' }
            ]);
        }
    }
    
    initializeAnimations() {
        if (this.animationManager) {
            this.animationManager.init();
        }
    }
    
    initializeAccessibility() {
        // Focus outline restoration for keyboard users
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                document.documentElement.classList.add('user-tabbing');
            }
        }, { once: true });
        
        // Skip to content link
        this.createSkipLink();
    }
    
    createSkipLink() {
        const skipLink = document.querySelector('a[href="#hero"]');
        if (skipLink) {
            skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                const target = document.getElementById('hero');
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }
    
    setupFallbacks() {
        // Ensure sections become visible even if observers fail
        setTimeout(() => {
            this.ensureVisibility();
        }, 1600);
    }
    
    ensureVisibility() {
        // Make fade-in sections visible if they're still hidden
        document.querySelectorAll('.fade-in-section:not(.is-visible)').forEach(element => {
            element.classList.add('is-visible');
        });
        
        // Ensure summary cards are visible
        const summaryContainer = document.getElementById('summary-cards');
        if (summaryContainer && summaryContainer.children.length === 0) {
            this.renderFallbackContent();
            summaryContainer.classList.add('is-visible');
        }
    }
    
    /**
     * Handle initialization errors with user-friendly display
     * @param {Error} _error - The initialization error (unused but kept for interface consistency)
     * @private
     * @returns {void}
     */
    handleInitializationError(_error) {
        // Show a minimal error state
        const errorElement = document.createElement('div');
        errorElement.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50';
        errorElement.innerHTML = `
            <div class="flex items-center gap-2">
                <span>⚠️</span>
                <span>Application initialization failed. Some features may not work.</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:opacity-75">×</button>
            </div>
        `;
        document.body.appendChild(errorElement);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 10000);
        
        // Still try to render basic content
        this.renderFallbackContent();
    }
    
    // Public API for external interactions
    getComponent(name) {
        return this.components[name];
    }
    
    getContentManager() {
        return contentManager;
    }
    
    getThemeManager() {
        return themeManager;
    }
    
    // Hot reload support for development
    async reload() {
        if (APP_CONFIG.admin.enabled()) {
            await this.loadContent();
            logInfo('Content reloaded in development mode');
        }
    }
}

// Initialize application when DOM is ready
const app = new PortfolioApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for global access (useful for dev tools)
window.portfolioApp = app;

export default app;