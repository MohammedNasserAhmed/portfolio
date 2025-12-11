import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually load .env.local since dotenv might not be installed
const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');
const envPath = path.join(ROOT_DIR, '.env.local');

const envVars = {};

console.log(`📂 Reading env file from: ${envPath}`);

try {
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        console.log(`📄 File content length: ${content.length} chars`);

        // Debug first few chars to check for BOM
        const firstChar = content.charCodeAt(0);
        console.log(
            `ℹ️ First char code: ${firstChar} (${firstChar === 65279 ? 'BOM Detected!' : 'No BOM'})`
        );

        content.split(/\r?\n/).forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) return;

            const match = trimmedLine.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                envVars[key] = value;
                console.log(`   🔑 Parsed Key: [${key}]`); // Don't log value
            } else {
                console.log(`   ⚠️ Skipped line ${index + 1}: format mismatch`);
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

console.log('--- Credentials Check ---');
console.log(`URL Found: ${!!url}`);
console.log(`Key Found: ${!!key}`);

if (!url || !key) {
    console.error('❌ Missing credentials. Check the logs above to see if keys were parsed.');
    process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
    console.log('\n🔍 Testing Query to "summary" table...');
    try {
        const { data, error, count } = await supabase
            .from('summary')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('❌ Query ERROR:', error.message);
            console.error('   Hint: Check if table "summary" exists and RLS policies allow read.');
            return;
        }

        console.log(`✅ Success! Status: ${200}`);
        console.log(`📊 Rows returned: ${data?.length}`);

        if (data && data.length > 0) {
            console.log('✅ Data sample:', data[0].title);
        } else {
            console.warn(
                '⚠️ Query succeeded but returned 0 rows. The table might be empty or RLS is blocking access.'
            );
        }
    } catch (err) {
        console.error('❌ Network/Client Error:', err.message);
    }
}

testConnection();
