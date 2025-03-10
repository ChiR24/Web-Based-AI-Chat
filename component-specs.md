# Component Specifications

## Chat.tsx

### State
```typescript
// Message type definition
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isThinking?: boolean;
  citations?: Array<{ id: number; text: string; url: string }>;
  geminiModel?: string; // Track which Gemini model was used
  codeBlocks?: CodeBlock[];
  reactions?: Reaction[];
  metadata?: {
    thinking?: ThinkingProcess;
    branch?: string;
    language?: string;
  };
}

// Local state
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [inputValue, setInputValue] = useState<string>('');
const [error, setError] = useState<Error | null>(null);
const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-pro');
const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(true);
const { thinking } = useThinking(isLoading); // Perplexity-inspired
const { activeBranch, branches } = useBranches(); // Grok-inspired
```

### Props
None - Chat is a top-level component that manages the entire chat interface.

### Description
The main container component that orchestrates the entire chat experience. It manages the message history, handles user input, and communicates with the Gemini API through the context provider. This component combines various subcomponents to create a cohesive chat interface with features inspired by both Perplexity and Grok designs.

### Implementation Details
- Uses `useGemini` hook to access Gemini API functionality
- Uses `useThinking` hook to manage AI thinking process visualization
- Uses `useBranches` hook to handle conversation branches (Grok-inspired)
- Renders welcome message for new conversations
- Displays thinking process indicator during AI response generation
- Handles message submission and history management
- Provides branch selection UI for multi-threaded conversations

### Example Usage
```tsx
// In App.tsx or page component
const App = () => {
  return (
    <GeminiProvider>
      <div className="app-container">
        <Header />
        <Chat />
      </div>
    </GeminiProvider>
  );
};
```

## GeminiProvider.tsx

### Props
```typescript
interface GeminiProviderProps {
  children: React.ReactNode;
  defaultModel?: string;
}
```

### State
```typescript
const [apiKey, setApiKey] = useState<string | null>(null);
const [isInitialized, setIsInitialized] = useState<boolean>(false);
const [error, setError] = useState<Error | null>(null);
const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(true); // Perplexity-inspired
```

### Functionality
- Provides Gemini AI client to all components
- Loads API key from environment variables
- Initializes the Gemini API client
- Handles API errors and authentication issues
- Provides context for model selection
- Manages web search capability (Perplexity-inspired)
- Handles thinking process state (Perplexity-inspired)

### Context Structure
```typescript
interface GeminiContextType {
  sendMessage: (prompt: string, options?: MessageOptions) => Promise<string>;
  isInitialized: boolean;
  error: Error | null;
  availableModels: GeminiModel[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  thinking: ThinkingProcess | null;
}

// MessageOptions type includes Grok-inspired branching
interface MessageOptions {
  model?: string;
  temperature?: number;
  webSearch?: boolean;
  branchId?: string;
  createNewBranch?: boolean;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);
```

## Header.tsx (Grok-inspired)

### Props
```typescript
interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  webSearchEnabled: boolean;
  onWebSearchToggle: () => void;
  toggleSidebar?: () => void;
}
```

### State
```typescript
const [showSettings, setShowSettings] = useState<boolean>(false);
const { theme, toggleTheme } = useTheme();
```

### Functionality
- Provides main application header with controls
- Toggles sidebar visibility for mobile
- Manages model selection
- Controls web search toggle (Perplexity-inspired)
- Toggles theme between dark and light mode
- Opens settings panel

### UI Structure
```tsx
<header className={styles.header}>
  <div className={styles.headerLeft}>
    <button onClick={toggleSidebar} className={styles.sidebarToggle}>
      ☰
    </button>
  </div>
  
  <div className={styles.headerCenter}>
    <GeminiModelSelector 
      selectedModel={selectedModel}
      onModelChange={onModelChange}
    />
  </div>
  
  <div className={styles.headerRight}>
    <button 
      className={`${styles.webSearchToggle} ${webSearchEnabled ? styles.enabled : ''}`}
      onClick={onWebSearchToggle}
      title="Toggle web search"
    >
      Web Search {webSearchEnabled ? '✓' : '✗'}
    </button>
    
    <LanguageSelector />
    
    <button 
      className={styles.settingsButton}
      onClick={() => setShowSettings(!showSettings)}
      title="Settings"
    >
      ⚙️
    </button>
    
    <button 
      className={styles.themeToggle}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  </div>
</header>
```

