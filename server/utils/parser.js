/**
 * Search results parser
 * Normalizes and processes search results from different sources
 */

/**
 * Extract domain from a URL
 */
function extractDomain(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    return parsedUrl.hostname;
  } catch (error) {
    console.warn(`[Parser] Failed to parse URL: ${urlString}`, error.message);
    return urlString;
  }
}

/**
 * Normalize search results to a standard format
 */
function normalizeSearchResults(results) {
  if (!Array.isArray(results)) {
    console.warn('[Parser] Received non-array results:', results);
    return [];
  }
  
  return results.map((result, index) => {
    // Check for required fields
    if (!result.url) {
      console.warn('[Parser] Result missing URL, skipping normalization:', result);
      return null;
    }
    
    return {
      title: result.title || 'No Title',
      url: result.url,
      snippet: result.snippet || 'No description available.',
      relevanceScore: result.relevanceScore || (1 - (index * 0.05)), // Higher index = lower score
      source: result.source || extractDomain(result.url),
      timestamp: new Date().toISOString(),
      favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(result.url)}`
    };
  }).filter(Boolean); // Remove null entries
}

/**
 * Remove duplicate results based on URL
 */
function removeDuplicateResults(results) {
  const urlSet = new Set();
  return results.filter(result => {
    // Extract domain and path for deduplication
    let key;
    try {
      const url = new URL(result.url);
      // Use hostname and pathname as the key
      key = url.hostname + url.pathname;
    } catch {
      key = result.url;
    }
    
    if (urlSet.has(key)) {
      return false;
    }
    
    urlSet.add(key);
    return true;
  });
}

/**
 * Categorize results by domain type
 */
function categorizeResults(results) {
  // Group results by domain type
  const categories = {
    news: [],
    academic: [],
    social: [],
    commercial: [],
    forums: [],
    reference: [],
    other: []
  };
  
  results.forEach(result => {
    const domain = extractDomain(result.url).toLowerCase();
    
    // News sites
    if (domain.includes('news.') || domain.includes('.news') || 
        domain.includes('cnn.com') || domain.includes('bbc.') || 
        domain.includes('nytimes.com') || domain.includes('reuters.com')) {
      categories.news.push(result);
    } 
    // Academic sites
    else if (domain.includes('.edu') || domain.includes('scholar.') || 
             domain.includes('academic.') || domain.includes('research.') ||
             domain.includes('jstor.org') || domain.includes('sciencedirect.com')) {
      categories.academic.push(result);
    } 
    // Social media
    else if (domain.includes('twitter.') || domain.includes('facebook.') || 
             domain.includes('instagram.') || domain.includes('reddit.') ||
             domain.includes('linkedin.com') || domain.includes('medium.com')) {
      categories.social.push(result);
    } 
    // E-commerce/commercial
    else if (domain.includes('amazon.') || domain.includes('ebay.') || 
             domain.includes('walmart.') || domain.includes('shop.') ||
             domain.includes('store.') || domain.includes('product.')) {
      categories.commercial.push(result);
    }
    // Forums and discussions
    else if (domain.includes('forum.') || domain.includes('community.') || 
             domain.includes('discuss.') || domain.includes('stackoverflow.com') ||
             domain.includes('quora.com') || domain.includes('forums.')) {
      categories.forums.push(result);
    }
    // Reference sites
    else if (domain.includes('wikipedia.org') || domain.includes('dictionary.') || 
             domain.includes('encyclopedia') || domain.includes('howto') ||
             domain.includes('docs.') || domain.includes('reference.')) {
      categories.reference.push(result);
    }
    // Other sites
    else {
      categories.other.push(result);
    }
  });
  
  return categories;
}

/**
 * Score results by relevance (higher score = more relevant)
 */
function scoreResults(results, query) {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  return results.map(result => {
    let score = result.relevanceScore || 0.5;
    
    // Title match boost
    if (result.title) {
      const titleLower = result.title.toLowerCase();
      
      // Exact match in title gets highest boost
      if (titleLower.includes(query.toLowerCase())) {
        score += 0.4;
      } else {
        // Partial matches
        for (const word of queryWords) {
          if (word.length > 2 && titleLower.includes(word)) {
            score += 0.1;
          }
        }
      }
    }
    
    // Snippet match boost
    if (result.snippet) {
      const snippetLower = result.snippet.toLowerCase();
      
      // Each query word found in snippet increases score
      for (const word of queryWords) {
        if (word.length > 2 && snippetLower.includes(word)) {
          score += 0.05;
        }
      }
    }
    
    // URL boost for authoritative domains
    const domain = extractDomain(result.url).toLowerCase();
    if (domain.includes('wikipedia.org') || 
        domain.includes('.gov') || 
        domain.includes('.edu')) {
      score += 0.2;
    }
    
    return {
      ...result,
      relevanceScore: Math.min(1, score) // Cap at 1.0
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by score
}

module.exports = {
  normalizeSearchResults,
  removeDuplicateResults,
  categorizeResults,
  extractDomain,
  scoreResults
}; 