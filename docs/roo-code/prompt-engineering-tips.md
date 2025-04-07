---
title: "Prompt Engineering Tips for Roo Code"
description: "Best practices for crafting effective prompts to guide Roo Code, leading to better results, fewer errors, and increased efficiency."
category: "Usage Guides"
related_topics:
  - "Context Management"
  - "Custom Instructions"
  - "Working with Large Projects"
  - "Enhance Prompt Feature"
  - "ask_followup_question Tool"
version: "1.0"
tags: ["prompting", "prompt engineering", "best practices", "efficiency", "context", "instructions", "ai interaction"]
---

# Prompt Engineering Tips for Roo Code

Prompt engineering is the practice of crafting clear, specific, and context-rich instructions to guide AI models like the one powering Roo Code. Effective prompts are crucial for obtaining accurate results, minimizing errors, and maximizing workflow efficiency.

---

## Core Principles for Effective Prompts

Adhere to these principles when formulating your requests to Roo:

1.  **Be Clear and Specific:**
    - State precisely what action you want Roo to take. Avoid vague language or ambiguity.
    - **Ineffective:** `Fix this code.`
    - **Effective:** `In @src/utils/calculations.js, refactor the 'calculateDiscount' function to handle negative input values by returning 0.`

2.  **Provide Sufficient Context:**
    - Use **Context Mentions** (`@`) to reference relevant files (`@/path/to/file`), directories, symbols, or diagnostic information (`@problems`). This grounds Roo's understanding in your actual codebase.
    - **Example:** `@src/components/LoginForm.jsx Update the form submission handler to include input validation for the email field.`
    - *(See [Tool Usage Overview](./tool-use-overview.md) or UI tooltips for details on context mention syntax).*

3.  **Break Down Complex Tasks:**
    - Decompose large or multi-step goals into smaller, sequential, and manageable sub-tasks. Address one specific goal per prompt.
    - **Ineffective:** `Build the entire user profile page.`
    - **Effective (Sequence):**
        1. `Create a new React component file named UserProfilePage.jsx in src/pages/.`
        2. `In @src/pages/UserProfilePage.jsx, add basic JSX structure including a heading.`
        3. `Fetch user data from '/api/user/profile' within UserProfilePage.jsx using useEffect and useState.`
        4. `Display the fetched user data (name, email) in UserProfilePage.jsx.`
    - Consider using the [Boomerang Task](./boomerang-tasks.md) pattern for very complex workflows.

4.  **Illustrate with Examples (When Necessary):**
    - If you require a specific output format, coding style, or pattern, provide a concise example directly in your prompt.
    - **Example:** `Generate a Python function `format_user(user_obj)` that returns a string like "Name: [name], Email: [email]". For example, if user_obj is {'name': 'Alice', 'email': 'a@b.com'}, return "Name: Alice, Email: a@b.com".`

5.  **Specify the Desired Output Format:**
    - Explicitly state if you need the response in a particular format (e.g., JSON, Markdown table, bulleted list, specific code structure).
    - **Example:** `List the dependencies in package.json as a Markdown table with columns "Package" and "Version".`

6.  **Iterate and Refine:**
    - AI interaction is often iterative. If the first response isn't perfect, refine your prompt with more detail, clarify ambiguities, or correct misunderstandings in your follow-up message. Use the feedback mechanisms described below.

7.  **Consider Using "Enhance Prompt":**
    - The [Enhance Prompt](./fast-edits.md#enhance-prompt-feature) feature (✨ icon in the chat input) can automatically refine your prompt for clarity and context before sending. Review the enhanced version before submitting.

---

## Guiding Roo's Process: Think-then-Do

Encourage a more structured approach, especially for complex changes:

1.  **Analysis Phase:** Ask Roo to first analyze the situation, explain the code, identify potential issues, or outline a plan *before* making changes.
    - `Explain the purpose of the `process_data` function in @scripts/data_processor.py.`
    - `Analyze @src/styles/main.css and suggest improvements for CSS variable usage.`
    - `Outline the steps needed to add pagination to the results table in @components/ResultsTable.jsx.`
2.  **Planning Phase:** Review Roo's analysis or plan. Provide feedback or corrections.
    - `Your plan looks good, but step 3 should also include updating the documentation.`
3.  **Execution Phase:** Instruct Roo to implement the agreed-upon plan, often one step at a time.
    - `Okay, proceed with step 1 of the plan: Create the new service file.`
4.  **Review Phase:** Carefully examine the changes proposed by Roo (e.g., diffs) for each step before approving.

---

## Leveraging Custom Instructions

Use [Custom Instructions](./custom-instructions.md) (Global, Workspace, or Mode-Specific) to provide persistent guidance that influences Roo's behavior across multiple interactions without needing to repeat them in every prompt. This is ideal for enforcing:

- Coding style standards (indentation, naming conventions).
- Preferred libraries, frameworks, or architectural patterns.
- Project-specific requirements or terminology.
- Desired tone or level of explanation in responses.

---

## Handling Ambiguity

If your prompt is unclear or lacks detail, Roo might:

- **Make Assumptions:** Proceed based on its interpretation, which might not match your intent.
- **Ask for Clarification:** Use the [`ask_followup_question`](./ask_followup_question-tool.md) tool to request missing information.

To minimize delays and ensure accuracy, strive for clarity and completeness in your initial prompt.

---

## Providing Effective Feedback

Your feedback helps Roo learn and improve:

- **Reject Actions:** If Roo proposes an incorrect or unwanted action (e.g., a bad code change), use the "Reject" button.
- **Explain Rejections:** Briefly explain *why* you are rejecting the action. This context is valuable for Roo's learning process. (e.g., "Rejecting because this doesn't handle the edge case where input is null.")
- **Reword/Refine:** If the result is off-track, rephrase your request with more specific details or constraints.
- **Minor Manual Edits:** For small inaccuracies in proposed code changes, you can sometimes make quick manual edits in the diff view before accepting.

---

## Prompt Examples

### Effective Prompts

- **Refactoring:** `@src/components/ProductCard.jsx Refactor this component to use Tailwind CSS classes instead of the current inline styles.`
- **Creation:** `Create a new Python file `validators.py` in the `src/utils/` directory. Add a function `is_valid_email(email_string)` that uses regex to validate email formats and returns True or False.`
- **Debugging:** `@problems Explain the 'TypeError: Cannot read property 'map' of undefined' error occurring in @src/hooks/useDataFetching.js and suggest a fix.`
- **Explanation:** `Explain the difference between `useEffect` and `useLayoutEffect` in React, providing simple code examples for each.`

### Ineffective Prompts

- **Too Vague:** `Improve the UI.` (Improve *what* specifically? Based on *what* criteria?)
- **Lacks Context:** `Add error handling.` (Add error handling *where*? For *what kinds* of errors?)
- **Too Broad:** `Optimize the application.` (Optimize for *what*? Speed? Memory? Bundle size? Which parts?)
- **Ambiguous:** `Change the function.` (Change *which* function? *How* should it be changed?)

---

By applying these prompt engineering principles, you can significantly enhance your collaboration with Roo Code, leading to faster development cycles and higher-quality results.
