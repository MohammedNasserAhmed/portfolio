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
export const themeManager = new ThemeManager();