# Advanced AI Chat UI App Plan (Final)

## Overview

This plan outlines the development of a sophisticated AI chat UI application that blends design elements from Perplexity and Grok interfaces, powered by Google's Gemini API. The application follows modern React patterns and best practices to deliver a responsive, accessible, and feature-rich chat experience.

## Tech Stack

- **Frontend Framework**: React 18 with functional components and hooks
- **AI Integration**: Google Gemini API with environment variable configuration (.env)
- **Language**: TypeScript for type safety and improved developer experience
- **Styling**: Tailwind CSS with CSS Modules for component-scoped styling
- **State Management**: Context API + React Query for server state
- **UI Components**: Custom components inspired by Perplexity and Grok interfaces
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Testing**: Jest, React Testing Library for component testing
- **Internationalization**: react-intl or i18next for multilingual support
- **Build Tools**: Vite for fast development experience

## UI Design Inspiration

### From Perplexity
- Clean, minimalist interface with focus on content
- Card-based message design with clear visual separation
- Prominent search capabilities and web reference integration
- Citation linking and source attribution
- Thinking process visualization with step indicators
- Concise sidebar navigation with focused categories
- Seamless mobile responsive design

### From Grok
- Modern dark theme with high contrast elements
- Playful UI interactions and microanimations
- Conversational, personality-rich interface elements
- Dynamic input area with smart suggestions
- Clever use of whitespace and typography
- Branch conversation capabilities
- Rich formatting for code blocks and technical content

## React Implementation Approach

### Component Architecture

We'll follow React's component-based architecture best practices:

1. **Functional Components**: Use functional components with hooks instead of class components
2. **Declarative UI**: Define UI as a function of state, not imperatively manipulating the DOM
3. **Component Composition**: Build complex UIs from simple, reusable components
4. **Container/Presentational Pattern**: Separate data-fetching logic from UI rendering
5. **Custom Hooks**: Extract reusable stateful logic into custom hooks

### Key React Hooks

- **useState**: For component-level state management
- **useEffect**: For side effects like API calls and DOM interactions
- **useContext**: For global state and theme management
- **useCallback**: For memoized callbacks to prevent unnecessary re-renders
- **useMemo**: For expensive calculations
- **useRef**: For DOM element references and persisting values between renders
- **useOptimistic**: For optimistic UI updates during message sending

### State Management

- Use **useState** for local component state
- Use **useContext** with **useReducer** for complex state logic and global state
- Implement the "lifting state up" pattern for sharing state between components
- Keep state as close as possible to where it's used

## Folder Structure

```
/src
  /api                 # API integration
    /gemini            # Gemini API service
  /components          # Shared components
    /ui                # Base UI components
    /chat              # Chat-specific components
      /MessageList.tsx
      /MessageItem.tsx
      /ChatInput.tsx
      /ThinkingIndicator.tsx
      /WelcomeMessage.tsx
      /QuickReplies.tsx
      /SourceCitation.tsx      # From Perplexity design
      /CodeBlock.tsx           # From Grok design
      /BranchSelector.tsx      # From Grok design
    /layout            # Layout components
      /Sidebar.tsx             # Perplexity-inspired navigation
      /Header.tsx              # Grok-style header with model selector
  /context             # Context providers
    /GeminiProvider.tsx # Gemini API context
    /ChatProvider.tsx   # Chat state and logic
    /ThemeProvider.tsx  # Dark/light theme support
  /hooks               # Custom hooks
    /useChat.ts        # Chat-related hooks
    /useGemini.ts      # Gemini API hooks
    /useMessages.ts    # Message handling hooks
    /useThinking.ts    # Perplexity-inspired thinking process hooks
    /useBranches.ts    # Grok-inspired conversation branches
  /types               # TypeScript types
  /utils               # Utility functions
  /styles              # Global styles
  /pages               # Page components
  /constants           # Constants and configuration
  /i18n                # Internationalization resources
  /tests               # Test files
/public                # Static assets
```

## Core React Components

### Layout Components

#### `AppLayout.tsx`
```tsx
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { theme } = useTheme();
  
  return (
    <div className={`app-layout ${theme}`}>
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-container">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};
```

