# Advanced AI Chat UI Mockup (Final)

## Layout Overview

The advanced AI chat UI application blends design elements from Perplexity and Grok interfaces, powered by Google's Gemini API, featuring a sophisticated dark-themed interface with the following structure:

```
+--------------------------------------------------------------+
|                       GEMINI CHAT UI                          |
+--------------------------------------------------------------+
| [☰] [Gemini Models ▼] [Web Search ☑] [🌐 EN] [⚙] [🌙/☀️]   |
+--------------------------------------------------------------+
|                                                              |
| +-------------------+ +------------------------------------+ |
| |                   | |                                    | |
| |  CONVERSATION     | |         CONVERSATION HEADER        | |
| |     LIST          | |  Topic: JavaScript Binary Search   | |
| |                   | +------------------------------------+ |
| | Recent            | |                                    | |
| | ✓ Binary Search   | |  +--------------------------------+ | |
| |   Arrays          | |  |        WELCOME MESSAGE        | | |
| |   React Hooks     | |  |                               | | |
| |                   | |  | 👋 Welcome to Gemini Chat!    | | |
| | Collections       | |  | I'm here to help with your    | | |
| |   JavaScript      | |  | coding questions and more.    | | |
| |   Python          | |  |                               | | |
| |                   | |  | Try asking about:             | | |
| | [+ New Chat]      | |  | [JavaScript] [Python] [React] | | |
| |                   | |  |                               | | |
| | [🌐 EN | 🔄]      | |  | [Take a quick tour]           | | |
| |                   | |  +--------------------------------+ | |
| |                   | |                                    | |
| |                   | |  +--------------------------------+ | |
| |                   | |  |        USER MESSAGE           | | |
| |                   | |  |                               | | |
| |                   | |  | [User] You             12:34  | | |
| |                   | |  |                               | | |
| |                   | |  | How do I implement a binary   | | |
| |                   | |  | search tree in JavaScript?    | | |
| |                   | |  |           [Copy] [Share] [•••]| | |
| |                   | |  +--------------------------------+ | |
| |                   | |                                    | |
| |                   | |  +--------------------------------+ | |
| |                   | |  |      THINKING PROCESS         | | |
| |                   | |  |                               | | |
| |                   | |  | [AI] Gemini Pro         12:35 | | |
| |                   | |  |                               | | |
| |                   | |  | Thinking...                   | | |
| |                   | |  | 1. Searching for relevant info| | |
| |                   | |  |    - MDN JavaScript reference | | |
| |                   | |  |    - GitHub BST examples      | | |
| |                   | |  | 2. Analyzing implementation...| | |
| |                   | |  | [===========------] 65%       | | |
| |                   | |  +--------------------------------+ | |
| |                   | |                                    | |
| |                   | |  +--------------------------------+ | |
| |                   | |  |    AI MESSAGE WITH SOURCES    | | |
| |                   | |  |                               | | |
| |                   | |  | [AI] Gemini Pro         12:36 | | |
| |                   | |  |                               | | |
| |                   | |  | A binary search tree (BST) is | | |
| |                   | |  | a data structure where each   | | |
| |                   | |  | node has at most two children,| | |
| |                   | |  | and all values in the left    | | |
| |                   | |  | subtree are less than the     | | |
| |                   | |  | node's value, while all values| | |
| |                   | |  | in the right subtree are      | | |
| |                   | |  | greater[1].                   | | |
| |                   | |  |                               | | |
| |                   | |  | ┌─────────────────────────┐   | | |
| |                   | |  | │ Sources:                │   | | |
| |                   | |  | │                         │   | | |
| |                   | |  | │ [1] MDN Web Docs        │   | | |
| |                   | |  | │ developer.mozilla.org   │   | | |
| |                   | |  | │                         │   | | |
| |                   | |  | │ [2] GeeksforGeeks       │   | | |
| |                   | |  | │ geeksforgeeks.org       │   | | |
| |                   | |  | └─────────────────────────┘   | | |
| |                   | |  |                               | | |
| |                   | |  | [👍] [👎] [🤔] [🔄] [•••]    | | |
| |                   | |  +--------------------------------+ | |
| |                   | |                                    | |
| |                   | |  +--------------------------------+ | |
| |                   | |  |    AI MESSAGE WITH CODE       | | |
| |                   | |  |                               | | |
| +-------------------+ |  | // Implementation             | | |
|                        |  | class Node {                  | | |
| +-------------------+  |  |   constructor(value) {        | | |
| |  BRANCH SELECTOR  |  |  |     this.value = value;      | | |
| | ● Main thread     |  |  |     this.left = null;        | | |
| | ○ Alternative impl|  |  |     this.right = null;       | | |
| +-------------------+  |  |   }                          | | |
|                        |  | }                            | | |
|                        |  |                               | | |
|                        |  | [👍] [👎] [Branch 🔀] [•••]   | | |
|                        |  +--------------------------------+ | |
|                        |                                    | |
|                        |  +--------------------------------+ | |
|                        |  |       QUICK REPLY BUTTONS     | | |
|                        |  |                               | | |
|                        |  | [How to search a BST?]        | | |
|                        |  | [Implement BST deletion]      | | |
|                        |  | [BST vs AVL Tree]             | | |
|                        |  |                               | | |
|                        |  +--------------------------------+ | |
|                        |                                    | |
|                        | +------------------------------------+ |
|                        | |        ENHANCED INPUT AREA         | |
|                        | |                                    | |
|                        | | [/] [B] [I] [<>] [Gemini ▼]        | |
|                        | | +--------------------------------+ | |
|                        | | |                                | | |
|                        | | +--------------------------------+ | |
|                        | |                      [🎤 EN] 📎 ➤ | |
|                        | +------------------------------------+ |
|                                                                |
+--------------------------------------------------------------+
```

