#!/usr/bin/env bun

/**
 * Enhanced Documentation Fetcher for Biome and Bun
 * Features:
 * - Resume from failed runs
 * - Progress tracking with ETA
 * - Caching to avoid re-fetching
 * - Retry logic with exponential backoff
 * - Validation of fetched content
 * - Parallel fetching with concurrency control
 * - Detailed logging and error reporting
 */

import {
	existsSync,
	mkdirSync,
	writeFileSync,
	readFileSync,
	statSync,
} from "fs";
import { join, dirname } from "path";
import { createHash } from "crypto";

// Configuration
const CONFIG = {
	cacheDir: ".docs-cache",
	stateFile: ".docs-fetch-state.json",
	maxConcurrency: 3,
	maxRetries: 3,
	retryDelay: 1000,
	cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours
	minContentLength: 100, // Minimum valid content length
	userAgent:
		"Mozilla/5.0 (compatible; JournalDocsFetcher/2.0; +https://github.com/verlyn13/journal)",
	timeout: 30000, // 30 seconds
};

// Types
interface Page {
	path: string;
	name: string;
	category: string;
}

interface Source {
	base: string;
	pages: Page[];
}

interface FetchState {
	completed: string[];
	failed: { url: string; error: string; attempts: number }[];
	lastRun: string;
	version: string;
}

interface CacheEntry {
	url: string;
	content: string;
	timestamp: number;
	hash: string;
}

// Documentation sources
const DOCS_SOURCES: Record<string, Source> = {
	biome: {
		base: "https://biomejs.dev",
		pages: [
			// Guides
			{
				path: "/guides/getting-started",
				name: "getting-started.md",
				category: "guides",
			},
			{
				path: "/guides/configure-biome",
				name: "configure-biome.md",
				category: "guides",
			},
			{
				path: "/guides/migrate-eslint-prettier",
				name: "migrate-eslint-prettier.md",
				category: "guides",
			},
			{
				path: "/guides/editors/first-party-extensions",
				name: "editor-extensions.md",
				category: "guides",
			},

			// Reference
			{
				path: "/reference/configuration",
				name: "configuration.md",
				category: "reference",
			},
			{ path: "/reference/cli", name: "cli.md", category: "reference" },
			{ path: "/linter", name: "linter.md", category: "reference" },
			{ path: "/formatter", name: "formatter.md", category: "reference" },

			// Recipes
			{
				path: "/recipes/continuous-integration",
				name: "ci-setup.md",
				category: "recipes",
			},

			// Internals
			{
				path: "/internals/architecture",
				name: "architecture.md",
				category: "internals",
			},
			{
				path: "/internals/changelog",
				name: "changelog.md",
				category: "internals",
			},
		],
	},
	bun: {
		base: "https://bun.sh",
		pages: [
			// Getting Started
			{
				path: "/docs/installation",
				name: "installation.md",
				category: "getting-started",
			},
			{
				path: "/docs/cli/install",
				name: "package-manager.md",
				category: "getting-started",
			},
			{
				path: "/docs/quickstart",
				name: "quickstart.md",
				category: "getting-started",
			},

			// Configuration
			{
				path: "/docs/runtime/bunfig",
				name: "bunfig.md",
				category: "configuration",
			},
			{
				path: "/docs/typescript",
				name: "typescript.md",
				category: "configuration",
			},

			// Features
			{ path: "/docs/bundler", name: "bundler.md", category: "features" },
			{ path: "/docs/test/writing", name: "testing.md", category: "features" },
			{
				path: "/docs/runtime/modules",
				name: "modules.md",
				category: "features",
			},
			{ path: "/docs/runtime/shell", name: "shell.md", category: "features" },

			// API
			{ path: "/docs/api/sqlite", name: "sql.md", category: "api" },
			{ path: "/docs/api/http", name: "http-server.md", category: "api" },
			{ path: "/docs/api/websockets", name: "websockets.md", category: "api" },
			{ path: "/docs/api/file-io", name: "file-io.md", category: "api" },

			// Deployment
			{
				path: "/docs/bundler/executables",
				name: "standalone-executables.md",
				category: "deployment",
			},
			{
				path: "/docs/runtime/env",
				name: "environment-variables.md",
				category: "deployment",
			},
		],
	},
};