#### `Sidebar.tsx` (Perplexity-inspired)
```tsx
const Sidebar: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { conversations, activeConversation, setActiveConversation } = useContext(ChatContext);
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h1>Gemini Chat</h1>
        <button onClick={() => setActiveConversation(null)}>+ New Chat</button>
      </div>
      <div className="conversation-categories">
        <h2>Recent</h2>
        <div className="conversation-list">
          {conversations.filter(c => c.recent).map(conv => (
            <ConversationItem 
              key={conv.id}
              conversation={conv}
              isActive={activeConversation?.id === conv.id}
              onClick={() => setActiveConversation(conv)}
            />
          ))}
        </div>
        
        <h2>Collections</h2>
        <div className="conversation-list">
          {conversations.filter(c => c.collection).map(conv => (
            <ConversationItem 
              key={conv.id}
              conversation={conv}
              isActive={activeConversation?.id === conv.id}
              onClick={() => setActiveConversation(conv)}
            />
          ))}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </div>
  );
};
```

#### `Header.tsx` (Grok-inspired)
```tsx
const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { selectedModel, setSelectedModel, availableModels } = useGemini();
  
  return (
    <header className="app-header">
      <button onClick={toggleSidebar} className="sidebar-toggle">
        ☰
      </button>
      <div className="header-center">
        <GeminiModelSelector 
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          availableModels={availableModels}
        />
      </div>
      <div className="header-actions">
        <button className="web-search-toggle">
          🔍 Web Search
        </button>
        <button className="settings-button">
          ⚙️
        </button>
      </div>
    </header>
  );
};
```

### Chat Components

#### `Chat.tsx`
```tsx
const Chat: React.FC = () => {
  const { messages, sendMessage, isLoading, thinking } = useChat();
  const [inputValue, setInputValue] = useState('');
  const { activeBranch, branches } = useBranches();
  
  const handleSendMessage = useCallback(() => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  }, [inputValue, sendMessage]);
  
  return (
    <div className="chat-container">
      <WelcomeMessage />
      
      <div className="chat-messages-container">
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          thinking={thinking}
        />
      </div>
      
      {branches.length > 1 && (
        <BranchSelector 
          branches={branches}
          activeBranch={activeBranch}
        />
      )}
      
      <QuickReplies 
        suggestions={thinking?.suggestions || []}
        onSelect={suggestion => sendMessage(suggestion)}
      />
      
      <ChatInput 
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
```

#### `MessageList.tsx`
```tsx
const MessageList: React.FC<{ 
  messages: Message[]; 
  isLoading: boolean;
  thinking?: ThinkingProcess;
}> = ({ messages, isLoading, thinking }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="message-list">
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
      
      {isLoading && thinking && (
        <ThinkingIndicator 
          steps={thinking.steps}
          progress={thinking.progress}
          searchResults={thinking.searchResults}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
```

