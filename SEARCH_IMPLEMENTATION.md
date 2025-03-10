# Implementing Real-Time Web Search

This document provides guidance on implementing real web search functionality in the Gemini Chat application, replacing the current simulated search results.

## Current Status

The application currently uses **simulated search results** for demonstration purposes. When you use web search:

1. The application generates plausible-looking search results
2. These results are not from actual web searches
3. The search results are marked with `[DEMO]` in the titles

## Implementation Steps

To implement real web search functionality, follow these steps:

### 1. Choose a Search API Provider

Select a search API provider. Some options include:

* **Google Custom Search API** (recommended)
* Bing Search API
* DuckDuckGo API
* SerpAPI
* Brave Search API

### 2. Set Up API Access

For Google Custom Search API (most common choice):

1. Create a Google Cloud Platform account at https://cloud.google.com/
2. Create a new project
3. Enable the "Custom Search API" for your project
4. Generate an API key
5. Create a Custom Search Engine at https://programmablesearchengine.google.com/
6. Get your Search Engine ID (cx)

### 3. Configure Environment Variables

Add the following to your `.env` file:

```
VITE_GOOGLE_SEARCH_API_KEY=your_api_key_here
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 4. Update the Code

Modify the `performWebSearch` method in `src/features/gemini/services/GeminiService.ts`:

1. Uncomment the real search implementation section
2. Remove or comment out the simulated results section
3. Update the API response parsing if needed

### 5. Testing

Test the application with real web search:

1. Make sure your API keys are valid and have sufficient quota
2. Test various query types
3. Verify that search results are properly displayed
4. Check that citation links work correctly

## API Usage and Limits

Be aware of API usage limits:

* Google Custom Search API has a free tier of 100 queries per day
* Beyond that, you will be charged per 1,000 queries
* Consider implementing caching to reduce API calls for repeated searches

## Alternative Approaches

If direct API integration is not feasible, consider:

1. **Server-Side Proxy**: Implement a small backend service that handles search API calls and credentials
2. **Scraping** (be careful with terms of service): Implement a scraper that extracts search results from public search pages
3. **Hybrid Approach**: Use real search for important queries, simulated results as fallback

## Documentation References

* [Google Custom Search JSON API Documentation](https://developers.google.com/custom-search/v1/overview)
* [Bing Search API Documentation](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)

## Implementation Timeline

Here's a suggested timeline for adding real search:

1. **Week 1**: Set up API access and credentials
2. **Week 2**: Implement basic search functionality
3. **Week 3**: Improve result parsing and display
4. **Week 4**: Add caching and error handling
5. **Week 5**: Test and refine

## Cost Considerations

Be mindful of costs when implementing real search:

* Google Custom Search API: ~$5 per 1,000 queries after free tier
* Bing Web Search API: ~$7 per 1,000 queries
* Consider implementing rate limiting to prevent unexpected costs 