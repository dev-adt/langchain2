import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Get public chatbot info (no auth required)
 */
export const getPublicChatbot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const chatbot = await prisma.chatbot.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        starterPrompts: true,
        isPublic: true,
      },
    });

    if (!chatbot || !chatbot.isPublic) {
      res.status(404).json({ error: 'Chatbot not found or not public' });
      return;
    }

    res.json({ chatbot });
  } catch (error) {
    console.error('Get public chatbot error:', error);
    res.status(500).json({ error: 'Failed to get public chatbot' });
  }
};
