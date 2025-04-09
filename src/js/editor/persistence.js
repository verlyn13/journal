/**
 * Basic draft persistence using localStorage.
 */
export class EditorPersistence {
    constructor(entryId) {
        // Use a specific key for existing entries, or a generic one for new entries
        this.storageKey = entryId ? `journal_draft_${entryId}` : 'journal_draft_new';
        console.log(`Persistence initialized for key: ${this.storageKey}`);
    }

    /**
     * Saves the current editor content as a draft.
     * @param {string} content - The content to save.
     */
    saveDraft(content) {
        try {
            localStorage.setItem(this.storageKey, content);
            console.log(`Draft saved for ${this.storageKey}`);
        } catch (e) {
            console.error("Error saving draft to localStorage:", e);
            // Handle potential storage errors (e.g., quota exceeded)
        }
    }

    /**
     * Loads a saved draft.
     * @returns {string | null} The saved content, or null if no draft exists or an error occurs.
     */
    loadDraft() {
        try {
            const draft = localStorage.getItem(this.storageKey);
            if (draft) {
                console.log(`Draft loaded for ${this.storageKey}`);
            } else {
                console.log(`No draft found for ${this.storageKey}`);
            }
            return draft;
        } catch (e) {
            console.error("Error loading draft from localStorage:", e);
            return null;
        }
    }

    /**
     * Clears the saved draft.
     */
    clearDraft() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log(`Draft cleared for ${this.storageKey}`);
        } catch (e) {
            console.error("Error clearing draft from localStorage:", e);
        }
    }
}