## Detailed UI Elements

### Header (Grok-inspired)
```
+--------------------------------------------------------------+
| [☰] [Gemini Models ▼] [Web Search ☑] [🌐 EN] [⚙] [🌙/☀️]   |
+--------------------------------------------------------------+
```
- **Menu Button**: Toggle for sidebar visibility (mobile-friendly)
- **Gemini Model Selector**: Dropdown to choose Gemini AI model (Pro, Pro Vision, Flash)
- **Web Search Toggle**: Enable/disable web search (Perplexity-style)
- **Language Selector**: Multilingual support with auto-detection
- **Settings**: Access app settings and preferences
- **Theme Toggle**: Switch between dark and light modes

### Gemini Model Selector (Grok-styled)
```
+----------------------------+
| Select Gemini Model        |
|                            |
| ● gemini-1.5-pro           |
|   Most capable model       |
|   32k context, multimodal  |
|                            |
| ○ gemini-1.5-flash         |
|   Fastest responses        |
|   32k context, text only   |
|                            |
| ○ gemini-1.5-pro-vision    |
|   Image understanding      |
|   32k context, multimodal  |
|                            |
| Model Parameters:          |
| Temperature: [0.2]         |
| Max Output: [1024]         |
+----------------------------+
```
- Radio button selection with descriptive text
- Parameter adjustments for advanced users
- Clear model capabilities and descriptions
- Visual indicator for selected model

### Sidebar (Perplexity-inspired)
```
+-------------------+
|  CONVERSATION     |
|     LIST          |
|                   |
| Recent            |
| ✓ Binary Search   |
|   Arrays          |
|   React Hooks     |
|                   |
| Collections       |
|   JavaScript      |
|   Python          |
|                   |
| [+ New Chat]      |
|                   |
| [🌐 EN | 🔄]      |
+-------------------+
```
- Clean, categorized organization of conversations
- Visual indicator for active conversation
- Collapsible categories (Recent, Collections)
- New chat button for starting fresh
- Language controls at bottom
- Minimal design to reduce visual noise (Perplexity-style)

### Welcome Message (Combined style)
```
+--------------------------------+
|        WELCOME MESSAGE        |
|                               |
| 👋 Welcome to Gemini Chat!    |
| I'm here to help with your    |
| coding questions and more.    |
|                               |
| Try asking about:             |
| [JavaScript] [Python] [React] |
|                               |
| [Take a quick tour]           |
+--------------------------------+
```
- Friendly greeting with emoji (Grok personality)
- Quick-start topic buttons (Perplexity style)
- Tour option for first-time users
- Clean card-based design (Perplexity)
- Conversational tone (Grok)

### Branch Selection (Grok-inspired)
```
+-------------------+
|  BRANCH SELECTOR  |
| ● Main thread     |
| ○ Alternative impl|
+-------------------+
```
- Radio button selection for conversation branches
- Visual indicator for current branch
- Create new branch option
- Minimalist interface that expands on hover

### User Message (Combined style)
```
+--------------------------------+
|        USER MESSAGE           |
|                               |
| [User] You             12:34  |
|                               |
| How do I implement a binary   |
| search tree in JavaScript?    |
|           [Copy] [Share] [•••]|
+--------------------------------+
```
- Clean card layout (Perplexity)
- Right-aligned action buttons (Grok)
- Clear sender and timestamp
- High-contrast, readable text
- Subtle hover effects for interactions

