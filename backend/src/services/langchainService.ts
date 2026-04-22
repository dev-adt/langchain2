import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { config } from '../config';
import { buildRAGContext } from './vectorStoreService';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface StreamChatOptions {
  messages: ChatMessage[];
  systemPrompt: string;
  model: string;
  chatbotId?: string;
  onToken: (token: string) => void;
  onComplete: () => Promise<void>;
  onError: (error: Error) => void;
}

export const streamChat = async (options: StreamChatOptions): Promise<void> => {
  const { messages, systemPrompt, model, chatbotId, onToken, onComplete, onError } = options;

  try {
    const llm = new ChatOpenAI({
      openAIApiKey: config.openaiApiKey,
      modelName: model,
      temperature: 0.7,
      streaming: true,
    });

    const lastMessage = messages[messages.length - 1];
    let effectiveSystemPrompt = systemPrompt;

    // If chatbot has datasets, build RAG context
    if (chatbotId && lastMessage && lastMessage.role === 'user') {
      const context = await buildRAGContext(chatbotId, lastMessage.content);
      if (context) {
        effectiveSystemPrompt += context;
      }
    }

    // Build message array for Langchain
    const langchainMessages = [
      new SystemMessage(effectiveSystemPrompt),
    ];

    for (const msg of messages) {
      if (msg.role === 'user') {
        langchainMessages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        langchainMessages.push(new AIMessage(msg.content));
      }
    }

    // Stream response
    const stream = await llm.stream(langchainMessages);

    for await (const chunk of stream) {
      const content = chunk.content;
      if (typeof content === 'string' && content) {
        onToken(content);
      }
    }

    await onComplete();
  } catch (error) {
    onError(error as Error);
  }
};

// Non-streaming chat for simple responses
export const chat = async (
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = 'gpt-3.5-turbo'
): Promise<string> => {
  const llm = new ChatOpenAI({
    openAIApiKey: config.openaiApiKey,
    modelName: model,
    temperature: 0.7,
  });

  const langchainMessages = [
    new SystemMessage(systemPrompt),
    ...messages.map((m) =>
      m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
    ),
  ];

  const response = await llm.invoke(langchainMessages);
  return typeof response.content === 'string' ? response.content : '';
};
