import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually load .env.local since dotenv might not be installed
const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');
const envPath = path.join(ROOT_DIR, '.env.local');

const envVars = {};

try {
    if (fs.existsSync(envPath)) {
        console.log('📄 Found .env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                envVars[key] = value;
            }
        });
    } else {
        console.warn('⚠️ .env.local not found at', envPath);
    }
} catch (e) {
    console.error('Error reading .env.local:', e);
}

const url = envVars.SUPABASE_URL || process.env.SUPABASE_URL;
const key = envVars.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log(`URL: ${url ? 'Set (starts with ' + url.substring(0, 8) + '...)' : 'Missing ❌'}`);
console.log(`Key: ${key ? 'Set (starts with ' + key.substring(0, 8) + '...)' : 'Missing ❌'}`);

if (!url || !key) {
    console.error('❌ Missing credentials. Cannot proceed.');
    console.error('Please ensure .env.local exists with SUPABASE_URL and SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
    try {
        console.log('Attempting to fetch from "summary" table...');
        const { data, error } = await supabase.from('summary').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Query failed:', error.message);
            console.error('Details:', error);
            if (error.code === '42P01') {
                console.error('💡 Hint: The table "summary" does not exist. Did you run the schema SQL?');
            }
        } else {
            console.log(`✅ Connection successful!`);
            
            // Try actual select
            const { data: rows, error: rowsError } = await supabase.from('summary').select('*').limit(3);
            if (rowsError) {
                 console.error('❌ Select failed:', rowsError);
            } else {
                 console.log(`✅ Retrieved ${rows.length} rows.`);
                 if(rows.length > 0) {
                     console.log('Sample title:', rows[0].title);
                 } else {
                     console.warn('⚠️ Table exists but is empty. Did you run the seed SQL?');
                 }
            }
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testConnection();