// Progress tracking
class ProgressTracker {
	private total: number;
	private completed: number;
	private startTime: number;
	private currentTask: string = "";

	constructor(total: number) {
		this.total = total;
		this.completed = 0;
		this.startTime = Date.now();
	}

	update(task: string) {
		this.currentTask = task;
		this.render();
	}

	complete() {
		this.completed++;
		this.render();
	}

	private render() {
		const percentage = Math.round((this.completed / this.total) * 100);
		const elapsed = Date.now() - this.startTime;
		const eta =
			this.completed > 0
				? Math.round((elapsed / this.completed) * (this.total - this.completed))
				: 0;

		const barLength = 30;
		const filled = Math.round((this.completed / this.total) * barLength);
		const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

		process.stdout.write(
			`\r[${bar}] ${percentage}% | ${this.completed}/${this.total} | ETA: ${this.formatTime(eta)} | ${this.currentTask}`,
		);

		if (this.completed === this.total) {
			console.log("\n✅ Complete!");
		}
	}

	private formatTime(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
		return `${seconds}s`;
	}
}

// Cache management
class CacheManager {
	private cacheDir: string;

	constructor(cacheDir: string) {
		this.cacheDir = cacheDir;
		this.ensureDir(cacheDir);
	}

	private ensureDir(dir: string) {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	}

	private getCachePath(url: string): string {
		const hash = createHash("md5").update(url).digest("hex");
		return join(this.cacheDir, `${hash}.json`);
	}

	get(url: string): CacheEntry | null {
		const cachePath = this.getCachePath(url);

		if (!existsSync(cachePath)) {
			return null;
		}

		try {
			const data = JSON.parse(readFileSync(cachePath, "utf-8"));
			const age = Date.now() - data.timestamp;

			if (age > CONFIG.cacheMaxAge) {
				return null; // Cache expired
			}

			return data;
		} catch {
			return null;
		}
	}

	set(url: string, content: string): void {
		const cachePath = this.getCachePath(url);
		const entry: CacheEntry = {
			url,
			content,
			timestamp: Date.now(),
			hash: createHash("md5").update(content).digest("hex"),
		};

		writeFileSync(cachePath, JSON.stringify(entry, null, 2));
	}

	clear(): void {
		// Clear old cache entries
		if (existsSync(this.cacheDir)) {
			const fs = require("fs");
			const files = fs.readdirSync(this.cacheDir);
			for (const file of files) {
				const path = join(this.cacheDir, file);
				try {
					const stats = statSync(path);
					const age = Date.now() - stats.mtimeMs;
					if (age > CONFIG.cacheMaxAge * 2) {
						fs.unlinkSync(path);
					}
				} catch {
					// Ignore errors
				}
			}
		}
	}
}

// State management
class StateManager {
	private stateFile: string;
	private state: FetchState;

	constructor(stateFile: string) {
		this.stateFile = stateFile;
		this.state = this.load();
	}

	private load(): FetchState {
		if (existsSync(this.stateFile)) {
			try {
				return JSON.parse(readFileSync(this.stateFile, "utf-8"));
			} catch {
				// Invalid state file
			}
		}

		return {
			completed: [],
			failed: [],
			lastRun: new Date().toISOString(),
			version: "2.0.0",
		};
	}

	save(): void {
		writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
	}

	markCompleted(url: string): void {
		if (!this.state.completed.includes(url)) {
			this.state.completed.push(url);
		}
		// Remove from failed if present
		this.state.failed = this.state.failed.filter((f) => f.url !== url);
		this.save();
	}

	markFailed(url: string, error: string): void {
		const existing = this.state.failed.find((f) => f.url === url);
		if (existing) {
			existing.attempts++;
			existing.error = error;
		} else {
			this.state.failed.push({ url, error, attempts: 1 });
		}
		this.save();
	}

	isCompleted(url: string): boolean {
		return this.state.completed.includes(url);
	}

