/**
 * API Routes for search functionality
 */

const express = require('express');
const { 
  performSearch, 
  performEnhancedSearch
} = require('../search-service');

const router = express.Router();

/**
 * POST /api/search
 * Performs a web search based on the query
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        error: 'Query is required', 
        message: 'Please provide a search query' 
      });
    }
    
    console.log(`[Search API] Received query: "${query}"`);
    
    // Perform the search
    const results = await performSearch(query);
    
    // Log result count for debugging
    console.log(`[Search API] Found ${results.length} results for query: "${query}"`);
    
    return res.json({ 
      results,
      meta: {
        query,
        count: results.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Search API] Error:', error);
    return res.status(500).json({ 
      error: 'Search failed', 
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/enhanced-search
 * Performs an enhanced search based on the query and options
 */
router.post('/enhanced-search', async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const result = await performEnhancedSearch(query, options || {});
    
    res.json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Enhanced search error:', error);
    res.status(500).json({ error: 'Enhanced search service error', details: error.message });
  }
});

/**
 * GET /api/trending
 * Returns trending search topics
 */
router.get('/trending', async (req, res) => {
  // This could be dynamically generated based on popular searches
  // For now, return static data
  res.json({ 
    trending: [
      'technology news', 
      'artificial intelligence', 
      'programming tutorials',
      'data science',
      'web development'
    ]
  });
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router; 