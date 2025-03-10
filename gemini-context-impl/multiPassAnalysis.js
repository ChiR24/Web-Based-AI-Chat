const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Multi-Pass Analysis System for Gemini
 * Implements the analysis strategy from the first solution
 */
class MultiPassAnalysis {
  constructor() {
    // Initialize the Gemini API
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Models for different analytical passes
    this.models = {
      surfaceScanning: this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings: this._getDefaultSafetySettings()
      }),
      contextualGrounding: this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        safetySettings: this._getDefaultSafetySettings()
      }),
      conflictResolution: this.genAI.getGenerativeModel({
        model: process.env.ENABLE_CHAIN_OF_AGENTS === 'true' 
          ? 'gemini-2.0-flash-thinking-exp' 
          : 'gemini-1.5-pro',
        safetySettings: this._getDefaultSafetySettings()
      })
    };
    
    // Track analysis stages and metrics
    this.analysisMetrics = new Map();
  }

  /**
   * Process search results through the multi-pass analysis system
   * @param {string} query - Original user query
   * @param {Array} searchResults - Array of search result objects
   * @param {string} sessionId - Session identifier for caching
   * @returns {Object} Enhanced analysis of search results
   */
  async analyzeSearchResults(query, searchResults, sessionId) {
    console.log(`Starting multi-pass analysis for query: "${query}"`);
    
    // Initialize metrics for this analysis session
    this.analysisMetrics.set(sessionId, {
      startTime: Date.now(),
      query,
      resultCount: searchResults.length,
      stages: {}
    });
    
    try {
      // First Pass: Surface Scanning
      console.log('Running first pass: Surface Scanning');
      const firstPassStartTime = Date.now();
      const firstPassResults = await this._runSurfaceScanning(query, searchResults);
      this._recordStageMetrics(sessionId, 'surfaceScanning', firstPassStartTime);
      
      // Second Pass: Contextual Grounding
      console.log('Running second pass: Contextual Grounding');
      const secondPassStartTime = Date.now();
      const secondPassResults = await this._runContextualGrounding(
        query, 
        searchResults,
        firstPassResults
      );
      this._recordStageMetrics(sessionId, 'contextualGrounding', secondPassStartTime);
      
      // Third Pass: Conflict Resolution (only if enabled)
      let finalResults = secondPassResults;
      if (process.env.ENABLE_MULTI_PASS_ANALYSIS === 'true') {
        console.log('Running third pass: Conflict Resolution');
        const thirdPassStartTime = Date.now();
        finalResults = await this._runConflictResolution(
          query, 
          searchResults,
          secondPassResults
        );
        this._recordStageMetrics(sessionId, 'conflictResolution', thirdPassStartTime);
      }
      
      // Record completion
      this._recordCompletionMetrics(sessionId);
      
      return finalResults;
    } catch (error) {
      console.error('Error in multi-pass analysis:', error);
      // Record error
      this._recordErrorMetrics(sessionId, error);
      
      // Return basic analysis in case of error
      return {
        query,
        analyzedResults: searchResults.map(result => ({
          ...result,
          credibilityScore: 0.5,
          relevanceScore: 0.5
        })),
        entityGraph: [],
        error: error.message
      };
    }
  }

  /**
   * First Pass: Surface scanning for rapid pattern identification
   * @private
   */
  async _runSurfaceScanning(query, searchResults) {
    // Prepare the prompt for surface scanning
    const prompt = `
# Task: Surface Scanning Pass
You are performing the initial surface scanning pass on search results for the query: "${query}"

## Instructions
1. Identify key entities, concepts, dates, and numerical data
2. Build a basic entity relationship graph
3. Flag any obvious contradictions or inconsistencies
4. Identify potential result clusters by topic
5. Assess initial relevance of each result

## Search Results
${this._formatSearchResultsForPrompt(searchResults)}

## Output Format (JSON)
Respond ONLY with a JSON object with the following structure:
{
  "entities": [{"name": "entity name", "type": "person|organization|location|concept|date", "mentions": [1, 5, 8]}],
  "relationships": [{"from": "entity1", "to": "entity2", "type": "relationship type"}],
  "clusters": [{"topic": "topic name", "resultIndices": [1, 2, 5]}],
  "relevanceScores": {"1": 0.95, "2": 0.85},
  "contradictions": [{"description": "contradiction description", "resultIndices": [2, 7]}],
  "keyDates": ["2023-04-15", "2021-08-22"]
}
`;

    // Get response from Gemini
    const result = await this.models.surfaceScanning.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract and parse the JSON response
    try {
      // Handling edge cases where model might add explanatory text
      const jsonStr = text.includes('{') ? 
        text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1) : 
        text;
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing surface scanning response:', error);
      console.log('Response text:', text);
      
      // Return a basic structure in case of parsing error
      return {
        entities: [],
        relationships: [],
        clusters: [],
        relevanceScores: {},
        contradictions: [],
        keyDates: []
      };
    }
  }

  /**
   * Second Pass: Contextual grounding to validate against facts
   * @private
   */
  async _runContextualGrounding(query, searchResults, firstPassResults) {
    // Prepare the prompt for contextual grounding
    const prompt = `
# Task: Contextual Grounding Pass
You are performing the second analytical pass (contextual grounding) on search results for: "${query}"

## First Pass Results
${JSON.stringify(firstPassResults, null, 2)}

## Instructions
1. Cross-reference claims across different search results
2. Validate factual assertions against your knowledge base
3. Calculate credibility scores for each source based on:
   - Domain authority
   - Publication date
   - Consistency with other sources
   - Citation patterns
4. Identify information gaps and missing perspectives

## Search Results
${this._formatSearchResultsForPrompt(searchResults)}

## Output Format (JSON)
Respond ONLY with a JSON object with the following structure:
{
  "credibilityScores": {"1": 0.92, "2": 0.78},
  "factValidation": [
    {"claim": "claim text", "resultIndices": [1, 3], "validationStatus": "confirmed|disputed|uncertain", "confidence": 0.85}
  ],
  "informationGaps": ["gap description 1", "gap description 2"],
  "missingPerspectives": ["perspective 1", "perspective 2"],
  "enhancedEntities": [
    {"name": "entity name", "type": "person|organization|location|concept", "validatedInfo": {}, "confidence": 0.9}
  ],
  "recommendedFollowupQueries": ["query 1", "query 2"]
}
`;

    // Get response from Gemini
    const result = await this.models.contextualGrounding.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract and parse the JSON response
    try {
      // Handling edge cases where model might add explanatory text
      const jsonStr = text.includes('{') ? 
        text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1) : 
        text;
      
      const secondPassResults = JSON.parse(jsonStr);
      
      // Combine with first pass results
      return {
        ...firstPassResults,
        ...secondPassResults
      };
    } catch (error) {
      console.error('Error parsing contextual grounding response:', error);
      
      // Return the first pass results with minimal additions in case of error
      return {
        ...firstPassResults,
        credibilityScores: {},
        factValidation: [],
        informationGaps: [],
        missingPerspectives: []
      };
    }
  }

  /**
   * Third Pass: Conflict resolution using Chain-of-Agents if available
   * @private
   */
  async _runConflictResolution(query, searchResults, secondPassResults) {
    // Check if we should use the Chain-of-Agents approach
    const useChainOfAgents = process.env.ENABLE_CHAIN_OF_AGENTS === 'true';
    
    let prompt;
    
    if (useChainOfAgents) {
      prompt = this._buildChainOfAgentsPrompt(query, searchResults, secondPassResults);
    } else {
      // Standard conflict resolution approach
      prompt = `
# Task: Conflict Resolution Pass
You are performing the final analytical pass (conflict resolution) on search results for: "${query}"

## Previous Analysis Results
${JSON.stringify(secondPassResults, null, 2)}

## Instructions
1. Resolve contradictions identified in previous passes
2. Determine the most reliable information when sources disagree
3. Generate confidence scores for key conclusions
4. Create a synthesized understanding that accounts for all credible information
5. Provide explicit reasoning for how conflicts were resolved

## Original Search Results
${this._formatSearchResultsForPrompt(searchResults)}

## Output Format (JSON)
Respond ONLY with a JSON object with the following structure:
{
  "resolvedClaims": [
    {"claim": "claim text", "resolution": "resolution explanation", "confidence": 0.88, "sourceIndices": [1, 5, 8]}
  ],
  "confidenceScores": {"claim1": 0.95, "claim2": 0.65},
  "unresolvedConflicts": [
    {"description": "conflict description", "competingClaims": ["claim 1", "claim 2"], "explanation": "why this remains unresolved"}
  ],
  "synthesizedUnderstanding": "comprehensive explanation that resolves conflicts and integrates information",
  "reliabilityAssessment": {
    "overallConfidence": 0.82,
    "keyClaims": [
      {"claim": "claim text", "confidence": 0.9, "supportingEvidence": "evidence summary"}
    ]
  }
}
`;
    }

    // Get response from Gemini
    const result = await this.models.conflictResolution.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract and parse the JSON response
    try {
      // Handling edge cases where model might add explanatory text
      const jsonStr = text.includes('{') ? 
        text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1) : 
        text;
      
      const thirdPassResults = JSON.parse(jsonStr);
      
      // Create final combined results
      return {
        query,
        ...secondPassResults,
        ...thirdPassResults,
        // Add enhanced metadata
        meta: {
          analysisComplete: true,
          passesCompleted: 3,
          timeStamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error parsing conflict resolution response:', error);
      
      // Return the second pass results with minimal additions
      return {
        query,
        ...secondPassResults,
        meta: {
          analysisComplete: true,
          passesCompleted: 2,
          timeStamp: new Date().toISOString(),
          error: 'Failed to complete conflict resolution pass'
        }
      };
    }
  }

  /**
   * Build a Chain-of-Agents prompt for advanced conflict resolution
   * Only available with experimental models
   * @private
   */
  _buildChainOfAgentsPrompt(query, searchResults, secondPassResults) {
    return `
# Task: Advanced Conflict Resolution using Chain-of-Agents
You will act as a coordinator for a team of specialized AI agents analyzing search results for: "${query}"

## Previous Analysis
${JSON.stringify(secondPassResults, null, 2)}

## Chain-of-Agents Protocol
You will analyze the search results by simulating these specialized agents:

1. First Agent: Fact Verification Agent
   - Focus: Verify factual claims against your knowledge
   - Method: Cross-reference dates, statistics, and events
   - Output: Fact verification report with confidence scores

2. Second Agent: Temporal Consistency Agent
   - Focus: Analyze chronological consistency
   - Method: Create timeline, identify anachronisms
   - Output: Temporal analysis with inconsistency resolution

3. Third Agent: Source Authority Agent
   - Focus: Evaluate credibility of each source
   - Method: Domain reputation analysis, publication patterns
   - Output: Authority scores with specific reasoning

4. Fourth Agent: Synthesis Agent
   - Focus: Integrate all agent findings
   - Method: Weighted consensus algorithm
   - Output: Final integrated analysis

## Search Results
${this._formatSearchResultsForPrompt(searchResults)}

## Instructions
1. IMPORTANT: Run each agent analysis IN SEQUENCE
2. Show the thinking process of each agent
3. Conclude with the Synthesis Agent's final analysis
4. Format the final output as a JSON object

## Output Format (JSON)
{
  "agentAnalyses": {
    "factVerification": { results of first agent },
    "temporalConsistency": { results of second agent },
    "sourceAuthority": { results of third agent }
  },
  "synthesizedAnalysis": {
    "resolvedClaims": [
      {"claim": "claim text", "resolution": "resolution explanation", "confidence": 0.88}
    ],
    "confidenceScores": {"claim1": 0.95, "claim2": 0.65},
    "unresolvedConflicts": [
      {"description": "conflict description", "competingClaims": ["claim 1", "claim 2"]}
    ],
    "synthesizedUnderstanding": "comprehensive explanation"
  }
}
`;
  }

  /**
   * Format search results for inclusion in prompts
   * @private
   */
  _formatSearchResultsForPrompt(searchResults) {
    return searchResults.map((result, index) => {
      const resultStr = [
        `[${index + 1}] "${result.title}"`,
        `URL: ${result.url}`,
        `Source: ${result.source || new URL(result.url).hostname}`,
        `Snippet: ${result.snippet || 'No snippet available'}`
      ];
      
      // Add favicon if available
      if (result.favicon) {
        resultStr.push(`Favicon: ${result.favicon}`);
      }
      
      // Add timestamp if available
      if (result.timestamp) {
        const date = new Date(result.timestamp);
        resultStr.push(`Date: ${date.toISOString().split('T')[0]}`);
      }
      
      // Add enhanced content if available
      if (result.enhancedContent) {
        resultStr.push('--- Enhanced Content ---');
        
        if (result.enhancedContent.summary) {
          resultStr.push(`Summary: ${result.enhancedContent.summary}`);
        }
        
        if (result.enhancedContent.extractedDates && result.enhancedContent.extractedDates.length > 0) {
          resultStr.push(`Extracted Dates: ${result.enhancedContent.extractedDates.join(', ')}`);
        }
        
        if (result.enhancedContent.metadata) {
          const metadata = result.enhancedContent.metadata;
          if (metadata.description) resultStr.push(`Description: ${metadata.description}`);
          if (metadata.keywords) resultStr.push(`Keywords: ${metadata.keywords}`);
          if (metadata.author) resultStr.push(`Author: ${metadata.author}`);
          if (metadata.publishedDate) resultStr.push(`Published: ${metadata.publishedDate}`);
        }
      }
      
      return resultStr.join('\n');
    }).join('\n\n');
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

  /**
   * Record metrics for an analysis stage
   * @private
   */
  _recordStageMetrics(sessionId, stageName, startTime) {
    const metrics = this.analysisMetrics.get(sessionId);
    if (!metrics) return;
    
    metrics.stages[stageName] = {
      duration: Date.now() - startTime,
      completed: true
    };
    
    this.analysisMetrics.set(sessionId, metrics);
  }

  /**
   * Record completion metrics
   * @private
   */
  _recordCompletionMetrics(sessionId) {
    const metrics = this.analysisMetrics.get(sessionId);
    if (!metrics) return;
    
    metrics.completed = true;
    metrics.totalDuration = Date.now() - metrics.startTime;
    
    this.analysisMetrics.set(sessionId, metrics);
  }

  /**
   * Record error metrics
   * @private
   */
  _recordErrorMetrics(sessionId, error) {
    const metrics = this.analysisMetrics.get(sessionId);
    if (!metrics) return;
    
    metrics.error = error.message;
    metrics.completed = false;
    metrics.totalDuration = Date.now() - metrics.startTime;
    
    this.analysisMetrics.set(sessionId, metrics);
  }

  /**
   * Get analysis metrics for a session
   */
  getAnalysisMetrics(sessionId) {
    return this.analysisMetrics.get(sessionId);
  }

  /**
   * Get all analysis metrics
   */
  getAllAnalysisMetrics() {
    return Object.fromEntries(this.analysisMetrics);
  }
}

module.exports = new MultiPassAnalysis(); 