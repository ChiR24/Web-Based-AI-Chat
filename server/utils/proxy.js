/**
 * Proxy rotation utility
 * Provides rotating proxy support for web scraping to avoid IP blocks
 */

// This is a simplified example. In production, you would use a real proxy service or list.
const proxyList = [
  // Add your proxies here in the format:
  // { host: 'proxy1.example.com', port: 8080, protocol: 'http' }
  // { host: 'proxy2.example.com', port: 8080, protocol: 'http' }
];

// Track proxy usage for load balancing
const proxyUsage = {};

/**
 * Get a random proxy from the list
 */
function getRandomProxy() {
  if (proxyList.length === 0) {
    console.log('[Proxy] No proxies available, proceeding without proxy');
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  const proxy = proxyList[randomIndex];
  
  // Update usage count
  proxyUsage[randomIndex] = (proxyUsage[randomIndex] || 0) + 1;
  
  console.log(`[Proxy] Selected proxy: ${proxy.host}:${proxy.port}`);
  return proxy;
}

/**
 * Get the least used proxy from the list
 */
function getLeastUsedProxy() {
  if (proxyList.length === 0) {
    console.log('[Proxy] No proxies available, proceeding without proxy');
    return null;
  }
  
  // Find the least used proxy
  let leastUsedIndex = 0;
  let leastUsedCount = proxyUsage[0] || 0;
  
  for (let i = 1; i < proxyList.length; i++) {
    const usageCount = proxyUsage[i] || 0;
    if (usageCount < leastUsedCount) {
      leastUsedIndex = i;
      leastUsedCount = usageCount;
    }
  }
  
  const proxy = proxyList[leastUsedIndex];
  
  // Update usage count
  proxyUsage[leastUsedIndex] = leastUsedCount + 1;
  
  console.log(`[Proxy] Selected least used proxy: ${proxy.host}:${proxy.port}`);
  return proxy;
}

/**
 * Get an Axios configuration object for the proxy
 */
function getProxyConfig(proxy = null) {
  if (!proxy) {
    proxy = getRandomProxy();
    if (!proxy) return {};
  }
  
  return {
    proxy: {
      host: proxy.host,
      port: proxy.port,
      protocol: proxy.protocol
    }
  };
}

module.exports = {
  getRandomProxy,
  getLeastUsedProxy,
  getProxyConfig,
  proxyList
}; 