// Supabase client configuration and utilities
// Using CDN version for vanilla JS compatibility

/**
 * Get environment variable value
 * In a vanilla JS build process, we need to handle env vars differently
 * This can be replaced during build time or loaded from a config
 */
function getEnvVar(key, defaultValue = '') {
    // For static sites, env vars need to be injected during build
    // or loaded from a separate config file
    if (typeof window !== 'undefined' && window.__ENV__) {
        return window.__ENV__[key] || defaultValue;
    }
    return defaultValue;
}

// Supabase configuration
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', '');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', '');
const DATA_SOURCE = getEnvVar('VITE_DATA_SOURCE', 'local');

// Initialize Supabase client only if credentials are provided
let supabaseClient = null;

/**
 * Initialize Supabase client dynamically
 * This will be called when the Supabase JS library is loaded
 */
export function initSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
        console.warn('Supabase library not loaded');
        return false;
    }

    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'your-project-url.supabase.co') {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            });
            return true;
        } catch (error) {
            console.warn('Failed to initialize Supabase client:', error);
            return false;
        }
    }
    return false;
}

/**
 * Fetch projects from Supabase
 * @returns {Promise<Array>} Array of project objects
 */
export async function fetchProjectsFromSupabase() {
    if (!supabaseClient) {
        // Try to initialize if not already done
        if (!initSupabaseClient()) {
            throw new Error(
                'Supabase client not initialized. Please check your environment variables.'
            );
        }
    }

    try {
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        // Transform database schema to match application schema
        return data.map((project) => ({
            title: project.title,
            description: project.description,
            image: project.image,
            tech: project.tech || [],
            githubUrl: project.github_url
        }));
    } catch (error) {
        console.error('Error fetching projects from Supabase:', error);
        throw error;
    }
}

/**
 * Check if Supabase is configured and available
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
    return (
        (supabaseClient !== null ||
            (SUPABASE_URL &&
                SUPABASE_ANON_KEY &&
                SUPABASE_URL !== 'your-project-url.supabase.co')) &&
        DATA_SOURCE === 'supabase'
    );
}

/**
 * Get the configured data source
 * @returns {string} 'supabase' or 'local'
 */
export function getDataSource() {
    return DATA_SOURCE;
}

export { supabaseClient };
