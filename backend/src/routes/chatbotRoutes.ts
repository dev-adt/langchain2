import { Router } from 'express';
import {
  getChatbots,
  getChatbot,
  createChatbot,
  updateChatbot,
  deleteChatbot,
} from '../controllers/chatbotController';
import { uploadFile, getDatasetStatus, deleteDataset } from '../controllers/fileController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();

// All chatbot routes require authentication
router.use(authMiddleware);

// Chatbot CRUD
router.get('/', getChatbots);
router.get('/:id', getChatbot);
router.post('/', createChatbot);
router.put('/:id', updateChatbot);
router.delete('/:id', deleteChatbot);

// Dataset management
router.post('/:chatbotId/upload', upload.single('file'), uploadFile);
router.get('/dataset/:datasetId/status', getDatasetStatus);
router.delete('/dataset/:datasetId', deleteDataset);

export default router;
