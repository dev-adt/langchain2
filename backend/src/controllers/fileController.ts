import { Request, Response } from 'express';
import prisma from '../config/database';
import { processDocument } from '../services/documentService';

// Upload file for a chatbot's dataset
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const chatbotId = req.params.chatbotId as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Verify chatbot belongs to user
    const chatbot = await prisma.chatbot.findFirst({
      where: { id: chatbotId, userId: req.user.id },
    });

    if (!chatbot) {
      res.status(404).json({ error: 'Chatbot not found' });
      return;
    }

    // Create dataset record
    const dataset = await prisma.dataset.create({
      data: {
        chatbotId: chatbotId,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        vectorStatus: 'processing',
      },
    });

    // Process document asynchronously (parse, chunk, embed)
    processDocument(dataset.id, file.path, chatbotId)
      .then(async () => {
        await prisma.dataset.update({
          where: { id: dataset.id },
          data: { vectorStatus: 'completed' },
        });
      })
      .catch(async (error) => {
        console.error('Document processing error:', error);
        await prisma.dataset.update({
          where: { id: dataset.id },
          data: { vectorStatus: 'failed' },
        });
      });

    res.status(201).json({
      dataset: {
        id: dataset.id,
        fileName: dataset.fileName,
        fileSize: dataset.fileSize,
        vectorStatus: dataset.vectorStatus,
      },
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// Get dataset status
export const getDatasetStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const datasetId = req.params.datasetId as string;

    const dataset = await prisma.dataset.findFirst({
      where: { id: datasetId },
    });

    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    // Verify ownership via chatbot
    const chatbot = await prisma.chatbot.findFirst({
      where: { id: dataset.chatbotId, userId: req.user.id },
    });

    if (!chatbot) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    res.json({
      dataset: {
        id: dataset.id,
        fileName: dataset.fileName,
        fileSize: dataset.fileSize,
        vectorStatus: dataset.vectorStatus,
        createdAt: dataset.createdAt,
      },
    });
  } catch (error) {
    console.error('Get dataset status error:', error);
    res.status(500).json({ error: 'Failed to get dataset status' });
  }
};

// Delete a dataset
export const deleteDataset = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const datasetId = req.params.datasetId as string;

    const dataset = await prisma.dataset.findFirst({
      where: { id: datasetId },
    });

    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    // Verify ownership via chatbot
    const chatbot = await prisma.chatbot.findFirst({
      where: { id: dataset.chatbotId, userId: req.user.id },
    });

    if (!chatbot) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    await prisma.dataset.delete({ where: { id: datasetId } });
    res.json({ message: 'Dataset deleted' });
  } catch (error) {
    console.error('Delete dataset error:', error);
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
};
