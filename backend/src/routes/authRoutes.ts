import { Router } from 'express';
import { register, login, getProfile, googleCallback } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

// Google OAuth routes (placeholder - requires passport setup)
router.get('/google', (req, res) => {
  // In production, this would use passport.authenticate('google', { scope: ['profile', 'email'] })
  res.json({ message: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
});

router.get('/google/callback', googleCallback);

export default router;
