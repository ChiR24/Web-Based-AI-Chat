const NodeCache = require('node-cache');
require('dotenv').config();

/**
 * Hierarchical Context Caching System for Gemini
 * Implements the caching strategy from the first solution
 */
class ContextCache {
  constructor() {
    // Main cache for full context windows
    this.fullContextCache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL) || 3600, // Default: 1 hour
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false // Store references for better performance
    });

    // Semantic cache for chunked content
    this.semanticCache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL) * 2, // Keep semantic chunks longer
      checkperiod: 600
    });

    // Metadata about cache sessions
    this.sessionMetadata = new Map();
  }

  /**
   * Store a full context in the cache
   * @param {string} sessionId - Unique session identifier
   * @param {object} context - Complete context object
   * @param {number} ttl - Time to live in seconds (optional)
   */
  storeFullContext(sessionId, context, ttl = null) {
    // Check if context is too large
    const estimatedTokens = this._estimateTokenCount(JSON.stringify(context));
    const maxTokens = parseInt(process.env.MAX_CONTEXT_TOKENS) || 32768;
    
    if (estimatedTokens <= maxTokens) {
      // Store in full context cache
      this.fullContextCache.set(
        `session:${sessionId}:full`,
        context,
        ttl || undefined
      );
      
      // Update metadata
      this._updateSessionMetadata(sessionId, {
        lastUpdated: Date.now(),
        tokenCount: estimatedTokens,
        storageType: 'full'
      });
      
      return true;
    } else {
      // Context is too large, store in semantic cache as chunks
      return this._storeAsChunks(sessionId, context, ttl);
    }
  }

  /**
   * Retrieve context for a session
   * @param {string} sessionId - Unique session identifier
   * @returns {object|null} - The context object or null if not found
   */
  getContext(sessionId) {
    // Try full context first
    const fullKey = `session:${sessionId}:full`;
    const fullContext = this.fullContextCache.get(fullKey);
    
    if (fullContext) {
      return fullContext;
    }
    
    // Fall back to reconstructing from chunks
    return this._reconstructFromChunks(sessionId);
  }

  /**
   * Store large contexts as semantic chunks
   * @private
   */
  _storeAsChunks(sessionId, context, ttl) {
    // Implementation for chunking large contexts
    // In a real implementation, this would use semantic chunking
    const chunks = this._createSemanticChunks(context);
    
    // Store each chunk
    chunks.forEach((chunk, index) => {
      this.semanticCache.set(
        `session:${sessionId}:chunk:${index}`,
        chunk,
        ttl || undefined
      );
    });
    
    // Store chunk metadata
    this.semanticCache.set(
      `session:${sessionId}:chunks:meta`,
      {
        count: chunks.length,
        createdAt: Date.now()
      },
      ttl || undefined
    );
    
    // Update session metadata
    this._updateSessionMetadata(sessionId, {
      lastUpdated: Date.now(),
      chunkCount: chunks.length,
      storageType: 'chunked'
    });
    
    return true;
  }

  /**
   * Reconstruct context from chunks
   * @private
   */
  _reconstructFromChunks(sessionId) {
    // Get chunk metadata
    const metaKey = `session:${sessionId}:chunks:meta`;
    const meta = this.semanticCache.get(metaKey);
    
    if (!meta) return null;
    
    // Retrieve all chunks
    const chunks = [];
    for (let i = 0; i < meta.count; i++) {
      const chunkKey = `session:${sessionId}:chunk:${i}`;
      const chunk = this.semanticCache.get(chunkKey);
      if (chunk) {
        chunks.push(chunk);
      }
    }
    
    // Reconstruct the full context
    if (chunks.length === meta.count) {
      return this._mergeChunks(chunks);
    }
    
    // Some chunks are missing
    return this._handlePartialChunks(chunks);
  }

  /**
   * Create semantic chunks from a large context
   * @private
   */
  _createSemanticChunks(context) {
    // Simple chunking for demonstration
    // A real implementation would use semantic chunking
    
    // Convert context to string if it's an object
    const contextStr = typeof context === 'object' ? 
      JSON.stringify(context) : context;
    
    // Split by conversation turns for simplicity
    // In a real implementation, use more sophisticated chunking
    if (context.messages && Array.isArray(context.messages)) {
      // Chunk by conversation turns
      const chunks = [];
      let currentChunk = { messages: [] };
      let currentSize = 0;
      const targetChunkSize = 8000; // Approximate token count
      
      for (const message of context.messages) {
        const messageSize = this._estimateTokenCount(JSON.stringify(message));
        
        if (currentSize + messageSize > targetChunkSize && currentChunk.messages.length > 0) {
          // Current chunk is full, start a new one
          chunks.push(currentChunk);
          currentChunk = { messages: [] };
          currentSize = 0;
        }
        
        currentChunk.messages.push(message);
        currentSize += messageSize;
      }
      
      // Add the last chunk if it has any messages
      if (currentChunk.messages.length > 0) {
        chunks.push(currentChunk);
      }
      
      return chunks;
    }
    
    // Fallback chunking for non-message contexts
    const maxChunkSize = 8000; // Approximate token count
    const chunks = [];
    
    for (let i = 0; i < contextStr.length; i += maxChunkSize) {
      chunks.push(contextStr.slice(i, i + maxChunkSize));
    }
    
    return chunks;
  }

  /**
   * Merge chunks back into a complete context
   * @private
   */
  _mergeChunks(chunks) {
    // If chunks are message objects
    if (chunks[0] && chunks[0].messages) {
      // Merge message arrays
      const mergedContext = {
        messages: []
      };
      
      for (const chunk of chunks) {
        if (chunk.messages) {
          mergedContext.messages.push(...chunk.messages);
        }
      }
      
      return mergedContext;
    }
    
    // If chunks are strings
    return chunks.join('');
  }

  /**
   * Handle cases where only some chunks are available
   * @private
   */
  _handlePartialChunks(chunks) {
    // In a real implementation, this would use more sophisticated
    // techniques to reconstruct context from partial chunks
    // For demonstration, we'll just return what we have
    
    // If chunks are message objects
    if (chunks[0] && chunks[0].messages) {
      // Merge message arrays
      const mergedContext = {
        messages: [],
        isPartial: true
      };
      
      for (const chunk of chunks) {
        if (chunk.messages) {
          mergedContext.messages.push(...chunk.messages);
        }
      }
      
      return mergedContext;
    }
    
    // If chunks are strings
    return { 
      content: chunks.join(''), 
      isPartial: true 
    };
  }

  /**
   * Estimate token count for a string
   * This is a simplified estimation (1 token ≈ 4 characters)
   * @private
   */
  _estimateTokenCount(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Update session metadata
   * @private
   */
  _updateSessionMetadata(sessionId, metadata) {
    const existing = this.sessionMetadata.get(sessionId) || {};
    this.sessionMetadata.set(sessionId, {
      ...existing,
      ...metadata
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      fullCache: this.fullContextCache.getStats(),
      semanticCache: this.semanticCache.getStats(),
      sessions: this.sessionMetadata.size
    };
  }

  /**
   * Clear a specific session from cache
   */
  clearSession(sessionId) {
    // Clear full context
    this.fullContextCache.del(`session:${sessionId}:full`);
    
    // Clear chunk metadata
    const metaKey = `session:${sessionId}:chunks:meta`;
    const meta = this.semanticCache.get(metaKey);
    
    if (meta) {
      // Clear all chunks
      for (let i = 0; i < meta.count; i++) {
        this.semanticCache.del(`session:${sessionId}:chunk:${i}`);
      }
      // Clear metadata
      this.semanticCache.del(metaKey);
    }
    
    // Clear session metadata
    this.sessionMetadata.delete(sessionId);
    
    return true;
  }
}

module.exports = new ContextCache(); 