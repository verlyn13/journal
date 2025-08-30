export default {
  title: 'Welcome',
  parameters: {
    docs: {
      page: null,
    },
  },
};

export const JournalProject = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'p-5';
    container.innerHTML = `
      <div class="container-fluid">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <h1 class="display-4 text-primary mb-4">📔 Journal Project</h1>
            
            <div class="alert alert-info mb-4">
              <h5 class="alert-heading">Welcome to the Journal Component Library!</h5>
              <p class="mb-0">This Storybook showcases the UI components used in the Journal application - a personal journaling tool built with Flask, HTMX, and Alpine.js.</p>
            </div>
            
            <div class="card mb-4">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">🚀 About the Journal Application</h5>
              </div>
              <div class="card-body">
                <p>The Journal is a full-stack web application for personal journaling and note-taking. Key features include:</p>
                <ul>
                  <li><strong>Secure Authentication</strong> - User registration and login</li>
                  <li><strong>Rich Text Editing</strong> - Markdown support with live preview</li>
                  <li><strong>Entry Management</strong> - Create, edit, delete, and search journal entries</li>
                  <li><strong>Tagging System</strong> - Organize entries with tags</li>
                  <li><strong>Responsive Design</strong> - Works on desktop and mobile devices</li>
                </ul>
              </div>
            </div>
            
            <div class="card mb-4">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">🏃 Running the Journal Application</h5>
              </div>
              <div class="card-body">
                <p>The Journal is a Flask application that requires a backend server. To run it locally:</p>
                <pre class="bg-dark text-light p-3 rounded"><code># Install Python dependencies
uv sync

# Run the Flask development server
uv run python run.py

# Or use the npm script
npm run py:dev</code></pre>
                <p class="mt-3">Then visit <code>http://localhost:5000</code> in your browser.</p>
                <div class="alert alert-warning mt-3">
                  <strong>Note:</strong> The application requires a database. It will create a SQLite database automatically on first run.
                </div>
              </div>
            </div>
            
            <div class="card mb-4">
              <div class="card-header bg-info text-white">
                <h5 class="mb-0">🧩 Component Library</h5>
              </div>
              <div class="card-body">
                <p>This Storybook contains the following reusable components:</p>
                <div class="row">
                  <div class="col-md-6">
                    <h6>📊 DataTable</h6>
                    <p class="small">Sortable, searchable table with pagination</p>
                  </div>
                  <div class="col-md-6">
                    <h6>📝 FormInput</h6>
                    <p class="small">Accessible form inputs with validation</p>
                  </div>
                  <div class="col-md-6">
                    <h6>🪟 Modal</h6>
                    <p class="small">Flexible modal dialogs with various sizes</p>
                  </div>
                  <div class="col-md-6">
                    <h6>🔔 Notification</h6>
                    <p class="small">Toast notifications for user feedback</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card mb-4">
              <div class="card-header bg-secondary text-white">
                <h5 class="mb-0">🛠️ Technology Stack</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <h6>Backend</h6>
                    <ul class="small">
                      <li>Python 3.12+</li>
                      <li>Flask 3.1</li>
                      <li>SQLAlchemy</li>
                      <li>Flask-Login</li>
                    </ul>
                  </div>
                  <div class="col-md-4">
                    <h6>Frontend</h6>
                    <ul class="small">
                      <li>HTMX 2.0</li>
                      <li>Alpine.js 3.14</li>
                      <li>Bootstrap 5</li>
                      <li>CodeMirror 6</li>
                    </ul>
                  </div>
                  <div class="col-md-4">
                    <h6>Build Tools</h6>
                    <ul class="small">
                      <li>Bun 1.2.21</li>
                      <li>Rollup</li>
                      <li>PostCSS</li>
                      <li>Storybook 8.6</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header bg-dark text-white">
                <h5 class="mb-0">📚 Resources</h5>
              </div>
              <div class="card-body">
                <ul>
                  <li><a href="https://github.com/verlyn13/journal" target="_blank">GitHub Repository</a></li>
                  <li><a href="https://flask.palletsprojects.com/" target="_blank">Flask Documentation</a></li>
                  <li><a href="https://htmx.org/" target="_blank">HTMX Documentation</a></li>
                  <li><a href="https://alpinejs.dev/" target="_blank">Alpine.js Documentation</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    return container;
  },
};

export const GettingStarted = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'p-5';
    container.innerHTML = `
      <div class="container-fluid">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <h1 class="display-5 text-primary mb-4">🚀 Getting Started</h1>
            
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Prerequisites</h5>
              </div>
              <div class="card-body">
                <ul>
                  <li>Python 3.12 or higher</li>
                  <li>Bun 1.2.21 or higher (or Node.js 20+)</li>
                  <li>Git</li>
                </ul>
              </div>
            </div>
            
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Installation Steps</h5>
              </div>
              <div class="card-body">
                <ol>
                  <li class="mb-3">
                    <strong>Clone the repository:</strong>
                    <pre class="bg-dark text-light p-2 rounded mt-1"><code>git clone https://github.com/verlyn13/journal.git
cd journal</code></pre>
                  </li>
                  <li class="mb-3">
                    <strong>Install JavaScript dependencies:</strong>
                    <pre class="bg-dark text-light p-2 rounded mt-1"><code>bun install</code></pre>
                  </li>
                  <li class="mb-3">
                    <strong>Install Python dependencies:</strong>
                    <pre class="bg-dark text-light p-2 rounded mt-1"><code>uv sync</code></pre>
                  </li>
                  <li class="mb-3">
                    <strong>Build frontend assets:</strong>
                    <pre class="bg-dark text-light p-2 rounded mt-1"><code>bun run build</code></pre>
                  </li>
                  <li class="mb-3">
                    <strong>Initialize the database:</strong>
                    <pre class="bg-dark text-light p-2 rounded mt-1"><code>uv run python -c "from journal import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"</code></pre>
                  </li>
                  <li class="mb-3">
                    <strong>Run the application:</strong>
                    <pre class="bg-dark text-light p-2 rounded mt-1"><code>uv run python run.py</code></pre>
                  </li>
                  <li>
                    <strong>Open your browser:</strong>
                    <p class="mt-1">Navigate to <code>http://localhost:5000</code></p>
                  </li>
                </ol>
              </div>
            </div>
            
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Development Commands</h5>
              </div>
              <div class="card-body">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Command</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>npm run py:dev</code></td>
                      <td>Run Flask development server</td>
                    </tr>
                    <tr>
                      <td><code>npm run dev</code></td>
                      <td>Watch and rebuild frontend assets</td>
                    </tr>
                    <tr>
                      <td><code>npm run storybook</code></td>
                      <td>Run Storybook development server</td>
                    </tr>
                    <tr>
                      <td><code>npm run test</code></td>
                      <td>Run Playwright tests</td>
                    </tr>
                    <tr>
                      <td><code>npm run py:test</code></td>
                      <td>Run Python tests</td>
                    </tr>
                    <tr>
                      <td><code>npm run lint:all</code></td>
                      <td>Lint JavaScript and Python code</td>
                    </tr>
                    <tr>
                      <td><code>npm run format:all</code></td>
                      <td>Format all code</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="alert alert-success">
              <h5 class="alert-heading">🎉 Ready to Journal!</h5>
              <p>Once the application is running, you can:</p>
              <ul class="mb-0">
                <li>Create a new account</li>
                <li>Start writing journal entries</li>
                <li>Organize entries with tags</li>
                <li>Search and filter your entries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    return container;
  },
};