import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

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
 * Process a document: parse -> chunk -> store vectors
 * This is called asynchronously after file upload
 */
export const processDocument = async (
  datasetId: string,
  filePath: string,
  chatbotId: string
): Promise<void> => {
  console.log(`Processing document ${datasetId} for chatbot ${chatbotId}`);

  // 1. Parse file content
  const text = await parseFile(filePath);
  console.log(`Parsed ${text.length} characters from file`);

  // 2. Split into chunks
  const chunks = await splitIntoChunks(text);
  console.log(`Split into ${chunks.length} chunks`);

  // 3. Store vectors (placeholder - integrate with VectorDB later)
  // For now, we store the chunks as a JSON file alongside the original
  const chunksPath = filePath + '.chunks.json';
  fs.writeFileSync(
    chunksPath,
    JSON.stringify({
      datasetId,
      chatbotId,
      chunks,
      processedAt: new Date().toISOString(),
    })
  );

  console.log(`Document ${datasetId} processed successfully`);
};

/**
 * Retrieve relevant chunks for a query (simple keyword matching fallback)
 * In production, this would use vector similarity search
 */
export const retrieveRelevantChunks = async (
  chatbotId: string,
  query: string,
  topK: number = 3
): Promise<string[]> => {
  // Simple implementation: read all chunk files for this chatbot and do basic matching
  const uploadsDir = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadsDir)) {
    return [];
  }

  const files = fs.readdirSync(uploadsDir).filter((f) => f.endsWith('.chunks.json'));
  const allChunks: string[] = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(uploadsDir, file), 'utf-8'));
      if (data.chatbotId === chatbotId) {
        allChunks.push(...data.chunks);
      }
    } catch {
      // Skip invalid files
    }
  }

  if (allChunks.length === 0) return [];

  // Simple relevance scoring based on keyword overlap
  const queryWords = query.toLowerCase().split(/\s+/);
  const scored = allChunks.map((chunk) => {
    const chunkLower = chunk.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      return acc + (chunkLower.includes(word) ? 1 : 0);
    }, 0);
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
};
