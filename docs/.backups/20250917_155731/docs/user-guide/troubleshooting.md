---
id: troubleshooting
title: Troubleshooting Guide
type: guide
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- python
- guide
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: "Flask Journal Troubleshooting Guide"
description: "Solutions for common issues encountered when using the Flask Journal application"
category: "User Documentation"
version: "1.0"
tags: \["troubleshooting", "errors", "solutions", "fixes", "help"]
------------------------------------------------------------------

# Troubleshooting Guide

This guide provides solutions for common issues you might encounter while using Flask Journal. If you're experiencing a problem not covered here, please refer to the [FAQ](user-guide/faq.md) or contact support.

## Table of Contents

- [Account Issues](#account-issues)
- [Login Problems](#login-problems)
- [Journal Entry Issues](#journal-entry-issues)
- [Editor Issues](#editor-issues)
- [Tag Issues](#tag-issues)
- [Performance Problems](#performance-problems)
- [Installation and Setup Issues](#installation-and-setup-issues)

## Account Issues

### Registration Failed

**Problem:** Unable to create a new account.

**Possible causes and solutions:**

1. **Username already taken**

- Choose a different username

2. **Invalid email format**

- Ensure your email follows the standard format (e.g., <name@journal.local>)

3. **Password too short**

- Create a password with at least 8 characters

4. **Passwords don't match**

- Make sure the password and confirmation fields match exactly

### Email Verification Issues

**Problem:** Not receiving verification email.

**Solutions:**

1. Check your spam/junk folder
2. Verify you entered the correct email address
3. Wait a few minutes as email delivery might be delayed
4. Try requesting a new verification email

## Login Problems

### Forgotten Password

**Problem:** Can't log in because you forgot your password.

**Solution:**

1. Click the "Forgot Password" link on the login page
2. Enter the email address associated with your account
3. Check your email for password reset instructions
4. Follow the link to create a new password

### Account Locked

**Problem:** Account is locked after multiple failed login attempts.

**Solution:**

1. Wait 30 minutes for the automatic unlock
2. Use the password reset process to regain access
3. If problems persist, contact the administrator

### Invalid Credentials

**Problem:** Login fails with "Invalid username or password" message.

**Solutions:**

1. Double-check for typos in your username/email and password
2. Ensure Caps Lock is not enabled
3. Try recovering your password using the "Forgot Password" link

## Journal Entry Issues

### Entry Not Saving

**Problem:** Journal entries don't save or disappear after saving.

**Solutions:**

1. Check your internet connection
2. Ensure the entry has a title (required field)
3. Try using a different browser
4. Clear your browser cache and cookies

### Cannot Delete Entry

**Problem:** Delete button doesn't work or gives an error.

**Solutions:**

1. Refresh the page and try again
2. Log out and log back in
3. Try using a different browser
4. Clear your browser cache and cookies

### Entry Content Not Displaying Correctly

**Problem:** Markdown formatting not appearing as expected.

**Solutions:**

1. Verify your Markdown syntax is correct
2. Save the entry and view it again
3. Check for unclosed formatting elements (e.g., missing asterisks for bold text)
4. Try using the preview function before saving

## Editor Issues

### Editor Not Loading

**Problem:** The Markdown editor fails to load or shows only a blank area.

**Solutions:**

1. Refresh the page
2. Clear your browser cache
3. Try a different browser
4. Disable browser extensions that might interfere with JavaScript

### Auto-save Not Working

**Problem:** Entries aren't being auto-saved.

**Solutions:**

1. Check if you see the "Saving..." or "Saved" indicator
2. Ensure your internet connection is stable
3. Try manually saving more frequently
4. Check if local storage is enabled in your browser

### Formatting Toolbar Missing

**Problem:** Can't see the formatting toolbar above the editor.

**Solutions:**

1. Refresh the page
2. Check if JavaScript is enabled in your browser
3. Try a different browser
4. Adjust your zoom level to ensure it's not hidden

### Preview Not Matching Final Output

**Problem:** The preview doesn't match how the entry appears after saving.

**Solutions:**

1. Save the entry and check the display
2. Verify complex Markdown syntax (tables, code blocks)
3. Check for unsupported Markdown extensions

## Tag Issues

### Tags Not Appearing

**Problem:** Tags don't appear after adding them to an entry.

**Solutions:**

1. Ensure tags are comma-separated
2. Save the entry after adding tags
3. Refresh the page to see updated tags
4. Check if you've reached any tag limits

### Tag Filter Not Working

**Problem:** Filtering by tag doesn't show the expected entries.

**Solutions:**

1. Refresh the page
2. Try clicking a different tag and then return to the desired tag
3. Check if entries actually have the tag you're filtering by
4. Clear any existing search filters

## Performance Problems

### Slow Loading Times

**Problem:** The application takes a long time to load.

**Solutions:**

1. Check your internet connection
2. Clear your browser cache
3. Close unused browser tabs
4. Try a different browser
5. If using a local installation, check your server resources

### Browser Freezing

**Problem:** Browser becomes unresponsive when using the application.

**Solutions:**

1. Close and reopen your browser
2. Try a different browser
3. Disable browser extensions
4. If you have many entries, try filtering to reduce the load
5. Check your system resources (CPU, memory)

## Installation and Setup Issues

### Database Initialization Failed

**Problem:** Error when trying to initialize the database during installation.

**Solutions:**

1. Ensure you have the correct permissions to create/modify the database
2. Check database connection settings in `config.py`
3. Verify the database server is running
4. Look for specific error messages in the console output

### Frontend Build Errors

**Problem:** Errors when running `bun run build` or `bun run dev`.

**Solutions:**

1. Ensure you have the correct Node.js version installed
2. Run `bun install` again to verify all dependencies are installed
3. Check for error messages in the console output
4. Clear the bun cache: `bun cache clean --force`

### Application Won't Start

**Problem:** Flask server doesn't start or immediately crashes.

**Solutions:**

1. Check if another process is already using port 5000
2. Verify the Python virtual environment is activated
3. Ensure all dependencies are installed: `uv uv pip install -r requirements.txt`
4. Check for error messages in the console output
5. Verify `FLASK_APP` is set correctly: `export FLASK_APP=run.py`

### Missing Frontend Assets

**Problem:** CSS or JavaScript not loading, resulting in an unstyled or non-functional application.

**Solutions:**

1. Ensure you've run `bun run build` successfully
2. Check if the build process generated files in the expected location
3. Clear your browser cache
4. Verify the static files are being served correctly

## Debugging Techniques

If you're experiencing issues not covered in this guide, try these general debugging steps:

1. **Check the browser console for errors**

- Press F12 in most browsers to open developer tools
- Navigate to the Console tab to see JavaScript errors

2. **Review server logs**

- If self-hosting, check the terminal where the Flask server is running
- Look for error messages or exceptions

3. **Try an incognito/private browsing window**

- This bypasses cached content and browser extensions

4. **Test with a different browser**

- Issues specific to one browser can help identify the problem

5. **Clear browser data**

- Clear cookies, cache, and local storage

If you've tried these solutions and still experience issues, please:

1. Take screenshots of the problem
2. Note any error messages
3. Document the steps to reproduce the issue
4. Contact support with this information

***

For issues related to installation or development, please also refer to the [Installation Guide](user-guide/installation.md) and project documentation.
