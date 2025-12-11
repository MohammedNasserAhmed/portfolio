import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Manually parse .env.local because dotenv might not override if not configured right
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Key:', supabaseKey ? 'Found' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Attempting to fetch blogs...');
    const { data, error } = await supabase.from('blogs').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log(`✅ Success! Found ${data.length} blogs.`);
        if (data.length > 0) {
            console.log('First blog:', data[0].title);
        } else {
            console.log('⚠️ Table is empty. Did you run the seed script?');
        }
    }
}

test();