### Thinking Process Visualization (Perplexity-inspired)
```
+--------------------------------+
|      THINKING PROCESS         |
|                               |
| [AI] Gemini Pro         12:35 |
|                               |
| Thinking...                   |
| 1. Searching for relevant info|
|    - MDN JavaScript reference |
|    - GitHub BST examples      |
| 2. Analyzing implementation...|
| [===========------] 65%       |
+--------------------------------+
```
- Step-by-step visualization of AI reasoning
- Numbered steps with substeps
- Progress indicator for long operations
- Search source identification
- Clean, structured layout
- Live updating progress bar

### AI Message with Sources (Perplexity-inspired)
```
+--------------------------------+
|    AI MESSAGE WITH SOURCES    |
|                               |
| [AI] Gemini Pro         12:36 |
|                               |
| A binary search tree (BST) is |
| a data structure where each   |
| node has at most two children,|
| and all values in the left    |
| subtree are less than the     |
| node's value, while all values|
| in the right subtree are      |
| greater[1].                   |
|                               |
| ┌─────────────────────────┐   |
| │ Sources:                │   |
| │                         │   |
| │ [1] MDN Web Docs        │   |
| │ developer.mozilla.org   │   |
| │                         │   |
| │ [2] GeeksforGeeks       │   |
| │ geeksforgeeks.org       │   |
| └─────────────────────────┘   |
|                               |
| [👍] [👎] [🤔] [🔄] [•••]    |
+--------------------------------+
```
- Clean card design (Perplexity)
- Inline citation references
- Expandable source panel
- Reaction buttons along bottom (Grok)
- Clear attribution to model
- Links to cited sources

### AI Message with Code (Grok-inspired)
```
+--------------------------------+
|    AI MESSAGE WITH CODE       |
|                               |
| [AI] Gemini Pro         12:37 |
|                               |
| Here's an implementation of a |
| binary search tree in JS:     |
|                               |
| ┌─────────────────────────┐   |
| │ javascript              │   |
| │ class Node {            │   |
| │   constructor(value) {  │   |
| │     this.value = value; │   |
| │     this.left = null;   │   |
| │     this.right = null;  │   |
| │   }                     │   |
| │ }                       │   |
| │                         │   |
| │         [Copy] [Run]    │   |
| └─────────────────────────┘   |
|                               |
| [👍] [👎] [Branch 🔀] [•••]   |
+--------------------------------+
```
- Syntax highlighting with language indicator
- Copy code button
- Dark code blocks with proper contrast (Grok)
- Clean, monospace font
- Branch button for alternative implementations
- Full reaction system
- Line numbers for longer blocks

### Quick Reply Buttons (Combined style)
```
+--------------------------------+
|       QUICK REPLY BUTTONS     |
|                               |
| [How to search a BST?]        |
| [Implement BST deletion]      |
| [BST vs AVL Tree]             |
|                               |
+--------------------------------+
```
- Contextually generated suggestions
- Clean, pill-shaped buttons (Perplexity)
- One-click follow-up questions
- Horizontal scrolling for many options
- Subtle hover effects (Grok)

### Enhanced Input Area (Combined style)
```
+------------------------------------+
|        ENHANCED INPUT AREA         |
|                                    |
| [/] [B] [I] [<>] [Gemini ▼]        |
| +--------------------------------+ |
| |                                | |
| +--------------------------------+ |
|                      [🎤 EN] 📎 ➤ |
+------------------------------------+
```
- Slash command button (Grok)
- Formatting options (combined style)
- Model dropdown for quick switching (Grok)
- Resizable, multiline text area
- Voice input with language indicator
- File attachment button (Perplexity)
- Send button with state-based styling
- Floating format bar (combined style)

## Visual Design Elements

### From Perplexity
- **Card Layout**: Each message appears as a distinct card with subtle shadows
- **Progressive Disclosure**: Expandable sections like sources and code
- **Citation System**: Clean, numbered references to sources
- **Thinking Process**: Step-by-step visualization of AI work
- **Clean Typography**: Highly readable text with proper contrast
- **Structured Layout**: Well-organized content with clear hierarchy

### From Grok
- **Dark Theme**: Rich dark background with vibrant accents
- **Playful Interactions**: Hover effects and micro-animations
- **Conversational Elements**: UI that feels like chatting with a friend
- **Elevated Code Blocks**: Code stands out with syntax highlighting
- **Branch System**: Clear visual way to explore alternatives
- **Personality**: Touches of personality in messaging and UI elements

## Color Palette (Combined)

