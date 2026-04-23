import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import prisma from '../config/database';

/**
 * Parse document content from file
 */
const parseFile = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.txt':
    case '.md':
      return fs.readFileSync(filePath, 'utf-8');

    case '.pdf':
      try {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        return data.text;
      } catch (error) {
        console.error('PDF parse error:', error);
        throw new Error('Failed to parse PDF file');
      }

    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

/**
 * Split text into chunks
 */
const splitIntoChunks = async (text: string): Promise<string[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  return docs.map((doc) => doc.pageContent);
};

/**
 * Process a document: parse -> chunk -> store vectors in DB
 * This is called asynchronously after file upload
 */
export const processDocument = async (
  datasetId: string,
  filePath: string,
  chatbotId: string
): Promise<void> => {
  console.log(`Processing document ${datasetId} for chatbot ${chatbotId}`);

  try {
    // Update status to processing
    await prisma.dataset.update({
      where: { id: datasetId },
      data: { vectorStatus: 'processing' },
    });

    // 1. Parse file content
    const text = await parseFile(filePath);
    console.log(`Parsed ${text.length} characters from file`);

    // 2. Split into chunks
    const chunks = await splitIntoChunks(text);
    console.log(`Split into ${chunks.length} chunks`);

    // 3. Store chunks in Database
    await prisma.documentChunk.createMany({
      data: chunks.map((content) => ({
        datasetId,
        chatbotId,
        content,
      })),
    });

    // Update status to completed
    await prisma.dataset.update({
      where: { id: datasetId },
      data: { vectorStatus: 'completed' },
    });

    console.log(`Document ${datasetId} processed successfully and saved to DB`);
  } catch (error: any) {
    console.error(`Error processing document ${datasetId}:`, error);
    await prisma.dataset.update({
      where: { id: datasetId },
      data: { vectorStatus: 'failed' },
    });
  }
};

/**
 * Retrieve relevant chunks for a query from Database
 */
export const retrieveRelevantChunks = async (
  chatbotId: string,
  query: string,
  topK: number = 3
): Promise<string[]> => {
  // Get all chunks for this chatbot
  const allChunks = await prisma.documentChunk.findMany({
    where: { chatbotId },
    select: { content: true },
  });

  if (allChunks.length === 0) return [];

  // Simple relevance scoring based on keyword overlap
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scored = allChunks.map((chunk) => {
    const chunkLower = chunk.content.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      return acc + (chunkLower.includes(word) ? 1 : 0);
    }, 0);
    return { content: chunk.content, score };
  });

  // Sort by score and take top K
  scored.sort((a, b) => b.score - a.score);
  
  // Return only chunks with some relevance (score > 0)
  return scored
    .filter(s => s.score > 0)
    .slice(0, topK)
    .map((s) => s.content);
};