	getFailedUrls(): string[] {
		return this.state.failed
			.filter((f) => f.attempts < CONFIG.maxRetries)
			.map((f) => f.url);
	}

	reset(): void {
		this.state = {
			completed: [],
			failed: [],
			lastRun: new Date().toISOString(),
			version: "2.0.0",
		};
		this.save();
	}

	getStats() {
		return {
			completed: this.state.completed.length,
			failed: this.state.failed.length,
			lastRun: this.state.lastRun,
		};
	}
}

// HTML to Markdown converter
function htmlToMarkdown(html: string): string {
	let markdown = html;

	// Remove script and style tags
	markdown = markdown.replace(
		/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		"",
	);
	markdown = markdown.replace(
		/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
		"",
	);

	// Remove navigation, header, footer
	markdown = markdown.replace(/<nav\b[^>]*>.*?<\/nav>/gis, "");
	markdown = markdown.replace(/<header\b[^>]*>.*?<\/header>/gis, "");
	markdown = markdown.replace(/<footer\b[^>]*>.*?<\/footer>/gis, "");

	// Extract main content
	const mainMatch =
		markdown.match(/<main\b[^>]*>(.*?)<\/main>/is) ||
		markdown.match(/<article\b[^>]*>(.*?)<\/article>/is) ||
		markdown.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is);

	if (mainMatch && mainMatch[1]) {
		markdown = mainMatch[1];
	}

	// Convert HTML elements to markdown
	markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
	markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
	markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
	markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
	markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n");
	markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");

	// Links
	markdown = markdown.replace(
		/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
		"[$2]($1)",
	);

	// Bold and italic
	markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
	markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
	markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
	markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

	// Code blocks
	markdown = markdown.replace(
		/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis,
		(match, code) => {
			const cleanCode = code
				.replace(/<[^>]+>/g, "")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&amp;/g, "&")
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'");
			return "```\n" + cleanCode + "\n```\n\n";
		},
	);

	// Inline code
	markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

	// Lists
	markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
		return content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n") + "\n";
	});

	markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
		let counter = 1;
		return (
			content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
				return `${counter++}. $1\n`;
			}) + "\n"
		);
	});

	// Paragraphs and line breaks
	markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
	markdown = markdown.replace(/<br\s*\/?>/gi, "\n");

	// Remove remaining HTML tags
	markdown = markdown.replace(/<[^>]+>/g, "");

	// Decode HTML entities
	markdown = markdown
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ");

	// Clean up whitespace
	markdown = markdown
		.replace(/\n{3,}/g, "\n\n")
		.replace(/^\s+|\s+$/g, "")
		.replace(/[ \t]+$/gm, "");

	return markdown;
}

