# Running the Journal Application

The Journal is a full-stack Flask web application for personal journaling. It's not just a static site - it requires a backend server to run.

## Quick Start

### 1. Install Dependencies

```bash
# Install JavaScript dependencies
bun install

# Install Python dependencies  
uv sync
```

### 2. Build Frontend Assets

```bash
bun run build
```

### 3. Initialize the Database

```bash
uv run python -c "from journal import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

### 4. Run the Application

```bash
# Option 1: Using Python directly
uv run python run.py

# Option 2: Using npm script
npm run py:dev
```

### 5. Access the Application

Open your browser and navigate to: **http://localhost:5000**

## What You'll See

- **Login Page**: Create a new account or log in
- **Journal Dashboard**: View all your journal entries
- **Create Entry**: Write new journal entries with Markdown support
- **Edit/Delete**: Manage your existing entries
- **Tags**: Organize entries with tags
- **Search**: Find entries by content or tags

## Development Mode

For development with hot-reload:

```bash
# Terminal 1: Run Flask backend
npm run py:dev

# Terminal 2: Watch and rebuild frontend assets
npm run dev

# Terminal 3 (optional): Run Storybook for component development
npm run storybook
```

## Storybook (Component Documentation)

The Storybook at https://journal.jefahnierocks.com/storybook/ shows the UI components used in the application, but to actually use the journaling features, you need to run the Flask application locally.

## Tech Stack

- **Backend**: Python Flask, SQLAlchemy, Flask-Login
- **Frontend**: HTMX, Alpine.js, Bootstrap 5
- **Editor**: CodeMirror 6 with Markdown support
- **Build**: Bun/Rollup for asset bundling

## Troubleshooting

If you get a database error:
```bash
# Remove old database and recreate
rm journal.db
uv run python -c "from journal import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

If you get a port already in use error:
```bash
# Change the port in run.py or use environment variable
FLASK_RUN_PORT=5001 uv run python run.py
```