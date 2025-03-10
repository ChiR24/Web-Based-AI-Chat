/**
 * Search Service
 * Central service for handling web search functionality
 */

const { multiSourceSearch, scrapeDuckDuckGo, scrapeBraveSearch, scrapeQwant } = require('./utils/scraper');
const { normalizeSearchResults, removeDuplicateResults, scoreResults } = require('./utils/parser');
const { getPageKeyFacts } = require('./utils/contentScraper');
const cache = require('./utils/cache');

/**
 * The main search function that orchestrates the search process
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of search results
 */
async function performSearch(query) {
  try {
    // Normalize query - remove excess whitespace, convert to lowercase
    const normalizedQuery = query.toLowerCase().trim();
    console.log(`[Search] Processing query: "${normalizedQuery}"`);
    
    // Check cache first
    const cacheKey = `search_${normalizedQuery}`;
    const cachedResults = cache.get(cacheKey);
    
    if (cachedResults) {
      console.log(`[Search] Cache hit for query: "${normalizedQuery}"`);
      return cachedResults;
    }
    
    console.log(`[Search] Cache miss, performing new search for query: "${normalizedQuery}"`);
    
    // Try multiple search approaches with increasing fallback
    let results = [];
    
    // 1. Try the multi-source search approach first (parallel requests to all engines)
    results = await multiSourceSearch(normalizedQuery);
    
    // 2. If no results from multi-source, try individual sources with fallbacks
    if (results.length === 0) {
      console.log(`[Search] No results from multi-source search, trying DuckDuckGo directly`);
      
      // Add retry logic for DuckDuckGo with different delays
      for (let attempt = 1; attempt <= 3; attempt++) {
        if (attempt > 1) {
          console.log(`[Search] DuckDuckGo retry attempt ${attempt}`);
          // Increase delay with each retry
          await new Promise(resolve => setTimeout(resolve, attempt * 1500));
        }
        
        results = await scrapeDuckDuckGo(normalizedQuery);
        if (results.length > 0) break;
      }
      
      // If still no results, try Brave Search
      if (results.length === 0) {
        console.log(`[Search] No results from DuckDuckGo, trying Brave Search`);
        results = await scrapeBraveSearch(normalizedQuery);
        
        // If still no results, try Qwant as last resort
        if (results.length === 0) {
          console.log(`[Search] No results from Brave Search, trying Qwant`);
          results = await scrapeQwant(normalizedQuery);
        }
      }
    }
    
    // Process results if we have any
    if (results.length > 0) {
      const normalizedResults = normalizeSearchResults(results);
      const dedupedResults = removeDuplicateResults(normalizedResults);
      const scoredResults = scoreResults(dedupedResults, normalizedQuery);
      
      // Limit to top 20 results
      const finalResults = scoredResults.slice(0, 20);
      
      // Cache results
      console.log(`[Search] Caching ${finalResults.length} results for query: "${normalizedQuery}"`);
      cache.set(cacheKey, finalResults);
      
      return finalResults;
    }
    
    // LAST RESORT: If absolutely no results found, generate emergency fallback results
    console.log(`[Search] No results found from any source, using emergency fallback for: "${normalizedQuery}"`);
    const emergencyResults = generateEmergencyResults(normalizedQuery);
    
    // Don't cache emergency results
    return emergencyResults;
  } catch (error) {
    console.error(`[Search] Error performing search for "${query}":`, error.message);
    // Return empty array instead of throwing to prevent client errors
    return [];
  }
}

/**
 * Generate emergency fallback results when all search engines fail
 * This ensures the client always gets some results, even if they're basic
 * @param {string} query - The search query
 * @returns {Array} - Array of basic search results
 */
function generateEmergencyResults(query) {
  console.log(`[Search] Generating emergency results for: "${query}"`);
  
  // Extract keywords from the query (remove stop words)
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like'];
  const keywords = query.toLowerCase().split(/\s+/).filter(word => !stopWords.includes(word));
  
  // Create a Wikipedia result
  const wikiResult = {
    title: `${query} - Wikipedia`,
    url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
    snippet: `Wikipedia search results for ${query}. Wikipedia is a free online encyclopedia, created and edited by volunteers around the world.`,
    relevanceScore: 0.9,
    source: 'wikipedia.org',
    timestamp: new Date().toISOString(),
    favicon: 'https://www.google.com/s2/favicons?domain=wikipedia.org'
  };
  
  // Create a Google Search result
  const googleResult = {
    title: `${query} - Google Search`,
    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    snippet: `Google search results for ${query}.`,
    relevanceScore: 0.85,
    source: 'google.com',
    timestamp: new Date().toISOString(),
    favicon: 'https://www.google.com/s2/favicons?domain=google.com'
  };
  
  // Create a DuckDuckGo result
  const ddgResult = {
    title: `${query} - DuckDuckGo Search`,
    url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    snippet: `DuckDuckGo search results for ${query}. DuckDuckGo is a privacy-focused search engine.`,
    relevanceScore: 0.8,
    source: 'duckduckgo.com',
    timestamp: new Date().toISOString(),
    favicon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com'
  };
  
  // Create an emergency info note
  const noteResult = {
    title: `Search Engine Access Note`,
    url: 'https://example.com/search-info',
    snippet: `NOTE: Direct search results could not be accessed for "${query}". Please try these search engines directly.`,
    relevanceScore: 0.95,
    source: 'emergency-fallback',
    timestamp: new Date().toISOString(),
    favicon: 'https://www.google.com/s2/favicons?domain=example.com'
  };
  
  return [noteResult, wikiResult, googleResult, ddgResult];
}

