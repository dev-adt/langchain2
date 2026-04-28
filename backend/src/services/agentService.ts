import { ChatOpenAI } from '@langchain/openai';
import { Tool } from '@langchain/core/tools';
import { DynamicTool } from '@langchain/core/tools';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { config } from '../config';
import { searchVectors } from './vectorStoreService';

/**
 * Agent Service
 * Implements a reasoning agent using LangGraph that can use tools
 */

interface AgentChatOptions {
  messages: any[];
  systemPrompt: string;
  model: string;
  chatbotId?: string;
  onToken: (token: string) => void;
  onComplete: () => Promise<void>;
  onError: (error: Error) => void;
}

export const streamAgentChat = async (options: AgentChatOptions): Promise<void> => {
  const { messages, systemPrompt, model, chatbotId, onToken, onComplete, onError } = options;

  try {
    // 1. Initialize LLM
    const llm = new ChatOpenAI({
      openAIApiKey: config.openaiApiKey,
      modelName: model,
      temperature: 0, // Agents work best with low temperature
      streaming: true,
    });

    // 2. Define Tools
    const tools: Tool[] = [];

    // Tool: Vector Search (RAG)
    if (chatbotId) {
      const vectorSearchTool = new DynamicTool({
        name: 'search_documents',
        description: 'Tìm kiếm thông tin từ các tài liệu đã tải lên của người dùng. Hãy sử dụng công cụ này khi câu hỏi liên quan đến kiến thức chuyên môn hoặc dữ liệu riêng tư.',
        func: async (query: string) => {
          const results = await searchVectors(chatbotId, query, 5);
          if (results.length === 0) return 'Không tìm thấy thông tin liên quan trong tài liệu.';
          return results.map((r, i) => `[Tài liệu ${i+1}]: ${r.content}`).join('\n\n');
        },
      });
      tools.push(vectorSearchTool);
    }

    // Tool: Web Search (Tavily)
    if (config.tavilyApiKey) {
      const webSearchTool = new TavilySearchResults({
        apiKey: config.tavilyApiKey,
        maxResults: 3,
      });
      tools.push(webSearchTool);
    }


    // Tool: Calculator
    const calculatorTool = new DynamicTool({
      name: 'calculator',
      description: 'Thực hiện các phép tính toán số học phức tạp. Input phải là biểu thức toán học.',
      func: async (input: string) => {
        try {
          // Note: In production, use a safer math library instead of eval
          const result = eval(input.replace(/[^-()\d/*+.]/g, ''));
          return `Kết quả: ${result}`;
        } catch (e) {
          return 'Không thể tính toán biểu thức này.';
        }
      },
    });
    tools.push(calculatorTool);

    // 3. Create Agent
    // Using a simple memory saver for local state
    const checkpointer = new MemorySaver();
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: checkpointer,
    });

    // 4. Format messages for LangGraph
    const lastMessage = messages[messages.length - 1].content;
    // We only send the last message to the agent for "reasoning" but pass history in some way if needed
    // For simplicity in this demo, we'll just handle the current turn
    
    const systemMsg = new SystemMessage(systemPrompt);
    const input = {
      messages: [systemMsg, new HumanMessage(lastMessage)],
    };

    // 5. Stream Agent Steps
    // Note: LangGraph streaming is different from pure LLM streaming
    // We want to stream the final answer tokens
    const eventStream = await agent.streamEvents(input, {
      version: 'v2',
      configurable: { thread_id: chatbotId || 'default' },
    });

    for await (const event of eventStream) {
      if (event.event === 'on_chat_model_stream' && event.metadata?.langgraph_node === 'agent') {
        const content = event.data.chunk.content;
        if (content) {
          onToken(content);
        }
      }
    }

    await onComplete();
  } catch (error) {
    console.error('Agent chat error:', error);
    onError(error as Error);
  }
};
