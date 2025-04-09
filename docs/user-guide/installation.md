---
title: "Flask Journal Installation Guide"
description: "Instructions for setting up and running the Flask Journal application for local development"
category: "User Documentation"
version: "1.0"
tags: ["installation", "setup", "configuration", "development"]
---

# Flask Journal Installation Guide

This guide provides step-by-step instructions for setting up the Flask Journal application for local development.

## Prerequisites

Before installing Flask Journal, ensure you have the following prerequisites installed on your system:

- **Python 3.8+** - The backend is built with Flask, which requires Python
- **pip** - Python package manager
- **Node.js 14+** - Required for building frontend assets
- **npm** - Node.js package manager
- **Git** - For cloning the repository (optional)

## Installation Steps

### 1. Clone or Download the Repository

Clone the repository using Git:

```bash
git clone https://github.com/verlyn13/journal.git
cd journal
```

Alternatively, download and extract the ZIP archive from the repository's releases page.

### 2. Set Up a Python Virtual Environment

It's recommended to use a virtual environment to isolate the Python dependencies:

```bash
# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows
.venv\Scripts\activate
# On macOS/Linux
source .venv/bin/activate
```

### 3. Install Python Dependencies

Once your virtual environment is activated, install the required Python packages:

```bash
pip install -r requirements.txt
```

### 4. Install JavaScript Dependencies

Install the required npm packages for the frontend components:

```bash
npm install
```

### 5. Build Frontend Assets

Compile the JavaScript and CSS assets:

```bash
npm run build
```

For development with automatic rebuilding when files change:

```bash
npm run dev
```

### 6. Configure the Application

The application uses a configuration file for various settings. Copy the example configuration and modify as needed:

```bash
# If a config.py file doesn't already exist
cp config.example.py config.py
```

Edit `config.py` to adjust settings such as:
- Database URI
- Secret key (for session security)
- Debug mode
- Other application-specific configurations

### 7. Initialize the Database

Set up the database with the required tables:

```bash
# Set the Flask application
export FLASK_APP=run.py

# Initialize the database (first time only)
flask db upgrade
```

### 8. Run the Application

Start the Flask development server:

```bash
# Enable debug mode for development
export FLASK_DEBUG=1

# Run the application
flask run
```

The application should now be running at `http://127.0.0.1:5000`.

## Development Workflow

For an efficient development workflow:

1. Run the Flask server in one terminal:
   ```bash
   source .venv/bin/activate
   export FLASK_APP=run.py
   export FLASK_DEBUG=1
   flask run
   ```

2. Run the frontend build process in another terminal:
   ```bash
   npm run dev
   ```

This setup will:
- Automatically reload the Flask server when Python files change
- Rebuild and update frontend assets when JavaScript or CSS files change

## Deployment Scripts

For deployment to a production environment, the project includes helpful scripts:

- `scripts/deploy.sh` - Assists with deployment to a production server
- `scripts/backup.sh` - Creates backups of the application data

Refer to the deployment documentation for more information on production deployment.

## Troubleshooting

If you encounter issues during installation:

1. Ensure all prerequisites are correctly installed
2. Verify that your virtual environment is activated when running Python commands
3. Check the console for error messages
4. Refer to the [Troubleshooting Guide](troubleshooting.md) for common issues and solutions

## Next Steps

After successful installation:

1. Create an account by navigating to the registration page
2. Log in with your new credentials
3. Start creating journal entries

Refer to the [User Guide](README.md) for detailed instructions on using the application's features.

## Updating the Application

To update the application to the latest version:

1. Pull the latest changes from the repository
   ```bash
   git pull
   ```

2. Update dependencies
   ```bash
   pip install -r requirements.txt
   npm install
   ```

3. Rebuild frontend assets
   ```bash
   npm run build
   ```

4. Apply any database migrations
   ```bash
   flask db upgrade
   ```

5. Restart the application

---

If you encounter any issues not covered in this guide, please refer to the project's issue tracker or contact the development team.