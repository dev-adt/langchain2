import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { config } from './config';
import passport from 'passport';
import { configurePassport } from './config/passport';

dotenv.config();

// Initialize passport
configurePassport();

const app = express();
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
});

export default app;
