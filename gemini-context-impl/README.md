# Enhanced Gemini Context API

This project implements the advanced context retention and multi-pass analysis capabilities for Google's Gemini models as described in the technical documentation. The implementation combines both approaches:

1. **Hierarchical Context Caching** - Efficiently storing and retrieving conversation context
2. **Multi-Pass Analysis for Search** - Sophisticated analysis of search results 
3. **Chain-of-Agents Protocol** - Advanced conflict resolution through specialized AI agents

## Features

- 🧠 **Context Memory**: Long-term storage of conversation history with automatic chunking for large contexts
- 🔍 **Enhanced Search Analysis**: Three-stage analysis pipeline for search results
  - Surface Scanning: Rapid pattern identification and entity extraction
  - Contextual Grounding: Fact verification and source credibility assessment
  - Conflict Resolution: Resolving contradictions with confidence scoring
- 🤖 **Chain-of-Agents** (Experimental): Coordinated analysis through specialized AI agents
- 📊 **Performance Metrics**: Comprehensive tracking of cache hits, analysis times, and more

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`
   - Configure feature flags (enable/disable):
     ```
     MAX_CONTEXT_TOKENS=32768
     CACHE_TTL=3600
     ENABLE_MULTI_PASS_ANALYSIS=true
     ENABLE_CHAIN_OF_AGENTS=false
     ```

## Usage

### Start the Server

```bash
npm start
```

The server will start on port 3000 by default (configurable through `PORT` environment variable).

### API Endpoints

#### Session Management

- **Create Session**: `POST /api/sessions`
  ```json
  { "sessionId": "optional-custom-id" }
  ```

- **Get Session Info**: `GET /api/sessions/:sessionId`

- **Delete Session**: `DELETE /api/sessions/:sessionId`

#### Messaging

- **Send Message**: `POST /api/sessions/:sessionId/messages`
  ```json
  {
    "message": "Your message here",
    "options": {
      "enableSearch": true,
      "enableThinking": true
    }
  }
  ```

- **Get History**: `GET /api/sessions/:sessionId/history`

- **Get Analysis Results**: `GET /api/sessions/:sessionId/analysis`

#### Direct Search

- **Perform Search Analysis**: `POST /api/search`
  ```json
  {
    "query": "Your search query",
    "sessionId": "optional-session-id"
  }
  ```

#### Metrics

- **Cache Metrics**: `GET /api/metrics/cache`
- **Analysis Metrics**: `GET /api/metrics/analysis`

## Architecture

The implementation consists of three main components:

### 1. Context Cache

Implements the hierarchical caching strategy:
- Full Context Cache for standard-sized conversations
- Chunked Semantic Cache for large contexts
- Automatic chunking with intelligent reconstruction

### 2. Multi-Pass Analysis

Implements the sophisticated three-stage analysis:
- First Pass: Surface scanning for rapid pattern identification
- Second Pass: Contextual grounding to validate against facts
- Third Pass: Conflict resolution using Chain-of-Agents (if enabled)

### 3. Enhanced Gemini Service

Integrates everything into a cohesive service:
- Manages sessions with context persistence
- Detects search queries automatically
- Processes search results through the analysis pipeline
- Maintains thinking process representation

## Examples

### Standard Conversation with Context Retention

```javascript
// Create a session
const sessionResponse = await fetch('http://localhost:3000/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { sessionId } = await sessionResponse.json();

// Send initial message
await fetch(`http://localhost:3000/api/sessions/${sessionId}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello, I'm learning about astronomy",
    options: {}
  })
});

// Later messages can reference earlier context
await fetch(`http://localhost:3000/api/sessions/${sessionId}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What's the largest planet?",
    options: {}
  })
});
```

### Search Query with Multi-Pass Analysis

```javascript
// Direct search query
const searchResponse = await fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "When will One Punch Man Season 3 be released?"
  })
});

const { searchResults, analysisResults } = await searchResponse.json();

// The analysis results contain all the sophisticated multi-pass analysis
console.log(analysisResults);
```

## Implementation Notes

- The current implementation uses mock search results for demonstration purposes. In a production environment, this would be replaced with actual search API calls.
- Chain-of-Agents requires the experimental `gemini-2.0-flash-thinking-exp` model, which may not be available in all regions.
- Performance can be tuned by adjusting cache TTL, chunk sizes, and other parameters in the code.

## Technologies

- Node.js and Express for the API server
- Google's Generative AI SDK for Gemini integration
- NodeCache for efficient in-memory caching 