import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { config } from '../config';
import prisma from '../config/database';

/**
 * Vector Store Service
 * Uses MemoryVectorStore as a high-performance local cache for embeddings
 */

// In-memory cache for vector stores to avoid re-creating embeddings for every message
const vectorStoreCache: Record<string, MemoryVectorStore> = {};

export interface VectorSearchResult {
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * Get or create vector store for a chatbot
 */
const getVectorStore = async (chatbotId: string): Promise<MemoryVectorStore | null> => {
  // Return from cache if exists
  if (vectorStoreCache[chatbotId]) {
    return vectorStoreCache[chatbotId];
  }

  // Get all chunks for this chatbot from DB
  const chunks = await prisma.documentChunk.findMany({
    where: { chatbotId },
    select: { content: true, id: true, datasetId: true },
  });

  if (chunks.length === 0) return null;

  console.log(`Building vector store for chatbot ${chatbotId} with ${chunks.length} chunks...`);

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: config.openaiApiKey,
    modelName: 'text-embedding-3-small',
  });

  const documents = chunks.map(
    (c) =>
      new Document({
        pageContent: c.content,
        metadata: { id: c.id, datasetId: c.datasetId },
      })
  );

  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
  
  // Cache it
  vectorStoreCache[chatbotId] = vectorStore;
  
  return vectorStore;
};

/**
 * Search for relevant documents using vector similarity and optional re-ranking
 */
export const searchVectors = async (
  chatbotId: string,
  query: string,
  topK: number = 4
): Promise<VectorSearchResult[]> => {
  try {
    const vectorStore = await getVectorStore(chatbotId);

    if (!vectorStore) {
      return [];
    }

    // If we have Cohere API Key, we can do re-ranking for much better accuracy
    if (config.cohereApiKey) {
      console.log('Performing vector search with Cohere re-ranking...');
      // 1. Get more candidates first (e.g., top 15)
      const initialResults = await vectorStore.similaritySearchWithScore(query, 15);
      
      // 2. Prepare documents for re-ranking
      const docsToRerank = initialResults.map(([doc]) => doc.pageContent);
      
      try {
        const { CohereClient } = await import('cohere-ai');
        const cohere = new CohereClient({ token: config.cohereApiKey });
        
        const rerank = await cohere.rerank({
          query,
          documents: docsToRerank,
          topN: topK,
          model: 'rerank-multilingual-v3.0',
        });

        return rerank.results.map((res) => ({
          content: docsToRerank[res.index],
          score: res.relevanceScore,
        }));
      } catch (rerankError) {
        console.error('Re-ranking error, falling back to simple vector search:', rerankError);
        // Fallback to topK from initial results
        return initialResults.slice(0, topK).map(([doc, score]) => ({
          content: doc.pageContent,
          score: 1 - score,
        }));
      }
    }

    // Default simple vector search
    const results = await vectorStore.similaritySearchWithScore(query, topK);

    return results.map(([doc, score]) => ({
      content: doc.pageContent,
      score: 1 - score,
      metadata: doc.metadata,
    }));
  } catch (error) {
    console.error('Vector search error:', error);
    return [];
  }
};


/**
 * Clear cache for a chatbot (call this when new documents are uploaded)
 */
export const invalidateVectorCache = (chatbotId: string) => {
  delete vectorStoreCache[chatbotId];
};

/**
 * Build RAG context from retrieved chunks
 */
export const buildRAGContext = async (
  chatbotId: string,
  query: string
): Promise<string> => {
  const results = await searchVectors(chatbotId, query);

  if (results.length === 0) {
    return '';
  }

  // Formatting context for the prompt
  const context = results
    .map((r, i) => `[Tài liệu ${i + 1}]:\n${r.content}`)
    .join('\n\n');

  return `\n\n---
DƯỚI ĐÂY LÀ THÔNG TIN TỪ CÁC TÀI LIỆU ĐÃ ĐƯỢC TẢI LÊN. HÃY ƯU TIÊN SỬ DỤNG THÔNG TIN NÀY ĐỂ TRẢ LỜI:
${context}
---
Dựa trên thông tin trên, hãy trả lời câu hỏi của người dùng một cách chính xác và chi tiết. Nếu thông tin không có trong tài liệu, hãy trả lời dựa trên kiến thức của bạn nhưng vẫn giữ văn phong chuyên nghiệp.`;
};

