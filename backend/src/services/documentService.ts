import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';

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

    case '.docx':
      try {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      } catch (error) {
        console.error('Docx parse error:', error);
        throw new Error('Failed to parse Docx file');
      }

    case '.xlsx':
    case '.xls':
    case '.csv':
      try {
        const workbook = xlsx.readFile(filePath);
        let fullText = '';
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          fullText += xlsx.utils.sheet_to_txt(sheet) + '\n\n';
        });
        return fullText;
      } catch (error) {
        console.error('Excel/CSV parse error:', error);
        throw new Error('Failed to parse Excel or CSV file');
      }

    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

/**
 * Split text into chunks with improved settings
 */
const splitIntoChunks = async (text: string): Promise<string[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
    separators: ['\n\n', '\n', '.', '!', '?', ' ', ''],
  });

  const docs = await splitter.createDocuments([text]);
  return docs.map((doc) => doc.pageContent);
};

/**
 * Process a document: parse -> chunk -> store in DB
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
    // Note: In a real production app, we would also generate and store embeddings here
    // For now, we store the text and will build the vector store on-demand or in a background task
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
 * Retrieve relevant chunks for a query
 * This will be used as a fallback if vector store is not initialized
 */
export const retrieveRelevantChunks = async (
  chatbotId: string,
  query: string,
  topK: number = 5
): Promise<string[]> => {
  // Get all chunks for this chatbot
  const allChunks = await prisma.documentChunk.findMany({
    where: { chatbotId },
    select: { content: true },
  });

  if (allChunks.length === 0) return [];

  // Simple relevance scoring (BM25-lite)
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scored = allChunks.map((chunk) => {
    const chunkLower = chunk.content.toLowerCase();
    let score = 0;
    queryWords.forEach(word => {
      if (chunkLower.includes(word)) {
        // Give more weight to exact matches of words
        score += 1;
        // Additional weight if the word appears multiple times
        const regex = new RegExp(word, 'g');
        const count = (chunkLower.match(regex) || []).length;
        score += count * 0.1;
      }
    });
    return { content: chunk.content, score };
  });

  // Sort by score and take top K
  scored.sort((a, b) => b.score - a.score);
  
  return scored
    .filter(s => s.score > 0)
    .slice(0, topK)
    .map((s) => s.content);
};

