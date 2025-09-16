import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { tenantResolver } from './middleware/tenantResolver';
import { authRoutes } from './routes/auth';
import { publicRoutes } from './routes/public';
import { adminRoutes } from './routes/admin';
import publicViewsRoutes from './routes/public-views';
import { swaggerSpec } from './utils/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes by default
   max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs by default
   message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(
   helmet({
      contentSecurityPolicy: {
         directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
            scriptSrc: [
               "'self'",
               "'unsafe-inline'",
               "'unsafe-eval'",
               'http://localhost:5173',
            ],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'http://localhost:5173'],
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
         },
      },
   })
);
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
   logger.info(
      {
         method: req.method,
         url: req.url,
         ip: req.ip,
      },
      'Incoming request'
   );
   next();
});

// Health check
app.get('/healthz', (req, res) => {
   res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
   });
});

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public views (hotel pages) - must be before API routes
app.use('/', publicViewsRoutes);

// Tenant resolver middleware
app.use('/api/v1', tenantResolver);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', publicRoutes);
app.use('/api/v1', adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
   res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
   logger.info(`Server running on port ${PORT}`);
   logger.info(`API documentation available at http://localhost:${PORT}/docs`);
});

export default app;
