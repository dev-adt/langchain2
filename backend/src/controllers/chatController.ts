import { Request, Response } from 'express';
import prisma from '../config/database';
import { streamChat } from '../services/langchainService';

// Get all conversations for current user
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.id },
      include: {
        chatbot: {
          select: { id: true, name: true, avatar: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, role: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        chatbot: {
          select: { id: true, name: true, systemPrompt: true, model: true },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Send a message and get AI response (SSE streaming)
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { message, conversationId, chatbotId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    let conversation;

    if (conversationId) {
      // Existing conversation
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: req.user.id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
          chatbot: true,
        },
      });

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
    } else {
      // Create new conversation
      const title = message.substring(0, 100);
      conversation = await prisma.conversation.create({
        data: {
          userId: req.user.id,
          chatbotId: chatbotId || null,
          title,
        },
        include: {
          messages: true,
          chatbot: true,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Conversation-Id': conversation.id,
    });

    // Send conversation ID first
    res.write(`data: ${JSON.stringify({ type: 'conversation_id', id: conversation.id })}\n\n`);

    // Get chat history for context
    const history = conversation.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Add current message to history
    history.push({ role: 'user', content: message });

    // Get system prompt
    const systemPrompt = conversation.chatbot?.systemPrompt || 'You are a helpful assistant. Respond in the same language as the user.';
    const model = conversation.chatbot?.model || 'gpt-3.5-turbo';

    let fullResponse = '';

    // Stream AI response
    await streamChat({
      messages: history,
      systemPrompt,
      model,
      chatbotId: conversation.chatbot?.id,
      onToken: (token: string) => {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
      },
      onComplete: async () => {
        // Save assistant message
        await prisma.message.create({
          data: {
            conversationId: conversation!.id,
            role: 'assistant',
            content: fullResponse,
          },
        });

        // Update conversation title if it's the first message
        if (conversation!.messages.length === 0) {
          await prisma.conversation.update({
            where: { id: conversation!.id },
            data: {
              title: message.substring(0, 100),
              updatedAt: new Date(),
            },
          });
        } else {
          await prisma.conversation.update({
            where: { id: conversation!.id },
            data: { updatedAt: new Date() },
          });
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      },
      onError: (error: Error) => {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
};

// Delete a conversation
export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    await prisma.conversation.delete({ where: { id } });
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// Update conversation title
export const updateConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;
    const { title } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { title },
    });

    res.json({ conversation: updated });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
};
