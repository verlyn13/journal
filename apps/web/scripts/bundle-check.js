import fs from 'fs';
import path from 'path';

const MAX_SIZE_KB = 1500;
const distPath = path.join(process.cwd(), 'dist/assets');

function checkBundleSize() {
  if (!fs.existsSync(distPath)) {
    console.error('❌ Bundle path not found:', distPath);
    process.exit(1);
  }
  const files = fs.readdirSync(distPath);
  let totalSize = 0;
  let excludedSize = 0;
  
  // Core bundles that are loaded immediately
  const coreBundlePatterns = [
    /^app-.*\.js$/,
    /^react-vendor-.*\.js$/,
    /^editor-.*\.js$/,
    /^math-.*\.js$/,
    /^query-.*\.js$/
  ];
  
  // Monaco editor and its language modules are loaded dynamically
  const excludePatterns = [
    /^monaco-editor-.*\.js$/,
    // Monaco language modules (loaded on-demand)
    /^(javascript|typescript|html|css|json|markdown|python|sql|java|cpp|rust|go|php|ruby|swift|kotlin|scala|clojure|perl|julia|dart|lua|shell|bash|powershell|yaml|xml|dockerfile|graphql|protobuf|solidity|elixir|erlang|haskell|lisp|scheme|ml|fsharp|pascal|ada|cobol|fortran|abap|apex|azcli|bat|bicep|cameligo|coffee|csp|cypher|ecl|flow9|freemarker2|fsharp|handlebars|hcl|ini|lexon|liquid|m3|mdx|mips|msdax|mysql|objective-c|pascaligo|pgsql|pla|postiats|powerquery|pug|qsharp|razor|redis|redshift|restructuredtext|sb|scss|sophia|sparql|st|systemverilog|tcl|twig|typespec|vb|wgsl|less|stylus|sass|coffeescript|elm|reason|ocaml|nim|zig|crystal|vlang|v|odin|gleam|grain)-.*\.js$/,
    // Monaco mode files
    /Mode-.*\.js$/,
    /^tsMode-.*\.js$/,
    /^cssMode-.*\.js$/,
    /^htmlMode-.*\.js$/,
    /^jsonMode-.*\.js$/
  ];
  
  for (const file of files) {
    if (file.endsWith('.js')) {
      const stats = fs.statSync(path.join(distPath, file));
      const isExcluded = excludePatterns.some(pattern => pattern.test(file));
      const isCoreBundle = coreBundlePatterns.some(pattern => pattern.test(file));
      
      if (isExcluded) {
        excludedSize += stats.size;
      } else if (isCoreBundle) {
        totalSize += stats.size;
      }
      // Ignore other files (individual language modules, etc.)
    }
  }
  
  const sizeKB = Math.round(totalSize / 1024);
  const excludedKB = Math.round(excludedSize / 1024);
  
  console.log(`Core bundle size: ${sizeKB}KB (excluding ${excludedKB}KB of dynamically loaded assets)`);
  
  if (sizeKB > MAX_SIZE_KB) {
    console.error(`❌ Core bundle size ${sizeKB}KB exceeds limit of ${MAX_SIZE_KB}KB`);
    process.exit(1);
  }
  console.log(`✅ Core bundle size ${sizeKB}KB is under limit of ${MAX_SIZE_KB}KB`);
}

checkBundleSize();

