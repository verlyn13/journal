# Journal Application - UI Design Specification

## Complete Wireframe and Design Documentation

### Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Application Layout Architecture](#application-layout-architecture)
3. [Component Hierarchy](#component-hierarchy)
4. [Detailed Component Specifications](#detailed-component-specifications)
5. [Interaction Patterns](#interaction-patterns)
6. [Responsive Behavior](#responsive-behavior)
7. [Theme System](#theme-system)

---

## 1. Design System Overview

### Core Design Principles

- **Sanctuary Theme**: A calming, focused writing environment
- **Dual Theme Support**: Dawn (light) and Dusk (dark) modes
- **Typography-First**: Content readability is paramount
- **Minimal Distractions**: Clean interface with purposeful whitespace

### Typography

```
Primary Font (Content): Lora (serif)
- Journal entries, preview text
- Provides comfortable reading experience

UI Font (Interface): Inter (sans-serif)
- Navigation, buttons, headers
- Clean and modern for UI elements

Code Font: JetBrains Mono (monospace)
- Code blocks, inline code
- Optimized for technical content
```

### Color Palette

#### Dawn Mode (Light Theme)

```
Background Primary:   #f5f3f0  - Main canvas
Background Secondary: #eae8e3  - Panels and cards
Background Tertiary:  #dde3ea  - Hover states, code blocks
Text Primary:        #41454c  - Main content
Text Secondary:      #6b7280  - Metadata, hints
Accent:             #a8b5c5  - Interactive elements
Accent Hover:       #8fa5b8  - Hover state
Border:             #dde3ea  - Dividers
```

#### Dusk Mode (Dark Theme)

```
Background Primary:   #2c303a  - Main canvas
Background Secondary: #383d4a  - Panels and cards
Background Tertiary:  #505668  - Hover states
Text Primary:        #d4d6d9  - Main content
Text Secondary:      #9ca3af  - Metadata, hints
Accent:             #d4af8b  - Interactive elements (warm gold)
Accent Hover:       #c19b76  - Hover state
Border:             #505668  - Dividers
Code Block BG:      #1e1e2e  - Enhanced contrast for syntax
```

---

## 2. Application Layout Architecture

### Main Layout Grid

```
┌─────────────────────────────────────────────────────────────────┐
│                          Application Shell                       │
├──────────┬────────────────┬─────────────────────────────────────┤
│          │                │                                     │
│ Sidebar  │  Entry List    │         Editor/Preview              │
│  (260px) │    (320px)     │          (Flexible)                 │
│          │                │                                     │
│ ┌──────┐ │ ┌────────────┐ │ ┌─────────────────────────────────┐│
│ │      │ │ │            │ │ │                                 ││
│ │  Nav │ │ │   Entries  │ │ │      Content Area               ││
│ │      │ │ │            │ │ │                                 ││
│ └──────┘ │ └────────────┘ │ └─────────────────────────────────┘│
└──────────┴────────────────┴─────────────────────────────────────┘

Breakpoints:
- Desktop: 1280px+ (3-column layout)
- Tablet: 768px-1279px (2-column, sidebar collapses)
- Mobile: <768px (single column, drawer navigation)
```

### Layout States

#### Standard Layout (Default)

- Three-column layout with all panels visible
- Sidebar: 260px fixed width
- Entry List: 320px fixed width
- Editor: Remaining space (fluid)

#### Collapsed Sidebar State

```
┌──┬────────────────┬─────────────────────────────────────────┐
│▶ │  Entry List    │         Editor/Preview                  │
└──┴────────────────┴─────────────────────────────────────────┘
   ↑
  6px hover zone with peek preview on hover
```

#### Focus Mode

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Editor Only (Centered)                   │
│                      Max-width: 65ch                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Hierarchy

```
JournalApp (Root)
├── Sidebar (Left Panel)
│   ├── Header Section
│   │   ├── App Title: "Journal"
│   │   ├── Collapse Button (◀)
│   │   └── New Entry Button (+)
│   ├── Quick Links Section
│   │   ├── Today (with count)
│   │   ├── This Week (with count)
│   │   ├── This Month (with count)
│   │   ├── Recent (with count)
│   │   └── Favorites (with count)
│   ├── Tags Section
│   │   └── Tag List (currently empty)
│   └── Settings Section
│       ├── Theme Toggle (Dawn/Dusk)
│       └── User Menu
│
├── EntryList (Center Panel)
│   ├── Header Section
│   │   ├── Title: "Journal Entries"
│   │   └── View Mode Toggle
│   │       ├── List View (default)
│   │       ├── Calendar View
│   │       └── River View
│   ├── Search Bar
│   ├── Stats Bar
│   │   ├── Entry Count
│   │   └── Total Word Count
│   ├── Entry Cards (Scrollable)
│   │   └── Entry Card (Repeated)
│   │       ├── Title
│   │       ├── Date/Time/Word Count
│   │       ├── Preview Text (2 lines)
│   │       ├── Tags
│   │       └── Delete Button (on hover)
│   └── Footer
│       └── "View All" Link
│
└── MarkdownSplitPane (Right Panel)
    ├── Toolbar
    │   ├── Entry Title (Editable)
    │   ├── Layout Toggle
    │   │   ├── Side-by-side (⬛⬜)
    │   │   ├── Editor Only (⬛)
    │   │   ├── Preview Only (⬜)
    │   │   └── Stacked (⬛/⬜)
    │   └── Save Status Indicator
    ├── Editor Pane
    │   └── Markdown Textarea
    └── Preview Pane
        └── Rendered Markdown
```

---

## 4. Detailed Component Specifications

### 4.1 Sidebar Component

#### Dimensions & Spacing

```
Width: 260px (fixed)
Padding: 16px (1rem)
Border Radius: 12px (rounded-xl)
Background: var(--sanctuary-bg-secondary)
```

#### Header Section

```
┌─────────────────────────────┐
│ Journal          [◀] [+]    │
└─────────────────────────────┘
Height: 40px
Font: Inter 18px bold
Buttons: 32x32px, rounded-lg
```

#### Quick Links

```
┌─────────────────────────────┐
│ 📝 Today               (2)  │  <- Active state: accent bg
│ 📅 This Week          (7)  │
│ 📆 This Month        (23)  │
│ ⏰ Recent             (5)  │
│ ⭐ Favorites          (0)  │
└─────────────────────────────┘
Item Height: 36px
Padding: 8px 12px
Active: accent background
Hover: 10% opacity accent
```

#### Theme Toggle

```
┌─────────────────────────────┐
│ Theme                       │
│ [☀️ Dawn] [🌙 Dusk]         │
└─────────────────────────────┘
Button Group: Segmented control
Active: Accent background
```

### 4.2 Entry List Component

#### Dimensions

```
Width: 320px (fixed)
Padding: 16px
Background: var(--sanctuary-bg-secondary)
Border Radius: 12px
```

#### Search Bar

```
┌─────────────────────────────┐
│ 🔍 Search entries...        │
└─────────────────────────────┘
Height: 40px
Padding: 8px 12px 8px 36px
Icon: 16x16px absolute left
```

#### Entry Card Design

```
┌─────────────────────────────┐
│ Entry Title            🗑️   │ <- Delete on hover
│ Oct 24 • 3:45 PM • 234 words│
│ This is a preview of the    │
│ entry content that shows... │
│ [#tag1] [#tag2] [+2]        │
└─────────────────────────────┘

Normal State:
- Background: var(--sanctuary-bg-tertiary)
- Padding: 12px
- Border Radius: 8px
- Margin Bottom: 8px

Selected State:
- Background: var(--sanctuary-accent)
- Text Color: var(--sanctuary-bg-primary)
- Shadow: 0 4px 6px rgba(0,0,0,0.1)

Hover State:
- Background: var(--sanctuary-bg-primary/50)
- Shadow: 0 2px 4px rgba(0,0,0,0.05)
- Delete button visible
```

#### View Mode Variations

**List View** (Default)
- Vertical card layout as shown above
- 2-line preview text
- Full metadata display

**Calendar View** (Placeholder)
```
┌─────────────────────────────┐
│      October 2024           │
│ S  M  T  W  T  F  S         │
│ 1  2  3  4  5  6  7         │
│ 8  9  10 11 12 13 14        │
│ 15 16 17 [24] 25 26 27      │
│ 28 29 30 31                 │
└─────────────────────────────┘
```

**River View** (Placeholder)
- Continuous stream layout
- No date separators
- Infinite scroll

### 4.3 Editor/Preview Component

#### Layout Modes

**Side-by-Side (Default)**
```
┌────────────┬────────────────┐
│            │                │
│   Editor   │    Preview     │
│    (50%)   │     (50%)      │
│            │                │
└────────────┴────────────────┘
```

**Stacked (Top/Bottom)**
```
┌──────────────────────────────┐
│          Editor              │
│           (50%)              │
├──────────────────────────────┤
│          Preview             │
│           (50%)              │
└──────────────────────────────┘
```

**Editor Only**
```
┌──────────────────────────────┐
│                              │
│      Editor (100%)           │
│                              │
└──────────────────────────────┘
```

**Preview Only**
```
┌──────────────────────────────┐
│                              │
│      Preview (100%)          │
│                              │
└──────────────────────────────┘
```

#### Toolbar Design

```
┌─────────────────────────────────────────────┐
│ Entry Title (editable)    [⬛⬜][⬛][⬜][⬛/⬜] │
│                           Saved 2s ago      │
└─────────────────────────────────────────────┘
Height: 48px
Title: Inter 16px medium
Save Status: Inter 12px, right-aligned
Layout Buttons: 32x24px toggle group
```

#### Editor Specifications

- Font: JetBrains Mono 14px
- Line Height: 1.7
- Padding: 24px
- Background: transparent
- No border, minimal style
- Auto-resize height
- Tab size: 2 spaces

#### Preview Rendering

- Font: Lora 16px (base)
- Line Height: 1.75
- Max Width: 65ch (optimal reading)
- Padding: 24px
- Markdown Features:
      - Headers (H1-H6) with hierarchy
      - Bold, italic, strikethrough
      - Code blocks with syntax highlighting
      - Lists (ordered/unordered)
      - Blockquotes
      - Links (underlined, accent color)
      - Tables
      - Math equations (KaTeX)

---

## 5. Interaction Patterns

### Keyboard Shortcuts

```
Cmd/Ctrl + B    - Toggle sidebar
Cmd/Ctrl + N    - New entry
Cmd/Ctrl + S    - Save entry
Cmd/Ctrl + F    - Focus search
Cmd/Ctrl + E    - Toggle editor mode
Cmd/Ctrl + P    - Toggle preview mode
Cmd/Ctrl + /    - Toggle focus mode
```

### Auto-Save Behavior

- Debounce: 1200ms after last keystroke
- Visual indicator: "Saving..." → "Saved Xs ago"
- Optimistic locking with version tracking

### Sidebar Collapse Animation

```
Expanded → Collapsed:
- Sidebar slides left (300ms ease)
- Content shifts left
- Hover tab appears (6px wide)

Hover on Collapsed:
- Peek panel slides in (200ms ease)
- Semi-transparent overlay
- Full sidebar functionality
```

### Entry Selection Flow

1. Click entry in list
2. Entry highlights with accent color
3. Content loads in editor (with loading state)
4. Auto-focus on editor if empty
5. Preview updates in real-time

---

## 6. Responsive Behavior

### Desktop (1280px+)

- Full 3-column layout
- All features visible
- Hover interactions enabled

### Tablet (768px-1279px)

- Sidebar collapses by default
- Entry list and editor visible
- Touch-optimized interactions
- Larger hit targets (44px minimum)

### Mobile (<768px)

- Single column layout
- Drawer navigation for sidebar
- Bottom sheet for entry list
- Full-screen editor
- Stacked layout only for preview

### Breakpoint Transitions

```css
/* Smooth transitions between breakpoints */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 7. Theme System

### CSS Variable Architecture

```css
/* Theme variables cascade */
:root (Dawn - default)
.dark (Dusk - class toggle)
[data-theme="dark"] (attribute toggle)
```

### Component Theming

Each component respects theme variables:
- Backgrounds: 3-tier system (primary/secondary/tertiary)
- Text: 2-tier system (primary/secondary)
- Accents: Context-aware (different in dark mode)
- Shadows: Opacity-based for theme compatibility

### Syntax Highlighting Themes

#### Dawn (Light) Palette

- Keywords: Purple (#7c3aed)
- Strings: Green (#059669)
- Numbers: Red (#dc2626)
- Functions: Blue (#2563eb)
- Types: Orange (#ea580c)
- Comments: Gray (#6b7280)

#### Dusk (Dark) Palette

- Keywords: Soft Purple (#cba6f7)
- Strings: Soft Green (#a6e3a1)
- Numbers: Soft Peach (#fab387)
- Functions: Soft Cyan (#89dceb)
- Types: Soft Yellow (#f9e2af)
- Comments: Blue-gray (#7f849c)
- Background: Deep Navy (#1e1e2e)

### Animation & Transitions

```
Standard: 200ms ease
Slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
Focus Mode: 8s ease-in-out (background pulse)
```

---

## Accessibility Considerations

### ARIA Labels

- All interactive elements have descriptive labels
- Landmark regions defined (nav, main, aside)
- Live regions for save status updates

### Keyboard Navigation

- Full keyboard accessibility
- Visible focus indicators (2px accent outline)
- Skip links for main content
- Trap focus in modals

### Color Contrast

- WCAG AAA compliance for text
- Minimum 7:1 for body text
- 4.5:1 for large text and UI elements
- Tested in both themes

### Screen Reader Support

- Semantic HTML structure
- Descriptive headings hierarchy
- Alternative text for icons
- Status announcements for actions

---

## Design Tokens Summary

### Spacing Scale

```
xs:  4px  (0.25rem)
sm:  8px  (0.5rem)
md:  16px (1rem)
lg:  24px (1.5rem)
xl:  32px (2rem)
2xl: 48px (3rem)
```

### Border Radius

```
sm:  4px  (0.25rem)
md:  8px  (0.5rem)
lg:  12px (0.75rem)
xl:  16px (1rem)
full: 9999px
```

### Shadow Scale

```
sm:  0 2px 4px rgba(0,0,0,0.05)
md:  0 4px 6px rgba(0,0,0,0.1)
lg:  0 10px 15px rgba(0,0,0,0.1)
xl:  0 20px 25px rgba(0,0,0,0.15)
```

### Z-Index Layers

```
Base:       0
Dropdown:   10
Sticky:     20
Overlay:    30
Modal:      40
Popover:    50
Tooltip:    60
```

---

*This document represents the complete UI design specification for the Journal application as of January 2025.*