// ES Module Bundle
const moduleRegistry = new Map();
const moduleCache = new Map();


function loadModule(id) {
    if (moduleCache.has(id)) {
        return moduleCache.get(id).exports;
    }
    
    const moduleFactory = moduleRegistry.get(id);
    if (!moduleFactory) {
        throw new Error('Module not found: ' + id);
    }
    
    const module = { exports: {} };
    const exports = module.exports;
    
    const require = (request) => {
        // Handle relative imports
        if (typeof request === 'number') {
            return loadModule(request);
        }
        throw new Error('Dynamic imports not supported: ' + request);
    };
    
    moduleCache.set(id, module);
    moduleFactory(module, exports, require);
    
    return module.exports;
}

// Module 0: main.js
moduleRegistry.set(0, function(module, exports, require) {
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
import { logInfo } from './utils/helpers.js';

class PortfolioApp {
    constructor() {
        this.components = {};
        this.animationManager = null;
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        logInfo('Initializing portfolio application...');
        
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
            logInfo('Portfolio application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize portfolio application:', error);
            this.handleInitializationError(error);
        }
    }
    
    async initializeCore() {
        // Theme manager is already initialized via import
        // Content manager is ready for loading
        this.animationManager = new AnimationManager();
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
    
    handleInitializationError(error) {
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

module.exports = app;;
});

// Module 1: modules\theme-manager.js
moduleRegistry.set(1, function(module, exports, require) {
// Theme management module
import { APP_CONFIG } from '../config/app-config.js';

class ThemeManager {
    constructor() {
        this.root = document.documentElement;
        this.storageKey = APP_CONFIG.theme.storageKey;
        this.toggleButton = null;
        this.toggleButtonMobile = null;
        this.iconElement = null;
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.initTheme();
        this.bindEvents();
    }
    
    bindElements() {
        this.toggleButton = document.getElementById('theme-toggle');
        this.toggleButtonMobile = document.getElementById('theme-toggle-mobile');
        this.iconElement = document.getElementById('theme-toggle-icon');
    }
    
    bindEvents() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleTheme());
        }
        
        if (this.toggleButtonMobile) {
            this.toggleButtonMobile.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    getCurrentMode() {
        return this.root.classList.contains('light') ? 'light' : 'dark';
    }
    
    applyTheme(mode) {
        if (mode === 'light') {
            this.root.classList.add('light');
            if (this.iconElement) this.iconElement.textContent = '🌞';
        } else {
            this.root.classList.remove('light');
            if (this.iconElement) this.iconElement.textContent = '🌙';
        }
    }
    
    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    
    getStoredTheme() {
        try {
            return localStorage.getItem(this.storageKey);
        } catch (e) {
            return null;
        }
    }
    
    storeTheme(mode) {
        try {
            localStorage.setItem(this.storageKey, mode);
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    initTheme() {
        const stored = this.getStoredTheme();
        const mode = stored || this.getSystemPreference() || APP_CONFIG.theme.default;
        this.applyTheme(mode);
    }
    
    toggleTheme() {
        const currentMode = this.getCurrentMode();
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        this.applyTheme(newMode);
        this.storeTheme(newMode);
    }
    
    setTheme(mode) {
        this.applyTheme(mode);
        this.storeTheme(mode);
    }
}

// Export singleton instance
const themeManager = new ThemeManager();
});

// Module 2: config\app-config.js
moduleRegistry.set(2, function(module, exports, require) {
// Application configuration and constants
const APP_CONFIG = {
    // Theme configuration
    theme: {
        storageKey: 'portfolio-theme',
        default: 'dark'
    },
    
    // Content configuration
    content: {
        basePath: {
            en: 'data/content.json',
            ar: '../data/content.ar.json'
        },
        cacheBustParam: true
    },
    
    // Animation configuration
    animation: {
        typing: {
            words: ['LLM Specialist', 'AI Researcher', 'Problem Solver'],
            typeSpeed: 120,
            deleteSpeed: 80,
            delay: 1200
        },
        
        // Starfield configuration
        starfield: {
            starCount: 4000,
            starSpeed: 0.0002,
            rotationSpeed: 0.0001,
            mouseInfluence: 0.00005
        },
        
        // Particles configuration
        particles: {
            baseCount: 32,
            idleTimeout: 5000,
            speedRange: [0.0006, 0.0012],
            sizeRange: [1, 2]
        }
    },
    
    // Skills configuration
    skills: {
        filterStorageKey: 'portfolio-skill-filters-v1',
        categoryColors: {
            'ML/AI': '#d92323',
            'LLM': '#ff5858',
            'Data': '#ff914d',
            'DevOps': '#8a8a8a',
            'VectorDB': '#ff6b6b',
            'Retrieval': '#d92323',
            'Orchestration': '#ff914d',
            'Agents': '#8a8a8a',
            'OCR/Parsing': '#ff5858',
            'OCR': '#ff5858',
            'MLOps': '#ff914d',
            'Generative': '#d92323'
        }
    },
    
    // Admin/Dev configuration
    admin: {
        token: 'dev',
        enabled: () => {
            const hash = window.location.hash;
            const token = hash === '#admin' ? 'dev' : 
                         hash.startsWith('#admin=') ? hash.split('=')[1] || '' : null;
            const isProduction = /github\.io$/i.test(window.location.hostname);
            return !isProduction && token === 'dev';
        }
    },
    
    // Build configuration
    build: {
        version: window.BUILD_VERSION || '',
        assetVersionMeta: 'asset-version'
    }
};

// Performance and accessibility preferences
const PERFORMANCE_CONFIG = {
    // Intersection Observer thresholds
    observers: {
        fadeIn: { threshold: 0.2, rootMargin: '0px 0px -50px 0px' },
        sections: { threshold: 0.35, rootMargin: '0px 0px -10%' },
        hero: { threshold: 0.05 },
        skills: { threshold: 0.25 }
    },
    
    // Animation preferences
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Debounce delays
    debounce: {
        search: 300,
        resize: 150,
        scroll: 100
    }
};

// Icon mappings
const SKILL_ICONS = {
    Python: 'images/skills/python.svg',
    PyTorch: 'images/skills/pytorch.svg',
    TensorFlow: 'images/skills/tensorflow.svg',
    'Scikit-learn': 'images/skills/scikit-learn.svg',
    Pandas: 'images/skills/pandas.svg',
    Docker: 'images/skills/docker.svg',
    SQL: 'images/skills/sql.svg',
    'Apache Spark': 'images/skills/spark.svg',
    MLflow: 'images/skills/mlflow.svg',
    'Hugging Face Transformers': 'images/skills/huggingface.svg',
    Diffusers: 'images/skills/diffusers.svg',
    'Neural Networks': 'images/skills/neural-networks.svg',
    Ollama: 'images/skills/ollama.svg',
    'PEFT/LoRA': 'images/skills/peft-lora.svg',
    LlamaIndex: 'images/skills/llamaindex.svg',
    ChromaDB: 'images/skills/chromadb.svg',
    Milvus: 'images/skills/milvus.svg',
    LangGraph: 'images/skills/langgraph.svg',
    CrewAI: 'images/skills/crewai.svg',
    Docling: 'images/skills/docling.svg',
    Tesseract: 'images/skills/tesseract.svg'
};
});

// Module 3: modules\content-manager.js
moduleRegistry.set(3, function(module, exports, require) {
// Content loading and management module
const { APP_CONFIG: APP_CONFIG } = loadModule(2);
import { getContentPath, logInfo, logWarn } from '../utils/helpers.js';

class ContentManager {
    constructor() {
        this.data = null;
        this.isLoading = false;
        this.callbacks = new Map();
    }
    
    async loadContent() {
        if (this.isLoading) {
            return this.data;
        }
        
        if (this.data) {
            return this.data;
        }
        
        this.isLoading = true;
        
        try {
            const contentPath = getContentPath(APP_CONFIG.content.basePath);
            logInfo('Fetching content:', contentPath);
            
            const response = await fetch(contentPath, { cache: 'no-store' });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.data = await response.json();
            logInfo('Content loaded. Summary items:', (this.data.summary || []).length);
            
            // Expose for dev overlay
            window.__PORTFOLIO_DATA__ = this.data;
            
            // Trigger callbacks
            this.triggerCallbacks('loaded', this.data);
            
            return this.data;
            
        } catch (error) {
            logWarn('Content fetch failed:', error);
            
            // Return fallback content
            this.data = this.getFallbackContent();
            this.triggerCallbacks('error', error);
            
            return this.data;
        } finally {
            this.isLoading = false;
        }
    }
    
    getFallbackContent() {
        return {
            summary: [
                { 
                    title: 'Machine Learning Engineering', 
                    body: 'Designing robust ML systems.' 
                },
                { 
                    title: 'LLM & Retrieval', 
                    body: 'Building production-grade AI pipelines.' 
                },
                { 
                    title: 'MLOps & Deployment', 
                    body: 'Shipping reliable, scalable models.' 
                }
            ],
            projects: [],
            skills: [],
            publications: [],
            outreach: []
        };
    }
    
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.callbacks.has(event)) {
            const callbacks = this.callbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    triggerCallbacks(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    logWarn(`Callback error for event ${event}:`, error);
                }
            });
        }
    }
    
    updateContent(newData) {
        this.data = { ...this.data, ...newData };
        window.__PORTFOLIO_DATA__ = this.data;
        this.triggerCallbacks('updated', this.data);
    }
    
    getSection(sectionName) {
        return this.data ? this.data[sectionName] || [] : [];
    }
    
    getSummary() {
        return this.getSection('summary');
    }
    
    getProjects() {
        return this.getSection('projects');
    }
    
    getSkills() {
        return this.getSection('skills');
    }
    
    getPublications() {
        return this.getSection('publications');
    }
    
    getOutreach() {
        return this.getSection('outreach');
    }
}

// Export singleton instance
const contentManager = new ContentManager();
});

