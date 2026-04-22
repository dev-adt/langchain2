import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  updateConversation,
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getMessages);
router.post('/send', sendMessage);
router.put('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversation);

export default router;
