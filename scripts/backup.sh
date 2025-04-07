#!/bin/bash
set -e

# --- Configuration ---
# !!! IMPORTANT: Set these paths correctly for your environment !!!
BACKUP_DIR="/home/verlyn13/journal_backups" # Directory to store backups
DB_PATH="/home/verlyn13/Projects/journal/journal.db" # Path to the SQLite database file
DAYS_TO_KEEP=7 # Optional: Number of days of backups to keep (0 to keep all)
# --- End Configuration ---

TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_FILENAME="journal_backup_${TIMESTAMP}.db"
BACKUP_FILE_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "Starting backup..."

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"
if [ ! -d "${BACKUP_DIR}" ]; then
    echo "Error: Could not create backup directory: ${BACKUP_DIR}"
    exit 1
fi

# Check if database file exists
if [ ! -f "${DB_PATH}" ]; then
    echo "Error: Database file not found: ${DB_PATH}"
    exit 1
fi

echo "Backing up database to ${BACKUP_FILE_PATH}..."
sqlite3 "${DB_PATH}" ".backup '${BACKUP_FILE_PATH}'"

if [ $? -eq 0 ]; then
    echo "Backup successful: ${BACKUP_FILE_PATH}"
else
    echo "Error: Backup failed!"
    exit 1
fi

# Optional: Clean up old backups
if [ "${DAYS_TO_KEEP}" -gt 0 ]; then
    echo "Cleaning up backups older than ${DAYS_TO_KEEP} days..."
    find "${BACKUP_DIR}" -name 'journal_backup_*.db' -mtime +"${DAYS_TO_KEEP}" -exec echo "Deleting old backup: {}" \; -exec rm {} \;
    echo "Cleanup finished."
fi

echo "Backup process complete."