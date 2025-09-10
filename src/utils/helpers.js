// Utility functions for common operations

/**
 * Error handling and logging utilities
 */

/**
 * Error type enumeration for better categorization
 * @enum {string}
 */
export const ErrorTypes = {
    NETWORK: 'network',
    PARSING: 'parsing',
    INITIALIZATION: 'initialization',
    COMPONENT: 'component',
    ANIMATION: 'animation',
    CONTENT: 'content',
    TIMEOUT: 'timeout'
};

/**
 * Enhanced error handling with context and categorization
 * @param {Error|string} error - Error instance or error message
 * @param {string} [context] - Additional context information
 * @param {string} [type] - Error type from ErrorTypes enum
 * @returns {Error} The processed error
 */
export function handleError(error, context = '', type = ErrorTypes.COMPONENT) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Enhance error with context
    if (context) {
        errorObj.message = `${context}: ${errorObj.message}`;
    }
    
    // Add error type
    errorObj.type = type;
    errorObj.timestamp = new Date().toISOString();
    
    // Log error with appropriate level
    if (type === ErrorTypes.NETWORK || type === ErrorTypes.TIMEOUT) {
        logWarn(`[${type.toUpperCase()}] ${errorObj.message}`, errorObj);
    } else {
        console.error(`[${type.toUpperCase()}] ${errorObj.message}`, errorObj);
    }
    
    // Send to error tracking service in production
    if (typeof window !== 'undefined' && window.trackError) {
        window.trackError(errorObj);
    }
    
    return errorObj;
}

/**
 * Validate function parameters with type checking
 * @param {Object} params - Parameters to validate
 * @param {Object} schema - Validation schema
 * @throws {Error} When validation fails
 */
export function validateParams(params, schema) {
    for (const [key, config] of Object.entries(schema)) {
        const value = params[key];
        
        // Check required parameters
        if (config.required && (value === undefined || value === null)) {
            throw handleError(
                new Error(`Required parameter '${key}' is missing`),
                'Parameter validation',
                ErrorTypes.INITIALIZATION
            );
        }
        
        // Skip type checking for optional missing values
        if (value === undefined || value === null) continue;
        
        // Type checking
        if (config.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== config.type) {
                throw handleError(
                    new Error(`Parameter '${key}' expected ${config.type}, got ${actualType}`),
                    'Parameter validation',
                    ErrorTypes.INITIALIZATION
                );
            }
        }
        
        // Custom validation function
        if (config.validate && !config.validate(value)) {
            throw handleError(
                new Error(`Parameter '${key}' failed custom validation`),
                'Parameter validation',
                ErrorTypes.INITIALIZATION
            );
        }
    }
}

/**
 * Safe async execution with timeout and error handling
 * @param {Function} asyncFn - Async function to execute
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @param {string} [context] - Error context
 * @returns {Promise<any>} Result or throws on timeout/error
 */
export async function safeAsync(asyncFn, timeout = 5000, context = 'async operation') {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(handleError(
                new Error(`Operation timed out after ${timeout}ms`),
                context,
                ErrorTypes.TIMEOUT
            ));
        }, timeout);
        
        // Execute async function and handle result
        asyncFn()
            .then(result => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(handleError(error, context));
            });
    });
}

/**
 * HTML string escaping for XSS prevention
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function escapeAttr(str) {
    return escapeHTML(str).replace(/`/g, '&#96;');
}

export function debounce(func, wait) {
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

export function throttle(func, limit) {
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

export function hexToRgba(hex, alpha) {
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

export function createIntersectionObserver(callback, options = {}) {
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

export function getCurrentLanguage() {
    return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

export function getContentPath(basePath) {
    const lang = getCurrentLanguage();
    const path = lang === 'ar' ? basePath.ar : basePath.en;
    
    // Add cache busting if enabled
    const buildVersion = window.BUILD_VERSION;
    return buildVersion ? `${path}?v=${buildVersion}` : path;
}

export function logInfo(message, ...args) {
    if (console && console.info) {
        console.info(`[portfolio] ${message}`, ...args);
    }
}

export function logWarn(message, ...args) {
    if (console && console.warn) {
        console.warn(`[portfolio] ${message}`, ...args);
    }
}

export function createDOMElement(tag, options = {}) {
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

export function waitForElement(selector, timeout = 5000) {
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

export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

export function formatDate(dateString) {
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