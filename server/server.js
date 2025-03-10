/**
 * Gemini Search Server
 * Main server file
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes/api');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiter configuration - 20 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 20, // Number of requests
  duration: 60, // Per 60 seconds
});

// Apply rate limiting middleware
const rateLimiterMiddleware = (req, res, next) => {
  // Skip rate limiting for health checks
  if (req.path === '/api/health') {
    return next();
  }
  
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ error: 'Too many requests, please try again later' });
    });
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(rateLimiterMiddleware); // Apply rate limiting

// API Routes
app.use('/api', apiRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Gemini Search Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
}); 