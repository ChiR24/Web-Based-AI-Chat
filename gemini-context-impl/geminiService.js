const { GoogleGenerativeAI } = require('@google/generative-ai');
const contextCache = require('./contextCache');
const multiPassAnalysis = require('./multiPassAnalysis');
require('dotenv').config();

/**
 * Enhanced Gemini Service
 * Combines the context caching and multi-pass analysis capabilities
 */
class EnhancedGeminiService {
  constructor() {
    // Initialize the Gemini API
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Initialize models
    this.models = {
      standard: this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        safetySettings: this._getDefaultSafetySettings()
      }),
      flashThinking: this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-thinking-exp',
        safetySettings: this._getDefaultSafetySettings()
      })
    };
    
    // Active chat sessions
    this.activeSessions = new Map();
  }

  /**
   * Start a new chat session with context memory
   * @param {string} sessionId - Unique session identifier
   * @returns {string} Session ID
   */
  startSession(sessionId = null) {
    // Generate a session ID if not provided
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Initialize session
    this.activeSessions.set(id, {
      messages: [],
      createdAt: Date.now(),
      lastActive: Date.now(),
      analysisResults: []
    });
    
    console.log(`Started new session: ${id}`);
    return id;
  }

  /**
   * Send a message in a session with context retention
   * @param {string} sessionId - Session identifier
   * @param {string} message - User message
   * @param {Object} options - Additional options (model, thinking, etc.)
   * @returns {Promise<Object>} Response with message and thinking process
   */
  async sendMessage(sessionId, message, options = {}) {
    const session = this.activeSessions.get(sessionId);
    
    // Create a new session if it doesn't exist
    if (!session) {
      console.log(`Session ${sessionId} not found. Creating new session.`);
      this.startSession(sessionId);
      return this.sendMessage(sessionId, message, options);
    }
    
    // Update session activity
    session.lastActive = Date.now();
    
    // Add user message to history
    session.messages.push({
      role: 'user',
      parts: [{ text: message }]
    });
    
    // Check if this is a search query
    const isSearchQuery = this._isSearchQuery(message);
    
    let response;
    let thinkingProcess = null;
    
    // Handle search queries differently if specified in options
    if (isSearchQuery && options.enableSearch) {
      response = await this._handleSearchQuery(sessionId, message, options);
      thinkingProcess = response.thinkingProcess;
    } else {
      // Use the appropriate model
      const modelToUse = options.enableThinking ? 
        this.models.flashThinking : this.models.standard;
      
      // Get cached context if available
      const cachedContext = contextCache.getContext(sessionId);
      
      // Prepare the chat for this request
      const chat = modelToUse.startChat({
        history: cachedContext?.messages || session.messages.slice(0, -1),
        safetySettings: this._getDefaultSafetySettings()
      });
      
      // Generate response
      response = await chat.sendMessage(message);
      
      // Extract thinking process if available (with flash-thinking model)
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        thinkingProcess = this._extractThinkingProcess(response.candidates[0].content.parts[0].text);
      }
    }
    
    // Extract the text response
    const responseText = response.response ? response.response.text() : 
      (response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "Error generating response");
    
    // Add assistant response to history
    session.messages.push({
      role: 'model',
      parts: [{ text: responseText }]
    });
    
    // Cache the updated context
    contextCache.storeFullContext(sessionId, { messages: session.messages });
    
    // Update the session
    this.activeSessions.set(sessionId, session);
    
    return {
      text: responseText,
      thinking: thinkingProcess,
      searchResults: response.searchResults || []
    };
  }

  /**
   * Process a search query with the multi-pass analysis system
   * @private
   */
  async _handleSearchQuery(sessionId, query, options) {
    console.log(`Processing search query: "${query}"`);
    
    // Step 1: Fetch raw search results
    const searchResults = await this._fetchSearchResults(query);
    
    // Step 2: Analyze the search results
    const analysisResults = await multiPassAnalysis.analyzeSearchResults(
      query, 
      searchResults,
      sessionId
    );
    
    // Step 3: Generate response based on analysis
    const responsePrompt = this._buildSearchResponsePrompt(query, analysisResults);
    
    // Step 4: Generate the final response
    const result = await this.models.standard.generateContent({
      contents: [{ role: 'user', parts: [{ text: responsePrompt }] }],
    });
    
    const finalResponse = result.response;
    const responseText = finalResponse.text();
    
    // Step 5: Store the analysis results for the session
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.analysisResults.push({
        query,
        timestamp: Date.now(),
        results: analysisResults
      });
      this.activeSessions.set(sessionId, session);
    }
    
    // Build a thinking process representation
    const thinkingProcess = this._buildThinkingProcessFromAnalysis(analysisResults);
    
    return {
      text: responseText,
      searchResults,
      thinkingProcess
    };
  }

  /**
   * Fetch search results for a query
   * In a real implementation, this would call a search API
   * @private
   */
  async _fetchSearchResults(query) {
    // This is a placeholder implementation
    // In a real implementation, this would call a search API
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock search results for demonstration
    return [
      {
        title: `${query} - Latest Information and Updates`,
        url: `https://example.com/search/${encodeURIComponent(query)}`,
        snippet: `Comprehensive information about ${query} including recent developments, key facts, and expert analysis.`,
        source: 'example.com',
        relevanceScore: 0.95,
        timestamp: new Date().toISOString()
      },
      {
        title: `Understanding ${query}: A Complete Guide`,
        url: `https://reference.info/${encodeURIComponent(query)}/guide`,
        snippet: `Learn everything you need to know about ${query} with our expert-written guide covering all aspects.`,
        source: 'reference.info',
        relevanceScore: 0.92,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, '_'))}`,
        snippet: `${query} is a topic that spans multiple areas of interest. This comprehensive article covers its history, significance, and current developments.`,
        source: 'wikipedia.org',
        relevanceScore: 0.88,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: `Latest Research on ${query} (2023)`,
        url: `https://research-journal.org/papers/${encodeURIComponent(query)}`,
        snippet: `New findings about ${query} published in peer-reviewed journals. The latest research reveals interesting patterns and insights.`,
        source: 'research-journal.org',
        relevanceScore: 0.85,
        timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        enhancedContent: {
          summary: `Recent research has expanded our understanding of ${query} in several key ways. Multiple studies have confirmed the importance of this topic in modern contexts.`,
          extractedDates: ["2023-06-15", "2023-07-22", "2023-08-10"],
          metadata: {
            author: "Research Team",
            publishedDate: "2023-08-11"
          }
        }
      },
      {
        title: `The History of ${query} Explained`,
        url: `https://historyexplained.com/${encodeURIComponent(query)}`,
        snippet: `Trace the historical development of ${query} from its origins to the present day. Understand key milestones and turning points.`,
        source: 'historyexplained.com',
        relevanceScore: 0.82,
        timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: `Expert Opinions on ${query}`,
        url: `https://expertforum.net/topics/${encodeURIComponent(query)}`,
        snippet: `Leading experts in the field weigh in on ${query}, offering various perspectives and analysis of current trends.`,
        source: 'expertforum.net',
        relevanceScore: 0.78,
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: `${query} in Popular Culture`,
        url: `https://popculture.org/influence/${encodeURIComponent(query)}`,
        snippet: `Explore how ${query} has influenced and been represented in books, movies, music, and other forms of media.`,
        source: 'popculture.org',
        relevanceScore: 0.72,
        timestamp: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: `Common Misconceptions About ${query}`,
        url: `https://mythbusters.edu/${encodeURIComponent(query)}/facts`,
        snippet: `Separating fact from fiction: addressing the most common myths and misconceptions about ${query}.`,
        source: 'mythbusters.edu',
        relevanceScore: 0.68,
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Build a prompt for generating a response based on search analysis
   * @private
   */
  _buildSearchResponsePrompt(query, analysisResults) {
    return `
# Task: Integrated Search Response Generation
I want you to create a comprehensive, accurate response to the query: "${query}"

## Analysis Results
${JSON.stringify(analysisResults, null, 2)}

## Instructions
1. Synthesize the analyzed information into a coherent, conversational response
2. Incorporate key facts, dates, and metrics identified in the analysis
3. Address any contradictions or uncertainties with appropriate nuance
4. Format your response in a natural, flowing style (not as a report)
5. Include proper citation numbers [1], [2], etc. where appropriate
6. Maintain a confident but appropriately cautious tone
7. Focus on providing valuable information rather than stating you conducted searches

## Response Format
Your response should:
- Begin with a direct answer to the query
- Expand with relevant details and context
- Address different aspects of the topic identified in the analysis
- Incorporate information from multiple sources
- Use citation numbers when referencing specific facts [1]
- Conclude with any significant caveats or alternative viewpoints

DO NOT:
- Say "I searched for information about..."
- Say "Based on my search results..."
- Apologize for limitations
- Include unreferenced URLs
- List sources separately at the end
`;
  }

  /**
   * Convert analysis results into a thinking process representation
   * @private
   */
  _buildThinkingProcessFromAnalysis(analysisResults) {
    const thinking = {
      steps: [],
      progress: 100,
      searchQueries: [analysisResults.query || "Unknown query"],
      citations: [],
      reasoningPath: []
    };
    
    // Add steps based on the analysis passes
    if (analysisResults.meta?.passesCompleted) {
      thinking.steps.push({
        type: 'thinking',
        content: 'Performed initial surface scanning of search results',
        status: 'complete'
      });
      
      thinking.steps.push({
        type: 'thinking',
        content: 'Validated claims against known information',
        status: 'complete'
      });
      
      if (analysisResults.meta.passesCompleted >= 3) {
        thinking.steps.push({
          type: 'thinking',
          content: 'Resolved conflicts between contradictory information',
          status: 'complete'
        });
      }
    }
    
    // Add reasoning path
    if (analysisResults.resolvedClaims) {
      for (const claim of analysisResults.resolvedClaims) {
        thinking.reasoningPath.push({
          thought: `Analyzing claim: "${claim.claim}"`,
          action: "Cross-referenced multiple sources",
          outcome: claim.resolution
        });
      }
    }
    
    // Add citations from credibility scores
    if (analysisResults.credibilityScores) {
      Object.entries(analysisResults.credibilityScores).forEach(([index, score], i) => {
        thinking.citations.push({
          id: i + 1,
          title: `Source ${index}`,
          url: "#",
          snippet: "Citation information",
          source: `Source ${index}`,
          relevance: score
        });
      });
    }
    
    return thinking;
  }

  /**
   * Extract thinking process from model response
   * @private
   */
  _extractThinkingProcess(text) {
    // Simple detection of thinking process section
    if (text.includes('THINKING:') && text.includes('ANSWER:')) {
      const thinkingText = text.split('THINKING:')[1].split('ANSWER:')[0].trim();
      
      return {
        steps: [
          {
            type: 'thinking',
            content: thinkingText,
            status: 'complete'
          }
        ],
        progress: 100
      };
    }
    
    return null;
  }

  /**
   * Check if a message is likely a search query
   * @private
   */
  _isSearchQuery(message) {
    const searchIndicators = [
      'search for',
      'find information',
      'look up',
      'tell me about',
      'what is',
      'who is',
      'when did',
      'where is',
      'how to',
      'why does'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    return (
      // Search indicators
      searchIndicators.some(indicator => lowerMessage.includes(indicator)) ||
      // Question marks
      lowerMessage.includes('?') ||
      // Web search syntax
      lowerMessage.startsWith('/search') ||
      lowerMessage.startsWith('search:')
    );
  }

  /**
   * Get session history
   * @param {string} sessionId - Session identifier
   * @returns {Array} Session message history
   */
  getSessionHistory(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    return session.messages;
  }

  /**
   * Get session analysis results
   * @param {string} sessionId - Session identifier
   * @returns {Array} Session analysis results
   */
  getSessionAnalysisResults(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    return session.analysisResults;
  }

  /**
   * Clear a session
   * @param {string} sessionId - Session identifier
   * @returns {boolean} Success status
   */
  clearSession(sessionId) {
    // Clear from cache
    contextCache.clearSession(sessionId);
    
    // Clear from active sessions
    return this.activeSessions.delete(sessionId);
  }

  /**
   * Get default safety settings for Gemini models
   * @private
   */
  _getDefaultSafetySettings() {
    return [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ];
  }
}

module.exports = new EnhancedGeminiService(); 