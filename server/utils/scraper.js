/**
 * Web Scraper Module
 * Scrapes search results from various search engines
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { getProxyConfig } = require('./proxy');

// User agent list for rotation to avoid being blocked
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
];

/**
 * Get a random user agent from the list
 */
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Delay execution for a specified time
 * @param {number} ms - Milliseconds to delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scrape search results from DuckDuckGo
 * @param {string} query - Search query
 */
async function scrapeDuckDuckGo(query) {
  try {
    console.log(`[Scraper] DuckDuckGo search: "${query}"`);
    
    // Format the search URL
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    // Random delay to avoid rate limiting (between 1-3 seconds)
    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    await delay(randomDelay);
    
    // Make the request
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://duckduckgo.com/'
      },
      timeout: 10000, // 10 seconds timeout
      ...getProxyConfig() // Add proxy if available
    });
    
    // Accept both 200 and 202 status codes as success
    // DuckDuckGo often returns 202 for valid searches
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`DuckDuckGo returned status code ${response.status}`);
    }
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results from the HTML response
    $('.result').each((i, element) => {
      try {
        const titleElement = $(element).find('.result__title');
        const title = titleElement.text().trim();
        
        // Get the link
        const linkElement = titleElement.find('a');
        let url = linkElement.attr('href');
        
        // Some DuckDuckGo results need URL extraction from the redirect
        if (url && url.startsWith('/d.js?')) {
          const urlMatch = url.match(/uddg=([^&]+)/);
          if (urlMatch && urlMatch[1]) {
            url = decodeURIComponent(urlMatch[1]);
          }
        }
        
        // Get the snippet
        const snippetElement = $(element).find('.result__snippet');
        const snippet = snippetElement.text().trim();
        
        // Only add if we have both title and URL
        if (title && url) {
          results.push({
            title,
            url,
            snippet,
            relevanceScore: 1 - (i * 0.05), // Simple relevance score based on position
            source: 'duckduckgo'
          });
        }
      } catch (error) {
        console.error(`[Scraper] Error parsing result ${i}:`, error.message);
      }
    });
    
    console.log(`[Scraper] DuckDuckGo found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error('[Scraper] DuckDuckGo scraping error:', error.message);
    return [];
  }
}

/**
 * Scrape search results from Brave Search
 * @param {string} query - Search query
 */
async function scrapeBraveSearch(query) {
  try {
    console.log(`[Scraper] Brave Search for: "${query}"`);
    
    // Format the search URL
    const searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`;
    
    // Random delay to avoid rate limiting
    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    await delay(randomDelay);
    
    // Make the request
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000,
      ...getProxyConfig()
    });
    
    if (response.status !== 200) {
      throw new Error(`Brave Search returned status code ${response.status}`);
    }
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results
    // Note: Selectors may need to be updated if Brave changes their HTML structure
    $('.snippet').each((i, element) => {
      try {
        const titleElement = $(element).find('.snippet-title');
        const title = titleElement.text().trim();
        
        const linkElement = titleElement.find('a');
        const url = linkElement.attr('href');
        
        const snippetElement = $(element).find('.snippet-description');
        const snippet = snippetElement.text().trim();
        
        if (title && url) {
          results.push({
            title,
            url,
            snippet,
            relevanceScore: 1 - (i * 0.05),
            source: 'brave'
          });
        }
      } catch (error) {
        console.error(`[Scraper] Error parsing Brave result ${i}:`, error.message);
      }
    });
    
    console.log(`[Scraper] Brave Search found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error('[Scraper] Brave Search scraping error:', error.message);
    return [];
  }
}

/**
 * Scrape search results from Qwant
 * @param {string} query - Search query
 */
async function scrapeQwant(query) {
  try {
    console.log(`[Scraper] Qwant search for: "${query}"`);
    
    // Format the search URL - use the lite version which is easier to scrape
    const searchUrl = `https://lite.qwant.com/?q=${encodeURIComponent(query)}`;
    
    // Random delay
    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    await delay(randomDelay);
    
    // Make the request
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000,
      ...getProxyConfig()
    });
    
    if (response.status !== 200) {
      throw new Error(`Qwant returned status code ${response.status}`);
    }
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results
    $('.result:not(.ad)').each((i, element) => {
      try {
        const titleElement = $(element).find('.result-title');
        const title = titleElement.text().trim();
        
        const url = $(element).find('a.result-url').attr('href');
        
        const snippetElement = $(element).find('.result-snippet');
        const snippet = snippetElement.text().trim();
        
        if (title && url) {
          results.push({
            title,
            url,
            snippet,
            relevanceScore: 1 - (i * 0.05),
            source: 'qwant'
          });
        }
      } catch (error) {
        console.error(`[Scraper] Error parsing Qwant result ${i}:`, error.message);
      }
    });
    
    console.log(`[Scraper] Qwant found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error('[Scraper] Qwant scraping error:', error.message);
    return [];
  }
}

/**
 * Attempt to scrape from multiple search engines, return combined results
 * @param {string} query - Search query
 */
async function multiSourceSearch(query) {
  console.log(`[Scraper] Multi-source search for: "${query}"`);
  
  // Try all search engines in parallel
  const results = await Promise.allSettled([
    scrapeDuckDuckGo(query),
    scrapeBraveSearch(query),
    scrapeQwant(query)
  ]);
  
  // Combine results from all successful sources
  let allResults = [];
  
  if (results[0].status === 'fulfilled') {
    allResults = [...allResults, ...results[0].value];
  }
  
  if (results[1].status === 'fulfilled') {
    allResults = [...allResults, ...results[1].value];
  }
  
  if (results[2].status === 'fulfilled') {
    allResults = [...allResults, ...results[2].value];
  }
  
  console.log(`[Scraper] Multi-source search found ${allResults.length} total results`);
  return allResults;
}

module.exports = {
  scrapeDuckDuckGo,
  scrapeBraveSearch,
  scrapeQwant,
  multiSourceSearch,
  getRandomUserAgent
}; 