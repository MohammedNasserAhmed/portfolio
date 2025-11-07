// Environment configuration loader
// This file loads environment variables and makes them available to the application

/**
 * Load environment variables from .env file content
 * @param {string} envContent - Content of .env file
 * @returns {Object} Parsed environment variables
 */
function __parseEnvFile(envContent) {
    const env = {};
    const lines = envContent.split('\n');

    for (const line of lines) {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.trim()) {
            continue;
        }

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();

            // Remove quotes if present
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }

            env[key] = value;
        }
    }

    return env;
}

/**
 * Initialize environment variables
 * This should be called early in the application lifecycle
 */
export async function initializeEnv() {
    // In production/build, env vars should be injected at build time
    // For development, we can try to load from .env file

    if (typeof window === 'undefined') {
        return;
    }

    // Check if env is already loaded
    if (window.__ENV__) {
        return window.__ENV__;
    }

    // Set defaults
    window.__ENV__ = {
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
        VITE_DATA_SOURCE: 'local'
    };

    // In a real static deployment, these would be replaced during build
    // For now, they can be manually set in a config.js file or via window.__ENV__

    return window.__ENV__;
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
    initializeEnv();
}
