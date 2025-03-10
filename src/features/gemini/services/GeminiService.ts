import { GoogleGenerativeAI, GenerativeModel, SafetySetting, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { SearchResult, ThinkingProcess, Citation } from '../types/gemini.types';

/**
 * GeminiService provides access to Google's Gemini generative AI models
 * with support for content generation, web search, and advanced features
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private models: Record<string, GenerativeModel> = {};
  private embeddingModel: string = 'gemini-embedding-exp-03-07';
  private maxSearchRounds: number = 10; // Increased from 3 to 5 rounds by default

  constructor(apiKey: string, config?: { maxSearchRounds?: number }) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Apply configuration if provided
    if (config) {
      if (config.maxSearchRounds !== undefined) {
        this.maxSearchRounds = config.maxSearchRounds;
      }
    }
    
    // Initialize default models
    this.initializeModels();
  }

  /**
   * Initialize available Gemini models
   */
  private initializeModels() {
    const modelIds = [
      'gemini-2.0-flash-thinking-exp',
      'gemini-2.0-pro-exp',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ];

    modelIds.forEach(modelId => {
      // Standard initialization for all models
      this.models[modelId] = this.genAI.getGenerativeModel({
        model: modelId,
        safetySettings: this.getDefaultSafetySettings()
      });
    });
  }

  /**
   * Get default safety settings for all models
   */
  private getDefaultSafetySettings(): SafetySetting[] {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  /**
   * Format LaTeX expressions in the response text
   * This ensures proper rendering of mathematical expressions
   */
  private formatLatexExpressions(text: string): string {
    // Replace inline LaTeX expressions
    let formattedText = text.replace(/\$([^$]+)\$/g, (_, p1) => {
      // Escape backslashes to prevent them from being interpreted as escape characters
      const escapedLatex = p1.replace(/\\/g, '\\\\');
      return `$${escapedLatex}$`;
    });
    
    // Replace block LaTeX expressions
    formattedText = formattedText.replace(/\$\$([^$]+)\$\$/g, (_, p1) => {
      // Escape backslashes to prevent them from being interpreted as escape characters
      const escapedLatex = p1.replace(/\\/g, '\\\\');
      return `$$${escapedLatex}$$`;
    });
    
    return formattedText;
  }

  /**
   * Enhance a prompt with formatting instructions
   * This encourages the model to use proper formatting in its responses
   */
  private enhancePromptWithFormatting(prompt: string, includeFormatting: boolean = true): string {
    // If formatting instructions are disabled, return the prompt as is
    if (!includeFormatting) {
      return prompt;
    }
    
    // Don't add formatting instructions for simple greetings or very short prompts
    const simpleGreetings = ["hi", "hello", "hey", "hi there", "hello there", "hey there", "what's up", "how are you", "howdy"];
    const trimmedPrompt = prompt.trim().toLowerCase();
    
    // Check if the prompt is a simple greeting or very short (less than 10 characters)
    if (simpleGreetings.includes(trimmedPrompt) || prompt.length < 10) {
      return prompt;
    }
    
    const formattingInstructions = `
When responding, please use proper formatting:
- Use markdown for text formatting (bold, italic, lists, etc.)
- Use LaTeX for mathematical expressions (e.g., $E = mc^2$ for inline, or $$ \\frac{d}{dx}f(x) $$ for display)
- Use code blocks with language specification for code snippets (e.g., \`\`\`python for Python code)
- Use tables for tabular data
- Use blockquotes for quotations

Your response should be well-structured and visually appealing.
`;

    return `${prompt}\n\n${formattingInstructions}`;
  }

  /**
   * Generate content with a prompt
   */
  async generateContent(prompt: string, modelId: string, includeFormatting: boolean = true): Promise<string> {
    try {
      console.log(`Generating content with model: ${modelId}`);
      
      const model = this.getModelById(modelId);
      
      // Add formatting to the prompt if requested
      const formattedPrompt = includeFormatting 
        ? this.enhancePromptWithFormatting(prompt) 
        : prompt;
      
      // For the thinking model, handle thinking capabilities
      if (modelId === 'gemini-2.0-flash-thinking-exp') {
        // Use standard generateContent but with thinking flag in the prompt
        // The thinking capabilities are enabled in API parameter called "system"
        // which is communicated through prompt format
        const enhancedPrompt = `#thinking
${formattedPrompt}`;
        
        const result = await model.generateContent(enhancedPrompt);
        const response = result.response;
        const mainText = response.text();
        
        // The thinking process will be included in the response
        // Often in a format like "Thinking: <process> Answer: <answer>"
        return this.formatLatexExpressions(mainText);
      } else {
        // Standard content generation for other models
        const result = await model.generateContent(formattedPrompt);
        const response = result.response;
        return this.formatLatexExpressions(response.text());
      }
    } catch (error) {
      console.error('Error generating content:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to generate content: ${error.message}`);
      }
      
      throw new Error('Failed to generate content');
    }
  }

  /**
   * Generate embeddings for text using the Gemini embedding model
   * @param text The text to generate embeddings for
   * @returns An array of embedding values
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error(`Error generating embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   * @param embedding1 First embedding vector
   * @param embedding2 Second embedding vector
   * @returns Similarity score between 0 and 1
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Perform a web search and generate a response based on the results
   * Uses an iterative approach where Gemini evaluates search results and requests additional searches if needed
   */
  async generateWithWebSearch(query: string, modelId: string): Promise<{text: string, searchResults: SearchResult[], thinkingProcess?: ThinkingProcess}> {
    try {
      console.log('Starting web search for query:', query, 'with model:', modelId);
      
      // Initialize thinking process
      const thinkingProcess: ThinkingProcess = {
        steps: [
          {
            type: 'thinking',
            content: 'Initializing search process...',
            status: 'in_progress'
          }
        ],
        searchQueries: [query],
        reasoningPath: [],
        informationGaps: [],
        progress: 0 // Start with 0% progress
      };

      // STAGE 1: QUERY UNDERSTANDING (0-20% progress)
      thinkingProcess.steps.push({
        type: 'thinking',
        content: 'Stage 1: Query Understanding - Analyzing query to determine intent, domain, and search strategy',
        status: 'in_progress'
      });
      
      // Update progress to show we're in stage 1
      thinkingProcess.progress = 5;
      thinkingProcess.activeStep = 1;
      thinkingProcess.stageProgress = {
        currentStage: 'Query Understanding',
        stageNumber: 1,
        totalStages: 5,
        percentComplete: 25
      };
      
      thinkingProcess.reasoningPath.push({
        thought: `Analyzing query: "${query}"`,
        action: "Determining search intent, domain, and entities for optimal search strategy"
      });

      // Identify query domain, type, entities, and other metadata
      let queryDomain = "general";
      let queryType = "factual";
      let entities: string[] = [];
      let temporalAspect = "current";
      let queryIntent = "informational";
      let searchStrategy = "comprehensive"; // Options: focused, comprehensive, exploratory
      
      // Analyze the query to determine domain and entities - similar to how Perplexity uses GPT-4o for query understanding
      try {
        const domainAnalysisPrompt = `You are an expert search query analyzer, similar to systems used by Perplexity AI.

Analyze this search query and identify:
1. The domain (e.g., technology, entertainment, science, health, history, sports, politics, finance, education)
2. The query type (factual, explanatory, comparative, opinion)
3. Key entities that need to be researched (specific names, concepts, products, etc.)
4. Any temporal aspects (recent, historical, future)
5. Query intent (informational, navigational, transactional)
6. Specific subtopics or aspects that should be covered
7. Search strategy (focused, comprehensive, exploratory)
8. Potential information sources (academic, news, technical documentation, etc.)

Query: "${query}"

Return ONLY a valid JSON object with the following format (no markdown, no code blocks, just the JSON):
{
  "domain": "string",
  "queryType": "string",
  "entities": ["string"],
  "temporalAspect": "string",
  "queryIntent": "string",
  "subtopics": ["string"],
  "searchStrategy": "string",
  "potentialSources": ["string"]
}`;

        const domainAnalysis = await this.generateContent(domainAnalysisPrompt, modelId);
        
        // Clean up the response to ensure it's valid JSON
        let cleanedResponse = domainAnalysis;
        
        // Remove any markdown code block indicators
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
        
        // Remove any leading/trailing whitespace
        cleanedResponse = cleanedResponse.trim();
        
        // Try to find JSON object in the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
        
        const parsedAnalysis = JSON.parse(cleanedResponse);
        queryDomain = parsedAnalysis.domain || queryDomain;
        queryType = parsedAnalysis.queryType || queryType;
        entities = parsedAnalysis.entities || entities;
        temporalAspect = parsedAnalysis.temporalAspect || temporalAspect;
        queryIntent = parsedAnalysis.queryIntent || queryIntent;
        searchStrategy = parsedAnalysis.searchStrategy || searchStrategy;
        
        // Add subtopics to thinking process if available
        if (parsedAnalysis.subtopics && Array.isArray(parsedAnalysis.subtopics)) {
          thinkingProcess.subtopics = parsedAnalysis.subtopics;
        }
        
        // Add potential sources to thinking process
        if (parsedAnalysis.potentialSources && Array.isArray(parsedAnalysis.potentialSources)) {
          thinkingProcess.potentialSources = parsedAnalysis.potentialSources;
        }
      } catch (e) {
        console.warn("Failed to parse domain analysis, using defaults", e);
        
        // Fallback domain detection for common queries
        if (query.toLowerCase().includes("when") || 
            query.toLowerCase().includes("history") || 
            query.toLowerCase().includes("war") || 
            query.toLowerCase().includes("century") ||
            query.toLowerCase().includes("ancient")) {
          queryDomain = "history";
          queryType = "factual";
        } else if (query.toLowerCase().includes("how to") || 
                  query.toLowerCase().includes("steps to") || 
                  query.toLowerCase().includes("guide")) {
          queryDomain = "instructional";
          queryType = "explanatory";
        } else if (query.toLowerCase().includes("vs") || 
                  query.toLowerCase().includes("compare") || 
                  query.toLowerCase().includes("difference")) {
          queryDomain = "comparative";
          queryType = "comparative";
        }
      }

      // Update progress to show stage 1 is complete
      thinkingProcess.progress = 20;
      thinkingProcess.steps[thinkingProcess.steps.length - 1].status = 'complete';
      thinkingProcess.stageProgress = {
        currentStage: 'Query Understanding',
        stageNumber: 1,
        totalStages: 5,
        percentComplete: 100
      };
      
      // Add domain context to thinking process
      thinkingProcess.domainContext = queryDomain;

      thinkingProcess.reasoningPath.push({
        thought: `Query is in ${queryDomain} domain, of type ${queryType}, with intent ${queryIntent}`,
        action: "Formulating multi-stage search strategy similar to Perplexity's approach"
      });

      // STAGE 2: SEARCH PLANNING (20-40% progress)
      thinkingProcess.steps.push({
        type: 'thinking',
        content: 'Stage 2: Search Planning - Developing search queries and determining information needs',
        status: 'in_progress'
      });
      
      // Update progress to show we're in stage 2
      thinkingProcess.progress = 25;
      thinkingProcess.activeStep = 2;
      thinkingProcess.stageProgress = {
        currentStage: 'Search Planning',
        stageNumber: 2,
        totalStages: 5,
        percentComplete: 25
      };
      
      // Generate search plan using LLM - similar to how Perplexity uses GPT-4o to plan searches
      const searchPlanPrompt = `You are an expert search planner for an AI system similar to Perplexity.

For the query: "${query}"

Domain: ${queryDomain}
Query type: ${queryType}
Entities: ${entities.join(', ')}
Intent: ${queryIntent}

Create a comprehensive search plan that includes:
1. A list of 3-5 specific search queries to gather information (from most specific to most general)
2. Key information that needs to be found for each query
3. A strategy for synthesizing the information into a coherent answer

Return ONLY a valid JSON object with the following format:
{
  "searchQueries": [
    {
      "query": "string",
      "purpose": "string",
      "expectedInformation": "string"
    }
  ],
  "informationNeeds": ["string"],
  "synthesisStrategy": "string"
}`;

      const searchPlanResponse = await this.generateContent(searchPlanPrompt, modelId);
      let searchPlan;
      
      try {
        // Clean and parse the search plan
        let cleanedPlanResponse = searchPlanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const jsonMatch = cleanedPlanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedPlanResponse = jsonMatch[0];
        }
        
        searchPlan = JSON.parse(cleanedPlanResponse);
        
        // Update progress to show stage 2 is complete
        thinkingProcess.progress = 40;
        thinkingProcess.steps[thinkingProcess.steps.length - 1].status = 'complete';
        thinkingProcess.stageProgress = {
          currentStage: 'Search Planning',
          stageNumber: 2,
          totalStages: 5,
          percentComplete: 100
        };
        
        // Add search plan to reasoning path
        thinkingProcess.reasoningPath.push({
          thought: `Developed search plan with ${searchPlan.searchQueries.length} queries to gather comprehensive information`,
          action: "Preparing for multi-round search execution",
          outcome: `Search plan created with information needs: ${searchPlan.informationNeeds.join(', ')}`
        });
      } catch (e) {
        console.warn("Failed to parse search plan, using default approach", e);
        searchPlan = {
          searchQueries: [
            { query: query, purpose: "Main search", expectedInformation: "Primary information" },
            { query: `${query} latest research`, purpose: "Recent information", expectedInformation: "Recent developments" },
            { query: `${query} explained in detail`, purpose: "Detailed explanation", expectedInformation: "Comprehensive explanation" }
          ],
          informationNeeds: ["Basic facts", "Detailed explanation", "Recent developments"],
          synthesisStrategy: "Combine information from all sources, prioritizing authoritative and recent sources"
        };
      }

      // STAGE 3: ITERATIVE SEARCH EXECUTION (40-70% progress)
      thinkingProcess.steps.push({
        type: 'thinking',
        content: 'Stage 3: Iterative Search Execution - Performing multiple search rounds to gather comprehensive information',
        status: 'in_progress'
      });
      
      // Update progress to show we're in stage 3
      thinkingProcess.progress = 45;
      thinkingProcess.activeStep = 3;
      thinkingProcess.stageProgress = {
        currentStage: 'Iterative Search',
        stageNumber: 3,
        totalStages: 5,
        percentComplete: 0
      };
      
      // Initialize variables for iterative search
      let allSearchResults: SearchResult[] = [];
      const maxRounds = Math.min(searchPlan.searchQueries.length, this.maxSearchRounds);
      let searchInsights: {query: string, findings: string}[] = [];
      
      // Implement parallel data fetching for search queries - similar to Next.js Promise.all pattern
      // This is more efficient than sequential fetching and closer to how Perplexity works
      thinkingProcess.reasoningPath.push({
        thought: `Initiating parallel search for ${maxRounds} search queries`,
        action: "Executing multiple search queries simultaneously for efficiency",
        outcome: "Will combine results from all queries for comprehensive coverage"
      });
      
      // Create an array of search promises
      const searchPromises = searchPlan.searchQueries.slice(0, maxRounds).map(async (searchQueryObj: { query: string, purpose: string, expectedInformation: string }, index: number) => {
        const roundNumber = index + 1;
        const currentSearchQuery = searchQueryObj.query;
        
        // Add search round to thinking process
        thinkingProcess.steps.push({
          type: 'search',
          content: `Search round ${roundNumber}: "${currentSearchQuery}" - Purpose: ${searchQueryObj.purpose}`,
          status: 'in_progress'
        });
        
        // Add search query to the list
        if (!thinkingProcess.searchQueries?.includes(currentSearchQuery)) {
          thinkingProcess.searchQueries?.push(currentSearchQuery);
        }
        
        // Perform the search
        const searchResults = await this.performWebSearch(currentSearchQuery, queryDomain);
        
        // Update thinking process for this round
        const stepIndex = thinkingProcess.steps.length - 1;
        thinkingProcess.steps[stepIndex].status = 'complete';
        
        // Analyze search results for this round
        const searchAnalysisPrompt = `You are an expert search analyst for an AI system similar to Perplexity.

### CRITICAL INSTRUCTION: YOU MUST ANALYZE ALL ${searchResults.length} SEARCH RESULTS LISTED BELOW, NOT JUST THE FIRST FEW.

Query: "${currentSearchQuery}"
Purpose of this search: ${searchQueryObj.purpose}
Expected information: ${searchQueryObj.expectedInformation}

SEARCH RESULTS (${searchResults.length} total results):
${searchResults.map((result, idx) => {
  // Base result information
  let resultText = `RESULT #${idx + 1}:
  Title: ${result.title}
  URL: ${result.url}
  Snippet: ${result.snippet || 'No snippet available'}`;
  
  // Add enhanced content if available
  if (result.enhancedContent) {
    resultText += `\n  
  ## SCRAPED WEBPAGE CONTENT:
  ${result.enhancedContent.summary || ''}
  
  ## EXTRACTED DATES:
  ${result.enhancedContent.extractedDates?.join(', ') || 'None found'}
  
  ## METADATA:
  ${Object.entries(result.enhancedContent.metadata || {})
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n  ') || 'None available'}`;
  }
  
  return resultText + '\n  -----------';
}).join('\n\n')}

I want you to use a multi-stage analysis approach with chain-of-thought reasoning. Follow these steps in order:

### STEP 1: SOURCE CREDIBILITY ASSESSMENT
For each result, assign a credibility score (1-5) based on:
- Domain reputation (official sources, reputable news sites, forums)
- Recency of information
- Specificity of claims (vague vs. specific dates/details)
- Presence of direct quotes from official sources
- Cross-verification with other results

### STEP 2: INDIVIDUAL RESULT EXTRACTION
For EACH result, extract and list:
- Key facts and claims
- Dates mentioned (especially release dates, announcements)
- Named entities (people, companies, products)
- Status information (confirmed, rumored, etc.)
- Contradictions with other sources

### STEP 3: CONFLICT IDENTIFICATION & RESOLUTION
- Explicitly identify ANY contradicting information across sources
- For each contradiction, evaluate which source is more credible
- Determine the most likely correct information based on:
  * Source credibility
  * Recency of information
  * Specificity and detail
  * Consensus across multiple sources
  * Official vs unofficial sources

### STEP 4: COMPREHENSIVE SYNTHESIS
Combine all information into a coherent analysis that:
- References ALL sources in your reasoning
- Distinguishes between confirmed facts and speculation
- Addresses ALL contradictions found
- Assigns confidence levels to key conclusions
- Identifies information gaps that require further search

Your final analysis must explicitly show your reasoning process through all four steps above, referencing specific results by number to show you've analyzed ALL search results.

Format your response as a detailed analysis that explicitly references information from ALL ${searchResults.length} results.`;

        const searchAnalysis = await this.generateContent(searchAnalysisPrompt, modelId);
        
        return {
          roundNumber,
          query: currentSearchQuery,
          results: searchResults,
          analysis: searchAnalysis
        };
      });
      
      // Execute all search queries in parallel and wait for all to complete
      const searchResults = await Promise.all(searchPromises);
      
      // Process the results in order
      searchResults.forEach(result => {
        // Add search results to the accumulated list
        allSearchResults = [...allSearchResults, ...result.results];
        
        // Add search analysis to insights
        searchInsights.push({
          query: result.query,
          findings: result.analysis
        });
        
        // Add reasoning step
        thinkingProcess.reasoningPath.push({
          thought: `Analyzed results from search: "${result.query}"`,
          action: `Extracting key information related to search round ${result.roundNumber}`,
          outcome: result.analysis.substring(0, 200) + (result.analysis.length > 200 ? '...' : '')
        });
        
        // Calculate progress
        const stageProgressPercent = Math.min(Math.round((result.roundNumber / maxRounds) * 100), 100);
        const overallProgress = 45 + Math.round((result.roundNumber / maxRounds) * 25);
        
        thinkingProcess.progress = overallProgress;
        thinkingProcess.stageProgress = {
          currentStage: 'Iterative Search',
          stageNumber: 3,
          totalStages: 5,
          percentComplete: stageProgressPercent,
          detail: `Round ${result.roundNumber} of ${maxRounds}`
        };
      });
      
      // Remove duplicates by URL
      allSearchResults = this.removeDuplicateResults(allSearchResults);
      
      // Sort results by relevance score
      allSearchResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      
      // Update thinking process with search results
      thinkingProcess.searchResults = allSearchResults;
      
      // Add a comprehensive analysis of all search results together
      thinkingProcess.steps.push({
        type: 'thinking',
        content: 'Performing comprehensive analysis of all search results together',
        status: 'in_progress'
      });
      
      const combinedResultsPrompt = `
Analyze ALL ${allSearchResults.length} search results collectively to provide a comprehensive understanding of the query.

Search results (${allSearchResults.length} total):
${allSearchResults.map((result, idx) => {
  // Base result information
  let resultText = `[${idx + 1}] ${result.title} (${result.url})
   Snippet: ${result.snippet?.substring(0, 150)}...`;
  
  // Add enhanced content if available
  if (result.enhancedContent) {
    resultText += `\n
   SCRAPED CONTENT: ${result.enhancedContent.summary?.substring(0, 200)}...
   DATES FOUND: ${result.enhancedContent.extractedDates?.join(', ') || 'None'}`;
  }
  
  return resultText;
}).join('\n\n')}

I want you to implement an iterative refinement analysis to ensure comprehensive processing of ALL search results:

### ROUND 1: INITIAL COMPREHENSIVE SCAN
- Process ALL ${allSearchResults.length} results individually 
- Extract key information from each result
- Identify potential contradictions or discrepancies
- Map relationships between claims in different results
- Assign initial confidence scores to claims

### ROUND 2: VERIFICATION AND GAP ANALYSIS
- Cross-reference claims that appear in multiple results
- Identify information gaps where more data is needed
- Flag potential misinformation or outdated information
- Generate specific verification questions for each gap

### ROUND 3: RESOLUTION AND SYNTHESIS
- Resolve contradictions using source authority hierarchy
- Synthesize verified information into coherent findings
- Structure information by confidence level (confirmed vs. speculative)
- Prepare data for final comprehensive response

YOUR TASK: 
- You MUST analyze ALL ${allSearchResults.length} results together, including ALL search results listed above
- EXTRACT key facts, dates, figures, and specific claims from EACH result
- Look for patterns, agreements, and contradictions across ALL sources
- DO NOT focus only on the first few results - information in later results is often equally or more important
- Pay special attention to dates, numbers, and factual claims in each result
- For date-specific information (like release dates, events, etc.), explicitly note what each source says
- Identify which results provide the most valuable information for answering: "${query}"

Provide a detailed analysis that references specific results by their number and explicitly mentions key information from EACH result.
`;

      const combinedAnalysis = await this.generateContent(combinedResultsPrompt, modelId);
      
      thinkingProcess.steps[thinkingProcess.steps.length - 1].status = 'complete';
      
      // Add the comprehensive analysis to reasoning path
      thinkingProcess.reasoningPath.push({
        thought: `Analyzed all ${allSearchResults.length} search results together`,
        action: `Identifying key information, patterns, and gaps across all results`,
        outcome: combinedAnalysis.substring(0, 300) + (combinedAnalysis.length > 300 ? '...' : '')
      });
      
      // Update progress to show stage 3 is complete
      thinkingProcess.progress = 70;
      thinkingProcess.steps[thinkingProcess.steps.length - 1].status = 'complete';
      thinkingProcess.stageProgress = {
        currentStage: 'Iterative Search',
        stageNumber: 3,
        totalStages: 5,
        percentComplete: 100
      };
      
      // STAGE 4: INFORMATION SYNTHESIS (70-85% progress)
      thinkingProcess.steps.push({
        type: 'thinking',
        content: 'Stage 4: Information Synthesis - Combining search results into a coherent response',
        status: 'in_progress'
      });
      
      // Update progress to show we're in stage 4
      thinkingProcess.progress = 75;
      thinkingProcess.activeStep = 4;
      thinkingProcess.stageProgress = {
        currentStage: 'Information Synthesis',
        stageNumber: 4,
        totalStages: 5,
        percentComplete: 50
      };
      
      // Generate final response using LLM - similar to how Perplexity uses GPT-4o or Claude for final synthesis
      const finalSynthesisPrompt = `
You are a helpful AI assistant providing direct, informative responses based on search results.

When answering the query: "${query}"

CRITICAL: You MUST carefully analyze ALL of the following search results:

${allSearchResults.slice(0, 20).map((result, idx) => {
  // Base result information
  let resultText = `[${idx + 1}] ${result.title}
  URL: ${result.url}
  Snippet: ${result.snippet || 'No snippet available'}`;
  
  // Add enhanced content if available
  if (result.enhancedContent) {
    resultText += `\n
  ## SCRAPED WEBPAGE CONTENT:
  ${result.enhancedContent.summary || ''}
  
  ## EXTRACTED DATES:
  ${result.enhancedContent.extractedDates?.join(', ') || 'None found'}
  
  ## METADATA:
  ${Object.entries(result.enhancedContent.metadata || {})
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n  ') || 'None available'}`;
  }
  
  return resultText;
}).join('\n\n')}

I want you to use a sophisticated multi-stage synthesis approach that ensures comprehensive analysis of ALL results:

### STAGE 1: INFORMATION VALIDATION
- Assign credibility weights to each source based on domain authority
- Prioritize information from official sources and firsthand reports
- Verify claims that appear in multiple independent sources
- Identify and flag any information from suspicious or unreliable sources

### STAGE 2: CONFLICT RESOLUTION
- Explicitly identify contradictory information across sources
- Determine the most reliable information based on source credibility, specificity, and recency
- Present multiple perspectives when genuine disagreements exist between credible sources
- Note when information is speculative vs. confirmed

### STAGE 3: CONFIDENCE-BASED REPORTING
- Assign confidence levels to key conclusions (High/Medium/Low)
- Provide specific reasoning for confidence assessments
- Distinguish between factual statements (with citation numbers) and interpretations
- Highlight information gaps or limitations in the search results

### STAGE 4: COMPREHENSIVE ANSWER FORMULATION
Your final response must:
- Present a direct answer to the query with key facts and context
- Include specific dates, figures, and quotes from the most reliable sources
- Present multiple perspectives when the topic is subjective or controversial
- Properly cite sources using citation numbers [1], [2], etc.
- Express appropriate confidence/uncertainty language based on the evidence

IMPORTANT INSTRUCTIONS:
1. For news or current events queries, provide ACTUAL NEWS INFORMATION, not just an analysis of news sources.
2. When asked "What's happening in the world today" or similar queries, provide the latest news headlines and details.
3. Include specific facts, dates, figures, and quotes from your sources.
4. Respond as if the information is already known to you, not as if you're analyzing search results.
5. DO NOT list or explain your sources in the main response - use proper citations [1], [2], etc. instead.
6. DO NOT say "Based on search results" or "According to the search results" - just provide the information.
7. Present a coherent narrative that directly answers the query rather than an academic analysis.
8. PRIORITIZE information from scraped webpage content over snippets when available - this is actual content from the websites
9. PAY SPECIAL ATTENTION to any extracted dates when answering date-specific queries
10. When appropriate, organize your response with clear section headings

You have analyzed ${allSearchResults.length} search results across ${maxRounds} search rounds.

IMPORTANT: Consider information from ALL search results listed above, not just the first few. Pay attention to dates, specific claims, and factual information in ALL sources before forming your response.

Your response MUST be:
- Direct and conversational, like a knowledgeable friend sharing information
- Comprehensive yet concise
- Organized with appropriate headings if the topic has multiple aspects
- Including relevant facts, figures, and data from the sources
- Well-structured with proper citation numbers [1], [2], etc.

For NEWS queries specifically:
- Provide actual headlines and developments
- Include when events happened (dates/times)
- Mention key figures or organizations involved
- Give context for why the news matters
- Organize by topic area (politics, technology, etc.) if appropriate
- Do not fabricate information not found in the search results

If you don't have enough information from search results, acknowledge this briefly at the end, not at the beginning.

End your response with a "Search Results Summary" section that provides:
- Total search results analyzed: ${allSearchResults.length}
- Key sources consulted: List 3-5 most relevant domains
- Confidence level: High/Medium/Low with brief explanation
- Information gaps: Note any missing information needed for a complete answer`;

      const synthesizedResponse = await this.generateContent(finalSynthesisPrompt, modelId);
      
      // Update progress to show stage 4 is complete
      thinkingProcess.progress = 85;
      thinkingProcess.steps[thinkingProcess.steps.length - 1].status = 'complete';
      thinkingProcess.stageProgress = {
        currentStage: 'Information Synthesis',
        stageNumber: 4,
        totalStages: 5,
        percentComplete: 100
      };
      
      // STAGE 5: CITATION AND FORMATTING (85-100% progress)
      thinkingProcess.steps.push({
        type: 'thinking',
        content: 'Stage 5: Citation and Formatting - Adding citations and formatting the final response',
        status: 'in_progress'
      });
      
      // Update progress to show we're in stage 5
      thinkingProcess.progress = 90;
      thinkingProcess.activeStep = 5;
      thinkingProcess.stageProgress = {
        currentStage: 'Citation and Formatting',
        stageNumber: 5,
        totalStages: 5,
        percentComplete: 50
      };
      
      // Create citations from search results
      const citations: Citation[] = allSearchResults.slice(0, 20).map((result, index) => ({
        id: index + 1,
        title: result.title,
        url: result.url,
        snippet: result.snippet || '',
        source: new URL(result.url).hostname,
        relevance: result.relevanceScore || 0.5
      }));
      
      // Add citations to thinking process
      thinkingProcess.citations = citations;
      
      // Format the final response with citations
      const formattedResponse = synthesizedResponse;
      
      // Update progress to show stage 5 is complete (search process is 100% done)
      thinkingProcess.progress = 100;
      thinkingProcess.steps[thinkingProcess.steps.length - 1].status = 'complete';
      thinkingProcess.stageProgress = {
        currentStage: 'Complete',
        stageNumber: 5,
        totalStages: 5,
        percentComplete: 100
      };
      
      // Add source diversity
      thinkingProcess.sourceDiversity = {
        domains: [...new Set(allSearchResults.map(result => {
          try {
            return new URL(result.url).hostname;
          } catch (e) {
            return result.url;
          }
        }))],
        types: this.getSourceTypes(allSearchResults, queryDomain),
        perspectives: this.getSourcePerspectives(allSearchResults, queryDomain, queryType)
      };
      
      // Add confidence score
      thinkingProcess.confidenceScore = 0.9;
      
      console.log('Completed search process:', thinkingProcess);
      
      // Check if we're using the thinking model
      if (modelId === 'gemini-2.0-flash-thinking-exp') {
        // For the thinking model, we'll process the response to extract the thinking process
        const { text: processedText, thinkingProcess: updatedThinkingProcess } = 
          this.processThinkingResponse(formattedResponse, thinkingProcess);
        
        return {
          text: processedText,
          searchResults: allSearchResults,
          thinkingProcess: updatedThinkingProcess
        };
      }
      
      // Regular response for non-thinking models
      return {
        text: formattedResponse,
        searchResults: allSearchResults,
        thinkingProcess
      };
      
    } catch (error) {
      console.error('Error performing web search:', error);
      
      return {
        text: `Error performing web search: ${error}`,
        searchResults: [],
        thinkingProcess: {
          steps: [{
            type: 'error',
            content: `Error: ${error}`,
            status: 'error'
          }],
          reasoningPath: [{
            thought: 'Encountered an error during web search',
            action: 'Reporting error to user',
            outcome: `Error: ${error}`
          }],
          progress: 0,
          stageProgress: {
            currentStage: 'Error',
            stageNumber: 0,
            totalStages: 5,
            percentComplete: 0
          }
        }
      };
    }
  }
  
  /**
   * Optimize the initial search query based on domain and type
   */
  private optimizeSearchQuery(query: string, domain: string, queryType: string): string {
    // Optimize the search query based on the domain and query type
    let optimizedQuery = query.trim();
    
    // Domain-specific optimizations
    switch (domain.toLowerCase()) {
      case 'history':
        if (optimizedQuery.toLowerCase().includes('when')) {
          optimizedQuery = `${optimizedQuery} exact dates timeline`;
        } else if (optimizedQuery.toLowerCase().includes('who')) {
          optimizedQuery = `${optimizedQuery} historical figures biography`;
        } else if (optimizedQuery.toLowerCase().includes('where')) {
          optimizedQuery = `${optimizedQuery} historical location map`;
        } else {
          optimizedQuery = `${optimizedQuery} historical facts timeline`;
        }
        break;
        
      case 'technology':
        if (queryType === 'comparative') {
          optimizedQuery = `${optimizedQuery} comparison technical specifications`;
        } else if (optimizedQuery.toLowerCase().includes('how')) {
          optimizedQuery = `${optimizedQuery} tutorial step by step`;
        } else {
          optimizedQuery = `${optimizedQuery} latest information technical details`;
        }
        break;
        
      case 'science':
        optimizedQuery = `${optimizedQuery} scientific explanation research`;
        break;
        
      case 'health':
        optimizedQuery = `${optimizedQuery} medical information health guidelines`;
        break;
        
      case 'entertainment':
        if (optimizedQuery.toLowerCase().includes('release') || optimizedQuery.toLowerCase().includes('when')) {
          optimizedQuery = `${optimizedQuery} official release date`;
        } else {
          optimizedQuery = `${optimizedQuery} entertainment news official information`;
        }
        break;
        
      default:
        // General optimization
        if (queryType === 'factual') {
          optimizedQuery = `${optimizedQuery} facts information`;
        } else if (queryType === 'explanatory') {
          optimizedQuery = `${optimizedQuery} explanation guide`;
        } else if (queryType === 'comparative') {
          optimizedQuery = `${optimizedQuery} comparison differences`;
        }
    }
    
    return optimizedQuery;
  }

  /**
   * Determine source types based on search results and domain
   */
  private getSourceTypes(results: SearchResult[], domain: string): string[] {
    const types = new Set<string>(["article"]);
    
    // Add domain-specific source types
    switch (domain.toLowerCase()) {
      case 'history':
        types.add("reference");
        types.add("academic");
        break;
      case 'technology':
        types.add("review");
        types.add("technical");
        break;
      case 'science':
        types.add("research");
        types.add("academic");
        break;
      case 'health':
        types.add("medical");
        types.add("advisory");
        break;
      case 'entertainment':
        types.add("news");
        types.add("review");
        break;
      default:
        types.add("reference");
        types.add("news");
    }
    
    // Check URLs for specific source types
    results.forEach(result => {
      const url = result.url.toLowerCase();
      if (url.includes("wikipedia") || url.includes("britannica")) {
        types.add("encyclopedia");
      } else if (url.includes("youtube") || url.includes("vimeo")) {
        types.add("video");
      } else if (url.includes("scholar") || url.includes("research") || url.includes("edu")) {
        types.add("academic");
      } else if (url.includes("news") || url.includes("cnn") || url.includes("bbc")) {
        types.add("news");
      } else if (url.includes("gov")) {
        types.add("government");
      }
    });
    
    return Array.from(types);
  }

  /**
   * Determine source perspectives based on search results, domain, and query type
   */
  private getSourcePerspectives(results: SearchResult[], domain: string, queryType: string): string[] {
    const perspectives = new Set<string>(["informational"]);
    
    // Add query-type specific perspectives
    if (queryType === "comparative") {
      perspectives.add("comparative");
    } else if (queryType === "opinion") {
      perspectives.add("opinion");
      perspectives.add("subjective");
    }
    
    // Add domain-specific perspectives
    switch (domain.toLowerCase()) {
      case 'history':
        perspectives.add("historical");
        if (results.some(r => r.url.includes("different-perspectives") || r.snippet?.includes("different perspectives"))) {
          perspectives.add("multiple-viewpoints");
        }
        break;
      case 'politics':
        perspectives.add("political");
        perspectives.add("multiple-viewpoints");
        break;
      case 'science':
        perspectives.add("scientific");
        perspectives.add("evidence-based");
        break;
    }
    
    return Array.from(perspectives);
  }

  /**
   * Perform a web search using our custom search server
   */
  private async performWebSearch(query: string, domain: string): Promise<SearchResult[]> {
    try {
      const optimizedQuery = this.optimizeSearchQuery(query, domain, 'factual');
      console.log('Performing web search with optimized query:', optimizedQuery);
      
      // Determine if we should use enhanced search with web scraping
      const useEnhancedSearch = true; // Can be made configurable later
      
      if (useEnhancedSearch) {
        // Use the enhanced search endpoint that includes webpage content
        const response = await fetch('http://localhost:3001/api/enhanced-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: optimizedQuery,
            options: {
              fetchContent: true,
              maxContentResults: 3,
              depth: 'moderate'
            }
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Enhanced search API error:', errorData);
          throw new Error(`Search API error: ${response.status} ${errorData.error || ''}`);
        }
        
        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
          console.error('Invalid response from enhanced search API:', data);
          throw new Error('Invalid response format from search API');
        }
        
        // Format the search results, adding enhanced content if available
        const formattedResults = data.results.map((result: any) => {
          // Find if this result has enhanced content
          const enhancedMatch = data.enhancedResults?.find((er: any) => er.url === result.url);
          
          return {
            title: result.title,
            url: result.url,
            snippet: result.snippet || '',
            relevanceScore: result.relevanceScore || 0.5,
            favicon: result.favicon || `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`,
            timestamp: new Date().toISOString(),
            // Include enhanced content if available
            enhancedContent: enhancedMatch?.enhancedContent || null,
            source: new URL(result.url).hostname,
            clickable: true,
            target: '_blank'
          } as SearchResult;
        });
        
        return formattedResults;
      } else {
        // Use the regular search endpoint without webpage content
        const response = await fetch('http://localhost:3001/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: optimizedQuery }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Search API error:', errorData);
          throw new Error(`Search API error: ${response.status} ${errorData.error || ''}`);
        }
        
        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
          console.error('Invalid response from search API:', data);
          throw new Error('Invalid response format from search API');
        }
        
        const formattedResults = data.results.map((result: any) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet || '',
          relevanceScore: result.relevanceScore || 0.5,
          favicon: result.favicon || `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`,
          timestamp: new Date().toISOString(),
          source: new URL(result.url).hostname,
          clickable: true,
          target: '_blank'
        }));
        
        return formattedResults;
      }
    } catch (error) {
      console.error('Error performing web search:', error);
      
      // Return an empty array with a single error result instead of simulated results
      return [{
        title: "Search Error",
        url: "#",
        snippet: `We couldn't retrieve search results at this time. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.`,
        relevanceScore: 0,
        favicon: "",
        timestamp: new Date().toISOString(),
        source: "error",
        clickable: false,
        target: "_self"
      }];
    }
  }

  /**
   * Remove duplicate search results based on URL
   */
  private removeDuplicateResults(results: SearchResult[]): SearchResult[] {
    const uniqueUrls = new Set<string>();
    return results.filter(result => {
      if (result.url && !uniqueUrls.has(result.url)) {
        uniqueUrls.add(result.url);
        return true;
      }
      return false;
    });
  }
  
  /**
   * Get the model by ID
   */
  private getModelById(modelId: string): GenerativeModel {
    if (!this.models[modelId]) {
      console.warn(`Model ${modelId} not found, falling back to default`);
      // Fallback to a default model if the requested one isn't available
      return this.models[Object.keys(this.models)[0]];
    }
    return this.models[modelId];
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return [
      {
        id: 'gemini-2.0-pro-exp',
        name: 'Gemini 2.0 Pro',
        description: 'Most capable model for complex tasks',
        isDefault: true,
        capabilities: ['text', 'code', 'reasoning', 'webSearch'],
        maxInputTokens: 32768,
        supportsWebSearch: true,
        supportsThinking: true
      },
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: 'Fast model with vision capabilities',
        capabilities: ['text', 'code', 'vision'],
        maxInputTokens: 32768,
        supportsWebSearch: false,
        supportsThinking: true
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Previous generation pro model',
        capabilities: ['text', 'code', 'reasoning'],
        maxInputTokens: 16384,
        supportsWebSearch: true,
        supportsThinking: false
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Previous generation fast model',
        capabilities: ['text', 'code'],
        maxInputTokens: 16384,
        supportsWebSearch: true,
        supportsThinking: false
      }
    ];
  }

  /**
   * Extract thinking process and answer from a Gemini 2.0 Flash Thinking model response
   * The response format is typically "Thinking: <thinking process> Answer: <final answer>"
   */
  private extractThinkingAndAnswer(text: string): { thinking: string; answer: string } {
    // If the response doesn't follow the expected format, return the entire text as the answer
    if (!text.includes('Thinking:') || !text.includes('Answer:')) {
      return {
        thinking: '',
        answer: text
      };
    }
    
    try {
      // Extract thinking process (everything between "Thinking:" and "Answer:")
      const thinkingMatch = text.match(/Thinking:(.*?)Answer:/s);
      const thinking = thinkingMatch ? thinkingMatch[1].trim() : '';
      
      // Extract answer (everything after "Answer:")
      const answerMatch = text.match(/Answer:(.*?)$/s);
      const answer = answerMatch ? answerMatch[1].trim() : text;
      
      return { thinking, answer };
    } catch (error) {
      console.error('Error extracting thinking process:', error);
      return {
        thinking: '',
        answer: text
      };
    }
  }

  /**
   * Process the thinking model's response to populate the thinking process
   */
  private processThinkingResponse(text: string, thinkingProcess: ThinkingProcess): { text: string; thinkingProcess: ThinkingProcess } {
    const { thinking, answer } = this.extractThinkingAndAnswer(text);
    
    if (thinking) {
      // Add the thinking steps to the thinking process
      const thinkingSteps = thinking.split('\n')
        .filter(line => line.trim().length > 0)
        .map((step, index) => ({
          id: `thinking-${index}`,
          type: 'thinking' as const,
          content: step,
          timestamp: Date.now(),
          status: 'complete' as const
        }));
      
      // Add steps to the thinking process
      thinkingProcess.steps.push(...thinkingSteps);
      
      // Extract reasoning steps from the thinking process
      const reasoningSteps = thinking.split('\n')
        .filter(line => line.trim().length > 0)
        .map(step => ({
          thought: step,
        }));
      
      // Add reasoning steps to the thinking process
      thinkingProcess.reasoningPath.push(...reasoningSteps);
      
      // Update progress
      thinkingProcess.progress = 100;
    }
    
    return {
      text: answer,
      thinkingProcess
    };
  }
} 