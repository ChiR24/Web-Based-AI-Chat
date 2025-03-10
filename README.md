# Gemini AI Chat 🤖

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

<div align="center">
  <img src="src/assets/grok-logo.svg" alt="Gemini AI Chat Logo" width="150" height="150" />
  <h3>An advanced chat interface for Google's Gemini AI models</h3>
  <p>Featuring real-time web search, context memory, and multi-pass analysis</p>
</div>

## ✨ Features

- 🧠 **Multiple Gemini Models** - Support for Gemini 1.5 Pro, Flash, and experimental models
- 🔍 **Real Web Search** - Uses a custom web scraping backend to provide real search results with no API costs
- 💬 **Multi-Turn Conversations** - Maintains context across multiple messages
- 🧐 **Advanced Search Analysis** - Multi-pass analysis with entity extraction and fact verification
- 🌙 **Dark & Light Themes** - Elegant UI with theme support
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 📋 **Code Highlighting** - Beautiful syntax highlighting for code blocks
- 📊 **Thinking Process Visualization** - See how the model analyzes search results
- 🔄 **Conversation History** - Store and retrieve past conversations

## 🖥️ Screenshots

<div align="center">
  <p><i>![image](https://github.com/user-attachments/assets/e04ea672-832d-4ec6-ab46-fdfb99c5dc9a)
Chat interface with web search and thinking process visualization</i></p>
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ChiR24/Web-Based-AI-Chat.git
cd Web-Based-AI-Chat

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Configuration

1. Create a `.env` file in the root directory:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_MAX_SEARCH_ROUNDS=10
```

2. Get your Gemini API key from [Google AI Studio](https://ai.google.dev/)

### Running the Application

```bash
# Start the search server (in one terminal)
cd server
npm start

# Start the frontend (in another terminal)
cd ..
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏛️ Architecture

The project follows a feature-based architecture for better organization and scalability:

```
src/
├── features/             # Feature modules
│   ├── chat/             # Chat feature components and logic
│   │   ├── components/   # Chat UI components
│   │   ├── context/      # Chat state and context
│   │   └── hooks/        # Chat-related hooks
│   └── gemini/           # Gemini API integration
│       ├── api/          # API interfaces
│       ├── services/     # Service implementations
│       ├── context/      # Gemini context providers
│       ├── hooks/        # Custom hooks for Gemini
│       └── types/        # TypeScript type definitions
├── shared/               # Shared components and utilities
│   ├── components/       # Reusable UI components
│   ├── context/          # Shared context providers
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
└── assets/               # Static assets
```

Server architecture:

```
server/
├── utils/                # Utility functions
│   ├── cache.js          # Caching mechanism
│   ├── scraper.js        # Web scraping utilities
│   ├── parser.js         # Results parsing and normalization
│   ├── proxy.js          # Proxy rotation
│   └── contentScraper.js # Content extraction
├── server.js             # Main Express server
└── search-service.js     # Search service implementation
```

## 🔍 Search Implementation

The application uses a custom server-side web scraping solution that:

1. Fetches search results from multiple engines (DuckDuckGo, Brave, Qwant)
2. Normalizes and deduplicates the results
3. Enhances them with additional metadata
4. Provides real results without any API costs or rate limits

Key advantages:
- Zero API costs
- No query limits
- Multiple search engines for better coverage
- Intelligent caching for performance

## 🧠 Advanced Context Processing

The application uses Gemini's advanced capabilities:

- **Memory Retention**: Maintains context across messages
- **Multi-Pass Analysis**: Processes search results in multiple stages for better comprehension
- **Search Result Enhancement**: Extracts entities, validates facts, and resolves contradictions

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **AI**: Google's Gemini API
- **Backend**: Node.js, Express
- **Scraping**: Cheerio, Puppeteer
- **State Management**: React Context API
- **Formatting**: React Markdown, Syntax Highlighter

## 📈 Roadmap

- [ ] Add user authentication
- [ ] Implement file uploads and document analysis
- [ ] Create a mobile app with React Native
- [ ] Add voice input and output
- [ ] Implement agent capabilities for specific tasks

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ChiR24/Web-Based-AI-Chat/issues).

## 📄 License

This project is [MIT](LICENSE) licensed.

## 👏 Acknowledgements

- Google for the Gemini API
- The React and TypeScript communities
- All open source libraries used in this project
