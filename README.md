# Gemi - Gemini AI Chat UI

A modern chat interface for Google's Gemini AI models, built with React, TypeScript, and Tailwind CSS.

## Features

- 🤖 Integration with Gemini 1.5 and 2.0 models
- 🔍 Web search capability with DeepSearch
- 🌓 Light and dark theme support
- 💬 Conversation history management
- 📱 Responsive design for all devices
- ⚡ Fast and lightweight UI

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Gemini API key from [Google AI Studio](https://ai.google.dev/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gemi.git
cd gemi
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Gemini API key:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

The project follows a feature-based architecture:

```
src/
├── features/
│   ├── chat/           # Chat feature components and logic
│   └── gemini/         # Gemini API integration
├── shared/             # Shared components, hooks, and utilities
│   ├── components/     # Reusable UI components
│   ├── context/        # Shared context providers
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Usage

### Basic Chat

Simply type your message in the input field and press Enter or click the send button.

### Web Search

To use web search, toggle the search icon in the input field or prefix your message with `/search`.

### Model Selection

Click on the model selector in the input field to choose between different Gemini models.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for providing the Gemini API
- The React and Tailwind CSS communities for their excellent tools 