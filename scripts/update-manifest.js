// scripts/update-manifest.js
// This script is currently NOT needed as the manifest plugin handles JS
// and CSS cache busting is handled via query string in Flask.
// Kept for potential future use or reference.

/*
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genDir = path.resolve(__dirname, '../journal/static/gen');
const manifestPath = path.resolve(genDir, 'manifest.json');

console.log('Running post-build script (currently no-op)...');
console.log(`Manifest path: ${manifestPath}`);
console.log(`Gen directory: ${genDir}`);

try {
    // Example: Just check if manifest exists
    if (!fs.existsSync(manifestPath)) {
         console.warn(`Manifest file not found at ${manifestPath}. Rollup might need to run.`);
    } else {
        console.log('Manifest file exists.');
    }

} catch (err) {
    console.error('Error during post-build script:', err);
    process.exit(1); // Exit with error code
}
*/

console.log("Post-build script finished (no action taken).");