### Dark Mode (Default)
- **Background**: Deep dark (#121212) from Grok
- **Card Background**: Slightly lighter dark (#1D1E20) from Grok
- **UI Elements**: Medium dark (#2D2D2D)
- **Primary Accent**: Perplexity blue (#3B82F6)
- **Secondary Accent**: Grok's purple accent (#8E5EF2)
- **Text**: 
  - Primary: White (#FFFFFF)
  - Secondary: Light gray (#B0B0B0)
  - Tertiary: Medium gray (#787878)
- **Code Elements**:
  - Background: Very dark blue-gray (#151820)
  - Syntax colors from Grok's theme

### Light Mode (Optional)
- **Background**: Light gray (#F8F9FA) from Perplexity
- **Card Background**: White (#FFFFFF)
- **UI Elements**: Very light gray (#F0F0F0)
- **Primary Accent**: Perplexity blue (#3B82F6)
- **Secondary Accent**: Grok's purple accent (#8E5EF2) 
- **Text**:
  - Primary: Very dark gray (#212121)
  - Secondary: Medium gray (#616161)
  - Tertiary: Light gray (#9E9E9E)
- **Code Elements**:
  - Background: Light gray (#F5F5F5)
  - Syntax colors from Perplexity's theme

## Typography

- **Primary Font**: Inter (Perplexity) for UI elements
- **Secondary Font**: SF Pro Display (Grok) for headings
- **Code Font**: JetBrains Mono or SF Mono (from Grok)
- **Size Hierarchy**:
  - Heading: 18px
  - Body: 16px
  - Secondary text: 14px
  - Tertiary info: 12px
- **Line Heights**:
  - UI elements: 1.5
  - Body text: 1.6
  - Code blocks: 1.4

## Responsive Design Adaptations

### Mobile View (Grok-inspired)
```
+--------------------------------+
|        GEMINI CHAT UI          |
| [☰] [Model: Pro] [⚙]          |
+--------------------------------+
|                                |
| +----------------------------+ |
| |      WELCOME MESSAGE      | |
| | 👋 Welcome! Ask me anything| |
| | [JavaScript] [Python] [ML] | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |        USER MESSAGE       | |
| |                           | |
| | [U] You            12:34  | |
| |                           | |
| | How do I implement...     | |
| |                           | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |       AI MESSAGE          | |
| |                           | |
| | [AI] Gemini Pro    12:35  | |
| |                           | |
| | A binary search tree is...| |
| | [Show sources (2)]        | |
| |                           | |
| | [👍] [👎] [🔄] [•••]      | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| | [Implement BST deletion]   | |
| | [BST vs AVL Tree]          | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| | [/] [Model ▼] [B][I][<>]  | |
| | [                        ]| |
| |                  [🎤] ➤   | |
| +----------------------------+ |
+--------------------------------+
```

### Tablet View (Perplexity-inspired)
```
+-----------------------------------+
|          CHAT UI APP              |
| [☰] [Models ▼] [Web Search ☑] [⚙] |
+-----------------------------------+
|                                   |
| +-------------------------------+ |
| |        USER MESSAGE          | |
| |                              | |
| | [User] You             12:34 | |
| |                              | |
| | How do I implement...        | |
| |                              | |
| +-------------------------------+ |
|                                   |
| +-------------------------------+ |
| |        AI MESSAGE            | |
| |                              | |
| | [AI] Gemini Pro        12:35 | |
| |                              | |
| | A binary search tree is...   | |
| | [Show sources]               | |
| |                              | |
| | [👍] [👎] [🔄] [•••]         | |
| +-------------------------------+ |
|                                   |
| +-------------------------------+ |
| | [Implement BST deletion]      | |
| | [BST vs AVL Tree]             | |
| +-------------------------------+ |
|                                   |
| +-------------------------------+ |
| | [/] [B][I][<>] [Model ▼]     | |
| | [                           ]| |
| |                     [🎤] 📎 ➤| |
| +-------------------------------+ |
+-----------------------------------+
```

## Enhanced Animations & Transitions

### From Perplexity
- **Loading Animations**: Smooth, subtle loading states
- **Source Expansion**: Clean expansion/collapse of source citations
- **Thinking Process**: Step-by-step progression animations
- **Component Transitions**: Measured, purposeful transitions

### From Grok
- **Message Appearance**: Playful message entrance animations
- **Input Focus**: Subtle glow effects on focus
- **Button Interactions**: Delightful micro-animations on hover/press
- **Code Block**: Syntax highlighting fade-in

## Accessibility Features

- **Color Contrast**: WCAG AA+ compliant for all text
- **Keyboard Navigation**: Full keyboard support with visible focus states
- **Screen Reader**: Compatible with assistive technologies
- **Reduced Motion**: Option to minimize animations
- **Text Scaling**: Proper text scaling without layout breaks
- **Focus Management**: Proper focus management in modals and popups
- **Alternative Text**: All visual elements have proper alt text
- **Aria Attributes**: Proper ARIA roles and attributes

This advanced UI mockup creates a sophisticated, intuitive interface that combines the best design elements from Perplexity and Grok, powered by Google's Gemini API. It focuses on clear information hierarchy, elegant user interactions, and a clean, distraction-free environment for AI-powered conversation. 