## Sidebar.tsx (Perplexity-inspired)

### Props
```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}
```

### State
```typescript
const { conversations, activeConversation, setActiveConversation } = useContext(ChatContext);
```

### Functionality
- Shows conversation history
- Organizes conversations by categories (Recent, Collections)
- Creates new conversations
- Manages conversation switching
- Responsive design for mobile/desktop views

### UI Structure
```tsx
<div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
  <div className={styles.sidebarHeader}>
    <h1 className={styles.appTitle}>Gemini Chat</h1>
    <button 
      className={styles.closeButton} 
      onClick={onClose}
      aria-label="Close sidebar"
    >
      ×
    </button>
  </div>
  
  <button 
    className={styles.newChatButton}
    onClick={() => setActiveConversation(null)}
  >
    + New Chat
  </button>
  
  <div className={styles.conversationLists}>
    <div className={styles.conversationCategory}>
      <h2 className={styles.categoryTitle}>Recent</h2>
      <div className={styles.conversationList}>
        {conversations
          .filter(c => c.recent)
          .map(conv => (
            <ConversationItem 
              key={conv.id}
              conversation={conv}
              isActive={activeConversation?.id === conv.id}
              onClick={() => setActiveConversation(conv)}
            />
          ))}
      </div>
    </div>
    
    <div className={styles.conversationCategory}>
      <h2 className={styles.categoryTitle}>Collections</h2>
      <div className={styles.conversationList}>
        {conversations
          .filter(c => c.collection)
          .map(conv => (
            <ConversationItem 
              key={conv.id}
              conversation={conv}
              isActive={activeConversation?.id === conv.id}
              onClick={() => setActiveConversation(conv)}
            />
          ))}
      </div>
    </div>
  </div>
  
  <div className={styles.sidebarFooter}>
    <button className={styles.helpButton}>
      Help & FAQ
    </button>
  </div>
</div>
```

## GeminiModelSelector.tsx (Grok-inspired)

### Props
```typescript
interface GeminiModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}
```

### State
```typescript
const [isOpen, setIsOpen] = useState<boolean>(false);
const { availableModels } = useContext(GeminiContext);
```

### Functionality
- Displays available Gemini models with detailed descriptions
- Allows selection of different models
- Shows capabilities and limitations of each model
- Persists model selection
- Rich UI with detailed model information (Grok-inspired)

### UI Structure
```tsx
<div className={styles.modelSelector}>
  <button 
    onClick={() => setIsOpen(!isOpen)}
    disabled={disabled}
    className={styles.selectorButton}
  >
    <div className={styles.selectedModelDisplay}>
      <span className={styles.modelIcon}>🤖</span>
      <span className={styles.modelName}>{getModelDisplayName(selectedModel)}</span>
      <span className={styles.arrow}>▼</span>
    </div>
  </button>
  
  {isOpen && (
    <div className={styles.dropdown}>
      <div className={styles.dropdownHeader}>
        <h3>Select Gemini Model</h3>
        <button 
          className={styles.closeButton} 
          onClick={() => setIsOpen(false)}
          aria-label="Close model selector"
        >
          ×
        </button>
      </div>
      
      <div className={styles.modelOptions}>
        {availableModels.map(model => (
          <div 
            key={model.id}
            className={`${styles.modelOption} ${selectedModel === model.id ? styles.selected : ''}`}
            onClick={() => {
              onModelChange(model.id);
              setIsOpen(false);
            }}
          >
            <div className={styles.modelHeader}>
              <div className={styles.radioButton}>
                {selectedModel === model.id ? '●' : '○'}
              </div>
              <div className={styles.modelName}>{model.name}</div>
            </div>
            <div className={styles.modelDescription}>
              {model.description}
            </div>
            <div className={styles.modelCapabilities}>
              {model.capabilities.map((capability, index) => (
                <span key={index} className={styles.capability}>
                  {capability}
                </span>
              ))}
            </div>
            {model.isDefault && (
              <div className={styles.defaultBadge}>Default</div>
            )}
          </div>
        ))}
      </div>
      
      <div className={styles.modelParameters}>
        <h4>Model Parameters</h4>
        <div className={styles.parameter}>
          <label htmlFor="temperature">Temperature:</label>
          <input 
            type="range" 
            id="temperature" 
            min="0" 
            max="1" 
            step="0.1" 
            defaultValue="0.7" 
          />
          <span className={styles.parameterValue}>0.7</span>
        </div>
        <div className={styles.parameter}>
          <label htmlFor="maxTokens">Max output tokens:</label>
          <input 
            type="range" 
            id="maxTokens" 
            min="256" 
            max="8192" 
            step="256" 
            defaultValue="1024" 
          />
          <span className={styles.parameterValue}>1024</span>
        </div>
      </div>
    </div>
  )}
</div>
```

