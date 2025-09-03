import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockMonaco } from '../components/editor/extensions/CodeBlockMonaco';

export default {
  title: 'Journal/CodeBlockMonaco',
  parameters: {
    layout: 'fullscreen',
  },
};

const CodeBlockDemo = () => {
  const editor = useEditor({
    extensions: [StarterKit, CodeBlockMonaco],
    content: `
      <h2>Monaco Code Block Demo</h2>
      <p>This editor features advanced code blocks with syntax highlighting, language auto-detection, and Monaco Editor integration.</p>
      
      <h3>JavaScript Example</h3>
      <pre><code class="language-javascript">function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci(10):', result);</code></pre>
      
      <h3>Python Example</h3>
      <pre><code class="language-python">def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quicksort(numbers)
print(f"Sorted: {sorted_numbers}")</code></pre>
      
      <h3>SQL Example</h3>
      <pre><code class="language-sql">SELECT 
    u.username,
    u.email,
    COUNT(p.id) as post_count,
    MAX(p.created_at) as last_post
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.username, u.email
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC
LIMIT 20;</code></pre>
      
      <h3>Try Adding Your Own Code</h3>
      <p>Use the slash command <code>/code</code> or press <code>Ctrl+Alt+C</code> to insert a new code block. The language will be auto-detected based on the content you paste or type.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sanctuary max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  const languageExamples = [
    {
      name: 'JavaScript',
      code: `function fetchUserData(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => response.json())
    .then(data => {
      console.log('User data:', data);
      return data;
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      throw error;
    });
}`,
      features: ['Function declarations', 'Template literals', 'Promise chains', 'Arrow functions'],
    },
    {
      name: 'Python',
      code: `import asyncio
import aiohttp
from typing import Dict, List, Optional

class DataProcessor:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def process_batch(self, items: List[Dict]) -> List[Dict]:
        tasks = [self.process_item(item) for item in items]
        return await asyncio.gather(*tasks)
    
    async def process_item(self, item: Dict) -> Dict:
        async with self.session.get(f"{self.base_url}/{item['id']}") as response:
            data = await response.json()
            return {**item, **data}`,
      features: ['Type hints', 'Async/await', 'Class definitions', 'Context managers'],
    },
    {
      name: 'Rust',
      code: `use std::collections::HashMap;
use tokio::fs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    name: String,
    version: String,
    features: Vec<String>,
}

async fn load_config(path: &str) -> Result<Config, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path).await?;
    let config: Config = toml::from_str(&content)?;
    Ok(config)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let rt = tokio::runtime::Runtime::new()?;
    rt.block_on(async {
        match load_config("config.toml").await {
            Ok(config) => println!("Loaded config: {:?}", config),
            Err(e) => eprintln!("Failed to load config: {}", e),
        }
    });
    Ok(())
}`,
      features: ['Ownership system', 'Pattern matching', 'Error handling', 'Async runtime'],
    },
  ];

  const features = [
    {
      title: 'Language Auto-Detection',
      description:
        'Automatically detects programming language based on keywords and syntax patterns',
      icon: '🔍',
    },
    {
      title: 'Monaco Editor Integration',
      description:
        'Full Monaco Editor with IntelliSense, error detection, and rich editing features',
      icon: '🎯',
    },
    {
      title: 'Syntax Highlighting',
      description: 'Beautiful syntax highlighting for 50+ programming languages',
      icon: '🌈',
    },
    {
      title: 'Language Selection',
      description: 'Manual language selection with comprehensive language support',
      icon: '⚡',
    },
    {
      title: 'Copy to Clipboard',
      description: 'One-click copy functionality with visual feedback',
      icon: '📋',
    },
    {
      title: 'Code Formatting',
      description: 'Auto-formatting and indentation based on language conventions',
      icon: '✨',
    },
  ];

  const supportedLanguages = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Rust',
    'Go',
    'Java',
    'C++',
    'C#',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'Dart',
    'Scala',
    'Clojure',
    'Haskell',
    'SQL',
    'HTML',
    'CSS',
    'SCSS',
    'JSON',
    'YAML',
    'TOML',
    'XML',
    'Markdown',
    'LaTeX',
    'Shell',
    'PowerShell',
    'Dockerfile',
    'Makefile',
  ];

  return (
    <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold">Monaco Code Blocks</h1>
          <p className="text-lg text-sanctuary-text-secondary max-w-2xl mx-auto">
            Advanced code editing with Monaco Editor integration, auto-detection, and rich syntax
            highlighting
          </p>
        </div>

        {/* Live Editor Demo */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-4">Interactive Demo</h2>
          <div className="bg-sanctuary-bg-secondary rounded-xl p-6 border border-sanctuary-border">
            <div className="prose prose-sanctuary max-w-none">
              <EditorContent editor={editor} />
            </div>
          </div>
          <p className="text-sm text-sanctuary-text-secondary mt-2">
            Try adding code with the <code>/code</code> slash command or <kbd>Ctrl+Alt+C</kbd>
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-4 bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-medium text-sanctuary-text-primary">{feature.title}</span>
                </div>
                <p className="text-sm text-sanctuary-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Language Examples */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Language Detection Examples</h2>
          <div className="space-y-6">
            {languageExamples.map((example) => (
              <div
                key={example.name}
                className="bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border overflow-hidden"
              >
                <div className="px-4 py-3 bg-sanctuary-bg-tertiary border-b border-sanctuary-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{example.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {example.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-2 py-1 bg-sanctuary-accent/20 text-sanctuary-accent rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-sanctuary-text-secondary whitespace-pre-wrap overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Auto-Detection Algorithm */}
        <section className="bg-sanctuary-bg-secondary rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Auto-Detection Algorithm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-sanctuary-accent">How It Works</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>
                  1. <strong>Keyword Analysis</strong> - Scans for language-specific keywords
                </li>
                <li>
                  2. <strong>Syntax Patterns</strong> - Identifies unique syntax structures
                </li>
                <li>
                  3. <strong>File Extensions</strong> - Considers common file extensions
                </li>
                <li>
                  4. <strong>Weighted Scoring</strong> - Calculates confidence scores
                </li>
                <li>
                  5. <strong>Best Match</strong> - Selects language with highest score
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-sanctuary-accent">
                Detection Triggers
              </h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>
                  • <strong>Keywords:</strong> function, class, import, etc.
                </li>
                <li>
                  • <strong>Operators:</strong> =&gt;, ::, -&gt;, etc.
                </li>
                <li>
                  • <strong>Syntax:</strong> Braces, indentation, semicolons
                </li>
                <li>
                  • <strong>Comments:</strong> <code>{'//'}</code>, <code>#</code>,{' '}
                  <code>{'/* */'}</code>, etc.
                </li>
                <li>
                  • <strong>Strings:</strong> Quote styles and escaping
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Supported Languages */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Supported Languages</h2>
          <div className="bg-sanctuary-bg-secondary rounded-lg p-6 border border-sanctuary-border">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {supportedLanguages.map((language) => (
                <div
                  key={language}
                  className="px-3 py-2 bg-sanctuary-bg-tertiary rounded text-center text-sm text-sanctuary-text-primary border border-sanctuary-border/50"
                >
                  {language}
                </div>
              ))}
            </div>
            <p className="text-sm text-sanctuary-text-secondary mt-4 text-center">
              And many more languages supported through Monaco Editor
            </p>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-sanctuary-bg-secondary rounded-lg p-6 border border-sanctuary-border">
              <h3 className="text-lg font-semibold mb-4 text-sanctuary-accent">Best Practices</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Include meaningful variable and function names</li>
                <li>• Add comments to explain complex logic</li>
                <li>• Use consistent indentation and formatting</li>
                <li>• Include imports and dependencies when relevant</li>
                <li>• Test code snippets for accuracy</li>
              </ul>
            </div>
            <div className="bg-sanctuary-bg-secondary rounded-lg p-6 border border-sanctuary-border">
              <h3 className="text-lg font-semibold mb-4 text-sanctuary-accent">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Insert Code Block</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">
                    Ctrl+Alt+C
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Auto-detect Language</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">
                    Click Auto
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Copy Code</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">
                    Click Copy
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Format Code</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">
                    Shift+Alt+F
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Notes */}
        <section className="bg-sanctuary-bg-secondary rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Performance & Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Fast Loading</h3>
              <p className="text-sm text-sanctuary-text-secondary">
                Monaco Editor loads asynchronously without blocking the main thread
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💾</div>
              <h3 className="font-semibold mb-2">Memory Efficient</h3>
              <p className="text-sm text-sanctuary-text-secondary">
                Lazy loading and cleanup prevent memory leaks in long sessions
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <h3 className="font-semibold mb-2">Auto Updates</h3>
              <p className="text-sm text-sanctuary-text-secondary">
                Content syncs seamlessly with the main editor state
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export const CodeBlockMonacoShowcase = CodeBlockDemo;