// Module 4: utils\helpers.js
moduleRegistry.set(4, function(module, exports, require) {
// Utility functions for common operations
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
    return escapeHTML(str).replace(/`/g, '&#96;');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string') return `rgba(255,88,88,${alpha})`;
    const h = hex.replace('#', '');
    if (![3, 6].includes(h.length)) return `rgba(255,88,88,${alpha})`;
    
    const full = h.length === 3 
        ? h.split('').map(c => c + c).join('') 
        : h;
    
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    
    return `rgba(${r},${g},${b},${alpha})`;
}

function createIntersectionObserver(callback, options = {}) {
    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers without IntersectionObserver
        return {
            observe: (element) => {
                setTimeout(() => callback([{ target: element, isIntersecting: true }]), 100);
            },
            unobserve: () => {},
            disconnect: () => {}
        };
    }
    
    return new IntersectionObserver(callback, options);
}

function getCurrentLanguage() {
    return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

function getContentPath(basePath) {
    const lang = getCurrentLanguage();
    const path = lang === 'ar' ? basePath.ar : basePath.en;
    
    // Add cache busting if enabled
    const buildVersion = window.BUILD_VERSION;
    return buildVersion ? `${path}?v=${buildVersion}` : path;
}

function logInfo(message, ...args) {
    if (console && console.info) {
        console.info(`[portfolio] ${message}`, ...args);
    }
}

function logWarn(message, ...args) {
    if (console && console.warn) {
        console.warn(`[portfolio] ${message}`, ...args);
    }
}

function createDOMElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
        element.className = options.className;
    }
    
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
    }
    
    if (options.textContent) {
        element.textContent = options.textContent;
    }
    
    return element;
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString; // Return original if parsing fails
    }
}
});

// Module 5: modules\animation-manager.js
moduleRegistry.set(5, function(module, exports, require) {
// Animation and effects manager
const { APP_CONFIG: APP_CONFIG, PERFORMANCE_CONFIG: PERFORMANCE_CONFIG } = loadModule(2);

class AnimationManager {
    constructor() {
        this.prefersReducedMotion = PERFORMANCE_CONFIG.prefersReducedMotion();
        this.animationFrameId = null;
        this.activeAnimations = new Map();
    }
    
    // Typing animation for hero section
    initTypingAnimation() {
        const typingElement = document.querySelector('#hero-title .gradient-text');
        if (!typingElement) return;
        
        const config = APP_CONFIG.animation.typing;
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const type = () => {
            const currentWord = config.words[wordIndex];
            
            // Respect reduced motion preference
            if (this.prefersReducedMotion) {
                if (!typingElement.textContent) {
                    typingElement.textContent = currentWord;
                }
                return;
            }
            
            const displayText = currentWord.substring(0, charIndex);
            typingElement.innerHTML = `${displayText}<span class="typewriter-cursor" aria-hidden="true"></span>`;
            
            if (!isDeleting && charIndex < currentWord.length) {
                charIndex++;
                setTimeout(type, config.typeSpeed);
            } else if (isDeleting && charIndex > 0) {
                charIndex--;
                setTimeout(type, config.deleteSpeed);
            } else {
                isDeleting = !isDeleting;
                if (!isDeleting) {
                    wordIndex = (wordIndex + 1) % config.words.length;
                }
                setTimeout(type, config.delay);
            }
        };
        
        type();
    }
    
    // Three.js starfield background
    initStarfield() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas || typeof THREE === 'undefined' || this.prefersReducedMotion) {
            return;
        }
        
        const config = APP_CONFIG.animation.starfield;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.z = 1;
        camera.rotation.x = Math.PI / 2;
        
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Create starfield
        const starGeo = new THREE.BufferGeometry();
        const posArray = new Float32Array(config.starCount * 3);
        for (let i = 0; i < posArray.length; i++) {
            posArray[i] = (Math.random() - 0.5) * 5;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.005,
            transparent: true
        });
        
        const stars = new THREE.Points(starGeo, starMaterial);
        scene.add(stars);
        
        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        
        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        
        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        window.addEventListener('resize', handleResize, { passive: true });
        
        // Animation loop
        const animate = () => {
            stars.position.y -= config.starSpeed;
            stars.rotation.y += config.rotationSpeed;
            
            if (mouseX > 0) {
                stars.rotation.x = -mouseY * config.mouseInfluence;
                stars.rotation.y = -mouseX * config.mouseInfluence;
            }
            
            renderer.render(scene, camera);
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Store cleanup function
        this.activeAnimations.set('starfield', () => {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        });
    }
    
    // Fade-in animation for sections
    initFadeInAnimations() {
        const elements = document.querySelectorAll('.fade-in-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, PERFORMANCE_CONFIG.observers.fadeIn);
        
        elements.forEach(element => observer.observe(element));
        
        // Fallback for browsers without IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            elements.forEach(element => element.classList.add('is-visible'));
        }
    }
    
    // Section heading animations with word rotation
    initSectionHeadings() {
        const headings = document.querySelectorAll('.section-head[data-sh]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.setAttribute('data-inview', 'true');
                    this.startAccentRotation(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, PERFORMANCE_CONFIG.observers.sections);
        
        headings.forEach(heading => observer.observe(heading));
        
        // Fallback
        if (!('IntersectionObserver' in window)) {
            headings.forEach(heading => {
                heading.setAttribute('data-inview', 'true');
                this.startAccentRotation(heading);
            });
        }
    }
    
    startAccentRotation(headElement) {
        const accent = headElement.querySelector('.sh-accent[data-words]');
        if (!accent) return;
        
        const words = accent.getAttribute('data-words')
            .split('|')
            .map(w => w.trim())
            .filter(Boolean);
            
        if (words.length <= 1 || this.prefersReducedMotion) return;
        
        let index = 0;
        accent.textContent = words[0];
        accent.dataset.rotating = 'true';
        
        const rotateWords = () => {
            accent.classList.add('sh-rotate-out');
            
            setTimeout(() => {
                index = (index + 1) % words.length;
                accent.textContent = words[index];
                accent.classList.remove('sh-rotate-out');
                accent.classList.add('sh-rotate-in');
            }, 480);
            
            setTimeout(rotateWords, 3400);
        };
        
        setTimeout(rotateWords, 3400);
    }
    
    // Initialize all animations
    init() {
        // Use requestIdleCallback if available for better performance
        const runAnimations = () => {
            this.initFadeInAnimations();
            this.initSectionHeadings();
            this.initTypingAnimation();
            this.initStarfield();
        };
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(runAnimations, { timeout: 2000 });
        } else {
            setTimeout(runAnimations, 200);
        }
    }
    
    // Cleanup all animations
    destroy() {
        this.activeAnimations.forEach(cleanup => cleanup());
        this.activeAnimations.clear();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

exports.AnimationManager = AnimationManager;;
});

// Module 6: components\summary-component.js
moduleRegistry.set(6, function(module, exports, require) {
// Summary section component
const { escapeHTML: escapeHTML, escapeAttr: escapeAttr, hexToRgba: hexToRgba } = loadModule(4);

class SummaryComponent {
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
});

// Module 7: components\projects-component.js
moduleRegistry.set(7, function(module, exports, require) {
// Projects section component
const { escapeHTML: escapeHTML, escapeAttr: escapeAttr } = loadModule(4);

class ProjectsComponent {
    constructor() {
        this.container = null;
        this.wrapper = null;
    }
    
    init() {
        this.container = document.getElementById('projects-grid');
        this.wrapper = document.getElementById('projects-carousel');
    }
    
    render(items) {
        if (!this.container || !Array.isArray(items)) return;
        
        const isAutoCarousel = this.wrapper && this.wrapper.dataset.auto === 'true';
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
        if (!this.container.classList.contains('auto-scroll-track')) {
            this.container.classList.add('auto-scroll-track');
        }
        
        // Pause on hover
        this.wrapper.addEventListener('mouseenter', () => {
            this.container.style.animationPlayState = 'paused';
        });
        
        this.wrapper.addEventListener('mouseleave', () => {
            this.container.style.animationPlayState = 'running';
        });
        
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            this.container.style.animation = 'none';
        }
    }
    
    // Filter projects based on active skill filters
    filterBySkills(activeFilters) {
        if (!this.container) return;
        
        const cards = Array.from(this.container.children);
        const isFiltering = activeFilters.length > 0;
        let matchedCount = 0;
        
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
}
});

// Module 8: components\skills-component.js
moduleRegistry.set(8, function(module, exports, require) {
// Skills section component with progressive arc matrix
const { APP_CONFIG: APP_CONFIG, SKILL_ICONS: SKILL_ICONS } = loadModule(2);
const { escapeHTML: escapeHTML, escapeAttr: escapeAttr, createIntersectionObserver: createIntersectionObserver } = loadModule(4);

class SkillsComponent {
    constructor() {
        this.container = null;
        this.pillsContainer = null;
        this.activeFilters = new Set();
        this.lastClickedSkill = null;
        this.tooltip = null;
        this.onFilterChange = null;
    }
    
    init() {
        this.container = document.getElementById('skills-track');
        this.pillsContainer = document.getElementById('skill-category-pills');
        this.initTooltip();
        this.restoreFilters();
    }
    
    restoreFilters() {
        try {
            const stored = localStorage.getItem(APP_CONFIG.skills.filterStorageKey);
            if (stored) {
                JSON.parse(stored).forEach(skill => this.activeFilters.add(skill));
            }
        } catch (e) {
            // Ignore restore errors
        }
    }
    
    persistFilters() {
        try {
            localStorage.setItem(
                APP_CONFIG.skills.filterStorageKey,
                JSON.stringify(Array.from(this.activeFilters))
            );
        } catch (e) {
            // Ignore persist errors
        }
    }
    
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
        progress.setAttribute('data-target-offset', String(circumference * (1 - skill.percent / 100)));
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
        } else if (!isMultiSelect && !this.activeFilters.has(skillName) && this.activeFilters.size <= 1) {
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
        const startIndex = skillButtons.findIndex(btn => 
            btn.getAttribute('data-skill') === this.lastClickedSkill
        );
        const endIndex = skillButtons.findIndex(btn => 
            btn.getAttribute('data-skill') === endSkill
        );
        
        if (startIndex !== -1 && endIndex !== -1) {
            const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
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
        
        skillArcs.forEach(arc => {
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
        
        const categories = Array.from(new Set(skills.map(skill => skill.category)));
        this.pillsContainer.innerHTML = '';
        
        categories.forEach(category => {
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
            .filter(skill => skill.category === category)
            .map(skill => skill.name);
            
        const allSelected = skillsInCategory.every(skill => this.activeFilters.has(skill));
        
        if (allSelected) {
            skillsInCategory.forEach(skill => this.activeFilters.delete(skill));
        } else {
            skillsInCategory.forEach(skill => this.activeFilters.add(skill));
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
        pills.forEach(pill => {
            const category = pill.getAttribute('data-category');
            const skillsInCategory = skills
                .filter(skill => skill.category === category)
                .map(skill => skill.name);
            const allSelected = skillsInCategory.every(skill => this.activeFilters.has(skill));
            
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
        const xpLine = lines.find(line => /^XP:/i.test(line));
        
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
        
        window.addEventListener('pointermove', this.handleTooltipMove.bind(this), { passive: true });
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
        
        const observer = createIntersectionObserver((entries) => {
            entries.forEach(entry => {
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
                    this.animateCountUp(percentSpan, Number(percentSpan.dataset.target || '0'), prefersReducedMotion);
                }
                
                observer.unobserve(element);
            });
        }, { threshold: 0.25 });
        
        this.container.querySelectorAll('.skill-arc').forEach(arc => observer.observe(arc));
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
    
    render(items) {
        if (!this.container || !Array.isArray(items)) return;
        
        this.container.className = 'skills-matrix progressive-arcs';
        const normalizedSkills = this.normalizeSkills(items);
        
        // Build category pills
        this.buildCategoryPills(normalizedSkills);
        
        // Create skill arcs
        const fragment = document.createDocumentFragment();
        normalizedSkills.forEach((skill, index) => {
            const arc = this.createSkillArc(skill, index);
            fragment.appendChild(arc);
        });
        
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        
        // Initialize interactions
        this.initTooltipHandlers();
        this.animateProgressRings();
        this.updateVisualState();
        this.updateCategoryPillStates(normalizedSkills);
    }
    
    setFilterChangeCallback(callback) {
        this.onFilterChange = callback;
    }
    
    getActiveFilters() {
        return Array.from(this.activeFilters);
    }
    
    clearFilters() {
        this.activeFilters.clear();
        this.updateVisualState();
        this.persistFilters();
        
        if (this.onFilterChange) {
            this.onFilterChange([]);
        }
    }
}
});

// Module 9: components\publications-component.js
moduleRegistry.set(9, function(module, exports, require) {
// Publications section component
const { escapeHTML: escapeHTML, escapeAttr: escapeAttr, formatDate: formatDate } = loadModule(4);

class PublicationsComponent {
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
});

// Module 10: components\mobile-navigation.js
moduleRegistry.set(10, function(module, exports, require) {
// Mobile navigation component
class MobileNavigation {
    constructor() {
        this.menuButton = null;
        this.menu = null;
        this.isOpen = false;
    }
    
    init() {
        this.menuButton = document.getElementById('mobile-menu-button');
        this.menu = document.getElementById('mobile-menu');
        
        if (this.menuButton && this.menu) {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        // Menu toggle
        this.menuButton.addEventListener('click', () => {
            this.toggle();
        });
        
        // Close menu when clicking on links
        const links = this.menu.getElementsByTagName('a');
        Array.from(links).forEach(link => {
            link.addEventListener('click', () => {
                this.close();
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (this.isOpen && 
                !this.menu.contains(event.target) && 
                !this.menuButton.contains(event.target)) {
                this.close();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.close();
                this.menuButton.focus();
            }
        });
        
        // Handle resize - close menu on desktop breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isOpen) {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.menu.classList.remove('hidden');
        this.isOpen = true;
        this.menuButton.setAttribute('aria-expanded', 'true');
        
        // Trap focus within menu
        this.trapFocus();
        
        // Update icon
        this.updateMenuIcon();
    }
    
    close() {
        this.menu.classList.add('hidden');
        this.isOpen = false;
        this.menuButton.setAttribute('aria-expanded', 'false');
        
        // Update icon
        this.updateMenuIcon();
    }
    
    updateMenuIcon() {
        const icon = this.menuButton.querySelector('svg');
        if (!icon) return;
        
        if (this.isOpen) {
            // Change to X icon
            icon.innerHTML = `
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            `;
        } else {
            // Change to hamburger icon
            icon.innerHTML = `
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
            `;
        }
    }
    
    trapFocus() {
        const focusableElements = this.menu.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        firstElement.focus();
        
        const handleTabKey = (event) => {
            if (event.key !== 'Tab') return;
            
            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        this.menu.addEventListener('keydown', handleTabKey);
        
        // Remove listener when menu closes
        const removeListener = () => {
            this.menu.removeEventListener('keydown', handleTabKey);
        };
        
        // Store reference to remove later
        this.currentTabHandler = removeListener;
    }
}
});

// Bootstrap main module
loadModule(0);