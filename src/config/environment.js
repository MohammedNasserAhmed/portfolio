// Environment configuration and detection
class Environment {
    constructor() {
        this.cache = new Map();
        this.init();
    }
    
    init() {
        // Detect environment early
        this.env = this.detectEnvironment();
        this.buildInfo = this.getBuildInfo();
        
        // Setup global environment info
        if (typeof window !== 'undefined') {
            window.__PORTFOLIO_ENV__ = {
                environment: this.env,
                build: this.buildInfo,
                capabilities: this.getCapabilities(),
                debug: this.isDebugMode()
            };
        }
    }
    
    detectEnvironment() {
        // Check various environment indicators
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        
        // Production indicators
        if (hostname.includes('github.io') || hostname.includes('githubusercontent.com')) {
            return 'production';
        }
        
        // Development indicators
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
            return 'development';
        }
        
        // Staging/preview indicators
        if (hostname.includes('staging') || hostname.includes('preview') || hostname.includes('netlify')) {
            return 'staging';
        }
        
        // Check for development tools
        if (typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
            return 'development';
        }
        
        // Default based on protocol
        if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
            return 'development';
        }
        
        return 'production'; // Default to production for safety
    }
    
    getBuildInfo() {
        const buildInfo = {
            version: this.getMetaContent('asset-version') || 'unknown',
            timestamp: null,
            hash: null
        };
        
        // Try to get build info from various sources
        if (typeof window !== 'undefined') {
            // From build manifest if available
            const manifest = window.__BUILD_MANIFEST__;
            if (manifest) {
                buildInfo.timestamp = manifest.timestamp;
                buildInfo.hash = manifest.buildId;
            }
            
            // From global build version
            if (window.BUILD_VERSION) {
                buildInfo.version = window.BUILD_VERSION;
            }
        }
        
        return buildInfo;
    }
    
    getMetaContent(name) {
        if (typeof document === 'undefined') return null;
        
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.getAttribute('content') : null;
    }
    
    getCapabilities() {
        if (typeof window === 'undefined') {
            return {
                intersectionObserver: false,
                webGL: false,
                serviceWorker: false,
                localStorage: false,
                fetch: false,
                esModules: false
            };
        }
        
        return {
            intersectionObserver: 'IntersectionObserver' in window,
            webGL: this.hasWebGL(),
            serviceWorker: 'serviceWorker' in navigator,
            localStorage: this.hasLocalStorage(),
            fetch: 'fetch' in window,
            esModules: 'noModule' in HTMLScriptElement.prototype,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches,
            touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }
    
    hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    hasLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    isDebugMode() {
        if (this.env === 'development') return true;
        
        if (typeof window === 'undefined') return false;
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true') return true;
        
        // Check hash
        if (window.location.hash.includes('debug')) return true;
        
        // Check local storage
        try {
            return localStorage.getItem('portfolio-debug') === 'true';
        } catch (e) {
            return false;
        }
    }
    
    // Public API
    isDevelopment() {
        return this.env === 'development';
    }
    
    isProduction() {
        return this.env === 'production';
    }
    
    isStaging() {
        return this.env === 'staging';
    }
    
    getEnvironment() {
        return this.env;
    }
    
    getBuildVersion() {
        return this.buildInfo.version;
    }
    
    hasCapability(capability) {
        const capabilities = this.getCapabilities();
        return capabilities[capability] || false;
    }
    
    getConfig(key, defaultValue = null) {
        // Environment-specific configuration
        const configs = {
            development: {
                apiBaseUrl: 'http://localhost:3000/api',
                enableAnalytics: false,
                enableServiceWorker: false,
                logLevel: 'debug',
                enableHotReload: true,
                enableDevOverlay: true
            },
            staging: {
                apiBaseUrl: 'https://staging-api.example.com/api',
                enableAnalytics: false,
                enableServiceWorker: true,
                logLevel: 'info',
                enableHotReload: false,
                enableDevOverlay: false
            },
            production: {
                apiBaseUrl: 'https://api.example.com/api',
                enableAnalytics: true,
                enableServiceWorker: true,
                logLevel: 'error',
                enableHotReload: false,
                enableDevOverlay: false
            }
        };
        
        const envConfig = configs[this.env] || configs.production;
        return key ? (envConfig[key] ?? defaultValue) : envConfig;
    }
    
    // Performance monitoring
    measurePerformance(name, fn) {
        if (!this.isDebugMode()) {
            return fn();
        }
        
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
        
        return result;
    }
    
    // Error reporting
    reportError(error, context = {}) {
        const errorReport = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            environment: this.env,
            buildVersion: this.buildInfo.version,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            context
        };
        
        if (this.isDevelopment()) {
            console.error('🚨 Error Report:', errorReport);
        } else {
            // In production, you might want to send this to an error reporting service
            console.error('Error:', error.message);
        }
    }
    
    // Feature flags
    isFeatureEnabled(featureName) {
        const features = {
            development: {
                devOverlay: true,
                hotReload: true,
                verboseLogging: true,
                experimentalFeatures: true
            },
            staging: {
                devOverlay: false,
                hotReload: false,
                verboseLogging: false,
                experimentalFeatures: true
            },
            production: {
                devOverlay: false,
                hotReload: false,
                verboseLogging: false,
                experimentalFeatures: false
            }
        };
        
        const envFeatures = features[this.env] || features.production;
        return envFeatures[featureName] || false;
    }
}

// Export singleton instance
export const environment = new Environment();

// Convenience exports
export const isDevelopment = () => environment.isDevelopment();
export const isProduction = () => environment.isProduction();
export const isStaging = () => environment.isStaging();
export const getEnvironment = () => environment.getEnvironment();
export const hasCapability = (capability) => environment.hasCapability(capability);
export const getConfig = (key, defaultValue) => environment.getConfig(key, defaultValue);
export const isFeatureEnabled = (feature) => environment.isFeatureEnabled(feature);