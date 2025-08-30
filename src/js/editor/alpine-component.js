/**
 * @fileoverview Alpine.js component that handles the Markdown editor functionality for Flask Journal.
 * Manages editor state, content persistence, preview generation, and toolbar actions.
 * @module editor/alpine-component
 * @author Flask Journal Team
 */

import { createEditor } from "./setup";
import { EditorPersistence } from "./persistence";
// Import specific actions instead of the generic one for new buttons
import {
	insertBold,
	insertItalic,
	insertLink,
	insertList,
	insertBlockquote,
	// Keep old ones for reference or if uncommented later
	// insertImage,
	// insertTable,
	// insertCodeBlock
} from "./toolbar-actions";
// Keep generic helper if needed by older buttons (Image, Table, Code Block)
import { insertMarkdownSyntax } from "./toolbar-actions";
import { debounce } from "../utils/debounce";

/**
 * Editor component state and behavior definition for Alpine.js.
 * Creates a complete editor component with editing, preview, and toolbar functionality.
 *
 * @typedef {Object} EditorComponentState
 * @property {Object|null} editorView - The CodeMirror editor instance
 * @property {string} content - The current content of the editor
 * @property {string} previewHtml - The rendered HTML preview of the content
 * @property {string} mode - The current editor mode ('edit', 'split', or 'preview')
 * @property {boolean} isLoadingPreview - Whether a preview is currently being generated
 * @property {Object} persistence - The EditorPersistence instance for draft management
 * @property {string|null} entryId - The ID of the entry being edited, or null for new entries
 * @property {string} lastSavedContent - The last saved version of the content
 */

/**
 * Creates an Alpine.js component for the Markdown editor.
 * Handles initialization, content management, preview generation, and toolbar actions.
 *
 * @param {string|null} entryId - The ID of the entry being edited, or null for a new entry
 * @returns {EditorComponentState} The Alpine.js component state and methods
 * @example
 * // Used in an Alpine.js component:
 * <div x-data="editor('123')">
 *   <!-- Editor interface elements -->
 * </div>
 */
