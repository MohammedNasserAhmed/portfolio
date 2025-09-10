// Content loading and management module
import { APP_CONFIG } from '../config/app-config.js';
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
export const contentManager = new ContentManager();