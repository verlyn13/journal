---
title: "Flask Journal User Guide"
description: "Comprehensive guide to using the Flask Journal application"
category: "User Documentation"
version: "1.0"
tags: ["user-guide", "quickstart", "how-to", "features"]
---

# Flask Journal User Guide

Welcome to Flask Journal, a personal journal application for documenting your thoughts, progress, and ideas. This guide will help you understand the core features of the application and how to use them effectively.

## Table of Contents

- [Flask Journal User Guide](#flask-journal-user-guide)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Registration](#registration)
    - [Login](#login)
  - [Journal Entries](#journal-entries)
    - [Creating Entries](#creating-entries)
    - [Viewing Entries](#viewing-entries)
    - [Editing Entries](#editing-entries)
    - [Deleting Entries](#deleting-entries)
  - [Using the Markdown Editor](#using-the-markdown-editor)
    - [Basic Formatting](#basic-formatting)
    - [Advanced Features](#advanced-features)
  - [Working with Tags](#working-with-tags)
    - [Adding Tags to Entries](#adding-tags-to-entries)
    - [Filtering by Tags](#filtering-by-tags)
  - [Additional Resources](#additional-resources)

## Getting Started

### Registration

To start using Flask Journal, you'll need to create an account:

1. Navigate to the application's login page
2. Click on the "Register" link below the login form
3. Complete the registration form with:
   - Username (required)
   - Email address (required)
   - Password (required, minimum 8 characters)
   - Password confirmation
4. Click "Register" to create your account
5. You'll be redirected to the login page upon successful registration

### Login

To access your journal:

1. Navigate to the application's login page
2. Enter your username or email address
3. Enter your password
4. Click "Login"
5. Upon successful authentication, you'll be redirected to your journal dashboard

## Journal Entries

### Creating Entries

To create a new journal entry:

1. From your dashboard, click the "New Entry" button
2. You'll be taken to the entry editor with:
   - Title field
   - Content area (Markdown editor)
   - Tags input field
3. Enter a title for your entry
4. Write your entry content using Markdown formatting
5. Add any relevant tags (optional)
6. Click "Save" to create your entry

### Viewing Entries

Your journal entries are displayed in reverse chronological order (newest first) on your dashboard. To view a specific entry:

1. Click on the entry title from your dashboard
2. The full entry will be displayed with formatted content
3. You can see the creation date, last modification date, and any associated tags

### Editing Entries

To modify an existing journal entry:

1. Navigate to the entry you wish to edit
2. Click the "Edit" button below the entry
3. Make your changes to the title, content, or tags
4. Click "Save" to update the entry

### Deleting Entries

To remove an entry from your journal:

1. Navigate to the entry you wish to delete
2. Click the "Delete" button below the entry
3. Confirm the deletion when prompted
4. The entry will be permanently removed from your journal

## Using the Markdown Editor

Flask Journal features a powerful Markdown editor that allows you to format your entries with ease.

### Basic Formatting

The editor supports standard Markdown syntax:

- **Bold text**: Surround text with double asterisks (`**bold text**`)
- *Italic text*: Surround text with single asterisks (`*italic text*`)
- [Links](https://example.com): Use the format `[link text](URL)`
- Lists:
  - Unordered lists use asterisks, plus, or hyphen symbols (`* item`)
  - Ordered lists use numbers followed by periods (`1. item`)
- Headings: Use hash symbols at the beginning of a line (`# Heading 1`, `## Heading 2`)
- Blockquotes: Begin a line with a greater-than symbol (`> quoted text`)
- Code: Surround inline code with backticks (`` `code` ``) or create code blocks with triple backticks

### Advanced Features

The editor includes several advanced features:

- **Live Preview**: See how your formatted text will appear as you type
- **Autosave**: Your work is automatically saved periodically to prevent loss
- **Keyboard Shortcuts**: Common formatting operations have keyboard shortcuts
- **Full-screen Mode**: Click the expand icon to edit in distraction-free full-screen mode

## Working with Tags

Tags help you organize and categorize your journal entries for easier retrieval.

### Adding Tags to Entries

To add tags to an entry:

1. When creating or editing an entry, locate the "Tags" field
2. Enter tag names separated by commas (e.g., "work, personal, ideas")
3. Click "Save" to apply the tags to your entry

### Filtering by Tags

To view entries with specific tags:

1. From your dashboard, click on a tag name displayed with any entry
2. The dashboard will refresh to show only entries with that tag
3. To view all entries again, click the "All Entries" link at the top of the dashboard
4. You can also access the tag filter from the sidebar menu

## Additional Resources

For more detailed information, please refer to these additional guides:

- [Installation Guide](installation.md) - Setting up Flask Journal locally
- [Frequently Asked Questions](faq.md) - Common questions and answers
- [Troubleshooting Guide](troubleshooting.md) - Solutions to common issues

---

We hope you enjoy using Flask Journal to document your journey. If you encounter any issues or have suggestions for improvement, please refer to our troubleshooting guide or contact support.