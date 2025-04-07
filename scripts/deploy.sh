#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "Starting deployment..."

# Navigate to project directory (assuming script is run from project root)
# cd /home/verlyn13/Projects/journal || exit # Uncomment and adjust if needed

echo "Pulling latest changes..."
git pull origin main # Or your default branch

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing/updating dependencies..."
pip install -r requirements.txt

echo "Applying database migrations..."
# Ensure FLASK_APP is set if running outside an activated env with it exported
export FLASK_APP=run.py
flask db upgrade

echo "Restarting application service..."
# This requires sudo and assumes the service file was copied and enabled manually
sudo systemctl restart journal.service # Assumes service name is 'journal'

echo "Deployment finished."