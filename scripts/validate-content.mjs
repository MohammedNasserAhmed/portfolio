import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

const __file = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__file), '..');
const dataDir = path.join(root, 'data');
const schemaPath = path.join(dataDir, 'content.schema.json');

const ajv = new Ajv({ allErrors: true, strict: true });
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

let failed = false;

for (const fname of ['content.json', 'content.ar.json']) {
    const fp = path.join(dataDir, fname);
    const json = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const ok = validate(json);
    if (!ok) {
        failed = true;
        console.error(`\n❌ ${fname} failed validation:`);
        for (const err of validate.errors) {
            console.error(`  - ${err.instancePath || '(root)'} ${err.message}`);
        }
    } else {
        console.log(`✅ ${fname} valid.`);
    }
}

if (failed) {
    console.error('\nSchema validation failed.');
    process.exit(1);
} else {
    console.log('\nAll content files valid.');
}
