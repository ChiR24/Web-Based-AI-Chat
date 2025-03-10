# Gemini Search Server

A custom search backend for the Gemini AI Chat application that scrapes search results from various search engines and provides them in a standardized format.

## Features

- Multi-source search from DuckDuckGo, Brave Search, and Qwant
- Intelligent query detection and specialized search handling
- Result caching for improved performance
- Proxy rotation support for avoiding IP blocks
- Duplicate removal and result normalization
- Result scoring and ranking

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Search

```
POST /api/search
```

Request body:
```json
{
  "query": "your search query here"
}
```

Response:
```json
{
  "results": [
    {
      "title": "Result Title",
      "url": "https://example.com/result",
      "snippet": "Description of the result...",
      "relevanceScore": 0.95,
      "source": "example.com",
      "timestamp": "2023-06-15T10:30:45.123Z",
      "favicon": "https://www.google.com/s2/favicons?domain=example.com"
    },
    ...
  ],
  "meta": {
    "query": "your search query here",
    "count": 15,
    "timestamp": "2023-06-15T10:30:45.123Z"
  }
}
```

### Trending Searches

```
GET /api/trending
```

Response:
```json
{
  "trending": [
    "technology news",
    "artificial intelligence",
    "programming tutorials",
    "data science",
    "web development"
  ]
}
```

## Configuration

The server can be configured by modifying the following files:

- `server.js` - Main server configuration
- `utils/proxy.js` - Proxy settings
- `utils/cache.js` - Cache TTL and settings

## Legal Considerations

This implementation respects the following:

1. The server implements rate limiting and delays to avoid overloading search engines
2. User agents are rotated to distribute requests
3. Caching is used to reduce request volume

Please ensure your use case complies with the terms of service of the search engines being queried.

## License

MIT License 