## WelcomeMessage.tsx (Combined style)

### Props
```typescript
interface WelcomeMessageProps {
  onTopicSelect: (topic: string) => void;
  onTourStart?: () => void;
}
```

### State
```typescript
const [dismissed, setDismissed] = useState<boolean>(false);
const { hasShownWelcome } = useContext(ChatContext);
```

### Functionality
- Displays a friendly greeting for new users
- Provides quick-start topic buttons (Perplexity-inspired)
- Offers product tour option
- Appears only for new chats or first-time users
- Has friendly personality elements (Grok-inspired)

### UI Structure
```tsx
{!dismissed && !hasShownWelcome && (
  <div className={styles.welcomeMessage}>
    <div className={styles.welcomeHeader}>
      <h2 className={styles.welcomeTitle}>
        <span className={styles.waveEmoji}>👋</span> Welcome to Gemini Chat!
      </h2>
      <button 
        className={styles.dismissButton} 
        onClick={() => setDismissed(true)}
        aria-label="Dismiss welcome message"
      >
        ×
      </button>
    </div>
    
    <p className={styles.welcomeText}>
      I'm here to help with coding questions, creative writing, learning new topics, 
      and much more. What would you like to explore today?
    </p>
    
    <div className={styles.topicButtons}>
      <button 
        className={styles.topicButton}
        onClick={() => onTopicSelect("JavaScript coding help")}
      >
        JavaScript
      </button>
      <button 
        className={styles.topicButton}
        onClick={() => onTopicSelect("Python tutorial")}
      >
        Python
      </button>
      <button 
        className={styles.topicButton}
        onClick={() => onTopicSelect("React hooks explanation")}
      >
        React
      </button>
      <button 
        className={styles.topicButton}
        onClick={() => onTopicSelect("Creative writing prompt")}
      >
        Creative Writing
      </button>
    </div>
    
    <button 
      className={styles.tourButton}
      onClick={onTourStart}
    >
      Take a quick tour
    </button>
  </div>
)}
```

## MessageList.tsx

### Props
```typescript
interface MessageListProps {
  children: ReactNode;
}
```

### Description
Renders a scrollable container for chat messages with auto-scroll functionality. It automatically scrolls to the bottom when new messages are added and provides a "scroll to bottom" button when the user scrolls up.

### Implementation Details
- Uses `useRef` to reference the message container for scrolling
- Uses `useEffect` to handle automatic scrolling when new messages appear
- Implements scroll event handling to show/hide the scroll-to-bottom button
- Provides a consistent container for all message items

### Example Usage
```tsx
<MessageList>
  {messages.map(message => (
    <MessageItem key={message.id} message={message} />
  ))}
  {isLoading && thinking && (
    <ThinkingIndicator thinking={thinking} />
  )}
</MessageList>
```

## MessageItem.tsx

### Props
```typescript
interface MessageItemProps {
  message: Message;
}
```

### Description
Renders an individual message in the chat, with different styling for user and AI messages. Supports Markdown rendering, code syntax highlighting, source citations, and user reactions. The design combines clean card layout from Perplexity with interactive elements from Grok.

### Implementation Details
- Uses conditional rendering based on message role
- Implements Markdown parsing with custom renderers for code blocks
- Displays message metadata including timestamps and model information
- Renders source citations for AI-generated content with references
- Provides reaction buttons for feedback (like, dislike, etc.)
- Implements copy and share functionality

### Example Usage
```tsx
<MessageItem message={message} />
```

## CodeBlock.tsx

### Props
```typescript
interface CodeBlockProps {
  language: string;
  code: string;
  lineStart?: number;
}
```

### Description
A specialized component for rendering syntax-highlighted code blocks. Features Grok-inspired design with a header showing language type, line numbers, and a copy button. The component uses a dark background with proper syntax highlighting for readability.

