/**
 * Web Content Scraper Module
 * Scrapes and extracts content from webpages for analysis
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { getRandomUserAgent } = require('./scraper');
const { getProxyConfig } = require('./proxy');
const cache = require('./cache');

/**
 * Extract the main content from a webpage
 * @param {string} url - URL of the webpage to scrape
 * @returns {Promise<Object>} - Object containing extracted content, title, and metadata
 */
async function scrapeWebPage(url) {
  try {
    // Check cache first
    const cacheKey = `content_${url}`;
    const cachedContent = cache.get(cacheKey);
    
    if (cachedContent) {
      console.log(`[ContentScraper] Cache hit for URL: ${url}`);
      return cachedContent;
    }
    
    console.log(`[ContentScraper] Scraping content from: ${url}`);
    
    // Random delay to avoid rate limiting (between 1-2 seconds)
    const randomDelay = Math.floor(Math.random() * 1000) + 1000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    // Get proxy configuration
    const proxyConfig = getProxyConfig();
    
    // Make the request
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
      ...(proxyConfig && { proxy: proxyConfig }),
      timeout: 10000, // 10 second timeout
    });
    
    // Parse the HTML content
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements that are typically not main content
    $('script, style, svg, footer, nav, header, iframe, noscript').remove();
    
    // Extract the title
    const title = $('title').text().trim();
    
    // Extract metadata
    const metadata = {
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      publishedDate: $('meta[name="pubdate"], meta[property="article:published_time"]').attr('content') || '',
    };
    
    // Get main content based on common content containers
    const contentSelectors = [
      'article', 
      '.article', 
      '.post', 
      '.content', 
      'main', 
      '#content', 
      '#main-content',
      '.main-content',
      '.article-content',
      '.post-content'
    ];
    
    let mainContent = '';
    
    // Try to find content using common content selectors
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        mainContent = element.text().trim();
        // If we found content, break the loop
        if (mainContent.length > 500) {
          break;
        }
      }
    }
    
    // If no content found with selectors, use the body content
    if (!mainContent || mainContent.length < 500) {
      // Extract text from paragraphs
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
      mainContent = paragraphs.join('\n\n');
    }
    
    // Clean up the text
    mainContent = mainContent
      .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
      .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with just two
      .trim();
    
    // Extract headings for structure
    const headings = [];
    $('h1, h2, h3').each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({
          type: el.name,
          text
        });
      }
    });
    
    // Prepare the result
    const result = {
      url,
      title,
      metadata,
      headings,
      content: mainContent,
      lastUpdated: new Date().toISOString()
    };
    
    // Cache the result
    cache.set(cacheKey, result, 3600); // Cache for 1 hour
    
    return result;
  } catch (error) {
    console.error(`[ContentScraper] Error scraping ${url}:`, error.message);
    return {
      url,
      title: '',
      metadata: {},
      headings: [],
      content: '',
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Get important facts from a webpage content
 * @param {string} url - URL of the webpage
 * @param {string} query - The original search query
 * @returns {Promise<Object>} - Object containing the important facts and metadata
 */
async function getPageKeyFacts(url, query) {
  try {
    const pageContent = await scrapeWebPage(url);
    
    // Truncate content if it's too long (to avoid overwhelming the system)
    let content = pageContent.content;
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }
    
    // Create a simple summary by extracting the first 2-3 paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.length > 100);
    const summary = paragraphs.slice(0, 3).join('\n\n');
    
    return {
      url: pageContent.url,
      title: pageContent.title,
      summary,
      content,
      metadata: pageContent.metadata,
      headings: pageContent.headings,
      extractedDate: extractDateFromContent(content),
      lastUpdated: pageContent.lastUpdated
    };
  } catch (error) {
    console.error(`[ContentScraper] Error getting key facts for ${url}:`, error.message);
    return {
      url,
      title: '',
      summary: '',
      content: '',
      error: error.message
    };
  }
}

/**
 * Extract date patterns from content
 * @param {string} content - The webpage content
 * @returns {Array<string>} - Array of extracted date strings
 */
function extractDateFromContent(content) {
  // Match common date formats
  const datePatterns = [
    // ISO dates: 2023-01-15
    /\b\d{4}-\d{2}-\d{2}\b/g,
    // Common formats: January 15, 2023 or Jan 15, 2023
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\.|\s]\s*\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}\b/gi,
    // MM/DD/YYYY or DD/MM/YYYY
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    // Month YYYY format: October 2023
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\.|\s]\s*\d{4}\b/gi,
  ];
  
  const dates = [];
  for (const pattern of datePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      dates.push(...matches);
    }
  }
  
  return [...new Set(dates)]; // Remove duplicates
}

module.exports = {
  scrapeWebPage,
  getPageKeyFacts
}; 