/**
 * Specialized search for news-related queries
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of search results
 */
async function performNewsSearch(query) {
  // Add news-specific modifiers to the query
  const newsQuery = `${query} news recent`;
  const results = await performSearch(newsQuery);
  
  // Further process to prioritize news sites
  return results.filter(result => {
    const domain = new URL(result.url).hostname.toLowerCase();
    return domain.includes('news') || 
           domain.includes('bbc.') || 
           domain.includes('cnn.com') || 
           domain.includes('nytimes.com') ||
           domain.includes('reuters.com') ||
           domain.includes('washingtonpost.com') ||
           domain.includes('theguardian.com');
  });
}

/**
 * Specialized search for definition queries
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of search results
 */
async function performDefinitionSearch(query) {
  // Add definition-specific modifiers
  const definitionQuery = `${query} definition meaning explain`;
  const results = await performSearch(definitionQuery);
  
  // Prioritize definition and encyclopedia sites
  return results.filter(result => {
    const domain = new URL(result.url).hostname.toLowerCase();
    return domain.includes('wikipedia.org') || 
           domain.includes('dictionary.') || 
           domain.includes('merriam-webster.com') ||
           domain.includes('britannica.com') ||
           domain.includes('definitions');
  });
}

/**
 * Specialized search for how-to and instructional queries
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of search results
 */
async function performHowToSearch(query) {
  // Add how-to specific modifiers
  const howToQuery = `${query} how to guide tutorial steps`;
  const results = await performSearch(howToQuery);
  
  // Prioritize tutorial and how-to sites
  return results.filter(result => {
    const domain = new URL(result.url).hostname.toLowerCase();
    return domain.includes('howto') || 
           domain.includes('tutorial') || 
           domain.includes('guide') ||
           domain.includes('wikihow.com') ||
           domain.includes('instructables.com');
  });
}

/**
 * Analyze query to determine the type of search to perform
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of search results
 */
async function smartSearch(query) {
  const lowerQuery = query.toLowerCase();
  
  // Detect query type
  const isNewsQuery = /news|latest|recent|today|update/i.test(lowerQuery);
  const isDefinitionQuery = /what is|define|meaning of|definition of/i.test(lowerQuery);
  const isHowToQuery = /how to|steps to|guide for/i.test(lowerQuery);
  
  if (isNewsQuery) {
    return await performNewsSearch(query);
  } else if (isDefinitionQuery) {
    return await performDefinitionSearch(query);
  } else if (isHowToQuery) {
    return await performHowToSearch(query);
  }
  
  // Default to standard search
  return await performSearch(query);
}

/**
 * Enhanced search function that includes webpage content for key results
 * @param {string} query - The search query 
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - Object with search results and enhanced content
 */
async function performEnhancedSearch(query, options = {}) {
  try {
    // Default options
    const { fetchContent = true, maxContentResults = 3, depth = 'moderate' } = options;
    
    // Get basic search results first
    const searchResults = await performSearch(query);
    
    // If content scraping is disabled or no results, return basic results
    if (!fetchContent || searchResults.length === 0) {
      return {
        query,
        results: searchResults,
        enhancedResults: []
      };
    }
    
    console.log(`[Search] Enhancing top ${maxContentResults} results with webpage content`);
    
    // Get the top N results based on relevance 
    const topResults = searchResults.slice(0, maxContentResults);
    
    // Fetch content for top results in parallel
    const contentPromises = topResults.map(result => getPageKeyFacts(result.url, query));
    const contentResults = await Promise.allSettled(contentPromises);
    
    // Process the results
    const enhancedResults = contentResults
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value.content) {
          // Merge the original search result with the enhanced content
          return {
            ...topResults[index], // Original search result
            enhancedContent: {
              fullContent: depth === 'deep' ? result.value.content : undefined,
              summary: result.value.summary,
              extractedDates: result.value.extractedDate,
              headings: result.value.headings,
              metadata: result.value.metadata
            }
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries (failed content fetches)
    
    return {
      query,
      results: searchResults,
      enhancedResults
    };
  } catch (error) {
    console.error(`[Search] Error in enhanced search:`, error);
    // Fallback to regular search if enhanced fails
    const results = await performSearch(query);
    return {
      query,
      results,
      enhancedResults: [],
      error: error.message
    };
  }
}

// Export the functions we want to expose
module.exports = {
  performSearch,
  performNewsSearch,
  performDefinitionSearch,
  performHowToSearch,
  smartSearch,
  generateEmergencyResults,
  performEnhancedSearch
}; 