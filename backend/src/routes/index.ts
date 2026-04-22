import { Router } from 'express';
import authRoutes from './authRoutes';
import chatRoutes from './chatRoutes';
import chatbotRoutes from './chatbotRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/chatbots', chatbotRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
