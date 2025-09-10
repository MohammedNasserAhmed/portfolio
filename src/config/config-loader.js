// Configuration loader and manager
import { APP_CONFIG } from './app-config.js';
import { environment, isFeatureEnabled } from './environment.js';

class ConfigurationManager {
    constructor() {
        this.configs = new Map();
        this.watchers = new Set();
        this.init();
    }
    
    init() {
        // Load base configuration
        this.configs.set('app', APP_CONFIG);
        this.configs.set('env', environment.getConfig());
        
        // Load user preferences
        this.loadUserPreferences();
        
        // Load runtime configuration
        this.loadRuntimeConfig();
        
        console.info('📋 Configuration loaded:', {
            environment: environment.getEnvironment(),
            features: this.getEnabledFeatures(),
            capabilities: environment.getCapabilities()
        });
    }
    
    loadUserPreferences() {
        const preferences = {
            theme: 'dark',
            language: 'en',
            animations: true,
            accessibility: {
                reducedMotion: false,
                highContrast: false,
                screenReader: false
            },
            privacy: {
                analytics: false,
                cookies: false,
                tracking: false
            },
            performance: {
                enableAnimations: true,
                lazyLoading: true,
                imageOptimization: true
            }
        };
        
        // Try to load from localStorage
        try {
            const stored = localStorage.getItem('portfolio-preferences');
            if (stored) {
                const storedPrefs = JSON.parse(stored);
                Object.assign(preferences, storedPrefs);
            }
        } catch (e) {
            console.warn('Could not load user preferences:', e.message);
        }
        
        // Detect system preferences
        if (typeof window !== 'undefined') {
            preferences.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            preferences.accessibility.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            preferences.accessibility.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
        }
        
        this.configs.set('user', preferences);
    }
    
    loadRuntimeConfig() {
        const runtime = {
            startTime: Date.now(),
            buildInfo: environment.getBuildInfo(),
            capabilities: environment.getCapabilities(),
            viewport: this.getViewportInfo(),
            device: this.getDeviceInfo(),
            network: this.getNetworkInfo()
        };
        
        this.configs.set('runtime', runtime);
    }
    
    getViewportInfo() {
        if (typeof window === 'undefined') {
            return { width: 1920, height: 1080, mobile: false, tablet: false };
        }
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        return {
            width,
            height,
            mobile: width < 768,
            tablet: width >= 768 && width < 1024,
            desktop: width >= 1024,
            ratio: width / height
        };
    }
    
    getDeviceInfo() {
        if (typeof navigator === 'undefined') {
            return { type: 'unknown', mobile: false, touch: false };
        }
        
        const userAgent = navigator.userAgent.toLowerCase();
        const mobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const tablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
        const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return {
            type: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop',
            mobile,
            tablet,
            touch,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }
    
    getNetworkInfo() {
        if (typeof navigator === 'undefined' || !navigator.connection) {
            return { type: 'unknown', speed: 'unknown' };
        }
        
        const connection = navigator.connection;
        return {
            type: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false
        };
    }
    
    // Public API
    get(path, defaultValue = null) {
        const parts = path.split('.');
        const configType = parts[0];
        const config = this.configs.get(configType);
        
        if (!config) return defaultValue;
        
        // Navigate through nested properties
        let value = config;
        for (let i = 1; i < parts.length; i++) {
            value = value[parts[i]];
            if (value === undefined) return defaultValue;
        }
        
        return value !== undefined ? value : defaultValue;
    }
    
    set(path, value) {
        const parts = path.split('.');
        const configType = parts[0];
        let config = this.configs.get(configType);
        
        if (!config) {
            config = {};
            this.configs.set(configType, config);
        }
        
        // Navigate and set nested property
        let current = config;
        for (let i = 1; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
        
        // Persist user preferences
        if (configType === 'user') {
            this.persistUserPreferences();
        }
        
        // Notify watchers
        this.notifyWatchers(path, value);
    }
    
    persistUserPreferences() {
        try {
            const userConfig = this.configs.get('user');
            localStorage.setItem('portfolio-preferences', JSON.stringify(userConfig));
        } catch (e) {
            console.warn('Could not persist user preferences:', e.message);
        }
    }
    
    watch(path, callback) {
        const watcher = { path, callback };
        this.watchers.add(watcher);
        
        // Return unwatch function
        return () => this.watchers.delete(watcher);
    }
    
    notifyWatchers(path, value) {
        this.watchers.forEach(watcher => {
            if (path.startsWith(watcher.path)) {
                try {
                    watcher.callback(value, path);
                } catch (e) {
                    console.error('Config watcher error:', e);
                }
            }
        });
    }
    
    getEnabledFeatures() {
        const features = [
            'devOverlay',
            'hotReload',
            'verboseLogging',
            'experimentalFeatures',
            'analytics',
            'serviceWorker'
        ];
        
        return features.filter(feature => isFeatureEnabled(feature));
    }
    
    // Convenience methods
    getTheme() {
        return this.get('user.theme', 'dark');
    }
    
    setTheme(theme) {
        this.set('user.theme', theme);
    }
    
    getLanguage() {
        return this.get('user.language', 'en');
    }
    
    setLanguage(language) {
        this.set('user.language', language);
    }
    
    isAnimationsEnabled() {
        return this.get('user.animations', true) && !this.get('user.accessibility.reducedMotion', false);
    }
    
    isMobile() {
        return this.get('runtime.viewport.mobile', false);
    }
    
    isTablet() {
        return this.get('runtime.viewport.tablet', false);
    }
    
    isDesktop() {
        return this.get('runtime.viewport.desktop', true);
    }
    
    hasTouch() {
        return this.get('runtime.device.touch', false);
    }
    
    getViewportSize() {
        return {
            width: this.get('runtime.viewport.width', 1920),
            height: this.get('runtime.viewport.height', 1080)
        };
    }
    
    // Update runtime config
    updateViewport() {
        const viewport = this.getViewportInfo();
        this.configs.set('runtime', {
            ...this.configs.get('runtime'),
            viewport
        });
        
        this.notifyWatchers('runtime.viewport', viewport);
    }
    
    // Debug helpers
    dump() {
        const data = {};
        for (const [key, value] of this.configs) {
            data[key] = value;
        }
        return data;
    }
    
    reset() {
        this.configs.clear();
        this.watchers.clear();
        try {
            localStorage.removeItem('portfolio-preferences');
        } catch (e) {
            // Ignore
        }
        this.init();
    }
}

// Create and export singleton
export const config = new ConfigurationManager();

// Update viewport info on resize
if (typeof window !== 'undefined') {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            config.updateViewport();
        }, 100);
    }, { passive: true });
}

// Export convenience functions
export const getTheme = () => config.getTheme();
export const setTheme = (theme) => config.setTheme(theme);
export const getLanguage = () => config.getLanguage();
export const setLanguage = (language) => config.setLanguage(language);
export const isAnimationsEnabled = () => config.isAnimationsEnabled();
export const isMobile = () => config.isMobile();
export const isTablet = () => config.isTablet();
export const isDesktop = () => config.isDesktop();
export const hasTouch = () => config.hasTouch();