#### `MessageItem.tsx` (Combining Perplexity and Grok designs)
```tsx
const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const { role, content, timestamp, geminiModel, sources, codeBlocks } = message;
  const isUser = role === 'user';
  
  return (
    <div className={`message-item ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-sender">{isUser ? 'You' : 'Gemini'}</span>
          <span className="message-time">{formatTime(timestamp)}</span>
          {geminiModel && <span className="model-badge">{geminiModel}</span>}
        </div>
        
        <div className="message-text">
          <ReactMarkdown 
            components={{
              code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        
        {sources && sources.length > 0 && (
          <SourceCitation sources={sources} />
        )}
        
        {!isUser && (
          <div className="message-actions">
            <button className="action-button">👍</button>
            <button className="action-button">👎</button>
            <button className="action-button">🔄 Regenerate</button>
            <button className="action-button">⋮</button>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### `ThinkingIndicator.tsx` (Perplexity-inspired)
```tsx
const ThinkingIndicator: React.FC<{
  steps?: ThinkingStep[];
  progress?: number;
  searchResults?: SearchResult[];
}> = ({ steps, progress, searchResults }) => {
  return (
    <div className="thinking-container">
      <div className="thinking-header">
        <span className="thinking-label">Thinking</span>
        <div className="thinking-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
      
      {steps && steps.length > 0 && (
        <div className="thinking-steps">
          {steps.map((step, index) => (
            <div key={index} className={`thinking-step ${step.status}`}>
              <div className="step-indicator">{index + 1}</div>
              <div className="step-content">
                <div className="step-description">{step.description}</div>
                {step.substeps && step.substeps.length > 0 && (
                  <div className="step-substeps">
                    {step.substeps.map((substep, i) => (
                      <div key={i} className={`substep ${substep.status}`}>
                        {substep.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {searchResults && searchResults.length > 0 && (
        <div className="search-results-preview">
          <div className="preview-header">Search results:</div>
          <div className="preview-results">
            {searchResults.map((result, index) => (
              <div key={index} className="search-result-preview">
                <div className="result-title">{result.title}</div>
                <div className="result-url">{result.url}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {progress !== undefined && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
      )}
    </div>
  );
};
```

#### `CodeBlock.tsx` (Grok-inspired)
```tsx
const CodeBlock: React.FC<{
  language: string;
  value: string;
}> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="code-block-container">
      <div className="code-header">
        <span className="language-badge">{language}</span>
        <div className="code-actions">
          <button 
            className="copy-button" 
            onClick={handleCopy}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers
        wrapLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};
```

#### `SourceCitation.tsx` (Perplexity-inspired)
```tsx
const SourceCitation: React.FC<{
  sources: Source[];
}> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="sources-container">
      <button 
        className="sources-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide sources' : `${sources.length} sources`}
      </button>
      
      {expanded && (
        <div className="sources-list">
          {sources.map((source, index) => (
            <a 
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-item"
            >
              <div className="source-number">[{index + 1}]</div>
              <div className="source-content">
                <div className="source-title">{source.title}</div>
                <div className="source-url">{source.url}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### `BranchSelector.tsx` (Grok-inspired)
```tsx
const BranchSelector: React.FC<{
  branches: Branch[];
  activeBranch: string;
}> = ({ branches, activeBranch }) => {
  const { switchBranch } = useBranches();
  
  return (
    <div className="branch-selector">
      <div className="branch-header">
        <h3>Conversation Branches</h3>
        <button className="new-branch-button">+ New Branch</button>
      </div>
      <div className="branches-list">
        {branches.map(branch => (
          <div 
            key={branch.id}
            className={`branch-item ${branch.id === activeBranch ? 'active' : ''}`}
            onClick={() => switchBranch(branch.id)}
          >
            <div className="branch-indicator">
              {branch.id === activeBranch ? '●' : '○'}
            </div>
            <div className="branch-name">{branch.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### `ChatInput.tsx` (Combined Perplexity and Grok styles)
```tsx
const ChatInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}> = ({ value, onChange, onSend, isLoading }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  
  return (
    <div className="chat-input-container">
      <div className="formatting-buttons">
        <button className="format-button" title="Bold">B</button>
        <button className="format-button" title="Italic">I</button>
        <button className="format-button" title="Code">{"<>"}</button>
        <button className="format-button" title="Slash Commands">/</button>
      </div>
      
      <textarea
        className="input-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Message Gemini..."
        disabled={isLoading}
        rows={1}
      />
      
      <div className="input-actions">
        <button className="attach-button" title="Attach file">
          📎
        </button>
        <button 
          className={`send-button ${!value.trim() || isLoading ? 'disabled' : ''}`}
          onClick={onSend}
          disabled={!value.trim() || isLoading}
        >
          {isLoading ? 
            <div className="loading-indicator">●</div> : 
            <span className="send-icon">➤</span>
          }
        </button>
      </div>
    </div>
  );
};
```

## Custom Hooks

### `useThinking.ts` (Perplexity-inspired)
```tsx
export const useThinking = (isLoading: boolean) => {
  const [thinkingProcess, setThinkingProcess] = useState<ThinkingProcess | null>(null);
  
  useEffect(() => {
    if (!isLoading) {
      setThinkingProcess(null);
      return;
    }
    
    // Simulate thinking steps for demo
    const steps = [
      { description: 'Searching for relevant information', status: 'in_progress' },
      { description: 'Analyzing sources', status: 'pending' },
      { description: 'Formulating response', status: 'pending' }
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

### `useBranches.ts` (Grok-inspired)
```tsx
export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'main', name: 'Main Thread', messages: [] }
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
  
  return {
    branches,
    activeBranch,
    createBranch,
    switchBranch
  };
};
```

## Implementation Considerations

### Visual Design Elements

#### From Perplexity
- **Clean Card Layout**: Messages appear as distinct cards with clear separation
- **Progressive Disclosure**: Information is revealed gradually to avoid overwhelming users
- **Citation System**: Sources are neatly organized and expandable
- **Thinking Visualization**: Step-by-step process indicators show what the AI is doing
- **Search Integration**: Seamless web search results with attribution

#### From Grok
- **Dark Theme**: Rich, dark background with high contrast text and accent colors
- **Playful Elements**: Subtle animations and transitions create a delightful experience
- **Conversational UI**: Interface elements that feel like a natural conversation
- **Code Presentation**: Syntax-highlighted code blocks with copy functionality
- **Branch System**: Ability to explore alternative conversation paths

### State Management Best Practices

1. **Component State**: Use `useState` for simple component-level state
   ```tsx
   const [inputValue, setInputValue] = useState('');
   ```

2. **Complex State Logic**: Use `useReducer` for state with complex update logic
   ```tsx
   const [state, dispatch] = useReducer(chatReducer, initialState);
   ```

3. **Shared State**: Use Context API for state shared across components
   ```tsx
   const { messages, sendMessage } = useContext(ChatContext);
   ```

4. **Derived State**: Compute derived state with `useMemo` to prevent unnecessary calculations
   ```tsx
   const unreadCount = useMemo(() => 
     messages.filter(m => !m.isRead).length,
     [messages]
   );
   ```

### Performance Optimization

1. **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders
   ```tsx
   const handleSend = useCallback(() => {
     sendMessage(inputValue);
   }, [inputValue, sendMessage]);
   ```

2. **Virtualization**: Use virtualized lists for long message histories
   ```tsx
   <VirtualizedList
     itemCount={messages.length}
     itemSize={80}
     renderItem={({ index, style }) => (
       <MessageItem 
         style={style}
         message={messages[index]} 
       />
     )}
   />
   ```

3. **Code Splitting**: Use dynamic imports to split code into smaller bundles
   ```tsx
   const SettingsPanel = React.lazy(() => import('./SettingsPanel'));
   ```

## Data Models

### Message
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  reactions?: Reaction[];
  geminiModel?: string;
  isOptimistic?: boolean;
  sources?: Source[];
  codeBlocks?: CodeBlock[];
  metadata?: {
    thinking?: ThinkingProcess;
    branch?: string;
    language?: string;
  };
}

interface Source {
  title: string;
  url: string;
  snippet?: string;
}

interface CodeBlock {
  language: string;
  code: string;
  lineStart?: number;
}

interface Reaction {
  type: 'like' | 'dislike' | 'confused' | 'custom';
  value?: string;
  timestamp: Date;
}
```

### ThinkingProcess (Perplexity-inspired)
```typescript
interface ThinkingProcess {
  steps: ThinkingStep[];
  progress?: number;
  searchResults?: SearchResult[];
  suggestions?: string[];
}

interface ThinkingStep {
  description: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  substeps?: ThinkingStep[];
}

interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}
```

### Branch (Grok-inspired)
```typescript
interface Branch {
  id: string;
  name: string;
  parentId?: string;
  messages: Message[];
  createdAt: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  branches: Branch[];
  activeBranch: string;
  model: string;
  webSearchEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  collection?: string;
  recent?: boolean;
}
```

This comprehensive plan provides a solid foundation for developing a sophisticated AI chat UI application using modern React patterns and practices, blending the best design elements from Perplexity and Grok while being powered by Google's Gemini API. The modular architecture allows for incremental development and easy extension with new features.