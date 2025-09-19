***

title: "Documentation Update Checklist"
description: "Checklist for developers to ensure documentation is updated properly when code changes are made"
category: "Documentation"
phase: 18
related\_topics:
\- "Documentation Review Process"
\- "Documentation Metrics"
\- "Documentation Testing Process"
version: "1.0"
tags: \["documentation", "checklist", "maintenance", "developer-guide", "best-practices"]
status: active
--------------

# Documentation Update Checklist

This checklist serves as a guide for developers to ensure that documentation is properly updated when making code changes. Consistent use of this checklist helps maintain documentation accuracy and completeness as the codebase evolves.

## When to Use This Checklist

Use this checklist when:

- Implementing new features or endpoints
- Making significant changes to existing functionality
- Refactoring code that affects architecture or interfaces
- Fixing bugs that affect documented behavior
- Changing configuration options or environment variables
- Updating dependencies with new or changed APIs

## Quick Reference Checklist

### Before Making Code Changes

- [ ] Review existing documentation related to the area you're changing
- [ ] Identify all documentation files that will need updates
- [ ] Consider documenting the intended changes first to clarify design decisions

### During Code Implementation

- [ ] Update docstrings in Python files as you implement changes
- [ ] Add/update JSDoc comments in JavaScript files
- [ ] Take notes on any edge cases or behaviors that should be documented

### Before Creating a Pull Request

- [ ] **API Documentation**
  \- \[ ] Update API reference if endpoints are added, removed, or modified
  \- \[ ] Document new parameters, return values, and status codes
  \- \[ ] Update API examples to reflect the changes

- [ ] **User-Facing Documentation**
  \- \[ ] Update user guides if the change affects user experience
  \- \[ ] Add/update screenshots if UI changes are made
  \- \[ ] Update FAQs if relevant

- [ ] **Developer Documentation**
  \- \[ ] Update architecture documentation if component relationships change
  \- \[ ] Update data model documentation if database schemas change
  \- \[ ] Update setup or configuration guides if environment needs change

- [ ] **Code Documentation**
  \- \[ ] Ensure all new functions/methods have proper docstrings
  \- \[ ] Update existing docstrings affected by the changes
  \- \[ ] Add comments for complex logic or non-obvious behavior

- [ ] **Diagrams and Visual Aids**
  \- \[ ] Update sequence diagrams if process flows change
  \- \[ ] Update architecture diagrams if component relationships change
  \- \[ ] Update data flow diagrams if data paths change

- [ ] **Run Automated Checks**
  \- \[ ] Run Markdown linting on updated documentation
  \- \[ ] Validate links in updated documentation

## Detailed Guidelines by Change Type

### For API Changes

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Identify API  │     │ Update API    │     │ Update        │
│ Changes       │────►│ Reference     │────►│ Examples      │
└───────────────┘     └───────────────┘     └───────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Update Route  │     │ Update Error  │     │ Update Client │
│ Documentation │     │ Handling Docs │     │ Usage Docs    │
└───────────────┘     └───────────────┘     └───────────────┘
```

- **New Endpoints**
  \- Document the endpoint purpose, URL, method, auth requirements
  \- Document request parameters (path, query, body)
  \- Document response format, status codes, and errors
  \- Add example requests and responses
  \- Add the endpoint to any API overview lists

- **Modified Endpoints**
  \- Update parameter descriptions if behavior changes
  \- Update response format documentation if it changes
  \- Update examples to reflect new behavior
  \- Add migration notes if breaking changes are introduced

- **Deprecated Endpoints**
  \- Mark the endpoint as deprecated in documentation
  \- Document the recommended alternative
  \- Provide migration examples

### For Database Changes

- **Schema Changes**
  \- Update data model documentation (`docs/guides/data-model.md`)
  \- Update ERD diagrams if relationships change
  \- Document migration plans for existing data

- **Query Changes**
  \- Document performance implications of query changes
  \- Update any query examples in developer guides

### For UI Changes

- **New UI Elements**
  \- Update user guide with new feature documentation
  \- Add screenshots of new UI components
  \- Document any new user interactions

- **Changed Workflows**
  \- Update user guides to reflect new user flows
  \- Update screenshots of changed UI
  \- Consider adding before/after comparisons for significant changes

### For Configuration Changes

- **New Configuration Options**
  \- Document the purpose, default value, and acceptable values
  \- Provide examples of common configurations
  \- Update installation or deployment guides

- **Changed Default Behavior**
  \- Highlight changes that might affect existing deployments
  \- Document migration steps for updating configurations

## Testing Your Documentation Updates

Before submitting documentation changes:

1. **Peer Testing**: Ask a colleague to follow your documentation to verify it's accurate and clear
2. **Self-Testing**: After a few days, return to your documentation and read it fresh
3. **Test Edge Cases**: Ensure documentation covers error conditions and unusual scenarios
4. **Verify Examples**: Ensure all code examples actually work as documented

## Common Documentation Pitfalls to Avoid

- **Outdated Screenshots**: Ensure screenshots match the current UI
- **Misleading Examples**: Make sure examples work as documented
- **Incomplete Error Documentation**: Document all possible error scenarios
- **Unexplained Defaults**: Always explain why default values are chosen
- **Implicit Dependencies**: Clearly state all prerequisites and dependencies
- **Missing Context**: Provide enough context for a new reader to understand the topic

## Documentation Debt Management

If you notice outdated documentation:

- For minor issues: Fix immediately as part of your current work
- For major issues: Create an issue to track the needed documentation updates
- For areas that need substantial rework: Propose a documentation sprint

***

By following this checklist with each code change, we ensure our documentation remains accurate, comprehensive, and valuable to both users and developers. Remember that good documentation is a key part of our product quality, not an afterthought.
