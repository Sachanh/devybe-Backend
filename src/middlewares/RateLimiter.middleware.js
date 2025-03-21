// const { RateLimiterMemory } = require('rate-limiter-flexible');

// // Create a rate limiter instance
// const rateLimiter = new RateLimiterMemory({
//   points: 10,          // 10 requests
//   duration: 60,        // Per 60 seconds (1 minute)
// });

// // Middleware function
// const rateLimitMiddleware = (req, res, next) => {
//   rateLimiter.consume(req.ip)
//     .then(() => {
//       next(); // Allow the request
//     })
//     .catch(() => {
//       res.status(429).json({
//         status: 429,
//         message: 'Too many requests, please slow down.',
//       });
//     });
// };

// module.exports = rateLimitMiddleware;