### Implementation Details
- Uses syntax highlighting library for code formatting
- Implements clipboard functionality for one-click code copying
- Shows visual feedback when code is copied
- Includes line numbers starting from a configurable base
- Supports a wide range of programming languages

### Example Usage
```tsx
<CodeBlock 
  language="javascript" 
  code="const hello = () => console.log('Hello, world!');" 
  lineStart={1} 
/>
```

## SourceCitation.tsx

### Props
```typescript
interface SourceCitationProps {
  source: Source;
}

interface Source {
  id: number;
  title: string;
  url: string;
  snippet?: string;
}
```

### Description
Renders citation sources for AI-generated content, inspired by Perplexity's reference system. Citations appear as expandable links with source information and are numbered to match inline references in the message content.

### Implementation Details
- Formats URLs for display (truncates lengthy URLs)
- Opens links in new tabs with proper security attributes
- Displays source titles and optional snippets
- Uses Perplexity-inspired clean design with subtle hover effects

### Example Usage
```tsx
{message.sources?.map(source => (
  <SourceCitation key={source.id} source={source} />
))}
```

## ThinkingIndicator.tsx

### Props
```typescript
interface ThinkingIndicatorProps {
  thinking: ThinkingProcess;
}
```

### Description
Visualizes the AI thinking process while generating a response, inspired by Perplexity. Shows a step-by-step breakdown of what the AI is doing (searching, analyzing, formulating) with progress indicators. This creates transparency and engagement during longer generation times.

### Implementation Details
- Renders a list of thinking steps with status indicators
- Uses animations for loading states
- Shows progress percentage with a progress bar
- Displays search results preview when applicable
- Uses a clean, structured layout with numbered steps

### Example Usage
```tsx
{isLoading && thinking && (
  <ThinkingIndicator thinking={thinking} />
)}
```

## QuickReplies.tsx

### Props
```typescript
interface QuickRepliesProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}
```

### Description
Displays suggested quick reply options for users to select, combining the clean button style of Perplexity with the interactive feel of Grok. These suggestions appear below AI responses and provide one-click follow-up questions.

### Implementation Details
- Renders horizontally scrollable list of suggestion buttons
- Implements click handlers to send the selected suggestion
- Uses subtle animations for hover and click states
- Renders nothing if no suggestions are available
- Uses pill-shaped buttons with appropriate spacing

### Example Usage
```tsx
<QuickReplies 
  suggestions={thinking?.suggestions || []}
  onSelect={suggestion => sendMessage(suggestion)}
/>
```

## WelcomeMessage.tsx

### Props
```typescript
interface WelcomeMessageProps {
  onSendMessage: (message: string) => void;
}
```

### Description
Displays a welcome message for new conversations, providing a friendly introduction and suggesting topics to get started. Combines Perplexity's clean card layout with Grok's conversational tone.

### Implementation Details
- Renders a card with welcome text and branding
- Provides clickable topic buttons for quick starts
- Includes a tour button for first-time users
- Uses emojis and friendly language to establish personality
- Implements click handlers to send selected topics as messages

### Example Usage
```tsx
{messages.length === 0 && (
  <WelcomeMessage onSendMessage={handleSendMessage} />
)}
```

## BranchSelector.tsx

### Props
```typescript
interface BranchSelectorProps {
  branches: Branch[];
  activeBranch: string;
  onSwitchBranch: (branchId: string) => void;
  onCreateBranch: (name: string, sourceBranchId: string) => void;
}

interface Branch {
  id: string;
  name: string;
  parentId?: string;
  messages: Message[];
  createdAt: Date;
}
```

### Description
Enables users to create and switch between conversation branches, inspired by Grok's branching system. This allows exploration of alternative conversation paths from the same starting point.

### Implementation Details
- Renders a dropdown menu of available branches
- Shows visual indicator for the currently active branch
- Provides a button to create new branches from the current point
- Implements branch selection functionality
- Uses Grok-inspired design with clean toggles

### Example Usage
```tsx
{branches.length > 1 && (
  <BranchSelector 
    branches={branches}
    activeBranch={activeBranch}
    onSwitchBranch={switchBranch}
    onCreateBranch={createBranch}
  />
)}
```

## ChatInput.tsx

### Props
```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}
```

