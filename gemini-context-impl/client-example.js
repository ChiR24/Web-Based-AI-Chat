/**
 * Client-side integration example for the Enhanced Gemini Context API
 * This file demonstrates how to integrate the API with a frontend application
 */

class GeminiClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.sessionId = null;
    this.history = [];
  }

  /**
   * Initialize a new session
   */
  async initSession(customSessionId = null) {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customSessionId ? { sessionId: customSessionId } : {})
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const data = await response.json();
      this.sessionId = data.sessionId;
      console.log(`Session initialized: ${this.sessionId}`);
      return this.sessionId;
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  /**
   * Send a message to Gemini
   */
  async sendMessage(message, options = {}) {
    // Initialize session if needed
    if (!this.sessionId) {
      await this.initSession();
    }

    try {
      const response = await fetch(`${this.baseUrl}/sessions/${this.sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          options: {
            enableSearch: options.enableSearch ?? true,
            enableThinking: options.enableThinking ?? true,
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      
      // Add to local history
      this.history.push({
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
      
      this.history.push({
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
        thinking: data.thinking,
        searchResults: data.searchResults
      });
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Perform a direct search query
   */
  async search(query) {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          sessionId: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to perform search: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getHistory() {
    if (!this.sessionId) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/sessions/${this.sessionId}/history`);
      
      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.status}`);
      }
      
      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error fetching history:', error);
      // Return local history as fallback
      return this.history;
    }
  }

  /**
   * Clear the current session
   */
  async clearSession() {
    if (!this.sessionId) {
      return true;
    }

    try {
      const response = await fetch(`${this.baseUrl}/sessions/${this.sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear session: ${response.status}`);
      }
      
      this.sessionId = null;
      this.history = [];
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  }

  /**
   * Get cache metrics
   */
  async getCacheMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/metrics/cache`);
      
      if (!response.ok) {
        throw new Error(`Failed to get cache metrics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cache metrics:', error);
      throw error;
    }
  }

  /**
   * Get analysis metrics
   */
  async getAnalysisMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/metrics/analysis`);
      
      if (!response.ok) {
        throw new Error(`Failed to get analysis metrics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analysis metrics:', error);
      throw error;
    }
  }
}

// Example usage
async function demonstrateGeminiClient() {
  const client = new GeminiClient();
  
  // Initialize a session
  await client.initSession();
  
  // Regular conversation
  console.log('Sending regular message...');
  const response1 = await client.sendMessage(
    "Hello, I'm interested in learning about artificial intelligence.",
    { enableSearch: false }
  );
  console.log('Response:', response1.text);
  
  // A follow-up that relies on context memory
  console.log('\nSending follow-up message...');
  const response2 = await client.sendMessage(
    "What are some good resources for beginners?",
    { enableSearch: false }
  );
  console.log('Response:', response2.text);
  
  // A search query that will use multi-pass analysis
  console.log('\nSending search query...');
  const response3 = await client.sendMessage(
    "When will One Punch Man Season 3 be released?",
    { enableSearch: true }
  );
  console.log('Response:', response3.text);
  
  // View thinking process
  if (response3.thinking) {
    console.log('\nThinking Process:');
    console.log(JSON.stringify(response3.thinking, null, 2));
  }
  
  // Get cache metrics
  console.log('\nCache Metrics:');
  const cacheMetrics = await client.getCacheMetrics();
  console.log(JSON.stringify(cacheMetrics, null, 2));
}

// If running in Node.js, demonstrate the client
if (typeof window === 'undefined') {
  demonstrateGeminiClient().catch(console.error);
}

// Export for browser use
if (typeof window !== 'undefined') {
  window.GeminiClient = GeminiClient;
} 