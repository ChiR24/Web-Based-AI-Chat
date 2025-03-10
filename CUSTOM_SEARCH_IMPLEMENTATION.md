# Implementing Custom Real-Time Web Search

This document provides a comprehensive step-by-step guide to implementing a custom real-time web search solution for the Gemini Chat application without relying on paid external APIs.

## Table of Contents
1. [Overview](#approach-overview)
2. [Implementation Phases](#implementation-phases)
   - [Phase 1: Server-Side Component](#phase-1-server-side-component)
   - [Phase 2: Client Integration](#phase-2-client-integration)
   - [Phase 3: Advanced Features](#phase-3-advanced-features)
3. [Detailed Implementation Steps](#detailed-implementation-steps)
4. [Deployment Options](#deployment-options)
5. [Legal and Ethical Considerations](#legal-and-ethical-considerations)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)
8. [Implementation Timeline](#implementation-timeline)

## Approach Overview

Instead of using paid APIs like Google Custom Search or Bing Search, we'll implement a custom search solution using:

1. **Web scraping** from public search engines
2. **Result caching** to improve performance and reduce load
3. **Result parsing** to extract structured data
4. **Multi-source searching** for robustness and comprehensive results

## Implementation Phases

### Phase 1: Server-Side Component

#### Step 1: Set Up Project Structure

Create a server-side component with the following structure:

```
server/
├── package.json
├── server.js          # Main entry point
├── search-service.js  # Search functionality
├── routes/
│   └── api.js         # API routes
└── utils/
    ├── cache.js       # Caching system
    ├── scraper.js     # Web scraping logic
    ├── parser.js      # Result parsing
    └── proxy.js       # Proxy rotation
```

#### Step 2: Set Up Required Dependencies

Add the following packages to your project:

```bash
npm install express axios cheerio puppeteer-core node-cache cors helmet rate-limiter-flexible http-proxy-agent
```

- `express`: For the web server
- `axios`: For making HTTP requests
- `cheerio`: For parsing HTML
- `puppeteer-core`: For headless browser scraping (for JavaScript-heavy sites)
- `node-cache`: For caching search results
- `cors`: For handling cross-origin requests
- `helmet`: For basic security
- `rate-limiter-flexible`: For rate limiting
- `http-proxy-agent`: For using proxies

#### Step 3: Implement Basic Server

Create a basic Express server in `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const searchRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per minute
});

app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send('Too Many Requests');
    });
});

// Routes
app.use('/api', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Search server running on port ${PORT}`);
});
```

#### Step 4: Implement Search API Routes

Create API routes in `routes/api.js`:

```javascript
const express = require('express');
const { performSearch } = require('../search-service');

const router = express.Router();

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const results = await performSearch(query);
    
    return res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

router.get('/trending', async (req, res) => {
  // Future endpoint for trending searches
  res.json({ trending: ['technology', 'news', 'sports', 'entertainment'] });
});

module.exports = router;
```

#### Step 5: Implement Caching System

Create a cache module in `utils/cache.js`:

```javascript
const NodeCache = require('node-cache');

class SearchCache {
  constructor(ttlSeconds = 3600) {
    this.cache = new NodeCache({ 
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  set(key, value) {
    return this.cache.set(key, value);
  }
  
  delete(key) {
    return this.cache.del(key);
  }
  
  flush() {
    return this.cache.flushAll();
  }
  
  stats() {
    return this.cache.getStats();
  }
}

module.exports = new SearchCache();
```

#### Step 6: Implement Web Scraper

Create a scraper module in `utils/scraper.js`:

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const { getRandomProxy } = require('./proxy');

// User agent list for rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  // Add more user agents for rotation
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function scrapeDuckDuckGo(query) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://duckduckgo.com/'
      },
      timeout: 10000, // 10 seconds timeout
      // Uncomment to use proxies in production
      // proxy: getRandomProxy()
    });
    
    if (response.status !== 200) {
      throw new Error(`DuckDuckGo returned status code ${response.status}`);
    }
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results
    $('.result').each((i, element) => {
      const titleElement = $(element).find('.result__title');
      const title = titleElement.text().trim();
      
      const urlElement = $(element).find('.result__url');
      let url = urlElement.attr('href');
      
      // Some DuckDuckGo results need URL extraction from the redirect
      if (url && url.startsWith('/d.js?')) {
        const urlMatch = url.match(/uddg=([^&]+)/);
        if (urlMatch && urlMatch[1]) {
          url = decodeURIComponent(urlMatch[1]);
        }
      }
      
      const snippetElement = $(element).find('.result__snippet');
      const snippet = snippetElement.text().trim();
      
      if (title && url) {
        results.push({
          title,
          url,
          snippet,
          relevanceScore: 1 - (i * 0.05), // Simple relevance score based on position
          source: 'duckduckgo'
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error('DuckDuckGo scraping error:', error);
    return [];
  }
}

async function scrapeBraveSearch(query) {
  // Implementation for Brave Search as a fallback
  // Similar to DuckDuckGo but with different selectors
  return [];
}

module.exports = {
  scrapeDuckDuckGo,
  scrapeBraveSearch
};
```

#### Step 7: Implement Proxy Rotation (Optional)

Create a proxy module in `utils/proxy.js`:

```javascript
// This is a simplified example. In production, you would use a real proxy service or list.
const proxyList = [
  // Add your proxies here
  // Example: { host: 'proxy1.example.com', port: 8080 }
];

function getRandomProxy() {
  if (proxyList.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[randomIndex];
}

module.exports = {
  getRandomProxy
};
```

#### Step 8: Implement Result Parser

Create a parser module in `utils/parser.js`:

```javascript
const url = require('url');

function extractDomain(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    return parsedUrl.hostname;
  } catch (error) {
    return urlString;
  }
}

function normalizeSearchResults(results) {
  return results.map((result, index) => ({
    title: result.title || 'No Title',
    url: result.url,
    snippet: result.snippet || 'No description available.',
    relevanceScore: result.relevanceScore || (1 - (index * 0.05)),
    source: result.source || extractDomain(result.url),
    timestamp: new Date().toISOString()
  }));
}

function removeDuplicateResults(results) {
  const urlSet = new Set();
  return results.filter(result => {
    if (urlSet.has(result.url)) {
      return false;
    }
    urlSet.add(result.url);
    return true;
  });
}

function categorizeResults(results) {
  // Group results by domain type (news, academic, social, etc.)
  const categories = {
    news: [],
    academic: [],
    social: [],
    commercial: [],
    other: []
  };
  
  results.forEach(result => {
    const domain = extractDomain(result.url);
    
    if (domain.includes('news.') || domain.includes('.news') || 
        domain.includes('bbc.') || domain.includes('cnn.com')) {
      categories.news.push(result);
    } else if (domain.includes('.edu') || domain.includes('scholar.') || 
               domain.includes('academic.')) {
      categories.academic.push(result);
    } else if (domain.includes('twitter.') || domain.includes('facebook.') || 
               domain.includes('instagram.') || domain.includes('reddit.')) {
      categories.social.push(result);
    } else if (domain.includes('amazon.') || domain.includes('ebay.') || 
               domain.includes('shopping.')) {
      categories.commercial.push(result);
    } else {
      categories.other.push(result);
    }
  });
  
  return categories;
}

module.exports = {
  normalizeSearchResults,
  removeDuplicateResults,
  categorizeResults,
  extractDomain
};
```

#### Step 9: Implement Search Service

Create the main search service in `search-service.js`:

```javascript
const { scrapeDuckDuckGo, scrapeBraveSearch } = require('./utils/scraper');
const { normalizeSearchResults, removeDuplicateResults } = require('./utils/parser');
const cache = require('./utils/cache');

async function performSearch(query) {
  try {
    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check cache first
    const cacheKey = `search_${normalizedQuery}`;
    const cachedResults = cache.get(cacheKey);
    
    if (cachedResults) {
      console.log(`Cache hit for query: ${normalizedQuery}`);
      return cachedResults;
    }
    
    console.log(`Performing search for query: ${normalizedQuery}`);
    
    // Try DuckDuckGo first
    let results = await scrapeDuckDuckGo(normalizedQuery);
    
    // If DuckDuckGo fails or returns no results, try Brave Search
    if (results.length === 0) {
      console.log('DuckDuckGo returned no results, trying Brave Search');
      results = await scrapeBraveSearch(normalizedQuery);
    }
    
    // Process results
    const normalizedResults = normalizeSearchResults(results);
    const dedupedResults = removeDuplicateResults(normalizedResults);
    
    // Limit to top 20 results
    const finalResults = dedupedResults.slice(0, 20);
    
    // Cache results
    if (finalResults.length > 0) {
      cache.set(cacheKey, finalResults);
    }
    
    return finalResults;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

module.exports = {
  performSearch
};
```

### Phase 2: Client Integration

#### Step 1: Update GeminiService

Modify the `performWebSearch` method in `src/features/gemini/services/GeminiService.ts`:

```typescript
/**
 * Perform a web search using our custom search API
 */
private async performWebSearch(query: string, domain: string, entities: string[]): Promise<SearchResult[]> {
  console.log(`Performing web search for query: ${query}`);
  
  try {
    // Call our custom search API
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate and process the results
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      // Process URLs for favicons
      return data.results.map((result: any) => ({
        ...result,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`
      }));
    }
    
    // If no results or invalid response, fall back to simulated results
    throw new Error('No valid search results returned');
  } catch (error) {
    console.error('Error performing web search:', error);
    
    // Fall back to simulated results
    console.log('Falling back to simulated search results');
    const simulatedResults = await this.generateSimulatedSearchResults(query, domain, entities);
    
    // Add a notice to make it clear these are simulated
    return simulatedResults.map(result => ({
      ...result,
      title: `[SIMULATED] ${result.title}`,
      snippet: `[Simulated result] ${result.snippet}`,
    }));
  }
}
```

#### Step 2: Error Handling and URL Processing

Add error handling for URL processing in the Citation creation:

```typescript
// Create citations from search results
const citations: Citation[] = allSearchResults.slice(0, 20).map((result, index) => {
  try {
    return {
      id: index + 1,
      title: result.title,
      url: result.url,
      snippet: result.snippet || '',
      source: new URL(result.url).hostname,
      relevance: result.relevanceScore || 0.5
    };
  } catch (error) {
    // Handle invalid URLs
    return {
      id: index + 1,
      title: result.title,
      url: '#', // Fallback URL
      snippet: result.snippet || '',
      source: 'unknown',
      relevance: result.relevanceScore || 0.5
    };
  }
});
```

#### Step 3: Update Citation Display

Ensure URLs are safe and working in the MessageRenderer component:

```typescript
// When rendering citation links
const processCitations = (text: string) => {
  // Match patterns like [1], [2], etc.
  return text.replace(/\[(\d+)\]/g, (match, citationNumber) => {
    const citationId = parseInt(citationNumber, 10);
    const citation = citations.find(c => c.id === citationId);
    
    // Use data attributes instead of inline onclick handlers
    let attributes = `class="citation-reference" data-citation="${citationId}"`;
    
    // Add data attributes for citation data if available
    if (citation) {
      if (citation.url && citation.url !== '#') {
        attributes += ` data-url="${citation.url}"`;
      }
      if (citation.title) attributes += ` data-title="${citation.title || ''}"`;
      if (citation.snippet) attributes += ` data-snippet="${citation.snippet || ''}"`;
      if (citation.source) attributes += ` data-source="${citation.source || ''}"`;
    }
    
    return `<span ${attributes}>${match}</span>`;
  });
};
```

### Phase 3: Advanced Features

#### Step 1: Implement Multiple Search Sources

Expand the scraper to support multiple search engines:

```javascript
async function multiSourceSearch(query) {
  // Try multiple search sources in parallel
  const [duckDuckGoResults, braveResults, qwantResults] = await Promise.allSettled([
    scrapeDuckDuckGo(query),
    scrapeBraveSearch(query),
    scrapeQwant(query)
  ]);
  
  // Combine results from all successful sources
  let allResults = [];
  
  if (duckDuckGoResults.status === 'fulfilled') {
    allResults = [...allResults, ...duckDuckGoResults.value];
  }
  
  if (braveResults.status === 'fulfilled') {
    allResults = [...allResults, ...braveResults.value];
  }
  
  if (qwantResults.status === 'fulfilled') {
    allResults = [...allResults, ...qwantResults.value];
  }
  
  // De-duplicate and normalize
  return removeDuplicateResults(normalizeSearchResults(allResults));
}
```

#### Step 2: Result Enrichment

Add a function to fetch additional details for top results:

```javascript
async function enrichResults(results, maxResultsToEnrich = 3) {
  const enrichedResults = [...results];
  
  // Only enrich the top few results
  for (let i = 0; i < Math.min(maxResultsToEnrich, results.length); i++) {
    try {
      const result = results[i];
      
      // Skip if we can't access the URL
      if (!result.url || result.url === '#') continue;
      
      // Fetch the page
      const response = await axios.get(result.url, {
        headers: { 'User-Agent': getRandomUserAgent() },
        timeout: 5000
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract metadata
      const metaDescription = $('meta[name="description"]').attr('content');
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const ogDescription = $('meta[property="og:description"]').attr('content');
      
      // Update result with better data if available
      if (ogTitle && ogTitle.length > result.title.length) {
        enrichedResults[i].title = ogTitle;
      }
      
      if ((ogDescription || metaDescription) && 
          (ogDescription || metaDescription).length > result.snippet.length) {
        enrichedResults[i].snippet = ogDescription || metaDescription;
      }
      
      // Add page text as a fallback
      if (!enrichedResults[i].snippet || enrichedResults[i].snippet.length < 20) {
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 200);
        enrichedResults[i].snippet = bodyText;
      }
      
      // Mark as enriched
      enrichedResults[i].enriched = true;
    } catch (error) {
      console.warn(`Failed to enrich result ${i}:`, error.message);
    }
  }
  
  return enrichedResults;
}
```

#### Step 3: Domain-Specific Search Handling

Implement specialized search behavior for different query types:

```javascript
async function performSpecializedSearch(query) {
  // Check for query patterns
  const isNewsQuery = /news|latest|recent|today|update/i.test(query);
  const isDefinitionQuery = /what is|define|meaning of|definition of/i.test(query);
  const isHowToQuery = /how to|steps to|guide for/i.test(query);
  
  if (isNewsQuery) {
    // Prioritize news sources
    return await performNewsSearch(query);
  } else if (isDefinitionQuery) {
    // Check dictionary/Wikipedia first
    return await performDefinitionSearch(query);
  } else if (isHowToQuery) {
    // Prioritize instructional sites
    return await performHowToSearch(query);
  }
  
  // Default to standard search
  return await performSearch(query);
}
```

## Deployment Options

### Serverless Functions

For moderate usage (recommended for starting):

1. **Netlify Functions**:
   - Easy integration with frontend deployment
   - Good free tier (125K requests/month)
   - 10-second execution limit
   
   ```
   netlify.toml:
   [functions]
     directory = "functions"
     node_bundler = "esbuild"
   ```

2. **Vercel Serverless Functions**:
   - Seamless integration with Next.js
   - Generous free tier
   - Fast cold starts

3. **AWS Lambda**:
   - Highly scalable
   - Pay-per-use pricing
   - More complex setup but more powerful

### Full Server Deployment

For high volume or complex requirements:

1. **Digital Ocean App Platform**:
   - Easy deployment
   - Fixed pricing (starts at $5/month)
   - Good performance

2. **Heroku**:
   - Developer-friendly
   - Auto-scaling options
   - Free tier available for testing

3. **AWS EC2/ECS**:
   - Maximum control and flexibility
   - Complex setup but powerful
   - Cost-effective for high volume

## Legal and Ethical Considerations

1. **Respect Terms of Service**: Always check and respect the terms of service of search engines:
   - DuckDuckGo allows limited scraping for non-commercial use
   - Google explicitly prohibits scraping
   - Bing has restrictions but is more permissive than Google

2. **Rate Limiting**: Implement strict rate limiting:
   - Limit to 1 request per second per IP
   - Use exponential backoff for errors
   - Consider time-of-day constraints

3. **User Agent**: Use appropriate user agent strings:
   - Identify your bot/scraper if possible
   - Don't impersonate specific browsers maliciously

4. **robots.txt**: Always check and respect robots.txt:
   ```javascript
   const robotsParser = require('robots-txt-parser');
   const robots = robotsParser();
   
   async function checkRobotsPermission(url, userAgent) {
     const domain = new URL(url).origin;
     await robots.useRobotsFor(domain);
     return robots.canCrawl(url, userAgent);
   }
   ```

5. **Data Privacy**: Be careful with user query data:
   - Don't log complete queries
   - Anonymize search history
   - Implement data retention policies

## Performance Optimization

### Caching Strategies

1. **Multi-level Caching**:
   - In-memory for hot/frequent queries
   - Redis for distributed deployment
   - File-based for persistence between restarts

2. **Cache Invalidation**:
   - Time-based (TTL) depending on query type:
     - News queries: 1 hour TTL
     - Evergreen content: 1 day TTL
     - Technical documentation: 1 week TTL

3. **Prefetching**:
   - Analyze trends and prefetch popular queries
   - Update cache during off-peak hours

### Query Processing

1. **Query Normalization**:
   - Remove extra spaces
   - Lowercase conversion
   - Handle special characters

2. **Query Classification**:
   - Detect query intent (informational, navigational, transactional)
   - Adjust search strategy based on classification

3. **Query Expansion**:
   - Add synonyms for key terms
   - Handle acronyms and abbreviations

## Troubleshooting Common Issues

### CORS Issues

If you encounter CORS errors:

```javascript
// On the server
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### IP Blocking

If search engines block your IP:

1. Implement proxy rotation
2. Add random delays between requests
3. Use a headless browser like Puppeteer instead of direct HTTP requests

### Parsing Failures

If HTML structure changes:

1. Implement multiple parsers for each site
2. Use more robust selectors
3. Add fallbacks using different strategies

## Implementation Timeline

1. **Week 1**: Basic server setup and DuckDuckGo scraper
   - Set up Express server
   - Implement basic scraping
   - Add memory caching

2. **Week 2**: Client integration and error handling
   - Integrate with Gemini chat
   - Add error handling
   - Implement result normalization

3. **Week 3**: Multiple search sources and enrichment
   - Add Brave Search scraper
   - Implement result enrichment
   - Add domain-specific search handling

4. **Week 4**: Deployment and optimization
   - Server deployment
   - Performance optimization
   - Final testing and monitoring setup

The implementation plan above provides a complete solution for real web search capability without relying on paid APIs, giving you control and flexibility while keeping costs minimal.