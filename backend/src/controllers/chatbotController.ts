import { Request, Response } from 'express';
import prisma from '../config/database';

// Get all chatbots for current user
export const getChatbots = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const chatbots = await prisma.chatbot.findMany({
      where: { userId: req.user.id },
      include: {
        datasets: {
          select: { id: true, fileName: true, vectorStatus: true },
        },
        _count: {
          select: { conversations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ chatbots });
  } catch (error) {
    console.error('Get chatbots error:', error);
    res.status(500).json({ error: 'Failed to get chatbots' });
  }
};

// Get a specific chatbot
export const getChatbot = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;

    const chatbot = await prisma.chatbot.findFirst({
      where: { id, userId: req.user.id },
      include: {
        datasets: true,
        _count: {
          select: { conversations: true },
        },
      },
    });

    if (!chatbot) {
      res.status(404).json({ error: 'Chatbot not found' });
      return;
    }

    res.json({ chatbot });
  } catch (error) {
    console.error('Get chatbot error:', error);
    res.status(500).json({ error: 'Failed to get chatbot' });
  }
};

// Create a new chatbot
export const createChatbot = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, description, systemPrompt, starterPrompts, model } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const chatbot = await prisma.chatbot.create({
      data: {
        userId: req.user.id,
        name,
        description: description || null,
        systemPrompt: systemPrompt || 'You are a helpful assistant.',
        starterPrompts: starterPrompts ? JSON.stringify(starterPrompts) : null,
        model: model || 'gpt-3.5-turbo',
      },
    });

    res.status(201).json({ chatbot });
  } catch (error) {
    console.error('Create chatbot error:', error);
    res.status(500).json({ error: 'Failed to create chatbot' });
  }
};

// Update a chatbot
export const updateChatbot = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;
    const { name, description, systemPrompt, starterPrompts, model } = req.body;

    const chatbot = await prisma.chatbot.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!chatbot) {
      res.status(404).json({ error: 'Chatbot not found' });
      return;
    }

    const updated = await prisma.chatbot.update({
      where: { id },
      data: {
        name: name || chatbot.name,
        description: description !== undefined ? description : chatbot.description,
        systemPrompt: systemPrompt || chatbot.systemPrompt,
        starterPrompts: starterPrompts !== undefined ? JSON.stringify(starterPrompts) : chatbot.starterPrompts,
        model: model || chatbot.model,
      },
    });

    res.json({ chatbot: updated });
  } catch (error) {
    console.error('Update chatbot error:', error);
    res.status(500).json({ error: 'Failed to update chatbot' });
  }
};

// Delete a chatbot
export const deleteChatbot = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;

    const chatbot = await prisma.chatbot.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!chatbot) {
      res.status(404).json({ error: 'Chatbot not found' });
      return;
    }

    await prisma.chatbot.delete({ where: { id } });
    res.json({ message: 'Chatbot deleted' });
  } catch (error) {
    console.error('Delete chatbot error:', error);
    res.status(500).json({ error: 'Failed to delete chatbot' });
  }
};
