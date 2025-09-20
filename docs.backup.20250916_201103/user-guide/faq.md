***

title: "Flask Journal FAQs"
description: "Frequently asked questions about using the Flask Journal application"
category: "User Documentation"
version: "1.0"
tags: \["faq", "questions", "help", "support"]
----------------------------------------------

# Frequently Asked Questions

This document addresses common questions about the Flask Journal application. If you don't find your question answered here, please refer to the [Troubleshooting Guide](troubleshooting.md) or other sections of the [User Guide](README.md).

## Table of Contents

- [Account Management](#account-management)
- [Journal Entries](#journal-entries)
- [Markdown Editor](#markdown-editor)
- [Tags](#tags)
- [Data and Privacy](#data-and-privacy)
- [Technical Questions](#technical-questions)

## Account Management

### How do I create an account?

Navigate to the login page and click the "Register" link. Fill out the registration form with your desired username, email address, and password, then click "Register" to create your account.

### Can I change my username?

Currently, usernames cannot be changed after registration. This feature may be added in future updates.

### How do I reset my password if I forget it?

On the login page, click the "Forgot Password" link and follow the instructions to reset your password. You will receive an email with a password reset link.

### How do I delete my account?

To delete your account:

1. Log in to your account
2. Navigate to your profile settings
3. Scroll to the bottom and click "Delete Account"
4. Confirm the deletion when prompted

Note that account deletion is permanent and will remove all your journal entries.

## Journal Entries

### Is there a limit to how many journal entries I can create?

No, there is no limit to the number of entries you can create in your journal.

### Can I export my journal entries?

Currently, the application does not have a built-in export feature. This functionality is planned for a future update.

### Are my journal entries backed up?

The application automatically backs up the database regularly. However, for personal backups, you may want to occasionally copy important entries manually until an export feature is implemented.

### Can I restore deleted entries?

Once an entry is deleted, it cannot be recovered directly through the user interface. If you accidentally delete an important entry, contact the application administrator, who may be able to restore it from a recent backup.

## Markdown Editor

### What Markdown syntax is supported?

The editor supports standard Markdown syntax, including:

- Headings (# Heading)
- Formatting (bold, italic, strikethrough)
- Links and images
- Lists (ordered and unordered)
- Blockquotes
- Code blocks and inline code
- Horizontal rules

### Does the editor support tables?

Yes, the Markdown editor supports GitHub-style tables:

```
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Can I insert images into my entries?

Currently, you cannot upload images directly into entries. However, you can link to images hosted elsewhere using standard Markdown image syntax: `![Alt text](http://example.com/image.jpg)`.

### Why doesn't the editor show my formatting while I type?

The editor shows plain text with Markdown syntax as you type. To see the formatted content, switch to the preview mode by clicking the "Preview" button or save your entry and view it.

## Tags

### How many tags can I add to an entry?

There is no fixed limit on the number of tags per entry, but for optimal organization and performance, we recommend using 1-10 tags per entry.

### Can I create hierarchical tags or categories?

The current tagging system is flat and does not support hierarchical categories. You can simulate hierarchies using naming conventions like `project:personal` and `project:work`.

### How do I delete a tag?

Tags are automatically removed from the system when they are no longer associated with any entries. To remove a tag from an entry, edit the entry and remove the tag from the tags field.

### Can I rename a tag?

There isn't a direct "rename tag" function. To effectively rename a tag:

1. Edit each entry that uses the old tag
2. Replace the old tag with the new tag name
3. Save each entry

## Data and Privacy

### Who can see my journal entries?

Only you can see your journal entries. The application uses secure authentication to ensure your entries remain private.

### Is my journal data encrypted?

The application uses HTTPS to encrypt data in transit. Data at rest (stored in the database) is not encrypted by default, but the database is secured against unauthorized access.

### Does Flask Journal collect analytics or usage data?

The application collects minimal usage data for performance monitoring and improvement purposes. This data is anonymized and does not include the content of your journal entries.

### Where is my data stored?

For the self-hosted version, data is stored on your own server. For the hosted version, data is stored on secure cloud servers in compliance with relevant data protection regulations.

## Technical Questions

### Can I use Flask Journal offline?

The standard web version requires an internet connection. However, you can set up a local development version that works offline by following the [Installation Guide](installation.md).

### Which browsers are supported?

Flask Journal supports modern browsers, including:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

Internet Explorer is not supported.

### Is there a mobile app?

Currently, there is no dedicated mobile app. However, the web interface is responsive and works well on mobile browsers.

### How do I report a bug or request a feature?

Bugs and feature requests can be submitted through the project's GitHub issues page or by contacting support directly.

***

If you have a question not answered here, please refer to the [Troubleshooting Guide](troubleshooting.md) or contact support for assistance.