// Fetch with retry and exponential backoff
async function fetchWithRetry(
	url: string,
	retries = CONFIG.maxRetries,
): Promise<string> {
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

			const response = await fetch(url, {
				headers: {
					"User-Agent": CONFIG.userAgent,
					Accept: "text/html,application/xhtml+xml",
					"Accept-Language": "en-US,en;q=0.9",
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const text = await response.text();

			// Validate content
			if (text.length < CONFIG.minContentLength) {
				throw new Error("Content too short, possibly an error page");
			}

			return text;
		} catch (error: any) {
			lastError = error;

			// Don't retry on 404s
			if (error.message.includes("404")) {
				throw error;
			}

			if (attempt < retries) {
				const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
				console.log(
					`\n⚠️  Retry ${attempt}/${retries} for ${url} after ${delay}ms`,
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError || new Error("Unknown error");
}

// Parallel fetch with concurrency control
async function fetchInParallel<T>(
	items: T[],
	processor: (item: T) => Promise<void>,
	concurrency: number = CONFIG.maxConcurrency,
): Promise<void> {
	const queue = [...items];
	const active: Promise<void>[] = [];

	while (queue.length > 0 || active.length > 0) {
		// Start new tasks up to concurrency limit
		while (active.length < concurrency && queue.length > 0) {
			const item = queue.shift()!;
			const promise = processor(item).then(() => {
				const index = active.indexOf(promise);
				if (index !== -1) {
					active.splice(index, 1);
				}
			});
			active.push(promise);
		}

		// Wait for at least one task to complete
		if (active.length > 0) {
			await Promise.race(active);
		}
	}
}

// Process TypeScript migration docs
async function processTypeScriptMigrationDocs(): Promise<boolean> {
	console.log("\n📚 Processing TypeScript migration documentation...");

	if (existsSync("docs/to-typescript.md")) {
		const content = await Bun.file("docs/to-typescript.md").text();

		const formattedContent = `# TypeScript Migration Guide for Journal Project

*Last Updated: ${new Date().toISOString()}*

---

${content}`;

		const dir = "docs/typescript-migration";
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		writeFileSync(join(dir, "migration-guide.md"), formattedContent);
		console.log("✅ Processed: docs/typescript-migration/migration-guide.md");
		return true;
	}
	return false;
}

// Create documentation index
function createIndex(stats: {
	completed: number;
	failed: number;
	skipped: number;
}): void {
	const indexContent = `# 📚 Documentation Index

## Statistics
- ✅ Successfully fetched: ${stats.completed} pages
- ⚠️  Failed: ${stats.failed} pages  
- ⏭️  Skipped (cached): ${stats.skipped} pages
- 📅 Last updated: ${new Date().toISOString()}

## Biome v2.2.2

### Guides
- [Getting Started](biome/guides/getting-started.md)
- [Configure Biome](biome/guides/configure-biome.md)
- [Migrate from ESLint and Prettier](biome/guides/migrate-eslint-prettier.md)
- [Editor Extensions](biome/guides/editor-extensions.md)

### Reference
- [Configuration](biome/reference/configuration.md)
- [CLI](biome/reference/cli.md)
- [Linter](biome/reference/linter.md)
- [Formatter](biome/reference/formatter.md)

### Recipes
- [CI Setup](biome/recipes/ci-setup.md)

### Internals
- [Architecture](biome/internals/architecture.md)
- [Changelog](biome/internals/changelog.md)

## Bun 1.2.21

### Getting Started
- [Installation](bun/getting-started/installation.md)
- [Package Manager](bun/getting-started/package-manager.md)
- [Quickstart](bun/getting-started/quickstart.md)

### Configuration
- [bunfig.toml](bun/configuration/bunfig.md)
- [TypeScript](bun/configuration/typescript.md)

### Features
- [Bundler](bun/features/bundler.md)
- [Testing](bun/features/testing.md)
- [Modules](bun/features/modules.md)
- [Shell](bun/features/shell.md)

### API
- [SQL](bun/api/sql.md)
- [HTTP Server](bun/api/http-server.md)
- [WebSockets](bun/api/websockets.md)
- [File I/O](bun/api/file-io.md)

### Deployment
- [Standalone Executables](bun/deployment/standalone-executables.md)
- [Environment Variables](bun/deployment/environment-variables.md)

## TypeScript Migration

### Project-Specific Guides
- [Migration Guide](typescript-migration/migration-guide.md) - Complete guide for migrating this project to TypeScript

---

*Generated by Enhanced Documentation Fetcher v2.0.0*
`;

	writeFileSync("docs/INDEX.md", indexContent);
	console.log("\n✅ Created documentation index: docs/INDEX.md");
}

// Main function
async function main() {
	console.log("🚀 Enhanced Documentation Fetcher v2.0.0\n");

	// Parse command line arguments
	const args = process.argv.slice(2);
	const forceRefresh = args.includes("--force");
	const clearCache = args.includes("--clear-cache");
	const resetState = args.includes("--reset");

	// Initialize managers
	const cache = new CacheManager(CONFIG.cacheDir);
	const state = new StateManager(CONFIG.stateFile);

	if (clearCache) {
		console.log("🧹 Clearing cache...");
		cache.clear();
	}

	if (resetState) {
		console.log("🔄 Resetting state...");
		state.reset();
	}

	// Create directory structure
	const dirs = new Set<string>();
	for (const source of Object.values(DOCS_SOURCES)) {
		for (const page of source.pages) {
			dirs.add(
				join(
					"docs",
					source === DOCS_SOURCES.biome ? "biome" : "bun",
					page.category,
				),
			);
		}
	}
	dirs.add("docs/typescript-migration");

	for (const dir of dirs) {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
			console.log(`📁 Created directory: ${dir}`);
		}
	}

	// Collect all pages to fetch
	const allPages: Array<{ source: string; base: string; page: Page }> = [];

	for (const [sourceName, source] of Object.entries(DOCS_SOURCES)) {
		for (const page of source.pages) {
			const url = source.base + page.path;

			// Skip if already completed and not forcing refresh
			if (!forceRefresh && state.isCompleted(url)) {
				continue;
			}

			allPages.push({ source: sourceName, base: source.base, page });
		}
	}

	// Add failed URLs for retry
	const failedUrls = state.getFailedUrls();
	for (const url of failedUrls) {
		// Find the corresponding page
		for (const [sourceName, source] of Object.entries(DOCS_SOURCES)) {
			const page = source.pages.find((p) => source.base + p.path === url);
			if (page) {
				allPages.push({ source: sourceName, base: source.base, page });
				break;
			}
		}
	}

	console.log(`📊 Pages to fetch: ${allPages.length}`);
	console.log(`📊 Already completed: ${state.getStats().completed}`);
	console.log(`📊 Previously failed: ${state.getStats().failed}\n`);

	// Initialize progress tracker
	const progress = new ProgressTracker(allPages.length);

	// Statistics
	let successCount = 0;
	let failCount = 0;
	let skippedCount = 0;
	const failedPages: string[] = [];

	// Process pages in parallel
	await fetchInParallel(allPages, async ({ source, base, page }) => {
		const url = base + page.path;
		progress.update(`Fetching ${page.name}`);

		try {
			// Check cache first
			const cached = cache.get(url);
			let content: string;

			if (cached && !forceRefresh) {
				content = cached.content;
				skippedCount++;
			} else {
				const html = await fetchWithRetry(url);
				content = htmlToMarkdown(html);
				cache.set(url, content);
			}

			// Save to file
			const filePath = join("docs", source, page.category, page.name);
			const dir = dirname(filePath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}

			const fileContent = `# ${page.name.replace(".md", "").replace(/-/g, " ").toUpperCase()}

*Source: ${url}*
*Fetched: ${new Date().toISOString()}*

---

${content}`;

			writeFileSync(filePath, fileContent);
			state.markCompleted(url);
			successCount++;
		} catch (error: any) {
			state.markFailed(url, error.message);
			failedPages.push(`${source}: ${page.path}`);
			failCount++;
		}

		progress.complete();
	});

	// Process TypeScript migration docs
	const tsDocsProcessed = await processTypeScriptMigrationDocs();
	if (tsDocsProcessed) {
		successCount++;
	}

	// Create index
	createIndex({
		completed: successCount + state.getStats().completed,
		failed: failCount,
		skipped: skippedCount,
	});

	// Summary
	console.log("\n" + "=".repeat(50));
	console.log("📊 Documentation Fetch Complete!");
	console.log("=".repeat(50));
	console.log(`✅ Success: ${successCount} pages`);
	console.log(`⏭️  Cached: ${skippedCount} pages`);
	console.log(`❌ Failed: ${failCount} pages`);
	console.log(`📊 Total completed: ${state.getStats().completed} pages`);

	if (failedPages.length > 0) {
		console.log("\n⚠️  Failed pages:");
		failedPages.forEach((page) => console.log(`  - ${page}`));
		console.log("\n💡 Tip: Run again to retry failed pages");
	}

	console.log("\n📁 Documentation saved to: ./docs/");
	console.log("📖 View index at: ./docs/INDEX.md");
	console.log("\nOptions:");
	console.log("  --force       Force refresh all pages");
	console.log("  --clear-cache Clear the cache");
	console.log("  --reset       Reset fetch state");
}

// Run
main().catch((error) => {
	console.error("\n❌ Fatal error:", error);
	process.exit(1);
});