export default function editorComponent(entryId = null) {
	// Removed initialContent parameter
	return {
		// --- State ---
		editorView: null, // CodeMirror instance
		content: "", // Initialized empty, will be set in init
		previewHtml: "", // Rendered HTML preview
		mode: "edit", // 'edit', 'split', 'preview'
		isLoadingPreview: false,
		persistence: null,
		entryId: entryId,
		lastSavedContent: "", // Initialized empty, will be set in init

		/**
		 * Initializes the editor component.
		 * Sets up the editor state, loads initial content, and establishes auto-save functionality.
		 * Uses a MutationObserver to reliably find the target DOM element (`x-ref="editorElement"`)
		 * before creating the CodeMirror instance, ensuring initialization occurs correctly even with potential DOM rendering delays.
		 *
		 * @method
		 * @example
		 * // Called automatically by Alpine.js when component is initialized
		 */
		init() {
			console.log(
				`[EditorComponent] Initializing for entryId: ${this.entryId || "new"}`,
			);
			// Read initial content from the JSON script tag
			let initialContent = "";
			const scriptTagId = "initial-entry-data"; // Use the fixed ID specified in Task 1.2
			const scriptTag = document.getElementById(scriptTagId);
			if (scriptTag) {
				try {
					const jsonData = JSON.parse(scriptTag.textContent);
					initialContent = jsonData.content || ""; // Extract content, fallback to empty string
					console.log(
						`[EditorComponent] Parsed initial content from #${scriptTagId}. Length: ${initialContent.length}`,
					);
				} catch (e) {
					console.error(
						`[EditorComponent] Error parsing initial content JSON from #${scriptTagId}:`,
						e,
					);
					initialContent = ""; // Fallback to empty string on error
				}
			} else {
				console.warn(
					`[EditorComponent] Initial content script tag #${scriptTagId} not found. Editor will start empty.`,
				);
			}

			this.persistence = new EditorPersistence(this.entryId);
			// Check for success flash message *before* loading draft
			// If found, it means the form was just submitted successfully.
			const successFlash = document.querySelector(".flash-success");
			if (successFlash) {
				console.log(
					"[EditorComponent] Success flash message detected, clearing draft.",
				);
				this.persistence.clearDraft();
				// Optionally remove the flash message after clearing draft
				// successFlash.remove();
			}

			// Load draft or use initial content
			const draft = this.persistence.loadDraft();
			if (draft !== null && draft !== initialContent) {
				console.log("[EditorComponent] Applying saved draft.");
				this.content = draft;
			} else {
				this.content = initialContent; // Use initial content if no draft or draft matches
			}
			// console.log('[EditorComponent] Draft loading enabled.'); // Optional: uncomment for debugging
			this.lastSavedContent = this.content; // Initialize last saved state

			// console.log('[EditorComponent/init] Refs available right before $nextTick:', this.$refs); // Removed diagnostic log

			// Use MutationObserver to wait for the editor element to appear
			const observer = new MutationObserver((mutationsList, obs) => {
				// Check if the target element exists now
				const editorTargetElement = this.$el.querySelector(
					'[x-ref="editorElement"]',
				);

				if (editorTargetElement) {
					console.log(
						"[EditorComponent/Observer] Found editorElement, initializing CodeMirror...",
					);
					obs.disconnect(); // Stop observing once found

					// Log the content before creating the editor
					console.log(
						"[EditorComponent/Observer] Content being passed to createEditor:",
						this.content,
					);
					// Create CodeMirror instance
					try {
						this.editorView = createEditor(
							editorTargetElement, // Use the found element
							this.content, // Use the potentially updated content (from draft/initial)
							{
								// Pass options object
								onChange: (newContent) => {
									// Update Alpine state and trigger debounced save/preview
									this.content = newContent;
									this.handleContentChange();
								},
								// additionalExtensions: [] // Example if we needed more extensions
							},
						);
						console.log(
							"[EditorComponent/Observer] CodeMirror editor created successfully.",
						);

						// Initial preview update if starting in split/preview mode
						if (this.mode === "split" || this.mode === "preview") {
							console.log(
								`[EditorComponent/Observer] Initial mode is '${this.mode}', triggering initial preview update.`,
							);
							this.updatePreview();
						}
					} catch (error) {
						console.error(
							"[EditorComponent/Observer] Error creating CodeMirror editor:",
							error,
						);
					}
				} else {
					// console.log('[EditorComponent/Observer] editorElement not found yet...'); // Optional: for debugging
				}
			});

			// Start observing the component's root element for child additions/removals
			// Use $nextTick to ensure $el is available when starting the observer
			this.$nextTick(() => {
				console.log(
					"[EditorComponent/init] Starting MutationObserver to find editorElement.",
				);
				// Check if element already exists before observing (edge case)
				const initialCheckElement = this.$el.querySelector(
					'[x-ref="editorElement"]',
				);
				if (initialCheckElement) {
					console.log(
						"[EditorComponent/init] editorElement found immediately, initializing without observer.",
					);
					// Directly initialize if found immediately (avoids observer callback complexity)
					try {
						// Log the content before creating the editor
						console.log(
							"[EditorComponent/init] Content being passed to createEditor (immediate check):",
							this.content,
						);
						this.editorView = createEditor(initialCheckElement, this.content, {
							onChange: (newContent) => {
								this.content = newContent;
								this.handleContentChange();
							},
						});
						console.log(
							"[EditorComponent/init] CodeMirror editor created successfully (immediate check).",
						);
						if (this.mode === "split" || this.mode === "preview") {
							this.updatePreview();
						}
					} catch (error) {
						console.error(
							"[EditorComponent/init] Error creating CodeMirror editor (immediate check):",
							error,
						);
					}
				} else {
					// If not found immediately, start the observer
					observer.observe(this.$el, { childList: true, subtree: true });
				}
			});

			// Auto-save draft periodically (e.g., every 10 seconds)
			// Consider clearing interval in a cleanup method if component can be destroyed
			setInterval(() => {
				this.saveDraftIfNeeded();
				// console.log('[EditorComponent/Interval] Checking if draft save needed...'); // Optional: Can be noisy
			}, 10000); // 10 seconds

			// Save draft on page unload/close
			window.addEventListener("beforeunload", () => {
				console.log(
					"[EditorComponent/beforeunload] Saving draft before page unload...",
				);
				this.saveDraftIfNeeded();
			});

			console.log("[EditorComponent] Initialization complete.");
		},

		// --- Methods ---
		/**
		 * Debounced handler for content changes in the editor.
		 * Saves drafts and updates preview when content changes.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 */
		handleContentChange: debounce(function () {
			// Debounced function called after CodeMirror content changes
			console.log(
				"[EditorComponent/handleContentChange] Content changed (debounced).",
			);
			this.saveDraftIfNeeded(); // Save draft if content changed
			if (this.mode === "split" || this.mode === "preview") {
				this.updatePreview();
			}
		}, 500), // Debounce time in ms (adjust as needed)

		/**
		 * Sets the editor mode and triggers preview update if needed.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @param {string} newMode - The mode to set ('edit', 'split', or 'preview')
		 * @example
		 * // Change to split view mode (editor and preview side by side)
		 * this.setMode('split');
		 */
		setMode(newMode) {
			if (["edit", "split", "preview"].includes(newMode)) {
				this.mode = newMode;
				console.log(`[EditorComponent/setMode] Mode set to: ${this.mode}`);
				if (
					(newMode === "split" || newMode === "preview") &&
					!this.previewHtml
				) {
					// Fetch preview immediately if switching to a mode that needs it
					console.log(
						`[EditorComponent/setMode] Mode requires preview ('${newMode}'), triggering update.`,
					);
					this.updatePreview();
				}
				// Potentially trigger layout adjustments via CSS classes bound to 'mode'
			}
		},

		/**
		 * Updates the HTML preview of the Markdown content.
		 * Sends the current content to the server for rendering and updates the preview.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @async
		 * @returns {Promise<void>}
		 * @example
		 * // Update the preview when content changes
		 * await this.updatePreview();
		 */
		async updatePreview() {
			if (this.isLoadingPreview) return; // Prevent concurrent requests
			this.isLoadingPreview = true;
			console.log("[EditorComponent/updatePreview] Starting preview update...");
			// Get CSRF token from meta tag
			const csrfToken = document
				.querySelector('meta[name="csrf-token"]')
				?.getAttribute("content");
			if (!csrfToken) {
				console.error(
					"[EditorComponent/updatePreview] CSRF token meta tag not found!",
				);
				this.previewHtml =
					'<p class="error">Configuration error: CSRF token missing.</p>';
				this.isLoadingPreview = false;
				return;
			}

			try {
				const response = await fetch("/api/v1/markdown/preview", {
					// Corrected URL
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						"X-CSRFToken": csrfToken, // Add CSRF token header
					},
					body: JSON.stringify({ text: this.content }),
				});

				if (!response.ok) {
					const errorText = await response.text(); // Attempt to get error body
					console.error(
						`[EditorComponent/updatePreview] Preview API request failed: ${response.status}`,
						errorText,
					);
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				this.previewHtml = data.html; // Update the preview content
				// console.log('[EditorComponent/updatePreview] Preview fetched successfully.'); // Optional debug log

				// Use $nextTick to ensure DOM is updated before typesetting
				this.$nextTick(() => {
					// Check if the preview element exists before typesetting
					const previewElement = this.$refs.previewContent;
					if (
						previewElement &&
						window.MathJax &&
						window.MathJax.typesetPromise
					) {
						// console.log('[EditorComponent/updatePreview/$nextTick] Triggering MathJax typesetting...'); // Optional debug log
						// Ensure MathJax typesets only the updated preview area
						window.MathJax.typesetPromise([previewElement]).catch((err) =>
							console.error(
								"[EditorComponent/updatePreview/$nextTick] MathJax typesetting failed:",
								err,
							),
						);
					} else if (!previewElement) {
						console.warn(
							"[EditorComponent/updatePreview/$nextTick] Preview element (x-ref='previewContent') not found for MathJax.",
						);
					} else {
						console.warn(
							"[EditorComponent/updatePreview/$nextTick] MathJax not available or not configured for typesetting.",
						);
					}
				});
			} catch (error) {
				console.error(
					"[EditorComponent/updatePreview] Error fetching Markdown preview:",
					error,
				);
				this.previewHtml = `<p class="error">Error loading preview: ${error.message}</p>`;
			} finally {
				this.isLoadingPreview = false;
				// console.log('[EditorComponent/updatePreview] Preview update finished.'); // Optional debug log
			}
		},

		/**
		 * Saves the current content as a draft if it has changed since the last save.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @example
		 * // Check if content has changed and save draft if needed
		 * this.saveDraftIfNeeded();
		 */
		saveDraftIfNeeded() {
			// console.log('[EditorComponent/saveDraftIfNeeded] Checking if draft needs saving...'); // Optional: Can be noisy
			if (this.content !== this.lastSavedContent) {
				console.log(
					"[EditorComponent/saveDraftIfNeeded] Content changed, saving draft...",
				);
				this.persistence.saveDraft(this.content);
				this.lastSavedContent = this.content; // Update last saved state
			}
		},

		/**
		 * Clears the saved draft for the current entry.
		 * Called when the containing form is successfully submitted.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 */
		clearDraftOnSubmit() {
			console.log(
				"[EditorComponent/clearDraftOnSubmit] Form submitted, clearing draft.",
			);
			if (this.persistence) {
				this.persistence.clearDraft();
			} else {
				console.warn(
					"[EditorComponent/clearDraftOnSubmit] Persistence object not available.",
				);
			}
		},

		// --- Toolbar Actions ---
		/**
		 * Inserts various Markdown syntax elements at the current cursor position.
		 * Dispatches to specific insertion functions based on the requested type.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @param {string} type - The type of Markdown syntax to insert ('bold', 'italic', 'link', etc.)
		 * @example
		 * // Insert a Markdown link at the current cursor position
		 * this.insertMarkdown('link');
		 */
		insertMarkdown(type) {
			if (!this.editorView) {
				console.warn(
					"[EditorComponent/insertMarkdown] EditorView not available.",
				);
				return;
			}
			// console.log(`[EditorComponent/insertMarkdown] Inserting markdown type: ${type}`); // Optional debug log
			switch (type) {
				case "bold":
					insertBold(this.editorView);
					break;
				case "italic":
					insertItalic(this.editorView);
					break;
				case "link":
					insertLink(this.editorView);
					break;
				case "ul":
				case "ol":
					insertList(this.editorView, type);
					break;
				case "blockquote":
					insertBlockquote(this.editorView);
					break;
				// Keep old actions using the generic helper for now
				case "image":
					insertMarkdownSyntax(this.editorView, "![", "](url)", "alt text");
					break;
				case "table":
					const table = `| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |`;
					insertMarkdownSyntax(this.editorView, "", "", table, true);
					break;
				case "codeblock":
					insertMarkdownSyntax(
						this.editorView,
						"```\n",
						"\n```",
						"code here",
						true,
					);
					break;
				default:
					console.warn(
						`[EditorComponent/insertMarkdown] Unknown markdown type: ${type}`,
					);
			}
		},

		/**
		 * Inserts an image Markdown syntax at the current cursor position.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @deprecated Use insertMarkdown('image') instead
		 */
		insertImage() {
			this.insertMarkdown("image"); // Delegate to the new handler
		},

		/**
		 * Inserts a table Markdown syntax at the current cursor position.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @deprecated Use insertMarkdown('table') instead
		 */
		insertTable() {
			this.insertMarkdown("table"); // Delegate to the new handler
		},

		/**
		 * Inserts a code block Markdown syntax at the current cursor position.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @deprecated Use insertMarkdown('codeblock') instead
		 */
		insertCodeBlock() {
			this.insertMarkdown("codeblock"); // Delegate to the new handler
		},

		/**
		 * Exports the current content as a PDF file.
		 * Currently a placeholder for future implementation.
		 *
		 * @method
		 * @memberof EditorComponentState
		 * @instance
		 * @todo Implement PDF export functionality
		 */
		exportPDF() {
			alert("PDF Export functionality not yet implemented.");
		},
	};
}
