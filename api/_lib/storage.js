// Storage abstraction using Supabase
import { supabase } from './supabase.js';

// Helper to get stats safely
async function getAggregates() {
    if (!supabase) return { total_visitors: 0, total_stars: 0 };
    try {
        const { data, error } = await supabase
            .from('site_aggregates')
            .select('total_visitors, total_stars')
            .eq('id', 1)
            .single();
        
        if (error && error.code !== 'PGRST116') {
             console.warn('Aggregates read error:', error);
        }
        return data || { total_visitors: 0, total_stars: 0 };
    } catch {
        return { total_visitors: 0, total_stars: 0 };
    }
}

export async function getSiteContent() {
    if (!supabase) {
        console.error('Supabase not configured');
        return null; // Triggers fallback to static content.json
    }
    
    try {
        // Parallel fetch for valid relational data
        const [summary, skills, projects, publications, aggregates] = await Promise.all([
            supabase.from('summary').select('*').order('display_order', { ascending: true }),
            supabase.from('skills').select('*').order('display_order', { ascending: true }),
            supabase.from('projects').select('*').order('display_order', { ascending: true }),
            supabase.from('publications').select('*').order('display_order', { ascending: true }),
            getAggregates()
        ]);

        if (summary.error) throw summary.error;
        if (skills.error) throw skills.error;
        if (projects.error) throw projects.error;
        if (publications.error) throw publications.error;

        // Transform to expected JSON structure for frontend
        return {
            stats: {
                visitors: aggregates.total_visitors,
                stars: aggregates.total_stars,
                lastUpdated: new Date().toISOString()
            },
            summary: summary.data, // exact match
            skills: skills.data, // exact match
            projects: projects.data.map(p => ({
                ...p,
                githubUrl: p.github_url // CamelCase for frontend
            })),
            publications: publications.data // exact match
        };
    } catch (error) {
        console.error('Supabase getSiteContent error:', error);
        return null; // Triggers fallback
    }
}

export async function getStats(clientId) {
    if (!supabase) {
        return { visitors: 0, stars: 0, userHasStarred: false, error: 'no_db' };
    }

    try {
        const aggregates = await getAggregates();
        let userHasStarred = false;

        if (clientId) {
            const { data } = await supabase
                .from('stars')
                .select('id')
                .eq('client_id', clientId)
                .maybeSingle(); 
            userHasStarred = !!data;
        }

        return {
            visitors: aggregates.total_visitors,
            stars: aggregates.total_stars,
            userHasStarred
        };
    } catch (error) {
        console.error('Supabase getStats error:', error);
        return { visitors: 0, stars: 0, userHasStarred: false, error: true };
    }
}

export async function incrementVisit(clientId) {
    if (!supabase) return { visitors: 0, stars: 0, userHasStarred: false };

    try {
        // Just insert a visit record. Trigger handles the count update.
        await supabase.from('visits').insert({ client_id: clientId });
        return getStats(clientId);
    } catch (error) {
        console.error('Supabase incrementVisit error:', error);
        return getStats(clientId);
    }
}

export async function toggleStar(clientId, desired) {
    if (!supabase) return { visitors: 0, stars: 0, userHasStarred: false };

    try {
        if (desired === true) {
            await supabase.from('stars').upsert({ client_id: clientId }, { onConflict: 'client_id' });
        } else if (desired === false) {
            await supabase.from('stars').delete().eq('client_id', clientId);
        }
        return getStats(clientId);
    } catch (error) {
        console.error('Supabase toggleStar error:', error);
        return getStats(clientId);
    }
}

export async function saveMessage(messageData) {
    if (!supabase) {
        console.log('Mock saving message (Supabase not configured):', messageData);
        return { success: true, mock: true };
    }

    try {
        const { error } = await supabase.from('messages').insert({
            name: messageData.name,
            email: messageData.email,
            message: messageData.message,
            ip: messageData.ip
        });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Supabase saveMessage error:', error);
        throw error;
    }
}
