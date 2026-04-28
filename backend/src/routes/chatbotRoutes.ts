import { Router } from 'express';
import {
  getChatbots,
  getChatbot,
  createChatbot,
  updateChatbot,
  deleteChatbot,
  uploadAvatar,
} from '../controllers/chatbotController';
import { uploadFile, getDatasetStatus, deleteDataset } from '../controllers/fileController';
import { getPublicChatbot } from '../controllers/publicController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload, avatarUpload } from '../middlewares/upload';

const router = Router();

// Public routes (no auth required)
router.get('/public/:id', getPublicChatbot);

// All other chatbot routes require authentication
router.use(authMiddleware);

// Chatbot CRUD
router.get('/', getChatbots);
router.get('/:id', getChatbot);
router.post('/', createChatbot);
router.put('/:id', updateChatbot);
router.delete('/:id', deleteChatbot);

// Avatar upload
router.post('/:id/avatar', avatarUpload.single('avatar'), uploadAvatar);

// Dataset management
router.post('/:chatbotId/upload', upload.single('file'), uploadFile);

router.get('/dataset/:datasetId/status', getDatasetStatus);
router.delete('/dataset/:datasetId', deleteDataset);

export default router;
