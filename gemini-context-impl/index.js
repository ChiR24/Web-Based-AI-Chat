const express = require('express');
const geminiService = require('./geminiService');
const contextCache = require('./contextCache');
const multiPassAnalysis = require('./multiPassAnalysis');
require('dotenv').config();

// Create Express app
const app = express();
app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// API routes
const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Start a new session
apiRouter.post('/sessions', (req, res) => {
  const { sessionId } = req.body || {};
  const id = geminiService.startSession(sessionId);
  res.json({ sessionId: id });
});

// Get session information
apiRouter.get('/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = geminiService.getSessionHistory(sessionId);
  
  if (!history) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const analysisResults = geminiService.getSessionAnalysisResults(sessionId);
  
  res.json({
    sessionId,
    messageCount: history.length,
    analysisCount: analysisResults?.length || 0
  });
});

// Clear a session
apiRouter.delete('/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const success = geminiService.clearSession(sessionId);
  
  if (!success) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({ success: true });
});

// Send a message in a session
apiRouter.post('/sessions/:sessionId/messages', async (req, res) => {
  const { sessionId } = req.params;
  const { message, options } = req.body || {};
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const response = await geminiService.sendMessage(sessionId, message, options);
    res.json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session history
apiRouter.get('/sessions/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;
  const history = geminiService.getSessionHistory(sessionId);
  
  if (!history) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({ messages: history });
});

// Get session analysis results
apiRouter.get('/sessions/:sessionId/analysis', (req, res) => {
  const { sessionId } = req.params;
  const results = geminiService.getSessionAnalysisResults(sessionId);
  
  if (!results) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({ results });
});

// Cache metrics
apiRouter.get('/metrics/cache', (req, res) => {
  res.json(contextCache.getStats());
});

// Analysis metrics
apiRouter.get('/metrics/analysis', (req, res) => {
  res.json(multiPassAnalysis.getAllAnalysisMetrics());
});

// Direct search through multi-pass analysis
apiRouter.post('/search', async (req, res) => {
  const { query, sessionId } = req.body || {};
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  const searchSessionId = sessionId || `search_${Date.now()}`;
  
  try {
    // This uses the underlying search mechanism but bypasses the chat flow
    const searchResults = await geminiService._fetchSearchResults(query);
    const analysisResults = await multiPassAnalysis.analyzeSearchResults(
      query,
      searchResults,
      searchSessionId
    );
    
    res.json({
      query,
      sessionId: searchSessionId,
      searchResults,
      analysisResults
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mount API router
app.use('/api', apiRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Enhanced Gemini Context API Server                      ║
║   Running on port ${PORT}                                   ║
╚═══════════════════════════════════════════════════════════╝

  Features enabled:
  • Context Caching: ${process.env.CACHE_TTL ? 'Yes' : 'No'} (TTL: ${process.env.CACHE_TTL || 'N/A'})
  • Multi-Pass Analysis: ${process.env.ENABLE_MULTI_PASS_ANALYSIS === 'true' ? 'Yes' : 'No'}
  • Chain-of-Agents: ${process.env.ENABLE_CHAIN_OF_AGENTS === 'true' ? 'Yes' : 'No'}
  `);
}); 