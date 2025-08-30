#!/usr/bin/env bun

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const DOCS_SOURCES = {
	biome: {
		base: "https://biomejs.dev",
		pages: [
			// Guides - Verified working URLs
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

			// Reference - Core documentation
			{
				path: "/reference/configuration",
				name: "configuration.md",
				category: "reference",
			},
			{ path: "/reference/cli", name: "cli.md", category: "reference" },
			{ path: "/linter", name: "linter.md", category: "reference" },
			{ path: "/formatter", name: "formatter.md", category: "reference" },
			{ path: "/analyzer", name: "analyzer.md", category: "reference" },

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
			{
				path: "/docs/runtime/tsconfig",
				name: "tsconfig.md",
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

async function fetchPage(url: string, retries = 3): Promise<string> {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(url, {
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; DocsFetcher/1.0)",
				},
			});

			if (!response.ok) {
				if (response.status === 404 && i === 0) {
					// Don't retry 404s
					throw new Error(`HTTP 404: Page not found`);
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			console.log(`✅ Fetched: ${url}`);
			return await response.text();
		} catch (error: any) {
			if (error.message.includes("404") || i === retries - 1) {
				throw error;
			}
			console.log(`⚠️  Retry ${i + 1}/${retries} for ${url}`);
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
	return "";
}

function cleanHtml(html: string): string {
	// Remove script tags and their content
	html = html.replace(
		/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		"",
	);

	// Remove style tags and their content
	html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

	// Remove navigation elements
	html = html.replace(/<nav\b[^>]*>.*?<\/nav>/gis, "");
	html = html.replace(/<header\b[^>]*>.*?<\/header>/gis, "");
	html = html.replace(/<footer\b[^>]*>.*?<\/footer>/gis, "");

	// Extract main content (try various content containers)
	const mainMatch =
		html.match(/<main\b[^>]*>(.*?)<\/main>/is) ||
		html.match(/<article\b[^>]*>(.*?)<\/article>/is) ||
		html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is) ||
		html.match(/<div[^>]*id="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is);

	if (mainMatch && mainMatch[1]) {
		html = mainMatch[1];
	}

	return html;
}

function htmlToMarkdown(html: string): string {
	let markdown = html;

	// Clean HTML first
	markdown = cleanHtml(markdown);

	// Convert headings
	markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
	markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
	markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
	markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
	markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n");
	markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");

	// Convert links
	markdown = markdown.replace(
		/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
		"[$2]($1)",
	);

	// Convert bold and italic
	markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
	markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
	markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
	markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

	// Convert code blocks
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

	// Convert inline code
	markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

	// Convert lists
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

	// Convert paragraphs
	markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

	// Convert line breaks
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

	// Clean up excessive whitespace
	markdown = markdown
		.replace(/\n{3,}/g, "\n\n")
		.replace(/^\s+|\s+$/g, "")
		.replace(/[ \t]+$/gm, "");

	return markdown;
}

async function createDirectories() {
	const dirs = [
		"docs",
		"docs/biome",
		"docs/biome/guides",
		"docs/biome/reference",
		"docs/biome/recipes",
		"docs/biome/internals",
		"docs/bun",
		"docs/bun/getting-started",
		"docs/bun/configuration",
		"docs/bun/features",
		"docs/bun/api",
		"docs/bun/deployment",
		"docs/typescript-migration",
	];

	for (const dir of dirs) {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
			console.log(`📁 Created directory: ${dir}`);
		}
	}
}

async function processTypeScriptMigrationDocs() {
	console.log("\n📚 Processing TypeScript migration documentation...\n");

	// Copy the existing TypeScript migration document
	if (existsSync("docs/to-typescript.md")) {
		const content = Bun.file("docs/to-typescript.md");
		const text = await content.text();

		// Create a formatted version for the migration guide
		const formattedContent = `# TypeScript Migration Guide for Journal Project

*Last Updated: ${new Date().toISOString()}*

---

${text}`;

		writeFileSync(
			"docs/typescript-migration/migration-guide.md",
			formattedContent,
		);
		console.log("✅ Processed: docs/typescript-migration/migration-guide.md");
		return true;
	}
	return false;
}

async function fetchDocumentation() {
	console.log("🚀 Starting documentation fetch...\n");

	// Create directory structure
	await createDirectories();

	let successCount = 0;
	let failCount = 0;
	const failedPages: string[] = [];

	// Fetch Biome documentation
	console.log("\n📚 Fetching Biome documentation...\n");
	for (const page of DOCS_SOURCES.biome.pages) {
		try {
			const url = DOCS_SOURCES.biome.base + page.path;
			console.log(`📥 Fetching: ${url}`);
			const html = await fetchPage(url);
			const markdown = htmlToMarkdown(html);

			const filePath = join("docs", "biome", page.category, page.name);
			writeFileSync(
				filePath,
				`# ${page.name.replace(".md", "").replace(/-/g, " ").toUpperCase()}\n\n*Source: ${url}*\n\n---\n\n${markdown}`,
			);

			console.log(`💾 Saved: ${filePath}`);
			successCount++;
		} catch (error: any) {
			console.log(`⚠️  Skipped ${page.path}: ${error.message}`);
			failedPages.push(`Biome: ${page.path}`);
			failCount++;
		}
	}

	// Fetch Bun documentation
	console.log("\n📚 Fetching Bun documentation...\n");
	for (const page of DOCS_SOURCES.bun.pages) {
		try {
			const url = DOCS_SOURCES.bun.base + page.path;
			console.log(`📥 Fetching: ${url}`);
			const html = await fetchPage(url);
			const markdown = htmlToMarkdown(html);

			const filePath = join("docs", "bun", page.category, page.name);
			writeFileSync(
				filePath,
				`# ${page.name.replace(".md", "").replace(/-/g, " ").toUpperCase()}\n\n*Source: ${url}*\n\n---\n\n${markdown}`,
			);

			console.log(`💾 Saved: ${filePath}`);
			successCount++;
		} catch (error: any) {
			console.log(`⚠️  Skipped ${page.path}: ${error.message}`);
			failedPages.push(`Bun: ${page.path}`);
			failCount++;
		}
	}

	// Process TypeScript migration documentation
	const tsDocsProcessed = await processTypeScriptMigrationDocs();
	if (tsDocsProcessed) {
		successCount++;
	}

	// Create index file
	const indexContent = `# 📚 Documentation Index

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
- [Analyzer](biome/reference/analyzer.md)

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
- [tsconfig](bun/configuration/tsconfig.md)

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

*Last updated: ${new Date().toISOString()}*
`;

	writeFileSync("docs/INDEX.md", indexContent);
	console.log("\n✅ Created documentation index: docs/INDEX.md");

	// Summary
	console.log("\n" + "=".repeat(50));
	console.log("📊 Documentation Fetch Complete!");
	console.log("=".repeat(50));
	console.log(`✅ Success: ${successCount} pages`);
	console.log(`❌ Failed: ${failCount} pages`);

	if (failedPages.length > 0) {
		console.log("\n⚠️  Failed pages:");
		failedPages.forEach((page) => console.log(`  - ${page}`));
	}

	console.log("\n📁 Documentation saved to: ./docs/");
	console.log("📖 View index at: ./docs/INDEX.md");
}

// Run the fetcher
fetchDocumentation().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
