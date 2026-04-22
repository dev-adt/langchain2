/**
 * Vector Store Service
 * Placeholder for vector database integration (ChromaDB/Pinecone/Qdrant)
 * Currently uses local file-based chunk storage as a fallback
 */

import { retrieveRelevantChunks } from './documentService';

export interface VectorSearchResult {
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * Search for relevant documents using vector similarity
 */
export const searchVectors = async (
  chatbotId: string,
  query: string,
  topK: number = 3
): Promise<VectorSearchResult[]> => {
  // For now, use the simple keyword-based retrieval
  // Replace this with actual vector DB integration later
  const chunks = await retrieveRelevantChunks(chatbotId, query, topK);

  return chunks.map((content, index) => ({
    content,
    score: 1 - index * 0.1, // Fake score for ordering
  }));
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

  const context = results
    .map((r, i) => `[Document ${i + 1}]:\n${r.content}`)
    .join('\n\n');

  return `\n\nRelevant context from uploaded documents:\n${context}\n\nUse the above context to help answer the user's question. If the context doesn't contain relevant information, respond based on your general knowledge.`;
};
