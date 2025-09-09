import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const baseline = {
  timestamp: new Date().toISOString(),
  bundleSize: {},
  testResults: {},
  dependencies: {}
};

try {
  // Capture bundle sizes
  console.log('Building project...');
  execSync('bun run build', { stdio: 'inherit' });
  
  const distDir = 'dist/assets';
  if (fs.existsSync(distDir)) {
    const distFiles = fs.readdirSync(distDir);
    distFiles.forEach(file => {
      const stats = fs.statSync(path.join(distDir, file));
      baseline.bundleSize[file] = stats.size;
    });
    console.log('Bundle sizes captured');
  }
} catch (e) {
  console.log('Build failed, continuing with other metrics...');
}

try {
  // Capture test results summary
  console.log('Running tests...');
  const testOutput = execSync('bun run test:run --reporter=json', { encoding: 'utf8', stdio: 'pipe' });
  baseline.testResults = { summary: 'Tests completed', raw: testOutput.substring(0, 500) };
  console.log('Test results captured');
} catch (e) {
  baseline.testResults = { summary: 'Tests not run', error: e.message };
}

// Capture dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
baseline.dependencies = packageJson.dependencies;
baseline.devDependencies = Object.keys(packageJson.devDependencies || {});

// Save baseline
fs.writeFileSync('baseline-metrics.json', JSON.stringify(baseline, null, 2));
console.log('Baseline captured to baseline-metrics.json');
console.log('\nSummary:');
console.log('- Total dependencies:', Object.keys(baseline.dependencies).length);
console.log('- Bundle files:', Object.keys(baseline.bundleSize).length);
console.log('- Total bundle size:', Object.values(baseline.bundleSize).reduce((a, b) => a + b, 0), 'bytes');