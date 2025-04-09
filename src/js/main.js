/**
 * @fileoverview Main entry point for the Flask Journal JavaScript application.
 * Initializes Alpine.js and registers custom components.
 * @module main
 * @author Flask Journal Team
 */

import Alpine from 'alpinejs';
import editorComponent from './editor/alpine-component';

/**
 * Make Alpine available globally for debugging and extension.
 * @type {Object}
 */
window.Alpine = Alpine;

/**
 * Global Alpine error handler to capture and log errors.
 * Provides detailed information about errors that occur within Alpine components.
 *
 * @param {Error} error - The error that was thrown
 * @param {Object} component - The Alpine component where the error occurred
 * @param {HTMLElement} el - The DOM element associated with the component
 * @example
 * // Example error that would be caught:
 * // In a component: x-on:click="nonExistentFunction()"
 */
Alpine.onerror = (error, component, el) => {
    console.error('[Alpine Error] Unhandled error occurred:');
    console.error(' > Error:', error);
    console.error(' > Component:', component.$data); // Log component's data
    console.error(' > Element:', el);

    // In a production environment, you might send this error to a logging service
    // Example: if (process.env.NODE_ENV === 'production') { sendErrorToServer(error, component, el); }
};


/**
 * Event listener for Alpine's initialization event.
 * Registers custom components after Alpine has initialized.
 * 
 * @listens alpine:init
 * @example
 * // This registers the editor component to be used with x-data:
 * // <div x-data="editor"></div>
 */
document.addEventListener('alpine:init', () => {
    console.log("Alpine initialized, registering components...");
    
    /**
     * Register the editor component with Alpine.
     * This makes the editor available as an Alpine component throughout the application.
     * 
     * @see module:editor/alpine-component
     */
    Alpine.data('editor', editorComponent);
    console.log("Editor component registered.");
});

/**
 * Initialize Alpine.js.
 * This triggers the 'alpine:init' event and starts the application.
 */
Alpine.start();

console.log("Alpine.js initialized and editor component registered.");