### Description
Provides a rich text input area for user messages with formatting options, send button, and loading state handling. Combines Perplexity's clean design with Grok's interactive features.

### Implementation Details
- Uses a resizable textarea for multi-line input
- Implements submit handlers for sending messages
- Provides keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Shows formatting toolbar with buttons for common formats
- Disables input during loading states
- Includes visual feedback for sending state

### Example Usage
```tsx
<ChatInput 
  onSendMessage={handleSendMessage}
  isLoading={isLoading}
  placeholder="Message Gemini..."
/>
```

## App.tsx

### Description
The top-level component that assembles the entire application. It provides the application layout, including the header with controls and the main chat area. The App component wraps everything in the GeminiProvider context.

### Implementation Details
- Imports and provides the GeminiProvider context
- Renders the application header with controls (settings, share, help buttons)
- Places the Chat component in the main content area
- Uses a responsive layout that adapts to different screen sizes
- Implements theme support for dark/light modes

### Example Usage
```tsx
// In main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Custom Hooks

### useGemini

```typescript
export const useGemini = () => {
  const context = useContext(GeminiContext);
  
  if (context === undefined) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  
  return context;
};
```

#### Description
A custom hook that provides access to the Gemini API context. It returns the context object containing the Gemini service instance, state variables for loading and errors, and functions for interacting with the API.

#### Returns
```typescript
{
  service: GeminiService | null;
  isLoading: boolean;
  error: Error | null;
  availableModels: GeminiModel[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  thinking: ThinkingProcess | null;
  sendMessage: (prompt: string, options?: MessageOptions) => Promise<string>;
}
```

### useThinking

```typescript
export const useThinking = (isLoading: boolean) => {
  const [thinkingProcess, setThinkingProcess] = useState<ThinkingProcess | null>(null);
  
  useEffect(() => {
    if (!isLoading) {
      setThinkingProcess(null);
      return;
    }
    
    // Simulate thinking steps for demo
    const steps = [
      { description: 'Searching for relevant information', status: 'in_progress' as const },
      { description: 'Analyzing sources', status: 'pending' as const },
      { description: 'Formulating response', status: 'pending' as const }
    ];
    
    setThinkingProcess({
      steps,
      progress: 0,
      suggestions: ['Tell me more', 'Explain in detail', 'Show code example']
    });
    
    // Simulate progress updates
    const timer = setInterval(() => {
      setThinkingProcess(prev => {
        if (!prev) return null;
        
        const progress = Math.min(100, (prev.progress || 0) + 5);
        const updatedSteps = [...prev.steps];
        
        if (progress > 30 && updatedSteps[0].status === 'in_progress') {
          updatedSteps[0].status = 'complete';
          updatedSteps[1].status = 'in_progress';
        }
        
        if (progress > 70 && updatedSteps[1].status === 'in_progress') {
          updatedSteps[1].status = 'complete';
          updatedSteps[2].status = 'in_progress';
        }
        
        return {
          ...prev,
          steps: updatedSteps,
          progress
        };
      });
    }, 200);
    
    return () => clearInterval(timer);
  }, [isLoading]);
  
  return thinkingProcess;
};
```

#### Description
A Perplexity-inspired hook that manages the thinking process visualization during AI response generation. It creates and updates a thinking process object with steps, progress, and suggestions.

#### Parameters
- `isLoading`: A boolean indicating whether the AI is currently generating a response

#### Returns
A `ThinkingProcess` object or null, containing steps, progress, and suggestions.

### useBranches

```typescript
export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'main', name: 'Main Thread', messages: [], createdAt: new Date() }
  ]);
  const [activeBranch, setActiveBranch] = useState('main');
  
  const createBranch = useCallback((name: string, fromBranchId?: string) => {
    const sourceBranch = fromBranchId ? 
      branches.find(b => b.id === fromBranchId) : 
      branches.find(b => b.id === activeBranch);
    
    if (!sourceBranch) return;
    
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      name,
      parentId: sourceBranch.id,
      messages: [...sourceBranch.messages],
      createdAt: new Date()
    };
    
    setBranches(prev => [...prev, newBranch]);
    setActiveBranch(newBranch.id);
    
    return newBranch.id;
  }, [branches, activeBranch]);
  
  const switchBranch = useCallback((branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setActiveBranch(branchId);
    }
  }, [branches]);
  
  const addMessageToBranch = useCallback((message: Message, branchId?: string) => {
    const targetBranchId = branchId || activeBranch;
    
    setBranches(prev => prev.map(branch => {
      if (branch.id === targetBranchId) {
        return {
          ...branch,
          messages: [...branch.messages, message]
        };
      }
      return branch;
    }));
  }, [activeBranch]);
  
  const getActiveBranchMessages = useCallback(() => {
    const branch = branches.find(b => b.id === activeBranch);
    return branch ? branch.messages : [];
  }, [branches, activeBranch]);
  
  return {
    branches,
    activeBranch,
    createBranch,
    switchBranch,
    addMessageToBranch,
    getActiveBranchMessages
  };
};
```

#### Description
A Grok-inspired hook that manages conversation branches. It allows creating multiple conversation paths from the same starting point, switching between them, and managing messages within each branch.

#### Returns
```typescript
{
  branches: Branch[];                // All available branches
  activeBranch: string;             // ID of the currently active branch
  createBranch: (name: string, fromBranchId?: string) => string | undefined;  // Create a new branch
  switchBranch: (branchId: string) => void;  // Switch to a different branch
  addMessageToBranch: (message: Message, branchId?: string) => void;  // Add a message to a branch
  getActiveBranchMessages: () => Message[];  // Get messages from active branch
}
```

### useChat

```typescript
export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage: geminiSendMessage, selectedModel, thinking } = useGemini();
  const { 
    addMessageToBranch, 
    getActiveBranchMessages, 
    activeBranch, 
    branches 
  } = useBranches();
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // Add user message to active branch
    addMessageToBranch(userMessage);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send message to Gemini API
      const response = await geminiSendMessage(content, {
        branchId: activeBranch
      });
      
      // Create AI message
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        geminiModel: selectedModel
      };
      
      // Add AI message to active branch
      addMessageToBranch(aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date()
      };
      
      // Add error message to active branch
      addMessageToBranch(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [geminiSendMessage, addMessageToBranch, activeBranch, selectedModel]);
  
  // Get messages from active branch
  const messages = getActiveBranchMessages();
  
  return {
    messages,
    isLoading,
    sendMessage,
    thinking,
    activeBranch,
    branches
  };
};
```

#### Description
A comprehensive hook that combines `useGemini` and `useBranches` to provide a complete chat messaging system. It handles sending messages, receiving responses, managing loading states, and organizing messages into branches.

#### Returns
```typescript
{
  messages: Message[];              // Messages in the active branch
  isLoading: boolean;               // Whether an AI response is being generated
  sendMessage: (content: string) => Promise<void>;  // Send a message
  thinking: ThinkingProcess | null; // Current thinking process data
  activeBranch: string;             // ID of the active branch
  branches: Branch[];               // All conversation branches
}
```

## Design System Integration

All components follow a consistent design system that combines elements from both Perplexity and Grok interfaces:

### From Perplexity
- Clean card layout for messages with subtle shadows
- Progressive disclosure patterns for complex information
- Citation system with numbered references
- Thinking process visualization
- Source attribution and transparency

### From Grok
- Dark theme with vibrant accent colors
- Interactive and playful micro-animations
- Conversational personality in UI elements
- Branch conversation capabilities
- Code block formatting with syntax highlighting

### Tailwind CSS Integration
Components use Tailwind CSS for styling with a consistent color palette and design tokens:

```css
/* Color variables in tailwind.config.js */
colors: {
  // Background colors
  'bg-primary': 'var(--bg-primary)',
  'bg-secondary': 'var(--bg-secondary)',
  'bg-tertiary': 'var(--bg-tertiary)',
  
  // Text colors
  'text-primary': 'var(--text-primary)',
  'text-secondary': 'var(--text-secondary)',
  'text-tertiary': 'var(--text-tertiary)',
  
  // Accent colors
  'accent-primary': 'var(--accent-primary)',
  'accent-secondary': 'var(--accent-secondary)',
  
  // UI colors
  'border': 'var(--border-color)',
  'hover': 'var(--hover-color)',
}
```

### Accessibility Considerations
All components implement proper accessibility features:

- Color contrast ratios meet WCAG AA standards
- Proper semantic HTML elements
- ARIA attributes for complex widgets
- Keyboard navigation support
- Screen reader compatibility
- Focus management for interactive elements